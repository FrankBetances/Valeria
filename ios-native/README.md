# Valeria+ · Port nativo iOS (SwiftUI)

Esqueleto nativo para **evaluar usabilidad en dispositivos físicos** vía
**Firebase App Distribution**. Prioridad: velocidad de iteración visual.

Convive con el proyecto React Native/Expo de la raíz sin interferir con él.

## Estructura

```
ios-native/
├── Valeria.xcodeproj/          # project.pbxproj (índice del compilador)
│   ├── project.pbxproj
│   ├── project.xcworkspace/    # resolución de paquetes SPM
│   └── xcshareddata/xcschemes/ # esquema compartido (CI / App Distribution)
├── Config/                     # firma y opciones de exportación (ver al final)
├── scripts/
│   ├── preflight.sh            # ¿le falta algo a este clon para compilar?
│   ├── team-id.sh              # averigua el Team ID y escribe la firma local
│   └── archive.sh              # archive + export del .ipa
└── Valeria/
    ├── ValeriaApp.swift        # @main + init defensiva de Firebase
    ├── RootView.swift          # NavigationStack + Router (flujo completo)
    ├── Theme.swift             # tokens de diseño (port de valeriaTheme.ts)
    ├── BearMark.swift          # mascota oso (SVG → Canvas SwiftUI)
    ├── AppModel.swift          # estado en memoria + gamificación (sample data)
    ├── ProPin.swift            # modal PIN profesional (SHA-256 · demo 1985)
    ├── WelcomeView / CreditsView / PatientSelectView / FichaRegistroView.swift
    ├── ExerciseSelectionView / LingTestView / ExercisePlayerView.swift
    ├── MinimalPairsView / SemanticExpansionView / ResultsDashboardView.swift
    ├── AcademyContent.swift    # contenido/tipos de Academy (dominios, cápsulas, hardware)
    ├── AcademyView.swift       # hub/lista/lectura/quiz + feed de prioridad
    ├── AcademyHardwareView.swift # sheet de Hipoacusia + esquemas (SVG → Canvas)
    ├── Info.plist
    ├── Assets.xcassets/        # AppIcon 1024² (sin alfa) + AccentColor (#00c4be)
    └── Preview Content/
```

## Pantallas portadas (flujo nativo)

Port del flujo RN completo con fidelidad visual, pensado para iterar usabilidad
en device. `RootView` reproduce el stack del `AppNavigator`:

`Welcome → Credits → (PatientSelect | Ficha) → ExerciseSelection → LingTest →
ExercisePlayer → Results`, más los bloques `MinimalPairs`, `SemanticExpansion`
y `Academy` (hub multidominio de formación del cuidador: Lenguaje, Hipoacusia,
Dislalias, Dislexia y TEA, con gamificación vectorial por dominio en memoria).

La persistencia cifrada (AsyncStorage), el motor de voz (TTS/STT) y los datasets
completos del proyecto RN se sustituyen por estado en memoria y datos de muestra
(`AppModel`): la app es navegable de punta a punta sin backend. El tutor hace de
juez en los ejercicios de voz (como en el fallback sin micrófono del original).

### ⚠️ No usar este port para validación clínica

Es un demostrador de navegación y estética. Las mejoras que ACOPROS validó en
julio de 2026 **viven en el proyecto React Native**, no aquí: antesala de
preparación antes de la tarea (ES-11), vuelta de comprensión por selección de
imagen (ES-12), pictogramas propios (ES-09), ventana de escucha ampliada (ES-04)
y franjas de recordatorio configurables (GEN-01).

Lo que sí es innegociable es que la muestra de contenido de este port **no
contradiga** las decisiones clínicas ya tomadas: hasta julio de 2026 mostraba una
fase de onomatopeya que DC-2 había retirado y un contraste de elefante contra
hormiga que ES-13 prohíbe. Lo que se ve en un dispositivo se toma por lo que hace
la app. Al tocar `SemanticExpansionView` o `MinimalPairsView`, contrastar con
`docs/plan-mejoras-acopros-logopedas.json`.

