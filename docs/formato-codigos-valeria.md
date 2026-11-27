# Formato de códigos locales de Valeria+ (`VALERIA-*`)

Especificación cerrada de intercambio local sin servidor para **Valeria+** y compatibilidad futura con **VIA+** (en este repositorio no se modifica VIA+).

Todos los sobres se codifican en Base64URL sin relleno (`[A-Za-z0-9_-]+`) precedidos de su prefijo ASCII fijo y viajan por código QR o enlace profundo `valeria://nota?c=<código_URL_encoded>`.

---

## 1. `VALERIA-VINCULO1:` (vínculo por perfil entre consulta y familia)

Objeto JSON codificado en Base64URL:

```json
{
  "ver": 1,
  "pidHash": "<hex de 32 caracteres (SHA-256 truncado a 16 bytes del pid del perfil)>",
  "linkKey": "<32 bytes aleatorios en Base64URL>",
  "pubKey": "<clave pública Ed25519 (32 bytes) en Base64URL>",
  "author": "<nombre del firmante>",
  "role": "logopeda | orl | atencion | otro | familia",
  "centre": "<centro opcional>",
  "createdAt": "<ISO-8601>"
}
```

- `linkKey` es la clave simétrica compartida por perfil para XChaCha20-Poly1305. Vive en `expo-secure-store` (Keystore/Keychain).
- Al escanearse en el otro dispositivo, la clave pública `pubKey` se registra como firmante de confianza para ese `pidHash`.

---

## 2. Envoltura común `v2` cifrada y firmada

Lo comparten `VALERIA-NOTA2:`, `VALERIA-LEIDO2:` y `VALERIA-PAUTA2:`.

JSON exterior codificado en Base64URL:

```json
{
  "ver": 2,
  "pidHash": "<hex 32>",
  "nonce": "<24 bytes CSPRNG en Base64URL>",
  "ct": "<XChaCha20-Poly1305(linkKey, nonce, UTF8(JSON(inner))) en Base64URL>",
  "sig": "<Ed25519(sk, UTF8(\"2|\" + pidHash + \"|\" + nonce + \"|\" + ct)) en Base64URL>"
}
```

Reglas de verificación al importar:
1. Buscar `linkKey` para `pidHash`. Si no coincide con ningún perfil/vínculo local → rechazo (`wrong_patient`).
2. Descifrar `ct` con `XChaCha20-Poly1305(linkKey, nonce)` (verifica etiqueta Poly1305).
3. Comprobar que `inner.pubKey` pertenece a un firmante de confianza conocido para ese vínculo (o al propio dispositivo) y verificar `Ed25519.verify(sig, "2|<pidHash>|<nonce>|<ct>", inner.pubKey)`. Si falla → rechazo (`unverified`).

---

## 3. Cargas interiores (`inner`)

### 3.1 `VALERIA-NOTA2:` (nota bilateral)

```json
{
  "id": "n_<hex>",
  "from": "pro | family",
  "author": "<nombre>",
  "role": "logopeda | orl | atencion | otro",
  "centre": "<centro>",
  "text": "<texto>",
  "at": "<ISO-8601>",
  "pubKey": "<Ed25519 pubKey Base64URL>",
  "postReset": true
}
```

### 3.2 `VALERIA-LEIDO2:` (acuse de lectura firmado)

```json
{
  "noteIds": ["n_..."],
  "reviewedBy": "<nombre>",
  "role": "logopeda | orl | atencion | otro",
  "centre": "<centro>",
  "reviewedAt": "<ISO-8601>",
  "pubKey": "<Ed25519 pubKey Base64URL>"
}
```

### 3.3 `VALERIA-PAUTA2:` (frecuencia recomendada por el profesional)

```json
{
  "ver": 2,
  "counts": {
    "audicion": 3,
    "lenguaje": 4,
    "pares": 2
  },
  "by": "<nombre del profesional>",
  "role": "logopeda | orl | atencion | otro",
  "centre": "<centro>",
  "at": "<ISO-8601>",
  "pubKey": "<Ed25519 pubKey Base64URL>",
  "postReset": true
}
```

Las áreas válidas para `counts` (`0..14` sesiones/semana) son:
`audicion`, `lenguaje`, `tea`, `dislexia`, `pares`, `expansion`, `sensorial`, `escritura`, `aventuras`, `ra`, `tpr`, `steam`.

---

## 4. Exportación de perfil `.valeria` (`VALERIA-EXPORT1:`)

PBKDF2-HMAC-SHA256 (`100_000` iteraciones, sal de 16 bytes) + XChaCha20-Poly1305. Nunca incluye las claves privadas Ed25519 de los profesionales ni secretos ajenos al perfil.
