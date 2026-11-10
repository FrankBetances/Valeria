# Plan de integración de RA (v3.0) · Lúa V5 y Construye con Lúa en Valeria+

Estado: **v3.0, 2/11/2026. Sustituye a la v2.0 del 30/10/2026.** Rama de trabajo: `sets`.
Contrastado contra tres repositorios, con su commit:

| Repositorio | Commit leído | Qué se ha mirado |
| :--- | :--- | :--- |
| `Valeria` | `d4fd26c` (rama `sets`) | `firmware/lua/protocol.json`, `src/steam/**`, `src/ValeriaSteam*Screen.tsx`, `android-native/valeria-ar/**`, `.github/workflows/android.yml` |
| `lua-construye` | `cfe115b` (30/10/2026) | `sets/**`, `STATUS.md`, `docs/SETS.md`, `docs/SETS-IMPRESION.md`, `docs/LEEME-masque3d.md`, `docs/ANALISIS-SETS-V1-LUA.md`, `lua-v5/interfaz-construye.json` |
| `lua-firmware` | `c3d4439` (29/10/2026) | `protocol/protocol.json`, `docs/decisiones-v5.md` (incluidas las decisiones 27 y 28), `docs/entrega-lua-v5.md`, `cad/lua-v5/montaje/` |

Etiquetas: **`[Hecho]`** comprobado en esos commits · **`[Inferencia]`** deducción directa ·
**`[Propuesta]`** decisión reversible de este plan · **`[Por validar]`** exige banco con piezas
impresas o un aparato.

---

## 0. Lo que falta, primero

1. **`[Hecho]` Hoy la app solo detecta caras.** El único detector nativo es `FaceLandmarker`
   (MediaPipe `tasks-vision 0.10.29`). No hay detector de marcadores, de oclusión, de manos ni de
   objetos. Toda actividad que dependa de ellos funciona **solo con el botón del adulto
   (`adult_tap`)**, y eso no es RA: es una confirmación manual con una animación encima.
2. **`[Hecho]` D2 (qué marcador llevan las piezas) sigue abierta** en `lua-construye`
   (`docs/SETS.md` §A). Sin D2 no hay RA sobre los sets. Es la decisión bloqueante del plan.
3. **`[Hecho]` La Lúa V5 que describía la v2.0 ya no existe.** La noche del 29/10, las decisiones
   27 y 28 de Frank la cambiaron por **un cubo con luces LED (WS2812B), vibración (DRV2605L + LRA)
   y batería**, con la **cabeza de bloque y su propia batería Li-ion**. El Ronroneo se integra en el
   cubo y el bloque-cuello desaparece. Base de 108 × 108 mm, unos 210 mm de alto.
   **No se ha impreso nada y el firmware del cubo no existe** (`entrega-lua-v5.md` §0).
4. **`[Hecho]` Sin marcador en el lomo.** `K-LOMO-G` ya no se imprime y el cubo no tiene una
   cara reservada para marcador. Hasta que se cierre D2, el rumbo de Lúa no se puede medir.
5. **`[Hecho]` S8–S11 son maquetas decorativas** de una sola pieza, escaladas al 60 % (trenes al
   33 %). Según `LEEME-masque3d.md` §7, **«no casan con Lúa V5»**. Los códigos de pieza que
   inventaba la v2.0 (`S9-BOM-RAMPA`, `S10-HOS-CAMI`, `S11-TRE-*`…) no existen.
6. **`[Hecho]` El `protocol.json` de Valeria+ va por detrás del de `lua-firmware`.** El del
   firmware ya tiene `LIGHT` (18), `HAPTIC` (19), `CAP_LIGHT` (bit 4) y `CAP_HAPTIC` (bit 5); el de
   Valeria+ no. Hoy la app no puede encender ni una luz ni una vibración en ningún aparato.
7. **`[Hecho]` Las modalidades II y III para S0–S6 ya están construidas** sin cámara:
   `ValeriaSteamChallengeScreen` juega cada reto con `adult_tap` y, si Lúa está enlazada, le envía
   las caras (`luaSteamFrames`). El hueco real es la **cámara + la capa de revelación**, no un
   catálogo nuevo.

