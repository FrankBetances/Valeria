# Plan de trabajo para Antigravity · Valeria+ · v2 (27/11/2026, se empieza desde cero)

Este fichero **sustituye entero** a la versión anterior del mismo nombre y a `docs/PLAN-MEJORAS-2026-11-16.md`.
Lo ejecuta Antigravity. Claude Code revisa cada paquete sobre el diff subido a GitHub.
Nada de este plan está visto en Android.

## 0. Lo que cambia respecto a la v1, y por qué

La mañana del 27/11 se perdió regenerando en local unos 5 000 audios en lotes de 10 minutos, tres veces el castellano.
**Eso queda prohibido (R34, R35).**

| Regla nueva | Qué significa |
| --- | --- |
| **Lo pesado corre en GitHub Actions, nunca en local** | La síntesis de voz se hace con `voice-assets.yml` y el build de Android con `android.yml`. En local solo se edita código y se prueba con unos pocos audios en `/tmp` que no se suben |
| **Cada paquete dice dónde corre y qué gasta** | Columna «Dónde corre» en cada paquete. Si algo va a gastar más que editar y comprobar, se dice antes y se espera el «sí» de Frank |
| **Orden fijo: P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8** | P2 solo edita el script y lanza CI. Mientras CI sintetiza, se sigue con P3 |
| **Push por paquete** | Claude Code revisa cada paquete en GitHub, no al final |

### Qué se hace con el trabajo local de la mañana

1. **Se borran los audios y manifiestos generados en local.** No se sube ninguno.
   ```bash
   git checkout -- assets/voice voice-assets-manifest.*.json src/valeriaVoiceAssets.ts
   git clean -fd assets/voice
   ```
   `scripts/check-frank-errors.js` (R34) corta el push si un manifiesto nuevo no lo ha escrito CI.
2. **Los cambios en scripts se pueden conservar**, pero solo si cumplen la especificación de P2 de este plan:
   `generate-voice-assets.py`, `check-voice-assets-quality.js`, `voice-assets.yml` y las versiones fijadas que ya se
   comprobaron. Lo que no la cumpla se rehace.
3. **`src/valeriaExerciseBank.ts`:** su cambio se deshace (`git checkout -- src/valeriaExerciseBank.ts`), salvo que
   forme parte del corpus es-DO de P2.6. En ese caso se explica en el commit de P2 con el diff pegado.

---

## 1. Reglas para quien ejecuta (obligatorias)

Antes de empezar, hay que leer enteros `CLAUDE.md` y `.claude/errores-frank.md` (de R1 a R35).

### 1.1 Rama, commits y pushes

- Rama `antigravity/mejoras-2026-11-27`, rehecha desde `origin/claude/nice-allen-tyiqgx`, que trae este plan y la
  comprobación R34. Los pushes a `antigravity/**` no lanzan build de Android.
- **Un commit y un push por paquete**, con el título `Pn · …`.
- **Prohibido:** push o merge a `main`, `--force` sobre ramas ajenas, reescribir el historial y lanzar workflows en
  ramas que no sean la suya.
- Antes de cada commit, en este orden (en local, segundos):
  ```bash
  npm ci
  grep -oP '(?<=run: )node scripts/\S+(?: --\S+)?' .github/workflows/android.yml |
    while read -r cmd; do $cmd >/dev/null 2>&1 || echo "FALLA: $cmd"; done
  npm run typecheck
  node scripts/check-frank-errors.js
  ```
  Si algo falla, no hay commit.
- Si se cambia un texto que la app **locuta**, en el mismo commit va `node scripts/export-voice-corpus.js`. Ese commit
  no genera audio: los audios los genera CI.
- Todo texto nuevo de interfaz va en **es, gl, eu, en y ca** y pasa `npm run check:ui-strings`.

### 1.2 Prohibiciones (de CLAUDE.md y errores-frank.md)

- **Diff entero leído tras cualquier sustitución automática.** Si borra contenido que no tocaba, se rechaza (R14,
  R23).
- **Lúa en toda pantalla nueva:** `ScreenHeader` con la mascota, y la reacción va arriba y pequeña (R1, R7, R17, R18).
  Pantalla que premia → `cancelSessionReward()` al desmontarse.
- **Nada fuera del plan (0a).** Lo que se vea por el camino se apunta en el informe, no se toca.
- **No mezclar `flex: 1` con `flexGrow`, `flexShrink` o `flexBasis` en el mismo elemento.** Iconos de
  `ValeriaBlockIcons` o de Lucide; nada de emoji.
