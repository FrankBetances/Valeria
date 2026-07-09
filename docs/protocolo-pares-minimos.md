# Protocolo Valeria+ · Pares Mínimos para Dislalias Fonológicas (V1)

Protocolo de ejercicios de **contraste fonológico con pares mínimos** para corregir
las sustituciones más frecuentes en español: **rotacismo** (/r/, /r̄/ → /l/),
**sigmatismo** (/s/ → /θ/ o /t/), **frontalización velar** (/k/ → /t/) y
sustitución /f/ → /p/. Diseñado para la infraestructura existente de la app:

- **TTS**: `speakToChild()` / `speakWordSlow()` (`src/valeriaVoice.ts`).
- **STT**: `startListening()` + `matchTarget()` (`src/valeriaVoice.ts`).
- **Fichas emoji** a pantalla completa y **cápsulas TPR** de movimiento.

---

## 1. Principio de diseño clave

Cada par se elige de modo que **el error de sustitución habitual del niño produzca
exactamente la otra palabra del par**. Si el terapeuta pide *RANA* y el niño tiene
rotacismo lateral, dirá /lána/ → el STT captará literalmente **"lana"**. Así el
reconocedor no necesita análisis fonético fino: **detectar el error = reconocer la
palabra contraria**. Esto convierte un ASR de diccionario en un detector clínico
de sustituciones.

```
Resultado STT          Interpretación clínica        Rama de feedback
─────────────────      ──────────────────────        ────────────────
= palabra objetivo  →  fonema correcto            →  ACIERTO
= palabra contraria →  sustitución habitual       →  CORRECCIÓN ESPECÍFICA
≈ objetivo (nivel 1)→  aproximación               →  CASI (reintento)
ninguna             →  no captado / ruido         →  RE-MODELADO (sin penalizar)
```

### Extensión propuesta del motor de voz

```ts
// valeriaVoice.ts — evaluación de par mínimo sobre matchTarget()
export type PairResult = 'target' | 'foil' | 'close' | 'none';

export function matchPair(alternatives: string[], target: string, foil: string): PairResult {
  if (matchTarget(alternatives, target) === 2) return 'target';
  if (matchTarget(alternatives, foil) === 2) return 'foil';       // sustitución detectada
  return matchTarget(alternatives, target) === 1 ? 'close' : 'none';
}
```

> ⚠️ **Sesgo del ASR**: los reconocedores "autocorrigen" hacia palabras frecuentes
> y pueden devolver la palabra objetivo aunque la articulación fuera defectuosa.
> Mitigación: (a) el orden de comprobación anterior prioriza el objetivo solo con
> coincidencia exacta (nivel 2); (b) tras cada ensayo el padre dispone de un
> **veredicto discreto 👍/👎** que prevalece sobre el STT y se registra como
> `parentOverride` — el padre es el juez final, la app es el árbitro asistente.

---

## 2. Flujo hiperdinámico de un ensayo (≤ 15 s)

Nada en pantalla avanza solo: **cada transición la desbloquea una acción física
conjunta**. Máquina de estados por ensayo:

```
PRESENTACIÓN → CONSIGNA → ESCUCHA → EVALUACIÓN → FEEDBACK → SELLO FÍSICO → siguiente
   (2 s)        (2 s)      (≤4 s)    (instant.)    (≤3 s)     (bloqueante)
```

1. **PRESENTACIÓN** (solo 1.ª vez por par): las dos fichas emoji aparecen lado a
   lado en posiciones aleatorias (izq./dcha. cambia en cada ensayo para impedir
   respuesta posicional). El TTS nombra ambas una vez señalándolas con un halo:
   *"Esta es RANA… y esta es LANA"* (bombardeo auditivo de contraste).
2. **CONSIGNA**: `speakToChild()` lanza la petición (ver consigna por par en §4).
   La consigna siempre nombra al padre para forzar la tríada niño-padre-app:
   *"¡Dile a papá cuál quieres! Di: RANA"*.
3. **ESCUCHA**: el micrófono se abre 400 ms después de acabar el TTS
   (`stopSpeaking()` ya evita que la app se oiga a sí misma). Anillo pulsante
   4 s máx.; los resultados parciales se muestran como luciérnagas, nunca como
   texto (el niño pequeño no lee).
4. **EVALUACIÓN**: `matchPair()` → una de las 4 ramas de la tabla de §1.
5. **FEEDBACK**: ≤ 3 s, específico del par (§4). Regla dura: **la corrección
   nunca dice "mal"**; nombra lo que se oyó, contrasta y re-modela con
   `speakWordSlow()`.
