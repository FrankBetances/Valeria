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
    ├── Info.plist
    ├── Assets.xcassets/        # AppIcon + AccentColor (#00c4be)
    └── Preview Content/
```

## Pantallas portadas (flujo nativo)

Port del flujo RN completo con fidelidad visual, pensado para iterar usabilidad
en device. `RootView` reproduce el stack del `AppNavigator`:

`Welcome → Credits → (PatientSelect | Ficha) → ExerciseSelection → LingTest →
ExercisePlayer → Results`, más los bloques `MinimalPairs` y `SemanticExpansion`.

La persistencia cifrada (AsyncStorage), el motor de voz (TTS/STT) y los datasets
completos del proyecto RN se sustituyen por estado en memoria y datos de muestra
(`AppModel`): la app es navegable de punta a punta sin backend. El tutor hace de
juez en los ejercicios de voz (como en el fallback sin micrófono del original).

## Dependencias (Swift Package Manager)

Inyectadas en `project.pbxproj` → `firebase-ios-sdk` (upToNextMajor `11.0.0`):

- `FirebaseCore` · `FirebaseAnalytics` · `FirebaseCrashlytics`

Xcode las resuelve automáticamente al abrir el proyecto.

## Paso manual pendiente: credenciales Firebase

1. Descarga `GoogleService-Info.plist` desde la consola de Firebase.
2. Arrástralo al grupo **Valeria** en Xcode (marca *Copy items if needed* y
   añádelo al target **Valeria**). Xcode lo registrará en `project.pbxproj`.
3. Está en `.gitignore` a propósito — no se versiona.

`FirebaseApp.configure()` se ejecuta de forma **defensiva**: si el plist no
está presente, la app arranca igual (modo iteración visual) sin crashear.

## ⚠️ Regla innegociable de gobernanza del `project.pbxproj`

Cada vez que se **cree, elimine o renombre** un archivo `.swift` o recurso,
hay que registrar el cambio en `Valeria.xcodeproj/project.pbxproj`
(secciones `PBXBuildFile`, `PBXFileReference`, `PBXGroup` y la build phase
correspondiente). Omitirlo hace que el compilador no vea el archivo y rompe
el build. Este proyecto usa grupos explícitos (no *synchronized folders*)
precisamente para mantener ese control manual.
