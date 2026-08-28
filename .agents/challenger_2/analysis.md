# Empirical Mathematical Challenge & Kinematics Report (AR-1 to AR-6)

**Agent**: Challenger 2 (`challenger_2`)  
**Milestone**: Milestone 3 (Verification, Review & Forensic Integrity Audit)  
**Date**: 2026-08-28T14:16:30+02:00  
**Overall Risk Assessment**: **LOW** (Zero Critical/High Vulnerabilities Found)

---

## 1. Executive Summary

As Challenger 2, an empirical and adversarial challenge was conducted on all clinical motor algorithms across exercises **AR-1 through AR-6** in the Valeria+ Augmented Reality platform (MediaPipe Tasks Vision + Google Filament Engine nativo + React Native TypeScript Bridge).

Empirical validation was performed by writing and executing dedicated mathematical verification test suites:
1. `scripts/verify-ar-clinical-math.js`: 20 unit mathematical and kinematic equivalence tests (20/20 PASSED).
2. `scripts/stress-test-ar-adversarial.js`: 11 adversarial edge-case and attack-surface stress tests (11/11 PASSED).
3. `npm run typecheck`: TypeScript strict compilation (0 errors).
4. `npm run check:ar-models` & `npm run check:ui-strings`: Asset and internationalization contracts verified (PASSED).

All algorithms strictly comply with **SaMD MDR Class I (Zero-PHI)** constraints, recording pure physical magnitudes (degrees, milliseconds, dimensionless 0..1 ratios) without automated diagnostic classification on-device.

---

## 2. Mathematical & Kinematic Verification Matrix (AR-1 to AR-6)

### AR-1: Orofacial Kinematics (`Ar1Orofacial.kt`)
- **Metric Formulation**:
  $$M_{orofacial} = \max(\text{mouthPucker}, \text{mouthFunnel} \times 0.8)$$
  Normalized against resting baseline:
  $$\hat{M} = \text{clamp}_{[0, 1]}\left(\frac{M_{orofacial} - \text{baseline}}{\max(1 - \text{baseline}, 0.15)}\right)$$
  - `[Hecho confirmado]`: The denominator safety clamp `.coerceAtLeast(0.15f)` prevents division by zero when resting baseline approaches 1.0.
  - `[Hecho confirmado]`: Baseline acquisition requires exactly 90 consecutive valid frames (~3 seconds at 30 fps).
- **Bilateral Symmetry**:
  $$\text{asymmetry} = \frac{||x_{nose} - x_L| - |x_R - x_{nose}||}{\text{width}}$$
  - `[Hecho confirmado]`: Symmetry tolerance is set to $8\%$ ($\text{SYMMETRY\_TOLERANCE} = 0.08$). When asymmetry exceeds $8\%$, the effective signal is penalized by factor $0.35$ (`normalized * 0.35f`), preventing false positive rewards from compensatory asymmetric grimaces or jaw compensations.
- **Hysteresis Reward Channel**:
  - Thresholds: $\Theta_{on} = 0.55$, $\Theta_{off} = 0.45$.
  - Progress accumulates linearly: $\Delta p = \Delta t / \text{holdMs}$.
  - Progress decays at $2\times$ rate upon leaving threshold: $\Delta p_{decay} = 2.0 \times \Delta t / \text{holdMs}$.
  - `[Hecho confirmado]`: High-frequency oscillatory flicker (50% duty cycle at 30 fps) cannot accumulate reward due to the $2\times$ decay factor.

---

### AR-2: Visual Reinforcement Audiometry (VRA) (`Ar2Vra.kt`)
- **Armed Posture Conditioning**:
  - Required azimuth: $|Yaw| < 5.0^\circ$ continuous for $\ge 500\text{ ms}$.
  - IMU steady condition: angular speed $< 3.0^\circ/\text{s}$ ($\text{STEADY\_DPS} = 3\text{ f}$).
  - `[Hecho confirmado]`: Stimulus is blocked until true frontal fixation is established, preventing latency contamination from head realignment.