6. **SELLO FÍSICO** (mecánica anti-pasividad central): para pasar al siguiente
   ensayo, padre e hijo deben **pulsar a la vez** dos huellas situadas en
   esquinas opuestas de la pantalla (multi-touch simultáneo, ventana de 700 ms).
   Ninguna sesión puede completarse con el niño solo mirando: sin dos manos
   distintas en pantalla, no hay avance.

### Rotación de roles (cada 3 ensayos)

- **"¡Ahora mandas tú!"**: el niño pide la palabra y **el padre responde**,
  cometiendo a propósito el error de sustitución en uno de sus turnos. El niño
  hace de juez tocando la ficha que oyó (discriminación auditiva, la base del
  contraste fonológico). La app valida con STT lo que dijo el padre.
- **Pausa activa TPR** cada 6 ensayos (cápsulas ya existentes: saltos de rana,
  paso robot, flamenco), siempre en pareja y frente a frente.

### Reglas anti-frustración

- Máximo **2 correcciones seguidas** por ensayo; a la tercera, la app pasa a
  **imitación directa**: `speakWordSlow()` + el padre lo dice tocando la mejilla
  del niño → se puntúa 1★ y se avanza. Nunca se repite un fallo en bucle.
- Rama `none` (no captado) no consume intento ni estrellas.
- Sesión: 10 ensayos por par activo, máx. 2 pares por sesión.

### Puntuación (escala EPT-3 existente)

| Resultado | Estrellas |
|---|---|
| `target` al primer intento | 3★ |
| `target` tras una corrección | 2★ |
| Imitación asistida (3.er intento) | 1★ |

Registro por ensayo: `{ pairId, target, heard, result, attempts, latencyMs, parentOverride }`
→ panel de resultados: % de sustitución por fonema y su evolución entre sesiones.

---

## 3. Progresión en tres niveles por fonema

1. **Nivel 1 · Discriminación** (receptivo): el TTS dice una palabra y el niño
   corre a tocar la ficha correcta **en la tablet que sostiene el padre en alto**
   (el padre la mueve: arriba, a un lado — el niño salta o se estira para tocar).
2. **Nivel 2 · Producción** (este protocolo): el niño pide verbalmente la ficha.
3. **Nivel 3 · Frase**: la consigna exige marco sintáctico: *"Dile a papá: QUIERO
   LA RANA"* (se evalúa con `matchTarget` sobre la frase completa).

Criterio de avance: **≥ 8/10 aciertos en dos sesiones distintas** → siguiente
nivel; superado el nivel 3 → siguiente par del mismo fonema; superados todos los
pares del fonema → siguiente fonema.

---

## 4. Los 10 pares mínimos accionables

Formato de cada par: fichas emoji, fonema objetivo y error que detecta, consigna
TTS, y **lógica de feedback de la interfaz para ambas ramas del STT** (acierto y
sustitución), incluida la pista articulatoria y la **misión física** padre-hijo.

---

### Par 1 · RANA 🐸 / LANA 🧶 — Rotacismo inicial (/r̄/ → /l/)

- **Consigna TTS**: *"¡Dile a papá cuál quieres! Di: RANA."*
- **STT capta "rana" (ACIERTO)**: la rana croa y salta entre las dos fichas;
  lluvia de estrellas. TTS: *"¡RRRANA! ¡Tu lengua vibró como una moto!"*
  **Misión física**: "¡Salto de rana! Salta 3 veces hasta chocar los cinco con
  papá" → el padre confirma con el sello de dos huellas.
- **STT capta "lana" (SUSTITUCIÓN)**: la ficha de la lana se ilumina y el ovillo
  se desenreda (nunca sonido de error). TTS: *"Escuché LANA, la del ovillo. Yo
  pedí RRR-ANA. Escucha…"* + `speakWordSlow('rana')` con la ficha de la rana
  vibrando al ritmo de la /r/.
  **Pista articulatoria**: *"La lengua hace la moto detrás de los dientes: rrr."*
  **Misión física**: el niño pone la mano en la **garganta de papá** mientras
  papá sostiene "rrrrr" 3 segundos y siente la vibración; luego papá pone la
  mano en la garganta del niño y lo intentan juntos. La app cronometra la moto
  con una barra que se llena.

### Par 2 · PERRO 🐶 / PELO 💇 — Rotacismo intervocálico (/r̄/ → /l/)

