# Formulario de *Seguridad de los datos* · Google Play Console

**Ruta en Play Console:** *Política de la app → Contenido de la app → Seguridad de los datos*.
Fecha de esta revisión: **7 de septiembre de 2026** · app `eu.futureforkids.valeria` **3.0.0**.

Este documento es la **fuente de verdad** de lo que se marca en ese formulario, con la
prueba de código al lado de cada respuesta. Google contrasta el formulario contra
`site/privacidad.html`, así que las dos declaraciones se editan siempre juntas
(regla fija de `CLAUDE.md`). El gate `scripts/check-data-safety-declaration.js`
rompe el build cuando el código se aleja de lo que aquí se declara.

---

## 0. Respuestas, para copiar

| Pregunta del formulario | Respuesta |
| --- | --- |
| ¿Tu app recopila o comparte alguno de los tipos de datos de usuario obligatorios? | **Sí** |
| Tipos declarados | **Audio → Grabaciones de voz o sonido**, y ninguno más |
| ¿Se recopilan? / ¿Se comparten? | Recopilados: **Sí** · Compartidos: **Sí** |
| ¿Se procesan de forma efímera? | **Sí** |
| ¿Son obligatorios u opcionales? | **Opcional** (el usuario puede denegar el micrófono) |
| Finalidad | **Funciones de la app** (solo esa) |
| ¿Todos los datos recopilados se cifran en tránsito? | **Sí** |
| ¿Ofreces una forma de solicitar la eliminación de los datos? | **Sí** → `https://frankbetances.github.io/Valeria/eliminacion-de-datos.html` |
| ¿Se han sometido las prácticas a una validación de seguridad independiente (MASA)? | **No** |
| URL de la política de privacidad | `https://frankbetances.github.io/Valeria/privacidad.html` |

Todo lo demás —nombre, correo, teléfono, datos de salud, actividad en la app,
identificadores, fotos y vídeos, registros de fallos— se marca **no recopilado**,
porque no sale del dispositivo. El apartado 3 lo justifica uno a uno.

---

## 1. Qué hace el código hoy (hechos, con el comando que los comprueba)

| Hecho | Comprobado con |
| --- | --- |
| La app **no hace ni una llamada de red propia**: cero `fetch`, cero `XMLHttpRequest`, cero WebView | `grep -rn "fetch(\|XMLHttpRequest\|WebView" src App.tsx --include=*.ts --include=*.tsx` → solo tres `Linking.openURL` (mailto de contacto y ficha de Play de la voz de Google) |
| **No hay ni un SDK de terceros con recorrido de datos.** Firebase se retiró entero el 7/9/2026; no hay analítica, ni *crash reporting*, ni publicidad, ni AAID | `node -e "console.log(Object.keys(require('./package.json').dependencies))"` → 19 dependencias, ninguna de red ni de medición |
| Permisos declarados: `CAMERA` (RA), micrófono + reconocimiento de voz (plugin `expo-speech-recognition`), notificaciones (`expo-notifications`) | `app.json` → `expo.android.permissions` y `expo.plugins` |
| Las notificaciones son **locales**: `scheduleNotificationAsync` con disparador diario. No se pide token de push, no hay FCM saliente | `grep -rn "getExpoPushToken\|getDevicePushToken" src` → vacío |
| La cámara de RA **no guarda ni envía fotogramas**: el módulo nativo mide y renderiza; a JS solo llegan números | `src/ValeriaArLauncherScreen.tsx` (cabecera) + gates `check-ar-bridge-contract.js`, `verify-ar-clinical-math.js` |
| La captura de audio a disco **no puede existir en release** | `src/valeriaVoice.ts:934` → `const ASR_CAPTURE = __DEV__ && process.env.EXPO_PUBLIC_ASR_CAPTURE === '1';` + gate `check-asr-capture-guard.js` |
| La telemetría del piloto se cifra en reposo y **solo sale por el menú de compartir de Android**, a iniciativa del adulto | `src/valeriaTelemetry.ts` → `encryptJSON` en cada escritura; salida por `Share` |
| **La sincronización en la nube no es alcanzable en esta versión** | apartado 2 |

## 2. La app no tiene backend

Hasta el 7 de septiembre de 2026 el repositorio traía Firebase cableado —`firebase` 12.x,
`AuthProvider` montado en `AppNavigator`, `src/firebase/firestoreService.ts` con siete
funciones— y la política describía en §3.2 una sincronización profesional en la nube.
La auditoría del 6/9 encontró que **nada de eso era alcanzable**: `ValeriaAuthScreen` no
lo importaba nadie, así que no entraba siquiera en el bundle, y ninguna de las siete
funciones de Firestore tenía una sola llamada.

**Frank decidió el 7/9 retirarlo.** Ya no queda:

