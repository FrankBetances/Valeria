# Plan de integración · Inglés de Estados Unidos (`en-US`) → Valeria+

> **Documento de planificación y plan de trabajo.** Define cómo incorporar el
> **inglés estadounidense** a Valeria+ avanzando por **fases modulares e
> independientes**: cada fase deja la app compilando, publicable y con regresión
> cero en las cuatro variedades actuales (`es`, `gl`, `es-DO`, `eu`).
>
> Es el cuarto plan de idioma de la casa, después de
> [Proxecto Nós (gallego)](./plan-integracion-proxecto-nos.md),
> [Quisqueya Habla (dominicano)](./plan-integracion-quisqueya-habla.md) e
> [ILENIA/NEL-GAITU (euskera)](./plan-integracion-euskera.md), y **el primero
> que rompe el molde de los tres anteriores**: hasta ahora todas las variedades
> compartían familia lingüística iberorrománica (o convivían con ella) y, sobre
> todo, **compartían la interfaz en castellano**. El inglés no puede: una
> familia de Ohio no va a navegar una app cuyos botones dicen «Continuar».
>
> Estado: 🟢 **Fases 1, 2, 3 y 4 escritas · Fase 2 CERRADA** · La app se usa entera en inglés,
> con **contenido clínico inglés propio** y **voz neuronal Piper `en_US`
> empaquetada**. Queda la **Fase 5** (ASR), la **Fase 6** (cumplimiento y
> tiendas, requisito para publicar) y la **Fase 7** (QA y piloto).
>
> ✅ **La guía dialectal EN-0.5 está firmada (16 ago 2026).** Miguelina,
> profesora SLP con licencia de *Howard University* (EN-0.3), ha firmado
> [`guia-dialectal-en-US.md`](./guia-dialectal-en-US.md) y, con su equipo, ha
> validado la versión actual del dataset `en`. Los gates mecánicos (CMUdict,
> distractores, reglas de contenido, dificultad léxica, pictogramas) ya pasaban
> en verde; ahora la revisión clínica también cierra en verde. Queda lo que no
> depende de firmas: las Fases 5 (ASR), 6 (cumplimiento y tiendas) y 7 (QA y
> piloto).
>
> Decisiones cerradas: **revisión clínica confirmada** (EN-0.3), **separación de
> ejes UI/terapia** (§5.1), **guía dialectal como regla bloqueante** (EN-0.5),
> **licencia y voz Piper** (EN-0.1 / EN-0.2). Rama de trabajo:
> `claude/english-neural-voice-integration-758skt`

---

## Índice