- **Consigna TTS**: *"¿Quién hace guau? ¡Díselo a papá! Di: PERRO."*
- **STT capta "perro"**: el perro ladra y persigue su cola; confeti. TTS:
  *"¡PERRRO! ¡Qué erre tan fuerte!"*
  **Misión física**: "¡A cuatro patas! Gatea ladrando hasta papá y papá te
  rasca la cabeza" → sello doble para continuar.
- **STT capta "pelo"**: la ficha del pelo se despeina; el perro se tapa las
  orejas con las patas. TTS: *"Escuché PELO, el de la cabeza. El PERRO se quedó
  sin ladrar. Vamos: pe-RRRO."* + `speakWordSlow('perro')`.
  **Pista articulatoria**: *"La erre es una moto larga en medio de la palabra."*
  **Misión física**: "Carrera de motos": padre e hijo agarran un manillar
  imaginario frente a frente y aceleran con "rrrrr" a la vez; la app muestra dos
  motos que avanzan solo mientras el micrófono detecta sonido continuo de ambos.

### Par 3 · RATA 🐀 / LATA 🥫 — Rotacismo inicial (/r̄/ → /l/), generalización

- **Consigna TTS**: *"¡Corre, corre! ¿Quién corre? Di: RATA."*
- **STT capta "rata"**: la rata cruza corriendo la pantalla dejando huellas.
  TTS: *"¡RRRATA veloz! ¡Te salió la erre!"*
  **Misión física**: "¡Pilla-pilla de ratas! Persigue a papá por la habitación
  hasta tocarle la espalda" (la app cuenta atrás 10 s con música).
- **STT capta "lata"**: la lata suena a metal hueco y rueda. TTS: *"Escuché
  LATA, la de la cocina. La lengua se quedó dormida. ¡Despiértala!: RRR-ATA."*
  + `speakWordSlow('rata')`.
  **Pista articulatoria**: *"Punta de la lengua arriba, y que tiemble."*
  **Misión física**: "Tambor de lengua": papá marca el ritmo dando palmadas en
  los muslos del niño (ta-ta-ta) y el niño responde con la lengua (ra-ra-ra),
  subiendo la velocidad hasta que salga la vibración.

### Par 4 · CERO 0️⃣ / CERRO ⛰️ — Vibrante simple vs múltiple (/ɾ/ ↔ /r̄/)

Para el niño que ya tiene /ɾ/ simple pero reduce la múltiple.

- **Consigna TTS**: *"¡Vamos a escalar! Di: CERRO."*
- **STT capta "cerro"**: la montaña crece y aparece una bandera en la cima.
  TTS: *"¡CERRRRO! ¡Esa erre sube hasta la cima!"*
  **Misión física**: "Escalada": padre e hijo, frente a frente con las palmas
  juntas, hacen paso de escalador en el sitio; cada "rrr" del niño hace subir un
  osito por la ladera en pantalla.
- **STT capta "cero"**: aparece un 0 redondo y rebota. TTS: *"Escuché CERO, el
  número redondo. CERRO tiene la moto larga: ce-RRRRO."* + `speakWordSlow('cerro')`
  alargando la vibrante.
  **Pista articulatoria**: *"Una erre cortita es un toque; la del cerro tiembla
  mucho rato."*
  **Misión física**: "La cuerda": papá sostiene una cuerda imaginaria (o real,
  una bufanda); por cada "rrr" largo del niño, papá tira de él un paso hacia la
  'cima' (el sofá). Tres tirones = cima conquistada = sello doble.

### Par 5 · CASA 🏠 / CAZA 🏹 — Sigmatismo interdental (/s/ → /θ/)

> Solo válido en variedades con distinción /s/–/θ/ (España). En regiones
> seseantes la app debe sustituir este par por el Par 6.

- **Consigna TTS**: *"¿Dónde vive el osito? Di: CASA."*
- **STT capta "casa"**: la puerta de la casa se abre y sale el oso Valeria
  saludando. TTS: *"¡CASSSA! ¡Qué serpiente tan fina detrás de los dientes!"*
  **Misión física**: "Techo": padre e hijo construyen el tejado juntando los
  brazos en triángulo por encima de la cabeza del niño; foto-momento opcional.
- **STT capta "caza"**: la flecha del arco sale volando y falla el blanco. TTS:
  *"Escuché CAZA, la de la flecha. Tu serpiente se escapó entre los dientes.
  Ciérralos: CASSSA."* + `speakWordSlow('casa')`.
  **Pista articulatoria**: *"Dientes juntos, sonrisa, y la serpiente sopla por
  detrás: sss."*
  **Misión física**: "Serpiente viajera": mientras el niño sostiene "sss" con
  los dientes cerrados, papá desliza un dedo desde su hombro hasta la mano; si
  la /s/ se rompe o se hace interdental, el dedo-serpiente vuelve al hombro.
  Espejo de mano recomendado: ambos comprueban que la lengua no asoma.

