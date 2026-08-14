# Plan de integración · Lúa (periférico físico de refuerzo)

> **Documento de planificación. No cambia nada en pantalla.** Al mergear esto,
> Frank no verá ninguna diferencia en la app: es un `.md` en `docs/`. La primera
> pantalla nueva (tarjeta de emparejamiento en Ajustes) llega en la Fase 3 y,
> cuando llegue, irá con captura propia como manda la regla 1.
>
> Define cómo conectar **Lúa** —mascota física sobre ESP32— con **Valeria+**
> (rehabilitación, SaMD Clase I). **Este documento es de Valeria+ y de nadie
> más.** VIA+ aparece en un único sitio, §8, y solo para decir que Lúa no está
> en la sala mientras VIA+ mide.
>
> Estado: 🔵 **planificación. Cero código, cero firmware, cero hardware validado.**
> Rama de trabajo: `claude/lua-pictogramas-insignias-xo7hjp`

> ## ⛔ Corrección de Frank · 13/8/2026 — léase antes que el resto
>
> Las versiones anteriores de este plan contradecían tres instrucciones suyas.
> No por descuido: estaban argumentadas en contra, por escrito. Queda anotado
> aquí porque el documento se leyó como si recogiera lo que él había dicho.
>
> **C-1 · El espejo refleja lo que el niño mira, no la cara de la mascota.**
> Lúa muestra **los pictogramas, las insignias y el nivel**. El motivo es de
> Frank y es clínico, no estético: *el niño no va a mirar la tableta, y a los
> niños no se les expone a pantallas de forma indiscriminada.* La tableta es el
> instrumento del adulto; Lúa es lo que el niño mira.
> Lo que había: cinco opcodes que transmitían el estado de ánimo de la mascota
> (`PHASE`, `VERDICT`, `CELEBRATE`, `IDLE`, `CALL`). El pictograma no viajaba, y
> la insignia y el nivel iban los dos como `CELEBRATE(intensidad 0-2)`,
> indistinguibles entre sí en el cable. Peor: **R-4 catalogaba esto como riesgo
> de deriva de alcance** y blindaba el protocolo «estructural, no disciplinar»
> para que no se pudiera hacer.
>
> **C-2 · El espejo va en TODOS los ejercicios, no solo en Pares Mínimos.**
> §6.5 enumeraba tres enganches. La app tiene 37 ejercicios en cuatro bloques
> más Pares Mínimos, Expansión Semántica, Ling, TPR y RA (§6.5, tabla nueva).
>
> **C-3 · Nada de VIA+ entra en el diseño de Valeria+.** Es la regla que faltaba
> y de la que salió todo lo demás. **D-2 («Lúa v1 es muda») estaba justificada
> entera con VIA+**: «admisible en el entorno de VIA+», «no puede contaminar una
> logoaudiometría». Ni una cláusula de Valeria+. Frank había dicho que le parecía
> interesante que Lúa tuviera **estímulos sonoros**, y el gate `check-lua-mute.js`
> —líneas 24-31: `tone()`, `ledcWriteTone`, `ledcAttachPin`, `I2S`— rompe el
> build si alguien se los pone. Reescritas D-2, R-5 y el gate (§3, §11, §13).
>
> El argumento ni se sostenía dentro del propio plan: §8 dice que la integración
> correcta con VIA+ es **la ausencia del aparato**. Si no está en la sala, no
> contamina ninguna medición. Enmudecerlo no protegía nada que la ausencia no
> protegiese ya, y costaba una función en un producto de rehabilitación.
>
> ### Y tres decisiones cerradas el mismo día (§14)
>
> - **D-F · Sonido: tonos para empezar.** Zumbador pasivo por PWM en v1, sobre la
>   placa ya elegida. Sin opcode nuevo: el tono va atado al opcode que ya existe.
>   Con una regla clínica propia de Valeria+ — **Lúa no suena mientras la tableta
>   escucha**, o el pitido enmascara el estímulo y entra en el ASR.
> - **D-G · Espejo puro.** Lúa muestra la misma imagen que ve el adulto en la
>   tableta. La tableta no cambia, no hay modo de adulto y **no se rediseña
>   ninguna pantalla clínica**.
> - **D-H · Los mini-juegos pasan a pictogramas.** Es la partida más grande del
>   plan: **244 pares (palabra, emoji) en los bancos de ejercicios, de los que hoy
>   solo 1 resuelve a un dibujo**. Salen con del orden de 82 pictogramas, porque
>   la clave no depende del idioma. Y arregla la tableta, no solo Lúa: esas 243
>   fichas se pintan hoy con emoji del sistema, que es el defecto del tofu por el
>   que nació `ValeriaPictograms`.

> **Lo que este documento cambia respecto al borrador de partida.** Tres cosas,
> y conviene leerlas antes que nada porque mueven dinero y semanas:
>
> 1. **El borrador atribuye a la placa circular ESP32-C3 un códec de audio
>    ES8311 y un RTC que esa placa no tiene** — son de la placa e-Paper S3. Es un
>    hecho de la placa (§2.4) y lo que decide es **qué hardware hace falta si se
>    quiere sonido** (D-2), no si el sonido es admisible.
> 2. **El perro mecánico no queda "aplazado" por el ruido de los servos: queda
>    fuera por el micrófono.** Trae asistente de voz con activación por palabra
>    clave y diálogo en 15 idiomas, o sea captura continua de audio junto a un
>    menor. Eso no entra en una consulta pediátrica ni en el formulario de
>    Seguridad de los datos de Play (§2.3). **Micrófono, no altavoz**: entrada y
>    salida de audio son cosas distintas y este plan las trataba igual.
> 3. **La integración correcta con VIA+ durante la medición es la ausencia del
>    aparato** (§8). Y ahí se acaba lo que VIA+ tiene que decir aquí (C-3).

---

## Índice

