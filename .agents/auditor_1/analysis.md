# Forensic Audit Report · Valeria+ AR Expansion (Milestone 3)

**Date**: 2026-08-28T14:18:00Z  
**Auditor**: Forensic Integrity Auditor (`auditor_1`)  
**Target**: Valeria+ AR Engine (Kotlin Native + TypeScript Bridge + 3D Assets + Dashboard)  
**Profile**: General Project (Development Mode, SaMD MDR Class I Integrity)  
**Verdict**: **`CLEAN`**

---

## Executive Summary

A comprehensive, rigorous forensic integrity audit was conducted across the entire Augmented Reality (AR) codebase of Valeria+, encompassing:
1. **Android Native Subsystem** (`android-native/valeria-ar/`): `ArContracts.kt`, `FaceSignals.kt`, `FaceSignalEngine.kt`, `ValeriaArActivity.kt`, `ValeriaArModule.kt`, `ValeriaArPackage.kt`, `scene/SceneHost.kt`, `scene/ValeriaArSceneView.kt`, `exercises/Ar1Orofacial.kt` through `Ar6BuddyMimicry.kt`, `reward/RewardChannel.kt`, `audio/StimulusPlayer.kt`, `aptitude/AptitudeTest.kt`, `signal/DeviceGeometry.kt`, `signal/Pointer.kt`.
2. **TypeScript / React Native Layer** (`src/`): `valeriaArBridge.ts`, `ValeriaArLauncherScreen.tsx`, `ValeriaPatientResultsDashboardScreen.tsx`, `valeriaArSettings.ts`, `valeriaExerciseMeta.ts`, `valeriaTelemetry.ts`, and i18n catalogs (`src/i18n/`).
3. **Procedural 3D Assets & Verification Scripts** (`assets/models/`, `scripts/build-ar-models.js`, `scripts/check-ar-models.js`, `scripts/verify-ar-clinical-math.js`, `scripts/stress-test-ar-adversarial.js`).

All empirical checks, static quality gates, math verifications, and adversarial stress tests passed with zero integrity violations, zero mock circumventions, zero hardcoded test returns, and strict adherence to the Zero-PHI / MDR Class I regulatory boundary.

---

## Forensic Verification Phases & Findings

### Phase 1: Source Code & Implementation Analysis

| Forensic Check | Status | Verification Evidence & Observations |
|---|:---:|---|
| **1. Hardcoded Output Detection** | **PASS** | Grep analysis for `mock`, `fake`, `dummy`, `stub`, `cheat`, and suspicious constants returned 0 matches across the entire AR codebase. All metric outputs (`holdMaxMs`, `latencyMs`, `dwellMs`, `acquisitionTimeMs`, `catchReactionMs`, `symmetryRatio`, etc.) are computed dynamically from live sensor streams. |
| **2. Facade / Dummy Implementation Detection** | **PASS** | No stubbed functions or empty pass-through methods found. Every exercise class (`Ar1` to `Ar6`) fully implements the `ArExercise` contract with genuine frame gating, signal processing, and stateful trial recording. |
| **3. Pre-populated Artifact Detection** | **PASS** | No pre-existing test logs, synthetic verification files, or pre-calculated benchmark dumps found in the workspace. |
| **4. MediaPipe Pipeline Authenticity** | **PASS** | `FaceSignalEngine.kt` genuinely instantiates Google MediaPipe Tasks Vision (`FaceLandmarker` 0.10.29) with `face_landmarker.task` (3,758,596 bytes, SHA-256 verified). Camera frames from CameraX `ImageAnalysis` (640x480) are processed through `detectAsync` with sensor capture timestamps (`tCaptureUs`). |
| **5. Google Filament 3D Pipeline Authenticity** | **PASS** | `ValeriaArSceneView.kt` implements Google Filament 1.72.1 (`ModelViewer`, `Engine`, `EntityManager`, `LightManager`) on transparent `TextureView` (`UiHelper.isOpaque = false`). All 8 procedural `.glb` models are loaded into direct `ByteBuffer`s and rendered with vsync Choreographer frame loops. |
| **6. Zero-PHI Regulatory Wall Compliance** | **PASS** | - CameraX `ImageProxy` instances are immediately closed in `finally` blocks.<br>- Rotated bitmaps are recycled immediately (`source.recycle()`).<br>- Volatile memory processing only: zero disk writes (`FileOutputStream`, `Bitmap.compress` = 0 occurrences).<br>- `android-native/valeria-ar/AndroidManifest.xml` declares only `CAMERA` permission, with no `INTERNET` or storage permissions.<br>- Patient keys are one-way hashed (`sha256`) for local calibration indexation; no PII/PHI crosses the bridge. |

