# Plan de integración · Módulos TEA y Dislexia

> **Documento de planificación y plan de trabajo.** Define cómo integrar los
> dos módulos clínicos nuevos —**Trastorno del Espectro Autista (TEA)** y
> **Dislexia**— en la arquitectura actual de Valeria+, **reutilizando al máximo
> la instrumentación de carga comunicativa ya existente** (Quiebre Pragmático,
> Oso Distractor, Ruido Babble, telemetría de misclicks y pliegue dialectal
> es-DO) y **sin romper nada de lo que ya funciona**.
>
> Base clínica: *Protocolo Clínico Integral — Arquitectura Terapéutica para TEA
> y Dislexia en Valeria+*. Encuadre regulatorio: **SaMD Clase IIa (MDR)**.
>
> Estado: 📋 planificación · Rama de trabajo: `claude/tea-dislexia-modules-osxu1d`

---

## Índice

- [1. Objetivo y principio rector](#1-objetivo-y-principio-rector)
- [2. Lo que YA existe y se reutiliza (base del «sin romper nada»)](#2-lo-que-ya-existe-y-se-reutiliza-base-del-sin-romper-nada)
- [3. Arquitectura objetivo](#3-arquitectura-objetivo)
- [4. Mapeo de la batería clínica](#4-mapeo-de-la-batería-clínica)
  - [4.1 Módulo TEA (PRT + TCC)](#41-módulo-tea-prt--tcc)
  - [4.2 Módulo Dislexia (fonología + acceso léxico)](#42-módulo-dislexia-fonología--acceso-léxico)
- [5. Superficie de integración (cambios por archivo)](#5-superficie-de-integración-cambios-por-archivo)
- [6. Telemetría silente y matriz de riesgo regulatorio](#6-telemetría-silente-y-matriz-de-riesgo-regulatorio)
- [7. Garantías de no regresión](#7-garantías-de-no-regresión)
- [8. Plan de trabajo por fases](#8-plan-de-trabajo-por-fases)
- [9. Riesgos y mitigaciones](#9-riesgos-y-mitigaciones)
- [10. Seguimiento](#10-seguimiento)

---

## 1. Objetivo y principio rector

Añadir a Valeria+ dos **bloques de terapia** nuevos —TEA y Dislexia— como
hermanos de los cuatro actuales (Pares Mínimos, Expansión Semántica, Audición,
Lenguaje), de modo que:

- El **software orquesta las contingencias**, pero la **carga comunicativa, la
  inducción de estresores y el veredicto clínico** residen exclusivamente en el
  adulto. Ningún ejercicio nuevo ajusta dificultad ni diagnostica de forma
  algorítmica.
- Toda la batería nueva **enrute por la infraestructura existente** (el player,
  el Panel del Adulto, la telemetría silente y el pliegue dialectal), no por
  código paralelo. Menos superficie nueva = menos riesgo de regresión.
- Se preserve la **validez ecológica**: el dispositivo es el medio para
  triangular atención, forzar mentalización y provocar desregulación
  controlada; el estresor siempre es **manual y reversible**.

**Muro MDR (innegociable).** El Panel del Adulto (`ValeriaAdultChaosPanel`) es la
única puerta de entrada a los módulos de carga. La app jamás activa ni ajusta
nada por su cuenta. Todo lo que se añade respeta este muro: los ejercicios
nuevos **registran** lo que el adulto decidió, nunca lo deciden.

**Dentro del alcance:** dos bancos de datos de ejercicios (TEA, Dislexia), dos
*stages* de mini-juego nuevos, metadatos, dos tarjetas de hub, dos `BlockId`
nuevos en telemetría, enumeración de voz y variante es-DO donde aplique.

**Fuera del alcance:** rediseño de UI/marca, diagnóstico automático, ajuste
adaptativo de dificultad, y cualquier modelo servidor en tiempo de sesión.

---

## 2. Lo que YA existe y se reutiliza (base del «sin romper nada»)

El protocolo describe una instrumentación que, en su mayoría, **ya está
construida y en producción**. Esta es la palanca central del plan: integrar por
reutilización, no por reescritura.

| Requisito del protocolo | Ya existe en el código | Reutilización |
| --- | --- | --- |
| **Quiebre Pragmático** (congelar animación/audio, medir reparación) | `ValeriaPragmaticBreakOverlay` + `trackRepairStrategy()` + enum `RepairStrategy` | Directa: es un ejercicio TEA de primera clase, ya instrumentado |
| **Ruido Babble** (slider manual 20→80 %) | `ValeriaManualNoiseSlider` (`valeriaNoise`) + `trackNoiseLevel()` | Directa: categorización TEA y rastreo léxico Dislexia |
| **Oso Distractor** (interferencia visual periférica, sin eventos táctiles) | `ValeriaDistractorBear` + `setDualTaskActive()` + ventanas de doble tarea | Directa: rastreo léxico y rastreo visual de rotaciones |
| **Mapa de calor de misclicks** (X,Y fuera del *bounding box*) | `ValeriaMisclickBoundary` + `trackMisclick()` (segmenta ui vs dualTask) | Directa: rastreo visual b/d, p/q |
| **Captura en hilo secundario** (fricción cero, `InteractionManager`) | Toda `valeriaTelemetry` vuelca con `runAfterInteractions` + debounce | Ya garantizada para los eventos nuevos |
| **Control dialectal es-DO** (no penalizar seseo, aspiración de /s/, líquidas en coda) | `foldDominican()` en `valeriaVoice` (pliegue caribeño del ASR) | Directa: Intruso Fonológico y Criba de Pseudopalabras |
| **Botonera de Juez** ("Lo dijo / Casi") cuando el STT falla | `MicPracticeCard` / `ResponseCaptureCard` (`ValeriaVoiceUI`) | Directa: síntesis fonémica y criba en hardware de gama baja |
| **Cápsula TPR de descarga** entre ensayos | `ValeriaTPRCapsule` + `ValeriaSessionBreakOverlay` | Directa: transición interrumpida TEA y descarga en criba |
| **Exportación silente** (QR + ShareSheet, id de sesión anónimo) | `valeriaTelemetry.buildExport()` + `ValeriaProExport` / `ValeriaQRCode` | Ya sirve para los eventos nuevos |
| **Voz neuronal offline** (Sharvard es, Celtia gl) | `enumerateExerciseSpeech()` → corpus horneado en CI | Extensible con las líneas nuevas; degrada a voz de sistema si falta |
| **El player ya monta el Panel del Adulto** | `ValeriaExercisePlayerScreen` importa Panel + Oso + Quiebre (líneas 55-57) | Enrutar TEA/Dislexia por el player da la carga comunicativa «gratis» |

> **Conclusión:** ~80 % de la instrumentación clínica que pide el protocolo ya
> está en el árbol. El trabajo dominante es **editorial-clínico** (bancos de
> contenido) más **dos interacciones nuevas** (síntesis fonémica con latencia y
> rastreo de rotaciones ortográficas), no infraestructura.

---

## 3. Arquitectura objetivo

Los dos módulos siguen el **mismo patrón meta-dirigido** que Audición y
Lenguaje (no el de pantalla autocontenida de Pares Mínimos), porque así heredan
sin coste el player, la escala de evaluación, las rondas de contenido, la voz y
el Panel del Adulto ya cableado.

```
Hub de Prescripción (ValeriaExerciseSelectionScreen)
├── 🗣️ Pares Mínimos      (pantalla propia)      ── sin cambios
├── 🧩 Expansión Semántica (pantalla propia)      ── sin cambios
├── 👂 Audición   (13, meta-dirigido → player)    ── sin cambios
├── 💬 Lenguaje   (7,  meta-dirigido → player)    ── sin cambios
├── 🧠 TEA        (5,  meta-dirigido → player)    ── NUEVO
└── 📖 Dislexia   (5,  meta-dirigido → player)    ── NUEVO

Datos (módulos PUROS, sin react-native → los enumera el corpus de voz)
├── valeriaExerciseMeta.ts     + TEA_META, DISLEXIA_META
├── valeriaExerciseBank.ts     + entradas en DB, VARIANTS, stages nuevos
└── valeriaExerciseEsDO.ts     + overrides dominicanos donde aplique

Instrumentación (REUTILIZADA tal cual)
├── ValeriaExercisePlayerScreen  (host: Panel + Oso + Quiebre + evaluación)
├── ValeriaAdultChaosPanel       (única puerta de carga)
├── valeriaTelemetry.ts          + BlockId 'tea' | 'dislexia'  (ver §7)
└── valeriaVoice.foldDominican   (control dialectal es-DO)
```

**Dos *stages* de mini-juego nuevos** en `valeriaExerciseBank.ts` (union `Stage`):

- `syn` — **síntesis fonémica rítmica**: emite fonemas aislados con latencia
  forzada (500 ms) y recoge la fusión por micro o por Juez.
- `rotation` — **rastreo de rotaciones ortográficas**: grafías con inversión
  espacial (b/d, p/q) camufladas en pictogramas SVG; captura misclicks X,Y.

El resto de ejercicios reutiliza *stages* existentes (`intruder`, `choice`,
`instruction`, `phrase`) con datos nuevos, sin tocar el motor del player.

---

## 4. Mapeo de la batería clínica

Notación: **[REUTILIZA]** = solo datos sobre infra existente · **[STAGE NUEVO]**
= requiere una interacción nueva en el player · **[MANUAL]** = estresor accionado
por el adulto desde el Panel.

### 4.1 Módulo TEA (PRT + TCC)

| # | Ejercicio | Encaje técnico | Evaluación |
| --- | --- | --- | --- |
| 1 | **TPR de Atención Conjunta Triangulada** | `stage: 'instruction'` con *Instigación Retardada* (bloqueo táctil 3 s, `Time Delay`). Reutiliza el patrón de `atencion_conjunta` (Lenguaje) y añade la retención del **Sello Doble** hasta contacto visual real. **[REUTILIZA + microcambio]** | EPT-3 (3★/2★/1★) — ya soportado |
| 2 | **Quiebre Pragmático Inducido** | **Ya existe**: `ValeriaPragmaticBreakOverlay`. Se expone como ejercicio con encuadre de consentimiento (ver §9). Mide latencia estresor→reparación con `trackRepairStrategy`. **[REUTILIZA]** **[MANUAL]** | Latencia + estrategia de reparación (`RepairStrategy`) |
| 3 | **Espejo Asimétrico (inhibición de ecopraxia)** | `stage: 'instruction'`: la voz neuronal dicta la orden motora; el adulto ejecuta una acción visual contradictoria. Sin tecnología nueva, solo consigna + guion para el adulto. **[REUTILIZA]** | 3★ (sigue el audio) / 1★ (ecopraxia sistemática) |
| 4 | **Transición Interrumpida (flexibilidad)** | Inyección de **cápsula TPR** abrupta a mitad de flujo, accionada por el adulto. Reutiliza `ValeriaTPRCapsule` / `ValeriaSessionBreakOverlay`. **[REUTILIZA]** **[MANUAL]** | Tolerancia a la transición (abandono vs continuidad) |
| 5 | **Categorización bajo Carga Sensorial** | `stage: 'intruder'`/`choice` (clasificación semántica) + **Ruido Babble** del Panel (20→80 %). Reutiliza `se1`/`se3` y `ValeriaManualNoiseSlider`. **[REUTILIZA]** **[MANUAL]** | Variación de aciertos vs nivel de ruido (correlación) |

**Ninguno de los cinco necesita un *stage* nuevo.** El módulo TEA es puramente
editorial-clínico + reutilización del Panel del Adulto.

### 4.2 Módulo Dislexia (fonología + acceso léxico)

| # | Ejercicio | Encaje técnico | Evaluación |
| --- | --- | --- | --- |
| 1 | **El Intruso Fonológico** | `stage: 'intruder'` **auditivo puro** (sin soporte textual): la voz dicta la serie ("pino, fino, lino, mino") y el niño aísla el intruso. **Control dialectal**: la validación pasa por `foldDominican` (seseo, /s/ implosiva, líquidas en coda **no** son error). **[REUTILIZA + flag `auditoryOnly`]** | EPT-3 sobre discriminación fonológica |
| 2 | **Rastreo Léxico con Interferencia** | Logotomas/frases en pantalla + **Oso Distractor** + **Ruido Babble** (ambos del Panel). Mide fluidez sin silabeo. **[REUTILIZA]** **[MANUAL]** | Velocidad de lectura sin silabeo (juicio del adulto) |
| 3 | **Síntesis Fonémica Rítmica** | **`stage: 'syn'` (NUEVO)**: fonemas aislados con latencia forzada de 500 ms; fusión por micro (STT) con **fallback a botonera de Juez** ("Lo dijo / Casi") en hardware lento. **[STAGE NUEVO]** | 3★/1★ + falsos negativos ASR vs Juez |
| 4 | **Criba de Pseudopalabras** | `stage: 'phrase'`/repetición estricta de logotomas ("mepoti", "faslumo"). Límite **rígido de 5 ensayos** por bloque, intercalando cápsula TPR de descarga. Control dialectal vía `foldDominican`. **[REUTILIZA + límite de ensayos]** | Falsos negativos ASR vs correcciones del Juez |
| 5 | **Rastreo Visual de Rotaciones** | **`stage: 'rotation'` (NUEVO)**: b/d, p/q camufladas en pictogramas SVG de alto contraste; el Oso orbita la zona; **captura de misclicks X,Y** vía `ValeriaMisclickBoundary`. **[STAGE NUEVO]** **[MANUAL]** | Densidad/coordenadas de misclicks (mapa de calor) |

**Solo dos ejercicios** (`syn`, `rotation`) requieren interacción nueva en el
player. Los otros tres son datos + flags sobre *stages* existentes.

---

## 5. Superficie de integración (cambios por archivo)

Lista exhaustiva y acotada de dónde se toca. Todo es **aditivo**; ninguna firma
pública existente cambia de forma incompatible.

| Archivo | Cambio | Naturaleza |
| --- | --- | --- |
| `src/valeriaExerciseMeta.ts` | Añadir `TEA_META` (5) y `DISLEXIA_META` (5); incluirlas en `META_BY_ID` | Aditivo |
| `src/valeriaExerciseBank.ts` | Ampliar union `Stage` con `'syn' \| 'rotation'`; añadir entradas `DB`, `VARIANTS`; añadir campos opcionales al `Exercise` (`auditoryOnly?`, `phonemes?`, `phonemeGapMs?`, `rotationTargets?`, `maxTrials?`); enumerar sus líneas de voz | Aditivo (campos opcionales) |
| `src/valeriaExerciseEsDO.ts` | Overrides dominicanos de los ejercicios con contenido léxico | Aditivo |
| `src/ValeriaExercisePlayerScreen.tsx` | Dos bloques de render nuevos (`stage === 'syn'`, `stage === 'rotation'`); dos `Set` de ids (`TEA_IDS`, `DISLEXIA_IDS`) y sus `markBlockCompleted('tea'/'dislexia')` | Aditivo (ramas nuevas) |
| `src/ValeriaExerciseSelectionScreen.tsx` | Dos `blockCard` nuevas (🧠 TEA, 📖 Dislexia) que abren la lista meta-dirigida; consentimiento del Quiebre en TEA | Aditivo |
| `src/valeriaTelemetry.ts` | Ampliar `BlockId` con `'tea' \| 'dislexia'`; **decoupling del disparo SUS** (ver §7) | Aditivo + 1 ajuste controlado |
| `voice-corpus.json` / CI de voz | Regenerar assets neuronales con las líneas nuevas (es, gl) | Regeneración (degrada con gracia si falta) |
| `docs/` | Este plan + (opcional) protocolo clínico de cada módulo, como los de Pares Mínimos | Aditivo |

**Sin tocar:** `AppNavigator` (los módulos no añaden rutas: reutilizan
`ExercisePlayer` y la lista del hub), `valeriaNoise`, `ValeriaDistractorBear`,
`ValeriaPragmaticBreak`, `ValeriaMisclickBoundary`, `valeriaCrypto`, Firebase,
gamificación. La instrumentación se consume, no se modifica.

---

## 6. Telemetría silente y matriz de riesgo regulatorio

La telemetría nueva **reutiliza los mismos nodos** ya cifrados y exportables. La
tabla del protocolo mapea 1:1 sobre funciones existentes:

| Módulo · estímulo | Métrica (exportable) | Función existente | Defensa MDR Clase IIa |
| --- | --- | --- | --- |
| TEA · Quiebre Pragmático / Transiciones | Latencia estresor→reparación (o claudicación) | `trackRepairStrategy` + `repairEvents` + `HighLoadContext` | El algoritmo nunca decide cuándo interrumpir: la «frustración útil» es 100 % humana |
| TEA · Categorización con Ruido Babble | Tasa de aciertos vs % del slider | `trackNoiseLevel` + `noiseEvents` | No es un audiómetro: el ruido solo muta si el dedo del adulto desplaza el control |
| Dislexia · Criba de Pseudopalabras | Falsos negativos ASR vs correcciones del Juez | Modo Juez de `MicPracticeCard` + `foldDominican` | El dataset es-DO rechaza estructuralmente penalizar codas inestables (sin sesgo) |
| Dislexia · Rastreo Visual + Oso | Densidad y coordenadas X,Y de misclicks bajo estrés | `trackMisclick` (segmentado ui/dualTask) + ventanas de doble tarea | Captura en hilo secundario (`InteractionManager`): fricción cero, sin bloquear audio/animación |

Todo viaja bajo el **id de sesión anónimo** ya existente y se exporta por QR /
ShareSheet sin cambios en el formato del bundle.

---

## 7. Garantías de no regresión

El requisito explícito es **«sin romper nada de lo que funciona»**. Riesgos
concretos identificados y su blindaje:

1. **Disparo del SUS acoplado a `ALL_BLOCKS`.** Hoy el modal SUS se dispara
   cuando se completan **todos** los bloques de `ALL_BLOCKS` (`markBlockCompleted`
   → `maybeRequestSus`). Si añadimos `'tea'` y `'dislexia'` a `ALL_BLOCKS` sin
   más, los pilotos en curso **nunca** volverían a completar «todos los bloques»
   y el SUS dejaría de dispararse → **regresión silenciosa**.
   **Mitigación:** desacoplar el disparo del *membership* total. Añadir los dos
   `BlockId` a la union (necesario para etiquetar eventos), pero cambiar la
   condición de `maybeRequestSus` a un **umbral de N bloques distintos
   completados** (p. ej. ≥ 4) en vez de igualdad con `ALL_BLOCKS`. Así el SUS
   sigue disparando como hoy y los módulos nuevos no lo bloquean ni lo fuerzan.
   Documentar el umbral en el propio `valeriaTelemetry`.

2. **Migración de sesiones persistidas.** `normalizeSession` ya es tolerante y
   los `BlockId` viajan como strings en un array; añadir valores al enum **no
   invalida** blobs antiguos. Verificado en el código actual.

3. **Corpus de voz.** Las líneas nuevas se hornean en CI; si un asset falta, el
   player **degrada a la voz del sistema** (comportamiento actual documentado en
   `valeriaExerciseBank`). Nunca rompe. Los **logotomas/pseudopalabras** pueden
   no sintetizar bien con el corpus a nivel de palabra: se marcan para
   fonema-a-fonema o se dejan en voz de sistema desde el día 1 (aceptable
   clínicamente y explícito en el protocolo).

4. **Módulos PUROS.** `valeriaExerciseBank` y `valeriaExerciseMeta` no importan
   react-native (los compila Node para el corpus). Los *stages* nuevos añaden
   **solo datos y tipos**; su render vive en el player. Mantener esta pureza es
   condición de que el corpus siga compilando.

5. **`Stage` como union cerrada.** Ampliarla con `'syn' | 'rotation'` obliga al
   compilador a exigir manejo en los `switch`/render del player: TypeScript
   **garantiza** que no queda un stage sin ruta. `npm run typecheck` es la red.

6. **El Panel del Adulto no se altera.** Se **consume** desde el player (ya lo
   monta). No se cambian sus props ni su contrato → Pares Mínimos, Expansión,
   Audición y Lenguaje siguen idénticos.

7. **Regla de oro MDR intacta.** Ningún ejercicio nuevo introduce ajuste
   automático de dificultad ni veredicto algorítmico. Se preserva el muro.

**Red de seguridad de cada fase:** `npm run typecheck` en verde + humo manual de
los 4 bloques actuales antes de fusionar (los módulos nuevos no deben aparecer
hasta que su fase los active).

---

## 8. Plan de trabajo por fases

Cada fase es **entregable y no rompe** (typecheck verde, bloques actuales
intactos). Las fases 1-4 pueden fusionarse de forma independiente.

### Fase 0 · Cimientos sin UI (bajo riesgo)
- Ampliar `BlockId` con `'tea' | 'dislexia'` y **desacoplar el disparo SUS** por
  umbral (§7.1). Cubrir con un caso de humo de telemetría.
- Ampliar la union `Stage` y los campos opcionales del `Exercise`.
- **Criterio de salida:** typecheck verde; 4 bloques actuales sin cambio visible.

### Fase 1 · Módulo Dislexia — camino de datos (reutilización pura)
- `DISLEXIA_META` (5) + entradas DB de los ejercicios que reutilizan stages
  existentes: **Intruso Fonológico** (`auditoryOnly`), **Rastreo Léxico**
  (Oso + Ruido), **Criba de Pseudopalabras** (`maxTrials: 5`).
- Enrutar validación por `foldDominican` (control dialectal es-DO).
- Tarjeta 📖 Dislexia en el hub (solo estos 3 ejercicios visibles).
- **Criterio de salida:** los 3 ejercicios juegan por el player con Panel del
  Adulto; telemetría de ruido/misclick/Juez fluye.

### Fase 2 · Módulo Dislexia — stages nuevos
- `stage: 'syn'` (síntesis fonémica con latencia 500 ms + fallback Juez).
- `stage: 'rotation'` (b/d, p/q en SVG + misclick heatmap + Oso).
- Enumerar sus líneas de voz; regenerar corpus.
- **Criterio de salida:** los 5 ejercicios de Dislexia completos; heatmap de
  misclicks exportable.

### Fase 3 · Módulo TEA — datos + reutilización (sin stages nuevos)
- `TEA_META` (5) + entradas DB: Atención Conjunta Triangulada (Time Delay 3 s),
  Espejo Asimétrico, Categorización bajo Ruido, Transición Interrumpida.
- **Quiebre Pragmático** como ejercicio con **consentimiento informado** y
  tutorial de encuadre en Modo Familia (§9).
- Tarjeta 🧠 TEA en el hub.
- **Criterio de salida:** módulo TEA jugable; latencias de reparación y
  correlación ruido↔aciertos en el bundle.

### Fase 4 · Variante es-DO y pulido de voz
- Overrides `valeriaExerciseEsDO` del léxico de ambos módulos.
- Revisión logopédica del contenido (registro dominicano culto).
- Horneado neuronal definitivo (es, gl) de las líneas deterministas.

### Fase 5 · Documentación clínica y evidencia
- Protocolos por módulo en `docs/` (formato Pares Mínimos).
- Actualizar README (tabla de bloques: de 4 a 6) y manual de casos de uso.

---

## 9. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| **Comité ético — Quiebre Pragmático** (punto de mayor fricción) | Alto (regulatorio) | Consentimiento informado explícito + tutorial de encuadre en Modo Familia; dejar claro que el estresor es **manual y reversible al instante**. Ya soportado por el overlay existente |
| **Sesgo dialectal es-DO** (penalizar seseo/aspiración = clínicamente aberrante) | Alto (validez) | Enrutar **toda** validación fonológica de Dislexia por `foldDominican`; casos de prueba con "puelta"→"puerta", seseo, /s/ implosiva |
| **Latencia STT en gama baja** (frustración en síntesis fonémica) | Medio | Fallback obligatorio a botonera de Juez ("Lo dijo / Casi"); instrucción al cuidador de silenciar el micro |
| **Regresión del SUS** por `ALL_BLOCKS` | Medio | Desacople por umbral (§7.1) antes de tocar la UI |
| **Fatiga cognitiva en Criba** (mayor carga de la batería) | Medio (clínico) | Límite rígido de 5 ensayos + cápsula TPR intercalada obligatoria |
| **Corpus de voz para logotomas** | Bajo | Degradación elegante a voz de sistema; horneado fonémico como refinamiento, no bloqueante |
| **Sobre-ingeniería / romper stages existentes** | Bajo | Campos nuevos **opcionales**; union `Stage` cerrada + typecheck como red |

---

## 10. Seguimiento

- [ ] **Fase 0** — `BlockId` + desacople SUS + `Stage`/campos opcionales · typecheck verde
- [ ] **Fase 1** — Dislexia (3 ejercicios de reutilización) + tarjeta de hub
- [ ] **Fase 2** — Dislexia stages `syn` y `rotation` + heatmap + voz
- [ ] **Fase 3** — TEA (5 ejercicios) + consentimiento del Quiebre + tarjeta de hub
- [ ] **Fase 4** — Overrides es-DO + revisión logopédica + horneado neuronal
- [ ] **Fase 5** — Protocolos clínicos en `docs/`, README (6 bloques) y manual

**Verificación transversal en cada PR:** `npm run typecheck` en verde · humo
manual de los 4 bloques actuales sin cambio · muro MDR intacto (cero ajuste
automático) · exportación de telemetría íntegra (QR + ShareSheet).