- **Si cambia lo que la app recoge o recibe:** se actualizan `site/` (ES y EN), `docs/play-console-seguridad-datos.md` y
  `scripts/check-data-safety-declaration.js` en el mismo commit. Correo de contacto:
  `frank.alberto.betances.reinoso@gmail.com`.
- **No se inventan datos, versiones ni campos de API.** Lo que no se ha comprobado se escribe así: «no comprobado».
- **Nunca «hecho», «listo» ni «completo»** sin evidencia. La entrega dice «no visto en Android».

### 1.3 Dependencias autorizadas por Frank (y ninguna más)

| Paquete | Tipo | Para qué |
| --- | --- | --- |
| `@noble/ciphers`, `@noble/curves`, `@noble/hashes` | JS puro | XChaCha20-Poly1305, Ed25519, PBKDF2 |
| `expo-secure-store`, `expo-crypto`, `expo-camera` | Nativo (Expo) | Claves en el Keystore, bytes aleatorios, lector QR |
| `com.google.android.play:age-signals` | Nativo (Gradle) | Opción A |

- Las versiones de Expo se instalan con `EXPO_OFFLINE=1 npx expo install <paquete>` y se comprueba a mano que son la
  `~58.x`.
- La versión de `age-signals` se toma de
  <https://developer.android.com/google/play/age-signals/use-age-signals-api> el día que se trabaje.
- El aumento del tiempo de build se mide **en el build final de P8**, no con builds aparte.

### 1.4 Puntos de parada (los decide Frank; se para solo esa tarea y se sigue con el resto)

| # | Decisión | Qué se le deja preparado |
| --- | --- | --- |
| D1 | Voz del banco es-DO | Ya existe `docs/voz-esdo-muestras/` (`es_MX-claude-high` y `es_MX-ald-medium`). Se sube tal cual en el commit de P2 |
| D2 | Escritura: qué se oye al pulsar «oír» | Listado de lo que suena hoy por cada letra y una propuesta |
| D3 | Textos legales nuevos | El diff de `site/`, marcado «pendiente de revisión legal» |
| D4 | Países de Play Console (Brasil) | Nada en código |

---

## P1 · Voz estable en el código de la app

**Dónde corre:** en local, solo edición y gates. Coste: bajo.

1. **Las correcciones ya no se cortan.**
   - Tras «¡Casi!», «Lo decimos juntos» o «No te he oído», la palabra modelo arranca hoy con un temporizador fijo de 1,5
     a 2,2 s (`ValeriaMinimalPairsScreen.tsx:516-531`, `ValeriaSemanticExpansionScreen.tsx:561-575`). Los 25 audios de
     esas categorías duran entre 2,0 y 5,3 s, así que se cortan siempre.
   - Se encadena con `afterSpeak` → `onDone`, con 250 ms de pausa que se cancelan al desmontar.
   - Se aplica a todo `src/` donde una locución siga a otra mediante un `setTimeout` fijo, y se lista en el commit.
   - **Gate `scripts/check-voice-chaining.js`** en `android.yml`, con un caso malo incluido que lo haga fallar.

2. **Prosodia de la voz del sistema** (`src/valeriaSpeechProsody.ts`, `src/valeriaVoice.ts:318-326`):
   - `PROSODY_DEFAULT = { gapMs: 80, chainMinWords: 25, mergeMinWords: 4 }`;
   - fuera el *jitter* y las subidas de tono por signo;
   - tono máximo 1,05 y velocidad de 0,85 a 0,95 en `speakToChild`, `speakToChildIn` y `speakWordSlow`;
   - `speakClinical` no se toca;
   - gate `scripts/check-speech-prosody.js` con casos de troceo.

3. **La voz sigue a la variedad.**
   - En `valeriaLocale.ts`: `onLocaleChange(cb)` y `localeReady`, sin importar `valeriaVoice`, para no crear un ciclo.
   - En `valeriaVoice.ts`: al cambiar la variedad se vacían `bestVoice`, `bestVoiceId` y `voiceByLang` y se relanza
     `findBestVoice()`, que espera a `localeReady` como mucho 300 ms.
   - Cubre `ValeriaPatientSelectScreen.tsx:92` y `valeriaUiLang.ts:139,147`.
   - Test de Node con un catálogo de voces simulado: tras `setLocale('en-US')` la voz elegida es inglesa.

4. **Reproductor sin huecos** (`src/valeriaVoicePlayback.ts`):
   - un reproductor reutilizado con `replace()` (se comprueba en los `.d.ts` de expo-audio) y otro que precarga la
     siguiente pieza de las secuencias;
   - vigilante con la duración del manifiesto + 1 500 ms → `onError`. `build-voice-asset-map.js` emite los segundos de
     cada id.