| Qué se fue | Dónde estaba |
| --- | --- |
| `firebase` 12.x | `package.json` → `dependencies` (y 837 líneas del `package-lock.json`) |
| `AuthProvider`, `AuthContext`, `firestoreService`, `firebaseApp`, `firebaseConfig` | `src/firebase/` (directorio eliminado) |
| La pantalla de acceso profesional | `src/ValeriaAuthScreen.tsx` |
| Las reglas y la config del proyecto | `firestore.rules`, `firebase.json`, `.firebaserc` |
| Las variables `EXPO_PUBLIC_FIREBASE_*` | `.env.example` y `android.yml` (env y paso de aviso) |
| `FirebaseCore`, **`FirebaseAnalytics`** y **`FirebaseCrashlytics`** | el port iOS: `ios-native/Valeria.xcodeproj` y `ValeriaApp.swift` |

Esa última fila es la que más cambiaba la declaración: el host de iOS enlazaba
**analítica y notificación de caídas** de verdad, no un servicio latente. Ya no.

**La app no tiene ningún backend.** No hay servidor propio, ni cuentas, ni sincronización,
ni SDK de terceros con recorrido de datos. La ficha del paciente, el historial de sesiones,
la telemetría del piloto y las medidas de RA viven en AsyncStorage y desaparecen al
desinstalar. Comprobado con `grep -rn "fetch(\|XMLHttpRequest\|WebView" src App.tsx`,
que no devuelve ni una llamada, y con el gate `check-data-safety-declaration.js`, que
falla si aparece alguna.

**Inferencia, no medición:** de ahí se sigue que la app no emite tráfico propio. Lo
concluyente sería una captura de red del APK de release, y no se ha hecho.

---

## 3. Respuestas del formulario, tipo por tipo

### 3.1 Audio → Grabaciones de voz o sonido — **el único tipo que se declara**

- **Recopilados: Sí. Compartidos: Sí. Procesados de forma efímera: Sí.
  Opcional. Finalidad: funciones de la app.**

El motivo es el reconocimiento del habla. La app pide reconocimiento **en el
dispositivo** (`requiresOnDeviceRecognition`, `src/valeriaVoice.ts:1165`), pero eso
depende de dos cosas que no controla: que el teléfono sepa reconocer sin conexión y
que el paquete de esa variedad esté descargado. En gallego y en euskera lo normal es
que no lo esté. Cuando no lo está, el turno de habla del menor va al reconocedor del
sistema —habitualmente Google— que **puede procesarlo en sus servidores**. La app
enseña en todo momento cuál de los dos modos está activo (`asrOfflineStatus()`,
tarjeta «Voz de la app»).

- *Efímero*, porque la app no guarda ni un archivo de audio: solo conserva el
  veredicto (acierto/error). La única ruta que escribía WAV está tras `__DEV__` y
  la vigila `check-asr-capture-guard.js`.
- *Compartido*, porque en modo red el audio llega a un tercero ajeno al proyecto.
  Es exactamente lo que ya dicen §3.3 y §5 de la política, así que declararlo
  mantiene las dos declaraciones alineadas.
- *Opcional*, porque denegar el micrófono no rompe la app: los ejercicios de voz se
  puntúan a mano y los otros bloques funcionan igual.

**Esto es un criterio, no una certeza sobre las reglas de Google.** Cabe defender lo
contrario —que entregar audio a un componente del sistema operativo no es
«recopilación» de la app—, y entonces el formulario entero sería «no se recopilan
datos». Se declara de más a propósito: en una app de salud infantil, quedarse corto
es el error caro, y declarar de más no penaliza.

### 3.2 Información personal (nombre, correo, teléfono, ID de usuario) — **no recopilada**

Nombre del menor, fecha de nacimiento, NHC, sexo, tutor y vínculo, correo y teléfono
de contacto, patología, médico y logopeda: los introduce el adulto y se quedan en
AsyncStorage. Ni se transmiten ni existe backend al que subirlos (apartado 2). No hay
identificador de usuario porque no hay usuarios: no hay registro ni acceso.

### 3.3 Información de salud — **no recopilada**

Patología, resultados por fonema, historial de sesiones, medidas de RA y registro
sensorial: todo local. Salen del teléfono **solo** si el adulto pulsa «Exportar» y
elige él mismo el destinatario en el menú de compartir de Android. Una transferencia
que inicia y dirige la persona usuaria a través del selector del sistema no es
recopilación por parte de la app.

### 3.4 Fotos y vídeos — **no recopiladas**

El permiso de cámara está, pero la RA no produce ni un fichero: cada fotograma se
analiza y se libera; solo persisten magnitudes (grados, milisegundos, proporciones).
No hay identificación biométrica: se miden gestos, no identidades. Las tres
restricciones están escritas en la política y sostenidas por los cuatro gates de RA.

### 3.5 Actividad en la app — **no recopilada**

