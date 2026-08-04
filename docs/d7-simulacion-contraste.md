<!-- ARCHIVO GENERADO · no editar a mano.
     Regenerar con: node scripts/asr-d7-sim.js > docs/d7-simulacion-contraste.md
     (conservando esta cabecera). Origen: docs/plan-asr-privacidad-y-motor-local.md §4.0.
     D7 se cerró con O2 el 2026-08-04; la fila «Vigente» llama al matchPair real
     y sirve de comprobación de que lo implementado es lo que se decidió. -->

# D7 · ¿qué hacer con el umbral fonético de los pares mínimos?

## 1. La evidencia disponible

El proyecto ya tiene **1619 aproximaciones validadas clínicamente**, en los
`stt_expected_array` de 424 ítems de Expansión Semántica de las cuatro variedades.
Son las formas que el equipo decidió dar por buenas cuando las produce un niño.

**A qué distancia están de la forma canónica:**

| Distancia de edición | Aproximaciones | % |
| --- | --- | --- |
| 0 | 57 | 3.5 % |
| 1 | 992 | 61.3 % |
| 2 | 421 | 26.0 % |
| 3+ | 149 | 9.2 % |

> **Dos lecturas, y las dos importan.** El 61 % de lo que se acepta está a UNA letra:
> eso es exactamente lo que cubre la tolerancia de `matchTarget`, así que la tolerancia hace
> trabajo clínico real y quitarla sin más tiene coste. Pero el 35 % está a dos o más:
> esas no las cubre ninguna tolerancia y se aceptan porque están **escritas una a una** en
> el array. Es decir: el proyecto ya resuelve este problema por enumeración en todos los
> ejercicios menos en pares mínimos, que es el único que depende solo de la tolerancia.

**Qué procesos aparecen** (clasificación gruesa, para dimensionar):

| Proceso | Casos |
| --- | --- |
| elisión interna o múltiple | 605 |
| elisión inicial | 384 |
| elisión final | 217 |
| sustitución consonántica interna | 126 |
| sustitución de la consonante inicial | 119 |
| idéntica | 57 |
| adición | 52 |
| sustitución múltiple | 43 |
| sustitución vocálica | 16 |

## 2. Habla aproximada aplicada a los 35 pares

Aplicando esos procesos a los objetivos de los pares mínimos salen
**174 producciones aproximadas**, de las cuales:

- **157 seguras**: no coinciden con el distractor. Idealmente deberían seguir puntuando como acierto.
- **17 colisiones**: la aproximación ES la palabra del distractor.

> Las colisiones son el nudo del problema y no las resuelve ninguna regla de este
> documento. Si el niño dice «lana» no hay texto que permita saber si intentaba decir
> «rana» y le salió mal —que es el error que el ejercicio busca— o si estaba diciendo
> «lana». **El conjunto de aproximaciones aceptables y el conjunto de errores clínicos
> se solapan por construcción**, y por eso el adulto es el juez final. Lo que sí se puede
> decidir es hacia qué lado cae la app por defecto.

## 3. Qué hace cada salida

