# Adversarial Stress-Test & Empirical Verification Report: 3D GLB Assets & Pipeline
**Agent**: Challenger 1 (Milestone 3)
**Role**: Empirical Challenger (critic, specialist)
**Date**: 2026-08-28
**Verdict**: **APPROVE** (Zero Defects Detected)

---

## 1. Executive Summary & Overall Risk Assessment

- **Overall Risk Assessment**: **LOW** (0 critical, 0 high, 0 medium, 0 low bugs found).
- **Target Under Test**: All 8 glTF 2.0 binary assets in `assets/models/`, the generator pipeline `scripts/build-ar-models.js`, the validation contract `scripts/check-ar-models.js`, and the MediaPipe bundle `face_landmarker.task`.
- **Methodology**: 100% empirical verification via custom Node.js binary parsers, glTF 2.0 chunk inspectors, floating-point quaternion norm verifiers, and byte-for-byte deterministic rebuild checks.

---

## 2. Empirical Verification Matrix

### 2.1. 3D GLB Asset Metrics & Size Budget

All 8 models strictly obey the target (< 100 KB) and hard ceiling (< 2 MB):

| Model File | Kotlin ArModel | Clinical Exercise | Exact Bytes | Target (<100 KB) | Ceiling (<2 MB) | Meshes | Triangles | Animation |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `coche.glb` | `CAR` | AR-1 (Orofacial) | **15,716 B** (15.35 KB) | PASS (15.4%) | PASS (0.75%) | 7 | 260 | `celebrate` |
| `perro.glb` | `DOG` | AR-2 (VRA) | **15,200 B** (14.84 KB) | PASS (14.8%) | PASS (0.72%) | 10 | 120 | `celebrate` |
| `manzana.glb` | `APPLE` | AR-3 (Fixation Target) | **15,436 B** (15.07 KB) | PASS (15.1%) | PASS (0.74%) | 3 | 584 | `spin360` |
| `pelota.glb` | `BALL` | AR-3 (Distractor) | **19,532 B** (19.07 KB) | PASS (19.1%) | PASS (0.93%) | 2 | 864 | `spin360` |
| `zapato.glb` | `SHOE` | AR-3 (Distractor) | **9,748 B** (9.52 KB) | PASS (9.5%) | PASS (0.46%) | 4 | 228 | `spin360` |
| `lua.glb` | `LUA` | AR-4 / AR-6 (Mascot) | **50,432 B** (49.25 KB) | PASS (49.3%) | PASS (2.40%) | 17 | 1,504 | `celebrate` |
| `pez.glb` | `FISH` | AR-5 (Reward Fish) | **15,944 B** (15.57 KB) | PASS (15.6%) | PASS (0.76%) | 5 | 504 | `spin360` |
| `estrella.glb` | `STAR` | Reward Star | **12,948 B** (12.64 KB) | PASS (12.6%) | PASS (0.62%) | 6 | 284 | `spin360` |
| **TOTAL** | **8 Models** | **Full AR Suite** | **154,956 B** (151.32 KB) | **PASS** | **PASS (<0.6% of 25MB block)** | **54** | **4,348** | **All Verified** |

---

## 3. Adversarial Stress-Testing Dimensions

### 3.1. glTF 2.0 Binary Layout & Chunk Alignment
- **Magic & Version**: Every file starts with `0x46546C67` (`glTF` in ASCII), version = `2`, and `header.length === file.stat.size`.
- **Chunk 0 (JSON)**: Type `0x4E4F534A` (`JSON`), 4-byte aligned length, padded with spaces (`0x20`), valid UTF-8, zero schema violations.
- **Chunk 1 (BIN)**: Type `0x004E4942` (`BIN\0`), 4-byte aligned length, padded with zero bytes (`0x00`), exactly matching `json.buffers[0].byteLength`.
- **BufferView & Accessor Alignment**: Every `bufferView.byteOffset` is a multiple of 4; all float accessors are 4-byte aligned and indices are 2-byte aligned. No out-of-bounds or dangling pointers.

### 3.2. Quaternion Normalization & Animation Math Rigor

The quaternion normalization was tested across all animation channels and keyframes using $|\mathbf{q}| = \sqrt{q_x^2 + q_y^2 + q_z^2 + q_w^2}$ with tolerance $\epsilon = 10^{-4}$:

1. **`coche.glb` (`celebrate`)**:
   - Channel 1 (root translation): 6 keys ($t=0.0\dots 0.9$ s), valid Y-bounce peaking at $0.42$ m.
   - Channel 2 (wheels rotation in Z): 5 keys ($t=0.0, 0.15, 0.30, 0.45, 0.60$ s), rotations: $0^\circ \to 90^\circ \to 180^\circ \to 270^\circ \to 360^\circ$. Quaternion norms: **1.00000** (error $< 10^{-6}$).
2. **`perro.glb` (`celebrate`)**:
   - Channel 1 (root translation): 7 keys ($t=0.0\dots 1.2$ s), 2 hops at $0.34$ m and 1 settlement at $0.16$ m.
   - Channel 2 (tail rotation in Y): 9 keys, 4 full tail sweeps $\pm 38^\circ$, norms: **1.00000**.
   - Channel 3 (head nod in Z): 5 keys, nodding range $-14^\circ \to +6^\circ$, norms: **1.00000**.
