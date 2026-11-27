<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/valeria-logo-white.png">
  <source media="(prefers-color-scheme: light)" srcset="assets/valeria-logo.png">
  <img src="assets/valeria-logo.png" alt="Valeria+" width="320">
</picture>

### Entiende su lenguaje, practica en casa. Lúa os acompaña

**Aplicación educativa para madres, padres y cuidadores: forma sobre el desarrollo del lenguaje
y la comunicación en la infancia y facilita la práctica en casa, guiada por el profesional.**
Funciona sin conexión y sin cuentas.

![Castellano](https://img.shields.io/badge/Castellano-es-C8102E?style=flat-square)
![Galego](https://img.shields.io/badge/Galego-gl-005AA7?style=flat-square)
![Català](https://img.shields.io/badge/Catal%C3%A0-ca-C60B1E?style=flat-square)
![English](https://img.shields.io/badge/English-en-3C3B6E?style=flat-square)
![Sin backend](https://img.shields.io/badge/backend-ninguno-2ea44f?style=flat-square)
![Build](https://github.com/FrankBetances/Valeria/actions/workflows/android.yml/badge.svg)

</div>

---

## Qué es y qué no es

**Valeria+ es una aplicación educativa, no un dispositivo médico.** Primero forma al adulto con la
**Academy** (cápsulas breves) y después le da juegos y ejercicios para practicar en casa. El adulto
guía y valida siempre.

**No diagnostica, no evalúa, no trata y no sustituye** a la logopeda, al otorrino ni a ningún otro
profesional. No calcula puntuaciones clínicas. Las notas entre familia y profesional no se analizan
ni generan recomendaciones automáticas. Ante cualquier duda sobre el desarrollo del lenguaje, la app
remite al profesional de referencia.

Pensada también para familias de niñas y niños con hipoacusia o implante coclear, dislalias,
dislexia o TEA. Nombrar la condición sirve para encontrar el contenido; no es una promesa de efecto.

## Quién hace qué

| Persona | Qué hace en la app |
| --- | --- |
| **Familia** | Practica lo que el profesional ha recomendado, ve lo hecho frente a lo recomendado y le escribe dudas u observaciones |
| **Profesional** (con su propio PIN) | Elige qué actividades se practican y con qué frecuencia, deja indicaciones escritas y ajusta los retos durante la sesión |
| **Otros centros** | Leen el resumen de estimulación en casa, solo si la familia lo autoriza |
| **Lúa**, la gata | Acompaña y celebra en cada módulo; no puntúa ni evalúa |

## Qué hay dentro

| Bloque | Qué se practica |
| --- | --- |
| **Aventuras con Lúa** | Juegos, cuentos, canciones y preguntas por edad. La puerta de entrada |
| **Audición** | Escucha y comprensión, por bandas de edad, con Test de Ling previo si hay audífono o implante |
| **Lenguaje** | Atención conjunta, imitación, comprensión y expresión |
| **TEA** | Rutinas predecibles, espera estructurada y apoyos de comunicación aumentativa |
| **Dislexia** | Conciencia fonológica, acceso léxico, rotaciones b/d · p/q |
| **Pares mínimos** | Pares de palabras casi iguales, con veredicto del adulto |
| **Expansión semántica** | Vocabulario con imagen, voz y acción |
| **Integración sensorial auditiva** | Exposición sonora graduada que configura el adulto; parar nunca resta |
| **Pizarra Mágica** | Trazos guiados |
| **Realidad Aumentada** | Retos sobre los sets de construcción de Lúa y actividades con cámara; el adulto siempre puede confirmar con un toque |

### Seguimiento entre consultas

- **Frecuencia recomendada:** el profesional fija cuántas sesiones por semana de cada una de las 12 áreas (incluidas Escritura, Aventuras con Lúa, Realidad Aumentada, Cápsulas TPR y Retos STEAM) y puede enviarlas firmadas con `VALERIA-PAUTA2:`.
- **Hecho frente a recomendado:** cada sesión terminada se registra sola; la pantalla lo muestra esta semana y en las ocho últimas, y los recordatorios diarios enlazan directamente con las áreas pendientes.
- **Notas y vínculo cifrados entre aparatos:** en consulta, familia y profesional se vinculan con un QR (`VALERIA-VINCULO1:`); las notas (`VALERIA-NOTA2:`) y acuses de lectura (`VALERIA-LEIDO2:`) viajan cifrados y firmados. Canal asíncrono, sin triaje; no es para urgencias.
- **Otros centros e informe HTML:** con autorización de la familia, revocable y registrada, un resumen (QR, texto o informe HTML autocontenido) que no incluye datos identificativos no autorizados.
- **Copia cifrada de perfil (`.valeria`):** exportación e importación local protegida por frase secreta para cambiar de dispositivo sin nube.
- **Un PIN por profesional:** sin PIN maestro; cada profesional entra con el suyo (con bloqueo progresivo tras intentos fallidos). En modo familia solo se ve lo recomendado.

## Privacidad

- **No hay servidor, ni cuentas, ni SDK de terceros.** La app no hace llamadas de red propias; en Android usa la API Play Age Signals exclusivamente en memoria al arrancar para comprobar el acompañamiento adulto.
- Perfiles, sesiones, notas, consentimientos y grabaciones opcionales de **Voz de casa** se guardan **cifrados en el aparato** (`XChaCha20-Poly1305`) y desaparecen al desinstalar (o al retirar el consentimiento en el caso de la voz del cuidador).
- **No se guarda ni se envía audio del niño ni imagen de cámara**: el reconocimiento de voz se procesa en el turno y se descarta; la cámara de RA solo produce números y funciona únicamente en primer plano.
- Un dato solo sale del teléfono cuando el adulto lo comparte él mismo desde el menú de compartir de Android.

Política de privacidad: [castellano](https://frankbetances.github.io/Valeria/privacidad.html) ·
[English](https://frankbetances.github.io/Valeria/privacy.html) ·
[eliminación de datos](https://frankbetances.github.io/Valeria/eliminacion-de-datos.html)

## Idiomas y voces

Interfaz en castellano, galego, català e English. Los ejercicios suenan en castellano (incluyendo variedad dominicana con tolerancia prosódica), galego, euskara, català e inglés de EE. UU.: las consignas pregeneradas en estudio neural se reproducen sin conexión con volumen normalizado y velocidad pausada para la infancia, con respaldo del sistema donde haga falta, **Voz de casa** opcional grabada por el cuidador y **Auditoría del banco de voz** en Ajustes bajo PIN profesional.

## Desarrollo

Expo SDK 58 · React Native 0.88 · TypeScript 5.9. Android es la plataforma publicada.

```bash
npm ci
```

```bash
npm start
```

```bash
npm run typecheck
```

Antes de cada push se pasan los mismos gates que corre CI:

```bash
grep -oP '(?<=run: )node scripts/\S+(?: --\S+)?' .github/workflows/android.yml | while read -r cmd; do $cmd >/dev/null 2>&1 || echo "FALLA: $cmd"; done
```

**Builds.** [`android.yml`](.github/workflows/android.yml) compila en cada push. El build de
publicación (firma, AAB para Play y APK) solo corre en `main` o lanzándolo a mano
(*Run workflow*); el `versionCode` sale del número de run. Las normas para actualizar dependencias
están en [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Documentación

| Documento | Para quién |
| --- | --- |
| [Manual de casos de uso](docs/manual-casos-de-uso.html) ([PDF](docs/Valeria-Manual-Casos-de-Uso.pdf) · [DOCX](docs/Valeria-Manual-Casos-de-Uso.docx)) | Familias y profesionales |
| [Cobertura del manual por pantalla](docs/manual-cobertura.md) | Revisión de pantallas y capturas |
| [Seguridad de los datos en Google Play](docs/play-console-seguridad-datos.md) | Quien publica en Play Console |
| [`site/`](site/) | Páginas legales publicadas en GitHub Pages |

## Licencia y contacto

Software propietario: todos los derechos reservados. Ver [`LICENSE`](LICENSE).
Contacto: frank.alberto.betances.reinoso@gmail.com

<div align="center">
<sub>Hecho con 🐈‍⬛ por el Dr. Frank Alberto Betances Reinoso</sub>
</div>
