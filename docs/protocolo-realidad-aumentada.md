# Protocolo Valeria+ · Bloque de Realidad Aumentada (V1)

> **Encuadre regulatorio: SaMD Clase I (MDR).** El módulo **instrumenta y
> registra**; la decisión clínica la toma íntegramente una persona a partir de
> datos crudos. Ninguna de las cifras que produce es un veredicto, y el software
> no compara contra normativa, no puntúa automáticamente y no ajusta su propia
> dificultad. Ese muro no es higiene de diseño: **es el argumento de
> clasificación** (§9.3 del plan de integración).
>
> Alcance: **solo Android**, teléfono (no tablet). Plan técnico completo en
> [`plan-integracion-rehabilitacion-ar.md`](plan-integracion-rehabilitacion-ar.md).

---

## 1. Principio clínico: desacoplar el refuerzo de la fonación

En los seis bloques anteriores el refuerzo va atado a la producción acústica: el
niño dice la palabra, el reconocedor la valida, aparece la estrella. Eso tiene un
coste conocido en dislalia funcional: **el niño escucha su propio error y se
frustra antes de haber consolidado el gesto motor**.

Aquí ese lazo se rompe:

> El refuerzo visual 3D se condiciona **exclusivamente a la conducta motora
> objetivo** —postura labial, giro cefálico, fijación sostenida—. En AR-1 y AR-3
> el **micrófono está apagado**. Se premia el esfuerzo motor *antes* de exigir la
> fonación.

Tres reglas hacen que «condicionado» signifique algo verificable en el código:

| Regla | Qué implica en sesión |
| --- | --- |
| **Contingencia estricta** | El premio no puede llegar por el paso del tiempo, ni por un toque del adulto, ni por el reconocedor de voz. Si el niño no hace el gesto, no hay premio: no hay forma de «ayudarle» desde fuera |
| **Progreso continuo** | El coche acelera *mientras* sostiene la postura. Un premio todo-o-nada a los 1,5 s no le enseña qué está haciendo bien; uno proporcional, sí |
| **Decaimiento, no reinicio** | Si pierde el gesto un instante, el progreso baja; no se borra. Reiniciar a cero en un niño de cuatro años es garantizar que no lo consiga nunca |

---

## 2. Antes de la primera sesión

### 2.1 Consentimiento de cámara (una vez por paciente)

La app lo pide con las tres afirmaciones que sostienen todo el módulo, y
conviene que el adulto las oiga también de viva voz:

1. **No se graba ni se guarda ninguna imagen.** Cada fotograma se analiza y se
   descarta en el mismo instante.
2. **Ningún vídeo sale del teléfono.** Todo el análisis ocurre en el aparato, sin
   conexión.
3. **No se reconoce la cara de nadie.** Se miden gestos: grados, milisegundos y
   proporciones.

### 2.2 Prueba de Aptitud del Dispositivo (una vez por teléfono)

90 segundos que al niño se le presentan como un juego de calentamiento con la
osita. Devuelve un **nivel de aptitud** que decide qué se ofrece:

| Nivel | Qué se habilita | Lectura clínica |
| --- | --- | --- |
| **A · Instrumento** | Los seis ejercicios · AR-2 cronometrado | Este teléfono puede producir dato publicable |
| **B · Clínico** | Los tres · AR-2 **solo como juego** | Sirve para terapia; los tiempos de AR-2 no son defendibles |
| **C · Reducido** | AR-1 y AR-3 con **2 dianas** | El puntero tiembla demasiado para tres dianas |
| **D · No apto** | El bloque no aparece | Los otros seis bloques funcionan igual |

> **Un nivel bajo no es un defecto del niño ni del centro: es una propiedad del
> aparato.** Conviene decirlo así a la familia, porque el teléfono lo pone ella.

### 2.3 Colocación (condiciona la validez, no la comodidad)

- Teléfono **apoyado** en un libro, una caja o contra la pared. Nunca en la mano:
  un giro de muñeca del adulto se lee como giro de cabeza del niño.
- **Horizontal (landscape)** y a **30-35 cm** de la cara.
- La app avisa en verde cuando la posición vale, y **anula el ensayo** si el
  teléfono se mueve durante la ventana de respuesta.

> Un ensayo anulado es barato; uno contaminado envenena el registro. La tasa de
> anulación se mide y se reporta: si supera el 50 %, la conclusión no es «AR-3 no
> funciona» sino «AR-3 necesita un soporte de 6 €».

