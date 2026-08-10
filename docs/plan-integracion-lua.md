# Plan de integración · Lúa (periférico físico de refuerzo)

> **Documento de planificación. No cambia nada en pantalla.** Al mergear esto,
> Frank no verá ninguna diferencia en la app: es un `.md` en `docs/`. La primera
> pantalla nueva (tarjeta de emparejamiento en Ajustes) llega en la Fase 3 y,
> cuando llegue, irá con captura propia como manda la regla 1.
>
> Define cómo conectar **Lúa** —mascota física sobre ESP32— con **Valeria+**
> (rehabilitación, SaMD Clase I) y con **VIA+** (valoración, SaMD Clase IIa),
> partiendo del borrador de arquitectura y de los manuales de las tres placas
> que hay sobre la mesa.
>
> Estado: 🔵 **planificación. Cero código, cero firmware, cero hardware validado.**
> Rama de trabajo: `claude/lua-integration-plan-ldxxdk`

> **Lo que este documento cambia respecto al borrador de partida.** Tres cosas,
> y conviene leerlas antes que nada porque mueven dinero y semanas:
>
> 1. **El borrador atribuye a la placa circular ESP32-C3 un códec de audio
>    ES8311 y un RTC que esa placa no tiene** — son de la placa e-Paper S3. Con
>    la C3 elegida, Lúa v1 es **muda y sin reloj propio** (§2.4). No es un
>    problema: es la decisión correcta y se defiende sola (§3).
> 2. **El perro mecánico no queda "aplazado" por el ruido de los servos: queda
>    fuera por el micrófono.** Trae asistente de voz con activación por palabra
>    clave y diálogo en 15 idiomas, o sea captura continua de audio junto a un
>    menor. Eso no entra en una consulta pediátrica ni en el formulario de
>    Seguridad de los datos de Play (§2.3).
> 3. **La integración correcta con VIA+ durante la medición no es un comando de
>    silencio: es la ausencia del aparato.** Un control de riesgo por software
>    («le mando callar») es más caro de justificar ante MDR que un control por
>    diseño («no está en la sala»), y encima es más frágil (§8).

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

Lúa es un **espejo tangible del refuerzo que ya existe en la app**. Nada más.
La app decide, Lúa reacciona.

**Es:**
- Un esclavo BLE sin iniciativa. No mide, no puntúa, no decide, no guarda.
- Una pantalla con cara. El refuerzo es visual y, en v1, silencioso.
- Opcional en el sentido fuerte: la app se comporta exactamente igual si Lúa no
  existe, está apagada o se desconecta a mitad de un ejercicio.

**No es:**
- Un sensor. **No lleva micrófono activo** (§11, gate `check-lua-mute.js`). La
  captura vocal se hace en la tableta, donde ya está el ASR, el corpus y el
  cifrado.
- Un almacén. Cero PHI: no recibe nombres, ni `patientKey`, ni puntuaciones, ni
  fechas de sesión. Recibe **opcodes**.
- Un accesorio de un producto sanitario en el sentido del art. 2(2) MDR —
  siempre que se mantenga fuera del acto de medición (§8). Si entra en la sala
  durante la audiometría, esa frase deja de ser cierta y el expediente de VIA+
  se complica.

La regla que ordena todo lo demás: **Lúa nunca puede ser la razón por la que un
dato clínico es inválido.**

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

Elegir la C3 es elegir una Lúa **muda y sin reloj propio**. Hay que decidirlo a
propósito, no descubrirlo al soldar.

---

## 3. Decisión de hardware

**D-1 · v1 corre sobre la placa ESP32-C3 con pantalla IPS circular.** Es la única
que cumple el requisito de latencia (§4).

**D-2 · Lúa v1 es muda.** Sin altavoz, sin zumbador, sin códec. No es una
renuncia: es la característica que hace a Lúa admisible en el entorno de VIA+ y
la que elimina de un plumazo la mitad del análisis de riesgo. Una mascota que no
puede sonar no puede contaminar una logoaudiometría ni tapar un estímulo. Si en
v2 se quiere sonido, entra por la puerta de §5 (concesión con caducidad) y con
placa distinta.

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
- **En v1 no hay capacidad de audio ni de motor.** El enum existe en el
  protocolo, reservado, con valor prohibido en firmware. Así el día que exista
  hardware con altavoz, entra por un camino ya diseñado y no por un parche.
- **El comando de silencio clínico sigue existiendo**, con confirmación
  obligatoria, pero como cinturón sobre los tirantes: revoca toda concesión al
  instante y bloquea nuevas concesiones hasta un desbloqueo explícito. No es el
  control primario (§8).

---

## 6. Protocolo BLE

### 6.1 Servicio GATT

Un solo servicio primario, UUID de 128 bits propio del proyecto (a generar, no
reutilizar ninguno de ejemplo de Espressif). Cuatro características:

