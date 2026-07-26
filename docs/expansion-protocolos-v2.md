# Expansión de Protocolos V2 · Ampliación de ejercicios

> ## ⚠️ Revisión ACOPROS · julio 2026 — objetivos y mecánicas actualizados
>
> ACOPROS resolvió las decisiones clínicas **DC-1**, **DC-2**, **DC-3** y
> **DC-4**. Lo que sigue cambió; **no se debe reintroducir por inercia**:
>
> - **Cada apartado declara un objetivo terapéutico único**, visible para el
>   adulto antes de empezar (`SECTION_GOAL`). Escenarios = repetición verbal
>   (DC-1, opción B); Progresión = campo semántico; Contrastes = comprensión y
>   producción de opuestos.
> - **Los `tts_string` se recortan** a presentación breve + petición, con el
>   objetivo apareciendo UNA sola vez antes de pedirlo. Queda retirado el patrón
>   «Esto es la cama. Por la mañana saltamos de la cama. Di: cama.».
> - **Las progresiones ya no arrancan en una onomatopeya** (DC-2, opción A). Las
>   cuatro fases dejan de ser una escalera de tipo de palabra y pasan a ampliar
>   el campo semántico del concepto: **concepto → parte → acción → cualidad**
>   (coche → rueda → corre → rápido). La única fase transaccional del banco
>   («quiero pan») se conserva.
> - **Las cápsulas de contraste hacen dos vueltas de distinta naturaleza**
>   (DC-3): la primera evalúa COMPRENSIÓN —el niño toca la imagen correcta entre
>   las dos— y la segunda PRODUCCIÓN. El historial las registra por separado.
> - **Regla de congruencia** (ES-13): en una cápsula, el objeto que nombra el
>   audio, el que muestra la imagen y el que pide el setup son el mismo; solo
>   varía el atributo contrastado. Queda prohibido ilustrar el atributo con un
>   objeto ajeno (un elefante para «grande», un cerdo para «sucio»).
> - **Antesala de preparación** (ES-11): toda actividad pasa por una pantalla
>   previa con el material y los pasos. **Nada suena hasta que el adulto
>   confirma.** La antesala se lee, no se locuta.
> - **Ventana de escucha** (ES-04): el reconocedor espera tres segundos de
>   silencio, aprovecha el mejor parcial y **no descuenta intento ni estrella
>   cuando el fallo es del motor**. `matchExpected` no se toca: es materia
>   clínica y aflojarlo produce falsos positivos.
> - **Pictogramas propios** (DC-4 · ES-09): descartados los bancos externos por
>   licencia, y sobre todo porque ninguno trae un par sobre el MISMO objeto
>   («cuchara sucia» / «cuchara limpia»), que es lo que ES-12 necesita. El dato
>   nombra el dibujo por una **clave** independiente de la lengua; sin dibujo,
>   cae al emoji sin hueco visual.
>
> Las reglas de contenido las verifican, en cada build,
> `scripts/check-content-rules.js` y `scripts/check-pictogram-coverage.js`.
> Inventario visual: `docs/auditoria-pictogramas.md`.
> Origen y trazabilidad: `docs/plan-mejoras-acopros-logopedas.json` (ES-01 a ES-13).


Implementación en la app del documento clínico «Expansión de Protocolos de
Rehabilitación en Salud Digital Pediátrica bajo el Marco Regulatorio MDR».
Este documento mapea cada propuesta clínica a su realización en el código y
deja constancia de las decisiones de adaptación.

## Principio rector (muro MDR, innegociable)

Todo lo añadido respeta la arquitectura existente de **control terapéutico
100 % humano**:

- Ningún ejercicio nuevo ajusta dificultad, mide umbrales ni diagnostica.
- Todo estresor (ruido babble, degradación de la voz, persecución dactilar,
  candado de espera, doble atributo) es **manual, del adulto y reversible**.
- La telemetría sigue siendo pasiva y descriptiva (misclicks, latencias,
  veredictos del adulto); no hay clasificación automática del paciente.

## 1 · Pares mínimos (dislalias): PM-11 … PM-15

Banco castellano ampliado de 10 a 15 pares (`valeriaMinimalPairs.ts`), con dos
grupos nuevos (`Nasales`, `Laterales`). Criterio de selección sobre la matriz
del documento: se incorporaron los pares cuyo **error de sustitución habitual
produce exactamente la otra palabra del par** (el principio de diseño del
banco) y cuyos contrastes viven en **ataque silábico**, estable en todas las
macrorregiones dialectales (ningún par depende de /θ/, de /s/ implosiva ni de
líquidas en coda).

| Código | Par | Proceso |
|---|---|---|
| PM-11 | gota / bota | Labialización de velar sonora (g → b) |
| PM-12 | beso / queso | Posteriorización de bilabial (b → k) |
| PM-13 | foca / boca | Oclusivización de labiodental (f → b) |
| PM-14 | miel / piel | Desnasalización de bilabial (m → p) |
| PM-15 | pato / palo | Lateralización de oclusiva dental (t → l) |

Pares de la matriz no incorporados y por qué: *pelo/perro*, *lata/rata* ya
existían (PM-2, PM-3); *casa/tasa* y *tía/día* usan palabras poco
imaginables o personas (rompen la frase portadora); *cama/rama*, *luna/cuna*,
*sopa/copa*, *bote/mote* y *codo/coro* no cumplen la direccionalidad
error→foil con procesos prevalentes.