5. **Contador local de voz:** porcentaje de locuciones de audio pregrabado frente a voz del sistema, por variedad y con
   el motivo. Va cifrado y solo con contadores, y se muestra en la tarjeta «Voz de la app».

---

## P2 · Audio pregenerado estable

**Dónde corre:** en local solo se editan `scripts/generate-voice-assets.py`, `scripts/check-voice-assets-quality.js`
y `.github/workflows/voice-assets.yml`, probando con **10 audios por motor en `/tmp`**. **La síntesis completa la hace
`voice-assets.yml` en GitHub.** Coste en local: bajo. En CI: gratis.

### Especificación de masterizado

Son valores ya medidos por Antigravity el 27/11; Claude Code los revisará en CI.

- **Objetivo:** `TARGET_LUFS = -17.0` y `TP = -1.5`, **iguales en todos los idiomas**, es-DO incluido.
  - El babble de `assets/audio` mide −23,2 LUFS, así que el margen es de 6,2 LU.
  - El margen entre voz y ruido es un parámetro clínico: **prohibido** cambiar el objetivo por idioma (R33).
- **Cadena por audio:**
  1. recorte de bordes a 50 ms (−45 dB);
  2. `compress_internal_silence` en todos los motores;
  3. compresor suave **solo si hace falta**: `acompressor`, ratio 2:1, ataque ≥ 15 ms y liberación de 120 ms, para no
     tocar las explosiones de /p/, /t/ y /k/;
  4. limitador con **3 dB como máximo** de reducción;
  5. `loudnorm` en dos pasadas con `linear=true`, usando el mismo `aloop` en las dos pasadas para los audios de menos de
     3,2 s, `aresample` a la frecuencia original y `atrim`;
  6. fundidos de 10 ms;
  7. AAC a 64 kbps, mono.
- **Si un audio no llega al objetivo con 3 dB de limitador,** se deja en lineal con menos ganancia y se lista. No se
  baja el objetivo del idioma.
- **El manifiesto registra, por fichero:** `lufs`, `normType`, `compressorGainReductionDb`, `limiterGainReductionDb` y
  `paramsHash`.
- **El manifiesto registra, por idioma:** `targetLufs`, `paramsHash`, las versiones del motor y
  `"generatedBy": "github-actions"`, este último **solo** si `GITHUB_ACTIONS == "true"`.
- **Temporales:** `tempfile.TemporaryDirectory()` por worker, nunca dentro de `assets/`.
- **Estilo `slow`:** `length_scale` 1,35.

### Gate `scripts/check-voice-assets-quality.js`

Se añade a `voice-assets.yml` y a `android.yml`. Falla en estos casos:

- un idioma tiene más de un `paramsHash`;
- los manifiestos no tienen todos el mismo `targetLufs`;
- un audio se sale de ±1 LU del objetivo, o la dispersión de un idioma pasa de 1,5 LU;
- un `normType` es distinto de `linear` y no está en la lista de excepciones con id y motivo (hoy solo
  `child_729e1a96_6`);
- un `limiterGainReductionDb` pasa de 3;
- la relación segundos/carácter de un audio cae fuera de [p1, p99] de su idioma, que es la señal de un audio cruzado.

### Workflow `voice-assets.yml`

- Input nuevo `force: true|false`. Con `true`, regenera todo lo que no tenga el `paramsHash` actual, en los cinco idiomas.
- Si el trabajo no cabe en el tiempo de un runner, se divide en una matriz por idioma, sin lotes manuales.
- **gl (Celtia) se regenera en CI**, que ya tiene el secreto `HF_TOKEN` para el modelo restringido.
- Versiones fijadas (las de la mañana, ya comprobadas en seco).
- **Cómo se lanza:** en `antigravity/**` no hay disparo automático. Se lanza a mano en la rama propia
  (`workflow_dispatch`, `force: true`). El bot sube los audios a la rama; **antes de cada push siguiente se hace
  `git pull --rebase`**.

### Banco es-DO (P2.6)

- `es-DO` entra en el corpus (`scripts/export-voice-corpus.js`) a partir de los bancos dominicanos existentes, y
  `assetLang('es-DO')` devuelve su banco.
- Su voz queda pendiente de D1. Sin decisión de Frank, el banco es-DO no se sintetiza.

### Tamaño