| Característica | Propiedades | Tamaño | Contenido |
| :--- | :--- | ---: | :--- |
| `CTRL` | Write Without Response | 4-8 B | opcode + parámetros. Camino de latencia. |
| `SAFE` | Write **with** Response | 2 B | silencio clínico, revocación, desbloqueo. |
| `STATE` | Read + Notify | 8 B | modo, capacidades vivas, batería, versión fw. |
| `CFG`   | Write with Response | ≤ 20 B | brillo, catálogo de expresión, franjas (v2). |

**Ninguna característica transporta texto.** No hay campo de cadena en el
protocolo: es la garantía estructural de Zero-PHI. Un nombre de paciente no puede
llegar a Lúa porque no existe el sitio donde meterlo.

### 6.2 Trama de `CTRL`

```
byte 0   : versión de protocolo (0x01)  — el firmware rechaza lo que no conoce
byte 1   : opcode
byte 2-3 : parámetro (little-endian, semántica según opcode)
```

Tabla de opcodes v1 (borrador; se cierra en Fase 1):

| Opcode | Nombre | Parámetro | Efecto |
| ---: | :--- | :--- | :--- |
| `0x01` | `PHASE` | fase 0-3 | espeja `TurnPhaseStrip`: escucha / repite / veredicto / misión |
| `0x02` | `VERDICT` | nivel 0-2 | celebración proporcional al `MatchLevel` del ASR (0 no coincide · 1 casi · 2 lo dijo) |
| `0x03` | `CELEBRATE` | intensidad | cierre de sesión, subida de nivel, insignia |
| `0x04` | `IDLE` | — | vuelta a cara neutra |
| `0x05` | `CALL` | — | animación de llamada del Modo Vínculo (D-3) |
| `0x10` | `GRANT` | ttl en s | concede capacidad visual (§5) |
| `0x11` | `HEARTBEAT` | — | renueva la concesión viva |

El parámetro de `VERDICT` es **el nivel de coincidencia que ya calcula la app**,
no una puntuación nueva. Lúa no interpreta: mapea nivel → animación. Si mañana
cambia el algoritmo de scoring, Lúa no se entera, que es exactamente lo que se
quiere de un accesorio no decisorio.

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

## 6.5 Dónde engancha en la clínica (aportado por el análisis del 10/8/2026)

El eje A es lo que hace Lúa **dentro** de la sesión; el B, lo que hace al
cerrarla. Todo son comandos de un solo sentido: la app decide, Lúa reacciona.

**Eje A · marcador clínico durante la terapia**

| Bloque | Enganche | Opcode | Por qué aporta |
| :--- | :--- | :--- | :--- |
| Audición · Test de Ling y escucha en ruido | el adulto califica la respuesta y Lúa celebra en silencio | `VERDICT(2)` | refuerzo visual tipo VRA, que es exactamente cómo se condiciona la respuesta en audiometría infantil |
| Pares Mínimos | Lúa espeja `TurnPhaseStrip`: cara atenta al escuchar, expectante al repetir | `PHASE(0..3)` | da un ancla física al turno y entrena control inhibitorio en dislalias fonológicas |
| TEA · quiebre pragmático | Lúa se queda en `IDLE` y **no** asiste al niño; solo reacciona si repara la comunicación **hacia el adulto** | `IDLE` → `VERDICT` | atención conjunta triangulada: el refuerzo premia dirigirse a la persona, no al aparato |

La fila de TEA es la más delicada y conviene dejarla escrita: si Lúa reaccionase
al niño durante el quiebre, se convertiría en la salida fácil y el ejercicio
mediría lo contrario de lo que pretende.

**Eje B · vínculo fuera de la sesión**

| Momento | Opcode | Nota |
| :--- | :--- | :--- |
| Subida de nivel o insignia al cerrar sesión | `CELEBRATE` | lo dispara `registerSession()`, que ya devuelve `levelUp` y `newBadges` |
| Hora de la sesión | `CALL` | va con la notificación local que ya existe; suple la falta de RTC (D-3) |

## 7. Superficie de integración en Valeria+

Este repositorio contiene **solo Valeria+**. Lo de VIA+ es un contrato (§6.3, §8),
no código que se escriba aquí.

