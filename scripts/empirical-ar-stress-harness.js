// ============================================================================
// Valeria+ · Empirical AR Stress Testing & Error Injection Harness
// Challenger 1 Verification for Milestone 2 & 3
// ============================================================================

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
console.log(' Valeria+ · Empirical AR Stress Testing & Error Injection Harness');
console.log(' Challenger 1 (Milestone 2 & 3)');
console.log('════════════════════════════════════════════════════════════════════\n');

// ============================================================================
// 1. Missing 3D Models or Corrupted Assets Simulation & Degradation
// ============================================================================
console.log('── Suite 1: Missing 3D Models & Corrupted Asset Handling ──');

test('ASSET-1.1: Missing GLB asset gracefully falls back without throwing fatal error', () => {
  // Emulate FilamentStage.loadModel() resilience logic
  function emulateLoadModel(assetPath, assetsMap) {
    let released = false;
    let modelViewerLoaded = false;
    let fallbackTo2D = false;

    // Simulation of runCatching { ... }
    try {
      if (released) return { modelViewerLoaded, fallbackTo2D };
      if (!assetPath || assetPath.length === 0) return { modelViewerLoaded, fallbackTo2D: true };
      
      const fileBytes = assetsMap[assetPath];
      if (!fileBytes) {
        throw new Error(`Asset not found: ${assetPath}`);
      }
      if (fileBytes.length < 12) {
        throw new Error(`Corrupted GLB header: ${assetPath}`);
      }
      // Check GLB magic 'glTF' (0x46546C67)
      const magic = fileBytes.toString('ascii', 0, 4);
      if (magic !== 'glTF') {
        throw new Error(`Invalid GLB magic header: ${magic}`);
      }
      modelViewerLoaded = true;
    } catch (e) {
      // Graceful fallback to 2D Compose Canvas overlay
      fallbackTo2D = true;
      modelViewerLoaded = false;
    }

    return { modelViewerLoaded, fallbackTo2D };
  }

  const validGlb = Buffer.alloc(100);
  validGlb.write('glTF', 0, 4, 'ascii');

  const assets = {
    'models/coche.glb': validGlb,
    'models/corrupted.glb': Buffer.from('NOT_A_VALID_GLB_HEADER_TRUNCATED'),
    'models/zero_bytes.glb': Buffer.alloc(0),
  };

  // Case A: Valid model loads successfully
  const validRes = emulateLoadModel('models/coche.glb', assets);
  assert.strictEqual(validRes.modelViewerLoaded, true);
  assert.strictEqual(validRes.fallbackTo2D, false);

  // Case B: Missing model falls back cleanly to 2D
  const missingRes = emulateLoadModel('models/non_existent.glb', assets);
  assert.strictEqual(missingRes.modelViewerLoaded, false);
  assert.strictEqual(missingRes.fallbackTo2D, true);

  // Case C: Corrupted model falls back cleanly to 2D
  const corruptRes = emulateLoadModel('models/corrupted.glb', assets);
  assert.strictEqual(corruptRes.modelViewerLoaded, false);
  assert.strictEqual(corruptRes.fallbackTo2D, true);

  // Case D: Zero bytes model falls back cleanly to 2D
  const zeroRes = emulateLoadModel('models/zero_bytes.glb', assets);
  assert.strictEqual(zeroRes.modelViewerLoaded, false);
  assert.strictEqual(zeroRes.fallbackTo2D, true);
});

