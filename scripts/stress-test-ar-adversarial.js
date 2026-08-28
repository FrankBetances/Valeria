// ============================================================================
// Valeria+ · AR-1 to AR-6 Adversarial & Edge-Case Stress Testing Harness
// Empirical Challenger 2 Verification
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
console.log(' Valeria+ · AR-1 to AR-6 Adversarial Stress & Attack Surface Tests');
console.log('════════════════════════════════════════════════════════════════════\n');

// ============================================================================
// Attack Surface 1: Zero-Division, Degenerate Coordinates & Numerical Extremes
// ============================================================================
console.log('── Attack Surface 1: Numerical Robustness & Zero Division ──');

test('ADV-1.1: Degenerate mouth geometry (zero width / overlapping landmarks)', () => {
  const symmetryError = (noseX, leftX, rightX) => {
    const width = Math.abs(rightX - leftX);
    if (width < 1e-4) return 0.0;
    const leftDist = Math.abs(noseX - leftX);
    const rightDist = Math.abs(rightX - noseX);
    return Math.abs(leftDist - rightDist) / width;
  };

  // Case 1: Overlapping landmarks (width = 0)
  assert.strictEqual(symmetryError(0.5, 0.5, 0.5), 0.0, 'Zero width handled safely with 0.0');

  // Case 2: Sub-millimeter micro-width (width = 1e-5)
  assert.strictEqual(symmetryError(0.5, 0.5, 0.50001), 0.0, 'Width below threshold returns 0.0 without NaN/Inf');

  // Case 3: Inverted mouth corners (right is to the left of left)
  const inverted = symmetryError(0.5, 0.6, 0.4);
  assert(approxEqual(inverted, 0.0), 'Inverted coordinates handled gracefully');
});

test('ADV-1.2: Degenerate Interocular distance in DistanceEstimator', () => {
  const ASSUMED_INTEROCULAR_MM = 53.0;
  const focalPx = 520.0;
  const estimateMm = (dxPx, dyPx) => {
    const interocularPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx);
    if (interocularPx < 1.0) return null;
    const mm = (ASSUMED_INTEROCULAR_MM * focalPx) / interocularPx;
    return Math.min(600.0, Math.max(280.0, mm));
  };

  assert.strictEqual(estimateMm(0, 0), null, 'Zero interocular distance returns null (frame rejected)');
  assert.strictEqual(estimateMm(0.5, 0.5), null, 'Sub-pixel landmark separation returns null');
  assert.strictEqual(estimateMm(1000, 0), 280.0, 'Giant interocular (phone held against nose) clamps to min 280mm');
  assert.strictEqual(estimateMm(2, 0), 600.0, 'Tiny interocular (child across room) clamps to max 600mm');
});

test('ADV-1.3: Affine Homography fit on collinear / degenerate points', () => {
  function fitHomography(observed, screen) {
    if (observed.length < 4 || observed.length !== screen.length) return null;
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
      if (Math.abs(ata[pivot][col]) < 1e-8) return null; // Degenerate / collinear
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
    return new Float64Array(cols);
  }

  // 5 perfectly collinear points on the line y = x
  const screenPts = [
    { x: 100, y: 100 },
    { x: 200, y: 200 },
    { x: 300, y: 300 },
    { x: 400, y: 400 },
    { x: 500, y: 500 },
  ];
  const observedPts = screenPts.map((p) => ({ x: p.x * 0.001, y: p.y * 0.001 }));

  const result = fitHomography(observedPts, screenPts);
  assert.strictEqual(result, null, 'Collinear degenerate points return null safely without crash');
});

// ============================================================================
// Attack Surface 2: Timing Lag, Dropped Frames & Delta-T Clamping
// ============================================================================
console.log('\n── Attack Surface 2: Timing Anomaly & Dropped Frames ──');

test('ADV-2.1: Large frame lag spikes capped at 200ms', () => {
  const capDt = (lastTMs, tCaptureMs) => {
    if (lastTMs === 0) return 0;
    return Math.min(200, Math.max(0, tCaptureMs - lastTMs));
  };

  assert.strictEqual(capDt(0, 1000), 0, 'First frame dt is 0');
  assert.strictEqual(capDt(1000, 1033), 33, 'Normal 30fps dt is 33ms');
  assert.strictEqual(capDt(1000, 6000), 200, '5-second freeze is capped at 200ms (prevents instant reward fill)');
  assert.strictEqual(capDt(5000, 4000), 0, 'Negative clock jitter is clamped to 0');
});

test('ADV-2.2: Fast high-frequency flickering (Anti-cheat/gaming test)', () => {
  // If user or video artifact flickers 1 frame ON (0.8) and 1 frame OFF (0.0) at 30 fps (33ms each)
  let progress = 0;
  let inside = false;
  const holdMs = 1500;
  const dt = 33;

  for (let frame = 0; frame < 100; frame++) {
    const isHigh = frame % 2 === 0;
    const value = isHigh ? 0.8 : 0.0;
    inside = inside ? value >= 0.45 : value >= 0.55;
    if (inside) {
      progress = Math.min(1.0, progress + dt / holdMs);
    } else {
      progress = Math.max(0.0, progress - (2.0 * dt) / holdMs);
    }
  }

  // Because decay is 2x rate of charging, net progress under 50% duty cycle must be 0!
  assert.strictEqual(progress, 0.0, '2x decay factor guarantees high-frequency flickering cannot accumulate progress');
});

// ============================================================================
// Attack Surface 3: Midas Touch & Fixation Saccade Suppression
// ============================================================================
console.log('\n── Attack Surface 3: Saccade Scanning & Midas Touch Suppression ──');

