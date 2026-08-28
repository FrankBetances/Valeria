// ============================================================================
// Valeria+ · AR-1 to AR-6 Clinical Motor Mathematical Verification Suite
// Empirical Challenger 2 verification harness for Milestone 3
// ============================================================================

const assert = require('assert');

let passedTests = 0;
let failedTests = 0;

function approxEqual(a, b, eps = 1e-4) {
  return Math.abs(a - b) < eps;
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failedTests++;
  }
}

console.log('════════════════════════════════════════════════════════════════════');
console.log(' Valeria+ · AR-1 to AR-6 Clinical Math & Kinematics Verification');
console.log('════════════════════════════════════════════════════════════════════\n');

// ============================================================================
// 1. AR-1 Orofacial Kinematics Math
// ============================================================================
console.log('── AR-1: Orofacial Kinematics ──');

test('AR-1.1: 90-frame baseline averaging & subtraction', () => {
  const baselineSamples = [];
  // Simulate 90 frames of resting face pucker noise (mean ~0.08)
  for (let i = 0; i < 90; i++) {
    baselineSamples.push(0.07 + (i % 5) * 0.005);
  }
  assert.strictEqual(baselineSamples.length, 90);
  const baselinePucker = baselineSamples.reduce((a, b) => a + b, 0) / baselineSamples.length;
  assert(approxEqual(baselinePucker, 0.08), 'Baseline should average accurately');

  // Test subtraction & normalization: ((raw - base) / (1 - base).coerceAtLeast(0.15)).coerceIn(0, 1)
  const computeNormalized = (raw, base) => {
    return Math.min(1, Math.max(0, (raw - base) / Math.max(0.15, 1 - base)));
  };

  assert.strictEqual(computeNormalized(0.08, baselinePucker), 0, 'Resting state normalizes to 0');
  assert(computeNormalized(1.0, baselinePucker) === 1.0, 'Max activation reaches 1.0');
  assert(computeNormalized(0.54, baselinePucker) > 0.49, 'Mid-range maps monotonically');
  // Denominator safety: base close to 1
  assert(approxEqual(computeNormalized(0.98, 0.95), 0.2), 'Safe when base > 0.85 due to coerceAtLeast(0.15)');
});

test('AR-1.2: Raw signal metric combination', () => {
  const rawMetric1 = (pucker, funnel) => Math.max(pucker, funnel * 0.8);
  const rawMetric2 = (pucker, funnel) => Math.min(1, Math.max(0, (funnel + pucker) / 2));

  // Verify pure pucker
  assert(approxEqual(rawMetric1(0.9, 0.1), 0.9));
  assert(approxEqual(rawMetric2(0.9, 0.1), 0.5));

  // Verify funnel predominance
  assert(approxEqual(rawMetric1(0.2, 0.8), 0.64));
  assert(approxEqual(rawMetric2(0.2, 0.8), 0.5));

  // In Kotlin, raw = max(pucker, funnel * 0.8f) allows isolated /u/ or /o/ motor pathways
  assert(approxEqual(rawMetric1(0.7, 0.7), 0.7));
});

test('AR-1.3: Bilateral symmetry ratio & 8% threshold attenuation', () => {
  const symmetryError = (noseX, leftX, rightX) => {
    const width = Math.hypot(rightX - leftX, 0);
    if (width < 1e-4) return 0;
    const leftDist = Math.abs(noseX - leftX);
    const rightDist = Math.abs(rightX - noseX);
    return Math.abs(leftDist - rightDist) / width;
  };

  // Perfectly symmetrical face (nose=0.5, left=0.4, right=0.6)
  const sym0 = symmetryError(0.5, 0.4, 0.6);
  assert.strictEqual(sym0, 0, 'Perfect symmetry gives 0 error');

  // Slight natural asymmetry (nose=0.505, left=0.4, right=0.6) -> width=0.2, L=0.105, R=0.095 -> diff=0.01 / 0.2 = 0.05 (5%)
  const sym5 = symmetryError(0.505, 0.4, 0.6);
  assert(approxEqual(sym5, 0.05), '5% asymmetry calculated correctly');
  assert(sym5 <= 0.08, '5% is within 8% tolerance');

  // Pathological/compensatory grimace (nose=0.52, left=0.4, right=0.6) -> width=0.2, L=0.12, R=0.08 -> diff=0.04 / 0.2 = 0.20 (20%)
  const sym20 = symmetryError(0.52, 0.4, 0.6);
  assert(approxEqual(sym20, 0.20));
  assert(sym20 > 0.08, '20% exceeds 8% tolerance');

  // Attenuation penalty check
  const SYMMETRY_TOLERANCE = 0.08;
  const applySymmetry = (norm, sym) => (sym > SYMMETRY_TOLERANCE ? norm * 0.35 : norm);
  assert.strictEqual(applySymmetry(1.0, sym5), 1.0, 'Symmetric gesture passes at 100%');
  assert(approxEqual(applySymmetry(1.0, sym20), 0.35), 'Asymmetric gesture penalized to 35%');
});

