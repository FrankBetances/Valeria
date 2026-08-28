# Technical & Clinical Review Analysis: Valeria+ AR Expansion (AR-1 to AR-6)

**Agent**: Reviewer 1 (Milestone 3)  
**Date**: 2026-08-28T14:15:00+02:00  
**Scope**: Native Android Kotlin Subsystem (`android-native/valeria-ar/`), Filament 3D Engine, MediaPipe Tasks Vision, SaMD MDR Class I Compliance, Zero-PHI Privacy, and End-to-End RN Bridge.

---

## 1. Executive Summary & Verdict

**Verdict**: **APPROVE**

The implementation of the Valeria+ AR expansion subsystem in `android-native/valeria-ar/` exhibits exemplary engineering discipline, robust memory management, thorough mathematical safety, and strict fidelity to MDR Class I Software as a Medical Device (SaMD) constraints and Zero-PHI privacy principles.

### Key Architectural Strengths Verified:
1. **Direct Google Filament 1.72.1 Integration**: Clean, decoupled native 3D rendering using `TextureView` with transparent blend mode (`UiHelper.isOpaque = false`), 110k lux directional lighting, and 60 FPS Choreographer vsync loop.
2. **Volatile Zero-PHI Computer Vision**: CameraX `ImageAnalysis` operating in `LIVE_STREAM` with Google MediaPipe Tasks Vision (`FaceLandmarker` 478 points + 52 ARKit-compatible blendshapes). Guaranteed frame disposal via mandatory `finally { image.close() }` and immediate unrotated bitmap recycling.
3. **Clinical Motor Conditioning (All 6 Engines)**:
   - **AR-1 (Orofacial Kinematics)**: Lip pucker/funnel activation decoupled from acoustic production, 90-frame baseline rest normalization, hysteresis with 2× progressive decay, and bilateral symmetry error tolerance (<8%).
   - **AR-2 (Instrumented VRA)**: Microsecond-precision hardware timestamp alignment between `AudioTrack.getTimestamp()` and camera sensor capture timestamp `tCaptureUs`, IMU attitude compensation, pre-trial arming cone, 20% catch trials, and honest missing data attribution.
   - **AR-3 (Semantic Fixation)**: Real-time 5-point affine homography calibration, dynamic 3-to-2 target degradation based on device jitter (>2.5° RMS), dual spatial hitboxes (enter < keep), and anti-Midas dwell accumulation with progressive decay.
   - **AR-4 (Spatial Search / "Lúa Salvaje")**: 3D peripheral quadrant search, 8.5° foveal alignment cone, 650 ms hold requirement, and RMS yaw jitter calculation.
   - **AR-5 (Feed & Catch / "Alimentar a Lúa")**: Parabolic projectile kinematics with dynamic working distance estimation (280–600 mm), reaction timing, and auto-throw timeout fallback.
   - **AR-6 (Buddy Mimicry / "Buddy Lúa")**: Multi-praxia modeling (smile, jaw open, cheek puff, pucker), 45-frame baseline subtraction, and bilateral symmetry indexing (>88%).
4. **Resilient Host & Bridge Lifecycle**: Complete exception shielding (`crashGuard`), non-face watchdog (5s warning, 60s timeout exit, 8m session ceiling), orderly teardown sequence preventing dangling JNI native calls, and type-safe JSON serialization matching `valeriaArBridge.ts`.

---

## 2. Component-by-Component Deep Audit

### 2.1 3D Scene Layer (`SceneHost.kt` & `ValeriaArSceneView.kt`)
- **Filament Initialization & TextureView Surface**:
  - `ValeriaArSceneView.kt:156-159`: `UiHelper(UiHelper.ContextErrorPolicy.DONT_CHECK).apply { isOpaque = false }` is correctly configured prior to `attachTo()`, creating the swapchain with `CONFIG_TRANSPARENT`.
  - `ValeriaArSceneView.kt:183-190`: Clean translucent blend mode configured: `skybox = null`, `view.blendMode = BlendMode.TRANSLUCENT`, `clearColor = doubleArrayOf(0.0, 0.0, 0.0, 0.0)`.
  - `ValeriaArSceneView.kt:195-203`: Lighting configured deterministically with warm directional light (`Colors.cct(6500f)`, intensity `110_000f`, direction `(0.3f, -1f, -0.8f)`), avoiding heavy IBL asset downloads (>20 MB saved).