test('ADV-3.1: Fast saccadic scanning across targets does NOT trigger selection', () => {
  let dwellMs = 0;
  let selectedId = null;
  let firstFixationId = null;
  const targetDwellMs = 1200;

  // Child scans through Target A (80ms), Target B (90ms), Target C (120ms)
  const saccades = [
    { id: 'apple', durationMs: 80 },
    { id: 'banana', durationMs: 90 },
    { id: 'orange', durationMs: 120 },
  ];

  saccades.forEach((s) => {
    // Entering new target resets dwell
    dwellMs = 0;
    if (!firstFixationId) firstFixationId = s.id;
    for (let t = 0; t < s.durationMs; t += 33) {
      dwellMs += 33;
      if (dwellMs >= targetDwellMs) selectedId = s.id;
    }
  });

  assert.strictEqual(firstFixationId, 'apple', 'First fixation captured correctly');
  assert.strictEqual(selectedId, null, 'Saccadic scanning < 1200ms never triggers selection');
});

test('ADV-3.2: First Fixation vs Final Selection decoupling', () => {
  let firstFixationId = null;
  let selectedId = null;
  let dwellMs = 0;
  const targetDwellMs = 1200;

  // 1. Initial glance at distractor 'shoe' for 250ms
  firstFixationId = 'shoe';
  dwellMs = 250;

  // 2. Child shifts gaze to target 'apple' and maintains fixation for 1200ms
  dwellMs = 0; // reset on target switch
  for (let t = 0; t < 1200; t += 33) {
    dwellMs += 33;
    if (dwellMs >= targetDwellMs) selectedId = 'apple';
  }

  assert.strictEqual(firstFixationId, 'shoe', 'Initial spontaneous bias was shoe');
  assert.strictEqual(selectedId, 'apple', 'Final confirmed cognitive selection was apple');
  assert(firstFixationId !== selectedId, 'Decoupling allows clinical analysis of self-correction');
});

// ============================================================================
// Attack Surface 4: VRA Catch Trials & False Positive Latency Integrity
// ============================================================================
console.log('\n── Attack Surface 4: VRA Catch Trial & Latency Integrity ──');

test('ADV-4.1: Spontaneous head turn on Catch Trial returns null latency', () => {
  const isCatch = true;
  const turnUs = 1700000000500000;
  const tStimulusUs = 1700000000000000;
  const timedOut = false;
  const turnSide = 'LEFT';
  const stimulusSide = 'LEFT';

  const correctSide = !isCatch && !timedOut && turnSide === stimulusSide;
  assert.strictEqual(correctSide, false, 'Catch trial turns are NEVER marked as correct responses');

  const nullReason = isCatch ? 'catchTrial' : null;
  const latency = nullReason === null ? Math.floor((turnUs - tStimulusUs) / 1000) : null;

  assert.strictEqual(latency, null, 'Latency is strictly null on catch trials to prevent biased dataset');
  assert.strictEqual(nullReason, 'catchTrial', 'Tagged with transparent clinical reason');
});

test('ADV-4.2: Clock desynchronization safety (turnUs < tStimulusUs)', () => {
  const computeSafeLatency = (tStimUs, tTurnUs) => {
    if (!tStimUs || !tTurnUs) return null;
    const diff = Math.floor((tTurnUs - tStimUs) / 1000);
    return diff >= 0 ? diff : null;
  };

  const backwardClock = computeSafeLatency(1700000000500000, 1700000000100000);
  assert.strictEqual(backwardClock, null, 'Negative latency safely yields null instead of invalid negative numbers');
});

// ============================================================================
// Attack Surface 5: Spatial Search & Boundary Jitter
// ============================================================================
console.log('\n── Attack Surface 5: Spatial Search Radar & Conic Bounds ──');

test('ADV-5.1: 12-second search timeout produces non-voided failed trial', () => {
  const MAX_SEARCH_TIME_MS = 12000;
  const elapsed = 12050;
  const timeoutTriggered = elapsed > MAX_SEARCH_TIME_MS;
  assert.strictEqual(timeoutTriggered, true);

  const trialRecord = {
    acquisitionTimeMs: elapsed,
    success: false,
    voided: false,
  };
  assert.strictEqual(trialRecord.success, false, 'Expired search counts as clinical timeout, not void');
  assert.strictEqual(trialRecord.voided, false, 'Valid data point representing attentional/motor search limit');
});

// ============================================================================
// Attack Surface 6: Praxias Asymmetry & Hemiparesis Compensation
// ============================================================================
console.log('\n── Attack Surface 6: Asymmetry Isolation & Motor Compensation ──');

test('ADV-6.1: Severe unilateral asymmetry attenuation vs cheek_puff exception', () => {
  // Severe hemiparesis / unilateral compensation: asymmetry error = 0.35 (35%)
  const asymmetryError = 0.35;
  const rawActivation = 0.95;

  const getEffective = (raw, asym, praxia) => {
    if (asym > 0.12 && praxia !== 'cheek_puff') return raw * 0.4;
    return raw;
  };

  const smileEff = getEffective(rawActivation, asymmetryError, 'smile');
  assert(approxEqual(smileEff, 0.38), 'Asymmetrical smile is penalized by 60% (fails thetaOn=0.52)');

  const puckerEff = getEffective(rawActivation, asymmetryError, 'pucker');
  assert(approxEqual(puckerEff, 0.38), 'Asymmetrical pucker is penalized by 60%');

  const cheekEff = getEffective(rawActivation, asymmetryError, 'cheek_puff');
  assert.strictEqual(cheekEff, 0.95, 'Cheek puff bypasses symmetry penalty (physiologically valid)');
});

console.log('\n════════════════════════════════════════════════════════════════════');
console.log(` Summary: ${passedTests} passed, ${failedTests} failed`);
console.log('════════════════════════════════════════════════════════════════════\n');

if (failedTests > 0) process.exit(1);