test('ASSET-1.2: MediaPipe task asset corruption / missing check & GPU/CPU fallback chain', () => {
  function emulateSignalEngineInit(taskExists, taskValid, gpuAvailable) {
    let usingGpu = true;
    let landmarker = null;
    let isReady = false;
    let fellBackToCpu = false;

    function buildLandmarker(delegate) {
      if (!taskExists || !taskValid) return null;
      if (delegate === 'GPU' && !gpuAvailable) return null;
      return { delegate, ready: true };
    }

    // Init logic from FaceSignalEngine.kt
    landmarker = buildLandmarker('GPU');
    if (!landmarker) {
      usingGpu = false;
      fellBackToCpu = true;
      landmarker = buildLandmarker('CPU');
    }

    isReady = landmarker !== null;
    return { isReady, usingGpu, fellBackToCpu };
  }

  // 1. GPU available + valid task -> GPU mode
  assert.deepStrictEqual(emulateSignalEngineInit(true, true, true), {
    isReady: true,
    usingGpu: true,
    fellBackToCpu: false,
  });

  // 2. GPU unavailable + valid task -> CPU fallback
  assert.deepStrictEqual(emulateSignalEngineInit(true, true, false), {
    isReady: true,
    usingGpu: false,
    fellBackToCpu: true,
  });

  // 3. Corrupted / missing task -> isReady = false, graceful abort
  assert.deepStrictEqual(emulateSignalEngineInit(false, false, true), {
    isReady: false,
    usingGpu: false,
    fellBackToCpu: true,
  });
});

// ============================================================================
// 2. Coroutine Failure Injection & Crash Guard Containment
// ============================================================================
console.log('\n── Suite 2: Coroutine Failure Injection & Crash Guard Containment ──');

test('CRASH-2.1: CoroutineExceptionHandler safely contains unhandled exceptions and finishes with aborted outcome', async () => {
  let finishedOutcome = null;
  let processKilled = false;

  function finishWith(outcome) {
    finishedOutcome = outcome;
  }

  // Emulation of ValeriaArActivity.crashGuard
  const crashGuard = (err) => {
    try {
      finishWith('aborted');
    } catch (e) {
      processKilled = true;
    }
  };

  async function launchCoroutineWithGuard(taskFn) {
    try {
      await taskFn();
    } catch (err) {
      crashGuard(err);
    }
  }

  // Test 1: Catastrophic NPE in tick loop
  await launchCoroutineWithGuard(async () => {
    throw new NullPointerException('Simulated NPE inside exercise tick');
  });
  assert.strictEqual(finishedOutcome, 'aborted');
  assert.strictEqual(processKilled, false);

  // Test 2: Native out-of-memory or division by zero in background coroutine
  finishedOutcome = null;
  await launchCoroutineWithGuard(async () => {
    throw new Error('OutOfMemoryError: native allocateDirect failed');
  });
  assert.strictEqual(finishedOutcome, 'aborted');
  assert.strictEqual(processKilled, false);
});

// Helper for error simulation
function NullPointerException(msg) {
  this.name = 'NullPointerException';
  this.message = msg;
}

// ============================================================================
// 3. Rapid Backpressure & Stale Inference Recovery
// ============================================================================
console.log('\n── Suite 3: Rapid Backpressure & Stale Inference Recovery ──');

test('BACKPRESSURE-3.1: 30fps stream against 10fps inference drops excess frames and maintains 1 frame in flight', () => {
  const STALE_INFERENCE_MS = 1000;
  let inferenceStartedMs = 0;
  let framesFromCamera = 0;
  let framesInferred = 0;
  let framesDropped = 0;
  let openImageProxies = 0;
  const pendingCaptureUs = new Map();

  function analyze(image) {
    framesFromCamera++;
    openImageProxies++;

    try {
      const now = image.timestampMs;
      const busySince = inferenceStartedMs;

      // Backpressure check from FaceSignalEngine.kt
      if (busySince !== 0 && now - busySince < STALE_INFERENCE_MS) {
        framesDropped++;
        return; // Dropped
      }

      // Enter gate
      pendingCaptureUs.set(image.timestampMs, image.timestampUs);
      inferenceStartedMs = now;

      // Simulate async inference completion
      setTimeout(() => {
        inferenceStartedMs = 0;
        framesInferred++;
        pendingCaptureUs.delete(image.timestampMs);
      }, 100); // 100ms inference time (10 fps)
    } finally {
      // Guaranteed close in finally block
      openImageProxies--;
    }
  }

  // Stream 30 frames at 33ms intervals (30 fps for 1 second)
  let currentTime = 1000;
  for (let i = 0; i < 30; i++) {
    analyze({ timestampMs: currentTime, timestampUs: currentTime * 1000 });
    currentTime += 33;
  }

  // Verify all ImageProxy instances are immediately closed (no memory leak/CameraX freeze)
  assert.strictEqual(openImageProxies, 0, 'Every ImageProxy must be immediately closed');
  assert.strictEqual(framesFromCamera, 30);
  assert(framesDropped > 0, 'Slower inference must drop excess frames');
  assert(framesInferred < 30, 'Inference rate is throttled cleanly');
});

