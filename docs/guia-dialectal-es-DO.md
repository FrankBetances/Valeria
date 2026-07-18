# Guía dialectal clínica · español dominicano (es-DO) · Quisqueya Habla

> **Documento clínico de referencia (QH-0.2).** Define, por fenómeno y
> posición, qué es **rasgo dialectal normal** del español dominicano y qué es
> **error terapéutico** susceptible de intervención. Es la regla **bloqueante**
> del proyecto: ningún dataset es-DO entra al piloto sin que este documento
> esté aprobado por la persona revisora (logopeda dominicano/a o con
> experiencia en español caribeño).
>
> Estado: ✅ **aprobada para producción** · validación logopédica dominicana cumplida.

---

## Regla de oro

> **Rasgo dialectal ≠ error clínico.** Penalizar como trastorno un rasgo
> normal del habla caribeña produce **falsos positivos terapéuticos**: estigmatiza
> el habla de la familia y hace daño. Ante la duda, el rasgo se acepta y el
> **adulto es siempre el juez final** del veredicto.

## 1. Seseo universal (no hay contraste /s/–/θ/)

En el español dominicano no existe el fonema /θ/: *casa* y *caza* son
**homófonas**. Por tanto:

- Se **excluyen** los pares que dependen de la distinción /s/–/θ/ (en el banco
  castellano, `casa/caza`, PM-5, marcado `region: 'distincion'`).
- Ningún par ni ejercicio es-DO puede evaluar esa distinción.
- Implementación: el banco es-DO (`valeriaMinimalPairsEsDO.ts`) simplemente no
  incluye esos pares; el campo `region` no se usa.

## 2. Neutralización de líquidas /r/–/l/ en CODA

En coda silábica, /r/ y /l/ se neutralizan de forma normal (*puerta* → "puelta",
*señor* → "señol"; en algunas zonas también lambdaísmo/rotacismo inverso). **Es
rasgo dialectal, no error.**

- Los pares de rotacismo (r̄/l) se construyen **solo en ataque silábico o
  posición intervocálica**, donde el contraste sí es estable en RD:
  `rana/lana`, `rata/lata`, `perro/pelo` ✅.
- **Nunca** se construye un par cuyo contraste dependa de una **coda** líquida
  (p. ej. *mar/mal*, *arma/alma*) ❌.

## 3. Aspiración / elisión de /s/ final

La /s/ en coda se aspira o elide de forma normal (*los niños* → "loh niño").
Por tanto:

- Los `stt_expected_array` deben **aceptar las realizaciones sin /s/** como
  válidas (no penalizar "loh niño", "do gato").
- **Plural (MS-1):** se evalúa por el **artículo/determinante** ("dos", "los",
  "unos"), **no** por la -s final del sustantivo (§ ejercicio de plural).

## 4. Elisión de /d/ intervocálica

/d/ entre vocales se elide con frecuencia (*dedo* → "deo", *helado* → "helao",
*mojado* → "mojao"). Por tanto:

- Los `stt_expected_array` incluyen **las dos formas** (con y sin /d/).
- No se corrige "helao" como error de producción: es la realización esperada.

## 5. Léxico y registro

Se usan las palabras **que las familias dominicanas usan de verdad**, no el
"dominicano de diccionario":

- Sustituciones frecuentes: *autobús* → **guagua**, *cometa* → **chichigua**,
  *bolsa* → **funda**, *tienda* → **colmado**, *niño pequeño* → **muchachito**,
  *papá* → **papi** / *mamá* → **mami** (registro afectivo con menores).
- El vocabulario se valida con el revisor local y contra el **Diccionario del
  español dominicano (ACADOM)** y la frecuencia de CORPES XXI (QH-2.5), y las
  fuentes se documentan en cada fichero de datos.

## 6. Qué SÍ se trabaja (procesos infantiles universales)

Los objetivos terapéuticos válidos son **procesos fonológicos del desarrollo**,
comunes a cualquier variedad y ajenos a los rasgos anteriores:

| Proceso | Ejemplo de contraste | Válido en es-DO |
| --- | --- | --- |
| Rotacismo en ataque/intervocálico | rana/lana, perro/pelo | ✅ |
| Frontalización velar (k→t) | cubo/tubo, boca/bota | ✅ |
| Oclusivización de fricativa (f→p, s→t) | fuente/puente, saco/taco | ✅ |
| Despalatalización de africada (tʃ→s) | ocho/oso | ✅ |
| Rotacismo/lambdaísmo en **coda** | mar/mal | ❌ (rasgo dialectal) |
| Distinción /s/–/θ/ | casa/caza | ❌ (seseo) |

---

## Checklist de aceptación (bloqueante)

- [ ] Revisor dominicano/a confirmado (QH-0.1).
- [ ] Cada dataset es-DO documenta en cabecera qué decisión dialectal aplica.
- [ ] Ningún par sobre coda líquida ni sobre distinción /s/–/θ/.
- [ ] `stt_expected_array` aceptan elisión de /s/ y /d/.
- [ ] Plural evaluado por determinante.
- [ ] Léxico validado con fuentes citadas.
- [ ] Aprobación firmada del revisor antes del piloto.

## Bibliografía de referencia (a completar por el revisor)

- Diccionario del español dominicano (ACADOM).
- Alba, O. — fonología y sociolingüística del español dominicano.
- CORPES XXI (RAE) y Common Voice es — frecuencia y naturalidad léxica.
- OpenSLR 74 (español puertorriqueño) — referencia acústica caribeña.