| Archivo | Qué pasa | Nuevo/Toca |
| :--- | :--- | :--- |
| `src/valeriaLuaBridge.ts` | **Única superficie** que ve el resto de la app: `isLuaAvailable()`, `connect()`, `send(opcode)`, `grant()`, `disconnect()`. Carga `react-native-ble-plx` con `require()` dentro de `try`, igual que [`valeriaArBridge.ts`](../src/valeriaArBridge.ts) y `valeriaNoise` con expo-audio. Sin módulo → `false` → nadie ve nada roto. | nuevo |
| `src/valeriaLuaProtocol.ts` | Generado desde `protocol.json`. No se edita a mano. | nuevo, generado |
| `src/valeriaLuaSession.ts` | El latido de §5 y la reconexión con backoff. Aislado del puente para poder probarlo sin radio. | nuevo |
| `src/ValeriaVoiceUI.tsx` | `TurnPhaseStrip` ya recibe `active`; se añade un `useLuaPhase(active)` en el propio componente. Un solo punto y las dos pantallas que lo usan (`MinimalPairs`, `SemanticExpansion`) heredan el espejo sin tocarse. | toca |
| `src/valeriaGamification.ts` | `registerSession()` ya devuelve `SessionReward` con subida de nivel e insignias. Ahí sale `CELEBRATE`. | toca |
| `src/valeriaNotifications.ts` | Al disparar el recordatorio local, si hay enlace, `CALL` (D-3). | toca |
| `src/ValeriaSettingsScreen.tsx` | Tarjeta de Lúa: emparejar, estado, batería, brillo, olvidar. **Solo se renderiza si `isLuaAvailable()`.** | toca |
| `src/ValeriaBlockIcons.tsx` | Icono `lua` en el set propio: rejilla 24, grosor 1,9, terminaciones redondeadas. Nada de 🐱 (regla 5). | toca |
| `src/i18n/strings.es.ts`, `strings.en.ts` | Cadenas de la tarjeta de Ajustes. | toca |
| `src/valeriaTelemetry.ts` | Eventos `lua_link` (conectado/perdido) y latencia medida de `VERDICT`. Sin PHI: son métricas del enlace. | toca |
| `plugins/withValeriaLua.js` | Permisos Bluetooth y `minSdk`, siguiendo el patrón de `withValeriaAR.js`. | nuevo |
| `app.json` | Permisos nuevos (§9). | toca |
| `site/privacidad.html`, `site/privacy.html` | Bluetooth en §3.3 «Permisos y datos del dispositivo», en los dos idiomas. Bloqueante (CLAUDE.md). | toca |
| `scripts/check-lua-protocol.js`, `scripts/check-lua-mute.js` | Gates (§11). | nuevos |
| `.github/workflows/android.yml` | Dos gates más antes del typecheck. | toca |

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

Con esta postura, Lúa v1 es **muda, ausente durante la medición y sin capacidad
de influir en ningún resultado**: la posición regulatoria más barata que existe.

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
  vectorial propia y se empaquetan como bitmaps RGB565 en flash. 4 MB dan de
  sobra para un catálogo de 6-8 expresiones con 8-12 frames cada una.
- **Catálogo v1:** neutra, atenta (fase escucha), animando (fase repite),
  celebración corta, celebración larga, dormida, llamada, sin conexión.
- **La pantalla es circular y solo se ve Φ 32,4 mm.** Una cara diseñada en
  rectangular pierde las esquinas. Se diseña en círculo desde el primer boceto.

**Identidad · decidido (Frank, 9/8/2026): la mascota es la GATA, en píxel art.**
El oso queda retirado de la app. Ya está hecho en el árbol:
`ValeriaCatPixel.tsx` (rejilla 24×23, gata negra tipo smoking) sustituye a
`BearMark` en Bienvenida, Créditos y el distractor de doble tarea, y los doce
niveles pasan de «Osezno → Oso Legendario» a «Gatita → Gata Legendaria».

Esto simplifica el hardware: **el catálogo de caras de la pantalla circular sale
de la misma rejilla que la mascota de la app.** El píxel art no es aquí un gusto
estético, es el formato nativo de un panel de 240×240 — y significa que la cara
de Lúa en el aparato y la de la app son literalmente el mismo dibujo, no dos
interpretaciones que se van separando versión a versión.

**Queda una decisión de nombre (§14, D-B):** `lúa` es palabra objetivo del banco
gallego. Aparece en `valeriaExerciseGl.ts` («Toca a lúa, logo o gato e despois a
flor») y en `valeriaSemanticExpansionGl.ts`. Llamar Lúa al aparato crea
ambigüedad justo en la lengua donde la palabra se está trabajando: el adulto
dice «mira a Lúa» y el niño no sabe si es la mascota o la luna del ejercicio.

---

## 11. Garantías de no regresión y gates de CI

`android.yml` ya corre nueve gates antes del typecheck. Se añaden dos, baratos y
en Node puro:

**`scripts/check-lua-protocol.js`** — regenera desde `protocol.json` y compara con
`src/valeriaLuaProtocol.ts` y `firmware/lua/include/lua_protocol.h`. Falla si
alguien tocó una tabla y no la otra. Es el gate que evita el bug caro del
proyecto: firmware y app entendiendo el mismo byte de forma distinta.

