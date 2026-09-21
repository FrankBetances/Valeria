# Informe de Auditoría Fonémica y Oposición de Rasgos · Valeria+

> **Metodología**: Adaptación del algoritmo de distancia fonémica de `minpair` (MIT) mediante matrices de rasgos distintivos (Punto, Modo y Sonoridad).

---

## 1. Fundamento Clínico y Acústico

En lugar de calcular la distancia léxica ortográfica mediante Levenshtein (que mide similitud tipográfica y no acústica), el módulo de Pares Mínimos y Dislexia de Valeria+ evalúa contrastes basados en la matriz fonológica:

$$D(p_1, p_2) = w_v |V_1 - V_2| + w_p \delta_P + w_m \delta_M \in [0, 3]$$

- **$D = 1$ (Oposición Mínima)**: Las dos consonantes difieren en un único rasgo articulatorio (ej. `/p/` vs `/b/` difieren únicamente en sonoridad; `/t/` vs `/k/` difieren únicamente en punto).
- **$D = 2$ (Oposición Intermedia)**: Dos rasgos difieren (ej. punto y sonoridad, o punto y modo).
- **$D = 3$ (Oposición Máxima)**: Los tres rasgos difieren simultáneamente (ej. `/m/` nasal-bilabial-sonoro frente a `/k/` oclusivo-velar-sordo).

---

## 2. Cobertura de Variedades

Las matrices en `scripts/phoneme-features.ts` contemplan los inventarios específicos:
1. **Castellano (`es`)**: 15 pares clínicos (rotacismo, sigmatismo, velares, labiodental, nasales, laterales).
2. **Galego (`gl`)**: Contrastes postalveolar /ʃ/ (xeada), abertura vocálica /ɔ/–/o/, lateral palatal /ʎ/, nasales y distinción vs seseo.
3. **Català (`ca`)**: Contrastes /s/–/z/ (sonoritat sibilant), /ʃ/–/ʒ/ (xeix i ge), /ɔ/–/o/ (obertura vocàlica) y /ʎ/–/l/.
4. **Euskara (`eu`)**: Sibilantes y africadas /ts/, /tʃ/, /s̺/, /s̻/.
5. **US English (`en-US`)**: Inventario ARPAbet y veredictos dialectales (AAVE / Southern).
6. **Dominicano (`es-DO`)**: Tolerancia de rasgos caribeños (seseo, neutralización líquida).

---

## 3. Generación de Distractores Graduados para Dislexia

Para los ejercicios de Dislexia (`dx1` Intruso Fonológico y `dx2` Rastreo Léxico), la selección de distractores ya no se basa en cadenas de texto parecidas, sino en dificultad acústica graduada:
- **Nivel 1 (Fácil)**: Distractor con $D = 3$ (fácilmente distinguible por el niño).
- **Nivel 2 (Medio)**: Distractor con $D = 2$.
- **Nivel 3 (Reto clínico)**: Distractor con $D = 1$ (alta competencia auditivo-fonológica).

---

## 4. Estado de Validación y Firma

Este informe y el algoritmo de compilación quedan integrados bajo el gate automatizado `scripts/check-phoneme-balance.js`.
