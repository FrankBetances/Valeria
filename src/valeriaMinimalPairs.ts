// ============================================================================
// Valeria+ · Pares Mínimos para Dislalias Fonológicas (V6.1)
// Banco de 15 pares de contraste fonológico. Principio de diseño: cada par se
// elige para que el ERROR DE SUSTITUCIÓN habitual del niño produzca exactamente
// la otra palabra del par (rotacismo: pido "rana" → dice /lána/ → el ASR capta
// "lana"). Así el reconocedor de diccionario funciona como detector clínico.
// Protocolo completo: docs/protocolo-pares-minimos.md
// ============================================================================

export type PairGroup = 'Rotacismo' | 'Sigmatismo' | 'Velares' | 'Labiodental' | 'Nasales' | 'Laterales';

export interface MinimalPair {
  id: string;
  code: string;            // PM-1 … PM-10
  group: PairGroup;
  target: string;          // palabra que pide el TTS
  targetEmoji: string;
  foil: string;            // palabra que produce el error habitual
  foilEmoji: string;
  phoneme: string;         // contraste, p. ej. 'r̄ → l'
  errorLabel: string;      // nombre clínico del error que detecta
  prompt: string;          // consigna TTS (speakToChild)
  onTarget: {
    say: string;           // celebración hablada
    mission: string;       // misión física padre-hijo de celebración
  };
  onFoil: {
    say: string;           // corrección hablada: nombra lo oído y contrasta
    cue: string;           // pista articulatoria
    mission: string;       // misión física correctiva en pareja
  };
  region?: 'distincion';   // solo variedades con /s/–/θ/ (España)
}