La telemetría de usabilidad del piloto (tiempo por pantalla, toques sin efecto,
abandonos, SUS) se cifra en reposo con `valeriaCrypto` y no viaja a ningún servidor;
se purga tras una exportación correcta.

### 3.6 Registros de fallos y diagnósticos — **no recopilados**

No hay SDK de *crash reporting*. Los informes que Play recoge por su cuenta (Android
vitals) son de Google y no se declaran aquí.

### 3.7 Identificadores del dispositivo — **no recopilados**

Sin AAID, sin `com.google.android.gms.permission.AD_ID`, sin publicidad. La ficha
técnica del teléfono que guarda RA (marca, modelo, versión de Android, fps, mm de
pantalla) no identifica el aparato y no sale de él.

---

## 4. Prácticas de seguridad

- **Cifrado en tránsito: Sí.** No hay tráfico en claro originado por la app; el
  único envío declarado —el audio en modo red— viaja por el canal propio del
  reconocedor del sistema, que usa TLS. *Dato por verificar:* ese canal es de
  Google, no del proyecto, y no se ha medido desde aquí.
- **Eliminación de datos: Sí**, con URL. La página de eliminación explica el borrado
  local (desinstalar o borrar datos desde Ajustes de Android) y el correo de
  contacto para ejercer derechos.
- **Familias.** La app no lleva publicidad, ni compras integradas, ni contenido de
  otros usuarios, ni funciones sociales. Eso se responde en *Público objetivo y
  contenido*, no aquí, pero conviene que lo diga la misma persona el mismo día.
- **Acceso a la app** (la sección donde se dan credenciales al revisor): responder
  que **no hacen falta**: la app no tiene inicio de sesión. Es cierto desde el apartado 2 y evita el rechazo por
  «funcionalidad no accesible para el revisor». Lo que sí conviene anotar en las
  instrucciones para el revisor es que el panel del adulto está tras un PIN que el
  propio adulto fija en el primer arranque.

---

## 5. Qué obliga a volver a este documento

`scripts/check-data-safety-declaration.js` (gate 33 de `android.yml`) rompe el build
cuando cambia algo que obligaría a repasar el formulario:

1. **Un campo nuevo en la ficha del paciente** que no esté en la lista de este
   documento (§3.2).
2. **Un permiso nuevo** en `app.json` que no esté declarado en §1.
3. **Una dependencia nueva** en `package.json` fuera de la lista conocida —es el
   caso «SDK de terceros» que la regla de `CLAUDE.md` nombra explícitamente.
4. **Una llamada de red propia** (`fetch`, `XMLHttpRequest`, `WebView`) en
   cualquier parte de `src/`. Hoy no hay ninguna.
5. **La vuelta de un backend**: en cuanto reaparezca `src/firebase/`, un import de
   `firebase` o una dependencia de nube, el gate falla y pide invertir la
   declaración del apartado 2. Si alguna vez se cablea una sincronización, el
   formulario pasa a declarar *Nombre*, *Correo electrónico*, *Teléfono*,
   *Información de salud* y *Actividad en la app* como recopilados, y hay que
   reescribir §3.1 y §3.2 de las dos políticas antes de publicar esa versión.
6. **Coherencia de versión** entre `app.json`, las dos políticas y este documento.

## 6. Pendiente y riesgos conocidos

- **La ficha del paciente se guarda en claro.** `ValeriaFichaRegistroScreen.tsx:95`
  escribe `JSON.stringify(...)` directo en AsyncStorage, aunque la cabecera del
  fichero (línea 4) diga «persistencia local cifrada». La telemetría sí usa
  `encryptJSON`; la ficha —nombre, NHC, patología, correo y teléfono del tutor, el
  dato más sensible de la app— no. No afecta al formulario (Play pregunta por lo que
  sale del dispositivo, no por el reposo local) ni contradice §8 de la política, que
  solo promete cifrado para la telemetría. **Sí es una deuda real y barata de saldar**:
  `encryptJSON`/`decryptJSON` ya existen y el cambio es de dos líneas más una
  migración que lea el formato antiguo. No se toca aquí porque una migración mal
  hecha borra fichas de instalaciones existentes, y eso merece su propio cambio.
- **La inferencia del apartado 2 no está medida.** Falta una captura de tráfico del
  APK de release para elevar «la app no abre conexiones propias» de inferencia a hecho.
- **No hay borrado de una ficha suelta.** Sin nube, el único camino para atender una
  petición de supresión individual es borrar los datos de la App enteros. La página de
  eliminación lo dice con esas palabras; un botón de borrado por ficha en la pantalla de
  Pacientes lo resolvería y es trabajo pequeño.
- Este documento no se ha contrastado con el texto vigente del formulario en Play
  Console: los nombres de las preguntas salen de la última vez que se rellenó y
  Google los reescribe de vez en cuando. Si alguna etiqueta no coincide, manda la
  pantalla y se corrige aquí.