| Regla | Contrastes recuperados | Objetivo perfecto sigue siendo acierto | Aprox. segura → acierto | → «casi» | → **error ajeno** | → «no te escuché» |
| --- | --- | --- | --- | --- | --- | --- |
| Antes de D7 · tolerancia de 1 letra | **10/35** | 35/35 | 116 (74 %) | 27 (17 %) | 0 (0 %) | 14 (9 %) |
| O1 · exactitud cuando hay distractor | **35/35** | 35/35 | 2 (1 %) | 141 (90 %) | 0 (0 %) | 14 (9 %) |
| O2 · vecino más cercano | **35/35** | 35/35 | 59 (38 %) | 97 (62 %) | 0 (0 %) | 1 (1 %) |
| O4 · exactitud + lista de aproximaciones | **35/35** | 35/35 | 157 (100 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |
| **Vigente en la app** (`matchPair` real) | **35/35** | 35/35 | 59 (38 %) | 97 (62 %) | 0 (0 %) | 1 (1 %) |

> ⚠️ **El 100 % de O4 es circular**: la lista se generó con las mismas formas con las
> que se la evalúa. Lo que decide si O4 sirve es qué hace con lo que nadie previó.
> Dejando fuera un proceso cada vez y midiendo sobre él, una aproximación no prevista
> acaba en: **2 acierto · 141 «casi» · 0 error ajeno · 14 «no te escuché»**
> (157 casos). Es decir: cuando la lista falla, O4 degrada a O1 —un «casi»—,
> nunca a atribuirle al niño un error que no cometió. **El suelo de O4 es O1 y su techo
> es su cobertura.** La estimación es pesimista a propósito: quita un proceso entero de
> golpe, y en la práctica la lista se escribiría viendo producciones reales.

> **O2 domina a O1**: no es peor en ninguna métrica y es mejor en alguna,
> así que O1 se puede descartar sin decidir nada clínico.

> **BASE y O2 no se dominan entre sí**, y ahí está la decisión de verdad: BASE conserva
> 116 aciertos sobre habla aproximada pero solo ve 10 de 35 contrastes; O2 ve los 35
> a cambio de bajar a 59. Eso es un intercambio clínico, no técnico.


> ✅ **La app implementa O2**: la fila «Vigente» —que llama al `matchPair` real—
> reproduce exactamente la fila O2. Lo que se decidió es lo que está corriendo.


**Y sobre las colisiones** (la aproximación es la palabra del distractor):

| Regla | → acierto | → «casi» | → error detectado | → «no te escuché» |
| --- | --- | --- | --- | --- |
| Antes de D7 · tolerancia de 1 letra | 15 | 0 | 2 | 0 |
| O1 · exactitud cuando hay distractor | 0 | 0 | 17 | 0 |
| O2 · vecino más cercano | 0 | 0 | 17 | 0 |
| O4 · exactitud + lista de aproximaciones | 0 | 0 | 17 | 0 |
| **Vigente en la app** (`matchPair` real) | 0 | 0 | 17 | 0 |

## 4. O3 · rediseñar los pares (no toca código)

Con la regla de hoy, un par solo distingue su distractor si ambas palabras se separan por
**dos o más letras**. Sobreviven **5 de 35**; habría que sustituir **30**:

- **Dominicano** (6): rana/lana, rata/lata, saco/taco, cubo/tubo, boca/bota, fuente/puente
- **Castellano** (12): rana/lana, rata/lata, cerro/cero, casa/caza, sierra/tierra, cubo/tubo, boca/bota, fuente/puente, gota/bota, foca/boca, miel/piel, pato/palo
- **Galego** (7): rúa/lúa, rei/lei, casa/caza, cesta/testa, cubo/tubo, boca/bota, fonte/ponte
- **Euskara** (5): su/zu, hotz/hots, hitz/hits, txalo/talo, karta/tarta

> **Esta salida tiene un problema de fondo.** Un par mínimo se define por diferir en UN
> fonema; exigir dos letras de diferencia ortográfica excluye contrastes perfectamente
> legítimos y muy usados en clínica (*cubo/tubo*, *boca/bota*, *miel/piel*). Lo que
> sobrevive lo hace por accidente de la ortografía —*perro/pelo* pasa porque «rr» se
> escribe con dos letras—, no por ser un contraste más fácil. Rediseñar el banco para
> contentar al matcher es adaptar la clínica a la herramienta.

## 5. Lo que costaría cada una

| Salida | Cambio | Coste |
| --- | --- | --- |
| O1 | Unas líneas en `matchPair` | Cero de contenido. Todo el coste es clínico: se pierde la tolerancia entera |
| O2 | Unas líneas en `matchPair` | Cero de contenido. Introduce la rama «ambiguo» |
| O3 | Sustituir 30 pares en 4 bancos | Alto y clínico: hay que reinventar contrastes, con pictogramas, consignas, misiones y locuciones nuevas |
| O4 | `matchPair` + un campo nuevo por par | ~157 entradas que hay que **escribir y validar** una a una, como ya se hizo con los 1619 `stt_expected_array` |

## 6. La decisión tomada, y lo que queda por confirmar

**D7 se cerró el 2026-08-04 con O2**, por decisión de Frank sobre estas cifras.
Los 35 contrastes se recuperan y ninguna aproximación se envía a la rama de error.
El precio aceptado: de 157 producciones aproximadas del objetivo, las que puntuaban
acierto pasan de 116 a 59, y 97 pasan a «casi» —una estrella y un reintento—.

Lo que sigue abierto, y que solo se puede cerrar con logopedas y con sesiones reales:

1. **¿Aguanta ese precio en sesión?** 97 «casi» de más es una estimación sobre habla
   aproximada generada, no observada. Hay que verlo con niños delante.
2. **Los empates.** Cuando lo oído queda igual de cerca de las dos palabras, la app
   dice «casi» y no se moja. ¿Es lo que quieren las logopedas, o prefieren que se
   incline hacia el distractor —más sensible al error— o hacia el objetivo —más amable—?
3. **Las 17 colisiones siguen sin solución posible** y no la tienen: son el límite
   del texto como evidencia. El adulto es el juez, y ahí no hay regla que ayude.
4. **O4 sigue disponible** si O2 se queda corto: ~157 aproximaciones escritas a mano
   recuperarían los aciertos perdidos. Es el patrón de los 1619 `stt_expected_array`.
5. Todo esto va junto con **D6** (cuántos «no te escuché» de más por sesión son
   tolerables): son la misma magnitud clínica mirada desde dos sitios.

---

_Generado por `node scripts/asr-d7-sim.js`. El inventario de procesos sale de datos_
_reales del repositorio; su aplicación a los pares mínimos es una extrapolación._
_La fila «Vigente» llama al `matchPair` real: si se desviara de O2, este informe lo diría._