## Dependencias: Swift Package Manager, **sin CocoaPods**

Inyectadas en `project.pbxproj` → `firebase-ios-sdk` (upToNextMajor `11.0.0`):

- `FirebaseCore` · `FirebaseAnalytics` · `FirebaseCrashlytics`

Xcode las resuelve automáticamente al abrir el proyecto.

**No hay ni una sola dependencia de CocoaPods en el repositorio**: no existe
`Podfile`, ni `Podfile.lock`, ni `.podspec`, ni `Pods/`, ni ningún
`.xcworkspace` generado por Pods. El único `project.xcworkspace` que hay es el
que Xcode crea dentro del `.xcodeproj` para guardar la resolución de paquetes
SPM, que es otra cosa.

Consecuencia práctica para exportar: **se abre y se compila el `.xcodeproj`
directamente**, y `xcodebuild` recibe `-project`, no `-workspace`. No hay ningún
`pod install` que ejecutar antes, ni un `Pods` que se desincronice.

> La entrada `Pods/` de `.gitignore` es preventiva —dice literalmente «por si se
> usa flujo híbrido»—, no la huella de un CocoaPods ya instalado.

### El proyecto RN de la raíz es otra historia

Conviene no mezclarlos, porque la respuesta cambia:

| | `ios-native/` (este port) | Proyecto RN/Expo de la raíz |
| --- | --- | --- |
| Gestor de dependencias nativas | SPM | CocoaPods (lo genera Expo) |
| ¿Hay carpeta `ios/` versionada? | N/A | No: `.gitignore` la excluye |
| Cómo se exporta hoy | `xcodebuild` sobre el `.xcodeproj` | EAS Build (`eas.json`) |

El proyecto de la raíz usa el **flujo gestionado** de Expo: no versiona la
carpeta `ios/`, así que tampoco versiona su `Podfile`. Eso no significa que no
use CocoaPods —React Native lo usa—, sino que el `Podfile` y el `pod install`
los genera y ejecuta el propio Expo, en la máquina de EAS Build o al hacer un
`npx expo prebuild` local. Es decir: hoy **nada del repositorio depende de que
tengas CocoaPods instalado**, pero en el momento en que se saque la app RN por
Xcode en vez de por EAS, aparecerá un `ios/Valeria.xcworkspace` con Pods y ahí
sí habrá que abrir el *workspace* y no el *project*.

Las dos vías de exportación iOS que existen ahora mismo, por tanto:

1. **Port nativo SwiftUI** (esta carpeta) → `scripts/archive.sh`, SPM, sin Pods.
   Es un demostrador de navegación y estética; **no** es la app clínica.
2. **App React Native** (la real, la de ACOPROS) → `eas build --platform ios`,
   que ya resuelve firma y Pods en la nube sin tocar Xcode.

## Compilar tras clonar el repositorio

```bash
git clone https://github.com/FrankBetances/Valeria.git
cd Valeria/ios-native
./scripts/preflight.sh          # comprueba que no falta nada (segundos)
open Valeria.xcodeproj          # esquema Valeria · ⌘R
```

**Se abre `ios-native/Valeria.xcodeproj`, no la carpeta raíz del repositorio.**
En la raíz no hay ningún proyecto de Xcode: vive la app React Native, que se
compila con Expo/EAS y no por Xcode (ver más abajo). Si clonas desde el propio
Xcode (*Integrate → Clone*), al terminar navega hasta `ios-native/` y abre el
`.xcodeproj` desde ahí.

`preflight.sh` responde a la única pregunta que importa al clonar: ¿le falta
algo a esta copia? Comprueba la versión de Xcode, que todos los `.swift` estén
registrados en el `pbxproj`, el icono, el Team ID y las credenciales de
Firebase, y cada aviso dice qué hacer. Con `--build` compila además para
simulador, que es la respuesta definitiva:

```bash
./scripts/preflight.sh --build
```

### Qué pasa la primera vez que abres el proyecto

