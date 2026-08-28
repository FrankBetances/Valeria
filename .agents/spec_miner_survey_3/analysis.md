# Valeria+ AR Expansion (3 → 6 Exercises) — Specification Mining & Codebase Survey Report

**Author**: Spec Miner 3  
**Date**: 2026-08-28  
**Project**: Valeria+ v13 (Expo SDK 54 / React Native 0.81.5 / TypeScript 5.9.2 / Android Kotlin 2.1.20 / Google Filament / MediaPipe Tasks Vision)  
**Status**: Comprehensive Discovery Complete  

---

## Executive Summary

This specification mining report covers the comprehensive survey of the **Valeria+ Augmented Reality (AR) Expansion Project**, which expands the clinical motor conditioning AR module from **3 to 6 exercises** (AR-1 through AR-6) featuring the mascot **Lúa**, real-time computer vision via **Google MediaPipe Tasks Vision (FaceLandmarker 478 points + 52 blendshapes)**, and deterministic procedural 3D rendering via **Google Filament** (< 100 KB per GLB).

The survey verifies strict compliance with the **MDR Class I (SaMD)** regulatory wall (Zero-PHI, pure physical magnitudes, no on-device automated diagnostic classifications or opaque algorithmic adaptations, adult caregiver as sole clinical judge), full decoupling across 5 linguistic varieties (`es`, `gl`, `eu`, `en`, `es-DO`), robust offline telemetry contracts, and 100% pass rates across all verification scripts (`npm run typecheck`, `npm run check:ar-models`, `npm run check:ui-strings`).

---