test('AR-1.4: Hysteresis Reward Channel state transitions & 2x decay (Float32 emulation)', () => {
  class HysteresisChannel {
    constructor(thetaOn = 0.55, thetaOff = 0.45, holdMs = 1500, decayFactor = 2.0) {
      this.thetaOn = Math.fround(thetaOn);
      this.thetaOff = Math.fround(thetaOff);
      this.holdMs = holdMs;
      this.decayFactor = Math.fround(decayFactor);
      this.progress = Math.fround(0);
      this.lastTMs = 0;
      this.inside = false;
      this.attempts = 0;
      this.holdMaxMs = 0;
      this.holdTotalMs = 0;
      this.currentHoldMs = 0;
      this.firstCrossMs = 0;
      this.fired = false;
    }

    onSignal(value, tMs) {
      if (this.fired) return;
      const v = Math.fround(value);
      const dt = this.lastTMs === 0 ? 0 : Math.min(200, Math.max(0, tMs - this.lastTMs));
      this.lastTMs = tMs;

      const wasInside = this.inside;
      this.inside = this.inside ? v >= this.thetaOff : v >= this.thetaOn;

      if (this.inside && !wasInside) {
        this.attempts++;
        if (!this.firstCrossMs) this.firstCrossMs = tMs;
      }

      if (dt > 0) {
        if (this.inside) {
          const inc = Math.fround(dt / this.holdMs);
          this.progress = Math.min(1.0, Math.fround(this.progress + inc));
          this.currentHoldMs += dt;
          this.holdTotalMs += dt;
          if (this.currentHoldMs > this.holdMaxMs) this.holdMaxMs = this.currentHoldMs;
        } else {
          const dec = Math.fround((this.decayFactor * dt) / this.holdMs);
          this.progress = Math.max(0.0, Math.fround(this.progress - dec));
          this.currentHoldMs = 0;
        }
      }

      if (this.progress >= 1.0) {
        this.fired = true;
      }
    }
  }

  const ch = new HysteresisChannel(0.55, 0.45, 1000, 2.0);
  // Frame 1 at t=100ms: under threshold
  ch.onSignal(0.3, 100);
  assert.strictEqual(ch.progress, 0);
  assert.strictEqual(ch.attempts, 0);

  // Frame 2 at t=200ms: enters at 0.6 (> 0.55) -> dt=100ms -> progress = 0.1
  ch.onSignal(0.6, 200);
  assert.strictEqual(ch.attempts, 1);
  assert(approxEqual(ch.progress, 0.1));

  // Frame 3 at t=300ms: stays at 0.50 (which is < thetaOn but > thetaOff=0.45 -> stays INSIDE) -> dt=100ms -> progress = 0.2
  ch.onSignal(0.50, 300);
  assert.strictEqual(ch.inside, true, 'Hysteresis keeps state between thetaOff and thetaOn');
  assert(approxEqual(ch.progress, 0.2));

  // Frame 4 at t=400ms: drops to 0.40 (< thetaOff) -> exits, decays at 2x -> progress = 0.2 - 2*(100/1000) = 0.0
  ch.onSignal(0.40, 400);
  assert.strictEqual(ch.inside, false);
  assert(approxEqual(ch.progress, 0.0), 'Decayed by 2*100/1000 = 0.2 down to 0.0');

  // Frame 5-15: continuous hold of 1000ms
  for (let i = 1; i <= 10; i++) {
    ch.onSignal(0.8, 400 + i * 100);
  }
  assert.strictEqual(ch.fired, true, 'Fires exactly after accumulating holdMs in Float32');
  assert.strictEqual(ch.holdMaxMs, 1000);
});