### Par 6 · SIERRA 🪚 / TIERRA 🌍 — Sigmatismo oclusivo (/s/ → /t/)

- **Consigna TTS**: *"¡A cortar el tronco! Di: SIERRA."*
- **STT capta "sierra"**: la sierra corta un tronco en dos con serrín volando.
  TTS: *"¡SSSIERRA! ¡Ese soplido corta troncos!"*
  **Misión física**: "Serrar en pareja": padre e hijo se agarran de las manos y
  hacen el vaivén del leñador (adelante-atrás) mientras ambos sostienen "sss";
  la app anima un tronco que se corta al ritmo del sonido detectado.
- **STT capta "tierra"**: cae un montoncito de tierra y entierra la ficha. TTS:
  *"Escuché TIERRA, la del suelo. La ese no explota: sopla largo. SSS-IERRA."*
  + `speakWordSlow('sierra')`.
  **Pista articulatoria**: *"La T da un golpe; la S es aire que no se acaba."*
  **Misión física**: "El molinillo": papá pone su palma abierta delante de la
  boca del niño. Con "t-t-t" siente golpes de aire; con "sss" siente un viento
  seguido. El niño debe 'empujar' la mano de papá con viento continuo 3 segundos
  (papá la retira lentamente como si el viento la moviera).

### Par 7 · OSO 🐻 / OCHO 8️⃣ — Contraste /s/ ↔ /tʃ/ (sigmatismo palatal / africación)

Detecta ambas direcciones: el niño que dice "oso" por *ocho* (/tʃ/ → /s/) y el
que dice "ocho" por *oso* (/s/ → /tʃ/). La app elige la palabra objetivo según
el perfil del paciente.

- **Consigna TTS** (perfil /tʃ/→/s/): *"¡Cuenta conmigo! Después del siete
  viene… di: OCHO."*
- **STT capta "ocho"**: el 8 hace una voltereta y se convierte en dos burbujas.
  TTS: *"¡O-CHO! ¡Ese tren arrancó genial: ch-ch!"*
  **Misión física**: "Tren del ocho": el niño se agarra a la cintura de papá y
  dan una vuelta en ocho alrededor de dos cojines haciendo "ch-ch-ch".
- **STT capta "oso"**: el oso Valeria aparece encogiéndose de hombros. TTS:
  *"Escuché OSO, el peludo. Yo pedí O-CHO, el número. La che arranca como un
  tren: ch, ch, O-CHO."* + `speakWordSlow('ocho')`.
  **Pista articulatoria**: *"Labios de beso adelante y un golpe de tren: ch."*
  **Misión física**: "Beso-tren": frente a frente, papá y niño ponen labios de
  morrito y lanzan "ch" alternándose como un pase de pelota invisible; cinco
  pases seguidos desbloquean el sello.

### Par 8 · CUBO 🪣 / TUBO 🧪 — Frontalización velar inicial (/k/ → /t/)

- **Consigna TTS**: *"¡A la playa! ¿Con qué hacemos el castillo? Di: CUBO."*
- **STT capta "cubo"**: el cubo se llena de arena y aparece un castillo. TTS:
  *"¡KKKUBO! ¡Esa ka salió de la cueva de la garganta!"*
  **Misión física**: "Transporte de arena": el niño lleva un cojín-cubo
  'pesadísimo' caminando como cangrejo hasta los pies de papá, que lo 'vacía'
  levantando al niño en volandas (o chocando los cinco si pesa mucho).
- **STT capta "tubo"**: el tubo de ensayo burbujea y se tambalea. TTS: *"Escuché
  TUBO, el del laboratorio. La ka del CUBO nace atrás, en la cueva. KKKUBO."*
  + `speakWordSlow('cubo')`.
  **Pista articulatoria**: *"La T vive en los dientes; la K vive al fondo de la
  garganta."*
  **Misión física**: "Gárgaras del gigante": ambos miran al techo con la cabeza
  atrás y hacen "ka-ka-ka"; el niño pone los dedos bajo la barbilla de papá para
  sentir dónde se mueve la K, y luego papá comprueba la del niño.

### Par 9 · BOCA 👄 / BOTA 👢 — Frontalización velar intervocálica (/k/ → /t/)