Se compara `assets/voice` en `966a4cc` (114 MB) con lo que suba CI, por idioma. Si la proyección con seis bancos pasa de
180 MB, **se para y se avisa**: Play Asset Delivery no se implementa sin el «sí» de Frank.

**Aceptación de P2:** `voice-assets.yml` en verde en la rama propia (se da el número de run), el gate en verde sobre
los manifiestos de CI y la tabla de tamaños.

---

## P3 · Notas e intercambio entre familia y profesional (v2)

**Dónde corre:** en local, solo edición y gates. Coste: medio.

1. **Cifrado real** (`src/valeriaCrypto.ts`).
   - Formato `v2:` con XChaCha20-Poly1305, un *nonce* de 24 bytes por escritura (`expo-crypto`) y la clave en
     `expo-secure-store`.
   - `v1:` se lee y se migra; un blob alterado da `null`.
   - **Pasan a cifrarse:** ficha, pacientes, historial y profesionales (`STORAGE_KEYS.registro`, `pacientes`,
     `historial` y `profesionales`). El JSON en claro antiguo se migra al leerlo.
   - `android.allowBackup: false` en `app.json`, y se dice en la política y en `site/eliminacion-de-datos.html`.
   - Gate `scripts/check-crypto.js`.

2. **Identidad estable del paciente.**
   - `pid` aleatorio de 128 bits en la ficha.
   - Los datos que hoy van con clave de NHC o nombre (`valeriaFollowUp.ts:47-54` y los *seeds* con nombre de la RA) se
     migran una vez.
   - Fuera el `anon`.

3. **Escrituras sin pérdidas.**
   - `withLock(key, fn)` en `addNote`, `markFamilyNotesReviewed`, `logStimulation`, `savePlan` y `setConsent`.
   - `writeEnc` devuelve `boolean`: la interfaz solo dice «guardada» si es `true`, y si falla conserva el texto.

4. **PIN.**
   - Fuera el PIN maestro «1985» de `src/` y `docs/`. Sin profesionales dados de alta, el primer desbloqueo da de alta
     al primero.
   - PBKDF2-SHA256 con sal de 16 bytes, con el máximo de iteraciones que no pase de 400 ms en web.
   - Bloqueo persistido: 5 fallos → 30 s; 10 → 5 min; 15 → 30 min.
   - Instrucciones del revisor de Play en `docs/play-console-seguridad-datos.md` §4, sin ningún PIN escrito.
   - Gate `scripts/check-pro-pin.js`.

5. **Código de nota v2.**
   - **Vínculo por paciente:** un QR `VALERIA-VINCULO1:` con `pidHash`, `linkKey` y la clave pública Ed25519.
   - **Formato:** `VALERIA-NOTA2:` cifrado con `linkKey` y firmado con Ed25519 por quien la escribe.
   - **Dos sentidos:** la familia también envía notas.
   - **Acuse de lectura** con `VALERIA-LEIDO2:`.
   - **Transporte:** QR (`expo-camera` para leerlo), enlace `valeria://nota?c=` y pegar, quitando espacios y saltos de
     línea.
   - `VALERIA-NOTA1` se importa como «no verificada».
   - Tests en `scripts/check-note-codes.js`, y los QR se leen con `jsQR` (R4).

6. **Exportación cifrada de un paciente** (fichero `.valeria`, con una frase que elige el adulto), porque
   `allowBackup` pasa a `false`.

7. **Textos:** la revocación del consentimiento no recupera lo ya compartido, y las notas de la familia solo entran en
   el resumen si el adulto lo confirma.

---

## P4 · Bugs y robustez

**Dónde corre:** en local, solo edición y gates. Coste: medio.

1. **Adherencia.** Se llama a `logStimulation` en:
   - Escritura;
   - las cuatro pantallas de Aventuras con Lúa;
   - RA;
   - TPR;
   - STEAM.

   Se añaden las áreas nuevas en los cinco idiomas. En `ValeriaExercisePlayerScreen.tsx:59-60, 692`, cada área de la
   sesión se registra, y un id desconocido no cuenta como «audición».
2. **Escritura:** `stopSpeaking` al desmontar, `registerSession` + `luaSessionReward` + `cancelSessionReward` y
   `logStimulation('escritura')`.
3. **Escritura: qué se oye al pulsar «oír»:** parada D2.
4. **ErrorBoundary global** con Lúa y el botón «Volver al inicio», en los cinco idiomas.
5. **Temporizadores** que se limpian al desmontar, en todo `src/**/*.tsx`. La lista va en el commit.
6. **Tipos:** fuera los `any` de `valeriaArBridge.ts`, `valeriaTelemetry.ts` y los stores.

---

