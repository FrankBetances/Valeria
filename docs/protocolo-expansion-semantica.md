# Protocolo · Expansión Semántica / Progresión Léxica

> El trabajo semántico no es construir un diccionario digital: es establecer
> **relaciones operativas entre el símbolo y el mundo real del paciente**. Cada
> palabra se aprende cuando el niño la vive con el cuerpo, no solo cuando la oye.

Módulo de rehabilitación léxica **offline** para intervención temprana. Une cuatro
capas indivisibles en cada ítem:

| Campo | Función clínica |
| --- | --- |
| `visual_prompt` | Especificación técnica del asset: imagen **sin fondo**, **alto contraste**, contorno grueso y colores planos (reduce carga perceptiva y distractores). |
| `tts_string` | Texto exacto que **locuta** la app (entrada auditiva controlada). |
| `stt_expected_array` | Lista de strings que el motor ASR da por **válidos**, incluyendo **aproximaciones fonéticas propias de la edad** (p. ej. `agua` → `aba`, `awa`). |
| `parent_tpr_action` | Instrucción física corta para el adulto (Total Physical Response): ancla la palabra al cuerpo y al entorno real. |

Implementación: `src/valeriaSemanticExpansion.ts` (datos) + `src/ValeriaSemanticExpansionScreen.tsx`
(pantalla), accesible desde la selección de terapias. Flujo por paso:

```
CONSIGNA (TTS) → ESCUCHA (STT) → VEREDICTO (★) → ACCIÓN FÍSICA DEL ADULTO → continuar
```

Evaluación con `matchExpected()`: la palabra objetivo y sus aproximaciones valen por
igual (3★ al primer intento, 2★ tras repetir, 1★ en imitación asistida). Sin
micrófono (Expo Go / web) el adulto hace de juez con botones. Cada sesión se registra
en el historial y en la gamificación (XP, racha, nivel).

---

## 1. Arquitectura de datos · Escenarios de la vida diaria

Cinco escenarios; cada uno con **2 sustantivos, 2 verbos, 1 adjetivo y 1 onomatopeya**.

| Escenario | Sustantivos | Verbos | Adjetivo | Onomatopeya |
| --- | --- | --- | --- | --- |
| ☀️ Rutina de mañana | cama, cepillo | lavar, vestir | limpio | rin rin |
| 🍽️ Hora de comer | cuchara, vaso | comer, beber | rico | ñam ñam |
| 🌳 En el parque | pelota, tobogán | correr, saltar | alto | boing |
| 🛁 Hora del baño | bañera, jabón | bañar, frotar | caliente | chof |
| 🌙 A dormir | luna, cuento | dormir, abrazar | oscuro | uh uh |

## 2. Progresión transicional · De onomatopeya a adjetivo

Siete secuencias que evolucionan sobre un mismo eje temático en cuatro fases:
**Fase 1 (Onomatopeya) → Fase 2 (Sustantivo) → Fase 3 (Verbo) → Fase 4 (Adjetivo)**.
Cada fase incluye su instrucción TPR para el padre y el array STT con aproximaciones.

| Eje temático | 1 · Onomatopeya | 2 · Sustantivo | 3 · Verbo | 4 · Adjetivo |
| --- | --- | --- | --- | --- |
| 🚗 Transporte · el coche | brum | coche | corre | rápido |
| 🐶 Animales · el perro | guau | perro | salta | peludo |
| 🐄 Animales · la vaca | muu | vaca | come | grande |
| 🐱 Animales · el gato | miau | gato | duerme | suave |
| 🌧️ Naturaleza · la lluvia | plic plic | agua | cae | mojado |
| 🚂 Transporte · el tren | chucu chucu | tren | para | largo |
| 🐦 Animales · el pájaro | pío pío | pájaro | vuela | pequeño |

## 3. Contraste activo · Verbos y adjetivos

Seis cápsulas TPR de pares en contraste con **dos vueltas evaluadas** (palabra
objetivo y su opuesta, cada una con su disparador TTS, su array STT y su acción
física). El sistema guía al padre: **Setup físico** (prepara el entorno real) →
**Disparador TTS** (pregunta exacta) → **Criterio de éxito STT** (palabra de la
vuelta) → **segunda vuelta** con la palabra opuesta, también evaluada.

| Cápsula | Par | Setup físico (resumen) | Vuelta 1 | Vuelta 2 |
| --- | --- | --- | --- | --- |
| CT-1 | grande / pequeño | dos peluches del mismo animal, uno grande y uno pequeño | grande | pequeño |
| CT-2 | limpio / sucio | dos cucharas iguales, una limpia y otra manchada | sucio | limpio |
| CT-3 | abrir / cerrar | una caja con tapa y el juguete favorito dentro | abrir | cerrar |
| CT-4 | subir / bajar | una rampa con un libro inclinado y un coche al pie | subir | bajar |
| CT-5 | frío / caliente | dos vasos, uno con agua fría y otro con agua tibia | frío | caliente |
| CT-6 | encender / apagar | el interruptor de la luz (o una linterna), luz apagada | encender | apagar |

---

## Principios de diseño

- **Format-first**: el contenido vive como datos tipados y validables, separado de la UI.
- **Aproximaciones fonéticas**: en rehabilitación no exigimos articulación perfecta; se
  premia la aproximación propia de la edad para no frustrar y mantener la motivación.
- **Anclaje corporal (TPR)**: ninguna palabra se cierra sin una acción física del adulto
  que la conecte con un objeto o gesto del entorno real del niño.
- **Contraste como motor semántico**: los pares antónimos (grande/pequeño, abrir/cerrar)
  hacen operativa la palabra: solo se entiende "grande" cuando existe "pequeño" al lado.