- **Consigna TTS**: *"¿Con qué damos besos? Di: BOCA."*
- **STT capta "boca"**: la boca sonríe y lanza un beso sonoro. TTS: *"¡BO-KA!
  ¡Qué bien suena esa ka en medio!"*
  **Misión física**: "Cuenta-dientes": el niño señala la boca de papá y papá
  hace una sonrisa gigante; el niño le 'cuenta' cinco dientes con el dedo, y
  papá le devuelve el conteo. Risa garantizada, /k/ contextualizada.
- **STT capta "bota"**: la bota da un pisotón. TTS: *"Escuché BOTA, la del pie.
  BOCA suena atrás: BO-KKKA."* + `speakWordSlow('boca')`.
  **Pista articulatoria**: *"Boca muy abierta de león: la lengua se va sola
  para atrás."*
  **Misión física**: "Bostezo del león": frente a frente, ambos abren la boca
  al máximo en bostezo de león y sueltan "kaaa" desde el fondo; el que haga el
  bostezo más exagerado gana la ronda (juzga la app con un aplauso aleatorio).

### Par 10 · FUENTE ⛲ / PUENTE 🌉 — Sustitución /f/ → /p/

- **Consigna TTS**: *"¿De dónde sale el agua? Di: FUENTE."*
- **STT capta "fuente"**: la fuente lanza chorros de agua con arcoíris. TTS:
  *"¡FFFUENTE! ¡Ese soplido de conejo moja todo!"*
  **Misión física**: "Fuente humana": el niño se agacha y 'brota' hacia arriba
  moviendo los brazos como chorros que salpican a papá; papá se 'moja' con
  gesto exagerado y sacude el pelo.
- **STT capta "puente"**: el puente se cruza y la ficha tiembla como pasos. TTS:
  *"Escuché PUENTE, el de cruzar. La efe muerde el labio y sopla: FFF-UENTE."*
  + `speakWordSlow('fuente')`.
  **Pista articulatoria**: *"Dientes de conejo sobre el labio de abajo, y
  sopla."*
  **Misión física**: "El papel volador": papá sostiene un trocito de papel en la
  palma frente a la boca del niño. Con "fff" el papel se inclina y aguanta; con
  "p" solo da un salto. Reto: mover el papel 3 segundos seguidos. Después se
  invierten los papeles y el niño evalúa el soplido de papá.

---

## 5. Resumen operativo de los pares

| # | Objetivo | Contraste | Error que detecta el STT | Fonema |
|---|---|---|---|---|
| 1 | RANA 🐸 | LANA 🧶 | rotacismo lateral inicial | /r̄/ → /l/ |
| 2 | PERRO 🐶 | PELO 💇 | rotacismo intervocálico | /r̄/ → /l/ |
| 3 | RATA 🐀 | LATA 🥫 | rotacismo inicial (generalización) | /r̄/ → /l/ |
| 4 | CERRO ⛰️ | CERO 0️⃣ | reducción de vibrante múltiple | /r̄/ → /ɾ/ |
| 5 | CASA 🏠 | CAZA 🏹 | sigmatismo interdental (España) | /s/ → /θ/ |
| 6 | SIERRA 🪚 | TIERRA 🌍 | sigmatismo oclusivo | /s/ → /t/ |
| 7 | OCHO 8️⃣ | OSO 🐻 | despalatalización de africada | /tʃ/ ↔ /s/ |
| 8 | CUBO 🪣 | TUBO 🧪 | frontalización velar inicial | /k/ → /t/ |
| 9 | BOCA 👄 | BOTA 👢 | frontalización velar media | /k/ → /t/ |
| 10 | FUENTE ⛲ | PUENTE 🌉 | oclusivización de fricativa | /f/ → /p/ |

## 6. Estructura de datos propuesta

```ts
export interface MinimalPair {
  id: string;                 // 'rana-lana'
  target: string;             // palabra pedida
  foil: string;               // palabra que produce el error habitual
  targetEmoji: string;
  foilEmoji: string;
  phoneme: string;            // 'r̄→l', 's→t', 'k→t', 'f→p', 'tʃ↔s', 'r̄→ɾ'
  prompt: string;             // consigna TTS (speakToChild)
  onTarget: { say: string; animation: string; mission: string };
  onFoil:   { say: string; cue: string; animation: string; mission: string };
  region?: 'distincion';      // Par 5: solo variedades con /θ/
}
```

Con `matchPair()` (§1), esta lista de 10 objetos y las mecánicas de §2, el par
mínimo se integra como un tipo de ejercicio más en `ValeriaExercisePlayerScreen`
reutilizando `MicPracticeCard` como base del estado de escucha.