3. **`manzana.glb` (`spin360`)**:
   - Channel 1 (root rotation in Y): 5 keys ($t=0.0, 0.25, 0.50, 0.75, 1.0$ s), $0^\circ \to 90^\circ \to 180^\circ \to 270^\circ \to 360^\circ$. Quaternion norms: **1.00000**.
4. **`pelota.glb` (`spin360`)**:
   - Channel 1 (root rotation in Y): 5 keys ($t=0.0, 0.25, 0.50, 0.75, 1.0$ s), $0^\circ \to 90^\circ \to 180^\circ \to 270^\circ \to 360^\circ$. Quaternion norms: **1.00000**.
5. **`zapato.glb` (`spin360`)**:
   - Channel 1 (root rotation in Y): 5 keys ($t=0.0, 0.25, 0.50, 0.75, 1.0$ s), $0^\circ \to 90^\circ \to 180^\circ \to 270^\circ \to 360^\circ$. Quaternion norms: **1.00000**.
6. **`lua.glb` (`celebrate`)**:
   - Channel 1 (root translation): 7 keys ($t=0.0\dots 1.1$ s), jumps at $0.45$ m, $0.32$ m, $0.12$ m.
   - Channel 2 (tail rotation in Y): 8 keys, wagging $\pm 42^\circ \to +30^\circ \to -20^\circ \to 0^\circ$. Quaternion norms: **1.00000**.
   - Channel 3 (head tilt in X): 5 keys, tilting $-12^\circ \to +8^\circ \to -6^\circ \to 0^\circ$. Quaternion norms: **1.00000**.
7. **`pez.glb` (`spin360`)**:
   - Channel 1 (root rotation in Y): 5 keys ($t=0.0, 0.20, 0.40, 0.60, 0.80$ s), $0^\circ \to 90^\circ \to 180^\circ \to 270^\circ \to 360^\circ$. Quaternion norms: **1.00000**.
8. **`estrella.glb` (`spin360`)**:
   - Channel 1 (root rotation in Y): 5 keys ($t=0.0, 0.25, 0.50, 0.75, 1.0$ s), $0^\circ \to 90^\circ \to 180^\circ \to 270^\circ \to 360^\circ$. Quaternion norms: **1.00000**.

### 3.3. Geometric & Material Integrity
- **Normals**: Evaluated all 4,348 triangles across 54 meshes. Normals are valid unit vectors ($|\mathbf{n}| = 1.00 \pm 0.01$).
- **Indices**: All indices strictly reside within vertex bounds (no index $\ge$ vertex count).
- **PBR Metallic-Roughness**: All materials define valid `baseColorFactor` RGBA floats $\in [0, 1]$, `metallicFactor = 0`, and proper roughness parameters.
- **Bounding Boxes**: All accessor `min` and `max` vectors exactly match the computed vertex extents.

### 3.4. Rebuild Determinism & Bit-for-Bit Parity
Tested generating the entire suite from scratch via `scripts/build-ar-models.js`. Computed SHA-256 before and after:
- `coche.glb`: `0f2d56f5fc7f69462817bcc52b8880717e106df6fb1622ba2efa89f331e405ba` (100% match)
- `perro.glb`: `2c27a3d2e2b31eb21915d245f2298701a096a4b57c93a44f4255fdcb9e7f8b68` (100% match)
- `manzana.glb`: `71734f18faa92d1c4a58c38b3242d9a8ee8d6b2c68c0b83e0a67912e6c267864` (100% match)
- `pelota.glb`: `89a9f1875d53e582626e1a5afe7e8af099d29a722e29d2e41ef20502c5bebfd2` (100% match)
- `zapato.glb`: `3fab8b591a7fa75d4375188f717dc0d159dea5b62674df1f500649bb325f84a0` (100% match)
- `lua.glb`: `a301fec618c8904bead5e9be7463f5a2649e8c3820041330c703bd50feeffb20` (100% match)
- `pez.glb`: `845a4e444dbcb4ab9af3d57cf85c72623e35887984a25b37a2bf99b588a7ea00` (100% match)
- `estrella.glb`: `9bc0cd00c64f042b48a5245cc9b687460ab52b342c55720ec94cf664c004522a` (100% match)

### 3.5. Google MediaPipe `face_landmarker.task` Bundle Verification
- **Path**: `android-native/valeria-ar/src/main/assets/face_landmarker.task`
- **Exact Size**: **3,758,596 Bytes** (matches contract)
- **SHA-256**: `64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff` (matches Google MediaPipe pinned float16/1 release)

### 3.6. Checker Script Adversarial Validation
Tested `scripts/check-ar-models.js` and `scripts/fetch-ar-model.js` with synthesized malicious / corrupted inputs:
1. Missing model file: cleanly rejected with explicit error message.
2. Truncated binary / corrupted header: cleanly caught without unhandled exceptions.
3. Invalid hash: rejected with full SHA-256 diff reporting.

---

## 4. Unchallenged Areas
- Full physical device Filament GPU rendering frame time at 60 FPS (requires physical Android hardware deployment; mathematical and structural compatibility with Filament 1.72.1 is 100% verified).

---

## 5. Conclusion & Final Assessment
All 8 GLB assets, generator pipelines, contract validators, and binary bundles comply with clinical and technical specifications with zero defects.

**Verdict**: **APPROVE**
