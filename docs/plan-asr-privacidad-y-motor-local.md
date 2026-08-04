# Plan · ASR sin salida de audio y evaluación de un motor local

> **Documento de planificación.** Dos trabajos encadenados pero **independientes**,
> que se pueden parar por separado:
>
> - **Fase A · Reconocimiento local con el motor del sistema.** Conseguir que el
>   audio del turno de habla del menor **no salga del dispositivo** usando el
>   reconocedor que ya trae el móvil. Coste bajo, beneficio regulatorio inmediato.
> - **Fase B · Prueba de concepto de un motor local propio** (`sherpa-onnx`).
>   **Es una medición, no una integración**: termina en una cifra y una decisión
>   GO/NO-GO, no en una app.
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
> **Estado: 🟠 Fase A — todo el software escrito, pendiente de dispositivo**
> (2026-08-04). Decisiones cerradas: **D1 · migración** (§3.1), **D3 ·
> consentimiento** (§4.2) y **D2 · sí se ofrece la descarga del paquete**, una
> vez y de forma explícita (§3.3).
>
> Hecho y verificado en `expo prebuild` + `typecheck`: la migración de librería,
> la política de degradación por locale, la telemetría por modo, **el bloque del
> adulto que dice dónde se está escuchando y ofrece el paquete local**, y **la
> política de privacidad ES/EN redactada por variedad** (§7).
>
> Lo que falta **solo se puede hacer con un teléfono delante** (§3.5) o con
> ACOPROS: la inspección de tráfico, los dos casos de `noMatch` a mano, la
> medida contra la línea base y el **umbral clínico** de la puerta (§3.6, D6).
>
> Rama de trabajo: `claude/new-voice-recognition-0rcwl9` (continúa
> `claude/valeria-voice-recognition-mva9qq`).

---

## Índice

