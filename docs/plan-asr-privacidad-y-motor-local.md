# Plan · ASR sin salida de audio y evaluación de un motor local

> **Documento de planificación.** Dos trabajos encadenados pero **independientes**,
> que se pueden parar por separado:
>
> - **Fase A · Reconocimiento offline con el motor del sistema.** Conseguir que el
>   audio del turno de habla del menor **no salga del dispositivo** usando el
>   reconocedor que ya trae el móvil. Coste bajo, beneficio regulatorio inmediato.
> - **Fase B · Prueba de concepto de un motor local propio** (`sherpa-onnx` +
>   whisper-small o un Conformer-CTC español). **Es una medición, no una
>   integración**: termina en una cifra y una decisión GO/NO-GO, no en una app.
>
> **El adulto sigue siendo el juez final en todo momento.** Ninguna de las dos
> fases toca `matchPair`/`matchExpected` ni el pliegue dialectal: el motor solo
> aporta la hipótesis de texto; quién decide el veredicto no cambia.
>
> Origen: evaluación del documento externo *"Integración del Motor STT Local
> (Distilled YODAS Spanish)"*, cuya premisa central resultó ser falsa (§2.5).
> Continúa y revisa el NO-GO de [`asr-euskera-ilenia.md`](asr-euskera-ilenia.md) (§2.4).
>
> Encuadre regulatorio: **SaMD Clase I (MDR)** · **RGPD art. 9** (datos de salud de
> menores) · **Play Console → Seguridad de los datos**.
>
> Estado: 🟡 **plan redactado, nada implementado.** Fase A sin empezar; Fase B sin
> empezar. Rama de trabajo: `claude/valeria-voice-recognition-mva9qq`.

---

## Índice

