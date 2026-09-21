# Balance fonémico de los pares mínimos · Valeria+

> Generado por `node scripts/audit-pair-balance.js --markdown`. No editar a mano:
> los números salen de los bancos compilados, y se regeneran al cambiarlos.

## Cómo se mide

**D** es el número de rasgos distintivos que separan los dos fonemas del
contraste que el propio par declara en su campo `phoneme`:

- Consonantes: **punto**, **modo** y **sonoridad** → D ∈ 0..3.
- Vocales: **altura**, **anterioridad** y **redondeamiento** → D ∈ 0..3, en su
  propia escala. No se mezclan con las consonantes porque no comparten rasgos.
- Procesos fonológicos (omisión de final, reducción de grupo) no tienen
  distancia de rasgos y se cuentan aparte.

D=1 es la oposición **más exigente** para el niño (un solo rasgo que oír);
D=3 la más fácil. No se usa Levenshtein: mide parecido tipográfico, no acústico.

## Reparto por banco

| Banco | Pares | D=1 | D=2 | D=3 | Vocálicos | Procesos | Sin clasificar |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Castellano (`es`) | 15 | 9 | 5 | 1 | 0 | 0 | 0 |
| Dominicano (`es-DO`) | 8 | 6 | 2 | 0 | 0 | 0 | 0 |
| Galego (`gl`) | 13 | 9 | 2 | 0 | 2 | 0 | 0 |
| Euskara (`eu`) | 5 | 4 | 1 | 0 | 0 | 0 | 0 |
| Català (`ca`) | 12 | 8 | 3 | 0 | 1 | 0 | 0 |
| English (`en-US`) | 9 | 6 | 0 | 0 | 1 | 2 | 0 |
| **Total** | **62** | **42** | **13** | **1** | **4** | **2** | **0** |

## Pares, uno a uno

### Castellano (`es`)

| Código | Par | Contraste | D | Rasgos que difieren |
| --- | --- | --- | --- | --- |
| PM-1 | rana / lana | `r̄ → l` | 1 | modo |
| PM-2 | perro / pelo | `r̄ → l` | 1 | modo |
| PM-3 | rata / lata | `r̄ → l` | 1 | modo |
| PM-4 | cerro / cero | `r̄ → ɾ` | 1 | modo |
| PM-5 | casa / caza | `s → θ` | 1 | punto |
| PM-6 | sierra / tierra | `s → t` | 1 | modo |
| PM-7 | ocho / oso | `tʃ ↔ s` | 2 | punto+modo |
| PM-8 | cubo / tubo | `k → t` | 1 | punto |
| PM-9 | boca / bota | `k → t` | 1 | punto |
| PM-10 | fuente / puente | `f → p` | 2 | punto+modo |
| PM-11 | gota / bota | `g → b` | 1 | punto |
| PM-12 | beso / queso | `b → k` | 2 | punto+sonoridad |
| PM-13 | foca / boca | `f → b` | 3 | punto+modo+sonoridad |
| PM-14 | miel / piel | `m → p` | 2 | modo+sonoridad |
| PM-15 | pato / palo | `t → l` | 2 | modo+sonoridad |

### Dominicano (`es-DO`)

| Código | Par | Contraste | D | Rasgos que difieren |
| --- | --- | --- | --- | --- |
| PM-DO-1 | rana / lana | `r̄ → l` | 1 | modo |
| PM-DO-2 | rata / lata | `r̄ → l` | 1 | modo |
| PM-DO-3 | perro / pelo | `r̄ → l` | 1 | modo |
| PM-DO-4 | ocho / oso | `tʃ ↔ s` | 2 | punto+modo |
| PM-DO-5 | saco / taco | `s → t` | 1 | modo |
| PM-DO-6 | cubo / tubo | `k → t` | 1 | punto |
| PM-DO-7 | boca / bota | `k → t` | 1 | punto |
| PM-DO-8 | fuente / puente | `f → p` | 2 | punto+modo |

### Galego (`gl`)

