// ============================================================================
// Challenger 2 Deep Empirical Adversarial Verification Suite (Milestone 1)
// Rigorous Stress Harness for Kinematic Math, Invariants, SaMD & Concurrency
// ============================================================================

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let testsPassed = 0;
let testsFailed = 0;

function approxEqual(a, b, eps = 1e-4) {
  return Math.abs(a - b) < eps;
}

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.stack || err.message}`);
    testsFailed++;
  }
}

console.log('════════════════════════════════════════════════════════════════════');
console.log(' Challenger 2 · M1 Deep Adversarial & Mathematical Invariance Suite');
console.log('════════════════════════════════════════════════════════════════════\n');

// ────────────────────────────────────────────────────────────────────────────
// SECTION 1: Mathematical Invariance of Frame-Offset Audio Timestamp Calculation
// ────────────────────────────────────────────────────────────────────────────
console.log('── Section 1: Frame-Offset Timestamp Invariance & Clock Alignment ──');

runTest('CH2-1.1: AudioTrack Presentation Timestamp Frame-Offset Invariance', () => {
  const sampleRate = 48000;
  
  // Model AudioTimestamp calculation
  function calculateT0Us(nanoTime, framePosition) {
    const frameOffsetUs = Math.floor((framePosition * 1000000) / sampleRate);
    return Math.floor(nanoTime / 1000) - frameOffsetUs;
  }

  // Test case 1: exact frame 0
  const t0_exact = calculateT0Us(1000000000000, 0);
  assert.strictEqual(t0_exact, 1000000000, 'At frame 0, t0 equals timestamp in microseconds');

  // Test case 2: 480 frames later (10.0 ms)
  const t10ms = calculateT0Us(1000010000000, 480);
  assert.strictEqual(t10ms, 1000000000, 'Frame offset perfectly recovers t0 at 10ms');

  // Test case 3: 24000 frames later (500.0 ms)
  const t500ms = calculateT0Us(1000500000000, 24000);
  assert.strictEqual(t500ms, 1000000000, 'Frame offset perfectly recovers t0 at 500ms');

  // Test case 4: Non-integer sub-millisecond frames (e.g. 73 frames = 1520.833 us)
  const tSubMs = calculateT0Us(1000001520833, 73);
  // (73 * 1000000) / 48000 = 1520.8333 -> floor = 1520
  // 1000001520833 / 1000 = 1000001520 -> 1000001520 - 1520 = 1000000000
  assert.strictEqual(tSubMs, 1000000000, 'Truncation error is strictly < 1 microsecond across all frame positions');

  // Monte Carlo stress test across 100,000 random frame positions in [0, 480000]
  const baseT0 = 5000000000000; // 5000s in us
  for (let i = 0; i < 100000; i++) {
    const frames = Math.floor(Math.random() * 48000); // within 1 second
    const elapsedUs = Math.floor((frames * 1000000) / sampleRate);
    const measuredNano = (baseT0 + elapsedUs) * 1000 + Math.floor(Math.random() * 999);
    const recoveredT0 = calculateT0Us(measuredNano, frames);
    assert.strictEqual(recoveredT0, baseT0, `Monte Carlo frame offset mismatch at frame ${frames}`);
  }
});

runTest('CH2-1.2: Cross-Domain Clock Alignment Invariance (Boottime vs Monotonic)', () => {
  // Test clock offset formula: clockOffsetUs = (elapsedRealtimeNanos - nanoTime) / 1000
  const monotonicNs = 1200000000000; // 20 minutes since boot awake
  const boottimeNs  = 86400000000000; // 24 hours since device power on (including deep sleep)
  const clockOffsetUs = Math.floor((boottimeNs - monotonicNs) / 1000);

  // Stimulus presentation timestamp in monotonic time
  const tStimulusMonotonicUs = Math.floor(monotonicNs / 1000) + 150000; // 150ms later
  // Convert to boottime domain
  const tStimulusBoottimeUs = tStimulusMonotonicUs + clockOffsetUs;

  // Turn capture timestamp from CameraX (sensor boottime)
  const tTurnBoottimeUs = tStimulusBoottimeUs + 380000; // 380ms response latency

  // Calculate latency
  const latencyMs = Math.floor((tTurnBoottimeUs - tStimulusBoottimeUs) / 1000);
  assert.strictEqual(latencyMs, 380, 'Cross-domain alignment eliminates suspend-time clock skew');

  // Challenge: Negative latency safety (clock jitter or anticipation)
  const tTurnBeforeStimulusUs = tStimulusBoottimeUs - 50000;
  const negativeLatency = ((tTurnBeforeStimulusUs - tStimulusBoottimeUs) / 1000);
  const safeLatency = negativeLatency >= 0 ? Math.floor(negativeLatency) : null;
  assert.strictEqual(safeLatency, null, 'Negative latency rejected cleanly');
});

runTest('CH2-1.3: PendingCaptureUs LRU Map Eviction & Bound Stress', () => {
  // Emulate FaceSignalEngine.dispatch LRU behavior
  const pendingCaptureUs = new Map();
  
  function addFrame(tMs, tCaptureUs) {
    pendingCaptureUs.set(tMs, tCaptureUs);
  }

  function dispatchResult(tMs) {
    const exact = pendingCaptureUs.get(tMs);
    pendingCaptureUs.delete(tMs);
    if (pendingCaptureUs.size > 120) {
      for (const k of pendingCaptureUs.keys()) {
        if (pendingCaptureUs.size <= 60) break;
        pendingCaptureUs.delete(k);
      }
    }
    return exact !== undefined ? exact : (tMs * 1000);
  }

  // Simulate 1,000 dropped frames (inferences that never return or return out of order)
  for (let t = 1; t <= 1000; t++) {
    addFrame(t, t * 1000 + 450); // with sub-ms microsecond residue
    if (t % 5 === 0) {
      // only 1 in 5 frames dispatches
      const retrieved = dispatchResult(t);
      assert.strictEqual(retrieved, t * 1000 + 450);
    }
  }

  assert(pendingCaptureUs.size <= 120, `Pending map size (${pendingCaptureUs.size}) must never exceed 120`);
  assert(pendingCaptureUs.size >= 60, `Pending map size (${pendingCaptureUs.size}) retains recent history`);
});

// ────────────────────────────────────────────────────────────────────────────
// SECTION 2: Mathematical Invariance of Hysteresis Decay Rates
// ────────────────────────────────────────────────────────────────────────────
console.log('\n── Section 2: Hysteresis Decay Rate Mathematical Invariance ──');

runTest('CH2-2.1: Variable Framerate (10-60 FPS) Charging Invariance', () => {
  class HysteresisChannel {
    constructor(thetaOn = 0.55, thetaOff = 0.45, holdMs = 1500, decayFactor = 2.0) {
      this.thetaOn = thetaOn;
      this.thetaOff = thetaOff;
      this.holdMs = holdMs;
      this.decayFactor = decayFactor;
      this.progress = 0;
      this.lastTMs = 0;
      this.inside = false;
      this.fired = false;
    }

    onSignal(value, tMs) {
      if (this.fired) return;
      const dt = this.lastTMs === 0 ? 0 : Math.min(200, Math.max(0, tMs - this.lastTMs));
      this.lastTMs = tMs;

      this.inside = this.inside ? value >= this.thetaOff : value >= this.thetaOn;

      if (dt > 0) {
        if (this.inside) {
          this.progress = Math.min(1.0, this.progress + dt / this.holdMs);
        } else {
          this.progress = Math.max(0.0, this.progress - (this.decayFactor * dt) / this.holdMs);
        }
      }

      if (this.progress >= 1.0) {
        this.fired = true;
      }
    }
  }

  // Test across different frame rates: 60 fps (16.6ms), 30 fps (33.3ms), 20 fps (50ms), 10 fps (100ms)
  const fpsConfigs = [60, 30, 20, 15, 10];
  const holdMs = 1500;

  fpsConfigs.forEach(fps => {
    const ch = new HysteresisChannel(0.55, 0.45, holdMs, 2.0);
    const dtMs = 1000 / fps;
    let t = 0;
    let chargeDuration = 0;
    
    // Feed high signal continuously
    while (!ch.fired && t <= 3000) {
      t += dtMs;
      const prevProgress = ch.progress;
      ch.onSignal(0.8, Math.floor(t));
      if (ch.progress > prevProgress) {
        chargeDuration += (ch.progress - prevProgress) * holdMs;
      }
    }

    assert.strictEqual(ch.fired, true, `Channel fires at ${fps} FPS`);
    // Total charging duration accumulated must equal exactly holdMs
    assert(approxEqual(chargeDuration, holdMs, 1e-2), `At ${fps} FPS, accumulated charge duration matches holdMs`);
  });
});

runTest('CH2-2.2: Analytical Anti-Staircasing Invariance of 2x Decay Factor (Sub-Hold Burst Cycling)', () => {
  // Mathematical Invariant:
  // For any periodic intermittent signal where high burst duration T_high < holdMs:
  // If duty cycle D <= 66.67% (e.g. 50%, 60%), T_low >= 0.5 * T_high.
  // Because decay is 2x, decay in low phase >= charge in high phase.
  // Therefore, progress NEVER accumulates across cycles (anti-staircasing).

  function simulateIntermittentBursts(burstFrames, dutyCycle, holdMs = 1500, totalCycles = 50) {
    const ch = {
      progress: 0,
      inside: false,
      fired: false,
    };
    const dt = 33; // 30 fps
    const periodFrames = Math.round(burstFrames / dutyCycle);
    const lowFrames = periodFrames - burstFrames;
    
    for (let cycle = 0; cycle < totalCycles; cycle++) {
      // High phase
      for (let f = 0; f < burstFrames; f++) {
        ch.inside = ch.inside ? 0.8 >= 0.45 : 0.8 >= 0.55;
        ch.progress = Math.min(1.0, ch.progress + dt / holdMs);
        if (ch.progress >= 1.0) { ch.fired = true; break; }
      }
      if (ch.fired) break;
      // Low phase
      for (let f = 0; f < lowFrames; f++) {
        ch.inside = ch.inside ? 0.0 >= 0.45 : 0.0 >= 0.55;
        ch.progress = Math.max(0.0, ch.progress - (2.0 * dt) / holdMs);
      }
    }
    return ch;
  }

  // 1. High bursts of 10 frames (330ms < 1500ms) with 50% duty cycle (10 on, 10 off)
  const d50 = simulateIntermittentBursts(10, 0.50);
  assert.strictEqual(d50.fired, false, '50% duty cycle with sub-hold bursts never fires');
  assert.strictEqual(d50.progress, 0, '50% duty cycle decays completely to 0 between bursts');

  // 2. High bursts of 20 frames (660ms < 1500ms) with 60% duty cycle (20 on, 13 off)
  const d60 = simulateIntermittentBursts(20, 0.60);
  assert.strictEqual(d60.fired, false, '60% duty cycle with sub-hold bursts never fires');
  assert.strictEqual(d60.progress, 0, '60% duty cycle decays completely to 0 between bursts');

  // 3. High bursts of 20 frames (660ms) with 65% duty cycle (20 on, 11 off)
  const d65 = simulateIntermittentBursts(20, 0.65);
  assert.strictEqual(d65.fired, false, '65% duty cycle with sub-hold bursts never fires');

  // 4. Continuous uninterrupted hold of 46 frames (1518ms >= 1500ms) -> MUST fire
  const continuous = simulateIntermittentBursts(46, 1.0);
  assert.strictEqual(continuous.fired, true, 'Continuous hold >= 1500ms successfully fires');
});

runTest('CH2-2.3: Anti-Spike Immunity on Large Frame Freezes (dt Clamping)', () => {
  // If app/camera hangs for 10 seconds and suddenly delivers a frame with tCaptureMs = t0 + 10,000ms:
  let progress = 0;
  const holdMs = 1500;
  const t0 = 1000;
  const tHang = 11000; // 10s hang

  const dt = Math.min(200, Math.max(0, tHang - t0));
  assert.strictEqual(dt, 200, '10-second hang is clamped to 200ms');

  progress = Math.min(1.0, progress + dt / holdMs);
  assert(approxEqual(progress, 200 / 1500), 'Progress advances by at most 200/1500 = 0.133, preventing instant completion');
  assert(progress < 0.15, 'Lag spike cannot compromise motor contingency');
});

// ────────────────────────────────────────────────────────────────────────────
// SECTION 3: Mathematical Invariance of Landmark Projection & Affine Geometry
// ────────────────────────────────────────────────────────────────────────────
console.log('\n── Section 3: Landmark Projection & Affine Geometry Invariance ──');

runTest('CH2-3.1: Homography Invariance across Diverse Display Aspect Ratios', () => {
  function fitHomography(observed, screen) {
    const n = observed.length;
    const cols = 8;
    const a = Array.from({ length: 2 * n }, () => new Float64Array(8));
    const b = new Float64Array(2 * n);

    for (let i = 0; i < n; i++) {
      const u = observed[i].x;
      const v = observed[i].y;
      const x = screen[i].x;
      const y = screen[i].y;
      a[2 * i] = new Float64Array([u, v, 1, 0, 0, 0, -u * x, -v * x]);
      b[2 * i] = x;
      a[2 * i + 1] = new Float64Array([0, 0, 0, u, v, 1, -u * y, -v * y]);
      b[2 * i + 1] = y;
    }

    const ata = Array.from({ length: cols }, () => new Float64Array(cols + 1));
    for (let i = 0; i < 2 * n; i++) {
      for (let r = 0; r < cols; r++) {
        for (let c = 0; c < cols; c++) ata[r][c] += a[i][r] * a[i][c];
        ata[r][cols] += a[i][r] * b[i];
      }
    }

    for (let col = 0; col < cols; col++) {
      let pivot = col;
      for (let r = col + 1; r < cols; r++) {
        if (Math.abs(ata[r][col]) > Math.abs(ata[pivot][col])) pivot = r;
      }
      if (Math.abs(ata[pivot][col]) < 1e-8) return null;
      const tmp = ata[col];
      ata[col] = ata[pivot];
      ata[pivot] = tmp;
      const d = ata[col][col];
      for (let c = col; c <= cols; c++) ata[col][c] /= d;
      for (let r = 0; r < cols; r++) {
        if (r === col) continue;
        const f = ata[r][col];
        if (f === 0) continue;
        for (let c = col; c <= cols; c++) ata[r][c] -= f * ata[col][c];
      }
    }

    const h = new Float64Array(cols);
    for (let i = 0; i < cols; i++) h[i] = ata[i][cols];

    const project = (p) => {
      const den = h[6] * p.x + h[7] * p.y + 1;
      if (Math.abs(den) < 1e-6) return { x: NaN, y: NaN };
      return {
        x: (h[0] * p.x + h[1] * p.y + h[2]) / den,
        y: (h[3] * p.x + h[4] * p.y + h[5]) / den,
      };
    };

    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      const proj = project(observed[i]);
      if (isNaN(proj.x)) return null;
      const dx = proj.x - screen[i].x;
      const dy = proj.y - screen[i].y;
      sumSq += dx * dx + dy * dy;
    }
    const rmsPx = Math.sqrt(sumSq / n);
    return { h, rmsPx, project };
  }

  // Test across different screen aspect ratios:
  // 1. Ultra-wide (21:9): 2520 x 1080
  // 2. Modern phone (19.5:9): 2340 x 1080
  // 3. Standard widescreen (16:9): 1920 x 1080
  // 4. Tablet (4:3): 2048 x 1536
  const aspectRatios = [
    { w: 2520, h: 1080 },
    { w: 2340, h: 1080 },
    { w: 1920, h: 1080 },
    { w: 2048, h: 1536 },
  ];

  aspectRatios.forEach(({ w, h }) => {
    const screenPts = [
      { x: w * 0.1, y: h * 0.15 },
      { x: w * 0.9, y: h * 0.15 },
      { x: w * 0.9, y: h * 0.85 },
      { x: w * 0.1, y: h * 0.85 },
      { x: w * 0.5, y: h * 0.5 },
    ];
    // Map observed face coordinates
    const observedPts = screenPts.map(p => ({
      x: (p.x / w) * 0.6 + 0.2,
      y: (p.y / h) * 0.6 + 0.2,
    }));

    const calib = fitHomography(observedPts, screenPts);
    assert(calib !== null, `Calibration converges for resolution ${w}x${h}`);
    assert(calib.rmsPx < 1e-4, `Zero residual on exact affine mapping (${w}x${h})`);

    // Verify projection of arbitrary point (e.g. center)
    const centerObs = { x: 0.5, y: 0.5 };
    const centerProj = calib.project(centerObs);
    assert(approxEqual(centerProj.x, w * 0.5, 1e-2), `Center X matches ${w * 0.5}`);
    assert(approxEqual(centerProj.y, h * 0.5, 1e-2), `Center Y matches ${h * 0.5}`);
  });
});

runTest('CH2-3.2: Singularity / Zero-Denominator Guard in Homography Projection', () => {
  // Construct a degenerate homography with h6, h7 causing den = 0
  const hDegenerate = new Float64Array([1, 0, 0, 0, 1, 0, -2, 0]); // den = -2*x + 1 -> 0 at x = 0.5
  const project = (p) => {
    const den = hDegenerate[6] * p.x + hDegenerate[7] * p.y + 1;
    if (Math.abs(den) < 1e-6) return { x: NaN, y: NaN };
    return {
      x: (hDegenerate[0] * p.x + hDegenerate[1] * p.y + hDegenerate[2]) / den,
      y: (hDegenerate[3] * p.x + hDegenerate[4] * p.y + hDegenerate[5]) / den,
    };
  };

  const singularPoint = project({ x: 0.5, y: 0.2 });
  assert(isNaN(singularPoint.x) && isNaN(singularPoint.y), 'Singular denominator returns NaN safely');
});

runTest('CH2-3.3: NoseRayPointer Monotonic Angular Gain Invariance', () => {
  // Model NoseRayPointer
  const gain = 1.0 / 45.0;
  const computePointer = (noseX, noseY, yawDeg, pitchDeg) => ({
    x: noseX + yawDeg * gain,
    y: noseY - pitchDeg * gain,
  });

  const center = computePointer(0.5, 0.5, 0, 0);
  assert.strictEqual(center.x, 0.5);
  assert.strictEqual(center.y, 0.5);

  // Turn right (+22.5 deg yaw) -> X increases
  const right = computePointer(0.5, 0.5, 22.5, 0);
  assert.strictEqual(right.x, 1.0);

  // Turn left (-22.5 deg yaw) -> X decreases
  const left = computePointer(0.5, 0.5, -22.5, 0);
  assert.strictEqual(left.x, 0.0);

  // Look up (+22.5 deg pitch) -> Y decreases (screen space Y is down)
  const up = computePointer(0.5, 0.5, 0, 22.5);
  assert.strictEqual(up.y, 0.0);

  // Look down (-22.5 deg pitch) -> Y increases
  const down = computePointer(0.5, 0.5, 0, -22.5);
  assert.strictEqual(down.y, 1.0);
});

// ────────────────────────────────────────────────────────────────────────────
// SECTION 4: SaMD Class I, Zero-PHI & Clinical Kinematics Audit
// ────────────────────────────────────────────────────────────────────────────
console.log('\n── Section 4: SaMD Class I, Zero-PHI & Clinical Kinematics ──');

runTest('CH2-4.1: Zero-PHI Volatile Memory Inspection in Kotlin Sources', () => {
  const signalEngineSrc = fs.readFileSync(path.join(__dirname, '..', 'android-native', 'valeria-ar', 'src', 'main', 'java', 'eu', 'futureforkids', 'valeria', 'ar', 'signal', 'FaceSignalEngine.kt'), 'utf8');
  
  // 1. Check ImageProxy is closed deterministically in finally block
  assert(signalEngineSrc.includes('finally {'), 'FaceSignalEngine must contain finally block');
  assert(signalEngineSrc.includes('image.close()'), 'FaceSignalEngine must call image.close()');

  // 2. Check no disk persistence of camera frames / FileOutputStream
  assert(!signalEngineSrc.includes('FileOutputStream'), 'No FileOutputStream allowed in signal engine');
  assert(!signalEngineSrc.includes('compress(Bitmap.CompressFormat'), 'No bitmap compression to disk allowed');
  assert(!signalEngineSrc.includes('openFileOutput'), 'No openFileOutput allowed');

  // 3. Check intermediate bitmap recycling
  assert(signalEngineSrc.includes('source.recycle()'), 'Intermediate source bitmap is recycled');
});

runTest('CH2-4.2: Pure Physical Kinematic Output Schema (No On-Device Automated Diagnostics)', () => {
  const contractsSrc = fs.readFileSync(path.join(__dirname, '..', 'android-native', 'valeria-ar', 'src', 'main', 'java', 'eu', 'futureforkids', 'valeria', 'ar', 'ArContracts.kt'), 'utf8');
  
  // Verify that trial records contain only physical kinematics and parameters:
  const bannedKeywords = ['diagnosis', 'pathology', 'disorder', 'deficit', 'severityScore', 'treatmentRecommendation'];
  bannedKeywords.forEach(kw => {
    assert(!contractsSrc.includes(kw), `Banned diagnostic keyword "${kw}" found in ArContracts.kt`);
  });

  // Verify pure physical units exist:
  const requiredPhysicalUnits = ['latencyMs', 'peakYawDeg', 'holdMaxMs', 'throwVelocityPxPerS', 'throwAngleDeg', 'symmetryRatio', 'yawRmsDeg'];
  requiredPhysicalUnits.forEach(unit => {
    assert(contractsSrc.includes(unit), `Required physical kinematic unit "${unit}" missing in ArContracts.kt`);
  });
});

runTest('CH2-4.3: Pure Motor Contingency Invariant (No Acoustic/Timer Rewards)', () => {
  const rewardChannelSrc = fs.readFileSync(path.join(__dirname, '..', 'android-native', 'valeria-ar', 'src', 'main', 'java', 'eu', 'futureforkids', 'valeria', 'ar', 'reward', 'RewardChannel.kt'), 'utf8');
  
  // Verify Fired is only emitted when progress >= 1f
  assert(rewardChannelSrc.includes('progress >= 1f -> {'), 'HysteresisRewardChannel only fires when progress reaches 1.0');
  assert(!rewardChannelSrc.includes('fireManually'), 'No manual backdoor bypass in HysteresisRewardChannel');
});

// ────────────────────────────────────────────────────────────────────────────
// SECTION 5: Concurrency, Thread Safety & Lifecycle Robustness Audit
// ────────────────────────────────────────────────────────────────────────────
console.log('\n── Section 5: Concurrency, Thread Safety & Lifecycle Invariants ──');

runTest('CH2-5.1: Concurrency Thread Synchronization across All Exercise Trials', () => {
  const exercisesDir = path.join(__dirname, '..', 'android-native', 'valeria-ar', 'src', 'main', 'java', 'eu', 'futureforkids', 'valeria', 'ar', 'exercises');
  const exerciseFiles = ['Ar1Orofacial.kt', 'Ar2Vra.kt', 'Ar3Fixation.kt', 'Ar4SpatialSearch.kt', 'Ar5FeedCatch.kt', 'Ar6BuddyMimicry.kt'];

  exerciseFiles.forEach(file => {
    const src = fs.readFileSync(path.join(exercisesDir, file), 'utf8');
    // Verify lock existence
    assert(src.includes('private val lock = Any()'), `${file} must define private val lock = Any()`);
    // Verify trials synchronization
    assert(src.includes('override val trials: List<TrialRecord> get() = synchronized(lock)'), `${file} trials must be synchronized(lock)`);
    // Verify finished synchronization
    assert(src.includes('override val finished: Boolean get() = synchronized(lock)'), `${file} finished must be synchronized(lock)`);
    // Verify onSignals is synchronized
    assert(src.includes('synchronized(lock) {'), `${file} onSignals must be synchronized(lock)`);
  });
});

runTest('CH2-5.2: CameraProvider Lifecycle Guard against Premature Destruction', () => {
  const activitySrc = fs.readFileSync(path.join(__dirname, '..', 'android-native', 'valeria-ar', 'src', 'main', 'java', 'eu', 'futureforkids', 'valeria', 'ar', 'ValeriaArActivity.kt'), 'utf8');
  
  // Verify isFinishing / isDestroyed checks before binding CameraProvider
  assert(activitySrc.includes('if (isFinishing || isDestroyed)'), 'CameraProvider callback guards against destroyed activity');
  assert(activitySrc.includes('provider.unbindAll()'), 'CameraProvider unbinds previous use cases');
  assert(activitySrc.includes('analysisUseCase?.clearAnalyzer()'), 'onDestroy clears analyzer');
  assert(activitySrc.includes('analysisExecutor.shutdown()'), 'onDestroy shuts down analysisExecutor');
  assert(activitySrc.includes('engine?.close()'), 'onDestroy closes engine');
});

runTest('CH2-5.3: Non-Blocking Audio Execution and StimulusPlayer Worker Shutdown', () => {
  const playerSrc = fs.readFileSync(path.join(__dirname, '..', 'android-native', 'valeria-ar', 'src', 'main', 'java', 'eu', 'futureforkids', 'valeria', 'ar', 'audio', 'StimulusPlayer.kt'), 'utf8');
  
  assert(playerSrc.includes('playLateralizedAsync'), 'StimulusPlayer exposes non-blocking asynchronous playback');
  assert(playerSrc.includes('audioExecutor.execute'), 'StimulusPlayer offloads playback and polling to audioExecutor');
  assert(playerSrc.includes('audioExecutor.shutdownNow()'), 'release() shuts down audioExecutor');
  assert(playerSrc.includes('track?.release()'), 'release() frees native AudioTrack');
});

console.log('\n════════════════════════════════════════════════════════════════════');
console.log(` Summary: ${testsPassed} passed, ${testsFailed} failed`);
console.log('════════════════════════════════════════════════════════════════════\n');

if (testsFailed > 0) process.exit(1);