- [1. Objetivo y principio rector](#1-objetivo-y-principio-rector)
- [2. Punto de partida verificado](#2-punto-de-partida-verificado)
- [3. Fase A · Reconocimiento offline con el motor del sistema](#3-fase-a--reconocimiento-offline-con-el-motor-del-sistema)
- [4. Fase B · PoC de motor local con sherpa-onnx](#4-fase-b--poc-de-motor-local-con-sherpa-onnx)
- [5. Fuera de alcance (explícito)](#5-fuera-de-alcance-explícito)
- [6. Riesgos y mitigaciones](#6-riesgos-y-mitigaciones)
- [7. Impacto regulatorio](#7-impacto-regulatorio)
- [8. Decisiones abiertas](#8-decisiones-abiertas)
- [9. Seguimiento](#9-seguimiento)

---

## 1. Objetivo y principio rector

### 1.1 El problema

Valeria+ escucha a un menor con dificultades del lenguaje y valora si ha
producido la palabra objetivo. Hoy ese audio se entrega al **servicio de
reconocimiento del sistema operativo**, que en Android es normalmente el de
Google y que **puede procesarlo en sus servidores**. La política de privacidad
del proyecto ya lo declara con honestidad (`site/privacidad.html:141`).

Para una app de salud pediátrica bajo RGPD art. 9 esto es una arista real: es la
única vía por la que material biométrico de un menor sale del dispositivo. No es
ilegal —está declarado y hay base jurídica—, pero es el punto débil del argumento
de privacidad del proyecto, y es evitable.

### 1.2 Principio rector

> **Reducir la salida de audio no puede costar precisión clínica.**

Un reconocedor offline que falle más produce más falsos negativos: al niño se le
dice "no te escuché" cuando sí lo dijo bien. Eso es peor que el problema que se
intenta resolver. Por eso ninguna de las dos fases se acepta "porque es más
privada": las dos tienen que **medirse contra el comportamiento actual** y
superar un umbral antes de entrar.

### 1.3 Invariantes que ninguna fase puede romper

| Invariante | Dónde vive |
| --- | --- |
| El adulto corrige siempre el veredicto del STT | `ValeriaMinimalPairsScreen.tsx:15`, `:559`, `:850` |
| Sin ASR, la pantalla oculta el micro y el adulto juzga con botones | `ValeriaMinimalPairsScreen.tsx:21`, `asrSupported()` en `valeriaVoice.ts:425` |
| El pliegue dialectal se aplica a la hipótesis, venga del motor que venga | `foldDominican` (`:535`), `foldBasque` (`:550`) |
| El umbral de aceptación fonética es materia clínica y no se afloja | `matchPair` (`:598`), `matchExpected` (`:608`) |
| La ventana de escucha ES-04 (3 s de silencio) es un requisito de logopedas | `ANDROID_LISTEN_EXTRAS` (`:446`) |
| `newArchEnabled` sigue en `false` | `app.json:9` |

---

## 2. Punto de partida verificado

Todo lo de esta sección está comprobado sobre el árbol y sobre el código real de
las dependencias (tarball de npm de la versión exacta que usa el proyecto), no
supuesto.

### 2.1 Lo que hace hoy la app

`src/valeriaVoice.ts` concentra TTS y ASR. El ASR carga `@react-native-voice/voice`
de forma perezosa (`:419`), expone `asrSupported()` (`:425`) para degradar sin
romper en Expo Go, y arranca con `Voice.start(speechLocale(), ANDROID_LISTEN_EXTRAS)`
(`:501`). Los extras actuales son cuatro y todos regulan **cuándo deja de
escuchar**, no dónde se procesa.

### 2.2 El hallazgo que condiciona la Fase A

**Añadir `EXTRA_PREFER_OFFLINE: true` a `ANDROID_LISTEN_EXTRAS` no haría nada.**

El módulo Android de `@react-native-voice/voice@3.2.4` recorre las opciones que
llegan de JS con un `switch (key)` que acepta **exactamente seis claves**
(`EXTRA_LANGUAGE_MODEL`, `EXTRA_MAX_RESULTS`, `EXTRA_PARTIAL_RESULTS`, y los tres
`EXTRA_SPEECH_INPUT_*_MILLIS`) y **no tiene rama `default`**:

```java
// android/src/main/java/com/wenkesj/voice/VoiceModule.java · v3.2.4
while (iterator.hasNextKey()) {
  String key = iterator.nextKey();
  switch (key) {
    case "EXTRA_LANGUAGE_MODEL": /* … */
    case "EXTRA_MAX_RESULTS": /* … */
    /* … cuatro más … */
    // ← no hay default: cualquier otra clave se descarta en silencio
  }
}
intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, getLocale(this.locale));
speech.startListening(intent);
```

Una clave desconocida se cae sin error, sin log y sin aviso. Es decir: la mejora
se habría dado por hecha, habría pasado revisión, se habría anunciado en la
política de privacidad y **el audio habría seguido saliendo igual**. Esto obliga
a que la Fase A empiece por una decisión de mecanismo (§3.1), no por editar un
objeto en TypeScript.

**En iOS el problema es mayor.** `ios/Voice/Voice.m` crea la petición y solo le
pone `shouldReportPartialResults`; **nunca** toca `requiresOnDeviceRecognition`,
que es la propiedad que fuerza el reconocimiento local en `SFSpeechRecognizer`
(iOS 13+). Con esta librería iOS no tiene camino on-device en absoluto.

**Dato de contexto:** la librería es lo bastante antigua como para seguir
dependiendo de `com.android.support:*`, y por eso el proyecto arrastra
`plugins/withJetifier.js`. No es una dependencia con la que convenga casarse a
largo plazo.

### 2.3 Lo que ya declara la política de privacidad

| Ubicación | Qué dice | Qué pasaría si la Fase A sale bien |
| --- | --- | --- |
| `privacidad.html:112` | Fila "Reconocimiento de voz (servicio del sistema)" | Se matiza: se ejecuta en local cuando el dispositivo puede |
| `privacidad.html:141` | "ese servicio puede procesar el audio en sus propios servidores" | Se reescribe: pasa a ser la excepción, no la norma |
| `privacidad.html:163` | Lista al reconocedor como destinatario tercero | **Podría salir de la lista** en configuración offline |
| `eliminacion-de-datos.html:64` | Remite a `myactivity.google.com` para el historial | Deja de aplicar cuando no hay envío |

Y lo mismo en `privacy.html` (EN). Es un beneficio regulatorio tangible y
declarable, no cosmético.

### 2.4 Relación con el NO-GO de `asr-euskera-ilenia.md`

Aquel documento evaluó portar ASR vasco on-device y concluyó **NO-GO, revisar en
6–12 meses**, señalando como vía preferente *"Wav2Vec2-CTC vasco → ONNX →
sherpa-onnx"*. Este plan **no lo contradice; es la revisión que aquel dejó
pendiente**, con dos diferencias que cambian el cálculo:

1. **Cambia la lengua.** Aquello era euskera, una variedad minoritaria de la app.
   Esto es **castellano, la lengua principal**, donde está la mayor parte de las
   sesiones y todo el trabajo clínico de es-DO.
2. **Cambia la motivación.** Aquello buscaba *cobertura* (que el euskera se
   reconociera). Esto busca *privacidad*, que aplica a todas las variedades.

La conclusión técnica de aquel documento sigue vigente y se hereda: **whisper
large es inviable en gama media; la vía realista es un modelo pequeño
cuantizado**. Este plan la pone a prueba con números.

### 2.5 Por qué no se sigue la propuesta "Distilled YODAS"

Para que quede registrado y no se reabra: `BSC-LT/distilled-yodas-spanish` es un
**corpus** (~7.997 h de habla en español validada por consenso, publicado bajo
`huggingface.co/datasets/`), **no un modelo acústico**. La propuesta lo trataba
como modelo, le atribuía pesos PyTorch FP32 de 1,4 GB y los cuantizaba a ONNX
INT8 de 230 MB. No se puede cuantizar un corpus, así que toda su tabla de
rendimiento (RTF 0.18, WER +0,65 %, RAM 280 MB) no mide nada, y las URLs de su
pipeline de CI apuntan a una organización inexistente (`BSC-TeP`; la real es
`BSC-LT`).

El modelo real y bien alineado con el proyecto es **`BSC-LT/whisper-large-v3-LoS`**
—afinado sobre 8.110 h, transcribe **español, catalán, gallego y euskera**, justo
los locales que Valeria+ sirve—, pero es un whisper-large-v3 de 1.500 M
parámetros: ni en INT8 baja de ~1,5 GB. Queda descartado para el dispositivo y
anotado como candidato **de escritorio** para generar la verdad de referencia del
banco de medida (§4.3).

---

## 3. Fase A · Reconocimiento offline con el motor del sistema

**Pregunta que responde:** ¿puede el audio del turno de habla quedarse en el
dispositivo sin perder precisión clínica, usando el reconocedor que ya trae el
móvil?

### 3.1 A.0 · Decisión de mecanismo (bloqueante, va primero)

Como `@react-native-voice/voice` no reenvía la clave (§2.2), hay tres caminos.
Hay que elegir **antes** de tocar nada.

| Opción | Qué implica | A favor | En contra |
| --- | --- | --- | --- |
| **1. Parchear la dependencia** (`patch-package`) | Añadir el `case "EXTRA_PREFER_OFFLINE"` al `switch` de `VoiceModule.java` | Cambio mínimo, no toca el resto de la app | Introduce `patch-package` y un `postinstall` que hoy no existe; **no resuelve iOS**; el parche hay que revalidarlo en cada bump |
| **2. Bifurcar la librería** | Fork propio, mantenido en el repo | Control total, se podría arreglar también iOS y AndroidX | Mantenimiento indefinido de código ajeno; el peor coste a largo plazo |
| **3. Migrar a `@jamsch/expo-speech-recognition`** ⭐ | Sustituir la dependencia de ASR | Soporta de fábrica lo que hace falta (abajo); quita la deuda de `withJetifier`; resuelve iOS | Cambia la superficie de la API de escucha; hay que reescribir `startListening`; versión 0.2.15 (pre-1.0) |

**Recomendación: opción 3.** Verificado sobre el tarball de la v0.2.15, expone
exactamente las piezas que faltan:

```ts
requiresOnDeviceRecognition?: boolean          // iOS y Android
androidIntentOptions?: { EXTRA_PREFER_OFFLINE: boolean, … }
getSupportedLocales({ … })                     // ¿está instalado el paquete offline?
androidTriggerOfflineModelDownload({ … })      // instalarlo desde la app
recordingOptions.persist                       // guardar el audio (clave para la Fase B)
audioSource                                    // reconocer desde un WAV (clave para la Fase B)
```

Las dos últimas convierten la Fase B en algo **medible y reproducible** (§4.3):
la misma grabación se puede pasar por el motor del sistema y por sherpa-onnx y
comparar. Con la librería actual eso no se puede hacer.

`getSupportedLocales()` y `androidTriggerOfflineModelDownload()` son además la
respuesta al problema de §3.3.

> **Riesgo asumido:** es una dependencia pre-1.0. Se mitiga con la misma
> disciplina que ya usa el proyecto: toda la superficie queda encapsulada dentro
> de `valeriaVoice.ts` (como ya lo está hoy), de modo que un cambio de librería
> no se propaga a las pantallas.

### 3.2 A.1 · Cambios por archivo

Solo se enumeran; la implementación va después de cerrar A.0.

| Archivo | Cambio |
| --- | --- |
| `package.json` | Sustituir `@react-native-voice/voice` por la librería elegida |
| `app.json` | Sustituir la entrada del plugin y sus textos de permiso (los mensajes actuales en castellano se conservan literalmente) |
| `plugins/withJetifier.js` | **Retirar** si se va a la opción 3 (existe solo por la librería vieja) |
| `plugins/withSpeechRecognitionQueries.js` | Revisar: la `<queries>` del manifiesto puede cambiar de destinatario |
| `src/valeriaVoice.ts` | Reescribir el bloque ASR (`:419`–`:520`) contra la API nueva. **`ANDROID_LISTEN_EXTRAS` y sus valores ES-04 se conservan tal cual**; se les añade `EXTRA_PREFER_OFFLINE` y `requiresOnDeviceRecognition` |
| `src/valeriaVoice.ts` | Nuevo: `asrOfflineStatus()` — expone si el reconocimiento se está haciendo en local, para la telemetría y para el Panel del Adulto |
| `src/valeriaTelemetry.ts` | Registrar por sesión: modo (local/red), locale, y tasa de `noMatch` |
| `site/privacidad.html` · `site/privacy.html` | §7 |

**No se tocan** `ValeriaMinimalPairsScreen.tsx` ni `ValeriaSemanticExpansionScreen.tsx`:
consumen `startListening`/`matchPair`/`matchExpected`, cuyo contrato no cambia.
Ese es el criterio de que la fase está bien hecha.

### 3.3 A.2 · El problema del paquete de idioma, y la política de degradación

`EXTRA_PREFER_OFFLINE` es **una pista, no una garantía**: Android puede no
honrarla. Y en un dispositivo sin el paquete de idioma español instalado, forzar
offline degrada el reconocimiento o lo hace fallar.

Esto importa clínicamente: un fallo del motor **no debe gastarle un intento ni
una estrella al niño**. La distinción ya existe en el código —`ListenCallbacks.onError`
recibe `noMatch` para separar "el motor no captó" de "el niño lo dijo mal"
(`valeriaVoice.ts:~432`)— y hay que preservarla intacta.

**Política de degradación propuesta (a validar con datos de A.4):**

1. Al primer uso, `getSupportedLocales()` comprueba si el locale activo está
   disponible sin conexión.
2. Si **lo está** → se pide offline y se registra `modo=local`.
3. Si **no lo está** → se ofrece al adulto, **una vez y de forma explícita**,
   descargar el paquete (`androidTriggerOfflineModelDownload`), explicando en
   una frase que sirve para que la voz del menor no salga del teléfono.
4. Si el adulto declina o la descarga no está disponible → **se sigue con el
   motor de red, como hoy**, y se registra `modo=red`. No se rompe el ejercicio
   por privacidad.

El punto 4 es deliberado: la app es una herramienta de rehabilitación antes que
un manifiesto de privacidad.

### 3.4 A.3 · Verificación (sin esto la fase no se cierra)

El fallo de §2.2 enseña que la comprobación no puede ser "leer el código y darlo
por bueno". Hacen falta **dos pruebas de dispositivo**:

1. **Prueba de la clave.** Con `adb shell dumpsys` / logcat del reconocedor, o
   con `getSupportedLocales()` + la señal de modo, confirmar que el
   comportamiento cambia entre `EXTRA_PREFER_OFFLINE: true` y `false`. Si no se
   observa diferencia, la clave no está llegando.
2. **Prueba del avión.** Poner el teléfono en modo avión y ejecutar un ejercicio
   completo de pares mínimos. Si reconoce, es local. Es la prueba más barata y
   la más difícil de falsear.

### 3.5 A.4 · Criterios de aceptación (puerta de la Fase A)

| Criterio | Umbral |
| --- | --- |
| Prueba del avión en ≥ 2 modelos Android distintos | Reconoce en los dos |
| Tasa de `noMatch` en local vs red, sobre el mismo banco de palabras | Degradación **≤ 5 puntos** |
| Veredictos `matchPair` que cambian de rama al pasar a local | **≤ 5 %** del total |
| Ejercicios en producción sin regresión (pares mínimos, expansión, Ling) | Los tres pasan |
| `npm run typecheck` y el CI de Android | En verde |
| Política de privacidad y Play Data Safety actualizados | En el mismo commit |

Si la degradación supera el umbral: **la Fase A se queda en "offline opcional,
por defecto apagado"** y se documenta. No se fuerza.

---

## 4. Fase B · PoC de motor local con sherpa-onnx

**Naturaleza de esta fase: es un experimento con puerta de decisión.** Termina en
una tabla de números y un GO/NO-GO. No termina en una funcionalidad de la app.

### 4.1 B.0 · La pregunta que decide

> ¿Un modelo pequeño cuantizado corriendo en el propio dispositivo acierta el
> **veredicto clínico** —no la transcripción— tan bien como el reconocedor del
> sistema, en un móvil de gama media, en menos de 3 segundos y sin cargarse la
> batería ni el tamaño del APK?

Nótese la formulación. **La métrica que importa no es el WER.** A Valeria+ le da
igual la transcripción literal: lo que necesita es que `matchPair` acierte si el
niño dijo *perro* o *pelo*. Un motor con WER peor pero que preserve el contraste
fonológico clínico es preferible a uno con WER mejor que lo pierda. Toda la
evaluación se construye sobre esa distinción.

### 4.2 B.1 · Corpus de evaluación (lo primero, y lo que más cuidado exige)

Sin audio real de niños esto no se puede medir, y el audio de niños con
dificultades del lenguaje es precisamente el dato más sensible del proyecto.

**Reglas innegociables del corpus:**

- **Consentimiento informado explícito y por escrito** de las familias, específico
  para "grabar y conservar la voz con fines de evaluación técnica", separado del
  consentimiento de uso de la app. Es RGPD art. 9: categoría especial.
- Las grabaciones **no salen del equipo de desarrollo** y **no se suben al
  repositorio** (regla ya vigente para el corpus de voz, ver `.github/workflows/pages.yml`).
- `recordingOptions.persist` **jamás se activa en una build de producción**. Se
  usa en una build de desarrollo dedicada. Conviene un test o comprobación en CI
  que falle si aparece activado en release.
- Plazo de conservación definido y borrado al cerrar la fase.
- Si el consentimiento no se consigue: se degrada a **habla adulta imitando los
  contrastes** y se documenta que los resultados son una cota superior optimista.
  Un PoC con datos adultos sigue siendo informativo para descartar candidatos
  malos; no basta para un GO.

**Tamaño mínimo útil:** ~200 enunciados que cubran los contrastes de
`valeriaMinimalPairsEsDO.ts`, con al menos 4 hablantes, incluyendo producciones
erróneas reales (que son justo las que el motor tiene que *no* corregir).

> **Trampa a evitar:** un STT genérico entrenado con castellano de YouTube tiende
> a "arreglar" lo que oye y devolver la palabra bien formada. Si el niño dice
> *pelo* y el motor devuelve *perro* porque el contexto lo sugiere, el ejercicio
> queda inservible. **Este es el riesgo clínico principal de todo el plan**, y el
> corpus tiene que estar diseñado para detectarlo.

### 4.3 B.2 · Verdad de referencia

Cada enunciado del corpus se etiqueta con:

- **Lo que el adulto (logopeda o familia) juzga** que dijo el niño → es la verdad
  clínica y la referencia contra la que se mide todo.
- Opcionalmente, la transcripción de **`BSC-LT/whisper-large-v3-LoS` en
  escritorio** (§2.5), como segunda opinión de alta calidad. No sustituye al
  adulto; ayuda a localizar desacuerdos que merezcan una segunda escucha.

### 4.4 B.3 · Candidatos a evaluar

| # | Motor | Tamaño aprox. | Notas |
| --- | --- | --- | --- |
| 0 | **Reconocedor del sistema** (resultado de la Fase A) | 0 MB | **Es la línea base.** Todo se compara contra esto |
| 1 | `whisper-small` multilingüe, INT8, vía sherpa-onnx | ~250 MB | Prebuilt disponible; probablemente demasiado grande |
| 2 | `whisper-base` multilingüe, INT8, vía sherpa-onnx | ~80 MB | El más prometedor en relación peso/calidad |
| 3 | Conformer-CTC español de NeMo → ONNX → sherpa-onnx | ~40–120 MB | Requiere exportación propia; es la vía que ya recomendaba `asr-euskera-ilenia.md` |

Se evalúan **en escritorio primero** (barato, rápido, con el binario de
sherpa-onnx). Solo los que pasen el filtro clínico llegan al teléfono.

### 4.5 B.4 · Banco de medida

Dos etapas, para no gastar trabajo de integración en candidatos que van a caer.

**Etapa 1 · Escritorio** (script en `scripts/`, siguiendo el patrón verificable
de `fetch-ar-model.js`: URL fijada + SHA-256 + bytes):

| Métrica | Cómo | Por qué importa |
| --- | --- | --- |
| **Acierto de veredicto** | Pasar la hipótesis por `normalizeSpeech` + pliegue + `matchPair`, comparar con el juicio del adulto | **La métrica decisiva** |
| Falsos positivos de contraste | Casos donde el niño falló y el motor "arregló" la palabra | El riesgo de §4.2 |
| WER | Estándar, informativo | Comparabilidad externa |
| RTF | Tiempo de inferencia / duración del audio | Predice la latencia en móvil |

**Etapa 2 · Dispositivo** (app de laboratorio aparte, **no** Valeria+):

| Métrica | Umbral orientativo |
| --- | --- |
| Latencia por enunciado corto, gama media | < 3 s |
| RAM pico | < 400 MB |
| Incremento de tamaño del APK/AAB | < 150 MB |
| Temperatura / batería en sesión de 30 min | Sin *throttling* observable |

Los umbrales de latencia y RAM salen de la experiencia ya registrada en
`asr-euskera-ilenia.md` (whisper.cpp `base`: 1–3 s por enunciado en gama media).
El perfil de hardware de referencia es el mismo del piloto: **Android de gama
media/media-alta en LATAM**, según `plan-integracion-rehabilitacion-ar.md` §3.4.

### 4.6 B.5 · Integración mínima (solo si la etapa 2 pasa)

Detrás de `asrSupported()`, como capacidad **opcional** que degrada a la Fase A,
exactamente igual que el bloque de RA degrada a la sobreimpresión 2D. El modelo
se descargaría bajo demanda con verificación SHA-256, extendiendo
`scripts/fetch-ar-model.js` en lugar de crear un pipeline paralelo.

**No se escribe una línea de esta integración antes de tener la tabla de §4.5.**

### 4.7 B.6 · Criterios GO / NO-GO

**GO** si, y solo si, **todos**:

- Acierto de veredicto **≥ el de la línea base** (motor del sistema), con margen ≤ 2 puntos por debajo como tolerancia.
- Falsos positivos de contraste **no superiores** a la línea base.
- Latencia, RAM y tamaño dentro de §4.5.
- Existe un candidato que cumpla lo anterior **por debajo de 150 MB**.

**NO-GO** en cuanto falle uno. Y el NO-GO es un resultado perfectamente bueno:
significa que la Fase A ya resolvió el problema de privacidad al coste correcto,
y se documenta con las cifras para no volver a abrir el debate sin datos nuevos
—igual que hizo `asr-euskera-ilenia.md`.

---

## 5. Fuera de alcance (explícito)

Para que no se cuele por la puerta de atrás:

- **Migración a la Nueva Arquitectura.** `newArchEnabled` sigue en `false`. Si
  algún día hace falta, es un proyecto propio con su propio plan y su propio
  riesgo sobre el módulo `valeria-ar`.
- **TurboModules / JSI / C++ propio.** No hay ninguna evidencia de que la
  serialización del puente sea el cuello de botella; el cuello de botella es la
  inferencia. Optimizar el puente antes de medir la inferencia es orden inverso.
- **Modelos de 230 MB o más** sin haber pasado §4.7.
- **Cualquier veredicto automático.** El adulto sigue siendo el juez (§1.3).
- **Un modal de validación nuevo.** Ya existe y funciona.
- **iOS como requisito.** Se evalúa en la Fase A porque la librería nueva lo
  facilita; no bloquea nada.

---

## 6. Riesgos y mitigaciones

| # | Riesgo | Prob. | Impacto | Mitigación |
| --- | --- | --- | --- | --- |
| R1 | El motor "arregla" la palabra mal pronunciada y destruye el contraste clínico | Media | **Crítico** | Es la métrica principal de §4.5; corpus diseñado con producciones erróneas reales |
| R2 | Una opción se da por implementada sin estarlo (como §2.2) | Media | Alto | Prueba del avión (§3.4); nada se cierra sin verificación de dispositivo |
| R3 | El reconocimiento offline degrada y aumentan los falsos `noMatch` | Media | Alto | Umbral de §3.5; política de degradación de §3.3; se puede dejar apagado por defecto |
| R4 | No se consigue consentimiento para el corpus infantil | Media | Alto | Degradar a habla adulta y marcar los resultados como cota optimista (§4.2) |
| R5 | La librería nueva (pre-1.0) se abandona o rompe | Baja | Medio | Toda la superficie encapsulada en `valeriaVoice.ts`; volver atrás es un cambio de un archivo |
| R6 | `react-native-sherpa-onnx-stt` está en v0.2.2, muy temprana | Alta | Medio | Solo afecta a la Fase B, que es un experimento; si la librería no sirve, se mide con el binario nativo de sherpa-onnx |
| R7 | El corpus de audio infantil se filtra al repositorio | Baja | **Crítico** | `.gitignore` explícito + comprobación en CI; nunca en `site/` |
| R8 | Fase A migra la librería y rompe un ejercicio en producción | Media | Alto | El contrato de `startListening`/`matchPair` no cambia; los tres ejercicios son criterio de aceptación (§3.5) |

---

## 7. Impacto regulatorio

Regla del proyecto (`CLAUDE.md`): **cuando cambia lo que la app recoge, la política
de `site/` y el formulario de *Seguridad de los datos* de Play Console se
actualizan en el mismo cambio.** Google contrasta ambas declaraciones.

| Momento | Qué hay que actualizar |
| --- | --- |
| **Fase A entra** | `privacidad.html` §3.3 y §163 + `privacy.html` equivalente: el reconocimiento pasa a ser local cuando el dispositivo lo permite; revisar si el reconocedor deja de ser destinatario tercero. Play: revisar "Compartición de datos" |
| **Fase B, corpus** | **No toca la política pública**: es una build de desarrollo, no de producción. Sí exige el consentimiento informado específico de §4.2 |
| **Fase B, si GO** | Declarar la descarga del modelo; revisar el tamaño de la app en la ficha; confirmar que se elimina la salida de audio |
| **En ambos casos** | El correo de contacto es y sigue siendo `frank.alberto.betances.reinoso@gmail.com` |

**Marco MDR:** ninguna de las dos fases altera la clasificación. El motor propone
hipótesis; el adulto decide. Ese es el argumento que sostiene la Clase I y no se
toca.

---

## 8. Decisiones abiertas

| # | Decisión | Quién | Bloquea |
| --- | --- | --- | --- |
| D1 | Mecanismo de la Fase A: parche, fork o migración (§3.1) | Frank | Todo el trabajo de la Fase A |
| D2 | ¿Se pide el paquete de idioma offline al adulto, o solo se usa si ya está? (§3.3) | Frank + criterio clínico | A.1 |
| D3 | ¿Hay vía para conseguir consentimiento de grabación en el piloto ACOPROS? (§4.2) | Frank | Toda la Fase B |
| D4 | ¿Offline por defecto, o *opt-in* del adulto? | Tras los datos de §3.5 | Cierre de la Fase A |
| D5 | ¿La Fase B se lanza aunque la Fase A cumpla holgadamente? | Frank | Arranque de la Fase B |

**D5 merece una nota:** si la Fase A consigue la prueba del avión en la mayoría
de dispositivos del piloto, el problema de privacidad está resuelto y la Fase B
pasa a ser una mejora de *cobertura* (dispositivos sin paquete offline), no de
privacidad. Eso baja mucho su prioridad. Conviene decidirlo con los datos de A
delante y no antes.

---

## 9. Seguimiento

### Fase A

- [ ] **D1 · decidir el mecanismo** (§3.1) ← *empieza aquí*
- [ ] Sustituir/parchear la dependencia de ASR
- [ ] Reescribir el bloque ASR de `valeriaVoice.ts` conservando ES-04 y el contrato
- [ ] Añadir `asrOfflineStatus()` y la telemetría de modo
- [ ] Implementar la política de degradación (§3.3)
- [ ] **Prueba de la clave** y **prueba del avión** en ≥ 2 dispositivos (§3.4)
- [ ] Medir degradación de `noMatch` y de veredicto contra la línea base
- [ ] Verificar los tres ejercicios sin regresión
- [ ] Actualizar `privacidad.html`, `privacy.html` y Play Data Safety
- [ ] Puerta §3.5

### Fase B

- [ ] **D3 · consentimiento** (§4.2) ← *bloqueante*
- [ ] Reunir y etiquetar el corpus de evaluación
- [ ] Script de banco de medida en escritorio (`scripts/`)
- [ ] Evaluar candidatos 0–3 en escritorio (§4.4)
- [ ] Llevar los supervivientes a dispositivo (§4.5 etapa 2)
- [ ] Redactar la tabla de resultados
- [ ] **Puerta GO/NO-GO** (§4.7) — y documentar el resultado sea cual sea

---

> **Nota de método.** Este plan nace de auditar una propuesta que declaraba
> "CUMPLIDO (100 %)" en cinco criterios de un sistema que nunca se había
> compilado, apoyada en un modelo que no existe. La lección está incorporada a
> propósito: aquí **nada se da por cumplido sin una medición de dispositivo**, y
> las dos fases terminan en una puerta con umbrales numéricos fijados de
> antemano. Un NO-GO documentado con cifras vale más que un GO sin ellas.