- **Auditory Stimulus & Latency Timing**:
  - Stimulus presentation timestamp $t_{stimulus}$ is obtained in microseconds ($\mu s$) via `AudioTrack.getTimestamp() + clockOffsetUs`.
  - Head turn detection timestamp $t_{turn}$ is captured directly from camera frame capture hardware timestamp (`signals.tCaptureUs`).
  - Turn threshold: $|Yaw| \ge 15.0^\circ$ (configurable $10^\circ - 30^\circ$).
  - Calculated latency: $\text{latencyMs} = (t_{turn} - t_{stimulus}) / 1000$.
- **Catch Trials & Anti-Gaming**:
  - Catch trial rate: $20\%$ ($\text{CATCH\_RATE} = 0.20$).
  - Sequence generator: Maximum 2 consecutive presentations to the same lateralization side.
  - `[Hecho confirmado]`: Catch trials emit no sound, reward channel remains completely disabled, and spontaneous head turns record `latencyMs = null` with `latencyNullReason = "catchTrial"`.

---

### AR-3: Semantic Gaze Fixation & Calibration (`Ar3Fixation.kt`, `Pointer.kt`)
- **5-Point Affine Homography Calibration**:
  - Solves $A^T A h = A^T b$ (10 equations, 8 homography unknowns) using Gaussian elimination with partial pivoting.
  - RMS validation: $\text{RMS}_{px} = \sqrt{\frac{1}{n}\sum (\Delta x_i^2 + \Delta y_i^2)}$, $\text{RMS}_{deg} = \text{RMS}_{px} / \text{pxPerDeg}$.
  - `[Hecho confirmado]`: Collinear or degenerate calibration points are detected when pivot determinant $< 10^{-8}$, returning `null` safely.
- **Dual Hitbox Hysteresis**:
  - $r_{enter} = \text{separationDeg} \times \text{pxPerDeg} \times 0.30$ (minimum $48\text{ px}$).
  - $r_{keep} = 1.45 \times r_{enter}$.
  - `[Hecho confirmado]`: Points in $[r_{enter}, r_{keep}]$ maintain active fixation if already inside, but cannot enter from outside, completely eliminating border jitter / ring chatter.
- **Midas Touch Suppression & Revisit Tracking**:
  - Looking away decays dwell time at $2\times$ rate ($\text{dwellMs} - 2 \cdot \Delta t$).
  - `firstFixationId` and `selectedId` are decoupled, allowing clinical discernment between immediate lexical bias and self-corrected final selection.

---

### AR-4: Spatial Search "Lúa Salvaje" (`Ar4SpatialSearch.kt`)
- **Peripheral Search Geometry**:
  - 4 Quadrants: Left $(-22^\circ, 0^\circ)$, Right $(+22^\circ, 0^\circ)$, Top-Left $(-18^\circ, +14^\circ)$, Top-Right $(+18^\circ, +14^\circ)$.
  - Foveal cone threshold: $\sqrt{\Delta Yaw^2 + \Delta Pitch^2} \le 8.5^\circ$.
  - Required foveal hold: $650\text{ ms}$ continuous.
- **Kinematic Metric Verification**:
  - Acquisition time: Milliseconds from trial start to foveal lock.
  - RMS Jitter: Angular dispersion around mean head pose:
    $$\text{RMS}_{yaw} = \sqrt{\frac{1}{N} \sum_{i=1}^N (Yaw_i - \overline{Yaw})^2}$$
  - `[Hecho confirmado]`: Trials exceeding 12,000 ms timeout close with `success = false` and `voided = false`, recording valid motor search fatigue data.

---

### AR-5: Feed & Catch "Alimentar a Lúa" (`Ar5FeedCatch.kt`)
- **Parabolic Kinematic Trajectory**:
  - Normalized flight duration: $T = 650\text{ ms}$.
  - Progress parameter $\tau(t) = \text{clamp}_{[0, 1]}\left(\frac{t - t_{throw}}{650}\right)$.
  - Parabolic apex: $y(\tau) = 4 H \tau (1 - \tau)$, reaching exact apex $H$ at $\tau = 0.5$ ($325\text{ ms}$) and landing at $\tau = 1.0$.
- **Interocular Distance Estimation**:
  - Formula: $d_{mm} = 53\text{ mm} \times f_{px} / d_{interocular\_px}$.
  - Bounded safety clamp: $[280\text{ mm}, 600\text{ mm}]$.
  - Catch reaction latency: $320\text{ ms}$ registered upon contact.