## 1. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Bridge Interface | `isArAvailable()` | Probes native module availability without platform OS checks (supports graceful degradation on Expo Go / non-AR devices) | None | `boolean` (true if native host supported and camera present) | Returns `false` on missing native module or exception | `src/valeriaArBridge.ts:267` |
| 2 | Bridge Interface | `runAptitudeTest()` | Runs 60-90s hardware aptitude diagnostic benchmark across 7 probes | None | `Promise<ArDeviceProfile \| null>` with level `A`, `B`, `C`, or `D` | Returns `null` on hardware failure or timeout | `src/valeriaArBridge.ts:282`, `AptitudeTest.kt` |
| 3 | Bridge Interface | `calibrateAr()` | Executes 5-point spatial calibration for gaze selection | `patientKey: string`, `pointerSource: ArPointerSource` | `Promise<{ rmsPx: number, rmsDeg: number } \| null>` | Returns `null` on calibration failure | `src/valeriaArBridge.ts:295`, `Calibration.kt` |
| 4 | Bridge Interface | `launchAr()` | Launches native full-screen camera + 3D scene AR activity for assigned exercise | `ArExerciseConfig` (`exerciseId`, `patientKey`, `thresholds`, `trials`) | `Promise<ArSessionResult \| null>` with `outcome`, `thresholds`, `deviceProfile`, `trials` | Returns `null` on native crash or rejection; returns `outcome: 'denied'` if permission revoked, `outcome: 'timeout'` if face lost for > 60s | `src/valeriaArBridge.ts:338`, `ValeriaArActivity.kt` |
| 5 | Bridge Interface | `openArDiagnostics()` | Opens real-time live sensor diagnostic overlay for SLP/logopeda without reward/gamification | None | `Promise<boolean>` | Returns `false` if native module unsupported | `src/valeriaArBridge.ts:323`, `DiagnosticsState.kt` |
| 6 | AR Settings | `AR_LEVEL_POLICY` | Hardware gating matrix determining available exercises and instrumentation tier | Device Tier `A`, `B`, `C`, or `D` | `ArLevelPolicy` (`exercises: ArExerciseId[]`, `ar2Instrumented: boolean`, `ar3Targets: 2 \| 3`, `publishable: boolean`) | Level `D` offers `[]` exercises, completely hiding the block to prevent degraded UX | `src/valeriaArSettings.ts:143` |
| 7 | AR Settings | Threshold Normalization & Persistence | Persists adult-set clinical thresholds in AsyncStorage without automated adaptation | Raw thresholds JSON | Normalized `ArThresholds` clamped to strict clinical bounds (`holdMs: 800-3000ms`, `turnDeg: 10-30°`, `responseWindowMs: 1000-4000ms`, `dwellMs: 600-2500ms`, `pointerSource: 'iris' \| 'noseRay'`) | Corrupt or missing records fallback to `AR_DEFAULT_THRESHOLDS` | `src/valeriaArSettings.ts:39` |
| 8 | AR Settings | Per-Patient Camera Consent | Manages explicit GDPR/HIPAA informed consent per patient key | `patientKey: string` | `hasArConsent()`, `grantArConsent()`, `revokeArConsent()` | Denied consent blocks camera access and routes to consent onboarding | `src/valeriaArSettings.ts:73` |
| 9 | Exercise AR-1 | Orofacial Kinematics (`Ar1Orofacial`) | Isolates preparatory lip rounding kinematics (/o/, /u/) with microphone MUTED to prevent frustration; propels 3D car | `Blend.MOUTH_PUCKER`, `Blend.MOUTH_FUNNEL`, geometric aperture ratio, bilateral symmetry | `Ar1Trial` record (`holdMaxMs`, `holdTotalMs`, `puckerPeak`, `apertureRatioPeak`, `symmetryWorst`, `framesValid`, `framesTotal`, `attemptsToFire`) | Asymmetric gestures (> 8% error) penalized to 35% effectiveness; frame rejected if face outside 12° cone | `android-native/.../Ar1Orofacial.kt`, `src/valeriaArBridge.ts:136` |
| 10 | Exercise AR-2 | Instrumented Sound Localization (`Ar2Vra`) | Digitalized Visual Reinforcement Audiometry (VRA); lateralized acoustic stimulus with microsecond hardware timing | Monotonic audio timestamp, sensor capture timestamp, IMU-compensated head yaw, 20% catch trials | `Ar2Trial` record (`side`, `isCatch`, `transducer`, `gainDbSpl`, `tStimulusUs`, `tTurnUs`, `latencyMs`, `latencyNullReason`, `peakYawDeg`, `correctSide`, `timedOut`) | Latency set to `null` with explicit `latencyNullReason` if audio/camera clocks non-alignable, Bluetooth active, or non-Level-A hardware | `android-native/.../Ar2Vra.kt`, `src/valeriaArBridge.ts:148` |
| 11 | Exercise AR-3 | Semantic Gaze Selection (`Ar3Fixation`) | Gaze dwell selection over 2 or 3 3D targets placed in angular degrees (7.6° separation for 3 dianas, 15-18° for 2 dianas) | Iris / nose ray gaze pointer projected onto screen geometry, spoken target prompt | `Ar3Trial` record (`targetId`, `targetCount`, `firstFixationId`, `tFirstFixationMs`, `selectedId`, `dwellMs`, `revisits`, `pointerSource`, `calibrationRmsPx`, `outOfBoundsMs`) | Double hitbox (enter radius vs keep radius 1.45x) avoids edge flickering; lookaway decaies dwell (2x dt) rather than zeroing; trial voided if phone moves | `android-native/.../Ar3Fixation.kt`, `src/valeriaArBridge.ts:166` |
| 12 | Exercise AR-4 | Spatial Search for Lúa (`Ar4SpatialSearch`) | Pokémon GO style "Lúa Salvaje" 3D tracking: child scans peripheral quadrants (left, right, top-left, top-right) guided by sensory radar/compass | Head yaw & pitch within foveal cone (< 8.5°), sustained foveal dwell (650 ms) | `Ar4Trial` record (`targetQuadrant`, `targetYawDeg`, `targetPitchDeg`, `acquisitionTimeMs`, `fovealDwellMs`, `yawRmsDeg`, `success`) | Search timeout at 12,000 ms registers `success: false`; IMU compensation prevents false tracking during device sway | `android-native/.../Ar4SpatialSearch.kt`, `src/valeriaArBridge.ts:180` |
| 13 | Exercise AR-5 | Reward Throw & Catch (`Ar5FeedCatch`) | "Alimentar a Lúa": swipe/launch kinematic golden fish (`pez.glb`) towards Lúa; Lúa catches, ingests (`MOOD(3)`), and ronronea (`MOOD(2)`) | Swipe velocity, angle, target distance (280-600mm) | `Ar5Trial` record (`throwVelocityPxPerS`, `throwAngleDeg`, `targetDistanceMm`, `timeToThrowMs`, `hit`, `catchReactionMs`) | Auto-throw fallback after 3,500 ms if child cannot swipe; registers timing latency and trajectory | `android-native/.../Ar5FeedCatch.kt`, `src/valeriaArBridge.ts:191` |
| 14 | Exercise AR-6 | Mirror Mimicry with Buddy Lúa (`Ar6BuddyMimicry`) | Guided oral-facial praxia mimicry (smile, jaw open, cheek puff, pucker); Lúa models and child replicates in AR mirror | Blendshape activation, 45-frame neutral resting baseline, bilateral symmetry ratio | `Ar6Trial` record (`targetExpression`, `blendshapePeak`, `holdMs`, `symmetryRatio`, `mimicSuccess`) | Symmetry error (> 12%) penalizes non-puff gestures to 40% effectiveness; trial timeout at 14,000 ms | `android-native/.../Ar6BuddyMimicry.kt`, `src/valeriaArBridge.ts:201` |
| 15 | 3D Rendering | Procedural Filament Assets | Deterministic CC0 procedural 3D GLB generator (< 51 KB per model) with PBR materials and exact animation contracts | Script execution `npm run build:ar-models` | 8 GLB models: `coche.glb`, `perro.glb`, `manzana.glb`, `pelota.glb`, `zapato.glb`, `lua.glb`, `pez.glb`, `estrella.glb` | Verified by `npm run check:ar-models`; fails build if size > 2 MB or required animation missing | `scripts/build-ar-models.js`, `scripts/check-ar-models.js` |
| 16 | UI Screen | Launcher Screen (`ValeriaArLauncherScreen.tsx`) | Complete orchestration UI: onboarding, consent gate, aptitude test, 6-exercise list, settings adult panel, pro diagnostics, results view | User navigation, stored profile, clinical thresholds, native session result | Full navigation, visual cards, physical metrics summary rows, +XP and Lúa rewards | Displays friendly adult error messages (`noticeTimeout`, `noticeDenied`, `noticeAptitudeFailed`) without technical jargon | `src/ValeriaArLauncherScreen.tsx` |
| 17 | UI Screen | In-Game Overlay & HUD (`RewardOverlay`) | Compose 2D overlay on camera preview: dual-ring target markers, gaze pointer with pulse, continuous charge bar, celebration sparkles | `SceneState` (`targets`, `pointer`, `reward` state machine) | Real-time Canvas overlay | Visual elements scale smoothly without blocking 60 FPS Filament rendering loop | `android-native/.../SceneHost.kt:127` |
| 18 | Telemetry | Zero-PHI Usability Telemetry (`valeriaTelemetry.ts`) | Non-blocking in-memory capture with debounced AES-encrypted flush to AsyncStorage; aggregates AR trials | `ArTrial[]`, `ArDeviceProfile`, `ArThresholds` | `SessionRecord`, `ArExportSummary`, QR Payload, full transactional JSON export | Capped at `MAX_EVENTS` (300) to prevent memory leak; strictly excludes audio, video, or PHI | `src/valeriaTelemetry.ts:400` |
| 19 | Gamification & Lúa | Mascot State Mirroring (`valeriaLuaSession.ts`) | Mirrors participation rewards (XP, streak tiers, awards) onto Lúa mascot without penalizing errors | `SessionReward` (`xpGained`, `streak`, `level`, `levelName`) | Opcode dispatch (`AWARD`, `LEVEL`, `CELEBRATE`) to Lúa display | Cero sad faces / zero punishment: failure returns gently to Atenta (`1`) | `src/valeriaLuaSession.ts`, `src/valeriaGamification.ts` |
| 20 | i18n Localization | Decoupled 5-Variety Architecture | UI strings in `strings.es.ts` & `strings.en.ts`; clinical exercises decoupled in `es`, `gl`, `eu`, `en`, `es-DO` | Active `UiLang` (`es` \| `en`) and `valeriaLocale` | Typed UI string keys for all AR onboarding, consent, hardware profile, exercise kicker, results | Validated by AST script `npm run check:ui-strings`; zero unlocalized JSX strings | `src/i18n/*`, `scripts/check-ui-strings.js` |