- **Vsync & Choreographer Frame Loop**:
  - `ValeriaArSceneView.kt:290-327`: Frame callback posts to `Choreographer.getInstance()`. Checks `@Volatile private var released` before execution and before re-posting, completely preventing native rendering crashes on destroyed Filament engines.
  - `ValeriaArSceneView.kt:344-366`: Lifecycle `release()` stops the frame loop, cleans up `lightEntity` via `EntityManager`, and safely manages `ModelViewer.destroy()` based on window attachment state.
- **2D Overlay & Reward Decoupling**:
  - `SceneHost.kt:127-225`: `RewardOverlay` renders Pokémon GO inspired concentric target reticles, dwell progress arcs, capture confetti sparkles, and continuous charging bars. All state changes flow strictly in one direction from `RewardState` into the Composable.

### 2.2 Face Signal & Computer Vision Pipeline (`FaceSignalEngine.kt`, `FaceSignals.kt`, `DeviceGeometry.kt`, `Pointer.kt`)
- **MediaPipe Tasks Vision `LIVE_STREAM` Execution**:
  - `FaceSignalEngine.kt:118-143`: Instantiates `FaceLandmarker` with `RunningMode.LIVE_STREAM`, `setOutputFaceBlendshapes(true)`, `setOutputFacialTransformationMatrixes(true)`, and `setMinTrackingConfidence(0.5f)`.
  - Graceful fallback from `Delegate.GPU` to `Delegate.CPU` upon hardware failure.
- **In-Flight Frame Gating & Memory Safety**:
  - `FaceSignalEngine.kt:195-197`: Explicit gating mechanism prevents accumulating un-inferred bitmap buffers in MediaPipe's queue on slower hardware. Safety valve `STALE_INFERENCE_MS = 1000L` auto-clears stale locks if a frame drops without callback.
  - `FaceSignalEngine.kt:312-333`: `ImageProxy.toRotatedBitmap()` rotates and mirrors front camera input. When a new bitmap instance is created, `source.recycle()` is called immediately to reclaim the 1.2 MB unrotated buffer.
  - `FaceSignalEngine.kt:167-213`: `ImageProxy.close()` is enforced in an absolute `finally` block for every single frame delivered by CameraX.
- **Device Geometry & IMU Attitude Compensation**:
  - `DeviceGeometry.kt:32-66`: `DistanceEstimator` calculates working distance in millimeters via external interocular distance (landmarks 33 ↔ 263), smoothed exponentially (`0.85 * prev + 0.15 * new`).
  - `DeviceGeometry.kt:110-176`: `DeviceAttitudeCompensator` registers `Sensor.TYPE_GAME_ROTATION_VECTOR` to compensate head yaw against device movement (`headYawDeg - (yawDeg - referenceYawDeg)`). Requires 800 ms of device stillness (`STEADY_ARM_MS`) to arm trials and invalidates trials if angular speed exceeds 12 deg/s (`VOID_DPS`).
- **5-Point Affine Calibration & Pointer Homography**:
  - `Pointer.kt:75-187`: Mathematical calibration fitting using Gauss-Jordan elimination on normal equations ($A^T A \cdot h = A^T b$). Degenerate matrix detection (`abs(ata[pivot][col]) < 1e-8f`) protects against division by zero and singular geometries.