---

### AR-6: Buddy Mimicry "Buddy Lúa" (`Ar6BuddyMimicry.kt`)
- **4 Guided Praxias**:
  1. `smile`: $\frac{\text{mouthSmileLeft} + \text{mouthSmileRight}}{2}$
  2. `jaw_open`: $\text{jawOpen}$
  3. `cheek_puff`: $\text{cheekPuff}$
  4. `pucker`: $\max(\text{mouthPucker}, \text{mouthFunnel} \times 0.8)$
- **Baseline & Bilateral Symmetry**:
  - 45-frame resting baseline subtraction.
  - Asymmetry error:
    $$\text{asym} = \frac{||x_{nose} - x_L| - |x_R - x_{nose}||}{\text{width}}$$
  - Symmetry Index: $S = 1 - \text{asym} \ge 88\%$ ($1 - 0.12 = 0.88$).
  - `[Hecho confirmado]`: Asymmetry $> 12\%$ triggers a $60\%$ signal penalty (`normalized * 0.4f`) on `smile`, `jaw_open`, and `pucker`, while `cheek_puff` is exempt to accommodate physiologically normal unilateral puffing.

---

## 3. Adversarial Stress Test Results

| Attack Vector | Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| **ADV-1.1** | Overlapping mouth landmarks ($width = 0$) | Return 0.0 without NaN/crash | Returns 0.0 | **PASS** |
| **ADV-1.2** | Interocular distance $< 1\text{ px}$ | Frame rejected (`null`), clamp 280-600mm | Handled safely | **PASS** |
| **ADV-1.3** | Collinear 5-point calibration points | Return `null` safely without crash | Returns `null` | **PASS** |
| **ADV-2.1** | 5000 ms frame freeze / lag spike | $\Delta t$ clamped to 200 ms | Clamped to 200 ms | **PASS** |
| **ADV-2.2** | High-frequency 30 Hz flicker (Anti-cheat) | Net progress remains 0.0 | Progress is 0.0 | **PASS** |
| **ADV-3.1** | Saccadic scanning across targets ($< 120\text{ ms}$) | No accidental target selection | No selection | **PASS** |
| **ADV-3.2** | First fixation vs final selection shift | Independent logging of both IDs | Decoupled | **PASS** |
| **ADV-4.1** | Catch trial spontaneous turn | Latency is null, `correctSide=false` | Null with reason | **PASS** |
| **ADV-4.2** | Backward clock timestamp ($t_{turn} < t_{stim}$) | Return null latency | Returns null | **PASS** |
| **ADV-5.1** | 12-second spatial search timeout | Mark `success=false, voided=false` | Correctly marked | **PASS** |
| **ADV-6.1** | Severe unilateral facial asymmetry (35%) | Signal penalized by 60% | Penalized to 0.4 | **PASS** |

---

## 4. MDR Class I Regulatory Verification

- **Zero-PHI Compliance**: No video frames or biometric face meshes are saved, buffered, or transmitted over network. All inference occurs in volatile RAM via MediaPipe live stream mode.
- **Pure Physical Quantities**: All telemetry schemas emit raw physical units ($\text{ms}, ^\circ, \text{px/s}, \text{mm}$, dimensionless $0..1$ ratios).
- **Zero In-Device Diagnostics**: No automated classifications, percentile bands, or automatic difficulty shifts are performed.
- **Hardware Profile Sealing**: Every session seals `DeviceProfile` (fpsP5, thermalSlope, timestampSource, audioJitterMs, clockOffsetUs), treating hardware discrepancies as regression covariates rather than clinical variances.

---

## 5. Static Quality Gate Results

- `npm run typecheck`: **0 errors** (Passed)
- `npm run check:ar-models`: **8/8 models verified** (Passed)
- `npm run check:ui-strings`: **100% i18n catalog coverage** (Passed)

---

## 6. Challenger Conclusion

The mathematical, kinematic, and clinical motor logic across AR-1 through AR-6 is mathematically sound, robust against edge cases, and compliant with all project requirements.

**Verdict**: **APPROVE**