- [1. Qué es Lúa y qué no es](#1-qué-es-lúa-y-qué-no-es)
- [2. Las tres placas: qué valida cada una](#2-las-tres-placas-qué-valida-cada-una)
- [3. Decisión de hardware](#3-decisión-de-hardware)
- [4. Presupuesto de latencia](#4-presupuesto-de-latencia)
- [5. Arquitectura: capacidades por concesión, no interruptores](#5-arquitectura-capacidades-por-concesión-no-interruptores)
- [6. Protocolo BLE](#6-protocolo-ble)
- [7. Superficie de integración en Valeria+](#7-superficie-de-integración-en-valeria)
- [8. VIA+: la integración correcta es la ausencia](#8-via-la-integración-correcta-es-la-ausencia)
- [9. Permisos, privacidad y Play Console (bloqueante)](#9-permisos-privacidad-y-play-console-bloqueante)
- [10. Identidad visual de Lúa](#10-identidad-visual-de-lúa)
- [11. Garantías de no regresión y gates de CI](#11-garantías-de-no-regresión-y-gates-de-ci)
- [12. Plan por fases](#12-plan-por-fases)
- [13. Riesgos](#13-riesgos)
- [14. Decisiones que necesito de Frank](#14-decisiones-que-necesito-de-frank)

---

## 1. Qué es Lúa y qué no es

Lúa es un **espejo tangible de lo que la app le muestra al niño**. La app decide,
Lúa refleja.

La palabra *espejo* es de Frank y hay que leerla en su sentido literal, no en el
flojo: lo que está en la tableta aparece también en Lúa. No es un semáforo de
ánimo colgado al lado del ejercicio.

**Por qué importa, y es la razón que ordena el diseño entero.** El niño no va a
mirar la tableta. A un niño de esta edad no se le expone a una pantalla de forma
indiscriminada, y menos durante cuarenta minutos de sesión. La tableta es **el
instrumento del adulto** —consigna, control, registro, resultados—; Lúa es **lo
que el niño mira**: un objeto de 32 mm de cristal en una carcasa que se puede
coger, no un panel retroiluminado de diez pulgadas.

**Qué refleja, entonces:**

| Capa | Qué viaja | Opcode |
| :--- | :--- | :--- |
| **El estímulo** | el pictograma de la ficha, por número de catálogo | `PICTO`, `PICTO_PAIR` |
| **El turno** | escucha / repite / veredicto / misión | `PHASE` |
| **La respuesta** | el `MatchLevel` que la app ya calcula | `VERDICT` |
| **El premio** | la insignia concreta (glifo + rango) y el nivel | `AWARD`, `LEVEL` |
| **El vínculo** | reposo, llamada, celebración | `IDLE`, `CALL`, `CELEBRATE` |
| **El ánimo** | una de las ocho emociones puras — **no dice nada del ejercicio** | `AFFECT` |

**Es:**
- Un esclavo BLE sin iniciativa. No mide, no puntúa, no decide, no guarda.
- Una pantalla con cara **y con el contenido que el niño tiene que ver**.
- **Opcional en el sentido fuerte**, y esto no cambia: la app se comporta
  exactamente igual si Lúa no existe, está apagada o se desconecta a mitad de un
  ejercicio. La tableta sigue mostrando la ficha, igual que hoy. Lúa **duplica**;
  no sustituye ni condiciona. No tiene que estar en la sala.

**No es:**
- Un sensor. **No lleva micrófono** (§11, gate). La captura vocal se hace en la
  tableta, donde ya está el ASR, el corpus y el cifrado. Esto no se abre nunca:
  el motivo es de Valeria+ —app infantil, programa Familias, RGPD— y es el mismo
  que tumba el perro mecánico en §2.3.
- Un almacén. Cero PHI: no recibe nombres, ni `patientKey`, ni puntuaciones, ni
  fechas de sesión. Recibe **números**: un id de catálogo, un índice de glifo, una
  cifra de nivel. El protocolo no tiene campo de texto y sigue sin tenerlo (§6.1)
  — mostrar un pictograma no lo rompe, porque el dibujo ya está en el aparato y
  por el cable solo va su número.
- Un aparato mudo por principio. Lo es hoy **por la placa** (§2.4, D-2), no por
  una regla clínica. El refuerzo sonoro en rehabilitación es legítimo y está
  sobre la mesa.

La regla que ordena todo lo demás: **Lúa nunca puede ser la razón por la que un
dato clínico es inválido.** De ahí sale la máquina de estados de §5, y solo de
ahí — no de requisitos importados de otro producto (C-3).

---

## 2. Las tres placas: qué valida cada una

### 2.1 ESP32-C3 · pantalla IPS circular 1,28" (ESP32-2424S012)

| | |
| :--- | :--- |
| SoC | ESP32-C3-MINI-1U · RISC-V monocúcleo 160 MHz · 4 MB flash · BLE 5.0 |
| Pantalla | IPS 240×240, driver GC9A01, 16 bits, Φ 32,4 mm |
| Consumo | ~100 mA · batería por JST 1.25-2P |
| Expansión | **un** puerto SH1.0-4P |

Es la única de las tres que puede animar una cara. Un frame completo son
240×240×2 = **115 KB**; a 40 MHz de SPI, ~23 ms de transferencia. Sobra margen
para 20-30 fps de animación facial vectorial.

**Su límite real es el puerto de expansión.** Cuatro pines (3V3, GND y dos I/O)
es todo lo que hay para añadir cualquier cosa. Un RTC externo I²C ocupa esos dos
I/O y deja cero para I²S. Audio y reloj externo son **excluyentes** en esta
placa, y con audio digital ni siquiera caben los tres pines mínimos.

### 2.2 ESP32-S3 · e-Paper 1,54" (ESP32-S3-ePaper-1.54G)

Esta sí trae todo lo que el borrador atribuye a la otra: ES8311 por I²S, RTC
PCF85063 con interrupción en GPIO5, SHTC3, microSD, gestión de batería Li-Ion,
altavoz por MX1.25, 8 MB de PSRAM.

Y trae también el motivo por el que no puede ser Lúa: **refresco de 15 s en modo
rápido, 20 s completo**. Una cara que tarda quince segundos en sonreír no es
refuerzo inmediato; es otra cosa.

Sirve para dos experimentos concretos, no para el producto:
- **Autonomía extrema.** Cuánto dura una celda con la pantalla apagada casi
  siempre y el RTC despertando por alarma. Es el benchmark contra el que se mide
  el coste energético de la IPS.
- **Ensayo del stack de audio y del RTC**, si en v2 se decide que Lúa suene.

### 2.3 ESP32-Hi Mechanical Dog · fuera de alcance, y no por los servos

El borrador lo aplaza por interferencia acústica. El ruido de los SG92 es un
problema real —hay que medirlo, y la expectativa está en el orden de 45-60 dB(A)
a un metro, muy por encima de lo que ISO 8253 permite de ruido ambiental para
audiometría—, pero es **el segundo** problema.

El primero es que el aparato, tal y como se vende, incorpora **micrófono con
activación por voz y diálogo conversacional en 15 idiomas**, con cobertura
declarada de hasta 5 m. Un diálogo multilingüe de ese tipo no cabe en 4 MB de
flash: implica servicio remoto. Es decir, **un dispositivo que escucha de forma
continua y envía audio de un menor a un tercero no identificado, dentro de una
consulta pediátrica.** Eso es incompatible con:

- el RGPD (art. 9, datos de salud; menores),
- la política de *Familias* de Google Play y el formulario de *Seguridad de los
  datos* que declara el proyecto,
- y la propia regla 7.1 del borrador («inhabilitación del micrófono en Lúa»),
  que este aparato viola de fábrica.

Reflashear el firmware para arrancarle el asistente es posible, pero entonces se
está comprando un chasis de 97×78 mm con servos y escribiendo el firmware desde
cero igualmente — sin ganar la pantalla (0,96", frente a los 240×240 de la C3) y
arrastrando el ruido mecánico. **No entra en v1.** Si algún día hay movimiento,
será con servos elegidos por ruido medido y con el aparato fuera de toda prueba
acústica.

### 2.4 La contradicción del borrador, en una línea

> «Códec I2S (ES8311) **integrado en la placa**» + «Hardware priorizado: **ESP32-C3
> IPS**» son incompatibles: el ES8311 está en la placa e-Paper.

Elegir la C3 es elegir una Lúa **sin códec de audio y sin reloj propio**. Hay que
decidirlo a propósito, no descubrirlo al soldar.

Precisión que la versión anterior no hacía y que costó una función (C-3): *sin
códec* no es *muda*. Un zumbador pasivo por PWM necesita **un pin**, y en el
puerto de expansión hay dos. Lo que la C3 no da es voz ni sonido muestreado; los
tonos sí. La decisión está en D-2 y D-F, no aquí.

---

## 3. Decisión de hardware

**D-1 · v1 corre sobre la placa ESP32-C3 con pantalla IPS circular.** Es la única
que cumple el requisito de latencia (§4).

**D-2 · El sonido es una decisión de hardware abierta, no una prohibición.**
*(Reescrita el 13/8/2026. La versión anterior decía «Lúa v1 es muda» y lo
justificaba entera con VIA+ — «admisible en el entorno de VIA+», «no puede
contaminar una logoaudiometría». Ninguna cláusula era de Valeria+, y §8 ya
resuelve VIA+ por ausencia. Ver C-3.)*

Separar las dos cosas que el plan trataba como una:

- **Entrada de audio: prohibida, y no se reabre.** Sin micrófono, sin I²S RX, sin
  ADC de micrófono. El motivo es de Valeria+ —captura de voz de un menor, RGPD
  art. 9, programa *Familias* de Play, formulario de Seguridad de los datos— y es
  el que deja fuera al perro mecánico (§2.3). Lo vigila el gate (§11).
- **Salida de audio: la quiere Frank y no hay motivo clínico para negarla.** En
  rehabilitación, el refuerzo sonoro es exactamente lo que toca; el niño que no
  mira la tableta tampoco la oye. Lo único que se interpone es físico.

**El impedimento real es el puerto de expansión, y es una cuenta, no un
criterio.** La placa elegida (§2.1) tiene **un** SH1.0-4P: 3V3, GND y dos I/O.
Con eso, audio digital y reloj externo son excluyentes (§2.4), y para I²S
—BCLK, WS, DOUT— no llegan ni los tres pines mínimos. Las salidas, en orden de
coste:

| Vía | Pines | Qué da | Coste |
| :--- | ---: | :--- | :--- |
| Zumbador pasivo por PWM (`ledcWriteTone`) | 1 | tonos, arpegios, un «tilín» de acierto | ninguno: cabe hoy en la C3 |
| DAC interno + amplificador I2C | 2 | muestras cortas, calidad pobre | ocupa el puerto entero |
| Códec I²S + altavoz | 3+ | voz y sonido real | **exige otra placa** (la e-Paper S3 lo trae, §2.2) |

**DECIDIDO por Frank el 13/8/2026 (D-F): el zumbador por PWM entra en v1, con
tonos.** Es un pin, cabe en la placa
elegida, y cubre el caso que a Frank le interesa —que la celebración y el
veredicto suenen— sin tocar el hardware. Voz y sonido muestreado son v2 y placa
distinta, y entonces sí hay que rehacer §4 (el presupuesto de latencia no
contempla audio) y §7 (el volumen es una preferencia del adulto, no una
constante).

**Lo que el sonido sí arrastra, y hay que escribirlo:** cualquier salida de audio
pasa por la concesión con caducidad de §5, como capacidad propia y separada de la
visual. Si el enlace cae, Lúa se calla en ≤ 60 s sin que nadie se acuerde de
apagarla. Y el volumen tiene tope en firmware, no solo en la app.

**La reapertura del 14/8/2026 está cerrada, y la placa no se mueve (D-K, §14).**
Durante unas horas la dirección pidió **locuciones pregrabadas** en el aparato, lo
que exige I²S —tres pines— y por tanto otra placa. La respuesta de Frank es que
**la voz la pone la tableta**: Lúa se queda con la cara, que es lo que la C3 hace
bien. Consecuencias sobre esta sección, todas en el sentido de no tocar nada:
la fila de la tabla que **exige otra placa** se queda sin tomar, la **D-1 no se
reabre**, y **§4 no se rehace** —el presupuesto de latencia sigue sin tener que
contemplar audio muestreado—.

**D-3 · El "Modo Vínculo" no lleva RTC propio en v1.** El horario ya existe y ya
es una preferencia del usuario en la app: `REMINDER_SLOTS` en
[`src/valeriaNotifications.ts`](../src/valeriaNotifications.ts) (9:00 / 13:00 /
17:00 / 20:00, cada una activable por separado tras GEN-01). Duplicar ese
calendario dentro de un ESP32 crea dos fuentes de verdad que se desincronizan en
cuanto el adulto cambia una franja.

En v1, Lúa despierta y hace su animación de llamada **cuando la app se lo dice**,
en el mismo instante en que dispara la notificación local. Cubre el caso real
(niño y tableta en la misma casa) y cuesta cero hardware. El caso «la tableta
está apagada y Lúa llama sola» se aplaza a v2 con RTC externo, y entonces la app
provisiona las franjas por BLE (característica `CFG`, §6) en lugar de que el
firmware las invente.

**D-4 · Las tres placas siguen siendo instrumentos de laboratorio, no producto.**
Ninguna es entregable a un niño: batería LiPo accesible, bordes vivos, sin
marcado. Lo que se valide en Fase 0/1 es sobre mesa y en manos de adultos (§13,
R-6).

---

## 4. Presupuesto de latencia

El requisito del borrador es «< 1 s tras la validación del acierto». Con eso no
se puede diseñar: hay que saber dónde se va el tiempo y qué se puede perder.
Objetivo real de trabajo: **≤ 300 ms** desde que la app fija el veredicto hasta
que la cara empieza a cambiar. Por encima de ~400 ms el niño ya no lo lee como
consecuencia de lo que hizo.

| Tramo | Presupuesto | Nota |
| :--- | ---: | :--- |
| Veredicto en JS → llamada al puente | 5 ms | síncrono, sin trabajo pesado |
| Puente JS → nativo (ble-plx) | 10 ms | write **without response** |
| Espera al siguiente intervalo de conexión | 30-50 ms | negociado; pedir 30 ms al conectar |
| Radio + pila BLE en el ESP32 | 10 ms | |
| Despacho en firmware → primer frame | 20 ms | tabla de opcodes, sin parsing de texto |
| Transferencia SPI del primer frame | 25 ms | 115 KB @ 40 MHz |
| **Total** | **~100-120 ms** | holgura 3× sobre el objetivo |

Dos consecuencias de diseño que salen de esta tabla:

- **El comando de refuerzo va sin confirmación** (write without response). Pedir
  ACK duplica el peor caso y no aporta nada: si se pierde una celebración, no
  pasa nada. Los comandos de **seguridad** (§5) sí van con confirmación, porque
  ahí sí importa.
- **La conexión se mantiene abierta durante todo el ejercicio.** Conectar cuesta
  entre 300 ms y varios segundos (escaneo, negociación, descubrimiento de
  servicios); hacerlo en el instante del acierto rompe el presupuesto. El enlace
  se abre al entrar en la pantalla del ejercicio y se cierra al salir.

Estos números son teóricos. La Fase 0 los mide con un contador en el firmware
que enciende un pin al recibir el opcode; sin esa medición, la tabla es una
hipótesis.

---

## 5. Arquitectura: capacidades por concesión, no interruptores

Aquí es donde este plan se separa más del borrador, y es lo que más barato sale
de acertar ahora.

El borrador plantea un **comando de silencio**: la tableta manda «entra en modo
clínico» al abrir `VoiceAnalysis`. El fallo de ese diseño es el estado por
omisión. Si el comando se pierde, si la app se cierra de golpe, si el firmware
se reinicia por un brown-out a mitad de sesión, o si alguien enciende a Lúa
cuando la audiometría ya ha empezado, el aparato **se queda en el estado
ruidoso**. La seguridad no puede depender de que un mensaje llegue.

**Inversión: Lúa arranca callada y quieta siempre, y cualquier capacidad que
pueda interferir se concede por tiempo limitado.**

```
                          ┌──────────────────────────────┐
   arranque / reset ─────►│  REPOSO  (silenciosa, quieta)│◄──── caducidad
   pérdida de enlace ────►│  cara neutra, brillo bajo    │◄──── fin de sesión
   watchdog vencido ─────►└──────────────┬───────────────┘
                                         │  CONCEDER(cap, ttl)  ← solo la app
                                         ▼
                          ┌──────────────────────────────┐
                          │  ACTIVA  (expresión, brillo) │
                          │  ttl ≤ 60 s, renovado por    │
                          │  latido cada 10 s            │
                          └──────────────────────────────┘
```

- **REPOSO es el estado seguro y es el estado por defecto.** No hay ningún camino
  —ni fallo, ni desconexión, ni reinicio— que lleve a Lúa a estado ACTIVA sin un
  comando explícito y reciente de la app.
- **Toda concesión caduca.** La app renueva con un latido cada 10 s mientras la
  pantalla del ejercicio está en primer plano. Si la app se cierra, si el
  Bluetooth cae, si el usuario se va al menú: en ≤ 60 s Lúa está en reposo sin
  que nadie tenga que acordarse de apagarla.
- **Las capacidades son independientes: visual, sonora y de motor.** La de motor
  no existe en v1 (no hay servos y no los va a haber, §2.3). La **sonora** existe
  y es la vía por la que entra el zumbador de D-2: se concede aparte de la
  visual, caduca igual, y el firmware topa el volumen aunque la app pida más. Que
  se conceda por separado es lo que permite —si algún día hiciera falta— dejar a
  Lúa mostrando el pictograma y callada, sin inventar un modo nuevo.
  **Aplicado el 14/8/2026 (D-L):** la máscara viaja en el byte alto del parámetro
  de `GRANT`, y `SAFE`/`MUTE` la quita sin apagar la pantalla. Ese «si algún día
  hiciera falta» era hoy: es lo que VIA+ necesita durante la /a/ sostenida.
- **El comando de silencio clínico sigue existiendo**, con confirmación
  obligatoria, pero como cinturón sobre los tirantes: revoca toda concesión al
  instante y bloquea nuevas concesiones hasta un desbloqueo explícito. No es el
  control primario (§8).

> ⚠ **Pendiente de cerrar: qué renueva exactamente el latido.** Hay hoy dos
> comportamientos distintos en dos repositorios, y es el modo de fallo del §6.3
> aplicado a la máquina de estados en vez de a la tabla de opcodes:
>
> | Dónde | Al llegar un `HEARTBEAT` |
> | :--- | :--- |
> | `firmware/lua/src/main.cpp` (Fase 0) | la concesión vuelve **al máximo, 60 s** |
> | `lua-firmware` · `core/src/device.cpp` | la concesión vuelve **al TTL que se concedió** |
>
> Las dos cumplen el «≤ 60 s» de arriba. La diferencia se ve con una concesión
> corta: con la primera, un `GRANT(3)` seguido de un latido deja al aparato vivo
> un minuto entero; con la segunda, tres segundos. La segunda cumple además lo
> que la app creyó estar pidiendo, y es la que recomiendo fijar — pero se decide
> aquí y se propaga, no al revés.

---

## 6. Protocolo BLE

### 6.1 Servicio GATT

Un solo servicio primario, UUID de 128 bits propio del proyecto (a generar, no
reutilizar ninguno de ejemplo de Espressif). Cuatro características:

| Característica | Propiedades | Tamaño | Contenido |
| :--- | :--- | ---: | :--- |
| `CTRL` | Write Without Response | 8 B | opcode + parámetros. Camino de latencia. |
| `SAFE` | Write **with** Response | 2 B | silencio clínico, revocación, desbloqueo y **silencio sonoro** (`MUTE`, D-L). |
| `STATE` | Read + Notify | 8 B | modo, capacidades vivas, batería, versión fw, **versión de catálogo**. |
| `CFG`   | Write with Response | ≤ 20 B | brillo, volumen, catálogo, franjas (v2). |

**Ninguna característica transporta texto, y el pictograma no lo cambia.** No hay
campo de cadena en el protocolo: sigue siendo la garantía estructural de Zero-PHI.
Un nombre de paciente no puede llegar a Lúa porque no existe el sitio donde
meterlo.

Esto es lo que hace compatibles las dos cosas que parecían chocar. **El dibujo ya
está en el aparato**: los 66 pictogramas van grabados en flash en tiempo de
compilación, igual que las caras (§10). Por el cable viaja **el número del
pictograma**, no el pictograma. La app no manda «cuchara sucia»: manda `PICTO(37)`
y Lúa busca el 37 en su catálogo. Un id de catálogo no es contenido clínico ni es
identificable: es el mismo 37 para todos los pacientes del mundo.

### 6.2 Trama de `CTRL`

**La trama se queda en cuatro bytes** (corregido el 14/8/2026; antes aquí ponía
que subía a ocho).

```
byte 0   : versión de protocolo         — el firmware rechaza lo que no conoce
byte 1   : opcode
byte 2-3 : parámetro (u16 little-endian)
```

El motivo por el que se creyó que hacían falta ocho era Pares Mínimos, que en la
vuelta de comprensión pinta **dos** fichas a la vez
(`ValeriaMinimalPairsScreen.tsx`) y parecía necesitar dos ids de 16 bits. No los
necesita: con 66 pictogramas hoy y ~148 previstos (D-H), **un id cabe de sobra en
un byte**, así que `PICTO_PAIR` manda el de la izquierda en el byte bajo y el de
la derecha en el alto, exactamente igual que `AWARD` con glifo y rango.

Queda un límite que hay que escribir para que nadie lo cruce sin verlo: **el
catálogo no puede pasar de 256 fichas** sin ensanchar la trama, y ensancharla es
subir `version` y dejar fuera a los aparatos ya flasheados. Con 148 previstos hay
margen, pero es el techo real y no una cifra redonda.

Ensanchar sin necesitarlo tenía un coste que ahora nos ahorramos: cuatro bytes es
lo que el firmware ya valida (`len < 4`), lo que ya prueban los 45 722 tests del
firmware y lo que ya decodifica VIA+.

| Opcode | Nombre | Parámetros | Efecto |
| ---: | :--- | :--- | :--- |
| `0x01` | `PHASE` | fase 0-3 | espeja `TurnPhaseStrip`: escucha / repite / veredicto / misión |
| `0x02` | `VERDICT` | nivel 0-2 | celebración proporcional al `MatchLevel` del ASR (0 no coincide · 1 casi · 2 lo dijo) |
| `0x03` | `CELEBRATE` | intensidad 0-2 | cierre de sesión |
| `0x04` | `IDLE` | — | cara neutra |
| `0x05` | `CALL` | — | animación de llamada del Modo Vínculo (D-3) |
| **`0x06`** | **`AFFECT`** | **emoción 0-7** | **una de las ocho emociones puras (§6.2c)** |
| **`0x07`** | **`PICTO`** | **id de catálogo · `0xFFFF` la quita** | **la ficha del ejercicio, centrada** |
| **`0x08`** | **`AWARD`** | **glifo 0-8 (byte bajo) · rango 0-4 (byte alto)** | **la insignia CONCRETA que se acaba de ganar** |
| **`0x09`** | **`LEVEL`** | **nivel 1-12** | **el nivel, en doce segmentos del borde** |
| **`0x0A`** | **`PICTO_PAIR`** | **id izq. (byte bajo) · id der. (byte alto)** | **RESERVADO · dos fichas para la vuelta de comprensión** |
| `0x10` | `GRANT` | **ttl en s 1-60 (byte bajo) · máscara de capacidades (byte alto)** | concede capacidades (§5). Máscara `0x00` = solo visual. La sonora nunca es implícita (D-L) |
| `0x11` | `HEARTBEAT` | — | renueva la concesión viva |
| `0xF0` | `BENCH` | — | Fase 0. No se usa en producción |

⚠ **Esta asignación se corrigió el 14/8/2026, y merece un párrafo porque estuvo a
punto de costar caro.** El firmware había implementado `0x06`–`0x09` con otro
reparto que el que este plan escribía: aquí `0x06` era `PICTO` y allí era
`AFFECT`, aquí `0x07` era `PICTO_PAIR` y allí `PICTO`. Dos documentos, los mismos
códigos, cosas distintas. Se decide **adoptar la asignación del firmware** —que es
la que está escrita, probada y con capturas— y `PICTO_PAIR` se muda a `0x0A`.

Que esto se pudiera arreglar sin romper nada es pura suerte de calendario:
**ningún aparato se ha flasheado todavía**. En cuanto se flashee el primero, la
regla de que los `code` no cambian nunca deja de ser una convención y pasa a ser
física. Los dos ficheros ya coinciden y el gate `--upstream` del firmware lo
comprueba en cada build.

Sobre `PICTO_PAIR`: el código queda **tomado y documentado, pero el firmware
todavía no lo dibuja** —lo ignora por el `default` de su switch, que es la salida
segura—. Se reserva ahora para que no lo ocupe otro opcode y para que el día que
Pares Mínimos lo necesite no haya que mover números.

Tres notas que evitan malentendidos caros:

- **`AWARD` sustituye al apaño anterior.** Hasta ahora la insignia y la subida de
  nivel viajaban las dos como `CELEBRATE(intensidad)`: en el cable no había forma
  de distinguir «ha ganado la racha de 14 días» de «ha subido a nivel 7». Ahora
  `AWARD` lleva glifo y rango —los mismos nueve glifos y cinco rangos de
  `ValeriaPixelArt.ts`— y `LEVEL` lleva la cifra. `CELEBRATE` se queda solo
  para el cierre de sesión. *(Se llamaba `BADGE` en las versiones anteriores de
  este plan; el nombre que quedó es el del firmware.)*
- **El parámetro de `VERDICT` es el nivel de coincidencia que ya calcula la app**,
  no una puntuación nueva. Lúa no interpreta: mapea nivel → animación. Si mañana
  cambia el algoritmo de scoring, Lúa no se entera.
- **`PICTO` no es camino de latencia, es camino de sincronía.** La ficha tiene que
  estar en el cristal **antes** de que suene la consigna, no 100 ms después del
  veredicto. Se manda al preparar el ítem, no al resolverlo, y por eso no compite
  con el presupuesto de §4. Lo que sí hay que medir en Fase 0 es cuánto tarda un
  pictograma completo en pintarse, que es más que una cara: cambia el fotograma
  entero.

### 6.2b Geometría: qué cabe en un círculo de 240

El panel es circular y la aritmética manda. El cuadrado inscrito en un círculo de
240 px mide 240/√2 = **169 px de lado**: cualquier dibujo mayor pierde las
esquinas.

- **`PICTO`** — una ficha de **72×72** centrada, con su anillo turquesa. No es el
  máximo que cabe: es el tamaño que el arte de 24×24 usa hoy, a 3 px por celda.
  **DECIDIDO por Frank el 14/8/2026: se queda en 72.** El máximo que no se
  recorta sigue siendo 168, y subir a él es cambiar una constante (`cell` de 3 a
  7 en `drawPicto`), así que la vuelta atrás está siempre a mano.
- **`PICTO_PAIR`** — sin geometría todavía: el opcode está reservado en `0x0A` y
  el firmware no lo dibuja. Cuando se dibuje, dos de 96×96 con 16 px de
  separación son 208 px de ancho y la cuerda del círculo a esa altura mide 218,
  así que entran justos.

**Y aquí está el número incómodo, que conviene no perder de vista.** El panel real
mide 32 mm, así que una ficha de 72 px de los 240 son **9,6 mm de dibujo**. A 168
px serían 22. Nadie ha visto todavía un pictograma en el cristal —no hay placa—,
así que **si un niño con retraso del lenguaje distingue «cuchara limpia» de
«cuchara sucia» a 9,6 mm es una pregunta abierta**, y es la que decide si espejar
el estímulo (D-1) sirve para algo. Es lo primero que hay que mirar en cuanto haya
placa, antes que la latencia.

**Ninguno de estos números está comprobado en hardware.** Son geometría, no
medición.

### 6.2c `AFFECT`: las ocho emociones puras

`AFFECT(0…7)` es el opcode que estrena `0x06`, y es **otra cosa que el resto de la
tabla**: no dice nada del ejercicio. No hay acierto ni fallo detrás. Es estado de
ánimo de la mascota.

| Param | Emoción | Param | Emoción |
| ---: | :--- | ---: | :--- |
| 0 | alegría | 4 | esperanza |
| 1 | amor | 5 | orgullo |
| 2 | gratitud | 6 | inspiración |
| 3 | tranquilidad | 7 | diversión |

El firmware ya las dibuja las ocho, cada una con su física de partículas, y están
en la hoja de contactos del otro repositorio. Un parámetro que no existe **vuelve
a la cara atenta** en vez de adivinar, y sigue haciendo falta concesión viva como
para cualquier otro gesto.

Que no digan nada del ejercicio es justo lo que las mantiene lejos del **R-4**
—«ya que tiene pantalla, que muestre el resultado»—. Una mascota que pone cara
según el acierto convierte cada intento en un juicio; una que tiene estados de
ánimo propios, no.

Y trae un coste que hay que medir: hasta **trescientas partículas por frame** que
ningún ESP32-C3 ha dibujado todavía. El peor caso de la Fase 0 es `AFFECT(0)`, no
la cara neutra. Está recogido como **R-11**.

### 6.3 Una sola fuente de verdad para la tabla

La tabla de opcodes la consumen tres sitios: el firmware (C), Valeria+ (TS) y
VIA+ (TS, en otro repositorio). Tres copias a mano se desincronizan; ha pasado
antes en este proyecto con cosas más pequeñas.

Propuesta: el firmware vive en **`firmware/lua/`** dentro de este repositorio, la
tabla en un `protocol.json` y un script `scripts/build-lua-protocol.js` genera
`src/valeriaLuaProtocol.ts` y `firmware/lua/include/lua_protocol.h`. El gate de
CI comprueba que lo generado coincide con lo versionado (§11). VIA+ consume el
`.ts` generado copiándolo con su cabecera de origen, o por paquete, cuando se
decida.

### 6.4 Emparejamiento y seguridad

Un periférico BLE en una consulta es un aparato al que **cualquier teléfono de la
sala de espera puede conectarse** si se deja abierto. No hay datos que robar
—ese es el punto de Zero-PHI—, pero sí una mascota que se puede hacer bailar en
mitad de una evaluación.

- Anuncio BLE solo tras **pulsación física** del botón BOOT/usuario, y durante
  120 s. Fuera de esa ventana, Lúa no anuncia.
- **Bonding** (LE Secure Connections, Just Works es suficiente sin teclado ni
  pantalla de dígitos): tras el primer emparejamiento, Lúa acepta escrituras solo
  del central vinculado.
- «Olvidar Lúa» en Ajustes borra el bonding en los dos extremos; en el firmware,
  pulsación larga del botón.
- Sin OTA en v1. Actualizar es enchufar el USB-C. Una superficie de actualización
  remota en un aparato que va a estar en un hospital es riesgo gratis mientras
  haya cinco unidades.

---

## 6.5 Dónde engancha: **en todos los ejercicios**

*(Reescrita el 13/8/2026, corrección C-2. La versión anterior enumeraba tres
enganches y dejaba fuera los 37 ejercicios de los cuatro bloques. El espejo no es
una función de Pares Mínimos: es cómo funciona Lúa.)*

**Inventario real de la app**, contado del árbol, no de memoria:

| Superficie | Cuántos | Pantalla | Ficha visual hoy |
| :--- | ---: | :--- | :--- |
| Audición | 18 | `ValeriaExercisePlayerScreen` | mini-juegos visuales en algunos ítems |
| Lenguaje | 7 | `ValeriaExercisePlayerScreen` | ídem (MS-1, MS-2, SE-2) |
| TEA | 6 | `ValeriaExercisePlayerScreen` + `ValeriaPragmaticBreak` | ídem |
| Dislexia | 6 | `ValeriaExercisePlayerScreen` | ídem |
| Pares Mínimos | banco propio | `ValeriaMinimalPairsScreen` | **`FichaVisual`, hasta dos a la vez** |
| Expansión Semántica | banco propio | `ValeriaSemanticExpansionScreen` | **`FichaVisual`, estímulo + opciones** |
| Test de Ling | 1 | `ValeriaLingTestScreen` | no |
| Cápsula TPR | — | `ValeriaTPRCapsule` | no |
| Realidad aumentada | — | `ValeriaArLauncherScreen` | modelo 3D, no ficha |

**La regla, en una línea: todo lo que hoy ve el niño en la tableta, lo ve en Lúa.**
No hay lista de ejercicios «compatibles con Lúa»; si la hubiera, el adulto tendría
que acordarse de cuáles son, y eso es exactamente el tipo de detalle que se
incumple en consulta.

De ahí salen tres capas, y cada una engancha en un sitio distinto del código:

**Capa 1 · el turno — las siete pantallas.** `PHASE` y `VERDICT` cuelgan de
`TurnPhaseStrip` en `ValeriaVoiceUI.tsx`, que ya es compartido. Un solo `useLuaPhase`
ahí y lo heredan todas las pantallas que lo usan, sin tocarlas una a una. Es el
enganche más barato del plan y el que cubre más superficie.

**Capa 2 · el estímulo — donde hay ficha.** `PICTO` / `PICTO_PAIR` desde
`FichaVisual`, que es el componente que ya decide qué dibujo va. Un solo enganche
ahí y espeja todo lo que pase por él.

Hoy `FichaVisual` solo se usa en Pares Mínimos y Expansión Semántica (verificado:
son las dos únicas pantallas que la importan). Los mini-juegos del player —MS-1
«uno/muchos», MS-2 «niño/niña», SE-2 con opciones— dibujan sus propias tarjetas
con emoji crudo y por eso hoy no se espejarían.

**D-H lo cierra: pasan a pictogramas.** No es trabajo de firmware sino de
contenido —hay que dibujar del orden de 82 pictogramas y darles clave—, y es la
partida más grande del plan. Va en la Fase 5 con su propia cuenta (§14, D-H). La
ventaja de hacerlo por aquí es que **no hay que tocar el player**: en cuanto una
tarjeta pasa por `FichaVisual`, el espejo le sale gratis.

**Capa 3 · el premio — el cierre, sea cual sea el ejercicio.** `AWARD` y `LEVEL`
desde `registerSession()` en `valeriaGamification.ts`, que ya devuelve `levelUp`,
`level` y `newBadges`. Como todos los ejercicios cierran por ahí, **las insignias
y el nivel se replican en Lúa en los 37 + los bancos, sin excepción y sin trabajo
por ejercicio.** Es la parte de la petición de Frank que sale entera de un solo
punto de enganche.

**La excepción, y hay que dejarla escrita: TEA · quiebre pragmático.** Ahí Lúa se
queda en `IDLE` y **no** asiste al niño; solo reacciona si repara la comunicación
**hacia el adulto**. Si Lúa reaccionase al niño durante el quiebre se convertiría
en la salida fácil y el ejercicio mediría lo contrario de lo que pretende. Es la
única pantalla donde el espejo se apaga a propósito, y no es una limitación
técnica: es la tarea.

**Fuera de la sesión**

| Momento | Opcode | Nota |
| :--- | :--- | :--- |
| Insignia ganada al cerrar | `AWARD(glifo, rango)` | la concreta, no un «celebra fuerte» |
| Subida de nivel | `LEVEL(nivel, progreso)` | |
| Cierre de sesión | `CELEBRATE(intensidad)` | |
| Hora de la sesión | `CALL` | va con la notificación local que ya existe; suple la falta de RTC (D-3) |

## 7. Superficie de integración en Valeria+

Este repositorio contiene **solo Valeria+**. Lo de VIA+ es un contrato (§6.3, §8),
no código que se escriba aquí.

| Archivo | Qué pasa | Nuevo/Toca |
| :--- | :--- | :--- |
| `src/valeriaLuaBridge.ts` | **Única superficie** que ve el resto de la app: `isLuaAvailable()`, `connect()`, `send(opcode)`, `grant()`, `disconnect()`. Carga `react-native-ble-plx` con `require()` dentro de `try`, igual que [`valeriaArBridge.ts`](../src/valeriaArBridge.ts) y `valeriaNoise` con expo-audio. Sin módulo → `false` → nadie ve nada roto. | nuevo |
| `src/valeriaLuaProtocol.ts` | Generado desde `protocol.json`. No se edita a mano. | nuevo, generado |
| `src/valeriaLuaSession.ts` | El latido de §5 y la reconexión con backoff. Aislado del puente para poder probarlo sin radio. | nuevo |
| `src/ValeriaVoiceUI.tsx` | `TurnPhaseStrip` ya recibe `active`; se añade un `useLuaPhase(active)` en el propio componente. Un solo punto y todas las pantallas que lo usan heredan el espejo del turno sin tocarse (§6.5, capa 1). | toca |
| `src/ValeriaPictograms.tsx` | `FichaVisual` emite `PICTO` con el id de catálogo de la clave que está pintando. El espejo del estímulo sale del mismo componente que ya decide qué dibujo va (§6.5, capa 2). | toca |
| `src/valeriaLuaCatalog.ts` | Generado: clave de pictograma → id de catálogo. Los ids **no cambian nunca**, por lo mismo que los opcodes: un aparato flasheado se queda con los suyos. Solo se añade al final. | nuevo, generado |
| `src/valeriaGamification.ts` | `registerSession()` ya devuelve `SessionReward` con `level`, `levelUp` y `newBadges`. Ahí salen `AWARD`, `LEVEL` y `CELEBRATE` — y como todos los ejercicios cierran por aquí, cubre los 37 de golpe (§6.5, capa 3). | toca |
| `src/valeriaNotifications.ts` | Al disparar el recordatorio local, si hay enlace, `CALL` (D-3). | toca |
| `src/ValeriaSettingsScreen.tsx` | Tarjeta de Lúa: emparejar, estado, batería, brillo, olvidar. **Solo se renderiza si `isLuaAvailable()`.** | toca |
| `src/ValeriaBlockIcons.tsx` | Icono `lua` en el set propio: rejilla 24, grosor 1,9, terminaciones redondeadas. Nada de 🐱 (regla 5). | toca |
| `src/i18n/strings.es.ts`, `strings.en.ts` | Cadenas de la tarjeta de Ajustes. | toca |
| `src/valeriaTelemetry.ts` | Eventos `lua_link` (conectado/perdido) y latencia medida de `VERDICT`. Sin PHI: son métricas del enlace. | toca |
| `plugins/withValeriaLua.js` | Permisos Bluetooth y `minSdk`, siguiendo el patrón de `withValeriaAR.js`. | nuevo |
| `app.json` | Permisos nuevos (§9). | toca |
| `site/privacidad.html`, `site/privacy.html` | Bluetooth en §3.3 «Permisos y datos del dispositivo», en los dos idiomas. Bloqueante (CLAUDE.md). | toca |
| `scripts/build-lua-catalog.js` | Rasteriza los 66 pictogramas y los empaqueta para flash. No se corre en CI: es como `build-brand-assets.js`. | nuevo |
| `scripts/check-lua-protocol.js`, `scripts/check-lua-mic.js`, `scripts/check-lua-catalog.js` | Gates (§11). | nuevos |
| `.github/workflows/android.yml` | Un gate nuevo (`check-lua-catalog`) y uno renombrado (`check-lua-mute` → `check-lua-mic`). Ver §11. | toca |

**Nada de feature flags** (regla 3). La visibilidad la decide la sonda
`isLuaAvailable()`, exactamente como el bloque de RA: si el módulo nativo no está
o no hay adaptador Bluetooth, la tarjeta no se renderiza. Merge y visibilidad son
la misma cosa.

---

## 8. VIA+: la integración correcta es la ausencia

VIA+ es SaMD **Clase IIa**. Todo lo que pueda alterar la validez de una medición
entra en el expediente técnico y en el análisis de riesgo ISO 14971.

El borrador propone que, al entrar en `VoiceAnalysis`, `VerbalAudiometry` o
`ProsodyAnalysis`, la tableta mande a Lúa a modo silencio. Eso convierte el
silencio en un **control de riesgo implementado por software de un dispositivo
externo no verificado**, y obliga a demostrar, para el marcado, que ese comando
llega siempre, que el firmware siempre lo obedece y que el fallo es detectable.
Es caro y no hace falta.

**Postura recomendada:**

1. **Lúa no está presente durante la medición.** Es un requisito de procedimiento
   en el protocolo de exploración, no un requisito de software: la mascota no
   entra en la cabina / sala de campo libre. Un aparato ausente no puede
   interferir, y eso se audita mirando, no leyendo logs.
2. **La única integración de VIA+ en v1 es la recompensa de cierre**, en
   `ResultadosFinal`, con la exploración ya terminada y los datos ya sellados.
   Ahí Lúa no puede contaminar nada.
3. El comando `SAFE` de silencio se implementa igual, como defensa en profundidad
   para el caso de que alguien la traiga puesta, y VIA+ lo emite al abrir
   cualquier pantalla de captura. Pero **no se declara como control de riesgo**:
   el control es la ausencia física.
4. Si en algún momento se quiere refuerzo *durante* la audiometría infantil —hay
   argumento clínico para ello, es literalmente lo que hace un VRA con un juguete
   iluminado—, entonces Lúa deja de ser un accesorio decorativo y hay que
   plantearse en serio si es parte del dispositivo. Esa conversación se tiene con
   el organismo notificado, no en un `.md`. **Fuera de v1.**

Con esta postura, Lúa v1 está **ausente durante la medición y sin capacidad de
influir en ningún resultado**: la posición regulatoria más barata que existe.

Y conviene subrayar por qué basta con eso: **la ausencia hace innecesaria
cualquier restricción sonora**. Si el aparato no está en la sala, no contamina
ninguna medición, suene o no suene. Ese era el error de la versión anterior de
este plan (C-3): usaba el cinturón *y* los tirantes, y los tirantes le quitaban
una función a Valeria+ —un producto de rehabilitación, donde el refuerzo sonoro
es legítimo— para proteger una medición de otro producto que ya estaba protegida
por diseño.

**Esta sección describe lo que VIA+ hace con Lúa. No es una fuente de requisitos
para Valeria+.** Nada de aquí baja a §1, §3, §5, §10 ni §11.

---

## 9. Permisos, privacidad y Play Console (bloqueante)

Añadir BLE a una app del programa *Familias* no es gratis.

**Permisos Android necesarios:**

```
BLUETOOTH_SCAN     (API 31+)  + android:usesPermissionFlags="neverForLocation"
BLUETOOTH_CONNECT  (API 31+)
```

**El problema del `minSdk 24`.** En Android 6 a 11 (API 23-30), escanear BLE
exige `ACCESS_FINE_LOCATION`. Pedir ubicación precisa en una app infantil es
disparar la revisión de *Permisos sensibles* de Play y tener que justificarlo en
el formulario de Seguridad de los datos, para una función accesoria. Tres
salidas, en orden de preferencia:

1. **Ofrecer Lúa solo en Android 12+.** `isLuaAvailable()` devuelve `false` por
   debajo de API 31. La tarjeta no aparece, no se pide nada, no se declara nada.
   Es una línea de código y cierra el asunto. **Recomendada.**
2. **`CompanionDeviceManager`** (API 26+): el sistema muestra su propio diálogo de
   selección y permite asociar sin permiso de ubicación. Cubre Android 8-11, pero
   `react-native-ble-plx` no lo expone: hay que escribir un módulo nativo Kotlin
   pequeño. Coste real de días, para ganar unos pocos dispositivos del piloto.
3. Pedir ubicación en dispositivos antiguos. **Descartada.**

**Lo que hay que actualizar en el mismo cambio** (CLAUDE.md, sección del sitio
legal): `site/privacidad.html` y `site/privacy.html`, §3.3, diciendo la verdad
completa —Bluetooth se usa para conectar con un accesorio local, no se recoge
ubicación, no sale nada del dispositivo, el accesorio no recibe datos personales—
**y** el formulario de *Seguridad de los datos* de Play Console. Google contrasta
las dos declaraciones entre sí.

**Marcado del aparato.** Un producto con radio que se pone en manos de un niño
está sujeto a RED (2014/53/UE) y, si se considera juguete, a EN 71-1/-2/-3, más
IEC 62368-1 por la batería de litio. Una placa de desarrollo con una LiPo
colgando no cumple nada de eso. Para v1 esto se resuelve por procedimiento
(§13, R-6), no por certificación; para cualquier cosa que se reparta, no.

---

## 10. Identidad visual de Lúa

**El catálogo de caras es un activo propio** (regla 5). Nada de emoji, ni de
sprites de terceros. El mismo criterio de `ValeriaBlockIcons.tsx` —trazo puro,
grosor constante, terminaciones redondeadas— llevado a un canvas circular de
240×240 con el color de marca (`#00c4be`).

- **Formato:** los frames se generan en tiempo de compilación a partir de fuente
  vectorial propia y se empaquetan como bitmaps en flash. 4 MB dan de sobra para
  un catálogo de 6-8 expresiones con 8-12 frames cada una.
- **Catálogo de caras v1:** neutra, atenta (fase escucha), animando (fase
  repite), celebración corta, celebración larga, dormida, llamada, sin conexión,
  bloqueada.
- **La pantalla es circular y solo se ve Φ 32,4 mm.** Una cara diseñada en
  rectangular pierde las esquinas. Se diseña en círculo desde el primer boceto.

### 10.1 El catálogo no son solo caras (13/8/2026, corrección C-1)

En flash van **tres familias**, y las tres salen de activos que ya existen en
este árbol. Ninguna se dibuja nueva: es el mismo dibujo que ve el niño en la
tableta, que es lo que significa espejo.

| Familia | Cuántos | Fuente en el árbol | Cómo llega a flash |
| :--- | ---: | :--- | :--- |
| Pictogramas | **66 hoy → ~148** (D-H) | `src/ValeriaPixelArt.ts` (`PICTOS`) | la matriz de 24×24 tal cual |
| Insignias | **9 glifos × 5 rangos** | `src/ValeriaPixelArt.ts` (`AWARD_GLYPHS`, `PIXEL_TIERS`) | la matriz de 24×24 tal cual |
| Niveles | **12** | `valeriaGamification.ts` (`LEVEL_NAMES`) | anillo de 12 segmentos |
| Caras | 22 | `src/ValeriaCatPixel.tsx` | como hasta ahora |

**Nada se rasteriza ya, y eso se llevó por delante el problema más gordo de esta
sección.** Hasta el 14/8/2026 los pictogramas eran SVG que había que bajar a
bitmap en dos tamaños, y el presupuesto de flash era el eje del diseño: ~2,5 MB
en crudo con los 66, ~5,5 MB con los ~148 de D-H —más que la flash entera de la
placa—, y todo el apartado giraba en torno a comprimir con RLE y a qué recortar
si no cabía.

Con el arte de 24×24 (D-7) eso desaparece. Las cifras, contadas y no estimadas:

| | En crudo | De los 4 MB de la placa |
| :--- | ---: | ---: |
| 66 pictogramas × 24×24 | **37,1 KB** | 0,9 % |
| 9 insignias × 24×24 | **5,1 KB** | 0,1 % |
| **Total hoy** | **42,2 KB** | **1,0 %** |
| Con los ~148 de D-H | 88,3 KB | 2,2 % |

Sesenta veces menos de lo que se presupuestaba. **No hace falta comprimir, ni
paleta indexada, ni RLE, ni recortar el catálogo**, y la flash externa —que no
cabía en el puerto de expansión— deja de hacer falta para esto.

El rango no se guarda cinco veces: la matriz del glifo es una, y las celdas `a` y
`b` toman el color del rango al dibujar, igual que hace la app. Nueve glifos, no
cuarenta y cinco.

**Los nombres de nivel («Gatita», «Gata Legendaria») NO viajan.** Lúa muestra la
cifra y el anillo. El nombre es texto, y el protocolo no tiene campo de texto
(§6.1) — ni le hace falta: el nombre lo lee el adulto en la tableta.

> **Presupuesto de flash — RESUELTO el 14/8/2026, y conviene dejar escrito por
> qué, porque este recuadro fue durante días el mayor riesgo técnico del plan.**
>
> Decía que 66 pictogramas × (168² + 96²) a 8 bits eran ~2,5 MB, que con los ~82
> de D-H serían ~5,5 MB —más que la flash entera—, y que sin comprimir con RLE no
> cabía. De ahí salían tres salidas de emergencia (bajar a 128×128, guardar solo
> el tamaño de par, recortar el catálogo) y un aviso de que si no entraba había
> que **cambiar de placa** y revisar §3 y §4 enteros.
>
> Nada de eso hace falta. El arte de 24×24 ocupa **42,2 KB, el 1 % de la flash**,
> y 88 KB con los ~148 de D-H. No hay que comprimir, no hay que recortar, no hay
> `build-lua-catalog.js` que escribir para medir un ratio de compresión, y la
> flash externa —que no cabía en el puerto de expansión de dos I/O— deja de ser
> una conversación.
>
> La lección, que es la que vale para la próxima: el problema no era de
> compresión, era de **resolución equivocada**. Se estaba presupuestando el
> tamaño de un dibujo pensado para una tableta metido a la fuerza en un panel de
> 32 mm. El coste de haberlo visto tarde fue documentación, no código.

### 10.2 El pictograma en el cristal: lo que hay que mirar antes de creérselo

Un pictograma pensado para una tableta y otro para un cristal circular de 32 mm no
son el mismo problema. **La mitad de esta lista se cayó sola el 14/8/2026**, y la
otra mitad no la contesta ningún emulador.

Lo que dejó de ser un problema al pasar a matrices de 24×24 dibujadas a mano:

- ~~contorno de 5 unidades sobre 100 que a 96 px son ~5 px~~ → el contorno es
  ahora **una celda**, dibujada, no escalada;
- ~~tres pictogramas con `<text>`, que se rasterizan con la tipografía del
  navegador que los genera~~ → **no hay `<text>`**: `numero-ocho` y `numero-cero`
  son píxeles como todo lo demás, así que el dibujo no cambia con la máquina que
  lo compila;
- ~~dieciséis con opacidad parcial que hay que aplanar~~ → la paleta es de 21
  colores planos y **no hay canal alfa** que aplanar.

Lo que sigue abierto, y es lo que decide si la D-1 sirve de algo:

- **El tamaño aparente.** La ficha ocupa 72 px de los 240, o sea **9,6 mm** en el
  cristal. Nadie ha visto un pictograma en la placa porque no hay placa.
- **Los pares de contraste son el caso duro.** «Cuchara limpia» y «cuchara sucia»
  se distinguen por detalles pequeños sobre el mismo objeto, y es justo el par que
  ES-12 necesita. Si no se leen a 9,6 mm, hay dos palancas antes de rendirse:
  subir `cell` de 3 a 7 —168 px, 22 mm, es una constante— o dejar esa vuelta solo
  en la tableta.

**Es lo primero que hay que mirar en cuanto haya placa, antes que la latencia.**

**Identidad · decidido (Frank, 9/8/2026): la mascota es la GATA, en píxel art.**
El oso queda retirado de la app. Ya está hecho en el árbol:
`ValeriaCatPixel.tsx` (gata negra tipo smoking, rejilla de 32 de lado y dos
poses —cabeza sola por debajo de 90 px, cuerpo entero por encima—) sustituye a
a la mascota anterior en Bienvenida, Créditos, hub y el distractor de doble
tarea (`ValeriaDistractorCat`), y los doce niveles pasan a «Gatita → Gata
Legendaria».

**Estado de la migración de marca (10/8/2026): completa.** Pantallas, nombres de
nivel, copy del distractor en los tres bancos (es · gl · eu) e **icono, icono
adaptativo, splash y portada del manual**, los cuatro generados del mismo sprite
con `npm run build:brand`.

Esto simplifica el hardware: **el catálogo de caras de la pantalla circular sale
de la misma rejilla que la mascota de la app.** El píxel art no es aquí un gusto
estético, es el formato nativo de un panel de 240×240 — y significa que la cara
de Lúa en el aparato y la de la app son literalmente el mismo dibujo, no dos
interpretaciones que se van separando versión a versión.

**Nombre · decidido (Frank): Lúa, y es el de la mascota** (§14, D-B cerrada).

---

## 11. Garantías de no regresión y gates de CI

`android.yml` corre hoy **doce pasos de gate** antes del typecheck (once
`check-*.js` más `build-lua-protocol.js --check`), y **dos ya son de Lúa**. Lo
que cambia con esta revisión:

| Gate | Estado | Qué hace |
| :--- | :--- | :--- |
| `build-lua-protocol.js --check` | existe, sin cambios | las tres copias de la tabla no se separan |
| `check-lua-mute.js` → **`check-lua-mic.js`** | **renombrado y re-acotado** | prohíbe el micrófono, deja de prohibir el altavoz |
| **`check-lua-catalog.js`** | **nuevo** | ninguna clave de pictograma se queda sin sitio en Lúa |

O sea: **un gate nuevo y uno reescrito**, no tres nuevos. Los tres persiguen el
mismo modo de fallo —que la app y el aparato entiendan lo mismo de forma
distinta— en tres capas: la tabla, el contenido y el hardware.

**`scripts/check-lua-protocol.js`** — regenera desde `protocol.json` y compara con
`src/valeriaLuaProtocol.ts` y `firmware/lua/include/lua_protocol.h`. Falla si
alguien tocó una tabla y no la otra. Es el gate que evita el bug caro del
proyecto: firmware y app entendiendo el mismo byte de forma distinta.

**`scripts/check-lua-mic.js`** — *(era `check-lua-mute.js`. Renombrado y
re-acotado el 13/8/2026, corrección C-3.)* Recorre las fuentes del firmware y
falla si aparece **entrada** de audio: I²S en modo RX, `i2s_read`, ADC de
micrófono. Es el equivalente a `check-asr-capture-guard.js`: convierte una
promesa del documento —«Lúa no escucha»— en algo que rompe el build si se
incumple. También sigue vigilando los servos.

> **Qué estaba mal.** El gate se llamaba `check-lua-mute` y bloqueaba también la
> **salida**: líneas 24-31, `tone()`, `ledcWriteTone`, `ledcAttachPin` e `I2S` en
> los dos sentidos. O sea que la petición de Frank —que Lúa tenga estímulos
> sonoros— rompía el build. Su nombre y su alcance decían cosas distintas, y las
> dos estaban importadas de un requisito de VIA+ (D-2). Micrófono y altavoz no
> son la misma cosa: **entrada prohibida para siempre, salida permitida y topada
> en volumen.**
>
> Cuidado con `i2s_driver_install` al re-acotarlo: la función es la misma para RX
> y TX y hoy casa por nombre. Hay que mirar el modo, no el símbolo, o el gate
> pasa de prohibir de más a no prohibir nada — que es el fallo peor de los dos.

**`scripts/check-lua-catalog.js`** — falla si una clave de `PICTOGRAMS_BY_KEY`
no tiene id en el catálogo de Lúa, si un id cambió de clave (un aparato flasheado
mostraría el dibujo equivocado), o si el número de glifos o rangos de insignia
dejó de casar con `ValeriaPixelAwards.tsx`. Es el mismo modo de fallo que
`check-lua-protocol.js`, aplicado al contenido en vez de a la tabla de opcodes:
que la app y el aparato entiendan el mismo número de forma distinta. Sin este
gate, añadir un pictograma nuevo a un banco deja al niño mirando una ficha en la
tableta y un hueco en Lúa, y nadie se entera hasta la consulta.

**Además:**
- El puente se carga con `require()` en `try`. Sin `react-native-ble-plx`, sin
  adaptador o en Expo Go, `isLuaAvailable()` es `false` y no se renderiza nada.
- Ningún camino del código clínico espera (`await`) una respuesta de Lúa. Los
  envíos son dispara-y-olvida con `catch` vacío deliberado. Una mascota apagada
  no puede colgar un ejercicio.
- La telemetría **no** cambia de esquema por Lúa: se añaden eventos nuevos, no se
  modifican los existentes, para no invalidar las exportaciones del piloto en
  curso.

---

## 12. Plan por fases

Sin fechas: cada fase abre cuando la anterior pasa su criterio. El cronograma de
10 semanas del borrador es razonable en esfuerzo, pero solo si Fase 0 confirma la
placa; si la latencia real sale mal, todo lo demás cambia y una fecha escrita hoy
solo sirve para incumplirla.

**Fase 0 · Banco de pruebas — ESCRITA Y LISTA PARA CORRER.**
Ya no es una descripción: está el firmware, el banco de medida y el
procedimiento. Falta la placa.

  · `firmware/lua/` — firmware mínimo con el servidor GATT, la máquina de
    estados de §5 **entera** (concesión con caducidad y latido), pin de traza y
    contador de fps. Medir la latencia de un firmware que luego llevará esa
    lógica encima no dice nada si la lógica no está, así que está desde el
    primer día.
  · `docs/lua-bench.html` — banco por **Web Bluetooth**: mide p50/p95/peor caso
    y lee los fps del aparato desde Chrome, sin compilar Valeria+. Es lo que
    permite decidir sobre el hardware antes de tocar la app.
  · `firmware/lua/README.md` — los cinco pasos, en orden, y la plantilla de lo
    que hay que anotar.

→ *Criterio de paso: p95 ≤ 300 ms, ≥ 20 fps y vuelta a reposo sin latido 100 de
100.* Si no pasa, esta placa no sirve y hay que replantear antes de escribir una
línea de app.

⚠ **Paso 1 antes de medir: confirmar los pines del display** contra el
esquemático. `include/board.h` lleva los que publica el fabricante para esta
familia, pero el manual del proyecto no trae la tabla de GPIO del panel. Una
medición sobre una asignación adivinada no vale.

**Fase 1 · Protocolo — REABIERTA el 13/8/2026 y CERRADA DE NUEVO el 14/8/2026.**
La maquinaria está y funciona: `firmware/lua/protocol.json` es la fuente única,
`scripts/build-lua-protocol.js` genera la cabecera C y el módulo TS, y
`check-lua-protocol.js` impide que las copias se separen. La tabla ya trae los
trece opcodes —`AFFECT`, `PICTO`, `AWARD`, `LEVEL` y `PICTO_PAIR` reservado— y
**la trama se queda en cuatro bytes**, porque un id de catálogo cabe en un byte
y la razón para ensancharla no existía (§6.2).

Al cerrarla apareció lo que la reapertura no había visto: **el firmware y este
plan habían asignado los mismos códigos a opcodes distintos**. Se resolvió
adoptando la asignación del firmware, y el gate `--upstream` de allí lo comprueba
ahora en cada build. El párrafo entero está en el §6.2.

Como no hay ni una placa flasheada, **el cambio de trama sale gratis**: la regla
de «los códigos no cambian nunca» protege a los aparatos que existen, y no existe
ninguno. Los opcodes viejos conservan su número; los nuevos se añaden detrás.
Queda por cerrar en la placa: probar el servidor GATT con `nRF Connect` y las
cien repeticiones de la caducidad.
→ *Criterio: con `nRF Connect` se puede conducir a Lúa entera sin app, y al cortar
la conexión vuelve a reposo en ≤ 60 s, cien veces de cien.*

**Fase 2 · Puente de React Native.**
`valeriaLuaBridge.ts`, `valeriaLuaSession.ts`, el config plugin y los permisos.
Sin tocar todavía ninguna pantalla clínica.
→ *Criterio: dev-client que conecta, mantiene el latido 30 min, sobrevive a
apagar y encender Lúa, y con el aparato apagado la app no cambia en nada.*

**Fase 3 · Primera integración visible.**
Tarjeta de Lúa en Ajustes (emparejar, estado, olvidar) + espejo de
`TurnPhaseStrip` + `VERDICT`.
→ *Criterio: captura propia de la tarjeta de Ajustes (regla 1) y vídeo del ciclo
completo veredicto → celebración.* Es el primer merge que Frank ve en pantalla.

**Fase 4 · Catálogo de expresiones — DIBUJADA Y ADELANTADA.**
Diez caras en círculo, en [`FrankBetances/lua-firmware`](https://github.com/FrankBetances/lua-firmware):
neutra, atenta, animando, casi, lo dijo, celebración, dormida, llamada, sin
conexión y **bloqueada**, que el catálogo de §10 no enumeraba y hace falta —el
silencio clínico tiene que verse, no solo estar—.

Se adelantó porque es lo único del plan que se puede hacer sin placa. No hay
pipeline de bitmaps: el sprite es el mapa `HEAD` de `ValeriaCatPixel.tsx`
copiado carácter a carácter, y las expresiones son parches de 5×5 celdas sobre
los ojos y 5×10 sobre el hocico. Un gate compara el dibujo base con el de este
repositorio, que es lo que hace que la promesa del §10 —«literalmente el mismo
dibujo»— aguante más de una versión.

Va con **emulador de escritorio**: el mismo núcleo en C++ que compila para el
ESP32, corriendo en el ordenador y sacando el panel por el navegador. No emula
la radio ni el SPI, así que no sirve para la Fase 0; sirve para ver las caras y
conducir la máquina de estados entera sin hardware.

→ *Criterio: el catálogo entero grabado en vídeo sobre el aparato, no en un
simulador.* **Sigue sin cumplirse, y es lo que importa**: hay capturas propias
del emulador, pero nada de esto se ha visto en un cristal de 32 mm. El tamaño
aparente de los ojos y el contraste bajo luz de consulta solo los dice la placa.

**Fase 4b · Catálogo de contenido — NUEVA (13/8/2026, C-1).**
Los 66 pictogramas, las 9 insignias × 5 rangos y los 12 niveles en flash
(§10.1). `build-lua-catalog.js` y el gate `check-lua-catalog.js`. Lo primero que
tiene que devolver el generador es **el tamaño real comprimido**, porque la
estimación de §10.1 puede estar mal por un factor de cinco.
→ *Criterio: los 66 pictogramas fotografiados en el cristal, no en el emulador, y
el par «cuchara limpia / cuchara sucia» distinguible a 96 px por alguien que no
sepa cuál es cuál.* Es el criterio que decide R-10.

**Fase 5 · Gamificación y Modo Vínculo.**
`AWARD` y `LEVEL` desde `registerSession()` —que cubre los 37 ejercicios de
golpe— y `CALL` desde los recordatorios. Con D-G cerrada en espejo puro, **aquí
no se rediseña ninguna pantalla clínica**.
→ *Criterio: cerrar sesión en un ejercicio de cada uno de los cuatro bloques y
ver la insignia correcta —el glifo y el rango que tocan, no una celebración
genérica— en el cristal.*

**Fase 5b · Los mini-juegos a pictogramas — NUEVA (D-H).**
La partida más grande del plan y la única que no depende de la placa: ~82
dibujos nuevos con su clave, para que MS-1, MS-2 y SE-2 pasen por `FichaVisual`.
Se hace por tandas, como se hicieron los 66 que ya existen.

**Corre en paralelo a todo lo demás y no espera a ningún hardware.** Es trabajo
de contenido con las logopedas, y **arregla la tableta aunque Lúa no llegue
nunca**: hoy esas 243 fichas caen a emoji del sistema y algunas se pintan como un
cuadro vacío en los Android del piloto (§14, D-H).
→ *Criterio: `check-pictogram-coverage.js` extendido a los bancos de ejercicios y
en verde; y la tanda revisada por ACOPROS, no solo dibujada.*

**Fase 5c · El zumbador (D-F).**
Un pin, la tabla opcode → tono, el tope de volumen en firmware y la regla de que
Lúa no suena mientras la tableta escucha.
→ *Criterio: grabar una sesión y comprobar que **no hay ni un tono** durante las
fases de escucha y repetición, y que `check-asr-capture-guard.js` sigue en verde.
Y el nivel sonoro medido, no supuesto.*

**Fase 6 · VIA+.**
Recompensa de cierre en `ResultadosFinal` y `SAFE` como defensa en profundidad.
Documentar en el expediente la ausencia como control de riesgo (§8).

**Fase 7 · Campo.**
Ensamblado en carcasa impresa sin batería accesible y sesión piloto en ACOPROS.
Si entra el zumbador de D-2, aquí se **mide el nivel sonoro y se firma**: no por
la audiometría de otro producto, sino porque es un aparato que suena a un palmo
de la cara de un niño. Es un requisito de seguridad de producto, y el tope va en
el firmware (R-5).

---

## 13. Riesgos

| | Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| **R-1** | La latencia real no cabe en el presupuesto (Android negocia intervalos largos, la pila del C3 es lenta) | El refuerzo deja de leerse como consecuencia; Lúa no sirve | Fase 0 lo mide antes que nada. Palanca: `requestConnectionPriority(HIGH)` en Android y animación que arranca en el primer frame parcial |
| **R-2** | Firmware y app se desincronizan en la tabla de opcodes | Comportamiento errático imposible de depurar en campo | Fuente única + gate de CI (§11) |
| **R-3** | Google marca la app por los permisos Bluetooth en el programa Familias | Bloqueo de publicación | Solo API 31+ con `neverForLocation`; política y formulario actualizados en el mismo cambio |
| **R-4** | Deriva de alcance hacia el **resultado clínico**: puntuaciones, porcentajes de acierto, evolución, datos de ficha | Lúa pasa a mostrar información decisoria y deja de ser accesorio no decisorio | El protocolo no tiene campo de texto ni numérico libre: solo ids de catálogo, índices e intensidades. Estructural, no disciplinar. **Re-acotado el 13/8/2026:** antes decía «que muestre el resultado» y en la práctica prohibía el pictograma y la insignia, que no son resultado clínico sino estímulo y refuerzo (C-1) |
| **R-5** | Se cuelga un zumbador del puerto de expansión sin tope de volumen ni caducidad | Un aparato en manos de un niño que puede sonar tan fuerte como el hardware permita, y que se queda sonando si cae el enlace | D-2: la capacidad sonora se concede aparte, caduca en ≤ 60 s y el **tope de volumen vive en el firmware**, no en la app. *(Reescrito el 13/8/2026: antes el riesgo era «que suene», con «entorno audiológico» como motivo. Eso era VIA+ metido en Valeria+ — C-3.)* |
| **R-9** | Un banco gana una clave de pictograma nueva y nadie regenera el catálogo de Lúa | El niño ve la ficha en la tableta y un hueco en Lúa. No se detecta hasta la consulta | Gate `check-lua-catalog.js` (§11) |
| **R-10** | Los pictogramas no se leen a 96 px en un cristal de 32 mm | La vuelta de comprensión de Pares Mínimos no se puede espejar; el espejo queda incompleto justo en el ejercicio que más lo necesita | Se mide en Fase 4 sobre la placa, antes de escribir el puente. Salidas: turnar las dos fichas en vez de ponerlas juntas, o dejar esa vuelta solo en la tableta (§6.2b, §10.2). **Agravado el 14/8/2026:** la ficha de `PICTO` se queda en 72 px de los 240, o sea **9,6 mm**, no 22 |
| **R-11** | Las ocho emociones de `AFFECT` siembran hasta 300 partículas por frame y nadie las ha dibujado en un C3 | Los fps caen por debajo de 20 justo en las caras que más se mueven, y el §4 deja de cumplirse sin que nadie lo note hasta la consulta | El peor caso de la Fase 0 pasa a ser `AFFECT(0)`, no la cara neutra. Si no da, la salida es bajar el techo de partículas: es una constante del firmware |
| **R-12** | El índice de `PICTO` se saca de `pictogramKeys()`, que devuelve las claves **ordenadas alfabéticamente** | Los 66 índices salen distintos del orden de declaración: el niño oye «cuchara» y ve otra ficha. No lo detecta ningún test de la app, solo alguien mirando el aparato | El orden que vale es el de declaración de `PICTO_KEYS` en `ValeriaPixelArt.ts`, y está escrito en su cabecera. Cuando se escriba el puente (Fase 3), el índice sale de ahí y de ningún otro sitio |
| **R-6** | El aparato acaba en manos de un niño en el piloto sin marcado ni carcasa | Incidente de seguridad y problema con el comité de ética | Protocolo: v1 sobre mesa, adulto, carcasa cerrada, batería inaccesible. Declarado en la solicitud al comité |
| **R-7** | Consumo real deja el aparato en 90 min de sesión | Muere a media consulta | Fase 0 mide autonomía. Palancas: bajar brillo en reposo, apagar panel entre ejercicios, celda mayor |
| **R-8** | El esfuerzo de firmware compite con RA y ASR, que están a medio validar | Tres frentes abiertos y ninguno cerrado | Fase 0 es barata y aislada; nada de app se toca hasta que pase. Si Frank prefiere, se congela ahí |

---

## 14. Decisiones que necesito de Frank

Ninguna bloquea la Fase 0: el banco de pruebas se monta igual. Pero de la 1 en
adelante hacen falta.

**D-A · ¿Osa o gata? — CERRADA: gata, en píxel art.** Decidido por Frank el
9/8/2026, en contra de lo que yo recomendaba aquí (que el aparato fuera la
osita). La app ya está migrada: mascota, niveles e insignias. El oso se retira.

**D-B · ¿Se mantiene el nombre «Lúa»? — CERRADA: sí, y es el de la mascota.**
Decidido por Frank. No se vuelve a abrir.

**D-C · ¿Android 12+ y punto, o se paga el módulo nativo de
`CompanionDeviceManager`?** Recomiendo 12+ (§9, opción 1) y revisar solo si el
censo de dispositivos del piloto lo desmiente.

**D-D · ¿El firmware vive en este repositorio (`firmware/lua/`) o aparte? —
CERRADA POR LOS HECHOS: aparte.** Recomendaba aquí, por la fuente única de la
tabla de opcodes. El firmware de producto vive en
[`FrankBetances/lua-firmware`](https://github.com/FrankBetances/lua-firmware),
así que el coste que preocupaba —dos copias que se separan— hay que pagarlo con
gates en vez de con proximidad. Cómo queda:

- La tabla de opcodes y el sprite **siguen decidiéndose aquí**. Allí son copias
  declaradas, y sus dos gates aceptan `--upstream ../Valeria` para compararlas
  contra este repositorio carácter a carácter.
- `firmware/lua/` **se queda donde está**: es la fuente de `protocol.json`, de
  la que dependen `build-lua-protocol.js` y los gates de `android.yml`.
- Lo que hay que vigilar es que ahora **hay dos firmwares**: el banco de la Fase
  0 de aquí y el de producto de allí. Mientras el primero siga siendo el que se
  flashea para medir, las diferencias entre ambos —la del latido de §5, la
  primera— tienen que estar escritas y no descubrirse midiendo.

**D-E · ¿Cuántas unidades para el piloto?** Cambia si la carcasa se imprime o se
moldea, y cambia la conversación sobre marcado.

**D-F · Sonido — CERRADA (Frank, 13/8/2026): tonos para empezar.**
Entra el **zumbador pasivo por PWM en v1**, sobre la placa C3 ya elegida: un pin
del puerto de expansión, sin cambiar de hardware. Voz y sonido muestreado quedan
para v2 con placa distinta (§2.2). Lo que arrastra la decisión:

1. **No hay opcode nuevo.** El tono va **atado al opcode que ya existe**, en una
   tabla del firmware: `VERDICT(2)` suena distinto de `VERDICT(0)`, `AWARD`
   suena, `CELEBRATE` suena. La app no manda «pita»: manda lo que ya mandaba y
   Lúa decide si eso suena. Un opcode `SOUND` suelto solo entraría si algún día
   hace falta un tono sin cambio visual — hoy no hace falta y no se añade.
2. **La capacidad sonora se concede aparte de la visual** (§5) y caduca igual. Si
   cae el enlace, Lúa se calla sola en ≤ 60 s.
3. **El tope de volumen vive en el firmware.** La app pide, el firmware topa
   (R-5). El adulto lo ajusta por `CFG` desde la tarjeta de Ajustes, y **el 0 es
   un valor legítimo**: hay niños con hiperacusia y sesiones donde el sonido
   sobra.
4. **Regla clínica, y esta es de Valeria+, no importada de nadie: Lúa no suena
   mientras la tableta escucha.** Ni durante la fase de escucha ni durante la de
   repetición (`PHASE` 0 y 1). Dos motivos propios: un pitido encima del estímulo
   hablado lo enmascara, y un pitido durante la captura entra en el micrófono de
   la tableta y contamina el ASR — que es justo lo que vigila
   `check-asr-capture-guard.js`. El sonido vive en el veredicto y en el premio,
   que es donde el refuerzo tiene sentido.
5. **§4 no se mueve.** Arrancar un tono por PWM son microsegundos; no compite con
   el presupuesto de latencia. Lo que sí entra es la medida de nivel sonoro en
   Fase 7, por seguridad de producto: es un aparato que suena a un palmo de la
   cara de un niño.

**D-G · La tableta cuando Lúa está conectada — CERRADA (Frank, 13/8/2026):
espejo puro.** Lúa muestra **la misma imagen que ve el adulto en la tableta**. La
tableta no cambia: sigue pintando la ficha igual que hoy. No hay modo de adulto,
no se rediseña ninguna pantalla clínica, y el espejo es exactamente eso —lo
mismo, en dos superficies—.

Consecuencia práctica que conviene ver: **ninguna de las siete pantallas clínicas
se toca** para que el espejo funcione. El trabajo se concentra en el puente, el
catálogo y tres puntos de enganche (§6.5). Es la opción que menos arriesga y la
que antes se puede enseñar en una captura.

**D-H · Los mini-juegos — CERRADA (Frank, 13/8/2026): pasan a pictogramas.**
MS-1 (uno/muchos), MS-2 (niño/niña) y SE-2 (opciones) dejan de dibujar emoji y
pasan por `FichaVisual` con clave de pictograma. Con eso entran en el espejo sin
tocar nada más: el enganche de la capa 2 ya está en `FichaVisual` (§6.5).

**El coste hay que verlo antes de empezar, porque es la partida más grande de
todo el plan.** Contado del árbol, no estimado:

| | |
| :--- | ---: |
| Pares (palabra, emoji) distintos en los bancos de ejercicios, cinco lenguas | **244** |
| De ellos, que hoy resuelven a un pictograma dibujado | **1** |
| Que caen a emoji del sistema | **243** |
| Emoji distintos, o sea dibujos que harían falta | **~82** |

La clave de pictograma es independiente del idioma —es el argumento con el que
nació `ValeriaPictograms`—, así que **un dibujo sirve a las cinco lenguas**: los
244 pares se cubren con del orden de 82 dibujos, no con 244. Aun así el catálogo
pasa de 66 a ~148, más del doble, y eso mueve el presupuesto de flash de §10.1.

**Y esto no es solo trabajo para Lúa: arregla la tableta.** Esas tarjetas pintan
emoji crudo hoy —MS-1 repite `ex.plural.emoji` dentro de un `<Text>` de 52 px—,
que es exactamente el defecto del tofu por el que se creó `ValeriaPictograms` y
lo que ACOPROS pidió corregir. Las 243 fichas que caen a emoji del sistema se
ven distintas en cada Android y algunas no se ven. **La petición de Frank cierra
un agujero que ya existía en la app, mirase o no el niño a Lúa.**

Lo que hace falta decidir aparte, y no bloquea: **por qué tanda se empieza**. Los
82 dibujos no salen de una vez, igual que los 66 salieron en tres tandas. Lo
sensato es priorizar por los ejercicios que más se prescriben en el piloto y por
los emoji de Unicode 12+, que son los que ya se ven rotos.

**D-I · Quién manda `AFFECT` — CERRADA (Frank, 13/8/2026): dos emisores, y
ninguno es el aparato.**

1. **El acompañante, a mano**, desde un control de la app. Lúa no tiene botón de
   emoción y no va a tenerlo: **el aparato no elige nunca qué siente**.
2. **La app, sola, según la evolución**, a partir de los hitos que
   `registerSession()` ya calcula —sesión completada, subida de nivel, insignia,
   racha, vuelta tras una ausencia—.

Con cuatro límites, y el tercero es el que protege el R-4:

- **Fuera del turno.** Nunca en mitad de un intento.
- **Por hitos, y NUNCA por el `MatchLevel`.** Si la emoción la eligiera el
  acierto, la mascota estaría expresando el resultado, que es exactamente lo que
  el R-4 prohíbe.
- **Una automática por sesión como mucho.** Si la mascota se emociona cada dos
  minutos, deja de significar nada.
- **Sin tocar la máquina de seguridad.** `AFFECT` exige concesión viva como
  cualquier otro gesto y no altera `SAFE` ni la caducidad.

**Lo que esto convierte en trabajo con fecha:** si las emociones van a llegar
solas durante una sesión, el efecto del latido que las borra (D-6 de la hoja de
ruta del firmware) deja de ser una curiosidad y pasa a ser un fallo que se va a
ver en consulta. Hay que cerrarlo **antes** de encender el envío automático.

**D-J · Dónde vive el arte del ejercicio — CERRADA (Frank, 14/8/2026): aquí, y
es el arte nuevo.** *(Es la D-7 de la hoja de ruta del firmware, con la letra que
le toca en este plan.)*

Los 66 pictogramas y las 9 insignias se rehicieron como **matrices de píxel art
de 24×24** con paleta de 21 colores, contorno, sombra y marco. Se dibujaron en
`lua-firmware`, y durante un día fueron la tercera copia de un activo clínico
—exactamente el modo de fallo del §6.3—.

Se decide que **ese arte es el de Valeria+, no solo el del aparato**. Vive en
`src/ValeriaPixelArt.ts`, que es la fuente única, y el firmware lo copia con
`tools/build-art.js --upstream`, igual que ya copiaba el sprite de la gata y la
tabla de opcodes.

Es la primera vez que un activo **sube** en lugar de bajar. La excepción es de
dirección, no de regla: desde que entró aquí, la fuente vuelve a estar arriba.

Lo que esto ya resolvió, comprobado y no supuesto:

- **Ningún índice se ha movido.** Los 66 nombres están en el mismo orden que
  `PICTOGRAMS_BY_KEY`, comparado lista contra lista, y los 9 glifos también.
- **La subida fue sin pérdida.** Las cabeceras del firmware regeneradas desde
  este repositorio salen **idénticas byte a byte** a las que había, salvo la
  línea que dice qué generador las escribió.
- **El presupuesto de flash dejó de existir**: 42 KB en vez de 2,5 MB (§10.1).
- **Cómo se dibuja 24×24 en una tableta** —la pregunta que la decisión dejaba
  abierta— tiene respuesta y ya existe: `ValeriaPixelSprite.tsx` convierte la
  matriz en rectángulos de SVG, que es lo que `PixelAward` ya hacía con sus
  mapas de 12×12. Un SVG escala sin pérdida, así que el mismo dato sirve para el
  cristal de 32 mm y para diez pulgadas.

**Las pantallas ya lo dibujan (14/8/2026).** `FichaVisual` —el único punto por el
que pasan Pares Mínimos y Expansión Semántica— pinta las matrices de 24×24, y
`PixelAward` hace lo propio con las insignias. Los 66 SVG anteriores y las
rejillas de 12×12 se han retirado: conservarlos era tener dos dibujos de la misma
cosa, que es no cerrar nada.

Mirando la captura aparecieron **dos fallos que ningún typecheck ve**, y los dos
están corregidos:

1. **El rango se quedaba invisible.** De los nueve glifos, solo `yarn` y `sunrise`
   usan celdas `a`/`b`; los otros siete se pintan con la paleta fija y salen
   **idénticos en los cinco rangos**. En el aparato da igual —el rango tiñe el
   panel entero—, pero cuatro de las seis pantallas que pintan una insignia lo
   hacen **sin placa detrás**: la tira de racha, el dashboard, el player y el
   lanzador de RA. Allí una racha de 7 días y una de 30 se habrían visto
   exactamente iguales, y que el metal suba con la racha es la razón por la que
   `streakTier` existe. Ahora la insignia trae **su propio disco y su anillo**,
   como en el panel, así que el rango se lee en los seis sitios.
2. **El núcleo del glifo se aplicaba mal.** El firmware usa el color de núcleo
   **en lugar** del tono `b` del rango; la app lo tenía como reserva del color
   fijo. Con eso, `yarn` cambiaba de color con el rango en la tableta y no en el
   aparato. Ahora los dos hacen lo mismo.

Lo que **sigue cayendo a emoji** es lo de siempre y no ha cambiado: una palabra
sin clave de pictograma —«rana», por ejemplo— se pinta con su emoji. Los 66
dibujos cubren las claves del banco propio, no el idioma entero.

**D-K · De dónde sale la voz — CERRADA (Frank, 14/8/2026): de la tableta. Lúa
se queda con la cara.**

Cierra la reapertura que la D-9 de la hoja de ruta del firmware había provocado
el mismo día, unas horas después de la D-F: la dirección pidió **locuciones
pregrabadas en el aparato**, y eso no cabe. La cuenta que lo decide no es de
protocolo ni de gusto, es de placa, y está en §3:

| | Cara animada 240×240 | Locuciones |
| :--- | :---: | :---: |
| ESP32-C3 · IPS circular (v1, D-1) | ✅ 20-30 fps | ❌ solo tonos, 1 pin |
| ESP32-S3 · e-Paper (§2.2) | ❌ 15-20 s por refresco | ✅ códec ES8311 |

**Ninguna de las placas estudiadas hace las dos cosas.** La que habla tarda
quince segundos en sonreír, y una cara que tarda quince segundos en sonreír no es
refuerzo inmediato. Se decide por tanto que **la voz sale por el altavoz de la
tableta**, que es donde ya está, y Lúa conserva el trabajo que su placa hace bien.

Lo que la decisión evita, que es su mayor virtud:

- **No hay cuarta placa.** No se rehacen §2, §3 ni §4. La D-1 sigue en pie.
- **No hay opcode `AudioPlay`.** La tabla de `protocol.json` no se toca, y con
  ella no se tocan las tres copias generadas ni sus gates.
- **No hay I²S, ni pin de audio, ni tabla de tonos.** Cero líneas de audio en los
  tres repositorios, igual que ayer. `check-lua-mute.js` **se queda como está**,
  aquí y en su copia del firmware.
- **Coste de implementación: cero, y esto está comprobado, no supuesto.** VIA+ ya
  locuta sus consignas por `@/Voice` —`speakConsigna()` en
  `src/Screens/ExecutiveFunctions/efSpeech.ts` resuelve texto y voz juntos en las
  cinco lenguas y degrada en silencio si no hay voz—. La fila de la matriz que
  pedía «locución de consigna pregrabada» ya funciona, y funciona desde antes de
  esta decisión.

**Lo que la decisión NO retira:** la D-F sigue cerrada tal cual. El zumbador
pasivo por PWM sigue **autorizado** para v1 —tonos atados a los opcodes que ya
existen, tope de volumen en firmware, capacidad sonora aparte— y sigue **sin
implementar**: no hay pin asignado ni tabla de tonos. Lo que se cierra aquí es
*de dónde sale la voz*, no si Lúa puede emitir un «tilín» de acierto. Si algún día
se quiere retirar también el zumbador, es otra decisión y la toma Frank.

**D-L · El campo de capacidad de `GRANT` — CERRADO Y APLICADO (14/8/2026).**

Era la discrepancia entre el §6.2 de este plan —que declara `GRANT` con
«capacidad · ttl»— y `protocol.json`, que decía solo «ttl» y anotaba «concede
capacidad visual». El campo existía en la prosa y no en el enlace, así que el
estado «puede dibujar, no puede sonar» del §5 era indescriptible. Cómo queda:

| | |
| :--- | :--- |
| **Parámetro de `GRANT`** | TTL 1-60 en el **byte bajo**, máscara de capacidades en el **alto** |
| **Máscara** | `LUA_CAP_VISUAL` `0x01` · `LUA_CAP_SOUND` `0x02`, generadas del `.json` |
| **Máscara `0x00`** | Solo visual — que es lo que valía un `GRANT` antes de que el campo existiera |
| **Opcode nuevo** | **Ninguno.** Cumple la D-F |

**El orden de los bytes no es estético.** Con el TTL abajo, cualquier trama
escrita bajo el contrato de ayer —«ttl en segundos (1-60)»— significa hoy
exactamente lo mismo, porque 60 cabe de sobra en un byte. Y al revés: un aparato
con firmware anterior al campo lee los 16 bits enteros como TTL, obtiene un
número grande y lo recorta a 60, que es lo que la app quería. **Las dos
direcciones se comportan igual, y eso está probado, no supuesto.**

**Y una operación nueva de `SAFE`, que es lo que de verdad desbloquea a VIA+:**

| `SAFE` | Qué hace |
| :--- | :--- |
| `CLINICAL_SILENCE` `0x01` | **Sin tocar.** Sigue siendo el cierre TOTAL: revoca todo y bloquea |
| `UNLOCK` `0x02` | Levanta el bloqueo **y** el silencio sonoro. Devuelve a REPOSO, nunca a ACTIVA |
| `MUTE` `0x03` | **Nueva.** Quita solo la capacidad sonora; la visual, el modo y la ficha siguen vivos |

`MUTE` **no suaviza el silencio clínico y no lo sustituye**: son dos herramientas
para dos casos, y la de apagarlo todo sigue siendo la otra. Pega hasta un `UNLOCK`
explícito, de modo que un `GRANT` posterior no puede devolver el sonido — si
pudiera, bastaría con renovar la concesión para volver a poder sonar en mitad de
una captura.

Sigue **abierto** el punto de `STATE` (§6.1): promete publicar capacidades vivas y
batería, y publica cara, fps y microsegundos. Con dos capacidades gana urgencia
—la app puede pedirlas pero no puede verlas—, y no se ha tocado aquí porque los
ocho bytes están llenos y cambiar la trama es una conversación propia.

---

## 15. Seguimiento

| Fase | Estado |
| :--- | :--- |
| 0 · Banco de pruebas | 🟨 **escrito y listo para correr** — falta la placa |
| 1 · Protocolo | ✅ **cerrada de nuevo el 14/8/2026** — la tabla trae `AFFECT`, `PICTO`, `AWARD`, `LEVEL` y `PICTO_PAIR` reservado; trama en 4 B; el gate `--upstream` del firmware pasa |
| 2 · Puente RN | ⬜ pendiente |
| 3 · Primera integración visible | ⬜ pendiente |
| 4 · Catálogo de expresiones | 🟨 **veintidós caras y un emulador** — en `lua-firmware`; sin ver en el panel |
| 4b · Catálogo de contenido | ✅ **cerrada** — el arte vive en `src/ValeriaPixelArt.ts`, el firmware lo copia y las pantallas lo dibujan, con captura |
| 5 · Gamificación y Modo Vínculo | ⬜ pendiente |
| 5b · Mini-juegos a pictogramas | ⬜ **pendiente, nueva** — ~82 dibujos; no depende de la placa |
| 5c · Zumbador | ⬜ **pendiente, nueva** — un pin, tope en firmware |
| 6 · VIA+ | ⬜ pendiente |
| 7 · Campo | ⬜ pendiente |

Lo que YA existe **en este árbol**: `firmware/lua/` (protocolo, firmware de Fase
0 y procedimiento), `scripts/build-lua-protocol.js` con sus dos gates, y
`docs/lua-bench.html`.

Lo que existe **en [`lua-firmware`](https://github.com/FrankBetances/lua-firmware)**
(§14, D-D): el catálogo de las diez caras con sus capturas, el emulador de
escritorio, la máquina de estados de §5 portada y probada fuera de la placa —cien
caducidades de cien— y el objetivo del ESP32, **que no se ha compilado nunca**
porque allí tampoco hay PlatformIO. Su `docs/hoja-de-ruta.md` dice, fase a fase,
qué pone el firmware en cada una.

Lo que NO existe: **nada medido**. Ni latencia, ni fps sostenidos, ni consumo, ni
una sola cara vista en un cristal de 32 mm. Las cifras de §4 siguen siendo una
hipótesis hasta que alguien enchufe la placa, y las capturas de un emulador no
son una excepción a eso: enseñan el dibujo, no el aparato.

Y lo que **no existe todavía en ninguna parte**, tras la corrección del
13/8/2026: los opcodes de pictograma, insignia y nivel; el catálogo de contenido
en flash; su generador; su gate; y el re-acotado del gate del micrófono. Este
documento los deja escritos y decididos — **nada de eso está en código**. El
árbol sigue como estaba: cinco opcodes, una trama de cuatro bytes y un gate que
rompe el build si Lúa suena.

**Estado de las tres capas de la petición de Frank, para que se vea de un
vistazo:**

| Capa | Escrita en el plan | En el protocolo | En código | Vista en la placa |
| :--- | :---: | :---: | :---: | :---: |
| Pictogramas en Lúa | ✅ | ❌ | ❌ | ❌ |
| Insignias en Lúa | ✅ | ❌ | ❌ | ❌ |
| Nivel en Lúa | ✅ | ❌ | ❌ | ❌ |
| El espejo en todos los ejercicios | ✅ | — | ❌ | ❌ |
| Estímulos sonoros | ✅ **decidido: tonos (D-F)** | ❌ | ❌ prohibido por el gate | ❌ |
| Espejo puro, sin modo adulto | ✅ **decidido (D-G)** | — | — | — |
| Mini-juegos con pictograma | ✅ **decidido (D-H)** | — | ❌ 243 fichas caen a emoji | ❌ |

Las cinco decisiones abiertas que tenía este plan bajan a dos: **D-C** (Android
12+ o módulo nativo) y **D-E** (unidades del piloto). D-F, D-G y D-H las cerró
Frank el 13/8/2026.