---

## 3. AR-1 · Cinemática Orofacial

**Para qué**: aislar la cinemática de la acústica en dislalias funcionales.
Premiar el gesto motor preparatorio de /o/ y /u/ antes de pedir el sonido.

| Elemento | Especificación |
| --- | --- |
| Señal | `mouthPucker` (primaria) + ratio apertura vertical / anchura bucal normalizada por distancia inter-ocular (secundaria, explicable) |
| Simetría | Asimetría de comisuras < 8 % de la anchura bucal. Sin esto se premiaría una mueca asimétrica, que es el patrón compensatorio que la terapia intenta deshacer |
| Criterio | Sostener el umbral **1500 ms** por defecto (configurable 800-3000 ms desde el Panel del Adulto) |
| Micrófono | **Apagado** |
| Línea base | 3 s de reposo al entrar. Los umbrales son *deltas* sobre el reposo de ESE niño: la morfología labial de uno de 3 años y otro de 6 no admite un umbral común |

**Consigna al niño**: «Pon boquita de beso para que el coche avance.» Nada más.
No se le pide que diga nada.

**Qué queda registrado por ensayo**: sostén máximo y total, pico de redondeo,
ratio de apertura, peor simetría, frames válidos sobre totales e intentos hasta
conseguirlo.

**Lectura clínica**: la serie de sostén máximo por ensayo describe la resistencia
del gesto. Un `attemptsToFire` alto con sostén corto sugiere que el umbral está
por encima de lo que hoy puede sostener — **y bajarlo es decisión vuestra, en el
Panel; la app no lo toca**.

---

## 4. AR-2 · Localización del sonido instrumentada

**Para qué**: convertir una observación cualitativa («¿giró?») en una latencia en
milisegundos. Es la **versión instrumentada de RA-5** del bloque de Audición, que
sigue disponible con campanita donde no hay montaje.

### 4.1 Dos modos, y el montaje decide cuál

| | **Modo juego** (casa, la mayoría de sitios) | **Modo instrumento** (centro) |
| --- | --- | --- |
| Transductor | El del teléfono | **Dos altavoces externos cableados a ±60°**, equidistantes a 1 m, a la altura del oído |
| Registro | Acierto/fallo · `latencyMs: null` **con el motivo** | Latencia real por ensayo |
| Requisitos | Ninguno | Teléfono de nivel A · balance de canales < 1,5 dB · dB SPL medido en la posición de la cabeza |

**Bluetooth está vetado**, sin excepción: añade 100-300 ms variables ensayo a
ensayo, que es exactamente la magnitud que se quiere medir. Sería medir la radio,
no al niño.

### 4.2 Diseño de ensayo

- **Postura armada**: no hay estímulo si el niño no lleva 500 ms mirando al
  frente. Sin esto, media latencia sería el tiempo que tardó en volver la cabeza.
- **Lado aleatorizado**, máximo 2 repeticiones seguidas.
- **Ensayos trampa (~20 %, sin sonido)**: es el control que distingue detección
  auditiva de movimiento cefálico espontáneo. **Sin ellos esto es una demo, no un
  instrumento.**
- **Ventana de respuesta** de 2000 ms. Fuera de ventana es «sin respuesta», nunca
  «error».
- **Intervalo inter-ensayo aleatorio 3-6 s** para que no anticipe.

> **Durante el ensayo, el adulto no señala, no mira hacia el altavoz y no
> reacciona.** Es la fuente de sesgo más fácil de introducir y la más difícil de
> detectar después en los datos.

### 4.3 Qué significa un `latencyMs: null`

No es un fallo: es honestidad. El registro dice por qué, y cada motivo se lee
distinto — ensayo trampa, sin respuesta, reloj de cámara no alineable, salida
Bluetooth, sin transductor cableado, o teléfono por debajo de nivel A.

---

## 5. AR-3 · Selección semántica por fijación

**Para qué**: evaluar comprensión léxica **sin que la motricidad fina contamine
el resultado** (parálisis cerebral, dispraxia). El niño elige mirando.

