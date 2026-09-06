# Análisis de la rama galega · 6/9/2026

> **Qué es esto.** Auditoría del estado del galego en Valeria+, medida sobre el
> código de `main` (07a470e). No cambia nada de la app: es el diagnóstico previo
> a decidir el siguiente incremento. Todo número de aquí se obtuvo ejecutando o
> parseando el repo; lo que no se ha comprobado se dice.

**Cómo se midió** — 30 gates de `android.yml` ejecutados (30/30 en verde),
`npm run typecheck` limpio, conteo de entradas con el parser de TypeScript sobre
los módulos de banco, y agregación de `voice-corpus.json` y de los cinco
`voice-assets-manifest.*.json`. **No hay captura de pantalla**: nada de lo que
sigue afirma cómo se ve una pantalla.

## Tesis

El galego es hoy la variedad **mejor cubierta en terapia y peor cubierta como
producto**. Tiene banco clínico completo y voz neuronal propia, pero no tiene
interfaz, no tiene capa dialectal, no deja rastro de sí mismo en los datos y el
módulo más nuevo de la app no existe en galego. El catalán —sin hospital— tiene
justo lo que le falta al galego, que sí tiene el hospital.

## 1. Lo que SÍ está (y está completo)

| Bloque | galego | castellano | Paridad |
| --- | --- | --- | --- |
| Audición/Lenguaje/TEA/Dislexia (`EXERCISE_*`) | 37 | 37 | ✅ |
| Variantes de ejercicio (`VARIANTS_*`) | 21 | 21 | ✅ |
| Expansión semántica (escenarios · categorías · secuencias · cápsulas) | 5 · 5 · 9 · 8 | 5 · 5 · 9 · 8 | ✅ |
| Cápsulas TPR · rutas de rutina | 8 · 2 | 8 · 2 | ✅ |
| Bancos de refuerzo (elogio/casi/no-oído/juntos) | 6 · 4 · 3 · 3 | 6 · 4 · 3 · 3 | ✅ |
| Elogios de escritura | 3 | 3 | ✅ |
| Voz neuronal pregenerada | Celtia · 829 locuciones · 16,7 MB · 46 min | Sharvard · 1 444 | — |

Aprobado por la revisora logopeda galegofalante (jul 2026) y locutado con Celtia
(Proxecto Nós). El corpus enumera el 100 % de lo que la app dice en `gl`
(`check-voice-corpus-coverage.js` en verde).

## 2. Lo que NO está, por orden de riesgo

### 2.1 · Cero capa dialectal galega (riesgo clínico)

`normalizeSpeech` (src/valeriaVoice.ts:1342) pliega **es-DO** (`foldDominican`) y
**eu** (`foldBasque`). Para `gl` no pliega nada.

Y `PM-GL-3` (`casa`/`caza`) evalúa el contraste /s/–/θ/ **sin** el campo
`region: 'distincion'`, que existe en el tipo `MinimalPair`
(src/valeriaMinimalPairs.ts:74) y que el banco castellano sí usa (línea 144).
En zona seseante —el occidente: A Coruña y Pontevedra costeras, parte de
Ourense— ese par penaliza la **variedad** del niño, no su fonología. El propio
plan de Nós clasificó esto como riesgo *«Alto (clínico)»* y proponía exactamente
esta solución; no se implementó.

Para el piloto de Lugo el riesgo es bajo (el oriente no sesea). Para escalar a
Vigo, Santiago o A Coruña, no.

**Coste de arreglarlo: una línea** en `valeriaMinimalPairsGl.ts` más el filtrado
que ya existe para el castellano.

### 2.2 · El banco de pares galego cubre la mitad que el catalán

| Banco | Pares | Grupos fonológicos |
| --- | --- | --- |
| castellano | 16 | 6 (Rotacismo, Sigmatismo, Velares, Labiodental, Nasales, Laterales) |
| català | 12 | 8 (propios: sonoritat sibilant, xeix i ge, obertura vocàlica, lateral palatal) |
| en-US | 9 | 7 (propios) |
| **galego** | **7** | **4** (Rotacismo, Sigmatismo, Velares, Labiodental) |
| euskera | 5 | 2 |

Faltan **Nasales** y **Laterales**, que ya están en la lista castellana que el
galego reutiliza. Y falta lo importante: el README argumenta que el catalán
mereció banco propio porque trae contrastes **inexistentes en castellano** —
/ʃ/, la abertura vocálica /ɔ/–/o/ y la lateral palatal /ʎ/–/l/. **El galego
tiene los tres** y no hay ni un par para ninguno:

- **/ʃ/** (⟨x⟩: *xogo*, *caixa*) — sustituciones /ʃ/→[s] o [tʃ] son error
  frecuente en niños galegofalantes; ningún par lo mide.
- **Abertura vocálica** /ɔ/–/o/ y /ɛ/–/e/ (*óso* / *oso*, *bóla* / *bola*) — es
  el rasgo que separa el sistema de siete vocales del galego del de cinco del
  castellano, y es fonémico.
- **Lateral palatal** /ʎ/ (*palla*, *mollar*), más viva en galego que en el
  castellano yeísta.

El galego usa `PAIR_GROUPS` castellano, que no tiene dónde alojar ninguno de los
tres: haría falta `PAIR_GROUPS_GL`, como ya se hizo para `ca` y `en`.

**Propuesta:** PM-GL-8…13 con esos contrastes, revisión logopédica de la misma
revisora, y `PAIR_GROUPS_GL`. Es el incremento clínico de mayor valor.

### 2.3 · No hay interfaz en galego

`UiLang = 'es' | 'en' | 'ca'` (src/valeriaUiLang.ts:32). El selector ofrece
**Automático · Español · English · Català** (src/ValeriaUiLangPicker.tsx).

Consecuencia operativa: en Lugo, con Celtia hablándole al neno en galego, la
logopeda y la familia leen la app **en castellano**. En Barcelona, donde no hay
hospital, se lee en catalán. El sitio legal (`site/`) tampoco tiene versión
galega: solo `privacidad.html` (ES) y `privacy.html` (EN).

**Coste medido de `strings.gl.ts`:** 29 espacios de nombres, **1 249 claves
hoja**, 224 de ellas funciones de interpolación, ~38 500 caracteres (~6 500
palabras) de texto castellano a reautorizar. **No añade ni una locución**: el
catálogo lo lee el adulto, no se locuta. Hay precedente completo y reciente
(catalán, cerrado el 5/9/2026) y la suite `test-challenger-final-ca-integration.js`
es parametrizable a `gl` casi tal cual.

### 2.4 · Aventuras con Lúa: 105 actividades, cero en galego

Las 553 locuciones `lua/*` del corpus existen **solo en `es`** (0 en gl, eu, en,
ca). Es deuda **declarada** —`luaSpeech.ts` la documenta y
`check-lua-voice-language.js` la sujeta, de modo que en sesión galega suena
Sharvard de verdad y no Celtia leyendo castellano—, no un fallo silencioso. Pero
es el módulo más visible del último trimestre y en Galicia se ve entero en
castellano.

### 2.5 · Test de Ling: el euskera tiene consignas propias; el galego no

`LING_SOUNDS_EU`, `_CA`, `_EN` y `_ESDO` existen; `_GL` no
(src/valeriaLingContent.ts). `lingContentForLocale('gl')` devuelve el texto
castellano. Un tutor vascófono lee las consignas en euskera; uno galegofalante,
en castellano. La asimetría es deliberada y está comentada, pero es difícil de
defender ante la Xunta.

### 2.6 · La sesión no sabe en qué lengua ocurrió

`SessionRecord` (src/valeriaTelemetry.ts:83) guarda `ui?: 'v10' | 'v11'` para
poder separar las series de las dos interfaces, pero **no guarda la variedad**.
`trackAsrMode(mode, locale)` sí etiqueta locale, así que la fontanería existe.

Además, el locale es **global**, no por paciente: no hay campo de idioma en la
ficha (`ValeriaFichaRegistroScreen.tsx`), aunque el plan de Nós lo tenía en
alcance (GL-1.x) y `valeriaLocale.ts` lo anuncia como refinamiento pendiente. En
una consulta bilingüe eso significa que la logopeda tiene que acordarse de mover
un ajuste global entre paciente y paciente, y **nada registra si se acordó**.

Consecuencia directa: no se pueden comparar resultados es/gl ni en el panel ni
en la tesis. Es la tarea **GL-5.2**, todavía sin hacer.

## 3. Documentación desalineada con el código

| Dónde | Dice | Es |
| --- | --- | --- |
| `docs/plan-integracion-proxecto-nos.md` §8 | Fases 1, 3, 4 y 5 sin marcar | Fases 1 y 3 hechas y en producción desde jul-ago 2026 |
| `src/valeriaPairBanks.ts:9` | «banco galego (Proxecto Nós, **borrador**)» | `valeriaMinimalPairsGl.ts` dice «✅ APROBADO PARA PRODUCCIÓN» |
| `README.md:696` | «**todos los bloques** tienen banco gallego propio» | Enumera 8 bloques; quedan fuera Aventuras con Lúa y el Test de Ling |
| `CLAUDE.md` §1b | «Son 25 hoy» (gates) | `android.yml` corre **30** |

## 4. Hallazgo lateral: 37,4 MB de audio huérfano

`assets/voice/` tiene 6 059 ficheros; el mapa de requires
(`valeriaVoiceAssets.ts`) referencia 4 711. Sobran **1 348 ficheros · 37,4 MB**
(es 770, eu 359, **gl 211**, en 8; `ca` cuadra exacto), restos de tandas de
corpus anteriores. **No he verificado** si `assetBundlePatterns: ["assets/*"]`
los mete en el AAB o si Metro los deja fuera por no estar requeridos; hasta
comprobarlo, el dato firme es que están en el repo y en git.

## 5. Recomendación

Tres frentes reales. En orden de valor por esfuerzo:

**A · Galicia como producto (recomendado).** `strings.gl.ts` + `region` en
PM-GL-3 + `locale` en `SessionRecord`. Convierte el galego de variedad de
terapia en producto galego, que es lo que se enseña a Xunta, SERGAS y ACOPROS.
Dentro de A, **empezar por las dos líneas** (`region` y `locale`: una tarde)
antes que por el catálogo (una semana).

**B · Rigor clínico.** PM-GL-8…13 con /ʃ/, abertura vocálica y /ʎ/, más
`PAIR_GROUPS_GL` y las Nasales/Laterales que faltan. Más valor clínico, menos
visible, y exige otra ronda de revisión logopédica.

**C · Paridad de módulo.** Aventuras con Lúa en galego: 553 locuciones nuevas
con Celtia y reautorización de 105 actividades. El más caro y el más vistoso.

A y B son independientes y se pueden solapar. C no debería empezar antes que A.