| Código | Par | Contraste | D | Rasgos que difieren |
| --- | --- | --- | --- | --- |
| PM-GL-1 | rúa / lúa | `r̄ → l` | 1 | modo |
| PM-GL-2 | rei / lei | `r̄ → l` | 1 | modo |
| PM-GL-3 | casa / caza | `s → θ` | 1 | punto |
| PM-GL-4 | cesta / testa | `s → t` | 1 | modo |
| PM-GL-5 | cubo / tubo | `k → t` | 1 | punto |
| PM-GL-6 | boca / bota | `k → t` | 1 | punto |
| PM-GL-7 | fonte / ponte | `f → p` | 2 | punto+modo |
| PM-GL-8 | xeo / cheo | `ʃ → tʃ` | 1 | modo |
| PM-GL-9 | xoia / soia | `ʃ → s` | 1 | punto |
| PM-GL-10 | óso / oso | `ɔ → o` | 1 (vocálico) | altura+(tenso/laxo) |
| PM-GL-11 | bóla / bola | `ɔ → o` | 1 (vocálico) | altura+(tenso/laxo) |
| PM-GL-12 | palla / pala | `ʎ → l` | 1 | punto |
| PM-GL-13 | mel / pel | `m → p` | 2 | modo+sonoridad |

### Euskara (`eu`)

| Código | Par | Contraste | D | Rasgos que difieren |
| --- | --- | --- | --- | --- |
| PM-EU-1 | su / zu | `s̺ → s̻` | 1 | punto |
| PM-EU-2 | hotz / hots | `ts̻ → ts̺` | 1 | punto |
| PM-EU-3 | hitz / hits | `ts̻ → ts̺` | 1 | punto |
| PM-EU-4 | txalo / talo | `tʃ → t` | 2 | punto+modo |
| PM-EU-5 | karta / tarta | `k → t` | 1 | punto |

### Català (`ca`)

| Código | Par | Contraste | D | Rasgos que difieren |
| --- | --- | --- | --- | --- |
| PM-CA-1 | rosa / llosa | `r̄ → ʎ` | 2 | punto+modo |
| PM-CA-2 | serra / sella | `r̄ → ʎ` | 2 | punto+modo |
| PM-CA-3 | casa / caça | `z → s` | 1 | sonoridad |
| PM-CA-4 | rosa / rossa | `z → s` | 1 | sonoridad |
| PM-CA-5 | peix / pes | `ʃ → s` | 1 | punto |
| PM-CA-6 | joc / xoc | `ʒ → ʃ` | 1 | sonoridad |
| PM-CA-7 | os / ós | `ɔ → o` | 1 (vocálico) | altura+(tenso/laxo) |
| PM-CA-8 | palla / pala | `ʎ → l` | 1 | punto |
| PM-CA-9 | fill / fil | `ʎ → l` | 1 | punto |
| PM-CA-10 | coll / toll | `k → t` | 1 | punto |
| PM-CA-11 | font / pont | `f → p` | 2 | punto+modo |
| PM-CA-12 | llum / lluny | `m → ɲ` | 1 | punto |

### English (`en-US`)

| Código | Par | Contraste | D | Rasgos que difieren |
| --- | --- | --- | --- | --- |
| EN-PM-1 | rake / wake | `/r/ → /w/` | 1 | punto |
| EN-PM-2 | rock / lock | `/r/ → /l/` | 1 | modo |
| EN-PM-3 | key / tea | `/k/ → /t/` | 1 | punto |
| EN-PM-4 | peach / beach | `/p/ → /b/` | 1 | sonoridad |
| EN-PM-5 | ship / sip | `/ʃ/ → /s/` | 1 | punto |
| EN-PM-6 | snail / nail | `/sn-/ → /n-/` | — (proceso) | sn- / n- |
| EN-PM-7 | seat / sea | `/-t/ → ∅` | — (proceso) | -t / ∅ |
| EN-PM-8 | thin / fin | `/θ/ → /f/` | 1 | punto |
| EN-PM-9 | sheep / ship | `/i/ → /ɪ/` | 1 (vocálico) | altura+(tenso/laxo) |

## Qué NO dice este informe

- **No juzga el banco.** Un reparto desequilibrado puede ser la decisión
  clínica correcta para una patología concreta. Quien lo decide son las
  logopedas; esto solo pone el número delante.
- **No mide la confundibilidad real del reconocedor.** Eso es
  `scripts/asr-bench.js --audit-pairs` y `scripts/check-pair-discriminability.js`.
- **No cubre la variación dialectal.** Que /θ/ y /s/ se neutralicen en seseo
  no cambia la distancia de rasgos: cambia quién debe usar ese par, y eso
  vive en `region` y en `docs/guia-dialectal-*.md`.