| Elemento | Especificación |
| --- | --- |
| Puntero | Iris (preciso, ruidoso) o rayo desde la nariz (robusto, grueso). Se elige en el Panel; el ejercicio no se entera de cuál corre |
| Calibración | **Obligatoria**, 5 puntos con Lúa, ~15 s, por paciente y por dispositivo. Un rayo facial sin calibrar no apunta a nada |
| Dianas | 3 en nivel A y B · **2 en nivel C**. Se colocan en grados calculados en caliente, no en píxeles |
| Selección | Fijación sostenida **1200 ms** (configurable), con anillo de progreso visible |
| Zona neutra | El *dwell* solo acumula dentro de un dibujo, nunca en el fondo (problema de Midas) |

**Consigna**: se dice la palabra **una sola vez** y se espera. Repetirla reinicia
la conducta de búsqueda y contamina la variable de primera fijación.

**Dos variables distintas, y conviene no confundirlas**:

- **Primera fijación**: adónde mira primero. Sesgo de comprensión inmediata.
- **Selección final**: qué acaba eligiendo, con posible corrección. Es la única
  que dispara el giro de 360°.

> **El modo de 2 dianas no es una derrota**: la elección forzada entre dos
> alternativas es un paradigma estándar de evaluación de comprensión, con su
> conocido 50 % de acierto por azar, que se corrige con más ensayos y no con más
> dianas. Lo que sí sería un error es dejar tres dianas indiscriminables y llamar
> «error de comprensión» a un fallo de puntería. **No mezcléis sesiones de 2 y 3
> dianas en un mismo informe de progreso**: el registro guarda `targetCount`
> justo para poder separarlas.

---

## 6. AR-4 · Búsqueda espacial de Lúa

**Para qué**: amplitud articular cervical, rastreo visual en el espacio y
control inhibitorio de la sacada desordenada. Lúa se esconde en un cuadrante y
el niño la localiza girando la cabeza.

| Elemento | Especificación |
| --- | --- |
| Cuadrantes | 4, a ±22° de guiñada (izquierda/derecha) y ±18°/+14° (superiores). Se sortean por ensayo |
| Coincidencia | Cono foveal de **8,5°**, sostenido **650 ms** |
| Techo por ensayo | **12 s**. Agotado, el ensayo se cierra como fallido, no anulado |
| Radar | La retícula se dibuja a la escala real del aparato (`pxPerDeg` de anchura, mm y distancia) y **se ancla al borde** cuando la diana cae fuera de pantalla |

**Por qué la retícula toca el borde casi siempre**: la pantalla a un palmo y
medio abarca unos 11°, y la diana vive a ±22°. Es decir, el objetivo está fuera
de la pantalla durante casi todo el ensayo, y eso es el ejercicio: el borde
indica hacia dónde girar. No es un recorte, es la tarea.

**Registro**: cuadrante, guiñada y cabeceo de la diana, tiempo de adquisición
(ms), sostén foveal (ms), **RMS de guiñada** en grados —dispersión, no error— y
si se consiguió.

---

## 7. AR-5 · Lanzamiento del pez a Lúa

**Para qué**: coordinación óculo-manual, puntería balística y latencia de
iniciación motora ante una demanda comunicativa. Lúa espera hambrienta en el
centro y el niño le lanza el pez deslizando el dedo.

| Elemento | Especificación |
| --- | --- |
| Gatillo | **El dedo del niño.** Arrastre sobre la pantalla, mínimo 48 px de recorrido |
| Velocidad | Del `VelocityTracker` de Compose, con las posiciones reales del puntero |
| Puntería | Desviación con signo entre la dirección del gesto y la recta dedo→Lúa, normalizada a (−180°, 180°] |
| Acierto | Desviación ≤ **18°** **y** velocidad ≥ **350 px/s**. Las dos condiciones, no una |
| Vuelo | 650 ms en línea recta hasta el centro. **No hay parábola**: no se simula gravedad y pintar un arco sugeriría una física que no existe |
| Sin lanzamiento | A los 12 s el ensayo se **anula** (`voidReason: "no_throw"`) |

> **Aquí no se mide ningún tiempo de reacción de captura.** Quien atrapa el pez
> es Lúa, que es software: cronometrarla mediría el reloj de la app, no al niño.
> Una versión anterior de este ejercicio guardaba un `catchReactionMs` de 320 ms
> constantes, una velocidad de 920 px/s constante y un acierto que era cierto
> siempre, porque el lanzamiento lo disparaba un temporizador y el dedo no se
> leía en ninguna parte. Eso llegaba al panel del paciente y, en nivel A, al
> conjunto publicable. **Un dato constante no es una medida.**