### 2.3 Clinical AR Exercise Engines (`Ar1Orofacial.kt` to `Ar6BuddyMimicry.kt`)
1. **AR-1 (Orofacial Kinematics)**:
   - Evaluates `max(mouthPucker, mouthFunnel * 0.8f)` relative to the child's 90-frame baseline rest.
   - Bilateral symmetry error `symmetryError()` checks corner mouth delta against nose tip. If asymmetry > 8%, effective input is scaled down by 65% to prevent reinforcement of facial tics.
   - `HysteresisRewardChannel` (`thetaOn = 0.55`, `thetaOff = 0.45`, 2× progressive decay factor) prevents abrupt resets.
2. **AR-2 (Instrumented VRA)**:
   - `StimulusPlayer.kt:88-142` synthesizes 48 kHz 16-bit PCM tones with 10 ms raised cosine attack/decay ramps. Retrieves hardware presentation timestamp via `AudioTrack.getTimestamp()`.
   - Compares audio presentation time against camera frame capture timestamp `tCaptureUs` adjusted by `clockOffsetUs`.
   - Enforces 500 ms centered arming cone (`abs(yaw) < 5°`), pseudo-random 3–6s inter-trial intervals, ≤2 consecutive same-side limit, and 20% unreinforced catch trials.
   - Bluetooth routing strictly forces `TrialMode.GAME` with explicit `latencyNullReason = "bluetoothOutput"`.
3. **AR-3 (Semantic Fixation)**:
   - Target positions dynamically placed in angular degrees (not static screen pixels).
   - Dual concentric hitboxes (`enterRadius` < `keepRadius = 1.45 * enterRadius`) eliminate boundary chatter.
   - Fixation dwell accumulates only inside target bounding radii; neutral zone presence causes gradual decay (`dwellMs - 2 * dt`).
   - Separate telemetry logging for `firstFixationId` + `tFirstFixationMs` (spontaneous comprehension) versus `selectedId` (confirmed lexical selection).
4. **AR-4 (Spatial Search)**:
   - 4-quadrant peripheral search ($[-22^\circ, 22^\circ]$ yaw, $[0^\circ, 14^\circ]$ pitch).
   - Real-time radar reticle guiding head rotation towards target quadrant.
   - 8.5° foveal alignment threshold held for 650 ms triggers Lúa 3D celebration. RMS yaw variance recorded per trial.
5. **AR-5 (Feed & Catch)**:
   - Dynamic target distance calculation from telemetric estimator ($280\text{ mm} \le d \le 600\text{ mm}$).
   - 650 ms parabolic flight kinematics with velocity ($850\text{ px/s}$) and angle deviation tracking.
   - Auto-throw fallback after 3.5s timeout accommodates children with severe manual motor difficulties.
6. **AR-6 (Buddy Mimicry)**:
   - Multi-praxia prompt pool (`smile`, `jaw_open`, `cheek_puff`, `pucker`).
   - 45-frame initial rest baseline subtraction.
   - Bilateral symmetry verification (`1f - symmetryWorst`) requires >88% symmetry on non-puff exercises.

### 2.4 Host Activity, React Native Bridge & Settings
- **`ValeriaArActivity.kt`**:
  - Fullscreen `sensorLandscape` orientation handling with dynamic `displayRotation()` compensation.
  - Non-face safety watchdog: 5s hint warning, 60s timeout exit, and 8-minute maximum session ceiling.
  - Safe coroutine scope with `crashGuard` (`CoroutineExceptionHandler`) preventing uncaught exception crashes.
  - Clean `onDestroy` teardown order: clear analyzer → unbind camera → shutdown executor → await termination (300ms) → close signal engine → close exercise → stop IMU.
- **`ValeriaArModule.kt` & `valeriaArBridge.ts`**:
  - React Native Old Architecture module (Zero blast radius on existing production blocks).
  - Synchronous capability probe `isSupported()` checks camera hardware and `face_landmarker.task` asset availability.
  - Type-safe JSON serialization converts polymorphic `Ar1Trial`–`Ar6Trial` structures into JS objects without loss of physical units.

---

## 3. MDR Class I SaMD & Zero-PHI Compliance Audit