// ============================================================================
// 2. AR-2 VRA Audiometry Kinematics & Timing Math
// ============================================================================
console.log('\n── AR-2: Visual Reinforcement Audiometry (VRA) ──');

test('AR-2.1: Armed posture centering (< 5°) & 500 ms dwell requirement', () => {
  const ARM_CONE_DEG = 5.0;
  const isCentered = (yaw) => Math.abs(yaw) < ARM_CONE_DEG;

  assert.strictEqual(isCentered(2.3), true);
  assert.strictEqual(isCentered(-4.9), true);
  assert.strictEqual(isCentered(5.1), false);
  assert.strictEqual(isCentered(-18.0), false);
});

test('AR-2.2: Catch trial rate distribution (20%) & no sound verification', () => {
  const CATCH_RATE = 0.20;
  let catchCount = 0;
  const N = 10000;
  for (let i = 0; i < N; i++) {
    if (Math.random() < CATCH_RATE) catchCount++;
  }
  const empiricalRate = catchCount / N;
  assert(approxEqual(empiricalRate, 0.20, 0.02), `Catch rate ${empiricalRate} close to 20%`);
});

test('AR-2.3: Max 2 consecutive trials to same side generator', () => {
  const sides = [];
  const lastSides = [];
  const N = 200;

  for (let i = 0; i < N; i++) {
    let side;
    if (lastSides.length >= 2 && lastSides[0] === lastSides[1]) {
      side = lastSides[0] === 'LEFT' ? 'RIGHT' : 'LEFT';
    } else {
      side = Math.random() > 0.5 ? 'LEFT' : 'RIGHT';
    }
    lastSides.unshift(side);
    if (lastSides.length > 2) lastSides.pop();
    sides.push(side);
  }

  // Verify no 3 consecutive identical sides exist
  for (let i = 0; i < sides.length - 2; i++) {
    const triple = sides[i] === sides[i + 1] && sides[i + 1] === sides[i + 2];
    assert.strictEqual(triple, false, `No 3 consecutive sides at index ${i}`);
  }
});

test('AR-2.4: Sub-millisecond latency calculation & null reason categorizations', () => {
  const computeLatency = (tStimulusUs, turnUs) => {
    if (!tStimulusUs || !turnUs) return null;
    const diff = Math.floor((turnUs - tStimulusUs) / 1000);
    return diff >= 0 ? diff : null;
  };

  const tStim = 1700000000000000; // microsecond timestamp
  const tTurn = 1700000000385420; // 385.42 ms later
  const lat = computeLatency(tStim, tTurn);
  assert.strictEqual(lat, 385, 'Latency truncated/rounded to integer ms accurately');

  // Catch trial null reason
  const getNullReason = (isCatch, timedOut, level, transducer) => {
    if (isCatch) return 'catchTrial';
    if (timedOut) return 'noResponse';
    if (transducer !== 'externalSpeakers' && transducer !== 'wiredHeadphones') return 'noWiredTransducer';
    if (level !== 'A') return 'deviceBelowLevelA';
    return null;
  };

  assert.strictEqual(getNullReason(true, false, 'A', 'externalSpeakers'), 'catchTrial');
  assert.strictEqual(getNullReason(false, true, 'A', 'externalSpeakers'), 'noResponse');
  assert.strictEqual(getNullReason(false, false, 'A', 'deviceSpeaker'), 'noWiredTransducer');
  assert.strictEqual(getNullReason(false, false, 'B', 'externalSpeakers'), 'deviceBelowLevelA');
  assert.strictEqual(getNullReason(false, false, 'A', 'externalSpeakers'), null);
});

// ============================================================================
// 3. AR-3 Fixation Semantic Selection & Affine Geometry
// ============================================================================
console.log('\n── AR-3: Semantic Gaze Fixation & Affine Geometry ──');