## P5 · Opción A · Play Age Signals (solo Android)

**Dónde corre:** en local, edición; la compilación nativa se comprueba en el build final de P8. Coste: medio.

1. **Módulo nativo** `android-native/valeria-age-signals/` y plugin `plugins/withValeriaAgeSignals.js`, con el mismo
   patrón que `valeria-ar` (`android-native/README.md`). Se documenta en ese README.
2. **`src/valeriaAgeSignals.ts`:**
   - carga perezosa; en web, iOS o sin módulo devuelve `unavailable`;
   - se llama en cada arranque;
   - el resultado vive solo en memoria;
   - los campos se copian de la tabla oficial *Response fields*.
3. **Menor de 18 o supervisado** → `ValeriaAdultGateScreen`, con Lúa: «Valeria+ la usa una persona adulta junto al
   niño o la niña», y el botón «Soy la persona adulta» que pide el PIN. Sin señal o con error, la app sigue igual que
   hoy.
4. **Pruebas** con el gestor falso o el modo de prueba que indique la documentación oficial, en estos estados: adulto,
   menor, supervisado, sin datos y error.
5. **Legal (D3):** `site/` en ES y EN, `play-console-seguridad-datos.md` y `check-data-safety-declaration.js`.

---

## P6 · Funciones nuevas

**Dónde corre:** en local, solo edición y gates. Coste: medio.

1. **Auditoría del banco de voz** en el panel del adulto, detrás del PIN: escuchar, marcar y exportar
   `id · texto · motivo`.
2. **Recordatorios ligados a la pauta** con `expo-notifications`, que ya está instalado (`src/valeriaNotifications.ts`):
   locales, se pueden desactivar y van en los cinco idiomas.
3. **Pauta por código** `VALERIA-PAUTA2:`, con el mismo sobre que P3.5. Formato documentado en
   `docs/formato-codigos-valeria.md`.
4. **Voz del cuidador** en las palabras modelo de Pares Mínimos y Expansión Semántica: grabación con `expo-audio`,
   cifrada en el aparato y con consentimiento que se puede retirar. Conmutador «Voz de la app / Voz de casa». Legal en
   D3.
5. **Informe de consulta** como HTML compartible. Si hiciera falta `expo-print`, **se para y se pregunta**.

---

## P7 · Manual regenerado por completo

**Dónde corre:** las capturas y el PDF en local (Chromium, minutos). Coste: medio.

1. **Inventario:** las 27 rutas frente a los capítulos y las capturas, en `docs/manual-cobertura.md`. Ninguna ruta sin
   capítulo.
2. **Reescritura** de `docs/manual-casos-de-uso.html` con todo lo de P1-P6. Fuera el «1985».
3. **Capturas:** se rehacen todas con `docs/capture-screenshots.js` y se miran una a una (R12, R29). Lo nativo que no se
   puede capturar se dice dentro del manual (R24).
4. **Formatos:** PDF (`docs/build-pdf.js`) y Word (`docs/build-docx.py`). El PDF se revisa página a página.
5. **README** con las funciones nuevas.

---

## P8 · Cierre

**Dónde corre:** el build en GitHub. Coste en local: bajo.

1. Gates, typecheck y `check-frank-errors` en verde, y push.
2. **Un único** `workflow_dispatch` de `android.yml` en la rama propia. Tiene que acabar en verde con los artefactos
   `android-aab` y `android-apk`. Si muere, se diagnostica con el log, **sin reintentar a ciegas**.
3. **Informe** `docs/ENTREGA-ANTIGRAVITY-2026-11.md`:
   - primera línea: qué ve Frank en el APK y «no visto en Android»;
   - por tarea: estado, commit, evidencia y lo que no se ha comprobado;
   - tiempos de build, tamaños, número de los runs de voz y de Android, y lo visto y no tocado.

---

## Revisión de Claude Code (tras cada push de paquete)

1. **Diff entero:** contenido borrado (R14, R23), cambios fuera del plan (0a) y Lúa en las pantallas nuevas.
2. **Gates en limpio** (`npm ci`), comprobando también que cada gate nuevo falla con su caso malo.
3. **Pruebas propias:**
   - cifrado y firma;
   - migración `v1→v2`;
   - QR con `jsQR`;
   - LUFS y reducción de ganancia sobre los audios **que subió CI**;
   - código de nota partido por un mensajero;
   - que no aparezca «1985».
4. **Runs de `voice-assets.yml` y `android.yml`** consultados en GitHub.
5. Lo que falle se corrige en la misma rama, con evidencia y «no visto en Android».