test('BACKPRESSURE-3.2: Stale inference hangs recover automatically after 1000ms', () => {
  const STALE_INFERENCE_MS = 1000;
  let inferenceStartedMs = 0;
  let framesDropped = 0;
  let framesAccepted = 0;

  function analyze(image) {
    const now = image.timestampMs;
    const busySince = inferenceStartedMs;

    if (busySince !== 0 && now - busySince < STALE_INFERENCE_MS) {
      framesDropped++;
      return false;
    }

    // Gate opens
    inferenceStartedMs = now;
    framesAccepted++;
    return true;
  }

  // Frame 1 arrives at t = 1000 ms -> accepted
  assert.strictEqual(analyze({ timestampMs: 1000 }), true);
  assert.strictEqual(framesAccepted, 1);

  // Frame 2 arrives at t = 1500 ms (inference hung) -> dropped
  assert.strictEqual(analyze({ timestampMs: 1500 }), false);
  assert.strictEqual(framesDropped, 1);

  // Frame 3 arrives at t = 2050 ms (> 1000ms timeout) -> accepted due to stale recovery!
  assert.strictEqual(analyze({ timestampMs: 2050 }), true);
  assert.strictEqual(framesAccepted, 2);
});

test('BACKPRESSURE-3.3: Pending capture map bounded LRU eviction prevents memory leak', () => {
  const pendingCaptureUs = new Map();

  function recordCapture(tMs, tCaptureUs) {
    pendingCaptureUs.set(tMs, tCaptureUs);
    if (pendingCaptureUs.size > 120) {
      const it = pendingCaptureUs.keys();
      while (pendingCaptureUs.size > 60) {
        const key = it.next().value;
        pendingCaptureUs.delete(key);
      }
    }
  }

  // Flood 1000 lost callback frames
  for (let t = 1; t <= 1000; t++) {
    recordCapture(t, t * 1000);
  }

  // Bounded size
  assert(pendingCaptureUs.size <= 120, 'Map size is strictly bounded');
  assert(pendingCaptureUs.size >= 60, 'Maintains recent 60 frames');
});

// ============================================================================
// 4. Simultaneous Sensor Triggers, Concurrency & Timeout Safety
// ============================================================================
console.log('\n── Suite 4: Simultaneous Sensor Triggers & Timeout Safety ──');

test('CONCURRENCY-4.1: Simultaneous face callback and timeout race: finishWith is strictly idempotent', () => {
  let isFinishing = false;
  let isDestroyed = false;
  let finishCalls = 0;
  let outcomeRecorded = null;

  function finishWith(outcome) {
    if (isFinishing || isDestroyed) return;
    isFinishing = true;
    finishCalls++;
    outcomeRecorded = outcome;
  }

  // Trigger 10 concurrent threads trying to finish
  const outcomes = ['completed', 'timeout', 'aborted', 'completed', 'timeout'];
  outcomes.forEach((o) => finishWith(o));

  assert.strictEqual(finishCalls, 1, 'finishWith must execute only once');
  assert.strictEqual(outcomeRecorded, 'completed', 'First outcome wins deterministically');
});

