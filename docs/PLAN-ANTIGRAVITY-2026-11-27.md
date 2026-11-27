# Plan de trabajo para Antigravity · Valeria+ · 27/11/2026

Lo ejecuta **Antigravity**. Lo revisa **Claude Code**, que corrige lo que haga falta antes de que llegue a `main`.
Sustituye a `docs/PLAN-MEJORAS-2026-11-16.md`, que no llegó a ejecutarse: sus tres fases están dentro de este plan
(paquetes 3 y 4), así que ese fichero ya no se usa como guía.

**Punto de partida comprobado (27/11/2026, commit `966a4cc`):** `npm ci` limpio, `npm run typecheck` en verde y los
33 gates de `android.yml` en verde. Nada de este plan está visto en Android.

**Autorización de Frank (27/11/2026):** ejecutar todas las mejoras del análisis del 27/11 y la opción A de Play Age
Signals, y regenerar el manual por completo. Esa orden es el «sí» de la regla F1 para las librerías nativas de la §0.3.
Ninguna otra librería, versión mayor ni cambio de base entra sin preguntar.

---

## 0. Reglas para quien ejecuta (obligatorias)

Antigravity no ejecuta los hooks de `.claude/`, así que estas reglas se cumplen a mano. Antes de empezar, hay que leer
enteros `CLAUDE.md` y `.claude/errores-frank.md`. Lo que sigue es lo mínimo que no se puede saltar.

### 0.1 Rama, commits y pushes

- Rama nueva `antigravity/mejoras-2026-11-27`, creada desde `claude/nice-allen-tyiqgx`, que es `main` con este plan.
  Los pushes a `antigravity/**` no lanzan build: eso es a propósito, para no saturar CI con nueve paquetes.
- **Un commit por paquete**, con el número de paquete en el título (`P3 · Notas v2: …`).
- **Prohibido:** push a `main`, merge a `main`, `--force` y reescribir el historial. El merge lo hace Frank, después de
  la revisión de Claude Code.
- Antes de **cada** commit, en este orden:
  ```bash
  npm ci
  grep -oP '(?<=run: )node scripts/\S+(?: --\S+)?' .github/workflows/android.yml |
    while read -r cmd; do $cmd >/dev/null 2>&1 || echo "FALLA: $cmd"; done
  npm run typecheck
  node scripts/check-frank-errors.js
  ```
  Si algo falla, no se hace el commit.
- Si se cambia un texto que la app **locuta**, en el mismo commit va `node scripts/export-voice-corpus.js`.
- Si se cambia una cuenta congelada (por ejemplo, el número de espacios de nombres del catálogo), se sube en su suite.
  Ejemplo: `scripts/test-challenger-final-ca-integration.js`.
- Todo texto nuevo de interfaz va en **es, gl, eu, en y ca** (`src/i18n/strings.*.ts`, y `valeriaContent*.ts` si se
  locuta) y pasa `npm run check:ui-strings`.

### 0.2 Prohibiciones que ya costaron caro (de CLAUDE.md y errores-frank.md)

- **No borrar contenido con sustituciones automáticas (R14, R23).** Después de cada cambio con script, se lee el diff
  entero. Un diff que borre JSX, textos o casos que no tocaba se rechaza.
- **Lúa no se quita de ningún módulo (R1, R7, R17).** Toda pantalla nueva lleva `ScreenHeader` con la mascota, y la
  reacción de Lúa va arriba y pequeña (R18).
- **Una pantalla nueva que premie lleva `cancelSessionReward()` al desmontarse** (CLAUDE.md, §5b).
- **No tocar nada fuera de este plan (0a).** Si algo parece mejorable y no está aquí, se apunta en la entrega y no se
  cambia. La ficha de registro ya rompió producción el 7/9/2026.
- **Nada de `flex: 1` mezclado con `flexGrow`, `flexShrink` o `flexBasis` en el mismo elemento** (CLAUDE.md, §1c).
- **Iconos:** del set `src/ValeriaBlockIcons.tsx` o de Lucide. Nada de emoji ni de ilustraciones hechas con formas
  sueltas (R20).
- **El correo de contacto** de cualquier texto legal es `frank.alberto.betances.reinoso@gmail.com`.
- **Si cambia lo que la app recoge o recibe,** en el mismo commit se actualizan la política de `site/` (ES y EN),
  `docs/play-console-seguridad-datos.md` y la lista de `scripts/check-data-safety-declaration.js`.
- **Nunca se escribe «hecho», «listo» ni «completo»** de algo que no se haya visto en un aparato. La entrega lleva la
  frase «no visto en Android».

### 0.3 Dependencias autorizadas (y ninguna más)

