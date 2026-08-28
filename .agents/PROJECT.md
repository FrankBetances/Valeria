# Project: Valeria+ AR Expansion (AR-1 to AR-6)

## Architecture
- **Layer 1: 3D Assets & Procedural Generators**: Pure Node.js deterministic script (`scripts/build-ar-models.js`) generating 8 glTF 2.0 binary (`.glb`) assets in `assets/models/` (`coche.glb`, `perro.glb`, `manzana.glb`, `pelota.glb`, `zapato.glb`, `lua.glb`, `pez.glb`, `estrella.glb`) with strict size limits (<100 KB target / <2 MB ceiling) and quaternion animations (`celebrate`, `spin360`). Verified by `scripts/check-ar-models.js`.
- **Layer 2: Android Native Subsystem (`android-native/valeria-ar`)**:
  - Direct Google Filament 1.72.1 rendering pipeline on transparent `TextureView` (`UiHelper.isOpaque = false`).
  - Google MediaPipe Tasks Vision 0.10.29 in `FaceSignalEngine.kt` (`LIVE_STREAM`), ephemeral volatile processing (Zero-PHI).
  - 6 Clinical AR Exercise Engines:
    - AR-1: `Ar1Orofacial.kt` (Orofacial kinematics, lip rounding / funneling, continuous translation).
    - AR-2: `Ar2Vra.kt` (Visual Reinforcement Audiometry, head azimuth angle, lateralized stimulus, catch trials).
    - AR-3: `Ar3Fixation.kt` (Semantic gaze fixation, 5-point affine calibration, dual hitbox, dwell accumulation).
    - AR-4: `Ar4SpatialSearch.kt` (Spatial search for Lúa, 3D sensory radar, foveal cone 8.5°, RMS jitter).
    - AR-5: `Ar5FeedCatch.kt` (Parabolic throwing of golden fish, 650 ms flight, distance estimation, catch reaction).
    - AR-6: `Ar6BuddyMimicry.kt` (Guided praxias with Buddy Lúa, 4 exercises, baseline subtraction, >88% symmetry).
  - Native Host & RN Bridge: `ValeriaArActivity.kt`, `ValeriaArModule.kt`, `ValeriaArPackage.kt`.
- **Layer 3: TypeScript Bridge, UI Launcher, Settings & Telemetry**:
  - Bridge contracts: `src/valeriaArBridge.ts` with polymorphic trial records (`Ar1Trial` to `Ar6Trial`).
  - UI Launcher: `src/ValeriaArLauncherScreen.tsx` with all 6 exercise launchers, HUD, and metrics.
  - Clinical settings & policies: `src/valeriaArSettings.ts` (Tiers A-D, clinical thresholds).
  - Metadata: `src/valeriaExerciseMeta.ts` (ES, EN descriptions, clinical rationales).
  - Localization: `src/i18n/` supporting 5 linguistic varieties (`es`, `gl`, `eu`, `en`, `es-DO`).
  - Telemetry: `src/valeriaTelemetry.ts` with Zero-PHI anonymized physical metrics.
  - Dashboard: `src/ValeriaPatientResultsDashboardScreen.tsx` historical trends integration for all 6 AR exercises (`AR_SERIES`).

## Code Layout
- `scripts/build-ar-models.js`: Procedural 3D GLB generator for all 8 models.
- `scripts/check-ar-models.js`: Static contract and checksum validator.
- `assets/models/`: Directory containing the 8 generated `.glb` assets and documentation (`README.md`).
- `android-native/valeria-ar/src/main/java/eu/futureforkids/valeria/ar/`: Kotlin native AR module.
  - `ArContracts.kt`, `FaceSignals.kt`, `FaceSignalEngine.kt`
  - `scene/ValeriaArSceneView.kt`, `scene/SceneHost.kt`
  - `exercises/Ar1Orofacial.kt` .. `exercises/Ar6BuddyMimicry.kt`
  - `ValeriaArActivity.kt`, `ValeriaArModule.kt`, `ValeriaArPackage.kt`
- `src/valeriaArBridge.ts`: TypeScript bridge interfaces and methods.
- `src/ValeriaArLauncherScreen.tsx`: React Native AR Launcher and in-session UI.
- `src/valeriaArSettings.ts`: Clinical configuration and difficulty tiers.
- `src/valeriaExerciseMeta.ts`: Clinical exercise metadata and descriptions.
- `src/ValeriaPatientResultsDashboardScreen.tsx`: Clinical metrics and historical session dashboard.
- `src/i18n/`: Internationalization catalogs for 5 linguistic varieties.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | AR-1 Kinematics | Orofacial kinematics (pucker/funnel, bilateral symmetry) | M1 | Survey | DONE |
| 2 | AR-2 VRA | Visual Reinforcement Audiometry with head turn detection | M1 | Survey | DONE |
| 3 | AR-3 Fixation | Semantic gaze fixation with 5-point affine calibration | M1 | Survey | DONE |
| 4 | AR-4 Spatial Search | "Lúa Salvaje" 3D peripheral spatial search & radar | M1 | Survey | DONE |
| 5 | AR-5 Feed & Catch | "Alimentar a Lúa" golden fish parabolic throwing & catch | M1 | Survey | DONE |
| 6 | AR-6 Buddy Mimicry | "Buddy Lúa" guided praxias imitation & symmetry verification | M1 | Survey | DONE |
| 7 | 8 Procedural GLBs | 8 3D models < 100 KB target, animations celebrate & spin360 | M1 | Survey | DONE |
| 8 | Model Validator | `check:ar-models` verifying models against Kotlin enum & SHA-256 | M1 | Survey | DONE |
| 9 | Models Documentation | `assets/models/README.md` documenting all 8 models | M1 | Survey | DONE |
| 10 | TS Bridge & Launcher | `valeriaArBridge.ts` & `ValeriaArLauncherScreen.tsx` for 6 exercises | M2 | Survey | DONE |
| 11 | Dashboard AR Series | Wire AR-4, AR-5, AR-6 in `ValeriaPatientResultsDashboardScreen.tsx` | M2 | Survey | DONE |
| 12 | i18n Catalogs | All 5 language catalogs (`es`, `gl`, `eu`, `en`, `es-DO`) for AR metrics | M2 | Survey | DONE |
| 13 | Zero-PHI Telemetry | Safe anonymous kinematic telemetry and offline sync | M2 | Survey | DONE |
| 14 | Static Quality Gates | `npm run typecheck`, `npm run check:ar-models`, `npm run check:ui-strings` | M3 | Survey | DONE |
| 15 | Adversarial & Forensic Audit | Verification of zero cheating, real logic, and binary audit gate | M3 | Survey | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | 3D Assets & Models Documentation | Update `assets/models/README.md` with table of all 8 models; run `npm run build:ar-models` and `npm run check:ar-models` | none | DONE |
| M2 | Dashboard & i18n Integration | Wire AR-4, AR-5, AR-6 into `ValeriaPatientResultsDashboardScreen.tsx` (`AR_SERIES`) and i18n files (`strings.es.ts`, `strings.en.ts`, `strings.gl.ts`, `strings.eu.ts`, `strings.es-DO.ts`) | M1 | DONE |
| M3 | Verification, Review & Forensic Integrity Audit | Run TypeScript typecheck, model checker, UI strings checker, Reviewers, Challengers, and Forensic Auditor | M2 | DONE |