Los cinco objetivos nuevos entran en el **motor combinatorio de frases
portadoras** (`valeriaCarrierPhrases.ts`): la palabra se elicita incrustada en
prosodia continua, nunca aislada. Los bancos dialectales (gl, es-DO, eu)
conservan sus pares validados; la pantalla ahora omite los grupos sin pares en
la variedad activa.

## 2 · Expansión semántica y progresión morfosintáctica

`valeriaSemanticExpansion.ts` (banco base es):

- **2 progresiones transaccionales nuevas** (`seq-pan` «El desayuno»,
  `seq-globo` «El globo»). Novedad clínica del documento incorporada: la fase
  de verbo de `seq-pan` da el salto de la holofrase a la **combinación de dos
  palabras** («quiero pan»), con contingencia natural (el adulto entrega el
  pan real justo al oír la petición) y la fase de adjetivo exige **selección
  discriminativa entre estados físicos** (pan blanco / pan tostado).
- **2 cápsulas de contraste nuevas**: CT-7 *lleno/vacío*, CT-8 *meter/sacar*.

El avance de fase sigue siendo un conmutador **manual** del cuidador; la app
no progresa sola por tasa de aciertos.

## 3 · Rehabilitación auditiva ACOPROS: RA-1 … RA-5

Bloque nuevo dentro de Audición (categoría «Escucha en ruido»), sobre la
infraestructura existente (deslizador manual de ruido babble del Panel del
Adulto, stages `choice`/`order`/`instruction`):

| Código | Paradigma del documento | Realización |
|---|---|---|
| RA-1 | Atención conjunta con enmascaramiento dinámico | Escena de granja; la señal es la VOZ del adulto y el ruido lo sube a mano el deslizador |
| RA-2 | Lectura labiofacial | El adulto pronuncia sin voz (labios iluminados); el 🔊 restituye el sonido DESPUÉS de la respuesta |
| RA-3 | Formato cerrado con degradación acústica | 4 ítems fonéticamente adyacentes (plato/pato/gato/zapato); el estresor es la voz/distancia del propio adulto |
| RA-4 | Secuenciación con latencia forzada | Orden de 3 pasos con «candado humano»: el adulto sujeta las manos y cuenta 5 s antes de permitir el toque |
| RA-5 | Localización auditiva espacial | Versión analógica: objeto sonoro real detrás del niño, señalar el lado antes de mirar |

Adaptación deliberada en RA-4 y RA-5: el candado temporal y el estímulo
lateralizado son **extracorpóreos/analógicos** (los ejecuta el adulto), en vez
de bloqueos de interfaz o paneo estéreo automatizados, para mantener el
estresor fuera del software (muro MDR) y no depender del hardware de audio.

## 4 · TEA (PRT): TEA-6

- **TEA-6 · Múltiples Señales Simultáneas** (sobreselectividad de estímulos):
  orden con doble atributo (forma + color); los distractores comparten
  exactamente UNA señal con el objetivo. Si el niño atiende a una sola señal,
  la consigna guía al adulto a verbalizar la contingencia de forma natural y
  sin penalización, tal como prescribe el documento.
- *La Transición Interrumpida* y *El Espejo Asimétrico* del documento ya
  estaban cubiertos por TEA-4 y TEA-3.

## 5 · Dislexia: DX-6 y stage nuevo `ran`

- **DX-6 · Denominación Rápida (RAN)**: matriz 4×3 de dibujos familiares de un
  conjunto reducido que se repite (sol/gato/pan/flor; rondas con objetos y con
  colores). El niño nombra en voz alta y toca en orden de lectura; la app solo
  marca el avance (jamás nombra por él ni cronometra). El estresor temporal es
  la **persecución dactilar del adulto**, que la frena o detiene al primer
  signo de hiperactivación — exactamente la sustitución del cronómetro por
  activación motivacional humana que pide el documento.
- Los toques fuera de ficha alimentan el mapa de misclicks existente
  (`ValeriaMisclickBoundary`), sin interrupciones ni avisos.
- *Discriminación de espejo* y *síntesis fonémica* ya estaban cubiertas por
  DX-5 y DX-3.

## Mejora transversal: rondas de contenido

Rondas nuevas (banco `VARIANTS`) para FF-2, FF-3, SE-2, MS-2, PR-3, DX-1,
DX-4 y DX-5, además de las rondas de los ejercicios nuevos: repetir un
ejercicio deja de agotar el contenido tan pronto.

## Estado de localización

Los ejercicios y contenidos nuevos existen en el banco **castellano base**.

- **es-DO (Quisqueya Habla)**: overrides ✅ APROBADOS (validación logopédica
  dominicana QH-2.6) en `valeriaExerciseEsDO.ts` para RA-2/RA-4/RA-5, TEA-6 y
  DX-6 — registro («toca», no «pulsa»), maraca como objeto sonoro de RA-5,
  «atraparse» en vez de «pilla-pilla» en DX-6 y «caracol» en la ronda nueva de
  DX-1 («col» es de baja frecuencia en RD). El léxico restante de los
  ejercicios nuevos ya es neutro-caribeño.
- **gl / eu**: heredan del banco base hasta que sus equipos aprueben overrides
  propios (mismo flujo GL-2.x / EU-2.4).

La voz neuronal de las locuciones nuevas se hornea en CI (`voice-assets.yml`,
que se dispara solo al cambiar `voice-corpus.json` en ramas de trabajo); hasta
que el ciclo termina degradan a la voz del sistema, nunca rompen.