| Requirement | Regulatory Mandate | Implementation Finding | Status |
|---|---|---|---|
| **Pure Physical Metrics** | SaMD Class I (MDR 2017/745): No on-device automated diagnostic scoring or normative classification | Code transmits strictly milliseconds, angular degrees, RMS jitter, and normalized kinematic ratios ($0.0 \dots 1.0$). Zero automated diagnoses. | **PASS** |
| **Zero-PHI Memory Boundary** | GDPR Art. 9 & HIPAA: Camera frames must remain volatile and never persist to disk or network | Frames handled strictly in RAM via volatile Bitmaps and CameraX `ImageProxy`. Closed in same callback. No caching, disk writing, or network streaming. | **PASS** |
| **Immutable Clinical Thresholds** | Prescribed thresholds must not adapt opaquely during session | `ArThresholds` configured exclusively by caregiver/clinician via `ValeriaAdultChaosPanel`; read-only in all Kotlin exercise classes. | **PASS** |
| **Graceful Degradation** | Missing hardware or models must not break the host application | `isArAvailable()` safely returns `false` on Expo Go / unsupported devices; UI displays caregiver-friendly explanation. | **PASS** |

---

## 4. Adversarial Stress-Testing & Robustness Analysis

### 4.1 Thread Safety & Concurrency
- **Examined Areas**:
  - `FaceSignalEngine.pendingCaptureUs`: Synchronized on dedicated collection monitor with auto-pruning when size exceeds 120 elements.
  - `FaceSignalEngine.lock`: Protects `landmarker` lifecycle during concurrent `analyze()` callbacks and `close()`.
  - `ValeriaArActivity.calLock`: Synchronizes `calSamples` between MediaPipe listener thread and Compose UI coroutine.
  - `FpsMeter` & `PointerJitterMeter`: All mutation and sampling methods guarded with `@Synchronized`.
- **Verdict**: Threading boundaries are rigorously guarded; zero race conditions or `ConcurrentModificationException` hazards found.

### 4.2 Numerical Safety & Boundary Conditions
- **Division-by-Zero & NaN Guards**:
  - `Pointer.kt:80`: `if (abs(d) < 1e-6f) return PointF(Float.NaN, Float.NaN)`
  - `Pointer.kt:173`: Gaussian elimination pivot check `abs(ata[pivot][col]) < 1e-8f`
  - `Ar1Orofacial.kt:143, 151, 163`: Minimum geometry distance guards (`interocular < 1e-4f`, `width < 1e-4f`)
  - `DeviceGeometry.kt:84, 91`: Safe distance guards (`if (distanceMm <= 0f) return 0f`)
  - `FpsMeter.kt:183, 195`: Non-positive interval and denominator checks
- **Verdict**: Math operations are comprehensively protected against singular matrices, zero divisors, and infinite values.

### 4.3 Integrity & Anti-Cheating Verification
- **Audit Findings**:
  - **No hardcoded test scores or bypasses**: All kinematic and audio latency computations derive from real sensor inputs.
  - **No facade classes**: Every exercise engine contains complete signal transformation and trial state machines.
  - **No unverified attestation artifacts**: Static verification commands (`npm run typecheck`, `npm run check:ar-models`, `npm run check:ui-strings`) execute cleanly with exit code 0.

---

## 5. Verified Claims & Test Matrix

```
Gate 1: Static Typecheck (`npm run typecheck`)
Result: Exit code 0 (0 TypeScript errors)

Gate 2: 3D Asset Contract Checker (`npm run check:ar-models`)
Result: 8/8 GLB models verified (<100 KB target, valid quaternion animations), face_landmarker.task SHA-256 verified.

Gate 3: UI Strings Catalog Checker (`npm run check:ui-strings`)
Result: 100% UI strings localized via i18n catalogs; 0 orphan literal strings in .tsx files.
```

---

## 6. Conclusion

The native Kotlin AR subsystem is fully production-ready, clinically sound, compliant with MDR Class I SaMD and Zero-PHI standards, and robust against adverse execution conditions.

**Final Recommendation**: **APPROVE** without modifications.