Xcode resuelve los paquetes Swift (Firebase y sus dependencias) al abrir. Tarda
varios minutos y **necesita conexión**; hasta que termina, el editor marca
errores falsos de «no such module FirebaseCore». No es un fallo: hay que
esperar a que la barra de progreso de *Package Dependencies* acabe. Si se
atasca, *File → Packages → Reset Package Caches*.

Al terminar, Xcode escribe un `Package.resolved` con las versiones exactas.
**Vale la pena versionarlo** (`git add` en
`Valeria.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`):
a partir de ahí todo el mundo compila contra las mismas versiones de Firebase
en vez de contra «la última 11.x que hubiera ese día». No está en el
repositorio todavía porque solo lo puede generar Xcode.

### Sin cuenta de Apple Developer

El **simulador** funciona sin nada más: no hace falta Team ID ni firma. Es
suficiente para revisar la navegación y la estética, que es para lo que existe
este port.

## Compilar con cuenta gratuita (Personal Team)

Una cuenta gratuita —tu Apple ID, sin pagar los 99 €/año— **sirve para compilar
y ejecutar en tu propio iPhone o iPad**. Este proyecto no usa ninguna capacidad
de las que requieren cuenta de pago (sin push, sin App Groups, sin dominios
asociados: no hay ni un `.entitlements`), así que compila entero.

### Puesta a punto

1. En Xcode, *Settings (⌘,) → Accounts → +* y añade tu Apple ID. Aparecerá un
   equipo llamado **(Personal Team)**.
2. Abre `Valeria.xcodeproj`, pestaña *Signing & Capabilities*, y elige ese
   equipo una vez: es lo que hace que Xcode genere el certificado de firma.
3. Deja la configuración local escrita:

   ```bash
   ./scripts/team-id.sh --write
   ```

4. Conecta el dispositivo, elígelo arriba en Xcode y ⌘R.

La primera vez, el iPhone o iPad pedirá confiar en el certificado:
*Ajustes → General → VPN y gestión de dispositivos → tu Apple ID → Confiar*.

> **El Team ID no es tu correo.** `DEVELOPMENT_TEAM` lleva un código de 10
> caracteres (tipo `A1B2C3D4E5`) que Apple asigna a la cuenta. Con cuenta
> gratuita no aparece en `developer.apple.com` —esa web es del programa de
> pago—, así que hay que leerlo del Mac: eso es lo que hace `team-id.sh`, que lo
> saca del campo **OU** del certificado de firma.
>
> Cuidado con una confusión fácil: el certificado se llama
> `Apple Development: tu@correo (XXXXXXXXXX)`, y **ese código entre paréntesis
> no es el Team ID**, es el identificador del propio certificado. Por eso el
> script lee el OU y no el nombre.
>
> Si tienes más de un equipo (el personal y el de la organización), el script
> los lista pero no elige: firmar con el equipo equivocado da errores de
> identificador que cuesta relacionar con la causa.

### Si Xcode dice que el identificador no está disponible

> Failed to register bundle identifier. The app identifier
> "health.earlify.valeria" cannot be registered to your development team
> because it is not available.

No es un fallo del proyecto: ese identificador solo puede registrarlo un equipo,
y si ya lo tiene la cuenta de la organización, tu cuenta personal no puede
reutilizarlo. Descomenta esta línea en `Config/Signing.local.xcconfig` con un
nombre propio y listo:

```
VALERIA_BUNDLE_ID = health.earlify.valeria.fbr
```

Al vivir en el archivo local sin versionar, **tu identificador de pruebas no
cambia el que se publica**.

### Los tres límites que vas a notar

| | Cuenta gratuita | Cuenta de pago |
| --- | --- | --- |
| Simulador | ✅ | ✅ |
| Tu propio dispositivo | ✅ | ✅ |
| Duración de la firma | **7 días** | 1 año |
| App Distribution / TestFlight | ❌ | ✅ |
| App Store | ❌ | ✅ |

- **Caducidad a los 7 días.** Pasado ese plazo la app deja de abrirse en el
  dispositivo y hay que reinstalarla desde Xcode. Es la limitación que más
  molesta si quieres dejar el iPad en manos de una logopeda una semana larga.