**`scripts/check-lua-mute.js`** — recorre las fuentes del firmware y falla si
aparece inicialización de entrada de audio (I²S RX, ADC de micrófono), de PWM de
altavoz o de servo. Es el equivalente a `check-asr-capture-guard.js`: convierte
una promesa del documento («Lúa no escucha») en algo que rompe el build si se
incumple.

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

**Fase 1 · Protocolo — HECHA.**
`firmware/lua/protocol.json` es la fuente única; `scripts/build-lua-protocol.js`
genera la cabecera C y el módulo TS, y dos gates lo custodian:
`check-lua-protocol.js` (las tres copias no se separan) y `check-lua-mute.js`
(sin audio, sin micrófono, sin servos). Queda por cerrar en la placa: probar el
servidor GATT con `nRF Connect` y las cien repeticiones de la caducidad.
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

**Fase 4 · Catálogo de expresiones.**
Las 6-8 caras, dibujadas en círculo, con su pipeline de generación.
→ *Criterio: el catálogo entero grabado en vídeo sobre el aparato, no en un
simulador.*

**Fase 5 · Gamificación y Modo Vínculo.**
`CELEBRATE` desde `registerSession()`, `CALL` desde los recordatorios.

**Fase 6 · VIA+.**
Recompensa de cierre en `ResultadosFinal` y `SAFE` como defensa en profundidad.
Documentar en el expediente la ausencia como control de riesgo (§8).

**Fase 7 · Campo.**
Auditoría acústica formal (con Lúa muda debería ser trivial, pero se mide y se
firma), ensamblado en carcasa impresa sin batería accesible, sesión piloto en
ACOPROS.

---

## 13. Riesgos

| | Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| **R-1** | La latencia real no cabe en el presupuesto (Android negocia intervalos largos, la pila del C3 es lenta) | El refuerzo deja de leerse como consecuencia; Lúa no sirve | Fase 0 lo mide antes que nada. Palanca: `requestConnectionPriority(HIGH)` en Android y animación que arranca en el primer frame parcial |
| **R-2** | Firmware y app se desincronizan en la tabla de opcodes | Comportamiento errático imposible de depurar en campo | Fuente única + gate de CI (§11) |
| **R-3** | Google marca la app por los permisos Bluetooth en el programa Familias | Bloqueo de publicación | Solo API 31+ con `neverForLocation`; política y formulario actualizados en el mismo cambio |
| **R-4** | Deriva de alcance: «ya que tiene pantalla, que muestre el resultado» | Lúa pasa a mostrar información clínica → deja de ser accesorio no decisorio y arrastra a VIA+ | El protocolo no tiene campo de texto. Estructural, no disciplinar |
| **R-5** | Se decide que Lúa suene sin cambiar de placa | Se acaba colgando un zumbador del puerto de expansión sin control de nivel, en un entorno audiológico | D-2 escrito. Cualquier audio pasa por concesión con caducidad y hardware nuevo |
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

**D-B · ¿Se mantiene el nombre «Lúa»?** Choca con la palabra objetivo del banco
gallego (§10). Si el proyecto se llama Lúa internamente y el aparato tiene otro
nombre de cara al niño, el conflicto desaparece.

**D-C · ¿Android 12+ y punto, o se paga el módulo nativo de
`CompanionDeviceManager`?** Recomiendo 12+ (§9, opción 1) y revisar solo si el
censo de dispositivos del piloto lo desmiente.

**D-D · ¿El firmware vive en este repositorio (`firmware/lua/`) o aparte?**
Recomiendo aquí, por la fuente única de la tabla de opcodes. El coste es que
`android.yml` no debe tocarlo: los gates son Node puro, no compilan ESP-IDF.

**D-E · ¿Cuántas unidades para el piloto?** Cambia si la carcasa se imprime o se
moldea, y cambia la conversación sobre marcado.

---

## 15. Seguimiento

| Fase | Estado |
| :--- | :--- |
| 0 · Banco de pruebas | 🟨 **escrito y listo para correr** — falta la placa |
| 1 · Protocolo | 🟨 **generador y gates hechos** — falta probarlo sobre hardware |
| 2 · Puente RN | ⬜ pendiente |
| 3 · Primera integración visible | ⬜ pendiente |
| 4 · Catálogo de expresiones | ⬜ pendiente |
| 5 · Gamificación y Modo Vínculo | ⬜ pendiente |
| 6 · VIA+ | ⬜ pendiente |
| 7 · Campo | ⬜ pendiente |

Lo que YA existe en el árbol: `firmware/lua/` (protocolo, firmware de Fase 0 y
procedimiento), `scripts/build-lua-protocol.js` con sus dos gates, y
`docs/lua-bench.html`. Lo que NO existe: nada medido. Las cifras de §4 siguen
siendo una hipótesis hasta que alguien enchufe la placa.
