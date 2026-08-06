# Guía dialectal · Inglés de Estados Unidos (`en-US`)

> **Regla bloqueante (EN-0.5).** Ningún dataset `en` entra en `main` sin
> veredicto dialectal explícito por ítem. Este documento es la referencia de ese
> veredicto y el gate `scripts/check-minimal-pairs-en.js` lo exige por código:
> un par sin `dialect` no compila el banco.
>
> **Estado: 🟡 BORRADOR PARA FIRMA.** Redactado desde la bibliografía publicada
> (ASHA, Green, Craig & Washington, Pearson, Goldstein & Iglesias) por el equipo
> técnico, **no por una persona con licencia clínica en EE. UU.** No sustituye a
> la revisión de EN-0.3 y no autoriza publicar el banco: autoriza **probarlo**.
> Hermano de [`guia-dialectal-es-DO.md`](./guia-dialectal-es-DO.md).

---

## 1. Por qué esta guía existe antes que el banco

En el mercado estadounidense conviven, en la misma aula y con frecuencia en la
misma familia, al menos tres variedades cuyos rasgos regulares coinciden
exactamente con los procesos fonológicos que una app de logopedia detecta como
error:

| Variedad | Presencia | Colisión con el banco |
| --- | --- | --- |
| **Inglés afroamericano** (AAE / AAVE) | Millones de hablantes; variedad reglada y descrita, no «inglés mal hablado» | *TH-fronting*, reducción de grupos finales, /r/ y /l/ postvocálicas, consonante final |
| **Inglés sureño** | Todo el Sur y buena parte del Medio Oeste | Fusión *pin/pen*, monoptongación de /aɪ/, /r/ postvocálica en algunas zonas |
| **Inglés con influencia del español** (SIE) | La población bilingüe a la que apunta el proyecto | /i/–/ɪ/, /b/–/v/, /z/→[s], epéntesis en grupos /sC-/, grupos finales |

Un banco que puntúe esos rasgos como fallo no mide lengua: mide distancia
respecto al inglés blanco de clase media. Y como el que puntúa es un algoritmo,
lo hace de forma consistente, invisible y a escala. **Ese es el riesgo nº 1 del
plan** (§8 de [`plan-integracion-ingles-en-US.md`](./plan-integracion-ingles-en-US.md)),
y no lo resuelve tener buenas intenciones: lo resuelve decidir, ítem por ítem y
por escrito, qué se puntúa y qué no.

## 2. Principio rector: *difference ≠ disorder*

La distinción de ASHA entre **diferencia dialectal** y **trastorno de la
comunicación** se aplica así en Valeria+:

1. Un rasgo **regular** de la variedad del niño **no es un error terapéutico**.
2. Decisión de producto de Frank, ya cerrada (§9.1 del plan): un rasgo dialectal
   **puntúa como ACIERTO**. No resta, no dispara corrección, no aparece en el
   informe como sustitución.
3. Un trastorno se identifica por lo que es **inconsistente con la variedad del
   propio niño**, no por lo que se aparta del inglés estándar.
4. Cuando la app no puede saber qué variedad habla el niño —que es siempre, hoy—
   **el adulto es el juez final**. Es el principio nº 2 del plan y aquí es lo
   que impide que la duda se resuelva en contra del niño.

## 3. Consecuencia de diseño: tres categorías de par

Cada par del banco inglés lleva un campo `dialect` con una de estas tres
etiquetas. El gate no deja pasar un par sin ella.

| Etiqueta | Significado | Qué hace la app |
| --- | --- | --- |
| `developmental` | El contraste detecta un proceso **evolutivo universal**, sin colisión dialectal conocida | Se puntúa con normalidad |
| `dialect-sensitive` | El «error» que detecta es **rasgo regular** de alguna variedad de la tabla §1 | Se puntúa, **pero la pantalla avisa al adulto** con el texto de `dialect.note` antes del ensayo: si el niño habla esa variedad, es acierto |
| `transfer` | El «error» es **transferencia de la L1** en un bilingüe, no un trastorno | Igual que `dialect-sensitive`, con el aviso redactado para familias bilingües |

`dialect-sensitive` y `transfer` **no se eliminan del banco**: /θ/ y el contraste
tenso/laxo son objetivos centrales de la logopedia angloamericana y quitarlos
dejaría el banco clínicamente cojo. Lo que se elimina es que la app decida sola.

## 4. Veredictos por rasgo

### 4.1 Interdentales /θ/ /ð/ → [f] [d] · **dialect-sensitive**

*TH-fronting* (`mouth`→[maʊf]) y *TH-stopping* (`they`→[deɪ]) son **rasgos
reglados del AAE**, no errores articulatorios. También aparecen en SIE, donde el
castellano latinoamericano no tiene /θ/.

> **Veredicto.** El par `thin/fin` se conserva como objetivo, marcado
> `dialect-sensitive`. La app avisa al adulto. En un niño hablante de AAE,
> producir [fɪn] por *thin* **es un acierto**, y el informe no debe registrarlo
> como sustitución.