| Paquete | Tipo | Para qué | Coste de build |
| --- | --- | --- | --- |
| `@noble/ciphers`, `@noble/curves`, `@noble/hashes` | JS puro, MIT | XChaCha20-Poly1305, Ed25519, HKDF y PBKDF2 | Ninguno nativo |
| `expo-secure-store` | Nativo (módulo Expo) | Claves en el Keystore de Android | Por medir; se anota en la entrega |
| `expo-crypto` | Nativo (módulo Expo) | Bytes aleatorios seguros (`getRandomBytes`) | Por medir |
| `expo-camera` | Nativo (módulo Expo) | Leer códigos QR de vínculo y de notas | Por medir. El permiso CAMERA ya existe por la RA |
| `com.google.android.play:age-signals` | Nativo (Gradle) | Opción A | Por medir |

- Las versiones de Expo se instalan con `EXPO_OFFLINE=1 npx expo install <paquete>`, porque la API de Expo puede estar
  bloqueada. Después se comprueba a mano que la versión es la `~58.x` compatible.
- La versión de `age-signals` se toma de la página oficial el día de la ejecución
  (<https://developer.android.com/google/play/age-signals/use-age-signals-api>). El correo de Google del 27/11 habla de
  la 0.0.4 y anuncia la 0.0.5. **No se inventa la versión.**
- En la entrega se da el tiempo del build de publicación antes y después, comparado con el último `workflow_dispatch`
  verde de `main`.

### 0.4 Puntos de parada (solo Frank puede decidirlos)

Al llegar a uno de estos puntos se para **solo esa tarea**, se deja preparado lo que haga falta para que Frank decida, y
se sigue con el resto del plan.

| # | Decisión | Qué se le prepara |
| --- | --- | --- |
| D1 | Voz del banco es-DO (P2.6) | Tres muestras por candidata, las mismas 10 frases, en `docs/voz-esdo-muestras/` |
| D2 | Escritura: qué se locuta al pulsar «oír» (P4.3) | El listado de lo que suena hoy por cada letra y una propuesta |
| D3 | Textos legales nuevos (P5 y P6.5) | El diff de `site/`, marcado como «pendiente de revisión legal» |
| D4 | Países de Play Console (Brasil) | Nada en código: lo cambia Frank en la consola |

---

## P1 · Voz estable en el código de la app

Objetivo: que la voz no se corte, no cambie de tono a mitad de enunciado y no salte entre voces o idiomas.

### P1.1 · Las correcciones ya no se cortan

**Defecto comprobado.** Tras «¡Casi!», «Lo decimos juntos» o «No te he oído», la palabra modelo arranca con un
temporizador fijo de 1 500 a 2 200 ms. Afecta a:

- `src/ValeriaMinimalPairsScreen.tsx:516-531`
- `src/ValeriaSemanticExpansionScreen.tsx:561-575`

Los 25 audios de esas categorías duran más que su temporizador (de 2,0 a 5,3 s, según `voice-assets-manifest.es.json`),
así que se interrumpen **siempre**.

**Cambio:**

- Encadenar con `onDone`, usando el `afterSpeak` que ya existe en cada pantalla: `speakToChild(msg, afterSpeak(() => {
  if (!mounted.current) return; setLivePrompt(...); speakWordSlow(...) }))`.
- Entre una frase y otra se deja una pausa de 250 ms, y esa pausa se cancela al desmontar.
- Buscar el mismo patrón en todo `src/` y aplicar el mismo arreglo:
  ```bash
  grep -rnE "speak\w*\(" src --include=*.tsx -A8 | grep -E "setTimeout\(\(\) => \{?\s*$|speak\w*\(" | less
  ```
  Toda locución que sigue a otra mediante un `setTimeout` de duración fija pasa a ir encadenada. La lista de sitios
  tocados va en el commit.

**Gate nuevo:** `scripts/check-voice-chaining.js`, añadido a `android.yml`. Falla si en un `.tsx` de `src/` aparece un
`setTimeout(` cuyo cuerpo llama a `speak*` en las 6 líneas siguientes a otra llamada `speak*`. Su propia prueba debe
fallar con un fichero de ejemplo malo dentro del script.

**Aceptación:** el gate pasa, y en web, con audio, la corrección se oye entera antes de la palabra modelo (eso se anota
en la entrega).

### P1.2 · Prosodia de la voz del sistema

**Defecto.** `PROSODY_DEFAULT` (`src/valeriaSpeechProsody.ts`) tiene `chainMinWords: 0`, así que trocea todos los
enunciados. Además, `speakChain` (`src/valeriaVoice.ts:318-326`) cambia el tono en cada trozo (*jitter* y +0,06 en las
exclamaciones). `speakToChild` usa `pitch 1.15`.

**Cambio:**

- `PROSODY_DEFAULT = { gapMs: 80, chainMinWords: 25, mergeMinWords: 4 }`. `PROSODY_LATIN` se queda igual.
- Quitar el *jitter* y las subidas de tono por signo. La entonación la pone el motor con la puntuación.
- Tope de tono en 1,05 y velocidad de 0,85 a 0,95 en `speakToChild`, `speakToChildIn` y `speakWordSlow`. `speakClinical`
  no se toca.
- Ajustar los tests que existan de `splitForSpeech`/`tightenPauses` si los hay en `scripts/`; si no existen, crear
  `scripts/check-speech-prosody.js` con casos de troceo y añadirlo a `android.yml`.

### P1.3 · La voz sigue a la variedad activa

**Defecto.**

- `setLocale` (`src/valeriaLocale.ts:98`) cambia la variedad, pero la voz del sistema elegida al importar
  `valeriaVoice.ts` no se recalcula.
- Solo la tarjeta «Voz de la app» vuelve a buscar voces. Al elegir paciente (`ValeriaPatientSelectScreen.tsx:92`) o
  cambiar el idioma de la interfaz (`valeriaUiLang.ts:139,147`) se conserva la voz anterior.
- En Android la voz fijada manda sobre el idioma.
- Al arrancar, las voces se puntúan antes de que AsyncStorage devuelva la variedad guardada.

**Cambio:**

- En `valeriaLocale.ts`, añadir `onLocaleChange(cb)`, que devuelve la función para darse de baja, y `localeReady: Promise<void>`,
  que se resuelve al terminar la rehidratación. Hay que hacerlo sin importar `valeriaVoice`, para no crear un ciclo.
- En `valeriaVoice.ts`:
  - `findBestVoice` espera a `localeReady` como mucho 300 ms;
  - `onLocaleChange` vacía `bestVoice`, `bestVoiceId` y `voiceByLang` y relanza `findBestVoice()`;
  - `ttsLang()` y `pinVoice()` dejan de usar una voz puntuada para otra variedad.
- Gate o test de Node que compruebe que, tras `setLocale('en-US')`, la voz elegida es inglesa, con un catálogo de voces
  simulado.

### P1.4 · Reproductor sin huecos entre trozos

**Defecto (inferencia por confirmar en aparato).** `playVoiceAsset` crea un `AudioPlayer` por audio y no precarga el
siguiente (`src/valeriaVoicePlayback.ts:58`). En `speakToChildSeq` (palabra + elogio) se oye un hueco.

**Cambio:**

- Un reproductor reutilizado con `player.replace(source)`, que existe en expo-audio: se comprueba en
  `node_modules/expo-audio/build/*.d.ts` antes de usarlo.
- Un segundo reproductor que precarga la siguiente pieza de la secuencia.
- Vigilante: si no llega `didJustFinish` en la duración del audio + 1 500 ms, se llama a `onError`. La duración sale del
  manifiesto: `scripts/build-voice-asset-map.js` debe emitir los segundos de cada id junto al `require`.
- `stopVoiceAsset` libera los dos reproductores.

### P1.5 · Contador local de voz (función nueva)

- Contar, por variedad, cuántas locuciones salen del audio pregrabado y cuántas caen a la voz del sistema, con el
  motivo (sin asset, error al reproducir, variedad sin banco).
- Se guarda en memoria y en AsyncStorage con `encryptJSON`, sin texto, solo contadores.
- La tarjeta «Voz de la app» (`src/ValeriaVoiceUI.tsx`) muestra: «Esta semana: 97 % voz Valeria+, 3 % voz del
  teléfono».
- No sale del aparato.

**Aceptación de P1:** gates nuevos en verde, captura web de la tarjeta de voz con el contador y lista de sitios
encadenados.

---

## P2 · Audio pregenerado estable (tubería `scripts/generate-voice-assets.py` y `voice-assets.yml`)

Objetivo: que todos los audios suenen al mismo volumen, sin clics, con el mismo arranque y con la misma versión del
motor.

1. **Fijar versiones.** En `.github/workflows/voice-assets.yml:65`, cambiar `pip install piper-tts` por
   `pip install piper-tts==<versión exacta>`. Hacer lo mismo con coqui, onnxruntime, phonemizer y el resto que instale el
   workflow. La versión es la que se use en esta regeneración, y se escribe en el manifiesto (`"engine": {...}`).

2. **Normalizar por sonoridad, no por pico.** Sustituir `normalize_peak` por un `loudnorm` de ffmpeg en dos pasadas:
   `I=-18:TP=-1.5:LRA=7`. El valor medido se guarda en el manifiesto (`"lufs"` por fichero).
   - La voz tiene que seguir por encima del ruido de fondo (babble) de `valeriaNoise`.
   - Hay que comprobar el nivel del babble en `assets/audio` con `ffmpeg -af ebur128` y mantener al menos 6 LU de margen.
     Si no se mantiene, se ajusta el objetivo de la voz, no el del babble.

3. **Bordes iguales en todos los motores.**
   - Recorte de silencio inicial y final a 50 ms, con umbral de -45 dB, en **todos** los motores. Hoy solo lo hacen
     coqui y AhoTTS.
   - Fundido de entrada y de salida de 10 ms (`afade`).
   - `compress_internal_silence` se aplica a todos los motores, no solo a AhoTTS.

4. **Codificación.** Subir a AAC 64 kbps, mono, a la frecuencia nativa del modelo.
   - Medir el tamaño total antes y después: hoy `assets/voice` pesa 114 MB.
   - Si el AAB pasa del límite que Play acepta para el módulo base, **parar y avisar**. En ese caso se propone *Play
     Asset Delivery*, pero no se implementa sin el «sí» de Frank.

5. **Estilos.** `LENGTH_SCALE["slow"]` pasa de 1,6 a 1,35.
   - Los alargamientos terapéuticos del corpus («luuuna») se conservan: vienen del texto, no del `length_scale`.
   - Hay que escuchar 20 palabras `slow` de cada idioma antes y después, y anotarlo en la entrega.

6. **Banco pregrabado para es-DO (función nueva).** Hoy la variedad dominicana suena siempre con la voz del teléfono.
   - Añadir `es-DO` como lengua del corpus en `scripts/export-voice-corpus.js`, a partir de los bancos dominicanos que
     ya existen (`valeriaExerciseEsDO.ts`, `valeriaMinimalPairsEsDO.ts`, `valeriaSemanticExpansionEsDO.ts` y
     `docs/guia-dialectal-es-DO.md`).
   - Hacer que `assetLang('es-DO')` devuelva su banco en `src/valeriaLocale.ts`.
   - La voz candidata sale de `rhasspy/piper-voices` (voces `es_MX-*` u otras latinas).
   - **Licencia:** leer la MODEL_CARD de cada candidata y descartar las que no permitan uso comercial.
   - **Parada D1:** muestras para que Frank elija. Mientras Frank no elija, el resto del P2 sigue adelante.

7. **Regeneración completa.**
   - Hay que poder forzarla: `--force`, o borrar `assets/voice/<lang>` antes de generar. El modo incremental solo sirve
     si el hash de los parámetros del manifiesto coincide.
   - Se regeneran los cinco bancos (es, gl, eu, en, ca), y el sexto cuando D1 esté decidido.

8. **Gate nuevo `scripts/check-voice-assets-quality.js`.** Sobre el manifiesto, comprueba:
   - que la dispersión de LUFS sea de 1,5 LU como mucho por idioma;
   - que ningún fichero no tenga su `lufs`;
   - que el hash de parámetros sea igual en todo el idioma.

   Se añade a `voice-assets.yml` y a `android.yml`.

**Aceptación de P2:** `voice-assets.yml` en verde para los cinco idiomas, el gate nuevo en verde, la tabla de tamaños
antes/después y las escuchas anotadas.

---

## P3 · Notas e intercambio entre familia y profesional (v2)

Objetivo: que las notas viajen cifradas y firmadas, en los dos sentidos, sin perderse y sin servidor.

### P3.1 · Cifrado en reposo real (`src/valeriaCrypto.ts`)

**Defectos comprobados en `src/valeriaCrypto.ts:60-100`:**

- la clave está en el mismo AsyncStorage que los datos y sale de `Math.random`;
- todos los registros usan el mismo flujo de clave, sin *nonce*: con dos registros se puede sacar el texto;
- no hay control de integridad.

**Cambio:**

- Formato `v2:` con XChaCha20-Poly1305 de `@noble/ciphers`, un *nonce* aleatorio de 24 bytes por escritura
  (`expo-crypto`) y una clave de 32 bytes en `expo-secure-store`.
- `decryptJSON` lee `v1:`, devuelve el dato y lo reescribe en `v2:` (migración transparente).
- Un blob alterado devuelve `null`.
- **Datos en claro hoy que pasan a cifrarse** (lo que pedía el plan del 16/11):
  - ficha y pacientes: `STORAGE_KEYS.registro` y `pacientes` (`src/valeriaTheme.ts:86`), escritos en
    `ValeriaFichaRegistroScreen.tsx:73` y `ValeriaPatientSelectScreen.tsx:60-82`;
  - historial: `STORAGE_KEYS.historial`, escrito en `ValeriaExercisePlayerScreen.tsx` hacia la línea 688;
  - la lista de profesionales (`STORAGE_KEYS.profesionales`).

  Si al leer se encuentra JSON en claro antiguo, se migra.
- **Copias de seguridad.** Poner `android.allowBackup: false` en `app.json`, porque la copia de Android se llevaría los
  datos. Hay que comprobar en el manifiesto generado por `npx expo prebuild -p android` que queda en `false`. La página
  `site/eliminacion-de-datos.html` y la política deben decir que los datos no se copian a la nube del teléfono, y que
  cambiar de teléfono exige la exportación cifrada de P3.6.
- **Gate `scripts/check-crypto.js`.** Comprueba:
  - ida y vuelta;
  - que dos cifrados del mismo objeto den resultados distintos;
  - que un blob alterado dé `null`;
  - que `v1:` se migre;
  - que ningún `setItem` de las claves de arriba se haga sin `encryptJSON`.

### P3.2 · Identidad estable del paciente

**Defecto.** La clave sale del NHC o del nombre (`src/valeriaFollowUp.ts:47-54`). Al renombrar se pierden las notas,
dos pacientes con el mismo nombre las comparten, y todos los `anon` también.

**Cambio:**

- Cada paciente recibe un `pid` aleatorio de 128 bits al crearse y se guarda en su ficha.
- Los pacientes antiguos lo reciben en la primera lectura, y sus datos se mueven una sola vez de la clave vieja a la
  nueva: notas, pauta, estimulación, consentimiento y lo que use la RA con el mismo criterio. Hay que buscar
  `valeria-follow:` y los demás *seeds* con nombre.
- El `anon` desaparece: sin paciente activo, la pantalla de seguimiento pide elegir uno.
- La prueba de migración se hace con datos sembrados y se anota en la entrega.

### P3.3 · Escrituras sin pérdidas

**Defecto.** Hoy se lee y se reescribe sin bloqueo, y `writeEnc` se traga los errores (`valeriaFollowUp.ts:58-63`). La
pantalla dice «Nota guardada» aunque haya fallado (`ValeriaFollowUpScreen.tsx:119-128`).

**Cambio:**

- Cola por clave (`withLock(key, fn)`) para toda lectura-modificación-escritura: `addNote`,
  `markFamilyNotesReviewed`, `logStimulation`, `savePlan` y `setConsent`.
- `writeEnc` devuelve `boolean`, y la interfaz solo dice «guardada» si es `true`. Si es `false`, muestra un error en los
  cinco idiomas y **conserva el texto escrito**.

### P3.4 · PIN

**Defectos.**

- El PIN maestro «1985» aparece en `src/ValeriaProPin.tsx:69`, en `docs/play-console-seguridad-datos.md:186`, en el
  manual (`docs/manual-casos-de-uso.html:252, 888-890`) y en `docs/plan-calidad.md:25`, todo en un repositorio público.
- El hash es SHA-256 sin sal de 4 cifras, así que se puede revertir.
- El bloqueo por intentos se reinicia al cerrar la hoja.
- «Olvidé el PIN» borra a los profesionales sin pedir PIN, y entonces el maestro vuelve a abrir.

**Cambio:**

- Fuera el PIN maestro. Sin profesionales dados de alta, el primer desbloqueo pide **crear** el primer profesional con
  su PIN.
- PIN con PBKDF2-SHA256 de `@noble/hashes`, 600 000 iteraciones si el rendimiento en web lo permite (medido; si no, el
  máximo que no pase de 400 ms en web) y sal de 16 bytes.
- Bloqueo progresivo persistido: 5 fallos → 30 s; 10 → 5 min; 15 → 30 min.
- «Olvidé el PIN» sigue existiendo y sigue dejando su nota, pero las notas firmadas antes conservan su verificación
  (P3.5) y las posteriores quedan marcadas como «tras restablecer».
- Instrucciones para el revisor de Play: se reescribe `docs/play-console-seguridad-datos.md` §4. El revisor crea su PIN
  la primera vez y ningún PIN aparece en el repositorio.
- **Gate `scripts/check-pro-pin.js`:** `grep 1985` en `src/`, `docs/*.html` y `docs/*.md` no devuelve nada, y el
  bloqueo persistido existe.

### P3.5 · Código de nota v2: cifrado, firmado y en los dos sentidos

**Defectos.**

- `VALERIA-NOTA1` es base64 legible, sin firma y sin paciente (`src/valeriaFollowUp.ts:196-213`).
- La familia no puede enviar notas al profesional.
- Un salto de línea del mensajero rompe el código.

**Diseño:**

1. **Vínculo por paciente.** En consulta, el aparato que tiene la ficha muestra un QR `VALERIA-VINCULO1:` con:
   - `pidHash`, de 16 bytes (HKDF del `pid`);
   - `linkKey`, de 32 bytes aleatorios guardados en SecureStore por paciente;
   - la clave pública Ed25519 del profesional que vincula.

   El otro aparato lo escanea (`expo-camera`) o lo pega, y guarda el vínculo. Puede haber varios profesionales por
   paciente.

2. **Claves de firma.** Cada profesional recibe un par Ed25519 al darse de alta; la clave privada va a SecureStore. La
   familia también tiene un par por aparato.

3. **Código `VALERIA-NOTA2:`.** Es base64url de: `ver`, `pidHash`, `nonce` y el cifrado XChaCha20-Poly1305 con
   `linkKey` de `{id, from, author, role, centre, text, at, pubKey}` más la firma Ed25519 de todo eso.

4. **Al importar:**
   - se busca el vínculo por `pidHash`;
   - se descifra y se verifica la firma contra las claves públicas conocidas de ese vínculo;
   - el resultado se muestra: «Verificada: firmada por Dra. X (Centro)» o «No verificada: no se puede importar»;
   - con un `pidHash` desconocido aparece «Esta nota es de otro paciente o falta vincular este aparato».

   Un `id` ya importado no se duplica.

5. **Dos sentidos.** La familia escribe una nota y pulsa «Enviar al profesional», que genera el código para Compartir o
   un QR. El profesional lo importa en su aparato.

6. **Acuse de lectura.** Al marcar como leída, el profesional puede generar un `VALERIA-LEIDO2:` firmado que la familia
   importa. La nota pasa a «leída por X el día Y».

7. **Transporte, por orden de preferencia:**
   - QR en pantalla, si el código cabe; si no, solo Compartir;
   - enlace `valeria://nota?c=…`, con el *scheme* en `app.json` y la apertura en `AppNavigator` al recibirlo;
   - pegar.

   Al leer el código se quitan los espacios y los saltos de línea, porque los mensajeros los insertan.

8. **Compatibilidad.** `VALERIA-NOTA1` se sigue importando, marcada «formato antiguo, no verificada», durante esta
   versión.

9. **Tests (`scripts/check-note-codes.js`):**
   - ida y vuelta;
   - que una firma falsificada se rechace;
   - que un `pidHash` ajeno se rechace;
   - que un código partido con saltos de línea se acepte;
   - que no haya duplicados;
   - que `NOTA1` se acepte como no verificada.

   El QR se prueba con un lector real (`jsQR` sobre la captura, R4).

### P3.6 · Exportación cifrada de un paciente (porque `allowBackup` pasa a `false`)

- «Exportar paciente» genera un fichero `.valeria` cifrado con una frase que elige el adulto: XChaCha20 con clave de
  PBKDF2 de esa frase.
- Se comparte con la hoja de compartir del sistema, y se importa en otro aparato.
- Incluye ficha, historial, notas, pauta, estimulación y consentimiento.
- No incluye la clave privada de los profesionales: en el aparato nuevo se vuelve a dar de alta al profesional.

### P3.7 · Textos

- El texto de revocación del consentimiento dice la verdad: lo ya compartido no se puede recuperar.
- El resumen compartido marca qué notas son de la familia, y solo incluye las notas de la familia si el adulto lo
  confirma.

**Aceptación de P3:** los gates `check-crypto`, `check-pro-pin` y `check-note-codes` en verde, la migración probada con
datos sembrados y capturas web de las pantallas nuevas (vínculo, enviar, importar verificada, importar rechazada, acuse,
exportar e importar).

---

## P4 · Bugs y robustez

1. **Adherencia infravalorada.**
   - Hoy no registran sesión en el seguimiento (`logStimulation`):
     - `ValeriaWritingExerciseScreen.tsx`;
     - las cuatro pantallas de `src/AventurasLua/Screens/` (cuento, canción, juego y cribado);
     - `ValeriaArLauncherScreen.tsx` / `ValeriaArActivityScreen.tsx`;
     - `ValeriaTPRCapsule.tsx`;
     - las pantallas STEAM (`ValeriaSteamChallengeScreen.tsx`, `ValeriaSteamLuaSoloScreen.tsx`).
   - Añadir a `FollowArea` las áreas `escritura`, `aventuras`, `ra`, `tpr` y `steam`, con sus textos en los cinco
     idiomas y en la pauta.
   - En `ValeriaExercisePlayerScreen.tsx:59-60, 692`, una sesión con varios bloques registra **cada área distinta**, no
     solo la del primer ejercicio, y un id desconocido no se cuenta como «audición»: se registra un aviso en la
     telemetría local y no se suma.

2. **Escritura** (`ValeriaWritingExerciseScreen.tsx`):
   - `stopSpeaking()` al desmontar;
   - `registerSession` + `luaSessionReward` + `cancelSessionReward` al desmontar, como en las demás pantallas que
     cierran sesión (CLAUDE.md, §5b);
   - `logStimulation('escritura')`.

3. **Escritura: lo que se oye al pulsar «oír» (parada D2).** `speakWordSlow(currentExercise.phoneme)` locuta «b», «d» o
   «m» sueltas, y probablemente suenen como el nombre de la letra («be»). Se hace el listado de lo que suena hoy (los
   audios están en el manifiesto) y se propone la alternativa (sonido sostenible + palabra ejemplo). No se cambia sin
   el «sí» de Frank.

4. **ErrorBoundary global** en `src/AppNavigator.tsx`:
   - pantalla con Lúa (`ValeriaCatPixel`) y un botón «Volver al inicio», en los cinco idiomas;
   - registra el nombre de la pantalla en la telemetría local, sin datos personales;
   - para comprobarlo, se fuerza un `throw` temporal en web y se quita en el mismo commit.

5. **Temporizadores.** Todo `setTimeout`/`setInterval` dentro de un componente de `src/**/*.tsx` se limpia al desmontar.
   La lista resultante va en el commit. Prioridad: `ValeriaMinimalPairsScreen.tsx`, `ValeriaSemanticExpansionScreen.tsx`
   y `ValeriaVoiceUI.tsx`.

6. **Tipos.** Quitar los `any` de `valeriaArBridge.ts`, `valeriaTelemetry.ts` y de los stores (`academyStore`,
   `sensoryStore`, `steam/profiles`).

---

## P5 · Opción A · Play Age Signals (solo Android)

Objetivo: cumplir AB 1043 de California (vigente desde el 1/1/2027) pidiendo la señal de edad al abrir la app, y actuar
de forma prudente si indica un menor. No se guarda nada.

1. **Módulo nativo** `android-native/valeria-age-signals/`, con el mismo patrón que `valeria-ar`
   (`android-native/README.md`):
   - `build.gradle` con `implementation "com.google.android.play:age-signals:<versión oficial>"`;
   - `ValeriaAgeSignalsModule.kt` y `ValeriaAgeSignalsPackage.kt`, que exponen `check(): Promise<{ status, ageLower?,
     ageUpper?, mandatory?, error? }>`. La llamada usa el método nuevo de la 0.0.5 para saber si el uso compartido
     obligatorio aplica a ese usuario, si la versión publicada ya lo trae. Los nombres de los campos se copian de la
     tabla *Response fields* oficial, sin inventarlos.

2. **Plugin** `plugins/withValeriaAgeSignals.js`, que copia, incluye, añade la dependencia y registra el *package*,
   igual que `withValeriaAR`. Se añade a `app.json` y se documenta en `android-native/README.md`.

3. **JS** `src/valeriaAgeSignals.ts`:
   - carga perezosa, como `valeriaVoicePlayback`; en web, iOS o si no hay módulo, devuelve `{ status: 'unavailable' }`;
   - se llama en cada arranque, porque la documentación pide pedirla al abrir la app;
   - el resultado vive solo en memoria: ni AsyncStorage, ni telemetría, ni logs.

4. **Comportamiento.**
   - Si la señal indica un usuario menor de 18 o supervisado, antes de la pantalla de bienvenida se muestra una vez por
     arranque la pantalla nueva `ValeriaAdultGateScreen`:
     - Lúa, y el texto «Valeria+ la usa una persona adulta junto al niño o la niña. Pide a tu familia o a tu logopeda
       que la abra»;
     - un botón «Soy la persona adulta» que pide el PIN del profesional o una pregunta de verificación para adultos
       (la misma que use hoy la app, si existe; si no, el PIN).
   - Si no hay señal o no aplica, la app sigue exactamente igual que hoy.
   - Error de la API (por ejemplo `API_NOT_AVAILABLE`): sigue igual, sin bloquear.

5. **Pruebas.** Con el modo de prueba que indique la documentación oficial (si la librería trae un gestor falso, se usa
   ese), se fuerzan los estados de adulto, menor, supervisado, sin datos y error. Se apunta cada resultado.

6. **Legal (parada D3).**
   - Política de `site/` en ES y EN: qué se recibe (rango de edad de Google Play), para qué, que no se guarda y que no
     se comparte.
   - `docs/play-console-seguridad-datos.md` y la lista de `check-data-safety-declaration.js`: dependencia nueva.
   - Brasil: no se toca código. Frank decide los países en Play Console (D4).

---

## P6 · Funciones nuevas

1. **Auditoría del banco de voz** (panel del adulto, detrás del PIN):
   - lista por idioma y estilo de todas las locuciones del manifiesto, con botón para reproducir y otro para marcar;
   - las marcas se exportan como texto (`id · texto · motivo`) para corregirlas en la tubería.

2. **Contador de voz:** está en P1.5.

3. **Recordatorios ligados a la pauta.**
   - Se usa `expo-notifications`, que ya está instalado y tiene su módulo en `src/valeriaNotifications.ts`.
   - Si la pauta pide N sesiones por semana y faltan, aviso local a la hora que elija la familia: «Esta semana: 2 de 4
     sesiones de Lenguaje».
   - Desactivable, sin red y con textos en los cinco idiomas.
   - Hay que comprobar que `check-no-background-audio` y los permisos siguen en verde.

4. **Pauta prescrita por código** (`VALERIA-PAUTA2:`, el mismo sobre que en P3.5).
   - Un profesional genera en su aparato la pauta de frecuencias firmada y la familia la importa.
   - Queda documentado el formato en `docs/formato-codigos-valeria.md` para que VIA+ pueda emitirlo en el futuro. En
     este repositorio no se toca VIA+.

5. **Modelos con la voz del cuidador.**
   - En las palabras modelo de Pares Mínimos y Expansión Semántica, el adulto puede grabar su voz, con `expo-audio`, que
     ya está instalado.
   - Se guarda solo en el aparato, cifrado con la clave de P3.1. Para reproducirlo se descifra a un fichero temporal que
     se borra al terminar.
   - Con consentimiento explícito previo, que se puede retirar y borra las grabaciones.
   - Al reproducir el modelo, si hay grabación del cuidador para esa palabra, se elige con un conmutador por paciente
     «Voz de la app / Voz de casa».
   - Política de `site/`, Seguridad de los datos y `check-data-safety-declaration.js` en el mismo commit: el audio no se
     recoge (no sale del aparato), pero se declara. **Parada D3** para el texto legal.

6. **Informe de consulta en PDF.**
   - Desde Seguimiento, con el consentimiento de P3.7: pauta, adherencia de 8 semanas, notas y resumen de resultados del
     panel.
   - Se genera en el aparato. Se valora `expo-print`, que **no** está autorizado: si hace falta, se para y se pregunta.
     Si no, se genera un HTML que se comparte.

---

## P7 · Manual regenerado por completo

Fuente única: `docs/manual-casos-de-uso.html`. De ella salen el PDF (`docs/build-pdf.js`) y el Word
(`docs/build-docx.py`).

1. **Inventario.**
   - Las 27 rutas de la app (según `AppNavigator.tsx` y `MainTabNavigator.tsx`), frente a los capítulos actuales: hoy son
     10 capítulos `<h2>` y 68 capturas en `docs/screenshots/`.
   - Tabla «ruta → capítulo → captura» en `docs/manual-cobertura.md`. Ninguna ruta queda sin capítulo.

2. **Reescritura de todos los capítulos** con lo que la app hace después de P1-P6. Capítulos nuevos o reescritos:
   - vínculo QR y notas v2 (enviar, importar, verificar, acuse);
   - PIN sin maestro y bloqueo;
   - exportar e importar un paciente;
   - recordatorios;
   - pauta por código;
   - voz del cuidador;
   - auditoría y contador de voz;
   - pantalla de persona adulta (Age Signals);
   - informe de consulta.

   Se elimina toda mención a «1985». El estilo y la maquetación del HTML actual se conservan, salvo lo que cambie de
   contenido.

3. **Capturas.**
   - Se rehacen **todas** con `docs/capture-screenshots.js`, ampliado con las pantallas nuevas.
   - Se capturan a 390 px de ancho, y también a 320 px donde haya cabecera fija (R29).
   - Antes de usar cada captura se mira: contraste, texto cortado, chips solapados, estados vacíos (R12, E6).
   - Lo que no se puede capturar en web (RA nativa, cámara del QR, pantalla de Age Signals, que es nativa) se dice **en el
     propio manual**, en el capítulo correspondiente, con el texto «Pantalla nativa: captura pendiente de aparato» (R24).
     Si Frank aporta fotos del aparato, se usan.

4. **Regenerar:**
   ```bash
   CHROMIUM_PATH=/opt/pw-browsers/chromium node docs/build-pdf.js
   pip install python-docx lxml && python3 docs/build-docx.py
   ```
   El PDF se abre y se revisa página a página: portada, índice, saltos y capturas.

5. **README.md:** se actualiza la sección de funciones con lo nuevo, sin datos internos.

6. **`node scripts/check-frank-errors.js`** tiene que pasar: comprueba que existen las imágenes del manual y que cada
   pantalla con «Ver en la mesa» tiene captura.

---

## P8 · Cierre y entrega a revisión

1. Una sola pasada final de los gates, el typecheck y `check-frank-errors`, todos en verde.
2. Push de `antigravity/mejoras-2026-11-27` (sin build automático).
3. **Build de publicación.** Se lanza `workflow_dispatch` de `android.yml` sobre la rama. Tiene que terminar en verde
   con los artefactos `android-aab` y `android-apk`, y se comprueba que existen. Si muere, se diagnostica con el log,
   **no se reintenta a ciegas** y se avisa.
4. **Informe de entrega** en `docs/ENTREGA-ANTIGRAVITY-2026-11.md`, con esta forma:
   - Primera línea: qué va a ver Frank en el APK, y «no visto en Android».
   - Por cada paquete y tarea: estado (`hecho en código` / `parcial` / `parado en Dx`), commit, evidencia (gate,
     captura, comando) y lo que no se ha podido comprobar.
   - Tiempo de build y tamaño del AAB y del APK, antes y después.
   - Número de run del `workflow_dispatch` y enlace a los artefactos.
   - Lista de cosas vistas por el camino y **no tocadas** (regla 0a).

---

## Revisión de Claude Code (lo que se comprobará antes de que Frank mergee)

1. **Diff entero, commit a commit.** Contenido borrado sin pedirlo (R14, R23), cambios fuera del plan (0a) y Lúa en
   cada pantalla nueva.
2. **Repetir los gates y el typecheck en limpio** (`npm ci`) y los gates nuevos, incluida la prueba de que cada gate
   falla con su caso malo.
3. **Pruebas propias:**
   - vectores de XChaCha20 y Ed25519 contra `@noble`;
   - migración `v1→v2` con datos sembrados;
   - QR de vínculo y de nota leídos con `jsQR`;
   - LUFS de una muestra de cada banco con `ffmpeg -af ebur128`;
   - un código de nota partido por un mensajero;
   - que no aparezca «1985» en el repositorio.
4. **Capturas web propias** de todas las pantallas nuevas y cambiadas, contrastadas con las del manual.
5. **El run de `workflow_dispatch`:** el número, la conclusión y los artefactos, consultados en GitHub, no copiados del
   informe.
6. Lo que falle se corrige en la misma rama y se le informa a Frank: qué se ha cambiado, con qué evidencia, y «no visto
   en Android».