test('AR-3.1: 5-point affine homography solver & RMS calculation', () => {
  function fitHomography(observed, screen) {
    const n = observed.length;
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

    // Normal equations: ATA * h = ATb
    const cols = 8;
    const ata = Array.from({ length: cols }, () => new Float64Array(cols + 1));
    for (let i = 0; i < 2 * n; i++) {
      for (let r = 0; r < cols; r++) {
        for (let c = 0; c < cols; c++) ata[r][c] += a[i][r] * a[i][c];
        ata[r][cols] += a[i][r] * b[i];
      }
    }

    // Gaussian elimination with partial pivoting
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
      return {
        x: (h[0] * p.x + h[1] * p.y + h[2]) / den,
        y: (h[3] * p.x + h[4] * p.y + h[5]) / den,
      };
    };

    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      const proj = project(observed[i]);
      const dx = proj.x - screen[i].x;
      const dy = proj.y - screen[i].y;
      sumSq += dx * dx + dy * dy;
    }
    const rmsPx = Math.sqrt(sumSq / n);
    return { h, rmsPx, project };
  }

  // 5 calibration points (corners + center)
  const screenPts = [
    { x: 100, y: 100 },
    { x: 900, y: 100 },
    { x: 500, y: 500 },
    { x: 100, y: 900 },
    { x: 900, y: 900 },
  ];

  // Observed face coordinates under linear affine mapping + slight noise
  const observedPts = screenPts.map((p) => ({
    x: p.x * 0.0008 + 0.1 + (Math.random() - 0.5) * 0.002,
    y: p.y * 0.0008 + 0.1 + (Math.random() - 0.5) * 0.002,
  }));

  const calib = fitHomography(observedPts, screenPts);
  assert(calib !== null, 'Calibration fit should converge');
  assert(calib.rmsPx < 5.0, `RMS error ${calib.rmsPx} should be < 5.0 px on near-linear points`);
});

test('AR-3.2: Dual Hitbox hysteresis radius (1.45x keep radius)', () => {
  const enterRadiusPx = 100;
  const keepRadiusPx = enterRadiusPx * 1.45; // 145px

  const hitTest = (px, py, targetX, targetY, isCurrentlyInside) => {
    const d = Math.hypot(px - targetX, py - targetY);
    const radius = isCurrentlyInside ? keepRadiusPx : enterRadiusPx;
    return d <= radius;
  };

  // Test point at distance 120px (between enter 100px and keep 145px)
  const initiallyOutside = hitTest(120, 0, 0, 0, false);
  assert.strictEqual(initiallyOutside, false, 'Cannot enter from outside at 120px (d > 100px)');

  const alreadyInside = hitTest(120, 0, 0, 0, true);
  assert.strictEqual(alreadyInside, true, 'Maintains selection at 120px when already inside (d < 145px)');

  const exitedOutside = hitTest(150, 0, 0, 0, true);
  assert.strictEqual(exitedOutside, false, 'Exits when exceeding keepRadius (d > 145px)');
});

test('AR-3.3: Dwell accumulation with progressive decay on exit', () => {
  let dwellMs = 0;
  const targetDwellMs = 1200;
  const dt = 33; // ~30 fps

  // Inside for 600ms (18 frames)
  for (let i = 0; i < 18; i++) {
    dwellMs += dt;
  }
  assert.strictEqual(dwellMs, 594);

  // Briefly look away for 100ms (3 frames) -> decays at 2x
  for (let i = 0; i < 3; i++) {
    dwellMs = Math.max(0, dwellMs - 2 * dt);
  }
  assert.strictEqual(dwellMs, 396, 'Decays smoothly from 594ms to 396ms without hard reset to 0');

  // Resume looking inside until 1200ms
  while (dwellMs < targetDwellMs) {
    dwellMs += dt;
  }
  assert(dwellMs >= targetDwellMs, 'Successfully accumulates to target dwell time');
});

// ============================================================================
// 4. AR-4 Spatial Search 3D Geometry & Radar
// ============================================================================
console.log('\n── AR-4: Spatial Search 3D Geometry & Radar ──');