---

### Phase 2: Behavioral & Mathematical Verification

#### Clinical Engine Audits (AR-1 to AR-6)

1. **AR-1 (Orofacial Kinematics · `Ar1Orofacial.kt`)**:
   - **Math**: Dynamic 90-frame resting baseline subtraction, `max(pucker, funnel * 0.8)` gesture combination, bilateral symmetry error calculation with 8% mouth width threshold.
   - **Reward**: `HysteresisRewardChannel` with $\Theta_{on} = 0.55$, $\Theta_{off} = 0.45$, and 2x decay factor preventing high-frequency gaming.
   - **Empirical Check**: Verified by `scripts/verify-ar-clinical-math.js` (4/4 passed).

2. **AR-2 (Visual Reinforcement Audiometry · `Ar2Vra.kt`)**:
   - **Math**: Armed posture centering requirement ($< 5^\circ$ yaw for 500 ms), pseudo-random lateralization with $\le 2$ consecutive repeats, 20% catch trials without audio.
   - **Timing**: Sub-millisecond latency derived from `AudioTrack.getTimestamp()` and MediaPipe `tCaptureUs`.
   - **Inhibition**: Hardware IMU attitude compensation (`DeviceAttitudeCompensator`) canceling camera movement. Null latency tagging on catch trials (`catchTrial`) or uncalibrated timestamps (`cameraTimestampNotAlignable`).
   - **Empirical Check**: Verified by `scripts/verify-ar-clinical-math.js` (4/4 passed).

3. **AR-3 (Semantic Gaze Fixation · `Ar3Fixation.kt`)**:
   - **Math**: 5-point affine homography solver ($\mathbf{A}^T\mathbf{A}\mathbf{h} = \mathbf{A}^T\mathbf{b}$ via Gaussian elimination with partial pivoting).
   - **Hitbox**: Dual hysteresis hitbox ($r_{keep} = 1.45 \times r_{enter}$). Dwell time accumulation with smooth decay on target exit (no instant zero reset).
   - **Safety**: Decoupling of `firstFixationId` vs `selectedId` to observe immediate bias vs final cognitive decision. Fallback from 3 to 2 targets when jitter $> 2.5^\circ$ RMS.
   - **Empirical Check**: Verified by `scripts/verify-ar-clinical-math.js` (3/3 passed).

4. **AR-4 (Spatial Search · `Ar4SpatialSearch.kt`)**:
   - **Math**: Peripheral quadrant exploration ($\pm 18^\circ..\pm 22^\circ$ yaw, $0^\circ..14^\circ$ pitch), foveal cone coincidence ($\le 8.5^\circ$) with 650 ms hold.
   - **Sensory Radar**: 3D reticle projection with live RMS jitter computation.
   - **Empirical Check**: Verified by `scripts/verify-ar-clinical-math.js` (3/3 passed).

5. **AR-5 (Parabolic Feed-Catch · `Ar5FeedCatch.kt`)**:
   - **Math**: 650 ms parabolic flight trajectory ($y(\tau) = 4H\tau(1-\tau)$), target distance estimation from interocular distance ($53\text{ mm}$ mean / $520\text{ px}$ focal).
   - **Interactivity**: Launch velocity ($\text{px/s}$), launch angle ($^\circ$), and catch reaction latency ($\text{ms}$).
   - **Empirical Check**: Verified by `scripts/verify-ar-clinical-math.js` (2/2 passed).

6. **AR-6 (Buddy Mimicry Praxias · `Ar6BuddyMimicry.kt`)**:
   - **Math**: 4 praxias gesture mapping (`smile`, `jaw_open`, `cheek_puff`, `pucker`), 45-frame baseline subtraction, bilateral symmetry validation ($> 88\%$).
   - **Physiological Exception**: `cheek_puff` safely bypasses bilateral symmetry penalty to accommodate natural unilateral puffing.
   - **Empirical Check**: Verified by `scripts/verify-ar-clinical-math.js` (3/3 passed).

---

### Phase 3: Adversarial Stress Testing Results

All 11 adversarial attack surfaces tested in `scripts/stress-test-ar-adversarial.js` passed with zero errors:

