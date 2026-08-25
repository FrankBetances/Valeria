# 🐈‍⬛ Valeria+ · Memoria Técnica de Actualización
## Insignias de Lúa, Calibración Fonética de Voz, Láminas de Streaming y Pizarra Mágica de Escritura

---

## 📑 Resumen Ejecutivo

En esta actualización se han implementado cuatro grandes evoluciones técnicas, clínicas y de experiencia de usuario (UI/UX) en la rama **`insignias_textos`**:

1. **Rediseño Integral de Insignias y Textos de Lúa** ($24 \times 24$ px píxel art inspirado en la evolución de la gata y el desarrollo del lenguaje).
2. **Calibración Fonética y Acústica de la Voz en Castellano** (corrección de formantes en la vocal **/a/**, vibrante múltiple **/r̄/** y filtro fonético anti-artefactos G2P).
3. **Láminas de Reconocimiento de Voz (Modo B · Word-by-Word Streaming)** (andamiaje multimodal para longitud media del enunciado y feedback táctil/visual en tiempo real).
4. **La Pizarra Mágica de Lúa (Módulo de Grafomotricidad y Escritura para Dislexia)** (canvas vectorial interactivo de 60 FPS con soporte para lápices ópticos/stylus, pauta Montessori y trazado direccional anti-inversión $b/d$).

---

## 🎖️ 1. Rediseño de Insignias y Textos de Lúa

### Enfoque de Diseño y Filosofía Clínica
Todo el sistema de recompensas visuales se ha refundado para que los pictogramas tengan un **vínculo directo con la mascota oficial Lúa y con las etapas de desarrollo cognitivo y del lenguaje** del menor, sustituyendo pictogramas genéricos o difíciles de distinguir.

### Catálogo de 9 Glifos Matriciales ($24 \times 24$ px)
Ubicados en [`src/ValeriaPixelArt.ts`](src/ValeriaPixelArt.ts) con la paleta de 21 colores de Lúa:

| Glifo | Nombre de la Insignia | Significado Clínico y Evolución de Lúa |
| :--- | :--- | :--- |
| **0 (`flame`)** | *Cascabel Fonador* | Primeras vocalizaciones, modulación y vibración de cuerdas vocales. |
| **1 (`paw`)** | *Huella de Exploradora* | Constancia en el sendero terapéutico y hábitos de práctica diaria. |
| **2 (`star`)** | *Orejitas Atentas* | Discriminación y memoria auditiva secuencial (Detección e Identificación). |
| **3 (`sunrise`)** | *Lupa / Farol Curioso* | Atención sostenida, contacto visual y enfoque atencional conjunto. |
| **4 (`moon`)** | *Lúa Soñadora (Calma)* | Autorregulación sensorial, pausas activas y reducción de la sobrecarga. |
| **5 (`home`)** | *Mochila de Palabras* | Expansión léxica, campos semánticos y vocabulario funcional. |
| **6 (`yarn`)** | *Ovillo de Cuentos* | Fluidez morfosintáctica, estructuración de frases y narrativa oral. |
| **7 (`heart`)** | *Ronroneo Afectivo* | Vínculo terapéutico en díada (cuidador + menor) y pragmática comunicativa. |
| **8 (`crown`)** | *Corona Lunar (Maestría)* | Nivel 10 de maestría integral y generalización a entornos naturales. |

### Textos Pediátricos e Inclusivos (i18n)
Actualizados los catálogos en español ([`src/i18n/strings.es.ts`](src/i18n/strings.es.ts)) e inglés ([`src/i18n/strings.en.ts`](src/i18n/strings.en.ts)) con paridad estricta 1:1, eliminando tecnicismos y reforzando la empatía familiar.

---

## 🔊 2. Mejora Fonética y Acústica de la Voz en Castellano

### Diagnóstico de los Defectos en la «R» y en la «A»
- **Fallo G2P por Grafías Artificiales**: En los bancos de rotacismo se empleaban textos con letras repetidas (`¡Rrrana!`, `rrrrana`, `¡Perrro!`, `¡Rrrata!`, `cerrro`). Los sintetizadores de voz (Google TTS, Apple Speech y Piper VITS) no reconocían estas palabras en su léxico fonético, intentando deletrear (*«erre-erre-erre...»*) o emitiendo ruidos guturales rotos.
- **Distorsión por Ralentización Extrema (`rate: 0.60`)**: El algoritmo de *time-stretching* aplanaba los formantes acústicos de la vocal abierta **/a/** ($F_1 \approx 700\text{ Hz}$, $F_2 \approx 1300\text{ Hz}$), haciéndola sonar gangosa o metálica, y fragmentaba la vibración apical de la **/r/** en clics digitales.

### Soluciones Aplicadas
1. **Limpieza Canónica de Cadenas** ([`src/valeriaMinimalPairs.ts`](src/valeriaMinimalPairs.ts) y [`src/valeriaMinimalPairsGl.ts`](src/valeriaMinimalPairsGl.ts)):
   - Sustitución por palabras estándar en español y gallego (`¡Rana!`, `¡Perro!`, `¡Rata!`, `¡Cerro!`, `Rúa!`, `Rei!`). En español, una sola «R» inicial ya produce la vibrante múltiple nativa $/r̄/$.
2. **Calibración de la Velocidad de Modelado Fonético** ([`src/valeriaVoice.ts`](src/valeriaVoice.ts)):
   - `speakWordSlow`: Ajustado de `0.60` a **`0.78`** con `pitch: 1.05` (preserva formantes naturales de la **/a/** y los ciclos de oclusión de la **/r/**).
   - `speakPhraseSlow`: Calibrado a **`0.80`** con `pitch: 1.05`.
3. **Filtro de Saneamiento Fonético Pre-TTS (`sanitizePhonetics`)**:
   - Normalizador en tiempo real que intercepta y limpia repeticiones no deseadas antes de invocar a `Speech.speak`.
4. **Sincronización del Corpus**:
   - `voice-corpus.json` y `src/valeriaVoiceAssets.ts` sincronizados.

---

## 💬 3. Láminas de Reconocimiento de Voz (Modo B · Word-by-Word Streaming)

```
Frase objetivo: «La gata come pan»
┌────────────────────────────────────────────────────────┐
│  [🔊 Oír modelo]     [🎤 Escuchando...]                │
├────────────────────────────────────────────────────────┤
│  LÁMINAS DE LA FRASE              3 de 4 conseguidas   │
│  [==========================              ] 75%        │
│                                                        │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌───────┐│
│  │ ① "La"   │   │ ② "gata" │   │ ③ "come" │   │④ "pan"││
│  │   ✓      │   │   ✓      │   │   ✓      │   │   ... ││
│  │ Conseguida│  │ Conseguida│  │ Conseguida│  │ Espera││
│  └──────────┘   └──────────┘   └──────────┘   └───────┘│
└────────────────────────────────────────────────────────┘
```

### Características del Componente (`src/ValeriaSentenceWordCards.tsx`)
- **Desglose Léxico y Sintáctico Dinámico**: Descompone cualquier frase objetivo en tarjetas visuales independientes numeradas ($1, 2, 3, 4$).
- **Sincronización con el ASR en Streaming**: A medida que `expo-speech-recognition` emite resultados parciales (`onPartial`) y finales, evalúa palabra por palabra con tolerancia fonética pediátrica ($\le 1$ fonema de distancia en palabras $> 3$ letras).
- **Micro-interacciones y Animación (*Spring Physics*)**:
  - *Palabra en curso*: Resplandor pulsante suave turquesa (`#00C4BE`).
  - *Palabra conseguida*: Rebote elástico (*scale 1.14 $\rightarrow$ 1.0*), fondo verde esmeralda (`#DCFCE7`), borde `#16A34A`, medalla de check `✓` y vibración háptica suave (`Vibration.vibrate(15)`).
  - *Palabras pendientes*: Fondo blanco neutro sin cruces rojas ni castigos visuales (*Regla: Lúa nunca castiga*).
- **Integración Nativa**: Embebido directamente en `<MicPracticeCard />` en [`src/ValeriaVoiceUI.tsx`](src/ValeriaVoiceUI.tsx).

---

## ✏️ 4. La Pizarra Mágica de Lúa (Módulo de Escritura y Grafomotricidad para Dislexia)

```
┌─────────────────────────────────────────────────────────────┐
│  🎨 GRAFOMOTRICIDAD · DISLEXIA                 Nivel 1 🌟🌟 │
│  Traza la letra: "b" (de barco) ⛵                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         ① ──┐                                               │
│             │                                               │
│             │  ┌─── ② ──┐                                   │
│             │  │        │   [ Canvas Vectorial SVG 60 FPS ] │
│             ▼  │        │   (Pauta Montessori Punteada)     │
│             └──┴────────┘                                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [🔊 Oír Fonema]   [🎨 Paleta Tizas]   [🧹 Borrar]   [✨ Listo]│
└─────────────────────────────────────────────────────────────┘
```

### Fundamentación Clínica
En dislexia y disgrafía, uno de los mayores desafíos es la confusión visual de grafemas simétricos o especulares (**$b \leftrightarrow d$, $p \leftrightarrow q$, $m \leftrightarrow w$**). El uso de **lápices ópticos (*stylus*) en tablets** activa la **memoria motora kinestésica**, grabando en la corteza cerebral el orden direccional del trazo (en la `b` el palo desciende primero y la barriga abre a la derecha; en la `d` el óvalo se traza primero).

### Componentes Creados
1. **Lienzo de Escritura Vectorial ([`src/ValeriaWritingCanvas.tsx`](src/ValeriaWritingCanvas.tsx))**:
   - Renderizado con `react-native-svg` a 60 FPS y captura mediante `PanResponder`.
   - Suavizado cuadrático Bézier (`pointsToSmoothSvgPath`) que elimina dientes de sierra.
   - Pauta Montessori regulable (línea superior, altura de x y línea base turquesa).
   - Detección de waypoints numerados con radio de tolerancia pediátrico ($\approx 32\text{ px}$) y validación de orden direccional.
2. **Banco de Trazos y Grafemas ([`src/valeriaWritingBank.ts`](src/valeriaWritingBank.ts))**:
   - Modelos calibrados de letras críticas ($b, d, p, m$), lazos pre-escritura y ondas.
3. **Pantalla Completa de Ejercicio ([`src/ValeriaWritingExerciseScreen.tsx`](src/ValeriaWritingExerciseScreen.tsx))**:
   - Selector de categorías: *Letras Críticas*, *Lazos y Calentamiento*, *Pizarra Libre*.
   - Paleta de 5 tizas mágicas (Turquesa, Dorado, Coral, Cielo, Lavanda) y 3 grosores de pincel.
   - Botón de modelado fonético (🔊 *Oír fonema* con TTS).
   - Modal de celebración con la mascota Lúa (`CatPixel`) y asignación de XP.
4. **Iconografía Nativa ([`src/ValeriaBlockIcons.tsx`](src/ValeriaBlockIcons.tsx))**:
   - Añadidos los iconos vectoriales `'pencil'` y `'eraser'`.

---

## 🧪 5. Verificación de Calidad y Pruebas Empíricas

Todos los cambios han sido verificados empíricamente en la suite de pruebas del proyecto:

```bash
# 1. Comprobación estricta de tipos TypeScript
npm run typecheck
# Salida: 0 errores (tsc --noEmit)

# 2. Gate de prosodia de voz
node scripts/check-speech-prosody.js
# Salida: 3376 enunciados bajo prueba (100% de invariantes P1 a P5 superadas)

# 3. Auditoría de catálogo de cadenas i18n
node scripts/check-ui-strings.js
# Salida: Paridad 1:1 superada sin literales sueltos

# 4. Auditoría de selectores por variedad
node scripts/check-variety-branches.js
# Salida: 5 variedades verificadas (es, gl, es-DO, eu, en)
```

---

## 📁 6. Mapa de Archivos Modificados y Creados

```
Valeria/
├── README_ACTUALIZACION_LUA_VOZ_ESCRITURA.md   # [NUEVO] Memoria técnica completa
├── src/
│   ├── ValeriaBlockIcons.tsx                  # [MODIFICADO] Iconos pencil y eraser
│   ├── ValeriaPixelArt.ts                     # [MODIFICADO] 9 glifos de Lúa en 24x24 px
│   ├── ValeriaSentenceWordCards.tsx           # [NUEVO] Láminas de segmentación de frase
│   ├── ValeriaVoiceUI.tsx                     # [MODIFICADO] Integración de láminas en MicPracticeCard
│   ├── ValeriaWritingCanvas.tsx               # [NUEVO] Lienzo vectorial para stylus
│   ├── ValeriaWritingExerciseScreen.tsx       # [NUEVO] Pantalla de La Pizarra Mágica de Lúa
│   ├── valeriaGamification.ts                 # [MODIFICADO] Familias de insignias de Lúa
│   ├── valeriaMinimalPairs.ts                 # [MODIFICADO] Limpieza fonética G2P (R y A)
│   ├── valeriaMinimalPairsGl.ts               # [MODIFICADO] Limpieza fonética en galego
│   ├── valeriaVoice.ts                        # [MODIFICADO] Calibración speakWordSlow (0.78) y sanitizePhonetics
│   ├── valeriaVoiceAssets.ts                  # [MODIFICADO] Mapa de audio regenerado
│   ├── valeriaWritingBank.ts                  # [NUEVO] Banco de modelos para trazado
│   └── i18n/
│       ├── strings.es.ts                      # [MODIFICADO] Claves i18n de insignias, láminas y escritura
│       └── strings.en.ts                      # [MODIFICADO] Claves i18n equivalentes en inglés
└── voice-corpus.json                          # [MODIFICADO] Corpus de voz sincronizado
```