- **Límite de identificadores**: 10 App IDs nuevos por cada 7 días, y hasta 3
  apps de cuenta gratuita instaladas a la vez en un dispositivo.
- **Nada de distribución.** `./scripts/archive.sh adhoc` y `appstore` fallarán:
  necesitan un certificado de distribución que solo emite el programa de pago.
  El script lo detecta y te lo dice en vez de dejar un error de firma críptico.
  Lo que sí funciona:

  ```bash
  ./scripts/archive.sh dev     # .ipa de desarrollo, también con firma de 7 días
  ```

  Aunque para probar en tu propio dispositivo no hace falta ni eso: ⌘R basta.

> Si en algún momento hay que poner la app en manos de varias logopedas para el
> piloto, ahí sí toca el Apple Developer Program: es el único camino a
> TestFlight y a Firebase App Distribution. Todo lo demás del proyecto ya está
> preparado para ese día (`ExportOptions`, `archive.sh`, numeración de builds).

## Paso manual pendiente: credenciales Firebase

1. Descarga `GoogleService-Info.plist` desde la consola de Firebase.
2. Arrástralo al grupo **Valeria** en Xcode (marca *Copy items if needed* y
   añádelo al target **Valeria**). Xcode lo registrará en `project.pbxproj`.
3. Está en `.gitignore` a propósito — no se versiona.

`FirebaseApp.configure()` se ejecuta de forma **defensiva**: si el plist no
está presente, la app arranca igual (modo iteración visual) sin crashear.

## Exportar (archive → `.ipa`)

### 1. Team ID de Apple Developer

El proyecto firma en modo automático, pero el equipo no va escrito en el
`project.pbxproj`: se resuelve desde `Config/Signing.xcconfig`, que es la
configuración base de las dos configuraciones del target. Dos vías:

```bash
# Local (cómodo para trabajar desde Xcode): se escribe una vez.
cp Config/Signing.local.xcconfig.example Config/Signing.local.xcconfig
$EDITOR Config/Signing.local.xcconfig     # DEVELOPMENT_TEAM = tu Team ID

# CI o build puntual: sin archivo local.
xcodebuild ... VALERIA_DEVELOPMENT_TEAM=ABCDE12345
```

`Signing.local.xcconfig` está en `.gitignore`. Sin equipo resuelto, el
simulador sigue compilando y el *archive* falla con un error explícito
(«Signing for "Valeria" requires a development team»), que es lo que se quiere:
mejor un error claro que un archivo firmado con la cuenta equivocada.

### 2. Archivar y exportar

```bash
cd ios-native
./scripts/archive.sh dev            # .ipa de desarrollo (único modo con cuenta gratuita)
./scripts/archive.sh adhoc          # .ipa para Firebase App Distribution
./scripts/archive.sh appstore 7     # .ipa para App Store Connect, build 7
```

El script resuelve los paquetes SPM, archiva en Release para
`generic/platform=iOS` y exporta con el `ExportOptions` correspondiente
(`Config/ExportOptions-{Development,AdHoc,AppStore}.plist`). Desde Xcode, el
equivalente es *Product → Archive* con el esquema **Valeria**, que ya está
compartido y archiva en Release.

`adhoc` y `appstore` necesitan un certificado de distribución, o sea cuenta de
pago; con una gratuita el modo que funciona es `dev` (ver el apartado de cuenta
gratuita más arriba).

### 3. Numeración de versiones

`CFBundleShortVersionString` y `CFBundleVersion` del `Info.plist` **no llevan
números escritos a mano**: leen `MARKETING_VERSION` (3.0.0) y
`CURRENT_PROJECT_VERSION` del proyecto. App Store Connect rechaza una subida
cuyo número de build ya exista para esa versión, así que cada envío necesita
uno nuevo — el segundo argumento de `archive.sh` lo inyecta sin tocar archivos:

```bash
./scripts/archive.sh appstore 8
```

### 4. Antes del primer envío a App Store Connect