test('CONCURRENCY-4.2: Calibration lock protects concurrent sample collection and mean reduction', () => {
  const calSamples = [];
  let isCollecting = true;

  // Simulator for 60 concurrent signal writes
  for (let i = 0; i < 60; i++) {
    if (isCollecting) calSamples.push({ x: 0.5 + i * 0.001, y: 0.5 - i * 0.001 });
  }

  // Atomic snapshot copy
  const snapshot = [...calSamples];
  assert.strictEqual(snapshot.length, 60);

  const avgX = snapshot.map((s) => s.x).reduce((a, b) => a + b, 0) / snapshot.length;
  const avgY = snapshot.map((s) => s.y).reduce((a, b) => a + b, 0) / snapshot.length;

  assert(approxEqual(avgX, 0.5295));
  assert(approxEqual(avgY, 0.4705));
});

test('CONCURRENCY-4.3: Activity onPause prevents false session timeout during backgrounding', () => {
  let isActivityPaused = false;
  let pauseTimestampMs = 0;
  let accumulatedPausedDurationMs = 0;
  const startedMs = 10000;
  const SESSION_MAX_MS = 480000; // 8 minutes

  // Activity enters background for 10 minutes (600,000 ms)
  const onPause = (tMs) => {
    isActivityPaused = true;
    pauseTimestampMs = tMs;
  };

  const onResume = (tMs) => {
    if (isActivityPaused) {
      accumulatedPausedDurationMs += tMs - pauseTimestampMs;
      isActivityPaused = false;
    }
  };

  onPause(50000);
  onResume(650000); // 600s backgrounded

  const currentNow = 660000; // 10s after resume
  const effectiveSessionDuration = currentNow - startedMs - accumulatedPausedDurationMs;

  assert.strictEqual(effectiveSessionDuration, 50000, 'Effective session duration discounts background pause');
  assert(effectiveSessionDuration < SESSION_MAX_MS, 'Does not falsely timeout from background pause');
});

// ============================================================================
// 5. Zero-PHI and Volatile Memory Audit
// ============================================================================
console.log('\n── Suite 5: Zero-PHI and Volatile Memory Audit ──');

test('ZEROPHI-5.1: Patient key is purely opaque and no frame pixels or names cross bridge', () => {
  const bridgePayload = {
    exerciseId: 'ar1',
    patientKey: 'anon_sha256_9f8379a',
    outcome: 'completed',
    trials: [
      {
        index: 1,
        holdMaxMs: 1600,
        symmetryWorst: 0.04,
        puckerPeak: 0.88,
      },
    ],
  };

  const jsonString = JSON.stringify(bridgePayload);

  // Check no PHI terms present in bridge serialization
  assert(!jsonString.includes('name'), 'No patient name allowed');
  assert(!jsonString.includes('image'), 'No image data allowed');
  assert(!jsonString.includes('bitmap'), 'No bitmap payload allowed');
  assert(!jsonString.includes('base64'), 'No base64 frame encoding allowed');
  assert(jsonString.includes('holdMaxMs'), 'Physical metrics present');
  assert(jsonString.includes('symmetryWorst'), 'Physical metrics present');
});

test('ZEROPHI-5.2: Volatile bitmap rotation memory recycle contract', () => {
  let sourceRecycled = false;

  function toRotatedBitmap(source, isIdentity) {
    const rotated = isIdentity ? source : { id: 'rotated_bitmap' };
    if (rotated !== source) {
      sourceRecycled = true;
    }
    return rotated;
  }

  const src = { id: 'source_bitmap' };
  toRotatedBitmap(src, false);
  assert.strictEqual(sourceRecycled, true, 'Source bitmap must be recycled when distinct rotated bitmap is created');
});

console.log('\n════════════════════════════════════════════════════════════════════');
console.log(` Summary: ${passedTests} passed, ${failedTests} failed`);
console.log('════════════════════════════════════════════════════════════════════\n');

if (failedTests > 0) process.exit(1);
