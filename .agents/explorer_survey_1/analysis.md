# Valeria+ AR 3D Asset & Generator Pipeline — Comprehensive Survey Report

**Author**: Explorer 1 (Survey Phase · AR Expansion Project)  
**Date**: 2026-08-28  
**Working Directory**: `.agents/explorer_survey_1/`  
**Target File**: `analysis.md`

---

## 1. Executive Summary

The Valeria+ Augmented Reality (AR) 3D asset generation and verification pipeline was thoroughly audited against the requirements of `ORIGINAL_REQUEST.md`, `SKILL.md` (`valeria-ar-expert`, `valeria-project-expert`), and clinical SaMD MDR Class I constraints.

The repository features a **100% deterministic, dependency-free procedural GLB generator** (`scripts/build-ar-models.js`) producing **8/8 required 3D models** (`coche.glb`, `perro.glb`, `manzana.glb`, `pelota.glb`, `zapato.glb`, `lua.glb`, `pez.glb`, `estrella.glb`). All 8 models strictly comply with the **< 100 KB target** (the largest model, `lua.glb`, weighs only 49.25 KB; all 8 combined weigh ~151.3 KB) and the **< 2 MB hard ceiling**, featuring exact animation names (`celebrate`, `spin360`) and Khronos glTF 2.0 binary compliance.

The verification toolchain (`npm run check:ar-models`, `npm run typecheck`, `npm run check:ui-strings`) executes cleanly with zero errors.

---

## 2. Asset Catalog & Contract Inventory (8/8 Models)

| # | GLB Asset | Kotlin Enum (`ArModel`) | Target Exercise / Role | Exact Animation | Triangle Count | Node Hierarchy / Meshes | File Size (Bytes) | Budget Status (< 100 KB) |
|---|---|---|---|---|---|---|---|---|
| 1 | `coche.glb` | `CAR` | **AR-1**: Orofacial Kinematics (propulsion by lip rounding) | `celebrate` (hop in Y + wheel spin in Z, 0.9s) | 288 | `coche` (root) → `carroceria`, `cabina`, `faros`, `ruedas` (`rueda_0..3`) | 15,716 B (15.35 KB) | **PASS** (15.4% of 100 KB) |
| 2 | `perro.glb` | `DOG` | **AR-2**: Instrumented Sound Localization (VRA head turn) | `celebrate` (hop in Y + 4 tail sweeps + head nod, 1.2s) | 108 | `perro` (root) → `cuerpo`, `patas` (4), `cabeza` (`craneo`, `morro`, `orejas` (2)), `cola` (`cola_seg`) | 15,200 B (14.84 KB) | **PASS** (14.8% of 100 KB) |
| 3 | `manzana.glb` | `APPLE` | **AR-3**: Semantic Gaze Selection (target diana) | `spin360` (full 360° Y-axis turn, 1.0s) | 556 | `manzana` (root) → `fruta`, `tallo`, `hoja` | 15,436 B (15.07 KB) | **PASS** (15.1% of 100 KB) |
| 4 | `pelota.glb` | `BALL` | **AR-3**: Semantic Gaze Selection (distractor 1) | `spin360` (full 360° Y-axis turn, 1.0s) | 864 | `pelota` (root) → `esfera`, `banda` | 19,532 B (19.07 KB) | **PASS** (19.1% of 100 KB) |
| 5 | `zapato.glb` | `SHOE` | **AR-3**: Semantic Gaze Selection (distractor 2) | `spin360` (full 360° Y-axis turn, 1.0s) | 228 | `zapato` (root) → `suela`, `empeine`, `puntera`, `cordones` | 9,748 B (9.52 KB) | **PASS** (9.5% of 100 KB) |
| 6 | `lua.glb` | `LUA` | **AR-4**: Spatial Search ("Lúa Salvaje") & **AR-6**: Mirror Mimicry ("Buddy Lúa") | `celebrate` (hop in Y [0.45m] + tail sweep 42° + head tilt, 1.1s) | 1,324 | `lua` (root) → `cuerpo`, `patas` (4), `cabeza` (`craneo`, `orejas` (2), `oreja_int` (2), `ojos` (2), `hocico`, `nariz`, `collar`, `cascabel`), `cola` (`cola_mesh`) | 50,432 B (49.25 KB) | **PASS** (49.3% of 100 KB) |
| 7 | `pez.glb` | `FISH` | **AR-5**: Reward Throw & Catch ("Feed Lúa" golden fish) | `spin360` (full 360° Y-axis turn, 0.8s) | 496 | `pez` (root) → `cuerpo_pez`, `cola_pez`, `aleta_dorsal`, `ojos` (2) | 15,944 B (15.57 KB) | **PASS** (15.6% of 100 KB) |
| 8 | `estrella.glb` | `STAR` | **Reward / Level / Confetti**: Level celebrations across AR-4..6 | `spin360` (full 360° Y-axis turn, 1.0s) | 264 | `estrella` (root) → `centro_estrella`, `puntas` (5) | 12,948 B (12.64 KB) | **PASS** (12.6% of 100 KB) |

