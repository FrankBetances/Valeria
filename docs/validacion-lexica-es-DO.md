# Validación léxica · español dominicano (es-DO) · Quisqueya Habla (QH-2.5)

> **Propósito.** Documentar, término por término, el léxico dominicano usado en
> el contenido es-DO y su respaldo en fuentes de autoridad, cumpliendo el
> criterio de aceptación de **QH-2.5**: *"contrastar el vocabulario elegido con
> CORPES/Diccionario del español dominicano y registrar las fuentes en los
> ficheros"*. Es complemento de la guía clínica **QH-0.2**
> (`docs/guia-dialectal-es-DO.md`), que fija la regla de oro *rasgo dialectal ≠
> error clínico*.

## Fuentes de autoridad

| Sigla | Fuente | Uso en esta validación |
| --- | --- | --- |
| **ACADOM** | *Diccionario del español dominicano* (Academia Dominicana de la Lengua) | Autoridad léxica: confirma que el término es dominicanismo lematizado y define su acepción. |
| **CORPES XXI** | Corpus del Español del Siglo XXI (RAE) | Frecuencia y naturalidad en el español americano/caribeño actual. |
| **Common Voice es** | Corpus de voz abierto (Mozilla) | Naturalidad y reconocibilidad por ASR con hablantes reales. |
| **Alba, O.** | Estudios de fonología y sociolingüística del español dominicano | Respaldo de los fenómenos fonéticos (elisión de /s/ y /d/, seseo). |

> **Método.** Cada término se marca según: (a) si está **lematizado en ACADOM**
> como dominicanismo o acepción dominicana; (b) su **registro** (general,
> coloquial, afectivo); (c) la **decisión** tomada en el contenido. Las cifras
> exactas de frecuencia de CORPES XXI las **firma la persona revisora** en la
> columna de verificación (no se inventan aquí): este documento fija QUÉ validar
> y con qué autoridad, y deja la rúbrica final al revisor, como pide QH-0.2.

## 1. Sustituciones léxicas (peninsular/estándar → dominicano)

| Estándar | es-DO | Categoría | ACADOM | Registro | Nota de decisión | ✔ Revisor |
| --- | --- | --- | --- | --- | --- | --- |
| autobús | **guagua** | sustantivo | Sí (dominicanismo antillano) | General | Palabra de uso universal en RD; "autobús" suena ajeno. | ☐ |
| tienda / colmado de barrio | **colmado** | sustantivo | Sí | General | Institución cotidiana; ancla el escenario de mandado. | ☐ |
| bolsa | **funda** | sustantivo | Sí | General | "bolsa" es minoritario en RD; "funda" es la forma viva. | ☐ |
| coche | **carro** | sustantivo | Sí (americanismo) | General | "coche" es peninsular; en RD siempre "carro". | ☐ |
| plátano (banana amarilla) | **guineo** | sustantivo | Sí | General | En RD "plátano" es el verde de freír; la banana amarilla (🍌) es "guineo". Corrige un falso amigo dialectal en SE-1 y SE-2. | ☐ |
| cometa | **chichigua** | sustantivo | Sí | General | Dominicanismo antillano (referido en la guía; disponible para contenido futuro). | ☐ |
| gorro | **gorra** | sustantivo | Sí (acepción) | General | La prenda de cabeza infantil habitual en RD es "gorra". | ☐ |
| encender (la luz) | **prender** | verbo | Sí (acepción americana) | General | "prender/apagar la luz" es la colocación viva en RD (cápsula CT-DO-6). | ☐ |
| niño pequeño | **muchachito** | sustantivo | Sí | Coloquial afectivo | Trato cariñoso con menores; alterna con "el niño". | ☐ |
| papá / mamá | **papi / mami** | sustantivo | Sí | Afectivo | Registro afectivo estándar con menores en RD. | ☐ |

## 2. Léxico dominicano incorporado (sin equivalente único peninsular)