- `ITSAppUsesNonExemptEncryption = false` ya está declarado en el `Info.plist`.
  Sin esa clave, cada subida se queda parada preguntando por el cumplimiento de
  exportación. **Si algún día se añade cifrado propio, hay que revisarla.**
- El bundle ID nativo (`health.earlify.valeria`) coincide con el del proyecto
  Expo (`app.json` → `ios.bundleIdentifier`). Son la misma ficha de App Store
  Connect: **no pueden convivir ahí un envío del port nativo y uno de la app
  React Native**. Para distribuir el demostrador en paralelo, dale su propio
  identificador (p. ej. `health.earlify.valeria.native`) antes de subir nada.
- `GoogleService-Info.plist` no se versiona; sin él la app arranca igual, pero
  el archivo no reportará a Crashlytics ni a Analytics.
- El icono de la app está generado desde `assets/icon.png` (el mismo del
  proyecto Expo) a 1024×1024 y **sin canal alfa**. La transparencia en el icono
  es motivo de rechazo automático (ITMS-90717), así que si algún día se
  reemplaza el dibujo, hay que reexportarlo opaco.

### Crashlytics: los informes llegan sin símbolos

El proyecto enlaza `FirebaseCrashlytics` pero **no tiene la fase de subida de
dSYM**. En los envíos a App Store Connect no importa —`uploadSymbols` va a
`true` en el `ExportOptions`—, pero en los `.ipa` ad-hoc que van a App
Distribution los informes de caída llegan como direcciones de memoria.

Si esos informes empiezan a hacer falta, la fase se añade a mano en Xcode
(*Build Phases → New Run Script Phase*, la última de la lista):

```bash
"${BUILD_DIR%/Build/*}/SourcePackages/checkouts/firebase-ios-sdk/Crashlytics/run"
```

con `$(TARGET_BUILD_DIR)/$(INFOPLIST_PATH)` y `${DWARF_DSYM_FOLDER_PATH}` como
archivos de entrada, y poniendo `ENABLE_USER_SCRIPT_SANDBOXING = NO` (hoy está
en `YES`, y con el sandbox activo el script no puede leer los dSYM). No se ha
añadido de serie porque depende de una ruta interna de la resolución de SPM que
cambia entre versiones de Xcode, y un build que falla por eso confunde mucho
más que unos informes sin simbolizar en un demostrador.

## ⚠️ Regla innegociable de gobernanza del `project.pbxproj`

Cada vez que se **cree, elimine o renombre** un archivo `.swift` o recurso,
hay que registrar el cambio en `Valeria.xcodeproj/project.pbxproj`
(secciones `PBXBuildFile`, `PBXFileReference`, `PBXGroup` y la build phase
correspondiente). Omitirlo hace que el compilador no vea el archivo y rompe
el build. Este proyecto usa grupos explícitos (no *synchronized folders*)
precisamente para mantener ese control manual.

Lo mismo vale para `Config/`: sus archivos están declarados como
`PBXFileReference` dentro del grupo `Config`, y `Signing.xcconfig` figura como
`baseConfigurationReference` de las configuraciones Debug y Release del target.
Renombrarlo sin actualizar el `pbxproj` no rompe el build —Xcode simplemente
deja de aplicar la configuración base— y el fallo aparece más tarde, al
archivar, como si faltara el equipo de firma.

## Estructura de `Config/`

```
Config/
├── Signing.xcconfig                  # configuración base (versionada, sin secretos)
├── Signing.local.xcconfig.example    # plantilla del Team ID y del bundle ID locales
├── ExportOptions-Development.plist   # desarrollo · la única válida con cuenta gratuita
├── ExportOptions-AdHoc.plist         # exportación para Firebase App Distribution
└── ExportOptions-AppStore.plist      # exportación para App Store Connect
```

`Signing.xcconfig` es la configuración base de las dos configuraciones del
target, así que de ahí salen el equipo de firma **y** el identificador del
bundle (`VALERIA_BUNDLE_ID`). El `project.pbxproj` ya no lleva ninguno de los
dos escritos a pelo: cualquiera puede firmar con su cuenta y su identificador
sin dejar un cambio en el proyecto versionado.