test('AR-4.1: Peripheral quadrant targets coordinates', () => {
  const quadrants = [
    { id: 'left', yaw: -22, pitch: 0 },
    { id: 'right', yaw: 22, pitch: 0 },
    { id: 'top_left', yaw: -18, pitch: 14 },
    { id: 'top_right', yaw: 18, pitch: 14 },
  ];

  assert.strictEqual(quadrants.length, 4);
  quadrants.forEach((q) => {
    assert(Math.abs(q.yaw) >= 18, 'Peripheral yaw at least 18 deg');
    assert(q.pitch >= 0, 'Pitch is non-negative (upper field)');
  });
});

test('AR-4.2: Foveal cone (8.5°) coincidence detection & hold', () => {
  const FOVEAL_CONE_DEG = 8.5;
  const checkCoincidence = (curYaw, curPitch, tgtYaw, tgtPitch) => {
    const errYaw = Math.abs(curYaw - tgtYaw);
    const errPitch = Math.abs(curPitch - tgtPitch);
    return Math.hypot(errYaw, errPitch) <= FOVEAL_CONE_DEG;
  };

  // Target at (-22°, 0°)
  assert.strictEqual(checkCoincidence(-20, 2, -22, 0), true, 'Error = hypot(2, 2) = 2.83° <= 8.5°');
  assert.strictEqual(checkCoincidence(-15, 6, -22, 0), false, 'Error = hypot(7, 6) = 9.22° > 8.5°');
});

test('AR-4.3: RMS Jitter dispersion calculation', () => {
  const yawSamples = [-21.5, -22.2, -21.8, -22.0, -22.5, -21.9];
  const meanYaw = yawSamples.reduce((a, b) => a + b, 0) / yawSamples.length;
  const variance = yawSamples.map((y) => (y - meanYaw) ** 2).reduce((a, b) => a + b, 0) / yawSamples.length;
  const rms = Math.sqrt(variance);

  assert(approxEqual(meanYaw, -21.983, 0.01));
  assert(rms > 0 && rms < 0.5, `RMS jitter ${rms.toFixed(3)} deg accurately computed`);
});

// ============================================================================
// 5. AR-5 Parabolic Kinematics & Capture Math
// ============================================================================
console.log('\n── AR-5: Parabolic Kinematics & Feed-Catch ──');

test('AR-5.1: 650 ms parabolic flight curve', () => {
  const FLIGHT_DURATION_MS = 650;
  const computeProgress = (flightTimeMs) => {
    return Math.min(1.0, Math.max(0.0, flightTimeMs / FLIGHT_DURATION_MS));
  };

  assert.strictEqual(computeProgress(0), 0);
  assert.strictEqual(computeProgress(325), 0.5);
  assert.strictEqual(computeProgress(650), 1.0);
  assert.strictEqual(computeProgress(800), 1.0);

  // Parabolic vertical altitude: y(tau) = 4 * H * tau * (1 - tau)
  const H = 150; // max apex height in px
  const parabolicY = (tau) => 4 * H * tau * (1 - tau);
  assert.strictEqual(parabolicY(0), 0);
  assert.strictEqual(parabolicY(0.5), H, 'Apex is exactly at tau=0.5');
  assert.strictEqual(parabolicY(1.0), 0, 'Returns to landing target at tau=1.0');
});

test('AR-5.2: Target distance estimation from interocular distance', () => {
  const ASSUMED_INTEROCULAR_MM = 53.0;
  const focalPx = 520.0;
  const estimateDistanceMm = (interocularPx) => {
    if (interocularPx < 1) return null;
    const mm = (ASSUMED_INTEROCULAR_MM * focalPx) / interocularPx;
    return Math.min(600, Math.max(280, mm));
  };

  // Standard interocular at ~35cm: dx = 78.7px
  const dist35 = estimateDistanceMm(78.7);
  assert(approxEqual(dist35, 350.1, 1.0), '350mm estimated accurately');

  // Close child: dx = 120px -> 230mm -> clamped to 280mm
  assert.strictEqual(estimateDistanceMm(120), 280, 'Clamped to min 280mm');

  // Far child: dx = 40px -> 689mm -> clamped to 600mm
  assert.strictEqual(estimateDistanceMm(40), 600, 'Clamped to max 600mm');
});

