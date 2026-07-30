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
    ├── Assets.xcassets/        # AppIcon + AccentColor (#00c4be)
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
./scripts/archive.sh adhoc          # .ipa para Firebase App Distribution
./scripts/archive.sh appstore 7     # .ipa para App Store Connect, build 7
```

El script resuelve los paquetes SPM, archiva en Release para
`generic/platform=iOS` y exporta con el `ExportOptions` correspondiente
(`Config/ExportOptions-AdHoc.plist` o `Config/ExportOptions-AppStore.plist`).
Desde Xcode, el equivalente es *Product → Archive* con el esquema **Valeria**,
que ya está compartido y archiva en Release.

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
├── Signing.local.xcconfig.example    # plantilla del Team ID local
├── ExportOptions-AdHoc.plist         # exportación para Firebase App Distribution
└── ExportOptions-AppStore.plist      # exportación para App Store Connect
```