- [1. Objetivo y principio rector](#1-objetivo-y-principio-rector)
- [2. Punto de partida verificado](#2-punto-de-partida-verificado)
- [3. Fase A · Reconocimiento local con el motor del sistema](#3-fase-a--reconocimiento-local-con-el-motor-del-sistema)
- [4. Fase B · PoC de motor local con sherpa-onnx](#4-fase-b--poc-de-motor-local-con-sherpa-onnx)
- [5. Fuera de alcance (explícito)](#5-fuera-de-alcance-explícito)
- [6. Riesgos y mitigaciones](#6-riesgos-y-mitigaciones)
- [7. Impacto regulatorio](#7-impacto-regulatorio)
- [8. Decisiones](#8-decisiones)
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

Un reconocedor local que falle más produce más falsos negativos: al niño se le
dice "no te escuché" cuando sí lo dijo bien. Eso es peor que el problema que se
intenta resolver. Por eso ninguna de las dos fases se acepta "porque es más
privada": las dos tienen que **medirse contra el comportamiento actual** y
superar un umbral antes de entrar.

### 1.3 Invariantes que ninguna fase puede romper

| Invariante | Dónde vive |
| --- | --- |
| El adulto corrige siempre el veredicto del STT | `ValeriaMinimalPairsScreen.tsx:15`, `:559`, `:850` |
| Sin ASR, la pantalla oculta el micro y el adulto juzga con botones | `ValeriaMinimalPairsScreen.tsx:21`, `asrSupported()` en `valeriaVoice.ts:437` |
| El pliegue dialectal se aplica a la hipótesis, venga del motor que venga | `foldDominican` (`:687`), `foldBasque` (`:702`) |
| El umbral de aceptación fonética es materia clínica y no se afloja | `matchPair` (`:750`), `matchExpected` (`:760`) |
| La ventana de escucha ES-04 (3 s de silencio) es un requisito de logopedas | `ANDROID_LISTEN_EXTRAS` (`:527`) |
| La distinción `noMatch` —fallo del motor ≠ fallo del niño— no se pierde | `NO_MATCH_ERRORS` (`:556`), `ListenCallbacks.onError` |
| **Nunca se sesga el reconocedor hacia la palabra objetivo** | §3.4 |
| `newArchEnabled` sigue en `false` | `app.json:9` |

---

## 2. Punto de partida verificado

Todo lo de esta sección está comprobado sobre el árbol y sobre el código real de
las dependencias (tarball de npm de la versión exacta que usa el proyecto), no
supuesto.

### 2.1 De dónde se partía

> Esta sección describe el estado **anterior** a la Fase A, que es lo que justifica
> el resto del plan. Para el estado actual, ver §3.2.

`src/valeriaVoice.ts` concentra TTS y ASR. El ASR cargaba `@react-native-voice/voice`
de forma perezosa (`:419`), expone `asrSupported()` (`:425`) para degradar sin
romper en Expo Go, y arranca con `Voice.start(speechLocale(), ANDROID_LISTEN_EXTRAS)`
(`:501`). Los extras actuales son cuatro y todos regulan **cuándo deja de
escuchar**, no dónde se procesa.

### 2.2 El hallazgo que condiciona la Fase A

**Añadir `EXTRA_PREFER_OFFLINE` a `ANDROID_LISTEN_EXTRAS` no haría nada.**

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
política de privacidad y **el audio habría seguido saliendo igual**.

**En iOS el problema es mayor.** `ios/Voice/Voice.m` crea la petición y solo le
pone `shouldReportPartialResults`; **nunca** toca `requiresOnDeviceRecognition`,
que es la propiedad que fuerza el reconocimiento local en `SFSpeechRecognizer`
(iOS 13+). Con esta librería iOS no tiene camino on-device en absoluto.

**Dato de contexto:** la librería sigue dependiendo de `com.android.support:*`, y
por eso el proyecto arrastra `plugins/withJetifier.js`. No es una dependencia con
la que convenga casarse a largo plazo.

### 2.3 La palanca correcta no es `EXTRA_PREFER_OFFLINE`

Corrección sobre la primera versión de este plan, que giraba alrededor de esa
clave. `EXTRA_PREFER_OFFLINE` es **una pista** que Android puede ignorar. Lo que
de verdad hace falta son cuatro piezas, y ninguna existe en la librería actual:

| Pieza | Qué garantiza |
| --- | --- |
| `requiresOnDeviceRecognition` | *"Prevent device from sending audio over the network. Only enabled if the device supports it."* Es una garantía condicionada, no una preferencia. Existe en Android y en iOS |
| `androidRecognitionServicePackage` + `getSpeechRecognitionServices()` | **Selección dura del motor**: apuntar a `com.google.android.as` (Android System Intelligence, local) en vez de `com.google.android.googlequicksearchbox` (red) |
| `supportsOnDeviceRecognition()` | Comprobación en tiempo de ejecución antes de prometer nada |
| `getSupportedLocales()` | Si el paquete de idioma está instalado, **por locale** (§3.3) |

Esto es lo que colapsa la decisión D1: no es una clave en un `switch`, son cinco
APIs en dos plataformas.

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

Sus dos conclusiones técnicas se heredan y se confirman: **whisper large es
inviable en gama media**, y **CTC es preferible a Whisper para este uso** por ser
"más ligero y determinista" — razón que §4.4 desarrolla y convierte en el orden
de evaluación.

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

## 3. Fase A · Reconocimiento local con el motor del sistema

**Pregunta que responde:** ¿puede el audio del turno de habla quedarse en el
dispositivo sin perder precisión clínica, usando el reconocedor que ya trae el
móvil?

### 3.1 A.0 · Mecanismo — ✅ DECIDIDO Y EJECUTADO (2026-08-03)

**Se migró a `expo-speech-recognition@3.1.3`.**

Las tres opciones que se barajaron:

| Opción | Veredicto |
| --- | --- |
| 1. Parchear la dependencia (`patch-package`) | ❌ Descartada. Dejó de ser barata al saber que hacen falta cinco APIs en dos plataformas (§2.3), no una clave en un `switch`. Sería reescribir la librería dentro de un parche |
| 2. Bifurcar la librería | ❌ Descartada. Es la opción 1 con mantenimiento indefinido de código ajeno que aún depende de `com.android.support` |
| 3. **Migrar a la librería mantenida** | ✅ **Elegida y ejecutada** |

> **Nota de ejecución.** La decisión se tomó sobre `@jamsch/expo-speech-recognition@0.2.15`,
> pero al instalarla npm avisó de que **está deprecada: el paquete se movió a
> `expo-speech-recognition`**, sin ámbito. La sucesora se renumeró para alinearse
> con el SDK de Expo, así que la serie `56.x` apunta a SDK 56 y **la que
> corresponde a este proyecto (SDK 54) es la `3.1.3`**, cuyo `devDependencies.expo`
> es `~54.0.32` frente al `~54.0.35` del repositorio.
>
> **Esto mejora el trato de D1**: el precio que se aceptó era depender de una
> pre-1.0, y `3.1.3` ya no lo es. La API verificada es la misma, con un cambio:
> los listeners se registran con `ExpoSpeechRecognitionModule.addListener(...)`
> en vez del export suelto `addSpeechRecognitionListener` de la 0.2.x.

Expone de fábrica todo lo que falta:

```ts
requiresOnDeviceRecognition?: boolean          // iOS y Android — la garantía
androidRecognitionServicePackage?: string      // fijar el motor local
supportsOnDeviceRecognition(): boolean         // comprobación en runtime
getSupportedLocales({ … })                     // ¿paquete offline instalado?
androidTriggerOfflineModelDownload({ … })      // instalarlo desde la app
androidIntentOptions?: { EXTRA_PREFER_OFFLINE, … }
recordingOptions.persist                       // guardar audio → Fase B
audioSource                                    // reconocer desde WAV → Fase B
```

Las dos últimas hacen la Fase B **reproducible** (§4.5): la misma grabación
pasada por el motor del sistema y por sherpa-onnx, comparable. Con la librería
actual eso es imposible.

**Beneficios colaterales, los tres confirmados al ejecutar:**

1. Elimina `plugins/withJetifier.js` **y** `plugins/withSpeechRecognitionQueries.js`
   (el plugin de la librería nueva ya declara la `<queries>`). Verificado: el
   `gradle.properties` generado ya no lleva `android.enableJetifier`.
2. Abre iOS, que con la librería anterior no tenía ningún camino on-device.
3. **Cierra una vulnerabilidad crítica.** `SECURITY.md` documentaba `xmldom`
   (GHSA-crh6-fp67-6883) como riesgo aceptado, entrando por
   `@react-native-voice/voice → @expo/plist`. Al desaparecer esa cadena, `npm audit`
   ya no la reporta. No era el objetivo de la migración; salió de regalo.

**Precio asumido conscientemente:** una dependencia de ASR nueva en una app de
contexto sanitario. Se mitiga encapsulando toda su superficie dentro de
`valeriaVoice.ts` —como ya estaba—, de modo que volver atrás sea un cambio de un
solo archivo y las pantallas nunca vean la librería.

### 3.2 A.1 · Cambios por archivo

| Archivo | Cambio |
| --- | --- |
| `package.json` | ✅ Quitado `@react-native-voice/voice`, añadido `expo-speech-recognition@^3.1.3` |
| `app.json` | ✅ Plugin sustituido, textos de permiso en castellano conservados literalmente, y `androidSpeechServicePackages` declarando **también `com.google.android.as`** — sin eso el motor local no es visible en Android 11+ y la Fase A fallaría en silencio |
| `plugins/withJetifier.js` | ✅ Retirado |
| `plugins/withSpeechRecognitionQueries.js` | ✅ Retirado: el plugin de la librería nueva ya declara la `<queries>` |
| `src/valeriaVoice.ts` | ✅ Bloque ASR reescrito. **Los tres valores de silencio de ES-04 se conservan tal cual**; el cuarto extra, `EXTRA_PARTIAL_RESULTS`, no existe como intent option en la librería nueva y pasa a la opción multiplataforma `interimResults: true` |
| `src/valeriaVoice.ts` | ✅ `NO_MATCH_CODES` traducido a `NO_MATCH_ERRORS` — ver aviso abajo |
| `src/valeriaVoice.ts` | ✅ Nuevo: `asrOfflineStatus()` y la resolución **por locale**, hoy en `probeLocale()` |
| `src/valeriaVoice.ts` | ✅ Nuevo (D2): `asrLocaleStatus()` devuelve el diagnóstico completo —`deviceCapable`, `serviceAvailable`, `localeInstalled`, `canOfferDownload`— y no solo el veredicto; `requestOfflineModel()` envuelve `androidTriggerOfflineModelDownload`; `forgetAsrLocale()` invalida la caché tras descargar |
| `src/valeriaTelemetry.ts` | ✅ `SessionRecord.asr`: `noMatch` particionado por modo + `byLocale`. Lo empuja `valeriaVoice` con `trackAsrMode()`; la telemetría **no importa** el módulo de voz, para no romper su regla de no depender de nada opcional |
| `src/ValeriaVoiceUI.tsx` | ✅ Nuevo `<SpeechPrivacyBlock>` dentro de «Voz de la app»: modo de la variedad activa, motivo cuando es de red, oferta de descarga una sola vez y modo de la última escucha real (diagnóstico de nivel 2) |
| `src/valeriaTheme.ts` | ✅ `STORAGE_KEYS.asrOfertaLocal`, con sufijo por variedad: recuerda a qué variedades el adulto ya declinó la descarga |
| `site/privacidad.html` · `site/privacy.html` | ✅ §3.3, el recuadro de grabaciones de voz y el §5 de destinatarios, redactados **por variedad** y sin promesa global (§7). Fecha de última actualización al 2026-08-04 |
| `README.md` | ✅ Tabla de respuestas de *Seguridad de los datos* de Play, con el aviso de no marcar «los datos no salen del dispositivo» |

**No se tocan** `ValeriaMinimalPairsScreen.tsx` ni `ValeriaSemanticExpansionScreen.tsx`:
consumen `startListening`/`matchPair`/`matchExpected`, cuyo contrato no cambia.
Ese es el criterio de que la fase está bien hecha.

> ⚠️ **El punto delicado de la migración: `NO_MATCH_CODES`.**
> `valeriaVoice.ts:459` distingue "el motor no captó" de "el niño lo dijo mal"
> mediante los códigos `'6'` (SPEECH_TIMEOUT) y `'7'` (NO_MATCH) del
> `SpeechRecognizer` de Android. La librería nueva expone los errores de otra
> forma. **Si esa traducción se hace mal, se rompe ES-04** y la app empieza a
> gastarle intentos y estrellas al niño por tropiezos del reconocedor. Es un
> invariante clínico (§1.3): se traduce con una tabla explícita y se verifica
> provocando ambos casos a mano antes de cerrar la fase.

### 3.3 A.2 · Política de degradación, **por locale**

Corrección sobre la primera versión: la disponibilidad del paquete de idioma es
**por locale**, no global. Es razonable que exista para castellano; para **gallego
y euskera es mucho menos probable**. Forzar reconocimiento local de forma global
rompería desproporcionadamente `gl` y `eu`, que son variedades con planes propios
en el repo.

Flujo, evaluado **para el locale activo** en cada sesión (`probeLocale()` en
`valeriaVoice.ts`, con caché por locale):

1. `supportsOnDeviceRecognition()` → ¿el dispositivo sabe hacerlo?
2. `getSpeechRecognitionServices()` → ¿está instalado `com.google.android.as`?
3. `getSupportedLocales({ androidRecognitionServicePackage })` → ¿está
   **descargado** el paquete de **este** locale? Se mira `installedLocales`, no
   `locales`: "soportado" no es lo mismo que "instalado".
4. Si **sí** → `requiresOnDeviceRecognition: true` + fijar el paquete de servicio
   local. Se registra `modo=local`.
5. Si **no** → se ofrece al adulto, **una vez y de forma explícita**, descargar el
   paquete (`androidTriggerOfflineModelDownload`), explicando en una frase que
   sirve para que la voz del menor no salga del teléfono.
6. Si declina o no está disponible → **se sigue con el motor de red, como hoy**, y
   se registra `modo=red`. No se rompe el ejercicio por privacidad.

> **Dos límites del sistema que conviene tener escritos**, porque explican
> resultados que si no parecen fallos de la app:
>
> - En **Android 12 y anteriores** `getSupportedLocales()` devuelve listas
>   vacías: la API del sistema no existe. Sin poder comprobarlo, el diagnóstico
>   se queda en `red`. Es el lado conservador y es el correcto: no se promete lo
>   que no se puede verificar.
> - `androidTriggerOfflineModelDownload()` es de **Android 13+**, y en 13 solo
>   puede abrir el diálogo del sistema (`opened_dialog`); el resultado real de la
>   descarga (`download_success` / `download_canceled`) llega en 14+. Por eso el
>   botón de descarga solo aparece con API ≥ 33, y en 13 el texto pide volver a
>   comprobar cuando la descarga termine.

**Lo que ve el adulto** (D2, cerrada el 2026-08-04): un bloque bajo «Voz de la
app» con el modo de la variedad activa, el **motivo** cuando es de red —no es lo
mismo "este móvil no sabe" que "le falta el paquete de galego"—, la oferta de
descarga cuando ese motivo es el paquete, y el modo de la última escucha real de
la sesión. Esto último es, además, el diagnóstico de nivel 2 del §3.5 sin tener
que exportar la telemetría.

El punto 5 es deliberado: la app es una herramienta de rehabilitación antes que un
manifiesto de privacidad. Y el resultado esperado es **mixto por variedad**:
castellano probablemente en local, gallego y euskera probablemente en red. Eso hay
que declararlo con precisión en la política (§7) en lugar de prometer "todo local".

### 3.4 A.3 · Prohibición explícita: nada de sesgar el reconocedor

La librería expone `contextualStrings` (`EXTRA_BIASING_STRINGS` en Android 13+,
`SFSpeechRecognitionRequest.contextualStrings` en iOS), que sesga el reconocedor
hacia palabras concretas.

**Está prohibido usarlo con la palabra objetivo del ejercicio.** Parece una mejora
obvia —le pasas *perro* y reconoce mejor— y es exactamente lo contrario: sesgar
hacia *perro* hace que el motor devuelva *perro* aunque el niño haya dicho *pelo*.
Es fabricar el falso positivo que todo el ejercicio existe para detectar, y
destruye el valor clínico de los pares mínimos.

Queda registrado aquí porque **alguien lo propondrá como optimización** al ver
que el reconocimiento falla, probablemente con buena intención y sin conocer el
protocolo.

### 3.5 A.4 · Verificación (sin esto la fase no se cierra)

El fallo de §2.2 enseña que la comprobación no puede ser "leer el código y darlo
por bueno". Y la primera versión de este plan cometía un error propio: proponía la
prueba del modo avión como demostración suficiente. **No lo es.**

> **La prueba del avión demuestra capacidad, no política.** Que el reconocimiento
> funcione sin red prueba que el dispositivo *puede* hacerlo en local. **No prueba
> que, con red disponible, el audio se quede dentro.** Un móvil puede pasar la
> prueba del avión y seguir enviando audio cuando está online.

Verificación en tres niveles, de más débil a más fuerte:

| Nivel | Prueba | Qué demuestra |
| --- | --- | --- |
| 1 | Modo avión: ejercicio completo de pares mínimos | El dispositivo *puede* reconocer en local |
| 2 | `supportsOnDeviceRecognition()` + `modo=local` en telemetría + paquete de servicio fijado a `com.google.android.as` | Se está **pidiendo** el motor local y el sistema lo concede |
| 3 | **Inspección de tráfico de red** durante un turno de habla con red activa | El audio **no sale**. Es la única prueba concluyente |

El nivel 3 es el que cierra la fase. Los niveles 1 y 2 son diagnóstico rápido
durante el desarrollo.

### 3.6 A.5 · Criterios de aceptación (puerta de la Fase A)

| Criterio | Umbral |
| --- | --- |
| Verificación de nivel 3 en ≥ 2 modelos Android distintos | Sin salida de audio en los dos |
| Tasa de `noMatch` en local vs red, sobre el corpus (§4.2) | 🟡 **provisional: ≤ 5 puntos** |
| Veredictos `matchPair` que cambian de rama al pasar a local | 🟡 **provisional: ≤ 5 %** |
| `noMatch` correctamente distinguido tras la migración (ES-04) | Verificado a mano en ambos casos |
| Ejercicios en producción sin regresión (pares mínimos, expansión, Ling) | Los tres pasan |
| `npm run typecheck` y el CI de Android | En verde |
| Política de privacidad y Play Data Safety actualizados | En el mismo commit |

> 🟡 **Los dos umbrales marcados son provisionales y me los inventé.** No salen de
> ninguna evidencia clínica. La pregunta que los fija, pendiente con ACOPROS:
> *¿cuántos "no te escuché" de más por sesión son tolerables antes de que el
> ejercicio pierda valor terapéutico?* Se puede implementar y medir sin la
> respuesta; **no se puede cerrar la fase sin ella.**

Si la degradación supera el umbral final: **la Fase A se queda en "local
opcional, por defecto apagado"** y se documenta. No se fuerza.

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

### 4.2 B.1 · Corpus de evaluación — ✅ consentimiento resuelto (2026-08-03)

**El consentimiento está preparado y se firma en papel el día de la grabación.**
Eso desbloquea la Fase B y, además, permite validar la Fase A con rigor (§3.6) en
lugar de a ojo.

**Reglas operativas de la sesión de grabación:**

- **No se graba nada antes de la firma.** El consentimiento es previo al
  tratamiento, no posterior; en papel el mismo día es válido siempre que se firme
  antes de encender el micro.
- **Plan para quien declina:** la familia que no firme hace su sesión con
  normalidad, simplemente sin grabación. No puede haber presión implícita, y
  conviene tenerlo previsto para no improvisar ese día.
- **Seudonimización:** las grabaciones se identifican con un código, nunca con
  nombre. **Los consentimientos en papel se archivan separados del audio**, y la
  tabla que los vincula vive aparte de los ficheros.
- **Plazo de conservación definido** y borrado documentado al cerrar la fase.

**Reglas técnicas (heredadas y no negociables):**

- Las grabaciones **no salen del equipo de desarrollo** y **no se suben al
  repositorio** (regla ya vigente para el corpus de voz, ver `.github/workflows/pages.yml`).
- `recordingOptions.persist` **jamás se activa en una build de producción**. Se usa
  en una build de desarrollo dedicada. Conviene una comprobación en CI que falle
  si aparece activado en release.
- `.gitignore` explícito para el directorio de audio.

**Tamaño mínimo útil:** ~200 enunciados que cubran los contrastes de
`valeriaMinimalPairsEsDO.ts`, con al menos 4 hablantes, **incluyendo producciones
erróneas reales** — que son justo las que el motor tiene que *no* corregir.

> **Trampa a evitar:** un STT genérico tiende a "arreglar" lo que oye y devolver
> la palabra bien formada. Si el niño dice *pelo* y el motor devuelve *perro*, el
> ejercicio queda inservible. **Este es el riesgo clínico principal de todo el
> plan** (R1), y el corpus tiene que estar diseñado para detectarlo: sin
> producciones erróneas grabadas, el banco de medida no puede verlo.

### 4.3 B.2 · Verdad de referencia

Cada enunciado del corpus se etiqueta con:

- **Lo que el adulto (logopeda o familia) juzga** que dijo el niño → es la verdad
  clínica y la referencia contra la que se mide todo.
- Opcionalmente, la transcripción de **`BSC-LT/whisper-large-v3-LoS` en
  escritorio** (§2.5), como segunda opinión de alta calidad. No sustituye al
  adulto; ayuda a localizar desacuerdos que merezcan una segunda escucha.

### 4.4 B.3 · Candidatos, **ordenados por idoneidad clínica**

Corrección sobre la primera versión, que ponía Whisper primero por comodidad de
implementación. El orden correcto es el inverso, por una razón estructural:

> **El decodificador de Whisper es un modelo de lenguaje.** Genera texto fluido y
> coherente porque para eso está entrenado. Ante habla infantil con dislalia, su
> sesgo natural es devolver la palabra bien formada — es decir, **Whisper es el
> arquetipo del riesgo R1**. Un modelo **CTC** emite evidencia fonética por frame
> sin ese sesgo de fluidez: peor WER en habla normal, pero mucho más fiel a lo que
> el niño realmente produjo. Para pares mínimos eso es exactamente lo que se
> necesita, y coincide con lo que ya recomendaba `asr-euskera-ilenia.md`.

| # | Motor | Tamaño aprox. | Notas |
| --- | --- | --- | --- |
| 0 | **Reconocedor del sistema** (resultado de la Fase A) | 0 MB | **Línea base.** Todo se compara contra esto |
| 1 | **Conformer-CTC español** (NeMo) → ONNX → sherpa-onnx | ~40–120 MB | **Favorito clínico.** Requiere exportación propia; sin sesgo de LM |
| 2 | `whisper-base` multilingüe, INT8, vía sherpa-onnx | ~80 MB | Prebuilt disponible; buen peso, pero con el sesgo de §4.4 |
| 3 | `whisper-small` multilingüe, INT8, vía sherpa-onnx | ~250 MB | Probablemente demasiado grande; solo si 1 y 2 fallan |

Se evalúan **en escritorio primero** (barato, rápido, con el binario de
sherpa-onnx). Solo los que pasen el filtro clínico llegan al teléfono.

### 4.5 B.4 · Banco de medida

Dos etapas, para no gastar trabajo de integración en candidatos que van a caer.

**Etapa 1 · Escritorio** (script en `scripts/`, siguiendo el patrón verificable de
`fetch-ar-model.js`: URL fijada + SHA-256 + bytes):

| Métrica | Cómo | Por qué importa |
| --- | --- | --- |
| **Acierto de veredicto** | Pasar la hipótesis por `normalizeSpeech` + pliegue + `matchPair`, comparar con el juicio del adulto | **La métrica decisiva** |
| **Falsos positivos de contraste** | Casos donde el niño falló y el motor "arregló" la palabra | El riesgo R1 |
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
El perfil de hardware de referencia es el del piloto: **Android de gama
media/media-alta en LATAM**, según `plan-integracion-rehabilitacion-ar.md` §3.4.

### 4.6 B.5 · Integración mínima (solo si la etapa 2 pasa)

Detrás de `asrSupported()`, como capacidad **opcional** que degrada a la Fase A,
exactamente igual que el bloque de RA degrada a la sobreimpresión 2D. El modelo se
descargaría bajo demanda con verificación SHA-256, extendiendo
`scripts/fetch-ar-model.js` en lugar de crear un pipeline paralelo.

**No se escribe una línea de esta integración antes de tener la tabla de §4.5.**

### 4.7 B.6 · Criterios GO / NO-GO

**GO** si, y solo si, **todos**:

- Acierto de veredicto **≥ el de la línea base**, con margen ≤ 2 puntos por debajo como tolerancia.
- Falsos positivos de contraste **no superiores** a la línea base.
- Latencia, RAM y tamaño dentro de §4.5.
- Existe un candidato que cumpla lo anterior **por debajo de 150 MB**.

**NO-GO** en cuanto falle uno. Y el NO-GO es un resultado perfectamente bueno:
significa que la Fase A ya resolvió el problema de privacidad al coste correcto, y
se documenta con las cifras para no volver a abrir el debate sin datos nuevos
—igual que hizo `asr-euskera-ilenia.md`.

---

## 5. Fuera de alcance (explícito)

Para que no se cuele por la puerta de atrás:

- **Migración a la Nueva Arquitectura.** `newArchEnabled` sigue en `false`. Si algún
  día hace falta, es un proyecto propio con su propio plan y su propio riesgo sobre
  el módulo `valeria-ar`.
- **TurboModules / JSI / C++ propio.** No hay ninguna evidencia de que la
  serialización del puente sea el cuello de botella; el cuello de botella es la
  inferencia. Optimizar el puente antes de medir la inferencia es orden inverso.
- **Modelos de 230 MB o más** sin haber pasado §4.7.
- **Sesgar el reconocedor** hacia la palabra objetivo (§3.4).
- **Cualquier veredicto automático.** El adulto sigue siendo el juez (§1.3).
- **Un modal de validación nuevo.** Ya existe y funciona.
- **iOS como requisito.** Se aborda en la Fase A porque la librería nueva lo
  facilita; no bloquea nada.

---

## 6. Riesgos y mitigaciones

| # | Riesgo | Prob. | Impacto | Mitigación |
| --- | --- | --- | --- | --- |
| R1 | El motor "arregla" la palabra mal pronunciada y destruye el contraste clínico | Media | **Crítico** | Métrica principal de §4.5; corpus con producciones erróneas reales (§4.2); CTC antes que Whisper (§4.4); prohibición de biasing (§3.4) |
| R2 | Una opción se da por implementada sin estarlo (como §2.2) | Media | Alto | Verificación de nivel 3 (§3.5); nada se cierra sin inspección de tráfico |
| R3 | El reconocimiento local degrada y aumentan los falsos `noMatch` | Media | Alto | Umbral de §3.6; política de degradación por locale (§3.3); se puede dejar apagado por defecto |
| R4 | ~~No se consigue consentimiento~~ → **Resuelto** (§4.2) | — | — | Consentimiento listo, firma en papel el día de la grabación |
| R5 | La librería nueva se abandona o rompe | Baja | Medio | Superficie encapsulada en `valeriaVoice.ts`; volver atrás es un cambio de un archivo. Rebajado: la instalada es `3.1.3`, no una pre-1.0 (§3.1) |
| R6 | `react-native-sherpa-onnx-stt` está en v0.2.2, muy temprana | Alta | Medio | Solo afecta a la Fase B, que es un experimento; si no sirve, se mide con el binario nativo de sherpa-onnx |
| R7 | El corpus de audio infantil se filtra al repositorio | Baja | **Crítico** | `.gitignore` explícito + comprobación en CI; nunca en `site/`; seudonimización (§4.2) |
| R8 | La migración rompe un ejercicio en producción | Media | Alto | El contrato de `startListening`/`matchPair` no cambia; los tres ejercicios son criterio de aceptación (§3.6) |
| **R9** | **La traducción de `NO_MATCH_CODES` se hace mal y rompe ES-04** | **Media** | **Alto** | Tabla de traducción explícita + verificación manual de ambos casos antes de cerrar (§3.2) |
| **R10** | **`gl`/`eu` se degradan al forzar local por no tener paquete de idioma** | **Alta** | **Medio** | Política por locale (§3.3); la promesa pública se redacta por variedad (§7) |
| **R11** | **Una familia declina firmar el día de la grabación** | Media | Bajo | Previsto en §4.2: sesión normal sin grabación, sin presión implícita |

---

## 7. Impacto regulatorio

Regla del proyecto (`CLAUDE.md`): **cuando cambia lo que la app recoge, la política
de `site/` y el formulario de *Seguridad de los datos* de Play Console se
actualizan en el mismo cambio.** Google contrasta ambas declaraciones.

| Momento | Qué hay que actualizar |
| --- | --- |
| **Fase A entra** | ✅ **Hecho el 2026-08-04** en `privacidad.html` y `privacy.html`: §3.3 (fila del reconocedor), el recuadro de grabaciones de voz —reescrito en cuatro párrafos: qué no se guarda, dónde se reconoce, qué pasa cuando no se puede, y que la app lo muestra— y el §5, donde el reconocedor pasa a ser destinatario **solo cuando el reconocimiento no puede hacerse en el dispositivo**. Las respuestas de *Seguridad de los datos* están escritas en el README; **falta trasladarlas a la consola** |
| **Fase B, corpus** | **No toca la política pública**: es una build de desarrollo, no de producción. Sí exige el consentimiento en papel y las reglas de §4.2 |
| **Fase B, si GO** | Declarar la descarga del modelo; revisar el tamaño de la app en la ficha; confirmar que se elimina la salida de audio |
| **En ambos casos** | El correo de contacto es y sigue siendo `frank.alberto.betances.reinoso@gmail.com` |

> ⚠️ **Cuidado con la redacción.** Por §3.3 el resultado esperado es **mixto**:
> castellano probablemente en local, gallego y euskera probablemente en red.
> **No se puede escribir "el reconocimiento se hace siempre en el dispositivo"** —
> sería una declaración falsa ante Play y ante las familias. La política tiene que
> decir con precisión que depende del dispositivo y de la variedad, y que la app lo
> indica.

**Marco MDR:** ninguna de las dos fases altera la clasificación. El motor propone
hipótesis; el adulto decide. Ese es el argumento que sostiene la Clase I y no se
toca.

---

## 8. Decisiones

### Cerradas

| # | Decisión | Resultado | Fecha |
| --- | --- | --- | --- |
| **D1** | Mecanismo de la Fase A | **Migrar a `expo-speech-recognition@3.1.3`** (§3.1). Ejecutado. El riesgo pre-1.0 que se aceptó resultó no existir: la librería decidida estaba deprecada y su sucesora mantenida ya va por 3.x | 2026-08-03 |
| **D3** | Consentimiento del corpus | **Listo**, firma en papel el día de la grabación (§4.2). Desbloquea la Fase B y permite validar la Fase A con rigor | 2026-08-03 |
| **D2** | ¿Ofrecer la descarga del paquete de idioma? | **Sí, una vez y de forma explícita** (§3.3). Sin ofrecerla, castellano se quedaría en red en todos los móviles que no traigan el paquete de fábrica y la Fase A se perdería en el 90 % de los casos por un motivo evitable. Si el adulto declina, se recuerda por variedad y no se vuelve a insistir | 2026-08-04 |

### Abiertas

| # | Decisión | Quién | Bloquea |
| --- | --- | --- | --- |
| **D6** | **Umbral clínico**: ¿cuántos `noMatch` de más por sesión son tolerables? (§3.6) | ACOPROS | **Cerrar** la Fase A. No impide empezar |
| D4 | ¿Local por defecto, o *opt-in* del adulto? | Tras los datos de §3.6 | Cierre de la Fase A |
| D5 | ¿Se lanza la Fase B aunque la Fase A cumpla holgadamente? | Frank, con datos de A | Arranque de la Fase B |

**D5 merece una nota:** si la Fase A consigue la verificación de nivel 3 en la
mayoría de dispositivos del piloto, el problema de privacidad está resuelto y la
Fase B pasa a ser una mejora de *cobertura* (dispositivos y variedades sin paquete
local), no de privacidad. Eso baja mucho su prioridad. Conviene decidirlo con los
datos de A delante y no antes.

---

## 9. Seguimiento

### Fase A

- [x] **D1 · mecanismo decidido** → migrar a `@jamsch/expo-speech-recognition`
- [x] Sustituir la dependencia (`package.json`, `app.json`, retirar `withJetifier` y `withSpeechRecognitionQueries`)
- [x] Reescribir el bloque ASR de `valeriaVoice.ts` conservando ES-04 y el contrato
- [x] Traducir `NO_MATCH_CODES` con tabla explícita — ⏳ **falta verificar ambos casos a mano en dispositivo** (R9)
- [x] Implementar la política de degradación **por locale** (§3.3)
- [x] Añadir `asrOfflineStatus()` y la telemetría de modo
- [x] **D2 · ofrecer la descarga del paquete**, una vez y explícita (§3.3)
- [x] Bloque del adulto con el modo por variedad, el motivo y la oferta (`SpeechPrivacyBlock`)
- [x] Actualizar `privacidad.html` y `privacy.html` — redacción **por variedad**, sin promesa global (§7)
- [x] Dejar escritas las respuestas de *Seguridad de los datos* de Play en el README (§7)
- [ ] **Trasladar esas respuestas al formulario de Play Console** — trabajo de consola, no de repositorio
- [ ] Verificación de niveles 1 y 2 durante el desarrollo (§3.5) — el bloque del adulto ya muestra lo que hace falta mirar
- [ ] **Verificación de nivel 3 (tráfico de red)** en ≥ 2 dispositivos
- [ ] Medir degradación de `noMatch` y de veredicto contra la línea base
- [ ] Verificar los tres ejercicios sin regresión
- [ ] **D6 · fijar el umbral clínico con ACOPROS**
- [ ] Puerta §3.6

### Fase B

- [x] **D3 · consentimiento resuelto** (firma en papel el día de la grabación)
- [ ] Preparar la build de desarrollo con `recordingOptions.persist` + `.gitignore` + comprobación en CI
- [ ] Sesión de grabación: firma previa, seudonimización, plan para quien declina
- [ ] Etiquetar el corpus con el juicio del adulto (§4.3)
- [ ] Script de banco de medida en escritorio (`scripts/`)
- [ ] Evaluar candidatos 0–3 en escritorio, **CTC primero** (§4.4)
- [ ] Llevar los supervivientes a dispositivo (§4.5 etapa 2)
- [ ] Redactar la tabla de resultados
- [ ] **Puerta GO/NO-GO** (§4.7) — y documentar el resultado sea cual sea

---

> **Nota de método.** Este plan nace de auditar una propuesta que declaraba
> "CUMPLIDO (100 %)" en cinco criterios de un sistema que nunca se había compilado,
> apoyada en un modelo que no existe. La lección está incorporada a propósito: aquí
> **nada se da por cumplido sin una medición de dispositivo**, y las dos fases
> terminan en una puerta con umbrales fijados de antemano. La revisión del propio
> plan (2026-08-03) corrigió tres errores nuestros —la palanca equivocada, una
> verificación insuficiente y un orden de candidatos que ignoraba el sesgo de
> Whisper— y dejó marcados en amarillo los umbrales que aún son inventados. Un
> NO-GO documentado con cifras vale más que un GO sin ellas.