---

## 2. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Native Bridge Availability | App running on Expo Go or iOS without native bridge (`NativeModules.ValeriaAr == null`) | `isArAvailable()` returns `false`. `ValeriaArLauncherScreen` renders `unsupported` phase explaining front camera requirement, while other 6 blocks operate normally. No crash or white screen. |
| 2 | Camera Permission Revocation | User denies camera permission in Android OS settings during AR launch | Native host catches permission denial and returns `outcome: 'denied'`. Launcher screen displays `t.ar.noticeDenied` and returns smoothly to menu. |
| 3 | Loss of Face in Camera View | Child moves away or turns away for > 60 continuous seconds | Native session automatically times out, preserving all trials completed before face loss, and returns `outcome: 'timeout'`. Launcher displays `t.ar.noticeTimeout` with positioning advice. |
| 4 | Low-Tier Device (Tier D) | Aptitude test measures < 25 FPS sustained or severe thermal throttling slope (< 0.70) | `runAptitudeTest()` assigns level `D`. Policy `AR_LEVEL_POLICY.D` returns `exercises: []`. Launcher displays `notApt` screen, preventing laggy, frustrating exercises. |
| 5 | Mid-Tier Device (Tier C) | Device pointer jitter RMS > 2.5° during 5-point calibration | Policy `AR_LEVEL_POLICY.C` restricts AR-3 to 2 targets (15-18° separation) instead of 3, ensuring valid forced-choice discriminability. |
| 6 | Bluetooth Audio in AR-2 | User connects Bluetooth headphones/speaker during AR-2 sound localization | Bluetooth latency jitter makes acoustic timing unverifiable. Exercise runs in `game` mode; latency is recorded as `null` with `latencyNullReason: 'bluetoothOutput'`. |
| 7 | Device Motion During Trial | Caregiver moves or shakes phone during active measurement in AR-1, AR-2, or AR-3 | `DeviceAttitudeCompensator` flags `movedTooMuch()`. Trial is marked `voided: true` with `voidReason: 'deviceMoved'`. Corrupted trial is discarded from latency aggregates. |
| 8 | Asymmetric Orofacial Compensation | Child attempts lip rounding with one-sided smirk or jaw slide in AR-1 or AR-6 | Bilateral symmetry error exceeds threshold (> 8% width in AR-1, > 12% in AR-6). Signal strength is penalized to 35-40%, requiring bilateral symmetry to trigger reward. |
| 9 | Brief Gaze Loss in AR-3 | Child blinks or looks away for 100 ms during 1200 ms dwell fixation | Target dwell time decaies progressively (`dwellMs - 2*dt`) rather than resetting to 0, preventing pediatric fatigue from natural micro-saccades. |
| 10 | No Touch Interaction in AR-5 | Child freezes or does not swipe screen within 3,500 ms in AR-5 | Auto-throw fallback initiates cinematic projectile launch toward Lúa, recording reaction and ensuring positive reinforcement without frustration. |
| 11 | Corrupt Storage Preferences | Corrupt JSON in AsyncStorage for `STORAGE_KEYS.arUmbrales` | `normalizeThresholds()` catches parse failure and applies `AR_DEFAULT_THRESHOLDS` within strict clinical ranges. |
| 12 | Excessive Telemetry Sessions | Patient runs > 300 trials in single session without export | `trackArSession` clamps entries to `MAX_EVENTS` (300), preventing heap memory exhaustion. |

