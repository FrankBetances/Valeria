// ============================================================================
// Valeria+ · Banco de Trazos y Grafomotricidad para Dislexia
// Catálogo de modelos de letras críticas, lazos pre-escritura y palabras guiadas.
// ============================================================================
import { ModelPathGuide } from './valeriaWritingTypes';

export interface WritingItem {
  id: string;
  category: 'critical' | 'warmup';
  title: string;
  phoneme: string;
  prompt: string;
  contrastWith?: string;
  guide: ModelPathGuide;
}

// ----------------------------------------------------------------------------
// Elogios LOCUTADOS de la pizarra, por variedad. Viven aquí y no en el catálogo
// de interfaz por el mismo motivo que MIC_VERDICT_SAY: lo que la app pronuncia
// se hornea en el corpus de voz, y el corpus solo puede importar módulos puros
// de datos. Índices: 0 = pizarra libre · 1 = trazo correcto · 2 = casi.
//
// CUALQUIER retoque de estas cadenas exige `node scripts/export-voice-corpus.js`
// en el MISMO commit; si no, el id deja de resolver y la frase cae a la voz del
// sistema (y en gallego y euskera se pierden Celtia e ILENIA).
// ----------------------------------------------------------------------------
export type WritingPraise = readonly [string, string, string];

export const WRITING_PRAISE: WritingPraise = [
  '¡Qué dibujo tan bonito has hecho en la pizarra!',
  '¡Excelente! Has seguido la dirección perfecta.',
  '¡Casi casi! Sigue las flechas y los números despacito.',
];

export const WRITING_PRAISE_GL: WritingPraise = [
  'Que debuxo tan bonito fixeches no encerado!',
  'Excelente! Seguiches a dirección á perfección.',
  'Case case! Segue as frechas e os números amodiño.',
];

export const WRITING_PRAISE_EU: WritingPraise = [
  'Zein marrazki polita egin duzun arbelean!',
  'Bikain! Norabidea ezin hobeto jarraitu duzu.',
  'Ia-ia! Jarraitu geziak eta zenbakiak poliki-poliki.',
];

export const WRITING_PRAISE_CA: WritingPraise = [
  'Quin dibuix més bonic que has fet a la pissarra!',
  'Excel·lent! Has seguit la direcció a la perfecció.',
  'Gairebé! Segueix les fletxes i els números a poc a poc.',
];

export const WRITING_PRAISE_EN: WritingPraise = [
  'What a lovely drawing you made on the chalkboard!',
  'Excellent! You followed the direction perfectly.',
  'Almost there! Follow the arrows and the numbers slowly.',
];

/** Elogio de la variedad activa. `loc` es el contentLocale de valeriaLocale. */
export const writingPraiseFor = (loc: string, kind: 0 | 1 | 2): string =>
  loc === 'eu' ? WRITING_PRAISE_EU[kind]
    : loc === 'gl' ? WRITING_PRAISE_GL[kind]
      : loc === 'en-US' ? WRITING_PRAISE_EN[kind]
        : loc === 'ca' ? WRITING_PRAISE_CA[kind]
          : WRITING_PRAISE[kind];