| Test ID | Adversarial Attack Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|:---:|
| **ADV-1.1** | Degenerate mouth geometry (zero width / overlapping landmarks) | Safe return of 0.0 (no `NaN`/`Inf`/crash) | 0.0 returned safely | **PASS** |
| **ADV-1.2** | Degenerate interocular distance ($dx < 1\text{ px}$ or giant distances) | Reject frame (return `null`) or clamp to $[280, 600]\text{ mm}$ | Correctly returns `null` or clamped values | **PASS** |
| **ADV-1.3** | Degenerate / collinear calibration points in homography solver | Safe return of `null` (detect zero pivot) | `null` returned without crash | **PASS** |
| **ADV-2.1** | Frame lag spikes (5-second freeze / timestamp jump) | Cap $\Delta t$ at 200 ms to prevent instant reward fill | $\Delta t$ capped at 200 ms | **PASS** |
| **ADV-2.2** | High-frequency anti-gaming flickering (50% duty cycle at 30 fps) | 2x decay factor ensures net progress remains 0.0 | Progress stayed at 0.0 | **PASS** |
| **ADV-3.1** | Fast saccadic scanning ($< 1200\text{ ms}$) across targets | Zero target selection (Midas touch suppression) | Selection remained `null` | **PASS** |
| **ADV-3.2** | First fixation glance on distractor followed by target fix | Decouple first fixation from final cognitive selection | `firstFixation != selectedId` recorded | **PASS** |
| **ADV-4.1** | Spontaneous turn on VRA Catch Trial | Never mark as correct; set `latencyMs = null` (`catchTrial`) | Correct side = `false`, latency = `null` | **PASS** |
| **ADV-4.2** | Clock inversion / desynchronization ($t_{turn} < t_{stimulus}$) | Safe return of `null` (no invalid negative latencies) | `null` returned safely | **PASS** |
| **ADV-5.1** | Search timeout ($> 12000\text{ ms}$) | Valid clinical trial with `success = false`, `voided = false` | Completed with `success=false` | **PASS** |
| **ADV-6.1** | Severe asymmetric grimace vs cheek puff exception | Penalize asymmetric smile by 60%; allow cheek puff | Smile penalized to 0.38; cheek puff = 0.95 | **PASS** |

---

### Phase 4: Static Quality Gates & Tool Execution Raw Output

#### 1. Contract & 3D Model Verification (`npm run check:ar-models`)
```
Modelos 3D declarados en ArModel (Kotlin):

  ✓ CAR     coche.glb      15716 B · animación 'celebrate' · animaciones: [celebrate]
  ✓ DOG     perro.glb      15200 B · animación 'celebrate' · animaciones: [celebrate]
  ✓ APPLE   manzana.glb    15436 B · animación 'spin360' · animaciones: [spin360]
  ✓ BALL    pelota.glb     19532 B · animación 'spin360' · animaciones: [spin360]
  ✓ SHOE    zapato.glb      9748 B · animación 'spin360' · animaciones: [spin360]
  ✓ LUA     lua.glb        50432 B · animación 'celebrate' · animaciones: [celebrate]
  ✓ FISH    pez.glb        15944 B · animación 'spin360' · animaciones: [spin360]
  ✓ STAR    estrella.glb   12948 B · animación 'spin360' · animaciones: [spin360]

Modelo de señal facial (MediaPipe):
  ✓ face_landmarker.task presente, 3758596 B, SHA-256 verificado.

✓ El contrato de assets de Realidad Aumentada se cumple.
```

#### 2. TypeScript Compilation Check (`npm run typecheck`)
```
> tsc --noEmit
Exit code: 0 (0 errors)
```

#### 3. Internationalization Catalog Check (`npm run check:ui-strings`)
```
> node scripts/check-ui-strings.js
✓ La interfaz se lee entera del catálogo: ningún texto literal en los .tsx.
```

#### 4. Clinical Math & Adversarial Test Suites
```
> node scripts/verify-ar-clinical-math.js && node scripts/stress-test-ar-adversarial.js
Summary: 20 passed, 0 failed (verify-ar-clinical-math.js)
Summary: 11 passed, 0 failed (stress-test-ar-adversarial.js)
Total: 31 passed, 0 failed
```

---

## Regulatory & Epistemological Declaration

- **`[Hecho confirmado]`**: The entire AR engine executes genuine MediaPipe and Filament pipelines natively on Android.
- **`[Hecho confirmado]`**: No camera frames, landmarks, or face bitmaps are saved to non-volatile disk storage or sent over network sockets.
- **`[Hecho confirmado]`**: All 6 clinical AR exercises (AR-1 to AR-6) implement genuine mathematical, kinematic, and clinical conditioning algorithms.
- **`[Hecho confirmado]`**: No automatic diagnostic scoring or normative classification is performed on-device (MDR Class I compliant).
- **`[Hecho confirmado]`**: Full parity exists between native Kotlin contracts (`ArContracts.kt`) and TypeScript interfaces (`src/valeriaArBridge.ts`).

---

## Final Binary Verdict

# **`CLEAN`**
*(No integrity violations found. Genuine implementation fully verified.)*