---

## 3. End-to-End Interface Contracts & Architectural Mapping

### 3.1 TypeScript Bridge Contract (`src/valeriaArBridge.ts`)
The bridge serves as the strict decoupled boundary between React Native JS and the platform-native AR host:
- **Exercise Identifiers**: `export type ArExerciseId = 'ar1' | 'ar2' | 'ar3' | 'ar4' | 'ar5' | 'ar6';`
- **Pointers**: `export type ArPointerSource = 'iris' | 'noseRay';`
- **Aptitude Tiers**: `export type ArAptitudeLevel = 'A' | 'B' | 'C' | 'D';`
- **Trial Modes**: `export type ArTrialMode = 'instrument' | 'game';`
- **Trials**: Polymorphic union `ArTrial = Ar1Trial | Ar2Trial | Ar3Trial | Ar4Trial | Ar5Trial | Ar6Trial;`
- **Session Result**: `ArSessionResult` captures `outcome` (`'completed' | 'aborted' | 'denied' | 'timeout'`), `thresholds`, `deviceProfile`, and `trials`.
- **Public API**:
  - `isArAvailable(): boolean`
  - `runAptitudeTest(): Promise<ArDeviceProfile | null>`
  - `calibrateAr(patientKey: string, pointerSource: ArPointerSource): Promise<{ rmsPx: number; rmsDeg: number } | null>`
  - `hasArCalibration(patientKey: string): Promise<boolean>`
  - `openArDiagnostics(): Promise<boolean>`
  - `launchAr(cfg: ArExerciseConfig): Promise<ArSessionResult | null>`