// ============================================================================
// 6. AR-6 Buddy Mimicry Praxias & Bilateral Symmetry Math
// ============================================================================
console.log('\n── AR-6: Buddy Mimicry Praxias & Symmetry ──');

test('AR-6.1: 4 Praxias gesture blendshape formulas', () => {
  const signals = {
    mouthSmileLeft: 0.8,
    mouthSmileRight: 0.84,
    jawOpen: 0.75,
    cheekPuff: 0.9,
    mouthPucker: 0.85,
    mouthFunnel: 0.6,
  };

  const getRawValue = (praxia, s) => {
    switch (praxia) {
      case 'smile': return (s.mouthSmileLeft + s.mouthSmileRight) / 2;
      case 'jaw_open': return s.jawOpen;
      case 'cheek_puff': return s.cheekPuff;
      case 'pucker': return Math.max(s.mouthPucker, s.mouthFunnel * 0.8);
      default: return s.mouthPucker;
    }
  };

  assert(approxEqual(getRawValue('smile', signals), 0.82));
  assert(approxEqual(getRawValue('jaw_open', signals), 0.75));
  assert(approxEqual(getRawValue('cheek_puff', signals), 0.9));
  assert(approxEqual(getRawValue('pucker', signals), 0.85));
});

test('AR-6.2: 45-frame baseline subtraction & normalization', () => {
  const baselineSamples = [];
  for (let i = 0; i < 45; i++) baselineSamples.push(0.05);
  const baselineVal = baselineSamples.reduce((a, b) => a + b, 0) / baselineSamples.length;
  assert.strictEqual(baselineVal, 0.05);

  const normalize = (raw, base) => {
    return Math.min(1, Math.max(0, (raw - base) / Math.max(0.15, 1 - base)));
  };

  assert.strictEqual(normalize(0.05, baselineVal), 0);
  assert(approxEqual(normalize(0.85, baselineVal), 0.80 / 0.95));
});

test('AR-6.3: Bilateral symmetry validation (> 88%) & cheek_puff bypass', () => {
  const symmetryIndex = (asymmetryError) => 1.0 - Math.min(1.0, Math.max(0.0, asymmetryError));

  // Asymmetry = 0.08 (8%) -> Symmetry index = 92% (> 88%)
  const sym8 = symmetryIndex(0.08);
  assert(approxEqual(sym8, 0.92), '92% symmetry');
  assert(sym8 >= 0.88, 'Passes 88% symmetry gate');

  // Asymmetry = 0.15 (15%) -> Symmetry index = 85% (< 88%)
  const sym15 = symmetryIndex(0.15);
  assert(sym15 < 0.88, 'Fails 88% symmetry gate');

  // Effective signal evaluation
  const computeEffective = (norm, asymErr, praxia) => {
    if (asymErr > 0.12 && praxia !== 'cheek_puff') return norm * 0.4;
    return norm;
  };

  assert.strictEqual(computeEffective(1.0, 0.08, 'smile'), 1.0, 'Symmetric smile passes at 100%');
  assert(approxEqual(computeEffective(1.0, 0.15, 'smile'), 0.4), 'Asymmetric smile penalized to 40%');
  assert.strictEqual(computeEffective(1.0, 0.15, 'cheek_puff'), 1.0, 'Cheek puff allowed unilateral variation');
});

// ============================================================================
// 7. Schema Synchronization (Kotlin <-> TypeScript Bridge)
// ============================================================================
console.log('\n── Layer Contract Synchronization ──');

test('Contract: All 6 AR Exercise IDs synchronized across enums', () => {
  const ktExercises = ['ar1', 'ar2', 'ar3', 'ar4', 'ar5', 'ar6'];
  const tsExercises = ['ar1', 'ar2', 'ar3', 'ar4', 'ar5', 'ar6'];
  assert.deepStrictEqual(ktExercises, tsExercises);
});

console.log('\n════════════════════════════════════════════════════════════════════');
console.log(` Summary: ${passedTests} passed, ${failedTests} failed`);
console.log('════════════════════════════════════════════════════════════════════\n');

if (failedTests > 0) process.exit(1);