// ----------------------------------------------------------------------------
// GEOMETRÍA — leer antes de añadir un trazo
//
// Los modelos se dibujan en coordenadas absolutas sobre un lienzo de
// 310 px de alto y ~330-440 px de ancho (ValeriaWritingExerciseScreen fija
// `min(ancho - 32, 440)` x 310). No hay viewBox ni escalado: lo que se escribe
// aquí es lo que se pinta, así que un trazo fuera de rango se sale del lienzo
// en los teléfonos estrechos y nadie lo ve hasta que se abre la pantalla.
//
//   · x seguro:  110 – 290   (el mínimo real es 50, pero solo en los lazos,
//                             que ocupan todo el ancho a propósito)
//   · pauta:     ascendente y=70 · altura de x y=160 · base y=230 ·
//                descendente y=270
//
// Los WAYPOINTS no son decoración: el lienzo los usa para puntuar (tolerancia
// de 32 px, hace falta tocar el 75 %) y su `order` es lo único que distingue
// una b de una d trazada al revés. Dos waypoints a menos de ~35 px se tocan
// con un solo gesto y además sus círculos (r=16) se solapan en pantalla.
// ----------------------------------------------------------------------------
export const WRITING_EXERCISES: WritingItem[] = [
  // --- Nivel 1: Letras Críticas Anti-Inversión (Dislexia) ---
  //
  // Doce letras en seis contrastes CERRADOS: cada `contrastWith` apunta a otra
  // letra que también está en este banco, así que el par confundible siempre se
  // puede entrenar entero. b↔d · p↔q · m↔n · n↔u · a↔e · s↔z, y g contra q.
  {
    id: 'crit-b',
    category: 'critical',
    title: 'Letra b (de barco)',
    phoneme: 'b',
    prompt: 'El palo baja primero, y luego la barriga a la derecha.',
    contrastWith: 'd',
    guide: {
      id: 'guide-b',
      label: 'b',
      soundCue: 'b',
      // Línea vertical que baja y círculo a la derecha
      svgPath: 'M 110 70 L 110 230 C 110 230 140 160 185 160 C 230 160 230 230 185 230 C 140 230 110 230 110 230',
      waypoints: [
        { id: 1, x: 110, y: 70, label: '1', order: 1 },
        { id: 2, x: 110, y: 150, label: '2', order: 2 },
        { id: 3, x: 110, y: 230, label: '3', order: 3 },
        { id: 4, x: 185, y: 160, label: '4', order: 4 },
        { id: 5, x: 220, y: 195, label: '5', order: 5 },
        { id: 6, x: 185, y: 230, label: '6', order: 6 },
      ],
    },
  },
  {
    id: 'crit-d',
    category: 'critical',
    title: 'Letra d (de dado)',
    phoneme: 'd',
    prompt: 'La barriga redonda va primero, y el palo alto a la derecha.',
    contrastWith: 'b',
    guide: {
      id: 'guide-d',
      label: 'd',
      soundCue: 'd',
      // Círculo a la izquierda y línea vertical que baja a la derecha
      svgPath: 'M 190 160 C 145 160 145 230 190 230 C 235 230 235 160 190 160 M 230 70 L 230 230',
      waypoints: [
        { id: 1, x: 190, y: 160, label: '1', order: 1 },
        { id: 2, x: 145, y: 195, label: '2', order: 2 },
        { id: 3, x: 190, y: 230, label: '3', order: 3 },
        { id: 4, x: 230, y: 70, label: '4', order: 4 },
        { id: 5, x: 230, y: 150, label: '5', order: 5 },
        { id: 6, x: 230, y: 230, label: '6', order: 6 },
      ],
    },
  },
  {
    id: 'crit-p',
    category: 'critical',
    title: 'Letra p (de pelota)',
    phoneme: 'p',
    prompt: 'El palo baja largo hacia abajo, y la cabeza redonda arriba.',
    contrastWith: 'q',
    guide: {
      id: 'guide-p',
      label: 'p',
      soundCue: 'p',
      svgPath: 'M 110 150 L 110 270 M 110 150 C 110 150 145 150 185 150 C 225 150 225 210 185 210 C 145 210 110 210 110 210',
      waypoints: [
        { id: 1, x: 110, y: 150, label: '1', order: 1 },
        { id: 2, x: 110, y: 210, label: '2', order: 2 },
        { id: 3, x: 110, y: 270, label: '3', order: 3 },
        { id: 4, x: 185, y: 150, label: '4', order: 4 },
        { id: 5, x: 220, y: 180, label: '5', order: 5 },
        { id: 6, x: 185, y: 210, label: '6', order: 6 },
      ],
    },
  },
  {
    // El espejo exacto de la p: misma barriga, mismo palo largo, lado contrario.
    // Y el ORDEN invertido a propósito (barriga primero, como en la d): es lo
    // único que un niño puede sentir en la mano cuando las dos letras se ven
    // casi iguales.
    id: 'crit-q',
    category: 'critical',
    title: 'Letra q (de queso)',
    phoneme: 'q',
    prompt: 'Primero la barriga a la izquierda, y luego el palo largo baja por la derecha.',
    contrastWith: 'p',
    guide: {
      id: 'guide-q',
      label: 'q',
      soundCue: 'q',
      svgPath: 'M 230 195 C 230 176 205 160 175 160 C 145 160 120 176 120 195 C 120 214 145 230 175 230 C 205 230 230 214 230 195 M 230 160 L 230 270',
      waypoints: [
        { id: 1, x: 175, y: 160, label: '1', order: 1 },
        { id: 2, x: 120, y: 195, label: '2', order: 2 },
        { id: 3, x: 175, y: 230, label: '3', order: 3 },
        { id: 4, x: 230, y: 160, label: '4', order: 4 },
        { id: 5, x: 230, y: 215, label: '5', order: 5 },
        { id: 6, x: 230, y: 270, label: '6', order: 6 },
      ],
    },
  },
  {
    id: 'crit-m',
    category: 'critical',
    title: 'Letra m (de moto)',
    phoneme: 'm',
    prompt: 'Un palito y dos montañitas seguidas.',
    contrastWith: 'n',
    guide: {
      id: 'guide-m',
      label: 'm',
      soundCue: 'm',
      svgPath: 'M 70 160 L 70 230 M 70 180 C 70 160 110 160 130 180 L 130 230 M 130 180 C 130 160 170 160 190 180 L 190 230',
      waypoints: [
        { id: 1, x: 70, y: 160, label: '1', order: 1 },
        { id: 2, x: 70, y: 230, label: '2', order: 2 },
        { id: 3, x: 110, y: 160, label: '3', order: 3 },
        { id: 4, x: 130, y: 230, label: '4', order: 4 },
        { id: 5, x: 170, y: 160, label: '5', order: 5 },
        { id: 6, x: 190, y: 230, label: '6', order: 6 },
      ],
    },
  },

  {
    // La m con una montaña menos. Se traza igual y se cuenta distinto: contar
    // las montañas es la estrategia que el niño se lleva a la lectura.
    id: 'crit-n',
    category: 'critical',
    title: 'Letra n (de nube)',
    phoneme: 'n',
    prompt: 'Un palito y UNA sola montañita. La m tiene dos; la n, una.',
    contrastWith: 'm',
    guide: {
      id: 'guide-n',
      label: 'n',
      soundCue: 'n',
      svgPath: 'M 110 160 L 110 230 M 110 182 C 110 156 165 156 190 182 L 190 230',
      waypoints: [
        { id: 1, x: 110, y: 160, label: '1', order: 1 },
        { id: 2, x: 110, y: 230, label: '2', order: 2 },
        { id: 3, x: 148, y: 163, label: '3', order: 3 },
        { id: 4, x: 190, y: 186, label: '4', order: 4 },
        { id: 5, x: 190, y: 230, label: '5', order: 5 },
      ],
    },
  },
  {
    // n y u no se confunden por espejo sino por GIRO: son la misma forma
    // rotada media vuelta. Por eso la consigna habla de por dónde se abre.
    id: 'crit-u',
    category: 'critical',
    title: 'Letra u (de uva)',
    phoneme: 'u',
    prompt: 'La u es un vaso: se abre arriba. La n es un puente: se abre abajo.',
    contrastWith: 'n',
    guide: {
      id: 'guide-u',
      label: 'u',
      soundCue: 'u',
      svgPath: 'M 110 160 L 110 202 C 110 236 190 236 190 202 L 190 160',
      waypoints: [
        { id: 1, x: 110, y: 160, label: '1', order: 1 },
        { id: 2, x: 110, y: 205, label: '2', order: 2 },
        { id: 3, x: 150, y: 228, label: '3', order: 3 },
        { id: 4, x: 190, y: 205, label: '4', order: 4 },
        { id: 5, x: 190, y: 160, label: '5', order: 5 },
      ],
    },
  },
  {
    // Redonda + palo, de un solo trazo. Entra antes que la e porque comparten
    // la misma barriga y la a la cierra entera; la e la corta.
    id: 'crit-a',
    category: 'critical',
    title: 'Letra a (de agua)',
    phoneme: 'a',
    prompt: 'Empieza arriba a la derecha, da la vuelta entera y baja el palito.',
    contrastWith: 'e',
    guide: {
      id: 'guide-a',
      label: 'a',
      soundCue: 'a',
      svgPath: 'M 210 195 C 210 176 185 160 155 160 C 125 160 100 176 100 195 C 100 214 125 230 155 230 C 185 230 210 214 210 195 M 210 160 L 210 232',
      waypoints: [
        { id: 1, x: 155, y: 160, label: '1', order: 1 },
        { id: 2, x: 100, y: 195, label: '2', order: 2 },
        { id: 3, x: 155, y: 230, label: '3', order: 3 },
        { id: 4, x: 210, y: 160, label: '4', order: 4 },
        { id: 5, x: 210, y: 232, label: '5', order: 5 },
      ],
    },
  },
  {
    // La única letra que NO empieza por arriba: arranca a media altura con la
    // rayita. Quien la empieza como una a acaba escribiendo una a.
    id: 'crit-e',
    category: 'critical',
    title: 'Letra e (de estrella)',
    phoneme: 'e',
    prompt: 'Primero la rayita del medio, y después das la vuelta hacia arriba.',
    contrastWith: 'a',
    guide: {
      id: 'guide-e',
      label: 'e',
      soundCue: 'e',
      svgPath: 'M 105 195 L 210 195 C 210 172 185 160 155 160 C 122 160 100 178 100 197 C 100 220 128 233 158 231',
      waypoints: [
        { id: 1, x: 105, y: 195, label: '1', order: 1 },
        { id: 2, x: 210, y: 195, label: '2', order: 2 },
        { id: 3, x: 155, y: 160, label: '3', order: 3 },
        { id: 4, x: 152, y: 231, label: '4', order: 4 },
      ],
    },
  },
  {
    // La s se invierte en espejo con la misma frecuencia que la b: no tiene par
    // gráfico, así que el contraste útil es la z, que hace el mismo recorrido
    // con esquinas en vez de curvas.
    id: 'crit-s',
    category: 'critical',
    title: 'Letra s (de sol)',
    phoneme: 's',
    prompt: 'Sale hacia la izquierda por arriba y vuelve hacia la izquierda por abajo, como una serpiente.',
    contrastWith: 'z',
    guide: {
      id: 'guide-s',
      label: 's',
      soundCue: 's',
      svgPath: 'M 196 176 C 196 158 128 156 128 182 C 128 200 196 196 196 214 C 196 236 128 234 126 214',
      waypoints: [
        { id: 1, x: 196, y: 176, label: '1', order: 1 },
        { id: 2, x: 128, y: 182, label: '2', order: 2 },
        { id: 3, x: 196, y: 214, label: '3', order: 3 },
        { id: 4, x: 127, y: 217, label: '4', order: 4 },
      ],
    },
  },
  {
    id: 'crit-z',
    category: 'critical',
    title: 'Letra z (de zapato)',
    phoneme: 'z',
    prompt: 'Una raya arriba, bajas en diagonal y otra raya abajo. Tres esquinas y ya está.',
    contrastWith: 's',
    guide: {
      id: 'guide-z',
      label: 'z',
      soundCue: 'z',
      svgPath: 'M 110 162 L 210 162 L 110 228 L 210 228',
      waypoints: [
        { id: 1, x: 110, y: 162, label: '1', order: 1 },
        { id: 2, x: 210, y: 162, label: '2', order: 2 },
        { id: 3, x: 160, y: 195, label: '3', order: 3 },
        { id: 4, x: 110, y: 228, label: '4', order: 4 },
        { id: 5, x: 210, y: 228, label: '5', order: 5 },
      ],
    },
  },
  {
    // Cierra el grupo porque necesita las dos cosas que ya se han trabajado: la
    // barriga de la a y el descendente de la q. Su rabito gira a la izquierda;
    // el palo de la q baja recto. Ahí está toda la diferencia.
    id: 'crit-g',
    category: 'critical',
    title: 'Letra g (de gato)',
    phoneme: 'g',
    prompt: 'La barriga como la de la a, y abajo un rabito que se curva hacia la izquierda.',
    contrastWith: 'q',
    guide: {
      id: 'guide-g',
      label: 'g',
      soundCue: 'g',
      svgPath: 'M 210 195 C 210 176 185 160 155 160 C 125 160 100 176 100 195 C 100 214 125 230 155 230 C 185 230 210 214 210 195 M 210 160 L 210 250 C 210 272 165 276 140 264',
      waypoints: [
        { id: 1, x: 155, y: 160, label: '1', order: 1 },
        { id: 2, x: 100, y: 195, label: '2', order: 2 },
        { id: 3, x: 155, y: 230, label: '3', order: 3 },
        { id: 4, x: 210, y: 160, label: '4', order: 4 },
        { id: 5, x: 210, y: 250, label: '5', order: 5 },
        { id: 6, x: 145, y: 266, label: '6', order: 6 },
      ],
    },
  },

  // --- Nivel 2: Lazos y Calentamiento Grafomotor ---
  //
  // Seis patrones, cada uno con una destreza motora distinta: ondulación
  // suave (olas), giro continuo sin levantar (bucles), inversión angular
  // (montañas), arcada con retorno (puentes), rotación de radio decreciente
  // (caracol) y cruce de la línea media del cuerpo (ocho tumbado).
  {
    id: 'warm-waves',
    category: 'warmup',
    title: 'Olas del mar',
    phoneme: 'olas',
    prompt: 'Sube y baja suave como las olas del mar.',
    guide: {
      id: 'guide-waves',
      label: 'Olas',
      svgPath: 'M 48 200 Q 87 140 126 200 Q 165 140 204 200 Q 243 140 282 200',
      waypoints: [
        { id: 1, x: 48, y: 200, label: '1', order: 1 },
        { id: 2, x: 87, y: 170, label: '2', order: 2 },
        { id: 3, x: 126, y: 200, label: '3', order: 3 },
        { id: 4, x: 165, y: 170, label: '4', order: 4 },
        { id: 5, x: 204, y: 200, label: '5', order: 5 },
        { id: 6, x: 243, y: 170, label: '6', order: 6 },
        { id: 7, x: 282, y: 200, label: '7', order: 7 },
      ],
    },
  },
  {
    id: 'warm-loops',
    category: 'warmup',
    title: 'Bucles de Lúa',
    phoneme: 'bucles',
    prompt: 'Haz giros hacia arriba sin levantar el lápiz.',
    guide: {
      id: 'guide-loops',
      label: 'Lazos',
      svgPath: 'M 60 210 C 60 130 110 130 110 210 C 110 130 160 130 160 210 C 160 130 210 130 210 210 C 210 130 260 130 260 210',
      waypoints: [
        { id: 1, x: 60, y: 210, label: '1', order: 1 },
        { id: 2, x: 85, y: 130, label: '2', order: 2 },
        { id: 3, x: 110, y: 210, label: '3', order: 3 },
        { id: 4, x: 135, y: 130, label: '4', order: 4 },
        { id: 5, x: 160, y: 210, label: '5', order: 5 },
        { id: 6, x: 185, y: 130, label: '6', order: 6 },
        { id: 7, x: 210, y: 210, label: '7', order: 7 },
        { id: 8, x: 235, y: 130, label: '8', order: 8 },
        { id: 9, x: 260, y: 210, label: '9', order: 9 },
      ],
    },
  },
  {
    // Lo contrario de las olas: aquí la mano tiene que FRENAR y cambiar de
    // sentido en seco. Es el gesto que luego pide la v, la w y la z.
    id: 'warm-zigzag',
    category: 'warmup',
    title: 'Montañas puntiagudas',
    phoneme: 'montañas',
    prompt: 'Sube y baja haciendo picos. Para en seco en cada punta.',
    guide: {
      id: 'guide-zigzag',
      label: 'Picos',
      svgPath: 'M 50 220 L 89 150 L 128 220 L 167 150 L 206 220 L 245 150 L 284 220',
      waypoints: [
        { id: 1, x: 50, y: 220, label: '1', order: 1 },
        { id: 2, x: 89, y: 150, label: '2', order: 2 },
        { id: 3, x: 128, y: 220, label: '3', order: 3 },
        { id: 4, x: 167, y: 150, label: '4', order: 4 },
        { id: 5, x: 206, y: 220, label: '5', order: 5 },
        { id: 6, x: 245, y: 150, label: '6', order: 6 },
        { id: 7, x: 284, y: 220, label: '7', order: 7 },
      ],
    },
  },
  {
    // La arcada que apoya en la línea base y vuelve a subir: es literalmente la
    // forma de la m, la n y la h antes de llamarse letras.
    id: 'warm-bridges',
    category: 'warmup',
    title: 'Los puentes de Lúa',
    phoneme: 'puentes',
    prompt: 'Arcos redondos que tocan el suelo y vuelven a subir. Uno detrás de otro.',
    guide: {
      id: 'guide-bridges',
      label: 'Puentes',
      svgPath: 'M 50 225 C 50 165 108 165 108 225 M 108 225 C 108 165 166 165 166 225 M 166 225 C 166 165 224 165 224 225 M 224 225 C 224 165 282 165 282 225',
      waypoints: [
        { id: 1, x: 50, y: 225, label: '1', order: 1 },
        { id: 2, x: 79, y: 180, label: '2', order: 2 },
        { id: 3, x: 108, y: 225, label: '3', order: 3 },
        { id: 4, x: 137, y: 180, label: '4', order: 4 },
        { id: 5, x: 166, y: 225, label: '5', order: 5 },
        { id: 6, x: 195, y: 180, label: '6', order: 6 },
        { id: 7, x: 224, y: 225, label: '7', order: 7 },
        { id: 8, x: 253, y: 180, label: '8', order: 8 },
        { id: 9, x: 282, y: 225, label: '9', order: 9 },
      ],
    },
  },
  {
    // Giro continuo con radio que se cierra: obliga a mover el hombro y la
    // muñeca a la vez y a graduar la presión. Es el lazo más exigente de los
    // seis, por eso va el penúltimo.
    id: 'warm-spiral',
    category: 'warmup',
    title: 'El caracol de Lúa',
    phoneme: 'caracol',
    prompt: 'Da vueltas hacia dentro sin levantar el lápiz, cada vez más pequeñas.',
    guide: {
      id: 'guide-spiral',
      label: 'Caracol',
      svgPath: 'M 165 125 C 215 125 247 160 247 195 C 247 230 205 252 165 252 C 125 252 101 223 101 195 C 101 167 134 151 165 151 C 196 151 213 175 213 195 C 213 215 187 225 165 225 C 143 225 135 208 135 195 C 135 182 153 178 165 178',
      waypoints: [
        { id: 1, x: 165, y: 125, label: '1', order: 1 },
        { id: 2, x: 247, y: 195, label: '2', order: 2 },
        { id: 3, x: 165, y: 252, label: '3', order: 3 },
        { id: 4, x: 101, y: 195, label: '4', order: 4 },
        { id: 5, x: 213, y: 195, label: '5', order: 5 },
      ],
    },
  },
  {
    // El ocho tumbado cruza la línea media del cuerpo una y otra vez con la
    // misma mano, que es justo lo que la escritura de izquierda a derecha va a
    // exigir durante todo un renglón. Se traza grande y despacio, a propósito.
    id: 'warm-eight',
    category: 'warmup',
    title: 'El ocho tumbado',
    phoneme: 'ocho',
    prompt: 'Desde el centro, una vuelta grande a un lado y otra al otro, sin parar.',
    guide: {
      id: 'guide-eight',
      label: 'Ocho',
      svgPath: 'M 166 195 C 126 150 56 150 51 195 C 46 240 126 240 166 195 C 206 150 276 150 281 195 C 286 240 206 240 166 195',
      waypoints: [
        { id: 1, x: 166, y: 195, label: '1', order: 1 },
        { id: 2, x: 107, y: 162, label: '2', order: 2 },
        { id: 3, x: 51, y: 195, label: '3', order: 3 },
        { id: 4, x: 107, y: 227, label: '4', order: 4 },
        { id: 5, x: 225, y: 162, label: '5', order: 5 },
        { id: 6, x: 281, y: 195, label: '6', order: 6 },
        { id: 7, x: 225, y: 227, label: '7', order: 7 },
      ],
    },
  },
];