### 3.2 Kotlin Native AR Layer (`android-native/valeria-ar/`)
- **Bridge Package**: `ValeriaArPackage.kt` registers `ValeriaArModule.kt`.
- **Module Interface**: `ValeriaArModule` provides `@ReactMethod` wrappers: `isSupported`, `runAptitudeTest`, `launch`, `calibrate`, `hasCalibration`, `openDiagnostics`.
- **Activity Host**: `ValeriaArActivity` hosts:
  - Camera preview lifecycle via CameraX.
  - MediaPipe `FaceLandmarker` with GPU delegate / CPU fallback, tracking 478 landmarks and 52 ARKit blendshapes at 30-60 FPS.
  - Google Filament engine rendering PBR `.glb` models on transparent `TextureView` (`ValeriaArSceneView.kt`).
  - Jetpack Compose HUD overlay (`RewardOverlay`).
- **Exercise State Machines**:
  - `Ar1Orofacial.kt`: Hysteresis channel (`thetaOn = 0.55`, `thetaOff = 0.45`), mouth pucker/funnel blendshapes, aperture ratio, symmetry ratio.
  - `Ar2Vra.kt`: Lateralized audio via `StimulusPlayer`, VRA state machine (arming -> waiting -> window -> feedback), catch trials (20%), microsecond clock sync.
  - `Ar3Fixation.kt`: 5-point calibration, gaze projection, dual hitboxes, Midas touch mitigation with dwell decay.
  - `Ar4SpatialSearch.kt`: 3D quadrant tracking (left, right, top-left, top-right), foveal cone (< 8.5°), 650 ms hold, jitter RMS calculation.
  - `Ar5FeedCatch.kt`: Swipe trajectory, parabolic flight, distance estimation (280-600mm), Lúa mid-air catch with `MOOD(3)` / `MOOD(2)`.
  - `Ar6BuddyMimicry.kt`: Buddy Lúa praxia modeling (smile, jaw open, cheek puff, pucker), 45-frame neutral baseline, bilateral symmetry verification.

---

## 4. 3D Procedural Assets Specification (`scripts/build-ar-models.js`)

All 8 models are generated deterministically in Node.js with zero external dependencies, CC0-1.0 license, and strict contract verification via `npm run check:ar-models`:

| Asset File | Size (Bytes) | Geometry / Mesh Features | Required Animation | Target Exercise |
|---|---|---|---|---|
| `coche.glb` | 15,716 B | Red chassis, turquoise cabin, 4 rotating wheels, headlights | `celebrate` | AR-1 (Cinemática Orofacial) |
| `perro.glb` | 15,200 B | Light brown body, dark brown paws & ears, nodding head, wagging tail | `celebrate` | AR-2 (Localización Acústica) |
| `manzana.glb` | 15,436 B | Red apple body, brown stem, green leaf | `spin360` | AR-3 (Selección por Fijación) |
| `pelota.glb` | 19,532 B | White leather sphere with equatorial blue stripe | `spin360` | AR-3 (Distractor) |
| `zapato.glb` | 9,748 B | Cream sole, blue upper, rounded toe, white laces | `spin360` | AR-3 (Distractor) |
| `lua.glb` | 50,432 B | Tuxedo cat body, 4 paws, head with pink inner ears, turquoise eyes, collar with gold bell, tail | `celebrate` | AR-4 (Búsqueda Espacial) & AR-6 (Espejo Mímico) |
| `pez.glb` | 15,944 B | Golden scaled fish body, dorsal fin, caudal fin, dark eyes | `spin360` | AR-5 (Lanzamiento y Captura) |
| `estrella.glb` | 12,948 B | 5-point golden reward star with glowing center | `spin360` | Level / Gamification Reward |

Total asset weight for all 8 models is **151.2 KB** (well below the 2 MB per-model limit and the +25 MB total download ceiling).

---

## 5. i18n Localization & Linguistic Diversity (5 Varieties)

### 5.1 UI Layer (`src/i18n/strings.es.ts` & `src/i18n/strings.en.ts`)
- Complete typed parity across Spanish and US English for all launcher states, consent requirements, hardware diagnostics, warnings, and result summary rows.
- Full Sentence Case, HIPAA/GDPR clinical register (*caregiver*, *child*, *speech-language pathologist*).
- AST gate `npm run check:ui-strings` verifies zero hardcoded orphan strings in `.tsx` files.