### 4.2 Contraste vocálico tenso/laxo /i/–/ɪ/ · **transfer**

`sheep`/`ship` es un objetivo clásico, pero en un niño hispanohablante la fusión
es **transferencia de un sistema de 5 vocales**, no un trastorno fonológico.

> **Veredicto.** Se conserva como trabajo de **discriminación auditiva**, marcado
> `transfer`. Con familias bilingües el adulto decide si puntúa; por defecto se
> presenta como juego de escucha, no como criterio diagnóstico.

### 4.3 Reducción de grupos consonánticos

Hay que separar dos cosas que la bibliografía separa y la intuición no:

- **Grupos INICIALES** (`stop`→`top`, `snail`→`nail`): proceso **evolutivo
  universal**, sin colisión dialectal. → `developmental`.
- **Grupos FINALES** (`test`→[tɛs], `hand`→[hæn]): **rasgo regular del AAE y del
  SIE**. → No se usa como objetivo puntuable en este banco.

> **Veredicto.** El banco solo usa reducción de grupo **inicial**. Ningún par
> contrasta un grupo consonántico final.

### 4.4 Consonante final · **dialect-sensitive, con matiz**

La elisión de consonante final simple (`boat`→`bow`) es un proceso evolutivo. La
**devocalización** final (`bad`→[bæt]) y la elisión en grupos sí son rasgos del
AAE.

> **Veredicto.** Se admite un par de consonante final **simple** y **sorda**
> (`seat`/`sea`), que no toca ni la devocalización ni los grupos. Marcado
> `developmental` con nota.

### 4.5 Líquidas: /r/→[w], /l/→[w] · **developmental** (con una excepción)

El *gliding* de /r/ y /l/ en posición **prevocálica** (`rake`→`wake`) es el
proceso más característico del habla infantil angloamericana y no es rasgo
dialectal de ninguna de las tres variedades.

> **Veredicto.** `rake/wake` y `lock/rock` son `developmental`. **Excepción
> explícita:** la /r/ **postvocálica** (`car`, `bird`) es no-rótica en AAE y en
> parte del inglés sureño → **prohibida como objetivo**. El banco no contiene
> ningún par de /r/ vocálica, pese a que el plan la citaba como candidata.

### 4.6 Fronting velar /k/→[t] · **developmental**

`key`/`tea`. Universal infantil, sin colisión. Objetivo limpio.

### 4.7 Sonorización / ensordecimiento /p/–/b/ · **developmental**

`pig`/`big` en posición **inicial**. En posición final habría colisión con el
AAE (§4.4), por eso el par es inicial.

### 4.8 /s/–/ʃ/ · **developmental**

`sip`/`ship`. Sin colisión conocida en las tres variedades.

### 4.9 Rasgos morfosintácticos · **fuera del banco de pares**

Cópula ausente (*he running*), *habitual be*, negación múltiple y variabilidad
de `-s` de plural, posesivo y 3.ª persona son **rasgos gramaticales reglados del
AAE**. El bloque «Lenguaje» los evita como criterio de acierto: la alomorfía de
plural se trabaja como **producción**, nunca como juicio de gramaticalidad.

## 5. Lo que esta guía prohíbe explícitamente

1. Pares que contrasten **/r/ postvocálica** (§4.5).
2. Pares que contrasten **grupos consonánticos finales** (§4.3).
3. Pares que contrasten **sonoridad en posición final** (§4.4).
4. Ítems de pruebas estandarizadas estadounidenses (GFTA, PPVT, CELF, KLPA):
   prohibición legal y de validez, ya recogida en §3 del plan.
5. Cualquier ítem cuyo `dialect` no esté declarado.

## 6. Qué falta para levantar el bloqueo

Esta guía autoriza **probar** el banco, no publicarlo. Para cerrar EN-0.5 hacen
falta tres firmas que el equipo técnico no puede poner:

- [ ] Revisión por la persona de **EN-0.3** (SLP con licencia en EE. UU.),
      confirmando el marco *difference vs. disorder* y los veredictos de §4.
- [ ] Confirmación explícita de la decisión de §9.1 del plan (**rasgo dialectal
      = acierto**), que hoy es decisión de producto y no clínica.
- [ ] Veredicto sobre §4.2: si el contraste tenso/laxo debe puntuar o quedarse
      en discriminación auditiva con familias bilingües.

> **Nota sobre quién firma.** El apartado del **AAE** es el de más riesgo y el
> que exige perfil específico. Una revisora hispanohablante puede validar con
> autoridad §4.2 (transferencia del español) y el conjunto del banco como
> logopeda, pero los §4.1, §4.3, §4.4 y §4.9 piden a alguien que trabaje con
> hablantes de AAE. Si son dos personas distintas, el documento debe llevar las
> dos firmas y decir cuál firma qué.