---

## 1. Fe de erratas de la v2.0

| # | La v2.0 decía | La realidad | Qué cambia |
| :- | :--- | :--- | :--- |
| E1 | Servicio GATT `4fafc201-1fb5-…` | `6c75612d-0001-4000-b000-000000000001` | §1.1 corregida |
| E2 | `HEARTBEAT 0x05`, `GRANT 0x09`, `THRESHOLD 0x0A` | `CALL`=5, `LEVEL`=9, `PICTO_PAIR`=10 (reservado), `GRANT`=16, `HEARTBEAT`=17. `THRESHOLD` no existe | Tabla de opcodes rehecha (§3.2) |
| E3 | Omitía la concesión | Lúa solo dibuja con una concesión viva: `GRANT` ≤ 60 s, `HEARTBEAT` cada 10 s, latencia ≤ 300 ms | Requisito en §3.2 |
| E4 | `#15 Gratitud (AFFECT 5)`, `#12 Orgullo (AFFECT 2)`, `#11 Ternura (AFFECT 1)` | `AFFECT 5`=Orgullo (#15), `AFFECT 2`=Gratitud (#12), `AFFECT 1`=Amor (#11) | L03, SL04 y SL10 corregidas |
| E5 | Cuello sellado con LiFePO4, sin luces (B5-B) | Superado por las decisiones 27 y 28: luces en el cubo y cabeza con Li-ion | §1.1 rehecha |
| E6 | Bloque *Ronroneo* independiente de 2 × 4 con su propia LiPo | Integrado en el cubo (decisión 27) | L05 rehecha |
| E7 | Vibración a «−20 dBFS» | dBFS es nivel de audio digital, no amplitud háptica. `HAPTIC` acepta **nivel 0–3**; el umbral de amplitud lo fija la puerta clínica (B3-A, regla 6) | Se usa nivel 1, pendiente de banco |
| E8 | Marcador en `K-LOMO-G` para el rumbo | No existe en V5 | L02 y SL01 bloqueadas por D2 |
| E9 | Detectores A, B, C y E disponibles | Solo existe D (cara) | Matriz de detectores (§2.2) |
| E10 | S8–S11 modulares y compatibles con S1/S5 | Maquetas monolíticas escaladas que no casan con V5 | SL08–SL11 eliminadas; S08–S11 aplazadas |
| E11 | 30 gates en `android.yml` | 36 líneas `node scripts/…` hoy. `check-lua-tri-modal-coverage.js` y `check-ar-reveal-layers.js` no existen | §6 cuenta desde el workflow |
| E12 | Rama `game` | Rama `sets` | — |
| E13 | Sin micrófono ni altavoz en Lúa | **`[Por validar]`** El protocolo declara `CAP_SOUND` (zumbador). La entrega V5 no lo menciona | La app no lo usa en RA |
| E14 | IDs nuevos `AR-Sxx`/`AR-SLxx` | Ya existen los retos `S0-C1 … S6-C5` en `src/steam/worlds` | La modalidad pasa a ser un atributo del reto (§2.1) |

---

## 1.1 Lúa V5 tal como está hoy (`lua-firmware` `c3d4439`)

| Subsistema | Estado | Etiqueta | Implicación para la RA |
| :--- | :--- | :--- | :--- |
| Cabeza de bloque | Pantalla redonda GC9A01 240 × 240 sobre ESP32-C3, Li-ion 3,7 V en conector MX1.25, se enrosca al cubo (rosca Ø42) y se carga desenroscada | `[Hecho]` en fichero · **NO PROBADO** | Las 28 caras (#0–#27) siguen siendo el canal principal |
| Cubo | XIAO ESP32-C3 + DRV2605L + LRA + LED WS2812B + LiPo 803450; 11 enchufes, 13 piezas intercambiables, armario (lazo, cascabel, flor, sombrero) | `[Hecho]` en fichero · **firmware no escrito** | `LIGHT` y `HAPTIC` existen en el protocolo del firmware, pero ningún aparato los ejecuta todavía |
| Topología BLE | **`[Inferencia]`** La cabeza y el cubo tienen cada uno su ESP32-C3: son dos periféricos. Cuál lleva `LIGHT`/`HAPTIC` y cómo se emparejan con la tableta no está escrito | `[Por validar]` | Decisión para `lua-firmware` antes de tocar `LuaLink` |
| Encaje con los sets | El patín `K-PATIN-G` es una **bandeja** donde se apoya el fondo de 108 × 108 (`interfaz-construye.json` `v5-cubo-1`) | `[Hecho]` en fichero · **NO PROBADO** | SL01 depende de que esa bandeja corra por la ranura con 210 mm de muñeco encima |
| Puerta clínica B3-A | `LIGHT`/`HAPTIC` **apagados en `PHASE(0)`/`PHASE(1)`**, en silencio clínico, sin concesión o sin enlace. VIA+ nunca los concede. Ronroneo, nunca antes de 3 años | `[Hecho]` | `TurnGate` debe aplicarlo también en la app, no solo en el firmware |

## 1.2 Construye con Lúa tal como está hoy (`lua-construye` `cfe115b`)

| Set | Piezas | GLB por pieza en `sets/*/ar/` | Estado |
| :--- | :--- | :--- | :--- |
| S0 Kit Lúa | zócalo, patín, 7 placas, pilares | Sí | Tronco, lomo, patas y cola **ya no se imprimen** (los sustituye el cubo V5) |
| S1 Camino | baldosas lisa/rugosa, curva, T, 4 fichas TPR, destinos | Sí | Regenerado el 29/10 |
| S2 Sonido | banco, brazo, 9 resonadores, raspador | Sí | **El tono no se ha medido** |
| S3 Rampas | 6 pilares, bisagra, rampa, fricción, peralte, receptor, 2 esferas | Sí | — |
| S4 Soplo | canal, codo, 2 compuertas, rotor, molinete | Sí | La boquilla `S4-BOQ` no va: no es PLA por FDM |
| S5 Puente | fulcro, viga, masas 20/40/60, pasadores | Sí | — |
| S6 Jardín | tierra, semilla, tallo, copa, flor, frutos, siluetas | Sí | — |
| S8–S11 | 1 `conjunto.stl` cada uno | **No** | Maquetas decorativas que no casan con V5 |

**`[Hecho]`** Los GLB por pieza de S0–S6 pesan entre 0,9 y 65,8 KB (677 KB en total). **`[Propuesta]`**
Se reutilizan como geometría de la capa de revelación en lugar de dibujar mallas procedurales nuevas:
son las piezas que el niño tiene en la mesa, con las mismas cotas.

---

## 2. Arquitectura

### 2.1 Modalidad como atributo, no como catálogo nuevo `[Propuesta]`

Los 35 retos `S0-C1 … S6-C5` ya tienen eventos, ciclo tripartito y textos en 4 lenguas de interfaz.
No se duplican en 14 actividades `AR-S/SL`. En su lugar:

```typescript
// src/steam/types.ts — ampliación, sin romper lo que hay
export type SteamArMode = 'LUA_SOLO' | 'SET_SOLO' | 'SET_WITH_LUA';

/** Lo que el reto necesita para la cámara. adult_tap siempre está. */
export interface ChallengeArNeeds {
  modes: SteamArMode[];            // en qué modalidades se ofrece
  detectors: DetectionMethod[];    // los que usa si existen; si no, adult_tap
  revealLayer?: { pieceGlb: string[]; animation: string };
}
```

- **`SET_SOLO` / `SET_WITH_LUA`** no se eligen en un selector: dependen de si hay Lúa enlazada
  (`isLuaLinked()`), igual que hoy. Se gana un indicador visible, no una pantalla nueva.
- **`LUA_SOLO`** es lo único nuevo: las actividades sin set (§4).
- **Matriz de detectores en tiempo de ejecución.** La app pregunta al módulo nativo qué detectores
  tiene y cada reto marca sus eventos como **«cámara»** o **«confirma el adulto»**, a la vista. Así
  nadie llama RA a lo que no lo es.

### 2.2 Detectores: lo que hay y lo que falta

| Detector | Estado | Para qué | Bloqueo |
| :--- | :--- | :--- | :--- |
| D · cara | `[Hecho]` `FaceLandmarker` | L01, L04, praxias de S4 | — |
| F · `adult_tap` | `[Hecho]` | Todos los retos | — |
| A · marcador de pieza | No existe | S0–S6, rumbo de Lúa | **D2** |
| B · oclusión de marcador | No existe | Siembra (S6), ranuras (S0) | **D2** (es A invertido) |
| C · mano | No existe. **`[Inferencia]`** `HandLandmarker` viene en el mismo `tasks-vision` que ya está en el proyecto | L05, S2, S6 | Integración nativa + prueba de rendimiento con la cara |
| E · objeto por color | No existe | Esferas de S3 | Se descarta en v3: frágil con la luz de casa y del aula. S3 usa A + `adult_tap` |

### 2.3 D2 · candidatos para el marcador (S0c: repos de primer nivel, verificados el 2/11/2026)

| Opción | Repo | Datos | Encaje | Riesgo |
| :--- | :--- | :--- | :--- | :--- |
| **ArUco en OpenCV** | `opencv/opencv` (91 k★, Apache-2.0, activo) · `opencv_contrib` (10,2 k★) | **`[Por validar]`** ArUco forma parte del módulo `objdetect` de OpenCV 4.x | Marcadores pequeños de alto contraste, pose 6DoF, diccionarios con ID por instancia | Tamaño del AAR de OpenCV para Android: medir el APK |
| **AprilTag** | `AprilRobotics/apriltag` (2,6 k★, BSD, activo) | Biblioteca en C, se compila con el NDK que ya usa el build | Muy robusta con poca resolución y a distancia | Puente JNI propio, que también hay que mantener |
| ARCore Augmented Images | `google-ar/arcore-android-sdk` (5,2 k★; ARCore ya es dependencia) | Imágenes con textura, no fiduciales | Sin dependencia nueva | **`[Inferencia]`** Pensado para imágenes grandes y con mucho detalle; dudoso en una cara de 31,8 mm |

**`[Propuesta]` Opción preferente: ArUco (OpenCV).** Es el repo de más adopción, da ID por instancia
(`instanceMarkerIds`) y pose, y no obliga a mantener un puente C propio. **Se decide en banco, no
aquí**: marcador impreso en una cara de 31,8 mm, tableta en el soporte de cada mundo, luz de aula y
de casa, y tasa de detección a 30 fps junto a `FaceLandmarker`.

**`[Propuesta]` Rumbo de Lúa sin lomo.** El cubo V5 tiene «el mismo enchufe en todas las caras». Una
**placa-marcador intercambiable** que se enchufa en la cara de arriba del cubo le devuelve a Lúa el
rumbo sin rediseñar nada. Hay que pedirlo en `lua-firmware`; no se toca desde aquí.

### 2.4 Bucle `[Hecho]` en el motor, `[Propuesta]` en la cámara

`Detector nativo → EventStabilizer (10 frames, 1 en adult_tap) → ChallengeEvaluator + TurnGate →
ReactionSequencer (fenómeno → pauseBeforeReactionMs → reacción → palabra) → LuaLink / RevealLayer /
WordPrompter`. Todo menos el primer eslabón y la capa de revelación ya está en `src/steam/engine/`.

### 2.5 Invariantes (se conservan de la v2.0)

1. La criatura no toca la pantalla; todo lo táctil lo hace el adulto.
2. Sensor ciego: los fotogramas no salen del ciclo. Ni fotos, ni vídeo, ni nubes de puntos.
3. `adult_tap` siempre disponible: el 100 % de los retos se juega sin cámara.
4. `pauseBeforeReactionMs`: 1000 ms en S2 y 500 ms en S3.
5. Metrónomo solo visual en actividades rítmicas (implantes y audífonos).
6. **Nuevo:** `LIGHT`/`HAPTIC` apagados en `PHASE(0)`/`PHASE(1)`, también en la app (B3-A).

---

## 3. LuaLink

### 3.1 Caras oficiales (`src/steam/engine/LuaLink.ts`, `[Hecho]`)

`#0` neutra `IDLE` · `#1` atenta `PHASE 0` · `#2` ánimo `PHASE 1` · `#4` lo dijo `CELEBRATE 0` ·
`#5` nivel `CELEBRATE 1` · `#6` impulso `VERDICT 1` · `#7` calma `VERDICT 2` · `#9` éxito
`CELEBRATE 2` · `#10` alegría · `#11` amor · `#12` gratitud · `#13` tranquilidad · `#14` esperanza ·
`#15` orgullo · `#16` inspiración · `#17` diversión (`AFFECT 0…7`) · `#18` dormida `RELAX 20` ·
`#20` antojo · `#21` ronroneo · `#22` comiendo (`MOOD 1/2/3`). Huecos sin nombre de plan:
3, 8, 19, 23–27.

### 3.2 Opcodes y concesión

| Código | Clave | Uso en RA |
| :- | :--- | :--- |
| 1 | `PHASE` | Fase del turno; con 0/1 se apagan luz y vibración |
| 2 | `VERDICT` | Solo 1 (impulso) y 2 (calma); el 0 no se usa como castigo |
| 3 | `CELEBRATE` | 0 cierre, 1 nivel, 2 insignia |
| 4 | `IDLE` | Camino roto, espera |
| 6 | `AFFECT` | Emoción 0–7 (§3.1) |
| 7 | `PICTO` | Ficha de la placa o de la TPR |
| 8 / 9 | `AWARD` / `LEVEL` | Premio de cierre, a plazos de 3000 ms (CLAUDE.md §5b) |
| 11 / 12 / 13 | `MOOD` / `ACCESSORY` / `RELAX` | Compañía, armario, descanso |
| 16 / 17 | `GRANT` / `HEARTBEAT` | **Obligatorios**: concesión ≤ 60 s, latido cada 10 s |
| 18 / 19 | `LIGHT` / `HAPTIC` | Solo en `lua-firmware`. Entran en Valeria+ cuando exista el firmware del cubo (Fase 5) |

---

## 4. Modalidad I · Solo Lúa

| ID | Actividad | Detector | Caras | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **L01** | El espejo de gestos de Lúa | D (`Ar1Orofacial`: `pucker`, `funnel`, `jawOpen`) | inicio `#1` → fin `#4` | **Hecha** (Fase 3) |
| ~~L04~~ | ~~El despertar sereno de Lúa~~ | — | — | **Retirada el 2/11/2026: error de esta v3.** Se apoyaba en `Ar3Fixation`, que es selección semántica por fijación (2-3 dianas, calibración), no calma sostenida. No hay ejercicio nativo de calma |
| **L07** | Imita a Lúa | D (`Ar6BuddyMimicry`: Lúa 3D modela sonrisa, asombro, mejillas, piquito; la criatura lo imita) | inicio `#16` (curiosa) → fin `#10` (alegre) | **Hecha** (Fase 3). Elegida por Frank el 2/11/2026 en lugar de L04 |
| L02 | ¿Hacia dónde mira Lúa? | A (placa-marcador del cubo) | `#16` → `#10` | Bloqueada por D2 y por la placa-marcador |
| L03 | La merienda del pez dorado | A en la ficha del pez, proximidad por pose del marcador | `#20` → `#22` → **`#12` gratitud** (`AFFECT 2`) | Bloqueada por D2; los 60 mm pasan a `[Por validar]` |
| L05 | La caricia y el ronroneo | C (mano) + `HAPTIC RONRONEO` nivel 1 en el cubo | `#21` | Bloqueada por la mano y por el firmware del cubo; ≥ 3 años |
| ~~L06~~ | ~~¿Dónde cantó el pajarito?~~ | — | — | **Eliminada por Frank el 9/11/2026.** No vuelve. Reutilizaba `Ar2Vra.kt` (VRA digitalizado) con el perfil `hearing_ic`: se puede leer como cribado auditivo en una app no SaMD (R-A1) y se solapa con VIA+ (Clase IIa). Se reabre solo con una revisión regulatoria escrita |

**Límite comprobado (2/11/2026):** el módulo nativo no emite eventos durante la sesión; `launchAr` solo devuelve el resultado al cerrar. La Lúa física cambia de cara **al empezar y al terminar**, nunca a mitad del gesto (`#2` de L01 no sale). Decidido por Frank: así, sin canal de eventos Kotlin→JS. Tampoco entran en Solo Lúa AR-2 (VRA, L06 retirada) ni AR-5 (la criatura desliza el dedo por la pantalla); lo sujeta `check-steam-ar-needs.js`.

**L01 y L07, ciclo:** se mantiene el de la v2.0 (Observa con 5 s de silencio → Experimenta con
pistas N1/N2 → Construye). **Cambio en L01 «Construye»:** el accesorio se pone en el armario del cubo
(lazo, cascabel, flor, sombrero), no en una cola que ya no existe.

---

## 5. Modalidades II y III · S0–S6 sobre los retos existentes

| Set | Retos | Capa de revelación (GLB de `lua-construye`) | Detectores con D2 cerrada | Con Lúa enlazada (correcciones) |
| :--- | :--- | :--- | :--- | :--- |
| S0 | `S0-C1…C5` | `K-ZOCALO-G` + `K-PLACA-*` con contorno de encaje | A, B | Sin cambio |
| S1 | `S1-C1…C5` | Baldosas con flujo `flow` | A | La bandeja-patín con V5 **`[Por validar]`** en banco |
| S2 | `S2-C1…C5` | Resonadores con anillos `resonate` + metrónomo visual | A + C | `pauseBeforeReactionMs` 1000. El tono **no está medido**: la capa enseña tamaño de cavidad, no una nota |
| S3 | `S3-C1…C5` | Pilares + rampa con estela `roll` | A (la esfera se confirma con `adult_tap`) | Sin cambio |
| S4 | `S4-C1…C5` | Canal + rotor con cintas `spin_rotor` | A + D | **`AFFECT 5` = `#15` orgullo** para la compuerta pesada (la v2.0 decía `AFFECT 2`). Sin boquilla impresa: el soplo es libre o con una boquilla higiénica de un solo uso |
| S5 | `S5-C1…C5` | Viga + flechas de par `balance` | A | Sin cambio |
| S6 | `S6-C1…C5` | Tallo + cono de sombra `bloom` | A + B + C | Sin cambio |

**S8–S11:** fuera de la v3. Se reabren cuando `lua-construye` tenga S8–S11 partidos en piezas
imprimibles que casen con V5. Hasta entonces, la SL10 de la v2.0 (familiarización con el hospital) es
una buena idea sin un objeto físico que la sostenga.

---

## 6. UX (CLAUDE.md S4) `[Propuesta, a validar con captura web y en aparato]`

- **Lo que ya funciona no se mueve.** La pantalla del mundo sigue empezando por fenómeno, soporte y
  retos. Solo se añade **una línea dentro de cada fila de reto**: un icono «cámara» o «confirma el
  adulto», dibujado en `ValeriaBlockIcons.tsx`.
- **Solo Lúa** entra como **una tarjeta más en la lista de mundos** (`ValeriaSteamWorldsScreen`),
  después de los siete existentes, no encima.
- El estado de Lúa (enlazada o no) va en la cabecera del reto, con `ScreenHeader`.
- Nada de esto cambia la disposición de filas o chips. Si hiciera falta, se aplica el §1c: «esto no
  lo he visto en un aparato» hasta que Frank lo mire.

---

## 7. Gates

Se sacan del workflow, no de una lista (CLAUDE.md §1b):

```bash
grep -oP '(?<=run: )node scripts/\S+(?: --\S+)?' .github/workflows/android.yml |
  while read -r cmd; do $cmd >/dev/null 2>&1 || echo "FALLA: $cmd"; done
npm run typecheck
```

Gates nuevos de este plan:

| Gate | Qué impide | Estado |
| :--- | :--- | :--- |
| `check-steam-ar-needs.js` | Que `NATIVE_AR_DETECTORS` diga algo distinto de lo que importa el Kotlin (en los dos sentidos), que falte `adult_tap`, que un evento use un método desconocido o que un reto de set salga en `LUA_SOLO` | **Existe** (Fase 2), en `android.yml`. Probado en rojo de cuatro formas |
| Ampliar `check-steam-ar-needs.js` | Que un reto declare un GLB de capa de revelación que no está en `assets/models/` | Fase 6 |
| Ampliar `check-lua-mascot-mirror.js` | Que `LIGHT`/`HAPTIC` se emitan en `PHASE(0)/(1)` o sin `CAP_*` |
| Ampliar `check-steam-manifests.js` | Que reaparezcan `AFFECT` con nombre equivocado o IDs de S8–S11 |

Recordatorios que ya costaron builds: cualquier texto locutado nuevo exige
`node scripts/export-voice-corpus.js` **en el mismo commit**; un espacio de nombres nuevo obliga a
subir el número congelado de `scripts/test-challenger-final-ca-integration.js`.

---

## 8. Fases

| Fase | Qué | Dónde | Cómo se comprueba | Bloqueo |
| :- | :--- | :--- | :--- | :--- |
| **1** | Este documento | `docs/` | Lectura de Frank | — |
| **2** | `SteamArMode` en `types.ts`; `src/steam/arNeeds.ts` **calcula** las necesidades de cada reto a partir de los `methods` de sus eventos (no se rellenan a mano: serían una segunda copia, regla 9.8); gate `check-steam-ar-needs.js` | `src/steam/` | Gates + typecheck. **Nada visible** | **Hecha el 2/11/2026** en la rama `sets`. Resultado: de 35 retos, 3 (S4) tienen algún evento captable por el módulo nativo; `marker` lo piden 34, `occlusion` 9, `hand` 7; 5 (S3) usan el detector descartado y se quedan en `adult_tap` |
| **3** | L01 y L07 como «Solo Lúa»: tarjeta al final de Mundos → pantalla `SteamLuaSolo` → `ValeriaArLauncherScreen` con `ar1`/`ar6` (mismo consentimiento, aptitud y política por nivel) y caras de inicio y fin | `src/`, puente AR | Gates + captura web. **No visto en un aparato** | **Hecha el 2/11/2026** en la rama `sets`, pendiente de que Frank la mire en un Android |
| **4** | Banco D2: ArUco y AprilTag con piezas impresas y tableta en soporte | Banco de Frank + rama de prueba | Tasa de detección, fps, tamaño del APK | Piezas impresas |
| **4a** | Preparación del banco: hojas imprimibles 1:1 de los 93 marcadores (ArUco 4×4_1000 con IDs reales y AprilTag 36h11 con id compacto; 20, 24 y 28 mm), simulación previa y protocolo | `scripts/d2-banco/`, `docs/banco-d2/` | Cada hoja se relee con el detector y da sus IDs exactos (probado en rojo); simulación reproducible | **Hecha el 2/11/2026.** La simulación apunta a que hacen falta fotogramas de 1280×720 y a que ArUco 4×4_1000 confunde piezas (26 de 60 combinaciones); AprilTag, ninguna. No sustituye al banco |
| **4b** | Detector nativo de prueba (OpenCV en `valeria-ar`) para medir en un aparato detección, fps junto a la cara y tamaño del APK | `android-native/` | Build de CI + aparato | Sin Android SDK en la sesión: necesita CI y un aparato |
| **5** | Sincronizar `protocol.json` con `lua-firmware` (`LIGHT`, `HAPTIC`, `CAP_*`) + `TurnGate` B3-A | `firmware/lua/`, `LuaLink.ts` | `build-lua-protocol.js --check` + mirror | Firmware del cubo y topología BLE escritos |
| **6** | Detector A nativo + capa de revelación con los GLB de `lua-construye` en S0–S6 | `android-native/valeria-ar/` | Gates nativos + aparato | Fase 4 |
| **7** | Mano (C): L05, S2, S6 | Nativo | Rendimiento con cara y marcador a la vez | Fase 6 |

Fuera de la v3: S8–S11 (en las dos modalidades), L06, el detector E y cualquier luz o vibración antes
de la Fase 5.