### 5.2 Exercise Metadata (`src/valeriaExerciseMeta.ts`)
- **Spanish (`AR_META_ES`)**:
  - `ar1`: AR-1 · Cinemática Orofacial (3-4 años)
  - `ar2`: AR-2 · Localización del Sonido Instrumentada (3-4 años, instrumenta RA-5)
  - `ar3`: AR-3 · Selección Semántica por Fijación (4-5 años)
  - `ar4`: AR-4 · Búsqueda Espacial de Lúa (4-5 años)
  - `ar5`: AR-5 · Lanzamiento y Captura de Premios (3-4 años)
  - `ar6`: AR-6 · Espejo Mímico con Buddy Lúa (4-5 años)
- **US English (`AR_META_EN`)**:
  - `ar1`: AR-1 · Orofacial kinematics (3–4 years)
  - `ar2`: AR-2 · Instrumented sound localization (3–4 years, instruments RA-5)
  - `ar3`: AR-3 · Semantic gaze selection (4–5 years)
  - `ar4`: AR-4 · Spatial search for Lúa (4–5 years)
  - `ar5`: AR-5 · Reward throw and catch (3–4 years)
  - `ar6`: AR-6 · Mirror mimicry with Buddy Lúa (4–5 years)

---

## 6. Codebase Survey: Existing vs. Missing / Incomplete Elements

### 6.1 Fully Implemented & Verified Components
1. **Core Bridge & Settings (`src/valeriaArBridge.ts`, `src/valeriaArSettings.ts`)**: Full TypeScript types, hardware tier matrix, storage persistence, and lazy native module loader.
2. **Exercise Metadata (`src/valeriaExerciseMeta.ts`)**: Both Spanish and English arrays (`AR_META_ES`, `AR_META_EN`) declare all 6 exercises.
3. **AR Launcher Screen (`src/ValeriaArLauncherScreen.tsx`)**: Complete 6-exercise list, flow states, execution, result breakdowns, and Lúa gamification reward linking.
4. **Telemetry Engine (`src/valeriaTelemetry.ts`)**: AR session tracking, device profile sealing, and export summaries.
5. **Native Android Subsystem (`android-native/valeria-ar/`)**: Complete Kotlin implementations for `ArContracts.kt`, `ValeriaArModule.kt`, `ValeriaArActivity.kt`, `SceneHost.kt`, `ValeriaArSceneView.kt`, and all 6 exercise engines (`Ar1Orofacial.kt` to `Ar6BuddyMimicry.kt`).
6. **3D Assets & Scripts (`assets/models/`, `scripts/build-ar-models.js`, `scripts/check-ar-models.js`)**: 8/8 procedural GLB models generated and verified.

### 6.2 Identified Gaps & Extension Points
1. **Patient Results Dashboard (`src/ValeriaPatientResultsDashboardScreen.tsx`)**:
   - `AR_SERIES` (line 71) currently only defines keys for `ar1`, `ar2`, `ar3`. To show clinical evolution across all activities in the dashboard, series configs for `ar4` (unit: `'ms'`, icon: `'compass'`), `ar5` (unit: `'px/s'`, icon: `'move'`), and `ar6` (unit: `'%'`, icon: `'clinical'`) need to be mapped.
2. **Results i18n Strings (`src/i18n/strings.es.ts` & `strings.en.ts`)**:
   - `t.results.arLabel`, `t.results.arHint`, and `t.results.arTitle` contain ternary chains that branch for `ar1` and `ar2`, falling back to `ar3` for all other IDs. Expanding these to explicit switch/cases for `ar1` through `ar6` will ensure descriptive chart headers and subtitles in the dashboard.
3. **Cross-Platform Host Neutrality**:
   - The TypeScript bridge is 100% platform-neutral (uses ARKit-compatible 52 blendshapes and standard 4x4 matrix conventions). While Android Kotlin host is fully operational, iOS host (Swift/RealityKit) remains a documented future target.

---

## 7. Verification Results

Empirical CLI verification on macOS environment:
- **`npm run typecheck` (`tsc --noEmit`)**: Code 0 (0 TypeScript errors).
- **`npm run check:ar-models` (`node scripts/check-ar-models.js`)**: Code 0 (8/8 3D models verified, sizes < 51 KB, exact animation contracts validated, MediaPipe `face_landmarker.task` SHA-256 verified).
- **`npm run check:ui-strings` (`node scripts/check-ui-strings.js`)**: Code 0 (All TSX UI strings consumed from i18n catalog without orphan literals).