| es-DO | Categoría | ACADOM | Dónde aparece | Nota | ✔ Revisor |
| --- | --- | --- | --- | --- | --- |
| **mangú** | sustantivo (comida) | Sí | Escenario "En la mañana" | Puré de plátano verde; desayuno típico. | ☐ |
| **concón** | sustantivo (comida) | Sí | Escenario "La comida" (acción/visual) | Arroz tostado del fondo de la olla. | ☐ |
| **habichuela** | sustantivo (comida) | Sí | Escenario "La comida" (consigna cuchara) | Alubia/frijol; "habichuela" es la forma antillana. | ☐ |
| **mabí** | sustantivo (bebida) | Sí | Reservado para contenido futuro | Bebida fermentada típica. | ☐ |
| **peso** | sustantivo (dinero) | Sí | Escenario "En el colmado" | Moneda nacional; ancla la acción de "comprar". | ☐ |

## 3. Onomatopeyas adaptadas al referente local

| es-DO | Referente | Nota | ✔ Revisor |
| --- | --- | --- | --- |
| **fon fon** | bocina de la guagua | Sustituye "brum" del coche por el claxon de la guagua. | ☐ |
| **kikirikí** | canto del gallo | El gallo es un referente sonoro cotidiano en RD. | ☐ |
| **chas chas** | ola del mar rompiendo | Escenario de playa. | ☐ |
| **cu cu** | canto de la lechuza | Sustituye "uh uh"; ave nocturna reconocible. | ☐ |
| **tilín** | campanita del colmado | Marca la entrada de clientes. | ☐ |

## 4. Fenómenos fonéticos aceptados por el emparejador (no son error)

Estos rasgos se toleran en el reconocimiento de voz mediante el **pliegue
dialectal simétrico** `foldDominican` (`src/valeriaVoice.ts`), que se aplica solo
en es-DO y colapsa objetivo y respuesta antes de comparar. Además, los
`stt_expected_array` listan realizaciones elididas representativas para
transparencia del revisor. Respaldo: Alba (fonología del español dominicano).

| Fenómeno | Ejemplo | Realización aceptada | Fuente |
| --- | --- | --- | --- |
| Aspiración/elisión de /s/ en coda | *gatos*, *más*, *escuela* | "gato", "má", "ecuela" | Alba; guía QH-0.2 §3 |
| Elisión de /d/ intervocálica | *helado*, *mojado*, *pescado* | "helao", "mojao", "pescao" | Alba; guía QH-0.2 §4 |
| Elisión de /d/ final | *usted*, *verdad* | "usté", "verdá" | Alba; guía QH-0.2 §4 |
| Seseo (no hay /θ/) | *casa* = *caza* | homófonas; ningún ítem las contrasta | guía QH-0.2 §1 |

## 5. Plural evaluado por determinante (MS-1)

Como la /s/ del plural se elide, el número **no** puede juzgarse por la ese final.
El ejercicio MS-1 en es-DO activa `evalPluralByDeterminer` y evalúa el
**determinante** concordado en género: *"muchos gatos"*, *"muchas flores"*,
*"muchos peces"*. Respaldo: guía QH-0.2 §4.3. Implementación:
`src/valeriaExerciseEsDO.ts` + `ValeriaExercisePlayerScreen` (fase `plural`).

## 6. Ficheros que consumen este documento

- `src/valeriaMinimalPairsEsDO.ts` — Pares Mínimos (QH-2.1).
- `src/valeriaSemanticExpansionEsDO.ts` — Expansión Semántica (QH-2.2).
- `src/valeriaExerciseEsDO.ts` — Audición y Lenguaje (QH-2.3).
- `src/valeriaLingContent.ts` — Test de Ling (QH-2.4).

## Checklist de firma (bloqueante antes del piloto)

- [ ] La persona revisora confirma cada término de las tablas §1–§3 contra ACADOM.
- [ ] Se anotan las frecuencias de CORPES XXI que el revisor considere necesarias.
- [ ] Se confirma que ningún ítem depende del contraste /s/–/θ/ ni de codas líquidas.
- [ ] Se confirma que los `stt_expected_array` aceptan la elisión de /s/ y /d/.
- [ ] Se confirma la evaluación del plural por determinante (MS-1).
- [ ] Firma del revisor y fecha: ________________________