- [1. Objetivo y alcance](#1-objetivo-y-alcance)
- [2. Qué cambia respecto a los planes anteriores](#2-qué-cambia-respecto-a-los-planes-anteriores)
- [3. Recursos a integrar](#3-recursos-a-integrar)
- [4. Principios de diseño](#4-principios-de-diseño)
- [5. Arquitectura objetivo](#5-arquitectura-objetivo)
- [6. Plan de trabajo por fases](#6-plan-de-trabajo-por-fases)
  - [Fase 0 · Preparación y decisiones](#fase-0--preparación-y-decisiones)
  - [Fase 1 · Infraestructura de variedad](#fase-1--infraestructura-de-variedad)
  - [Fase 2 · i18n de la interfaz](#fase-2--i18n-de-la-interfaz-el-eje-nuevo)
  - [Fase 3 · Contenido clínico en inglés](#fase-3--contenido-clínico-en-inglés)
  - [Fase 4 · Voz neuronal Piper en_US](#fase-4--voz-neuronal-piper-en_us)
  - [Fase 5 · ASR en-US](#fase-5--asr-en-us)
  - [Fase 6 · Cumplimiento y tiendas de EE. UU.](#fase-6--cumplimiento-y-tiendas-de-ee-uu)
  - [Fase 7 · QA, piloto y cierre](#fase-7--qa-piloto-y-cierre)
- [7. Roadmap resumido](#7-roadmap-resumido)
- [8. Riesgos y mitigaciones](#8-riesgos-y-mitigaciones)
- [9. Decisiones abiertas](#9-decisiones-abiertas-para-frank)
- [10. Seguimiento](#10-seguimiento)

---

## 1. Objetivo y alcance

Crear una **versión en inglés estadounidense de Valeria+** —contenido
terapéutico **e interfaz**— apoyada en la infraestructura de variedad que ya
está en producción, sin romper la experiencia castellana, gallega, dominicana ni
vasca, y sin renunciar al principio *offline-first*.

**Dentro del alcance**

- Alta de la variedad `en-US` en `src/valeriaLocale.ts` (banco de assets,
  locale BCP-47 `en-US`, selector de «Voz de la app» y refinamiento por
  paciente).
- **Internacionalización de la interfaz** (menús, botones, tarjetas, panel del
  adulto, notificaciones, informes exportados) con catálogo `es`/`en`. Es una
  fase propia porque hoy no existe **ninguna** infraestructura de i18n de UI:
  todas las cadenas están literales en los 27 `.tsx` de `src/`.
- Contenido terapéutico en inglés **diseñado ad hoc, no traducido**: banco de
  pares mínimos del inglés americano, expansión semántica, cápsulas TPR, rutas
  de rutina, frases portadoras, Audición, Lenguaje, TEA, Dislexia y Test de
  Ling.
- Locución con voz neuronal **Piper `en_US`** pre-generada en CI y empaquetada
  (mismo motor `piper` que ya usa Sharvard en castellano).
- Reconocimiento de voz `en-US`, la variedad **más favorable de todo el
  proyecto** para la promesa de reconocimiento local.
- **Guía dialectal `en-US`** (diferencia vs. trastorno) con la misma fuerza de
  regla bloqueante que tiene hoy [`guia-dialectal-es-DO.md`](./guia-dialectal-es-DO.md).
- Cumplimiento y publicación para el mercado estadounidense: COPPA, declaración
  de público objetivo en Play Console, categoría Kids de App Store, ficha de
  tienda en inglés, política de privacidad y página de eliminación de datos en
  inglés.

**Fuera del alcance (por ahora)**

- **Valeria Academy** (`src/ValeriaAcademy/academyContent.ts`, ~1.500 líneas de
  formación para profesionales): se queda en castellano en esta iteración y se
  aborda como fase propia cuando el resto esté cerrado. La pantalla debe
  ocultarse o marcarse «Spanish only» cuando la UI está en inglés (EN-2.7).
- Otras variedades del inglés (`en-GB`, `en-AU`, inglés caribeño). La
  arquitectura las deja preparadas —`en-US` entra ya con sufijo de región,
  igual que `es-DO`— pero no se implementan aquí.
- Bloque de **Realidad Aumentada** en inglés: depende del port nativo
  (`android-native/valeria-ar/`) y de su propio muro MDR; entra en el catálogo
  de UI (Fase 2) pero su contenido clínico se pospone.
- Traducción del manual de casos de uso y de los protocolos internos de `docs/`.

## 2. Qué cambia respecto a los planes anteriores

Los tres planes previos pudieron declarar «la UI sigue en castellano; solo el
contenido terapéutico cambia de lengua». Con el inglés esa frase deja de ser
sostenible, y de ahí salen las tres diferencias estructurales del plan:

| | Gallego / Euskera / Dominicano | **Inglés `en-US`** |
| --- | --- | --- |
| **Interfaz** | Castellano, sin tocar | **Debe traducirse entera** → fase nueva (Fase 2) |
| **Naturaleza del proyecto** | Nueva variedad clínica en el mismo mercado | **Nuevo mercado**: tiendas, legal y soporte propios (Fase 6) |
| **Distancia lingüística** | Fonología y morfosintaxis próximas o vecinas | Sistema vocálico ~14 vocales, grupos consonánticos, ortografía opaca → **rediseño clínico completo**, no adaptación |
| **Voz TTS** | Motor nuevo por idioma (coqui, AhoTTS) | Motor **ya implementado** (`piper`): la fase de voz es la más barata hasta la fecha |
| **ASR del sistema** | `gl-ES`/`eu-ES` rara vez tienen paquete local | `en-US` es **el locale mejor soportado** en Android e iOS: el reconocimiento local es aquí realista |
| **Riesgo dialectal** | Alto en `es-DO` (seseo, codas líquidas) | **Alto y con más carga**: inglés afroamericano (AAE), inglés sureño e inglés con influencia del español coexisten en el mismo mercado |

La consecuencia práctica: **la Fase 2 (i18n de UI) es la que decide el
calendario**, no la de contenido ni la de voz. Es también la única fase cuyo
beneficio va más allá del inglés: deja el proyecto listo para cualquier idioma
futuro de interfaz.

## 3. Recursos a integrar

| Recurso | Qué es | Uso en Valeria+ | Licencia |
| --- | --- | --- | --- |
| **Piper `en_US`** → ✅ **`en_US-ljspeech-high`** (`rhasspy/piper-voices`) | Voz VITS abierta en inglés americano, femenina | Pre-generar en CI el audio de todas las consignas inglesas y empaquetarlo como assets | **MIT** (modelo) sobre **LJSpeech**, grabaciones de LibriVox en **dominio público**. Auditoría completa en EN-0.1: `hfc_female` y `lessac`, las dos candidatas del plan original, **quedaron descartadas** |
| **ASR del sistema** (`expo-speech-recognition`, `en-US`) | Reconocimiento nativo Android/iOS | Juegos de micrófono; primera variedad donde `requiresOnDeviceRecognition` debería resolver en local de forma habitual | Plataforma |
| **CMUdict** (Carnegie Mellon Pronouncing Dictionary) | Diccionario fonético de ~134k palabras del inglés americano | Validar que cada par mínimo candidato **contrasta exactamente un fonema** y generar los `stt_expected` a partir de la transcripción real, no de la intuición | BSD-like (libre) |
| **SUBTLEX-US** / **Wordbank–CDI (MacArthur-Bates)** | Normas de frecuencia léxica y de edad de adquisición del inglés americano infantil | Ordenar el vocabulario por **familiaridad**, que es el criterio declarado del campo `difficulty` (ver [`criterio-dificultad-lexica.md`](./criterio-dificultad-lexica.md)) | Académica / CC |
| **Crowe & McLeod (2020)** y normas equivalentes de adquisición consonántica del inglés americano | Edades de adquisición por fonema | Secuenciar los objetivos del banco de pares mínimos por edad, no por parecido con el banco castellano | Publicación científica (se cita, no se copia) |
| **Common Voice `en`** | Corpus abierto de voz | Material de referencia y validación léxica | CC0 |

> ⚠️ **Lo que NO se puede usar.** Los ítems de las pruebas estandarizadas
> estadounidenses (GFTA-3, PPVT-5, CELF-5, KLPA-3…) están protegidos por
> copyright y su reproducción —aunque sea parcial o «inspirada»— es un riesgo
> legal real y un problema de validez clínica. El banco inglés se **diseña**,
> como se diseñaron el vasco y el dominicano. Las normas publicadas de
> adquisición fonética sí se pueden citar y usar como criterio.

## 4. Principios de diseño

1. **Offline-first se mantiene.** Nada de servidores en tiempo de sesión. Piper
   corre en CI (build-time), nunca en el dispositivo.
2. **El adulto sigue siendo el juez final.** Si el ASR no está disponible o
   falla, la pantalla oculta el juego de micrófono y el adulto valora con
   botones. Ninguna fase puede romper esta degradación.
3. **Traducir no es adaptar.** Es la regla de siempre, y en inglés aprieta más:
   un par mínimo castellano traducido produce material clínicamente inútil
   (*perro/cerro* → *dog/hill* no contrasta nada). El material clínico se
   rediseña desde la fonología del inglés americano.
4. **Diferencia dialectal ≠ trastorno.** ✅ *Aprobado como regla bloqueante.*
   Heredada de `es-DO` y ampliada: en el mercado estadounidense conviven el
   **inglés afroamericano** (AAE, también llamado AAVE, donde *mouth*→[maʊf],
   la reducción de grupos consonánticos finales y la pérdida de /r/
   postvocálica son rasgos regulares y reglados de la variedad, no errores), el
   inglés sureño y el inglés con influencia del español. Un banco que puntúe
   esos rasgos como fallo convierte la app en un instrumento de discriminación
   lingüística. **Ningún dataset `en` entra en `main` sin veredicto dialectal**
   (EN-0.5), y ese apartado lo firma la revisora clínica de EN-0.3.
5. **Modularidad real.** Cada fase termina con la app compilando, las cinco
   variedades funcionando y un entregable demostrable. El proyecto se puede
   pausar al final de cualquier fase.
6. **Fuente única por idioma.** El contenido vive en ficheros paralelos con la
   **misma interfaz TypeScript** (patrón `…Gl.ts` / `…Eu.ts`); las pantallas no
   saben en qué idioma trabajan, solo consumen lo que les inyecta la capa de
   variedad.
7. **Idioma de interfaz e idioma de terapia son ejes distintos.** ✅ *Aprobado.*
   Ver §5.1: es la decisión de arquitectura más importante del plan.

### 4.1 La fonología del inglés americano: por qué el banco se diseña de cero

El inglés abre contrastes que ninguna de las cuatro variedades actuales puede
ofrecer, y cierra otros que en castellano son el pan de cada día:

- **Grupos consonánticos** (`st-`, `sp-`, `sl-`, `sn-`, `tr-`, `-nd`, `-st`):
  inexistentes en posición inicial en castellano. La **reducción de grupos** es
  el proceso fonológico más frecuente del inglés infantil y no tiene banco
  equivalente en el resto del proyecto.
- **Sistema vocálico**: ~14 vocales frente a las 5 del castellano. El par
  tenso/laxo /i/–/ɪ/ (*sheep/ship*) y /æ/–/ɛ/ (*bat/bet*) son objetivos
  centrales, especialmente en la población hispanohablante de EE. UU.
- **Interdentales** /θ/ y /ð/, ausentes del castellano latinoamericano y del
  gallego, y su *fronting* a [f]/[d] (*thin→fin*, *they→day*).
- **Deslizamiento de líquidas** (*gliding*): /r/→[w] (*rake→wake*) y /l/→[w],
  el proceso más característico del habla infantil angloamericana.
- **/r/ rótica vocálica** (*bird*, *car*): un sonido que no existe en ninguna de
  las variedades actuales y que se adquiere tarde.
- **Consonante final**: el inglés la lleva constantemente, así que la **omisión
  de consonante final** (*boat→bow*) es un objetivo productivo. En dominicano
  es justo al revés: allí la elisión es rasgo dialectal normal.

Candidatos de pares mínimos (a validar contra CMUdict y a cerrar por la persona
revisora en EN-3.2):

| Par | Contraste | Proceso detectado |
| --- | --- | --- |
| **rake** 🍂 / **wake** ⏰ | /r/ vs /w/ | *Gliding* de /r/ |
| **lock** 🔒 / **rock** 🪨 | /l/ vs /r/ | Sustitución de líquidas |
| **thin** / **fin** 🐟 | /θ/ vs /f/ | *Fronting* interdental |
| **sip** / **ship** 🚢 | /s/ vs /ʃ/ | Palatalización / despalatalización |
| **key** 🔑 / **tea** 🍵 | /k/ vs /t/ | *Fronting* velar (universal infantil) |
| **pig** 🐷 / **big** | /p/ vs /b/ | Sonorización / ensordecimiento |
| **stop** 🛑 / **top** 🔝 | /st-/ vs /t-/ | **Reducción de grupo inicial** |
| **snail** 🐌 / **nail** | /sn-/ vs /n-/ | **Reducción de grupo inicial** |
| **boat** ⛵ / **bow** 🎀 | /-t/ vs ∅ | **Omisión de consonante final** |
| **sheep** 🐑 / **ship** 🚢 | /i/ vs /ɪ/ | **Contraste vocálico tenso/laxo** |

Se mantiene el **principio detector**: el error de sustitución habitual del niño
produce exactamente la otra palabra del par. Y se mantiene el hallazgo que
obligó a auditar los bancos existentes —**25 de 35 pares puntuaban como acierto
que el niño dijera el distractor**, §4.0 de
[`plan-asr-privacidad-y-motor-local.md`](./plan-asr-privacidad-y-motor-local.md)—:
el banco inglés no se da por cerrado hasta pasar `npm run asr:audit-pairs`
(EN-3.2).

### 4.2 Morfosintaxis y lectura: dos bloques que se rehacen, no se traducen

- **Bloque «Lenguaje».** El inglés no tiene género gramatical, pero sí
  alomorfía de plural (/s/ · /z/ · /ɪz/), plurales irregulares (*foot/feet*,
  *mouse/mice* — objetivo clásico de la logopedia angloamericana), pasado en
  `-ed` con tres realizaciones, tercera persona `-s`, artículos *a/an* regidos
  por el **sonido** siguiente (no por la letra) y pronombres sujeto
  obligatorios, que son un error de transferencia típico del hispanohablante.
  El campo `plural` del banco ya está parametrizado por variedad
  (`pluralOneLabelFor` / `pluralManyLabelFor` en `valeriaExerciseBank.ts`), así
  que la infraestructura aguanta; lo que cambia es el contenido.
- **Bloque «Dislexia».** El castellano es ortográficamente transparente y el
  bloque actual trabaja sílaba y velocidad. El inglés es opaco: el bloque
  inglés trabaja **familias de rimas** (*-at*, *-op*, *-ight*), dígrafos
  (`sh`, `ch`, `th`, `ck`), la *silent e* y la lectura de pseudopalabras. Es
  contenido nuevo con la misma interfaz, no una traducción.
- **Test de Ling.** Los seis sonidos (/a/ /u/ /i/ /ʃ/ /s/ /m/) son universales:
  aquí sí basta con reescribir las consignas.

## 5. Arquitectura objetivo

Convención: ◆ extender lo existente · ✚ crear nuevo.

```
src/
  valeriaLocale.ts              ◆ Locale += 'en-US'; ALL_LOCALES; isLocale;
                                   assetLang('en-US')='en'; speechLocale='en-US'
  valeriaUiLang.ts              ✚ EJE NUEVO: idioma de INTERFAZ ('es'|'en'),
                                   independiente de la variedad de terapia
  i18n/
    strings.es.ts               ✚ catálogo castellano (clave → cadena)
    strings.en.ts               ✚ catálogo inglés (mismas claves, tipadas)
    index.ts                    ✚ t(key, params) + useUiLang()
  valeriaVoiceCorpus.ts         ◆ VoiceLang += 'en'; buildVoiceCorpus() enumera
                                   el bloque inglés (espejo del bloque eu)
  valeriaCarrierPhrases.ts      ◆ CarrierLang += 'en'; BANKS.en (SVO, artículo
                                   a/an por sonido, verbos en pasado irregular)
  valeriaMinimalPairsEn.ts      ✚ banco de pares ad hoc (interfaz MinimalPair)
  valeriaContentEn.ts           ✚ TPR, rutas de rutina, bancos de refuerzo,
                                   frases fijas y builders (espejo de …Eu.ts)
  valeriaSemanticExpansionEn.ts ✚ escenarios, categorías, progresiones, cápsulas
  valeriaExerciseEn.ts          ✚ Audición · Lenguaje · TEA · Dislexia
  valeriaLingContent.ts         ◆ consignas del Test de Ling en inglés
  valeriaPairBanks.ts           ◆ pairsForLocale('en-US')
  valeriaSemanticBanks.ts       ◆ semanticForLocale('en-US')
  valeriaExerciseBank.ts        ◆ dbForLocale · variantsForLocale · emoForLocale
                                   · pluralOneLabelFor · pluralManyLabelFor
  valeriaNotifications.ts       ◆ avisos y los 20 consejos del adulto en inglés
  ValeriaCreditsScreen.tsx      ◆ atribución de la voz Piper en_US
assets/voice/…                  ✚ .m4a en inglés generados en CI (Piper)
voice-assets-manifest.en.json   ✚ manifiesto id→asset de la variedad en
scripts/
  generate-voice-assets.py      ◆ VOICES['en'] (engine 'piper', ya implementado)
  check-content-rules.js        ◆ de cuatro bancos a cinco
  check-lexical-difficulty.js   ◆ incluir categorías en
  check-pictogram-coverage.js   ◆ incluir cápsulas en
  check-voice-corpus-coverage.js ◆ incluir locuciones en
  check-ui-strings.js           ✚ gate: ninguna cadena visible fuera del catálogo
.github/workflows/voice-assets.yml ◆ matriz de idioma += en
app.json / plugins/             ◆ permisos de micrófono y cámara localizados
site/                           ◆ privacy.html alineada + data-deletion.html (EN)
```

### 5.1 Decisión de arquitectura: dos ejes, no uno ✅

> **Decidido (ago 2026).** Se implementa la separación de ejes descrita abajo.

Hoy `Locale` significa **variedad de terapia** y la UI es siempre castellana.
La tentación es hacer que `en-US` cambie las dos cosas a la vez. **No conviene**,
por una razón de mercado muy concreta: en EE. UU. una parte enorme de los
logopedas trabaja con **caseload bilingüe español-inglés**, y una familia
hispanohablante en Miami o en Los Ángeles puede querer la interfaz en español
mientras el niño trabaja objetivos en inglés (o al revés, cuando el objetivo es
mantener el español en casa).

Por eso:

```ts
// src/valeriaUiLang.ts (nuevo)
export type UiLang = 'es' | 'en';

// Defecto derivado de la variedad de terapia; el adulto puede desacoplarlo.
export const defaultUiLangFor = (loc: Locale): UiLang =>
  loc === 'en-US' ? 'en' : 'es';
```

- `Locale` sigue decidiendo **qué se locuta, se muestra y se evalúa**.
- `UiLang` decide **qué idioma leen los adultos** (menús, panel, informes,
  notificaciones).
- Por defecto, elegir la variedad `en-US` pone la UI en inglés; una preferencia
  explícita del adulto la desacopla y persiste en `AsyncStorage` con su propia
  clave.
- Los usuarios actuales no notan nada: sin variedad `en-US`, `UiLang` es `'es'`
  siempre.

Es un eje más y no una complicación gratuita: sin él, el bilingüismo —que es
justo el caso de uso más valioso del mercado estadounidense— quedaría fuera.

#### La frontera pasa POR DENTRO del ejercicio (ago 2026)

«`Locale` decide lo que se muestra» resultó ser demasiado grueso, y el fallo lo
encontró Frank usando la app: con la interfaz en inglés se entraba desde
*Vowel articulation* a un ejercicio titulado **«Articulación de vocales»** y se
puntuaba con la escala **EPT-3 en castellano**. La lista de bloques resolvía por
`UiLang` y el player resolvía todo por `Locale`; los dos ejes se contradecían
dentro de la misma pantalla.

Un ejercicio no tiene una audiencia, tiene dos:

| Va en la VARIEDAD de terapia | Va en el IDIOMA DE INTERFAZ |
| --- | --- |
| Todo lo que la app **locuta**: `read`, `move`, `phrase`, `tiles[].cap`, `choicePrompt`, `sentence`, `plural`, `scenes[].say`, `micTarget`, `phonemes` | Todo lo que **solo lee el adulto**: `ept`, `name`, `category`, `age`, `stageLabel`, `materials`, `instrHint`, `micPrompt`, `choiceLabel`, `proposals` |
| Todo lo que el **micrófono evalúa** | `levels[].label` y `levels[].instrHint` (el `read` del mismo objeto, no) |

El criterio es mecánico, no de opinión: **si el texto entra en
`linesForExercise`, va en la variedad.** Pedirle a la voz inglesa que lea
castellano es exactamente lo que evita `EN_THERAPY_CONTENT_READY`.

La lista vive en `ADULT_ONLY_FIELDS` (`valeriaExerciseBank.ts`) y la aplican
`dbFor(loc, uiLang)` y `variantsFor(loc, uiLang)`. Solo intervienen cuando los
dos ejes discrepan: con `gl`, `eu` o `es-DO` no tocan nada, porque ahí el adulto
lee la interfaz en castellano y el contenido en su lengua, que es lo que ya
hacían. `name`, `category` y `age` los manda `valeriaExerciseMeta`, que es de
donde tira también la lista de bloques: un solo sitio, no dos.

Lo guarda [`scripts/check-adult-fields.js`](../scripts/check-adult-fields.js),
que comprueba las tres cosas sobre el banco compilado: que ningún campo de
adulto se locuta, que los 37 ejercicios traen todos los suyos en inglés, y que
`dbFor` devuelve de verdad la escala EPT-3 en la lengua de la interfaz con la
consigna locutada en la de la variedad —en los dos sentidos.

**El Test de Ling es el caso extremo y va entero al idioma de la interfaz.**
Ahí la app no locuta nada: los seis sonidos los produce el adulto con su boca y
él mismo marca la respuesta —lo dice el propio aviso de la pantalla—, así que
no hay ni una cadena dirigida al niño. También la grafía: «uuu» y «ooo» cuan al
mismo fonema /u/, y cuál ayuda depende de en qué lengua lee el adulto. Lo
resuelve `lingContentFor(loc, uiLang)`.

Con una excepción, que es la que enseña dónde está de verdad la frontera: el
aviso de que en dominicano la /s/ en coda se aspira o se elide (guía QH-0.2 §3)
depende de la variedad del NIÑO, no de la lengua del adulto. Está escrito en
los dos idiomas y viaja con `es-DO` aunque la interfaz esté en inglés; sin eso,
una familia dominicana que pone la app en inglés perdía la advertencia clínica.

**Lo que sigue pendiente (ago 2026).** Expansión Semántica tiene el mismo
defecto y NO se ha arreglado aquí: con la interfaz en inglés y terapia
castellana, las tarjetas dicen «Rutina de mañana · Despertar, lavarse y
vestirse». No admite el mismo arreglo mecánico, porque el banco inglés no es
una traducción del castellano sino contenido propio con otros ids
(`manana-cama` frente a `en-morning-bed`) y otros objetivos léxicos. Hacen
falta ~65 rótulos ingleses escritos para los escenarios, categorías y
progresiones castellanas —5 escenarios, 5 categorías, 9 secuencias con 4 fases
cada una—, y es una decisión de producto antes que de código: si el niño
trabaja «Rutina de mañana», ¿el adulto anglófono navega «Morning routine» o el
nombre real del escenario que va a practicar? Pendiente de Frank.

## 6. Plan de trabajo por fases

Convención de tareas: `EN-<fase>.<n>`. Cada tarea indica **Entregable** y
**Criterio de aceptación (CA)**. Regla transversal en todas las fases:
**regresión cero en `es`, `gl`, `es-DO` y `eu`**.

---

### Fase 0 · Preparación y decisiones

*Objetivo: cerrar decisiones y dejar el terreno listo. Sin código de producto.*

| Tarea | Descripción | Entregable / CA |
| --- | --- | --- |
| **EN-0.1** ✅ | Auditar licencias de las voces Piper `en_US` candidatas y redactar la atribución. **Resultado: las dos candidatas que proponía este plan no sirven.** `en_US-hfc_female-medium` sale del dataset *Hi-Fi Captain* (NICT), **CC BY-NC-SA 4.0 → uso no comercial**; `en_US-lessac-medium` sale del *Blizzard Challenge 2013*, con licencia de investigación. Apta y elegida: **`en_US-ljspeech-high`** (modelo MIT sobre grabaciones de LibriVox en dominio público); alternativa también apta, `en_US-amy-medium` (MIT) | Atribución en `ValeriaCreditsScreen` ✅ · CA: licencia comercial confirmada ✅. **Era el riesgo de §8 y se materializó**: de haber sintetizado con la candidata propuesta, el banco inglés entero habría sido inutilizable |
| **EN-0.2** ✅⏳ | Elegir la voz escuchando muestras con consignas reales de la app. Elegida por defecto **`en_US-ljspeech-high`** —femenina, de lectura pausada, la homóloga natural de Sharvard— por ser la única candidata de calidad `high` con licencia comercial limpia. Para comparar sin tocar código: `python3 scripts/generate-voice-assets.py --lang en --voice en_US-amy-medium` | Decisión registrada aquí ✅ · **27 locuciones sintetizadas en CI y empaquetadas** (`voice-assets-manifest.en.json`) ✅; ⏳ **pendiente del visto bueno de Frank tras escucharlas** |
| **EN-0.3** ✅ | Confirmar persona revisora: **SLP con licencia en EE. UU.** para las Fases 3, 5 y 7 → **profesora SLP con licencia de *Howard University*** (asesoría confirmada, ago 2026) | CA: revisora confirmada ✅ · pendiente acordar el **flujo de revisión** (formato de entrega, tiempos y qué constituye «aprobado») antes de abrir la Fase 3 |
| **EN-0.4** | Verificar en dispositivos objetivo: voces TTS `en-US` del sistema, ASR `en-US` y —clave— disponibilidad real de **reconocimiento local** (`supportsOnDeviceRecognition`) | Tabla de soporte por plataforma en `docs/`; CA: sabemos si la promesa de audio-que-no-sale-del-móvil se sostiene en `en-US` |
| **EN-0.5** ✅ | Redactar [`docs/guia-dialectal-en-US.md`](./guia-dialectal-en-US.md): qué es rasgo dialectal normal (**AAE**, inglés sureño, inglés con influencia del español) y qué es objetivo terapéutico. **Regla bloqueante para todo dataset `en`.** Es la tarea de más riesgo del plan (§8) y la primera que se pone sobre la mesa de la revisora de EN-0.3 | Guía firmada por Miguelina (EN-0.3), 16 ago 2026; CA: cada par mínimo candidato lleva veredicto dialectal explícito ✅ |
| **EN-0.6** | Decidir el **modelo de publicación**: misma ficha de app con idiomas añadidos vs. ficha/listing separado para EE. UU.; y si `en-US` viaja en el mismo binario (impacto de tamaño, EN-4.4) | Decisión registrada; CA: elección con su justificación de coste/tamaño |
| **EN-0.7** | Fijar el alcance de i18n de UI: qué pantallas entran en la Fase 2 y en qué orden (propuesta en EN-2.3) | Lista ordenada de pantallas; CA: alcance cerrado y estimado |
| **EN-0.8** | **Hoja de revisión clínica**: script que exporta los datasets `en` a una tabla legible (Markdown/CSV) con columnas *ítem · objetivo fonológico · veredicto dialectal · aprobado/cambios*. Los bancos son TypeScript; nadie revisa clínica leyendo un `.ts`. *Se necesita a partir de la Fase 3, no antes: la primera vuelta de revisión es con la app en la mano* | `scripts/export-review-sheet.js`; CA: la revisora de EN-0.3 puede anotar y devolver el fichero sin tocar el repositorio |
| **EN-0.9** 🔴 | **Build de evaluación para la revisora** (Android APK firmado del CI) con la **interfaz en inglés y el contenido aún en castellano**, más el [protocolo de evaluación](./protocolo-evaluacion-clinica-en-US.md) que estructura su informe. **Bloquea la Fase 3**: su criterio vale más antes de escribir los bancos que después | APK + protocolo enviados; CA: la revisora completa el recorrido de las 16 pantallas y devuelve el informe en el formato acordado |

**Salida de fase:** decisiones cerradas; ningún cambio de comportamiento.

> **Sobre la revisión clínica (EN-0.3).** La asesoría corre a cargo de una
> **profesora SLP con licencia de Howard University**. Dos consecuencias
> prácticas para el plan:
>
> 1. **EN-0.5 deja de ser el punto ciego del proyecto.** El riesgo nº 1 (§8) era
>    que un banco escrito desde fuera penalizara rasgos del inglés
>    afroamericano como si fueran errores articulatorios. Howard es una HBCU y
>    el perfil encaja de lleno con esa cuestión, así que la guía dialectal se
>    escribe **con** la revisora desde el principio, no se le manda a validar
>    después. Conviene confirmarle explícitamente que asume ese apartado y con
>    qué marco de referencia lo aborda (p. ej. la distinción
>    *dialectal difference vs. disorder* de ASHA), y dejarlo escrito en la guía.
> 2. **Perfil académico ⇒ vía natural para el piloto.** Una profesora en
>    activo da acceso a supervisión clínica y, potencialmente, a estudiantes de
>    prácticas para EN-7.3. Merece la pena preguntarlo pronto: el piloto
>    estadounidense era el otro punto sin resolver del plan.
>
> Queda pendiente de EN-0.3 únicamente el **flujo de revisión**: en qué formato
> se le entrega el material (los bancos son ficheros TypeScript; para revisar
> hace falta una vista legible, tipo tabla exportada), qué plazos maneja y qué
> significa exactamente «aprobado» para poder cerrar una fase. Sin eso escrito,
> la Fase 3 se atasca en la primera entrega.

---

### Fase 1 · Infraestructura de variedad

*Objetivo: la app soporta `en-US` de extremo a extremo con contenido inglés aún
mínimo (placeholder). Es la fase más corta: la capa de variedad ya existe y solo
se extiende.*

| Tarea | Descripción | Entregable / CA |
| --- | --- | --- |
| **EN-1.1** | Extender `valeriaLocale.ts`: `Locale += 'en-US'`, `ALL_LOCALES`, `isLocale`, `assetLang('en-US')='en'`, `speechLocale('en-US')='en-US'`, `prefersLatinVoice` sin cambios | CA: la variedad se selecciona y persiste en `AsyncStorage` y en la ficha del paciente |
| **EN-1.2** | Extender `VoiceLang` en `valeriaVoiceCorpus.ts` a `'es'\|'gl'\|'eu'\|'en'`; el prefijo de id ya lo aplica `voiceCorpusId` a todo `lang ≠ es` | CA: `buildVoiceCorpus()` compila y acepta entradas `en` sin colisión de ids |
| **EN-1.3** ✅ | Añadir **«English (US)»** al selector «Voz de la app» (`ValeriaVoiceUI`), marcada `beta`, con su muestra de voz y **arrastrando el idioma de interfaz** (`syncUiLangToLocale`, §5.1) | CA: elegir la variedad pone la UI en inglés salvo que el adulto haya fijado el idioma a mano ✅ · «Probar la voz» suena con Piper `en_US` ✅. El **refinamiento por paciente** queda fuera: hoy no existe selector de variedad en la ficha en NINGUNA variedad, así que sería una función nueva, no la extensión de una |
| **EN-1.4** ✅⏳ | Crear los módulos `*En.ts` con contenido provisional mínimo. Hecho **solo la mitad no clínica**: `valeriaContentEn.ts` trae las frases de aplicación (refuerzo, veredictos, muestra, cierres, rotación de roles) y el corpus las hornea. El par mínimo y la cápsula TPR **no se escriben aquí**: son dataset `en` y los bloquea EN-0.5 | CA: `buildVoiceCorpus()` enumera 27 locuciones `en` ✅ · ⏳ el recorrido completo con contenido inglés depende de la Fase 3 |
| **EN-1.5** | Verificar que ninguna pantalla de terapia asume castellano: todo pasa por `pairsForLocale`, `semanticForLocale`, `dbForLocale`, `emoForLocale` | CA: recorrido completo en `en-US` sin caer a datos de otra variedad |

**Salida de fase:** app con cinco variedades funcional e inglés de muestra.
**Depende de:** Fase 0 (EN-0.4).

---

### Fase 2 · i18n de la interfaz (el eje nuevo)

*Objetivo: la app entera se puede leer en inglés. Es la fase más larga y la que
más valor deja para el futuro: cualquier idioma posterior la reutiliza.*

Estado de partida: **cero infraestructura**. Las cadenas están literales en 27
pantallas `.tsx` (~34.500 líneas en `src/`). Por eso la fase se ejecuta
**pantalla a pantalla**: cada PR migra una pantalla a `t()` y la app sigue
funcionando en castellano exactamente igual.

| Tarea | Descripción | Entregable / CA |
| --- | --- | --- |
| **EN-2.1** | Crear `src/valeriaUiLang.ts` (tipo `UiLang`, persistencia, `defaultUiLangFor`) y `src/i18n/` (`strings.es.ts`, `strings.en.ts`, `t()` con claves **tipadas**: una clave que falte en un catálogo debe romper el `typecheck`, no aparecer en blanco en pantalla) | CA: `npm run typecheck` falla si un catálogo pierde una clave |
| **EN-2.2** | Selector de **idioma de la interfaz** en ajustes, separado del selector de variedad, con la relación por defecto de §5.1 explicada al adulto | CA: se puede tener UI en español con terapia en inglés y al revés |
| **EN-2.3** | Migrar las pantallas al catálogo por **tramos**, en orden de recorrido del usuario. **1** Welcome · Credits · PatientSelect ✅ — **2** FichaRegistro · ExerciseSelection · Auth ✅ — **3** ExercisePlayer · MinimalPairs · SemanticExpansion · LingTest ✅ — **4** AdultChaosPanel · PatientResultsDashboard · ProExport · modales (SUS, PragmaticBreak, SessionBreak, ProPin, TPRCapsule) ✅ — **5** notificaciones y permisos ✅ | Una PR por tramo; CA por pantalla: idéntica en castellano, íntegra en inglés. **La build de EN-0.9 sale al cerrar el tramo 4** |
| **EN-2.4** ✅ | Localizar **notificaciones**: los 12 avisos rotatorios y los 5 consejos largos del adulto (`valeriaNotifications.ts`), más el nombre visible del canal Android. Los avisos se **reprograman** al cambiar de idioma: se encolan con el texto dentro, así que sin eso seguirían llegando días en el idioma anterior | CA: `check-reminder-slots.js` pasa con los dos catálogos ✅ |
| **EN-2.5** ✅ | Localizar los **permisos del sistema**. Hallazgo al implementarlo: **Android no lo necesita** —el diálogo de permiso runtime lo redacta el sistema y ya viene traducido—, así que el trabajo es solo de iOS. `plugins/withValeriaPermissionStrings.js` declara `CFBundleLocalizations` y escribe `{es,en}.lproj/InfoPlist.strings` con las tres claves de uso (micrófono, reconocimiento de voz, cámara) | CA: en un dispositivo iOS en inglés, el diálogo sale en inglés. **Probado el plugin en aislado** (escribe los dos .lproj con formato válido); ⏳ pendiente de verificar en un `expo prebuild -p ios` real |
| **EN-2.6** ✅ | Localizar el **informe exportado** (`ValeriaProExport`) y las etiquetas del panel de resultados: es lo que el clínico enseña a la familia | CA: informe generado íntegramente en inglés ✅ (texto compartido y panel completos) |
| **EN-2.7** ✅ | Decidir y aplicar el tratamiento de **Valeria Academy** con UI en inglés. **Resuelto por la vía contraria a la prevista**: en lugar de ocultarla o marcarla «Spanish only», Academy se tradujo entera (`academyContent.en.ts`, 1.381 líneas) | CA: no hay pantallas medio traducidas visibles ✅ (Academy recorrida con la UI en inglés, captura propia) |
| **EN-2.8** ✅ | Gate `scripts/check-ui-strings.js`: falla si aparece una cadena visible literal en un `.tsx` ya migrado. Sin gate, la UI se «des-traduce» sola en tres PRs. Lee el AST de TypeScript, no expresiones regulares: hijos de texto JSX, props visibles (`accessibilityLabel`, `placeholder`, `label`, `hint`, `prompt`…), plantillas, concatenaciones, ternarios y `Alert.alert`. Exención por línea con `// i18n-exempt: motivo` | CA: corre en CI ✅ y detecta una regresión metida a propósito ✅ (una cadena literal en `ValeriaWelcomeScreen`: el gate falla, el typecheck pasa) |

**Salida de fase:** app completamente usable en inglés (con contenido
terapéutico todavía castellano si se para aquí) → **es exactamente la build de
evaluación de EN-0.9**.
**Depende de:** Fase 1 (solo de EN-1.1).

> **Reordenación (ago 2026).** Esta fase deja de poder paralelizarse con la
> Fase 3 y pasa a **precederla**: la revisora clínica evalúa con la app en la
> mano, no con hojas de datos, y la versión acordada es «UI en inglés, contenido
> en castellano». Sin los tramos 1–4 de EN-2.3 no hay build que enviarle, así
> que la i18n es ahora el **camino crítico** del proyecto entero.
>
> **Estado:** ✅ EN-2.1 · EN-2.2 · EN-2.3 (**los 5 tramos cerrados**) · EN-2.4 ·
> EN-2.5 · EN-2.6. La app se usa entera en inglés, notificaciones y permisos
> incluidos. **Fase 2 cerrada:** EN-2.7 (Academy traducida entera) y EN-2.8
> (gate `check-ui-strings.js`) también. **EN-0.9 listo para generarse.**
>
> **Lo que el gate encontró al estrenarse (ago 2026): 88 cadenas visibles
> todavía en castellano**, en once ficheros, con la Fase 2 dada por cerrada.
> No eran restos menores: `ValeriaManualNoiseSlider` estaba entero en
> castellano (el mismo patrón exacto que `ValeriaVoiceUI`), y con él los cuatro
> umbrales clínicos de AR del panel del adulto, veintiséis cadenas del
> reproductor de ejercicios y los rótulos de los esquemas de hardware de
> Academy. Todas compilaban y todas pasaban el typecheck. Es la medida de
> cuánto se le escapa al repaso a ojo.
>
> **Tramo 6 (ago 2026), no previsto en la lista original.** Los cinco tramos
> iban por PANTALLAS, y `ValeriaVoiceUI.tsx` no es una pantalla: es el fichero
> de componentes compartidos (botón de escucha, mapa del turno, juego de
> micrófono, registro de respuesta, tarjeta «Voz de la app» y bloque de
> privacidad del micrófono) que se incrusta dentro de pantallas ya migradas.
> Se quedó fuera de los cinco tramos y dejaba la mitad del hub de ejercicios en
> castellano con la UI en inglés — justo el defecto que EN-2.8 existe para
> impedir. Migrado ahora junto con EN-1.3, que vive en el mismo fichero. **Es la
> evidencia de que el gate `check-ui-strings.js` hace falta**: el repaso a ojo
> ya se dejó un fichero de 750 líneas.

---

### Fase 3 · Contenido clínico en inglés

*Objetivo: todo el contenido terapéutico existe en inglés, diseñado y revisado.
Se subdivide por bloque para poder publicar por partes.*

| Tarea | Descripción | Entregable / CA |
| --- | --- | --- |
| **EN-3.1** ✅ | Utilidad de validación fonética contra **CMUdict**. Hace cuatro cosas más de las previstas, todas por algo que apareció al escribirla: rechaza palabras con **más de una pronunciación** (`bow` = /boʊ/ o /baʊ/ — el par `boat/bow` que proponía este plan es inválido por eso), comprueba que la etiqueta `phoneme` **dice la verdad**, exige el veredicto dialectal y **bloquea los tres contrastes prohibidos** por EN-0.5 | `scripts/check-minimal-pairs-en.js` + `scripts/data/cmudict-en.json` (subconjunto commiteado: el gate corre en el build de Android, que no tiene Python ni red); CA: probado con tres pares falsos, los caza los tres ✅ |
| **EN-3.2** ✅ | **Banco de pares mínimos**: **9 pares**, cada uno con veredicto dialectal. No son los 10 del borrador de §4.1: `boat/bow` cae por ambigüedad de CMUdict y **la /r/ vocálica queda prohibida** por EN-0.5, así que se sustituyen por `seat/sea` y `peach/beach`. Siete son `developmental`; `thin/fin` es `dialect-sensitive` (AAE) y `sheep/ship` es `transfer` (bilingüe), y en esos dos **la pantalla avisa al adulto antes de puntuar** | `valeriaMinimalPairsEn.ts` ✅; CA: `npm run asr:audit-pairs` → 0 de 9 premian al distractor ✅ · validado por Miguelina (EN-0.3), 16 ago 2026 ✅ |
| **EN-3.3** | **Frases portadoras**: `BANKS.en` en `valeriaCarrierPhrases.ts` (SVO, artículo *a/an* elegido por **sonido** inicial, pasados irregulares, elicitación natural: *"Now you say it"*) | CA: `enumerateAllCarrierPrompts('en')` produce frases gramaticales revisadas |
| **EN-3.4** ✅ | **TPR, rutas de rutina y bancos de refuerzo** (`valeriaContentEn.ts`): 5 cápsulas, 2 rutas y los cuatro bancos de refuerzo. Registro de app infantil estadounidense: *grown-up*, no *parent* ni *tutor* | CA: validado por Miguelina (EN-0.3), 16 ago 2026 ✅ |
| **EN-3.5** ✅ | **Expansión semántica**: 3 escenarios, 5 categorías ordenadas por SUBTLEX-US/CDI, 2 progresiones y 4 cápsulas. Los pictogramas **se reutilizan tal cual**: son dibujos sin texto, así que no hubo que redibujar nada. Los `stt_expected` admiten las realizaciones dialectales como acierto, que es la guía EN-0.5 aplicada al reconocedor | CA: `check-content-rules.js`, `check-lexical-difficulty.js` y `check-pictogram-coverage.js` verdes sobre el banco `en` ✅ · validado por Miguelina (EN-0.3), 16 ago 2026 ✅ |
| **EN-3.6** ✅ | **Audición, Lenguaje, TEA y Dislexia** (`valeriaExerciseEn.ts`, 37 ejercicios). Dos rediseños, no traducciones: **ms2 deja de ser flexión de género** —el inglés no tiene— y pasa a **plurales irregulares** (`foot/feet`); y **Dislexia entero** cambia de sílaba/velocidad a rima, dígrafo, *silent e* y pseudopalabras. El plural regular se trabaja como PRODUCCIÓN y nunca como juicio de gramaticalidad: la variabilidad de la `-s` es rasgo regular del AAE (guía §4.9) | CA: player localizado ✅ (emociones, plural, cierre) · validado por Miguelina (EN-0.3), 16 ago 2026 ✅ |
| **EN-3.7** ✅ | **Test de Ling** en inglés: consignas y pistas. Es el **único bloque del plan que de verdad se traduce**, porque los seis sonidos miden audibilidad por frecuencia y no varían con la lengua | CA: validado por Miguelina (EN-0.3), 16 ago 2026 ✅ |
| **EN-3.8** ✅ | Cablear el bloque inglés en `buildVoiceCorpus()` (espejo exacto del bloque `eu`) y **bajar el interruptor** `EN_THERAPY_CONTENT_READY` a `true`, con lo que la variedad deja de locutar castellano y pasa a comportarse como cualquier otra | CA: `voice-corpus.json` incluye **614 locuciones `en`** ✅; `check-voice-corpus-coverage.js` exige las 614 |

**Salida de fase:** app completa en inglés locutada por el TTS del sistema.
**Depende de:** Fase 1. EN-3.2 depende de EN-0.5 y EN-3.1.

---

### Fase 4 · Voz neuronal Piper en_US

*Objetivo: el inglés suena con voz neuronal empaquetada, sin servidor. La fase
más barata de todas las de voz: el motor `piper` ya está implementado para
Sharvard, así que es configuración y CI, no ingeniería nueva.*

| Tarea | Descripción | Entregable / CA |
| --- | --- | --- |
| **EN-4.1** ✅ | Añadir `VOICES['en']` en `scripts/generate-voice-assets.py` (engine `piper`, voz de EN-0.2). Las URLs ya no se copian a mano: `piper_urls(nombre)` las deriva de la ruta regular de `rhasspy/piper-voices`, y de ahí sale gratis el `--voice` de EN-0.2 | CA: `python3 scripts/generate-voice-assets.py --lang en` sintetiza de forma incremental y escribe `assets/voice/*.m4a` + `voice-assets-manifest.en.json` ✅ (las URLs `es` salen idénticas a las anteriores: sin resíntesis de Sharvard) |
| **EN-4.2** ✅ | Extender `.github/workflows/voice-assets.yml` con el paso `en`. No necesita instalar nada: `piper-tts` ya está para Sharvard, y el script sale sin descargar el modelo cuando el idioma está al día. `scripts/check-voice-corpus-coverage.js` pasa a cubrir `en`, pero **solo desde que el banco tiene su primer asset**: exigirlo antes dejaría el build de la rama en rojo sin salida (el `workflow_run` que lo relanza solo actúa desde la rama por defecto) | CA: un push que cambie el corpus `en` regenera **solo** los assets `en` afectados |
| **EN-4.3** ⏳ | Verificar la integración runtime: `valeriaVoicePlayback` + `valeriaVoice` resuelven el asset `en` por id; orden audio empaquetado → voz del sistema `en-US` → nada de salto a otra variedad. **Camino cableado y probado en la muestra de voz** (`speakVoiceSample` resuelve el asset `en_*` y, sin él, cae a `en-US` del sistema sin arrastrar la voz española cacheada). La sesión completa depende de la Fase 3 | CA: sesión completa en inglés con voz Piper ⏳; sin asset, degrada sin silencio y sin acento cruzado ✅ |
| **EN-4.4** ⏳ | Medir el impacto en tamaño y decidir según EN-0.6 si todo viaja en el mismo binario o se descarga bajo demanda. **Medida final con el banco completo (ago 2026): 614 locuciones · 30,9 min · 10,24 MB**, sintetizadas en 13 min de CI. Cae exactamente en la referencia de ~10 MB por variedad que manejaba este plan, así que **no hace falta descarga bajo demanda**: el inglés viaja en el mismo binario como las demás | Nota de tamaño en este documento ✅; ⏳ CA: confirmar el peso final del AAB en una build EAS |
| **EN-4.5** ✅ | Añadir los créditos de la voz Piper `en_US` a `ValeriaCreditsScreen` junto a Sharvard, Celtia y HiTZ | CA: atribución visible en la app ✅ (en los dos catálogos, con la mención al dominio público de LibriVox) |

**Salida de fase:** experiencia inglesa con voz neuronal, offline.
**Depende de:** Fase 3 (necesita las cadenas finales y EN-3.8).

---

### Fase 5 · ASR en-US

*Objetivo: los juegos de micrófono funcionan en inglés con la degradación
elegante de siempre. Es la variedad con mejor pronóstico del proyecto.*

| Tarea | Descripción | Entregable / CA |
| --- | --- | --- |
| **EN-5.1** | Pasar `en-US` al reconocedor del sistema pidiendo **reconocimiento local** (`requiresOnDeviceRecognition`), y comprobar con telemetría (`trackAsrMode`) qué modo toca de verdad | CA: en dispositivos de la tabla EN-0.4, el modo local es el habitual; el dato queda registrado, no supuesto |
| **EN-5.2** | Ajustar los `stt_expected` ingleses en dispositivo real. Aviso concreto: el modelo de lenguaje inglés del reconocedor es **agresivo** y «corrige» hacia palabras frecuentes, así que hay que listar las confusiones reales observadas, no las teóricas | CA: tasa de captura medida y registrada en `docs/`, con hablante infantil real |
| **EN-5.3** | Revisar la **normalización/pliegue** para el inglés (hoy hay `foldBasque` para la ⟨h⟩ muda): homófonos (*wake/wake*, *ate/eight*), contracciones y plurales que el reconocedor devuelve inflados | CA: `check-asr-listen-options.js` y `check-asr-capture-guard.js` verdes con la variedad `en` |
| **EN-5.4** | Verificar la degradación: sin permiso, sin paquete de idioma o con error, la pantalla oculta el juego de micrófono y el adulto puntúa con botones | CA: los tres caminos de fallo probados en dispositivo |

**Salida de fase:** micrófono en inglés operativo.
**Depende de:** Fase 3 (los `stt_expected` finales); independiente de la Fase 4.

---

### Fase 6 · Cumplimiento y tiendas de EE. UU.

*Objetivo: poder publicar legalmente en EE. UU. una app dirigida a menores. Esta
fase no es opcional ni se puede dejar para el final del final: sus decisiones
condicionan qué datos puede recoger la app.*

| Tarea | Descripción | Entregable / CA |
| --- | --- | --- |
| **EN-6.1** | Análisis **COPPA**: qué datos personales de menores de 13 años toca la app (cuenta Firebase, ficha del paciente, telemetría, audio del turno de habla) y qué exige de consentimiento parental verificable. Cruzar con que el ASR local (EN-5.1) mantiene el audio en el dispositivo | Informe de cumplimiento en `docs/`; CA: lista cerrada de datos y base legal de cada uno |
| **EN-6.2** | Declaración de **público objetivo y contenido** en Play Console (programa *Designed for Families* si procede) y revisión de la **Kids Category** de App Store, que restringe analítica y terceros | CA: formularios cumplimentados de forma coherente con EN-6.1 |
| **EN-6.3** | Actualizar el formulario de **Seguridad de los datos** de Play Console **y** la política de `site/` en el mismo cambio —Google contrasta ambas declaraciones entre sí (regla de `CLAUDE.md`)—, alineando `site/privacy.html` (ya existe en inglés) con lo que la app hace de verdad | CA: ambas declaraciones coinciden ítem por ítem |
| **EN-6.4** | Crear la **página de eliminación de datos en inglés** (hoy solo existe `eliminacion-de-datos.html` en castellano) y enlazarla desde `site/index.html` y el `sitemap.xml`. Correo de contacto: el fijo del proyecto, sin excepción | `site/data-deletion.html`; CA: URL publicada por GitHub Pages y declarada en Play Console |
| **EN-6.5** | **Ficha de tienda en inglés** (título, descripción corta y larga, capturas con UI inglesa, texto promocional) para Google Play y App Store | CA: listing `en-US` completo y coherente con la app real |
| **EN-6.6** | Revisar el **encuadre regulatorio** de las afirmaciones en EE. UU.: la app se posiciona como herramienta educativa y de apoyo a la terapia, no como dispositivo médico. Contrastar el lenguaje del listing y de la app con ese encuadre (en la UE el proyecto ya trabaja con el muro MDR del bloque AR) | CA: revisión de textos hecha; afirmaciones clínicas acotadas por escrito |

**Salida de fase:** app publicable en EE. UU.
**Depende de:** Fase 2 (capturas y textos en inglés). EN-6.1 conviene arrancarlo
en paralelo desde la Fase 0: puede cambiar decisiones de producto.

---

### Fase 7 · QA, piloto y cierre

| Tarea | Descripción | Entregable / CA |
| --- | --- | --- |
| **EN-7.1** | Pasada QA multivariedad: matriz pantalla × variedad (`es`/`gl`/`es-DO`/`eu`/`en-US`) × idioma de UI (`es`/`en`) × plataforma (Android, iOS, Expo Go, web), incluidas las degradaciones sin micrófono y sin assets | Checklist QA en `docs/`; CA: sin regresiones en las cuatro variedades previas |
| **EN-7.2** | Telemetría: etiquetar sesiones con la variedad `en-US` **y** con el idioma de UI, para poder leer el bilingüismo en el panel | CA: el dashboard distingue `en-US` y el eje de UI |
| **EN-7.3** | Mini-piloto con 2–3 familias angloparlantes y la revisora SLP de EN-0.3; SUS (`ValeriaSUSModal`) en inglés. Explorar con ella la vía **universitaria** (supervisión clínica y estudiantes en prácticas), que da una muestra mejor que el boca a boca | Informe de piloto; CA: feedback triado en tareas |
| **EN-7.4** | Revisión de **calidad de la traducción de UI** por hablante nativo: no basta con que sea correcta, tiene que sonar a app estadounidense (*caregiver* y no *tutor*, *speech-language pathologist* y no *speech therapist* en contexto clínico) | CA: pasada nativa aplicada |
| **EN-7.5** | Actualizar README (tabla de idiomas y variedades, badges), protocolos e historial de versiones | CA: documentación al día |

**Depende de:** Fases 4, 5 y 6.

## 7. Roadmap resumido

```mermaid
graph LR
  F0[Fase 0<br/>Preparación] --> F1[Fase 1<br/>Infra variedad en-US]
  F1 --> F2[Fase 2<br/>i18n de la UI]
  F2 --> EV{{EN-0.9<br/>Build de evaluación<br/>UI inglés · contenido español}}
  EV --> INF[/Informe de la<br/>revisora clínica/]
  INF --> F3[Fase 3<br/>Contenido clínico]
  F3 --> F4[Fase 4<br/>Voz Piper en_US]
  F3 --> F5[Fase 5<br/>ASR en-US]
  F2 --> F6[Fase 6<br/>Cumplimiento y tiendas]
  F4 --> F7[Fase 7<br/>QA + piloto]
  F5 --> F7
  F6 --> F7
```

La Fase 2 ya no corre en paralelo a la Fase 3: **es su requisito**. El informe
de la revisora se recoge con la app en la mano y antes de escribir los bancos
ingleses, que es donde su criterio ahorra más retrabajo.

| Fase | Recurso protagonista | Tamaño relativo | Publicable al terminar |
| --- | --- | --- | --- |
| 0 · Preparación | — (licencias, decisiones, guía dialectal) | S | Sí (sin cambios) |
| 1 · Infra variedad | — (extiende la capa existente) | S | Sí |
| 2 · **i18n de UI** | Catálogo `es`/`en` + gate | **XL** (27 pantallas) | Sí, tramo a tramo · **camino crítico** |
| — · Evaluación clínica | Build Android + protocolo (EN-0.9) | S | — (puerta de entrada a la Fase 3) |
| 3 · Contenido clínico | CMUdict · SUBTLEX-US · CDI | L (por bloques) | Sí, bloque a bloque |
| 4 · Voz | **Piper `en_US`** (motor ya existente) | S–M | Sí |
| 5 · Micrófono | ASR del sistema `en-US` | M | Sí |
| 6 · Cumplimiento | COPPA · Play/App Store · `site/` | M | **Requisito para publicar** |
| 7 · QA/piloto | — | M | Sí (cierre) |

Las Fases 2 y 3 son independientes entre sí: se pueden llevar en paralelo, y ese
es el camino más corto al lanzamiento.

## 8. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| El banco inglés penaliza rasgos del **inglés afroamericano (AAE)** o del inglés sureño como si fueran errores | **Muy alto** (clínico y reputacional: convierte la app en un instrumento de discriminación lingüística) | Guía dialectal bloqueante (EN-0.5) **coescrita** con la revisora de EN-0.3 —profesora SLP de Howard, perfil que ataca este riesgo de frente—, veredicto dialectal por par y posibilidad de marcar el par con `region` cuando dependa de variedad, patrón que ya existe. **Sigue siendo el riesgo nº 1**: tener a la persona adecuada lo reduce, no lo elimina |
| La Fase 2 (i18n) se desborda y bloquea todo lo demás | Alto (calendario) | Migración **pantalla a pantalla**, cada PR publicable; gate `check-ui-strings.js` para que no retroceda; la Fase 3 avanza en paralelo |
| Traducir la UI a medias: pantallas mezcladas español/inglés | Alto (percepción de calidad) | El gate + la regla de EN-2.7: una pantalla no se marca migrada hasta que **ninguna** cadena visible queda fuera del catálogo |
| Traducción literal del contenido clínico (pares que no contrastan nada) | Alto | Regla dura: el banco se diseña; validación mecánica con CMUdict (EN-3.1) + revisión SLP (EN-3.2) |
| Copiar ítems de pruebas estandarizadas estadounidenses (GFTA, PPVT…) | Alto (legal) | Prohibido explícitamente en §3; se usan normas publicadas de adquisición, no ítems de test |
| El ASR falla con habla infantil inglesa y el reconocedor «corrige» hacia palabras frecuentes | Medio-alto | El adulto sigue siendo juez final; `stt_expected` ajustados en dispositivo real (EN-5.2); auditoría `asr:audit-pairs` para que el distractor nunca puntúe como acierto |
| Tamaño de la app con cinco bancos de audio | Medio | Hash por contenido (regenera solo lo cambiado), AAC a 40 kbps, y decisión de empaquetado en EN-0.6 / EN-4.4 (binario único vs. descarga bajo demanda) |
| **COPPA** obliga a cambiar lo que la app recoge de menores | Medio-alto (producto) | Arrancar EN-6.1 desde la Fase 0, no al final: si obliga a recortar telemetría o cuentas, mejor saberlo antes de construir |
| ~~Licencia de la voz Piper elegida resulta no ser apta para uso comercial~~ **MATERIALIZADO Y RESUELTO** | Medio | Ocurrió: las **dos** candidatas del plan eran inservibles (`hfc_female` CC BY-NC-SA, `lessac` licencia Blizzard). EN-0.1 lo cazó antes de sintetizar nada y la variedad entró con `ljspeech` (MIT + dominio público). Lección para la próxima lengua: auditar la `MODEL_CARD` **antes** de escribirla en el plan, no después |
| Soporte y atención en inglés (correo de contacto, respuestas de tienda) | Bajo-medio | El correo de contacto es el fijo del proyecto; prever plantillas de respuesta en inglés en la Fase 6 |

## 9. Decisiones

### 9.1 Cerradas

| Decisión | Resolución | Fecha |
| --- | --- | --- |
| **Revisión clínica** (EN-0.3) | **Profesora SLP con licencia de *Howard University***. Era el cuello de botella real del plan, como lo fueron ACOPROS, la revisora gallegohablante y Ulertuz | ago 2026 |
| **Ejes UI / terapia** (§5.1) | Se **separan**: `UiLang` (`es`\|`en`) independiente de `Locale`, con defecto derivado y desacople explícito por el adulto | ago 2026 |
| **Guía dialectal** (EN-0.5) | **Regla bloqueante**: ningún dataset `en` entra en `main` sin veredicto dialectal firmado | ago 2026 |
| **Qué se locuta mientras no exista el banco inglés** | **Castellano, con voz castellana.** Con `en-US` activa y la Fase 3 sin escribir, las pantallas ya caían al banco castellano; lo que faltaba era impedir que la voz y el micrófono siguieran pidiendo `en-US`, porque un TTS inglés leyendo «perro» no suena a castellano con acento, suena a ruido. Punto único: `EN_THERAPY_CONTENT_READY` en `valeriaLocale.ts` — mientras sea `false`, `contentLocale('en-US')` es `'es'` y de ahí beben el banco de audio, el locale de voz/ASR y el perfil de prosodia. Lo único que suena en inglés es lo que **está escrito** en inglés: la muestra de voz. Al cerrar EN-3.8 se pone a `true` y la variedad se comporta como el resto | ago 2026 |
| **Voz Piper `en_US`** (EN-0.1 / EN-0.2) | **`en_US-ljspeech-high`** (MIT sobre LibriVox en dominio público). Las dos candidatas del plan original, descartadas por licencia | ago 2026 |
| **Cómo puntúa un rasgo dialectal** (EN-0.5) | **Como ACIERTO.** Un rasgo regular de la variedad del niño no es un error terapéutico y no puede restar. Decisión de producto de Frank, **confirmada por Miguelina** (EN-0.3), profesora SLP de *Howard University* | 16 ago 2026 |

### 9.2 Abiertas (para Frank)

Estas cuatro no las puede cerrar el plan; condicionan fases enteras:

1. **¿Ficha de tienda única o separada para EE. UU.?** (EN-0.6) Afecta a
   marketing, a las capturas y a si el inglés viaja en el mismo binario.
2. **¿Se acomete la i18n de UI completa o se lanza primero como «contenido en
   inglés con UI en español»?** La segunda opción es más rápida pero,
   honestamente, no vende en el mercado estadounidense: es media app.
   *Recomendación: i18n completa, en paralelo con la Fase 3.*
3. **¿Entra Valeria Academy en inglés?** Son ~1.500 líneas de formación
   profesional; puede duplicar la Fase 2. *Recomendación: no en esta iteración*
   —aunque con una profesora universitaria en el equipo asesor, Academy en
   inglés gana sentido como fase posterior con contenido propio, no traducido.
4. **¿Se declara la app como *Designed for Families* / Kids Category?** (EN-6.2)
   Da visibilidad, pero restringe analítica y SDK de terceros para siempre.

## 10. Seguimiento

Checklist maestro (marcar al completar; una PR por tarea o grupo pequeño):

- [~] **Fase 0**: **EN-0.1 ✅** (licencias auditadas; dos candidatas descartadas) · **EN-0.2 ✅** (`ljspeech-high`, aprobada por Frank ago 2026) · **EN-0.3 ✅** (revisora confirmada; falta acordar el flujo de revisión) · EN-0.4 · **EN-0.5 ✅** (guía escrita, aplicada y firmada por Miguelina, 16 ago 2026) · EN-0.6 · EN-0.7 · EN-0.8 · **EN-0.9 ✅** (build generable con contenido inglés)
- [~] **Fase 1**: **EN-1.1 ✅** (`Locale += 'en-US'`) · **EN-1.2 ✅** (`VoiceLang += 'en'`) · **EN-1.3 ✅** (selector + arrastre de UI) · **EN-1.4 ✅⏳** (frases de app; el dataset clínico lo bloquea EN-0.5) · EN-1.5
- [x] **Fase 2**: **EN-2.1 ✅** (catálogo tipado + `useT`) · **EN-2.2 ✅** (selector con modo automático) · **EN-2.3 ✅** (los 5 tramos + el 6.º, `ValeriaVoiceUI`) · **EN-2.4 ✅** · **EN-2.5 ✅⏳** (falta verlo en un `expo prebuild -p ios` real) · **EN-2.6 ✅** · **EN-2.7 ✅** (Academy traducida entera) · **EN-2.8 ✅** (gate en CI, con 88 cadenas destapadas al estrenarlo)
- [~] **Fase 3**: **EN-3.1 ✅** · **EN-3.2 ✅** · EN-3.3 (frases portadoras: siguen retiradas del corpus también en inglés, PM-02) · **EN-3.4 ✅** · **EN-3.5 ✅** · **EN-3.6 ✅** · **EN-3.7 ✅** · **EN-3.8 ✅** — validado por Miguelina (EN-0.3), 16 ago 2026
- [~] **Fase 4**: **EN-4.1 ✅** · **EN-4.2 ✅** · **EN-4.3 ⏳** (cableado y probado en la muestra; la sesión completa espera a la Fase 3) · EN-4.4 · **EN-4.5 ✅**
- [ ] **Fase 5**: EN-5.1 · EN-5.2 · EN-5.3 · EN-5.4
- [ ] **Fase 6**: EN-6.1 · EN-6.2 · EN-6.3 · EN-6.4 · EN-6.5 · EN-6.6
- [ ] **Fase 7**: EN-7.1 · EN-7.2 · EN-7.3 · EN-7.4 · EN-7.5

Reglas de trabajo:

1. Cada tarea referencia su código `EN-x.y` en el mensaje de commit.
2. Una fase no se cierra hasta pasar su criterio de aceptación y comprobar
   **regresión cero en `es`, `gl`, `es-DO` y `eu`**.
3. Ningún dataset `en` entra en `main` sin el veredicto dialectal de EN-0.5.
   **Excepción registrada (ago 2026) y cerrada (16 ago 2026):** el banco inglés
   se fusionó a `main` con la guía dialectal **escrita y aplicada pero SIN
   FIRMAR**, por decisión expresa de Frank, para poder generar la build de
   evaluación. Miguelina, profesora SLP con licencia de *Howard University*
   (EN-0.3), ha firmado la guía y, con su equipo, validado la versión actual
   del dataset `en`. La §6 de
   [`guia-dialectal-en-US.md`](./guia-dialectal-en-US.md) ya no tiene casillas
   sin marcar. Sigue sin resolverse el resto de lo que exige publicar en tienda
   en EE. UU. (Fases 5-7).
4. Este documento es la fuente única del plan: cualquier cambio de alcance se
   edita aquí en la misma PR que lo introduce.