**Registro**: velocidad del lanzamiento (px/s), desviación de puntería (°),
distancia de trabajo (mm), latencia de lanzamiento (ms) y acierto.

---

## 8. AR-6 · Espejo mímico con Lúa

**Para qué**: praxias fonoarticulatorias, conciencia miofuncional orofacial e
imitación motora visual. Lúa modela un gesto y el niño lo imita frente al
espejo de AR.

| Elemento | Especificación |
| --- | --- |
| Praxias | Sonrisa, apertura mandibular, inflado de mejillas y protrusión labial. Se sortean por ensayo |
| Línea base | **45 frames** de reposo por ensayo, individual. La activación se normaliza restándola |
| Umbral | Histéresis 0,52 / 0,42 con el sostén configurado en el Panel (el mismo de AR-1) |
| Simetría | Índice bilateral por comisuras y nariz. Por encima de 0,12 de asimetría la señal se atenúa al 40 % |
| Excepción | El inflado de mejillas **no** se penaliza por asimetría: la variación unilateral ahí es fisiológica |
| Techo por ensayo | 14 s |

**Registro**: praxia objetivo, pico de activación (0..1), sostén máximo (ms),
índice de simetría (0..1) y si se logró la sincronía.

---

## 9. Duración y fatiga

La cámara a 30 fps más la inferencia más la escena 3D calientan un teléfono de
gama media en minutos, y el rendimiento cae. Coincide con lo clínicamente
deseable a estas edades:

- Sesiones **cortas**, con cápsula TPR de movimiento intercalada.
- La app sella el **estado térmico en cada ensayo**, de modo que los ensayos
  degradados se pueden descartar después en lugar de contaminar la serie.
- Si el aparato entra en calentamiento moderado, avisa al adulto.

---

## 10. Cómo leer el panel del paciente

El panel muestra **series y magnitudes**: sostén en milisegundos, latencia por
ensayo, fijación hasta elegir, ensayos anulados y el sello del aparato.

Lo que **no** vais a encontrar, y su ausencia es deliberada: percentiles,
comparación con «lo esperado para la edad», semáforos de severidad o etiquetas
diagnósticas. Un gráfico de latencias es descripción; un badge rojo es
interpretación, y la interpretación es vuestra.

**El sello del aparato importa al comparar.** Dos sesiones en teléfonos distintos
no son directamente comparables, y por eso cada registro lleva marca, modelo,
nivel de aptitud y fps sostenidos.

---

## 11. Qué hacer si algo no va

| Síntoma | Causa habitual | Qué hacer |
| --- | --- | --- |
| El bloque no aparece en el hub | Teléfono de nivel D, o permiso de cámara denegado | Nada que arreglar: los otros seis bloques funcionan igual |
| Muchos ensayos anulados | Teléfono en la mano o mesa que se mueve | Apoyarlo contra algo firme. Si persiste, anotadlo: la tasa es un dato |
| El puntero de AR-3 tiembla | Luz pobre, o iris en un aparato modesto | Cambiar el puntero a «Nariz» en el Panel del Adulto |
| En AR-4 la retícula vive en el borde | Es el comportamiento correcto: la diana está fuera de pantalla | Nada. El borde señala hacia dónde girar |
| Muchos ensayos de AR-5 anulados | El peque no llega a lanzar, o solo toca sin arrastrar | Enseñarle el gesto una vez. La tasa de `no_throw` es un dato, no un fallo |
| AR-2 no cronometra | Sin altavoces cableados, o reloj de cámara no alineable | Es esperable en casa. Se juega igual y se registra el motivo |
| Nunca llega al premio en AR-1 | Umbral de sostén por encima de lo que hoy puede | Bajarlo en el Panel. **Lo decidís vosotros: la app no lo ajusta sola** |

---

## 12. Estado de implementación

| Pieza | Estado |
| --- | --- |
| Host nativo, señal facial, recompensa, **seis** ejercicios, telemetría | Escrito |
| Modelos 3D y modelo de señal facial | En el repositorio, verificados |
| Política de privacidad (ES/EN) | Actualizada |
| Compilación y verificación en teléfono real | **Pendiente** (Fase 1) |
| Calibración de los umbrales de las siete sondas | **Pendiente** (Fase 0: banco de referencia + censo) |
| Montaje de campo libre para AR-2 | **Sin financiar**; censo de equipamiento a los centros pendiente |