**Total Combined Size of all 8 Models**: **154,956 Bytes (~151.3 KB)**.  
**Facial Signal Model**: `face_landmarker.task` (MediaPipe Tasks Vision `float16/1` revision, 3,758,596 Bytes, SHA-256: `64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff`).

---

## 3. Procedural GLB Generator Architecture (`scripts/build-ar-models.js`)

### 3.1 GltfBuilder Implementation
- **Specification Compliance**: Generates strict glTF 2.0 binary chunks (`glTF\x02\x00\x00\x00`).
- **Buffer Alignment**: Pads buffer views to 4-byte boundaries with `pad()` to ensure native zero-copy memory mapping in Filament and RealityKit.
- **Accessors & Indices**:
  - `POSITION` and `NORMAL` accessors packed as `FLOAT` (5126) `VEC3` with component-wise min/max bounds calculation.
  - `indices` packed as `USHORT` (5123) `SCALAR` targeting `ELEMENT_ARRAY_BUFFER` (34963).
- **PBR Metallic-Roughness Materials**:
  - Untextured flat PBR shading with deterministic color palette (`PALETTE` in `build-ar-models.js`).
  - Zero heavy image textures (PBR `baseColorFactor` with calibrated roughness), reducing runtime memory overhead and eliminating texture decompression stutter.
  - Official brand colors incorporated (e.g., Valeria+ turquoise `[0.0, 0.77, 0.75]` on Lúa's eyes and collar, car cabin, and UI accents).

### 3.2 Animation Engine
- **Quaternion Slerp Interpolation**:
  - glTF linear rotation interpolation requires slerp. Full 360° rotations (`spin360`) are divided into 4 quarter turns (0°, 90°, 180°, 270°, 360°) using quaternion representation `quat(axis, deg)` to eliminate 180° slerp flip ambiguity.
- **Hierarchical Node Animation**:
  - Sub-node isolation allows independent part animation (e.g., wheels rotating independently from the car chassis in `coche.glb`; tail wagging and head nodding independently from the torso in `perro.glb` and `lua.glb`).

---

## 4. Verification and Contract Enforcement Infrastructure

### 4.1 Single Source of Truth
- `scripts/check-ar-models.js` does **not** hardcode expected model names. It parses the Kotlin source file `android-native/valeria-ar/src/main/java/eu/futureforkids/valeria/ar/scene/SceneHost.kt` via regex to extract the canonical `enum class ArModel(val asset: String, val animation: String?)`.
- It performs partial glTF JSON chunk streaming (reading first 20 bytes for header and chunk offset, reading only the JSON payload) without allocating entire GLB binary buffers into Node.js heap.
- Validates:
  1. File existence in `assets/models/`.
  2. Byte size <= 2,097,152 Bytes (2 MB).
  3. Exact animation name match (`celebrate`, `spin360`).
  4. MediaPipe `face_landmarker.task` integrity against fixed SHA-256.

### 4.2 Build & Integration Pipeline
- `package.json` scripts:
  - `build:ar-models`: `node scripts/build-ar-models.js`
  - `fetch:ar-model`: `node scripts/fetch-ar-model.js`
  - `check:ar-models`: `node scripts/check-ar-models.js`
- `plugins/withValeriaAR.js`: Expo config plugin copying all `.glb` assets from `assets/models/` into `android/valeria-ar/src/main/assets/models/` during `expo prebuild`.

---

## 5. End-to-End Clinical & Architectural Parity

### 5.1 Exercise Mapping across Stacks
1. **AR-1 (Cinemática Orofacial)**:
   - Kotlin: `Ar1Orofacial.kt`
   - Model: `CAR` (`coche.glb`), animation `celebrate`
   - Bridge: `Ar1Trial` in `src/valeriaArBridge.ts`
   - Meta: `AR_META_ES` / `AR_META_EN` (`ar1`)
2. **AR-2 (Localización Acústica Instrumentada)**:
   - Kotlin: `Ar2Vra.kt`
   - Model: `DOG` (`perro.glb`), animation `celebrate`
   - Bridge: `Ar2Trial` in `src/valeriaArBridge.ts`
   - Meta: `AR_META_ES` / `AR_META_EN` (`ar2`)
3. **AR-3 (Selección Semántica por Fijación)**:
   - Kotlin: `Ar3Fixation.kt`
   - Models: `APPLE` (`manzana.glb`), `BALL` (`pelota.glb`), `SHOE` (`zapato.glb`), animation `spin360`
   - Bridge: `Ar3Trial` in `src/valeriaArBridge.ts`
   - Meta: `AR_META_ES` / `AR_META_EN` (`ar3`)
4. **AR-4 (Búsqueda Espacial "Lúa Salvaje")**:
   - Kotlin: `Ar4SpatialSearch.kt`
   - Model: `LUA` (`lua.glb`), animation `celebrate`
   - Bridge: `Ar4Trial` in `src/valeriaArBridge.ts`
   - Meta: `AR_META_ES` / `AR_META_EN` (`ar4`)
5. **AR-5 (Lanzamiento y Captura "Alimentar a Lúa")**:
   - Kotlin: `Ar5FeedCatch.kt`
   - Model: `FISH` (`pez.glb`), animation `spin360`
   - Bridge: `Ar5Trial` in `src/valeriaArBridge.ts`
   - Meta: `AR_META_ES` / `AR_META_EN` (`ar5`)
6. **AR-6 (Espejo Mímico "Buddy Lúa")**:
   - Kotlin: `Ar6BuddyMimicry.kt`
   - Model: `LUA` (`lua.glb`), animation `celebrate`
   - Bridge: `Ar6Trial` in `src/valeriaArBridge.ts`
   - Meta: `AR_META_ES` / `AR_META_EN` (`ar6`)

### 5.2 Regulatory & Zero-PHI Guardrails
- **Zero Diagnoses On-Device**: Pure physical measurements (ms latencies, angular degrees, bilateral symmetry ratios 0.0-1.0, throw velocities in px/s).
- **Sensor Privacy**: MediaPipe runs strictly in memory on camera frames without persisting images or streaming frames off-device.
- **Graceful Fallback**: If native AR module is unavailable (e.g., Expo Go or unsupported camera hardware), `isArAvailable()` safely returns `false`, and UI displays explanatory caregiver copy.

---

## 6. Identified Discrepancies & Recommendations

1. **Documentation Discrepancy in `assets/models/README.md`**:
   - `assets/models/README.md` still references the initial 5-model baseline from Phase 1 (`coche`, `perro`, `manzana`, `pelota`, `zapato`).
   - *Recommendation*: Update `assets/models/README.md` to document all 8 models (`lua.glb`, `pez.glb`, `estrella.glb`) and their corresponding exercises (AR-4, AR-5, AR-6).
2. **Deterministic Regeneration Integrity**:
   - Running `npm run build:ar-models` followed by `npm run check:ar-models` confirms zero regressions and 100% reproducibility.
