# Protocolo · Expansión Semántica / Progresión Léxica

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
>   previa con el material y los pasos que vienen. **Nada suena hasta que el
>   adulto confirma que lo tiene todo.** La antesala se lee, no se locuta: va
>   dirigida al adulto mientras reúne los objetos. Se puede releer desde dentro
>   de la sesión sin perder el paso.
> - **Ventana de escucha** (ES-04): el reconocedor espera tres segundos de
>   silencio antes de cerrar, aprovecha el mejor resultado parcial y **no
>   descuenta intento ni estrella cuando el fallo es del motor**. El veredicto
>   del adulto está disponible durante toda la escucha. El umbral de aceptación
>   fonética (`matchExpected`) **no se toca**: es materia clínica.
> - **Pictogramas propios** (DC-4 · ES-09): se descartaron los bancos externos
>   por licencia —ARASAAC es CC BY-NC-SA, Mulberry CC BY-SA— pero lo decisivo es
>   otro: ninguno trae «cuchara sucia» y «cuchara limpia» como par sobre el
>   MISMO objeto. El dato nombra el pictograma por una **clave** (`pictogram`),
>   independiente de la lengua, y el dibujo vive en `src/ValeriaPictograms.tsx`.
>   Una clave sin dibujo cae al emoji, sin hueco visual.
> - **Las dos vueltas de una cápsula se distinguen por el pictograma, no por el
>   emoji**: la regla de congruencia obliga a que ambas muestren el mismo objeto,
>   así que con emoji salían dos tarjetas idénticas. Queda **prohibido** dar por
>   buena una cápsula cuyas dos vueltas compartan clave.
>
> Las reglas de contenido las verifican, en cada build:
> `scripts/check-content-rules.js` (ES-06, ES-10, ES-13),
> `scripts/check-pictogram-coverage.js` (ES-12) y
> `scripts/audit-pictograms.js --markdown`, que regenera
> `docs/auditoria-pictogramas.md` con el inventario visual y la columna de
> veredicto de ACOPROS.
> Origen y trazabilidad: `docs/plan-mejoras-acopros-logopedas.json` (ES-01 a ES-13).


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
(pantalla), accesible desde la selección de terapias. Flujo de la sesión:

```
ANTESALA (material + pasos, sin sonido) → «Ya lo tengo todo» → primer paso
```

Y dentro de cada paso:

```
CONSIGNA (TTS) → ESCUCHA (STT) → VEREDICTO (★) → ACCIÓN FÍSICA DEL ADULTO → continuar
```

En las cápsulas de contraste la primera vuelta sustituye la escucha por una
selección entre las dos imágenes:

```
CONSIGNA (TTS) → SELECCIÓN (el niño toca) → VEREDICTO (★) → ACCIÓN FÍSICA → continuar
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

## 2. Progresión · Campo semántico del concepto

Nueve secuencias que **amplían el campo semántico** de un concepto en cuatro
pasos: **concepto → parte → acción → cualidad**. Cada paso incluye su instrucción
TPR para el padre y el array STT con aproximaciones.

Esta escalera sustituyó (DC-2, opción A) a la anterior *onomatopeya → sustantivo
→ verbo → adjetivo*, que clasificaba por **tipo de palabra** en vez de trabajar
el concepto. Arrancar en la onomatopeya, además, devolvía al niño a un registro
que ya tenía superado. **No reintroducir**: `check-content-rules.js` rechaza
cualquier fase cuyo `kind` no sea uno de los cuatro del campo semántico.

| Eje temático | 1 · Concepto | 2 · Parte | 3 · Acción | 4 · Cualidad |
| --- | --- | --- | --- | --- |
| 🚗 Transporte · el coche | coche | rueda | corre | rápido |
| 🐶 Animales · el perro | perro | pata | salta | peludo |
| 🐄 Animales · la vaca | vaca | leche | come | grande |
| 🐱 Animales · el gato | gato | bigote | duerme | suave |
| 🌧️ Naturaleza · la lluvia | agua | nube | cae | mojado |
| 🚂 Transporte · el tren | tren | vagón | para | largo |
| 🐦 Animales · el pájaro | pájaro | pluma | vuela | pequeño |
| 🍞 Alimentación · el desayuno | pan | taza | quiero pan | tostado |
| 🎈 Juego · el globo | globo | cuerda | sopla | redondo |

La única fase **transaccional** del banco («quiero pan») se conserva a propósito:
es el paso a la combinación de dos palabras.

## 3. Contraste activo · Verbos y adjetivos

Ocho cápsulas TPR de pares en contraste con **dos vueltas de distinta
naturaleza** (DC-3):

1. **Vuelta 1 · comprensión.** Se muestran las dos imágenes a la vez y el niño
   **toca la correcta**. No hay micrófono.
2. **Vuelta 2 · producción.** El niño **dice** la palabra opuesta y se evalúa por
   voz, con el veredicto del adulto siempre disponible.

El historial y el informe que se comparte con el logopeda registran las dos por
separado: un promedio único escondía el caso más frecuente en clínica —el niño
entiende el par pero todavía no lo dice—.

El adulto pasa antes por la antesala con el **material** y los pasos, y confirma
antes de que suene nada.

**Las dos vueltas comparten objeto** por la regla de congruencia, así que lo que
distingue las tarjetas de la vuelta de comprensión es el **pictograma de cada
vuelta**, no el emoji. Sin él la tarea es irresoluble, y por eso
`check-pictogram-coverage.js` rechaza una cápsula cuyas dos vueltas compartan
clave —o no la declaren—.

| Cápsula | Par | Setup físico (resumen) | Vuelta 1 · comprensión | Vuelta 2 · producción |
| --- | --- | --- | --- | --- |
| CT-1 | grande / pequeño | dos peluches del mismo animal, uno grande y uno pequeño | grande `osito-grande` | pequeño `osito-pequeno` |
| CT-2 | limpio / sucio | dos cucharas iguales, una limpia y otra manchada | sucio `cuchara-sucia` | limpio `cuchara-limpia` |
| CT-3 | abrir / cerrar | una caja con tapa y el juguete favorito dentro | abrir `caja-abierta` | cerrar `caja-cerrada` |
| CT-4 | subir / bajar | una rampa con un libro inclinado y un coche al pie | subir `coche-subiendo` | bajar `coche-bajando` |
| CT-5 | frío / caliente | dos vasos, uno con agua fría y otro con agua tibia | frío `vaso-frio` | caliente `vaso-caliente` |
| CT-6 | encender / apagar | el interruptor de la luz (o una linterna), luz apagada | encender `bombilla-encendida` | apagar `bombilla-apagada` |
| CT-7 | lleno / vacío | dos cestas iguales, una llena de juguetes y otra vacía | lleno `cesta-llena` | vacío `cesta-vacia` |
| CT-8 | meter / sacar | una caja abierta y tres juguetes fuera, delante del niño | meter `juguete-dentro` | sacar `juguete-fuera` |

Los bancos dominicano y vasco contrastan **los mismos objetos** con su propio
léxico, así que reutilizan las mismas claves de pictograma: la clave identifica
el dibujo, no la palabra.

---

## Principios de diseño

- **Format-first**: el contenido vive como datos tipados y validables, separado de la UI.
- **Aproximaciones fonéticas**: en rehabilitación no exigimos articulación perfecta; se
  premia la aproximación propia de la edad para no frustrar y mantener la motivación.
- **Anclaje corporal (TPR)**: ninguna palabra se cierra sin una acción física del adulto
  que la conecte con un objeto o gesto del entorno real del niño.
- **Contraste como motor semántico**: los pares antónimos (grande/pequeño, abrir/cerrar)
  hacen operativa la palabra: solo se entiende "grande" cuando existe "pequeño" al lado.