export const MINIMAL_PAIRS: MinimalPair[] = [
  {
    id: 'rana-lana', code: 'PM-1', group: 'Rotacismo',
    target: 'rana', targetEmoji: '🐸', foil: 'lana', foilEmoji: '🧶',
    phoneme: 'r̄ → l', errorLabel: 'Rotacismo inicial',
    prompt: '¡Dile a papá cuál quieres! Di: rana.',
    onTarget: {
      say: '¡Rrrana! ¡Tu lengua vibró como una moto!',
      mission: '¡Salto de rana! Tres saltos hasta chocar los cinco con papá.',
    },
    onFoil: {
      say: 'Escuché lana, la del ovillo. Yo pedí rrrana. Escucha…',
      cue: 'La lengua hace la moto detrás de los dientes: rrr.',
      mission: 'Mano en la garganta de papá: papá sostiene rrrrr tres segundos y el niño siente la vibración. Luego, al revés.',
    },
  },
  {
    id: 'perro-pelo', code: 'PM-2', group: 'Rotacismo',
    target: 'perro', targetEmoji: '🐶', foil: 'pelo', foilEmoji: '💇',
    phoneme: 'r̄ → l', errorLabel: 'Rotacismo intervocálico',
    prompt: '¿Quién hace guau? ¡Díselo a papá! Di: perro.',
    onTarget: {
      say: '¡Perrro! ¡Qué erre tan fuerte!',
      mission: '¡A cuatro patas! Gatea ladrando hasta papá y que te rasque la cabeza.',
    },
    onFoil: {
      say: 'Escuché pelo, el de la cabeza. El perro se quedó sin ladrar. Vamos: perrro.',
      cue: 'La erre es una moto larga en medio de la palabra.',
      mission: 'Carrera de motos: manillar imaginario frente a frente y acelerad con rrr a la vez.',
    },
  },
  {
    id: 'rata-lata', code: 'PM-3', group: 'Rotacismo',
    target: 'rata', targetEmoji: '🐀', foil: 'lata', foilEmoji: '🥫',
    phoneme: 'r̄ → l', errorLabel: 'Rotacismo inicial (generalización)',
    prompt: '¡Corre, corre! ¿Quién corre? Di: rata.',
    onTarget: {
      say: '¡Rrrata veloz! ¡Te salió la erre!',
      mission: '¡Pilla-pilla de ratas! Persigue a papá por la habitación hasta tocarle la espalda.',
    },
    onFoil: {
      say: 'Escuché lata, la de la cocina. La lengua se quedó dormida. ¡Despiértala!: rrrata.',
      cue: 'Punta de la lengua arriba, y que tiemble.',
      mission: 'Tambor de lengua: papá marca ta-ta-ta con palmadas en los muslos y el niño responde ra-ra-ra, cada vez más rápido.',
    },
  },
  {
    id: 'cerro-cero', code: 'PM-4', group: 'Rotacismo',
    target: 'cerro', targetEmoji: '⛰️', foil: 'cero', foilEmoji: '0️⃣',
    phoneme: 'r̄ → ɾ', errorLabel: 'Reducción de vibrante múltiple',
    prompt: '¡Vamos a escalar! Di: cerro.',
    onTarget: {
      say: '¡Cerrro! ¡Esa erre sube hasta la cima!',
      mission: 'Escalada: palmas contra palmas con papá y paso de escalador en el sitio hasta la cima.',
    },
    onFoil: {
      say: 'Escuché cero, el número redondo. Cerro tiene la moto larga: cerrro.',
      cue: 'La erre corta es un toque; la del cerro tiembla mucho rato.',
      mission: 'La cuerda: por cada rrr largo del niño, papá tira de él un paso hacia la cima (el sofá). Tres tirones y ¡cima!',
    },
  },
  {
    id: 'casa-caza', code: 'PM-5', group: 'Sigmatismo',
    target: 'casa', targetEmoji: '🏠', foil: 'caza', foilEmoji: '🏹',
    phoneme: 's → θ', errorLabel: 'Sigmatismo interdental',
    prompt: '¿Dónde vive el osito? Di: casa.',
    region: 'distincion',
    onTarget: {
      say: '¡Casa! ¡Qué serpiente tan fina detrás de los dientes!',
      mission: 'Haced el tejado juntando los brazos en triángulo por encima de la cabeza del niño.',
    },
    onFoil: {
      say: 'Escuché caza, la de la flecha. Tu serpiente se escapó entre los dientes. Ciérralos: casa.',
      cue: 'Dientes juntos, sonrisa, y la serpiente sopla por detrás: sss.',
      mission: 'Serpiente viajera: mientras dura la sss, papá desliza un dedo del hombro a la mano del niño. Si la ese se rompe, la serpiente vuelve al hombro.',
    },
  },
  {
    id: 'sierra-tierra', code: 'PM-6', group: 'Sigmatismo',
    target: 'sierra', targetEmoji: '🪚', foil: 'tierra', foilEmoji: '🌍',
    phoneme: 's → t', errorLabel: 'Sigmatismo oclusivo',
    prompt: '¡A cortar el tronco! Di: sierra.',
    onTarget: {
      say: '¡Sierra! ¡Ese soplido corta troncos!',
      mission: 'Serrad en pareja: manos agarradas y vaivén de leñador mientras los dos hacéis sss.',
    },
    onFoil: {
      say: 'Escuché tierra, la del suelo. La ese no explota: sopla largo. Sierra.',
      cue: 'La te da un golpe; la ese es aire que no se acaba.',
      mission: 'El molinillo: palma de papá delante de la boca del niño. Con t-t-t siente golpes; con sss, un viento seguido que empuja la mano tres segundos.',
    },
  },
  {
    id: 'ocho-oso', code: 'PM-7', group: 'Sigmatismo',
    target: 'ocho', targetEmoji: '8️⃣', foil: 'oso', foilEmoji: '🐻',
    phoneme: 'tʃ ↔ s', errorLabel: 'Despalatalización de africada',
    prompt: 'Después del siete viene… ¡di: ocho!',
    onTarget: {
      say: '¡Ocho! ¡Ese tren arrancó genial!',
      mission: 'Tren del ocho: agárrate a la cintura de papá y dad una vuelta en forma de ocho haciendo ch-ch-ch.',
    },
    onFoil: {
      say: 'Escuché oso, el peludo. Yo pedí ocho, el número. La che arranca como un tren: ocho.',
      cue: 'Labios de beso adelante y un golpe de tren: ch.',
      mission: 'Beso-tren: frente a frente, lanzad una che alternándoos como un pase de pelota invisible. Cinco pases seguidos.',
    },
  },
  {
    id: 'cubo-tubo', code: 'PM-8', group: 'Velares',
    target: 'cubo', targetEmoji: '🪣', foil: 'tubo', foilEmoji: '🧪',
    phoneme: 'k → t', errorLabel: 'Frontalización velar inicial',
    prompt: '¿Con qué hacemos el castillo de arena? Di: cubo.',
    onTarget: {
      say: '¡Cubo! ¡Esa ka salió de la cueva de la garganta!',
      mission: 'Transporta el cojín-cubo pesadísimo hasta los pies de papá, que lo vacía levantándote en volandas.',
    },
    onFoil: {
      say: 'Escuché tubo, el del laboratorio. La ka del cubo nace atrás, en la cueva: cubo.',
      cue: 'La te vive en los dientes; la ka vive al fondo de la garganta.',
      mission: 'Gárgaras del gigante: cabeza atrás y ka-ka-ka. Dedos bajo la barbilla del otro para sentir dónde se mueve la ka.',
    },
  },
  {
    id: 'boca-bota', code: 'PM-9', group: 'Velares',
    target: 'boca', targetEmoji: '👄', foil: 'bota', foilEmoji: '👢',
    phoneme: 'k → t', errorLabel: 'Frontalización velar media',
    prompt: '¿Con qué damos besos? Di: boca.',
    onTarget: {
      say: '¡Boca! ¡Qué bien suena esa ka en medio!',
      mission: 'Cuenta-dientes: sonrisa gigante de papá y el niño le cuenta cinco dientes con el dedo. Luego, al revés.',
    },
    onFoil: {
      say: 'Escuché bota, la del pie. Boca suena atrás: boca.',
      cue: 'Boca muy abierta de león: la lengua se va sola para atrás.',
      mission: 'Bostezo del león frente a frente: boca enorme y kaaa desde el fondo. Gana el bostezo más exagerado.',
    },
  },
  {
    id: 'fuente-puente', code: 'PM-10', group: 'Labiodental',
    target: 'fuente', targetEmoji: '⛲', foil: 'puente', foilEmoji: '🌉',
    phoneme: 'f → p', errorLabel: 'Oclusivización de fricativa',
    prompt: '¿De dónde sale el agua? Di: fuente.',
    onTarget: {
      say: '¡Fuente! ¡Ese soplido de conejo moja todo!',
      mission: 'Fuente humana: agáchate y brota hacia arriba salpicando a papá, que se sacude el pelo empapado.',
    },
    onFoil: {
      say: 'Escuché puente, el de cruzar. La efe muerde el labio y sopla: fuente.',
      cue: 'Dientes de conejo sobre el labio de abajo, y sopla.',
      mission: 'El papel volador: papelito en la palma de papá. Con fff se inclina y aguanta; con pe solo da un salto. Reto: tres segundos volando.',
    },
  },
  // --------------------------------------------------------------------------
  // Ampliación V6.1 (Expansión de Protocolos): PM-11 … PM-15. Todos los
  // contrastes viven en ATAQUE silábico (inicial o intervocálico), donde el
  // fonema se mantiene estable en todas las macrorregiones dialectales del
  // español: ningún par depende de /θ/, de la /s/ implosiva ni de líquidas en
  // coda (rasgos que el caribeño neutraliza y que NO son error).
  // --------------------------------------------------------------------------
  {
    id: 'gota-bota', code: 'PM-11', group: 'Velares',
    target: 'gota', targetEmoji: '💧', foil: 'bota', foilEmoji: '👢',
    phoneme: 'g → b', errorLabel: 'Labialización de velar sonora',
    prompt: '¡Plic! ¿Qué cayó del cielo? Di: gota.',
    onTarget: {
      say: '¡Gota! ¡Esa ga salió del fondo de la garganta!',
      mission: 'Lluvia de dedos: tamborilead gotas por los brazos del otro hasta llegar a las manos.',
    },
    onFoil: {
      say: 'Escuché bota, la del pie. La gota nace atrás, en la cueva: gota.',
      cue: 'La be vive en los labios; la ga vive al fondo de la garganta.',
      mission: 'Manos al cuello los dos: decid ga-ga-ga y bo-bo-bo y notad dónde tiembla cada sonido.',
    },
  },
  {
    id: 'beso-queso', code: 'PM-12', group: 'Velares',
    target: 'beso', targetEmoji: '😘', foil: 'queso', foilEmoji: '🧀',
    phoneme: 'b → k', errorLabel: 'Posteriorización de bilabial',
    prompt: '¿Qué damos con los labios? Di: beso.',
    onTarget: {
      say: '¡Beso! ¡Esos labios explotaron genial!',
      mission: 'Lanzaos un beso volador cada uno y atrapadlo en el aire con la mano.',
    },
    onFoil: {
      say: 'Escuché queso, el del ratón. El beso nace en los labios, delante: beso.',
      cue: 'Junta los labios como para dar un beso y suéltalos de golpe: be.',
      mission: 'Espejo de labios: frente a frente, inflad los mofletes y soltad be-be-be hasta reír.',
    },
  },
  {
    id: 'foca-boca', code: 'PM-13', group: 'Labiodental',
    target: 'foca', targetEmoji: '🦭', foil: 'boca', foilEmoji: '👄',
    phoneme: 'f → b', errorLabel: 'Oclusivización de labiodental',
    prompt: '¡Aplaude como en el circo! ¿Quién aplaude con las aletas? Di: foca.',
    onTarget: {
      say: '¡Foca! ¡Ese soplido de conejo llegó al mar!',
      mission: 'Aplaudid como focas con los brazos estirados y un “¡arf, arf!” final.',
    },
    onFoil: {
      say: 'Escuché boca, la de los besos. La foca sopla con los dientes en el labio: foca.',
      cue: 'Dientes de conejo sobre el labio de abajo, y aire largo: fff.',
      mission: 'Viento en la mano: palma de papá delante de la boca del niño. Con fff hay brisa seguida; con be, solo un golpecito.',
    },
  },
  {
    id: 'miel-piel', code: 'PM-14', group: 'Nasales',
    target: 'miel', targetEmoji: '🍯', foil: 'piel', foilEmoji: '🤚',
    phoneme: 'm → p', errorLabel: 'Desnasalización de bilabial',
    prompt: '¿Qué guarda el oso en el tarro? Di: miel.',
    onTarget: {
      say: '¡Miel! ¡Esa eme salió zumbando por la nariz!',
      mission: 'Osos golosos: meted la mano en el tarro imaginario y relameos con un “mmm” bien largo.',
    },
    onFoil: {
      say: 'Escuché piel, la de la mano. La miel zumba por la nariz como una abeja: mmmiel.',
      cue: 'Labios juntos y motor de abeja por la nariz: mmm.',
      mission: 'Dedo en la nariz del otro: sostened mmmm tres segundos y sentid la vibración. Con pe no tiembla nada.',
    },
  },
  {
    id: 'pato-palo', code: 'PM-15', group: 'Laterales',
    target: 'pato', targetEmoji: '🦆', foil: 'palo', foilEmoji: '🪵',
    phoneme: 't → l', errorLabel: 'Lateralización de oclusiva dental',
    prompt: '¡Cuac, cuac! ¿Quién nada en el charco? Di: pato.',
    onTarget: {
      say: '¡Pato! ¡Esa te dio un golpecito perfecto!',
      mission: 'Caminad como patos en cuclillas hasta el sofá haciendo cuac-cuac.',
    },
    onFoil: {
      say: 'Escuché palo, el del suelo. El pato da un golpe con la lengua: pato.',
      cue: 'La te da un toque seco detrás de los dientes; la ele se escurre por los lados.',
      mission: 'Tambor de lengua: marcad ta-ta-ta con palmadas y la-la-la meneando los brazos, alternando cada vez más rápido.',
    },
  },
];

export const PAIR_GROUPS: PairGroup[] = ['Rotacismo', 'Sigmatismo', 'Velares', 'Labiodental', 'Nasales', 'Laterales'];
