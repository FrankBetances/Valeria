// ============================================================================
// Aventuras con Lúa · Lúa y las Palabras — Catálogo de Cuentos Interactivos
// 10 cuentos graduados por edad con neutralidad léxica para España e Hispanoamérica.
// Cada cuento incluye texto para lectura guiada, 3 preguntas de comprensión,
// vocabulario nuevo y consigna de dibujo libre.
// ============================================================================

import type { AgeBand } from './LuaAssessmentCatalog';
import type { PictoKey } from '../../ValeriaPixelArt';

export interface LuaStoryQuestion {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    /**
     * Ficha de la opción. Obligatoria en 0-2 y 2-3: a esa edad no se lee, y
     * tres respuestas en texto («Un pollito amarillo» / «Un perrito» /
     * «Un gatico») no se pueden contestar. De 3-4 en adelante las opciones son
     * narrativas y el texto es lo correcto.
     */
    pic?: PictoKey;
  }>;
  hint: string;
}

export interface LuaVocabularyCard {
  word: string;
  definition: string;
  /**
   * Ficha del banco propio. Las 30 tarjetas llevaban un campo de icono con nombres de
   * una librería externa (dog, apple, tree-pine…) que no existían en el set y
   * que además NADIE renderizaba: el visor de cuentos no pintaba una sola
   * imagen. Los conceptos abstractos de 5-7 y 7-10 —paciencia, compromiso,
   * ecológico, primavera— se quedan sin ficha a propósito: a esa edad ya se
   * lee, y dibujarlos sería adivinar.
   */
  pic?: PictoKey;
}

export interface LuaStory {
  id: string;
  number: number; // 1 a 10
  title: string;
  ageBand: AgeBand;
  suggestedAgeText: string;
  paragraphs: string[];
  comprehensionQuestions: LuaStoryQuestion[];
  newWords: LuaVocabularyCard[];
  drawingPrompt: string;
}

export const LUA_STORIES_CATALOG: LuaStory[] = [
  {
    id: 'lua_story_01',
    number: 1,
    title: 'Coco busca a mamá',
    ageBand: '0-2',
    suggestedAgeText: '0–2 años',
    paragraphs: [
      'Coco es un pollito amarillo y muy suave.',
      'Coco camina contento y dice: ¡pío, pío!',
      'Coco busca por el campo a su mamá.',
      '¡Mira, allí está mamá gallina cuidando el nido!',
      'Mamá lo abraza con sus alas y dice: ¡coc, coc, coc!',
      'Coco y mamá están juntos y muy felices.',
    ],
    comprehensionQuestions: [
      // Una sola pregunta por cuento (ACOPROS, 11/2026): tres eran demasiadas.
      {
        id: 'story_01_q3',
        question: '¿A quién encontró Coco al final?',
        options: [
          { id: 'opt_mama', text: 'A su mamá gallina', pic: 'gallina', isCorrect: true },
          { id: 'opt_vaca', text: 'A una vaca', pic: 'vaca', isCorrect: false },
          { id: 'opt_pato', text: 'A un patito', pic: 'pato', isCorrect: false },
        ],
        hint: 'Encontró a su mamá que lo abrazó con sus alas.',
      },
    ],
    newWords: [
      { word: 'Pollito',
      pic: 'pollito', definition: 'La cría de la gallina: pequeño, amarillo y dice ¡pío, pío!' },
      { word: 'Sol',
      pic: 'sol', definition: 'La estrella brillante que nos da calor y luz en el día.' },
      { word: 'Casa',
      pic: 'casa', definition: 'Lugar seguro y acogedor donde descansamos en familia.' },
    ],
    drawingPrompt: 'Dibuja a Coco junto a su mamá gallina bajo el sol.',
  },
  {
    id: 'lua_story_02',
    number: 2,
    title: 'El gatico y la pelota',
    ageBand: '2-3',
    suggestedAgeText: '2–3 años',
    paragraphs: [
      'Mimi es un gatico pequeño y muy juguetón.',
      'A Mimi le gusta rodar su pelota azul por todo el patio.',
      'Un día, la pelota rodó rápido hasta Toby, un perrito nuevo en el barrio.',
      'Toby recogió la pelota suavemente con la boca y se la devolvió a Mimi moviendo la colita.',
      'Desde ese día, Mimi y Toby juegan juntos con la pelota todas las tardes.',
    ],
    comprehensionQuestions: [
      // Una sola pregunta por cuento (ACOPROS, 11/2026): tres eran demasiadas.
      {
        id: 'story_02_q3',
        question: '¿Qué hacen Mimi y Toby todas las tardes?',
        options: [
          { id: 'opt_juegan', text: 'Juegan juntos a la pelota', pic: 'pelota', isCorrect: true },
          { id: 'opt_duermen', text: 'Duermen en el tejado', pic: 'dormir', isCorrect: false },
          { id: 'opt_comen', text: 'Comen galletas de manzana', pic: 'comer', isCorrect: false },
        ],
        hint: 'Se hicieron grandes amigos y juegan en el patio.',
      },
    ],
    newWords: [
      { word: 'Gato',
      pic: 'gato', definition: 'Animalito ágil con bigotes que hace miau.' },
      { word: 'Perro',
      pic: 'perro', definition: 'Amigo fiel y juguetón que mueve la cola y hace guau.' },
      { word: 'Pelota',
      pic: 'pelota', definition: 'Juguete redondo que bota y rueda para jugar en equipo.' },
    ],
    drawingPrompt: 'Dibuja a Mimi el gatico y a Toby el perrito jugando con la pelota azul.',
  },
  {
    id: 'lua_story_03',
    number: 3,
    title: 'Vamos a la granja',
    ageBand: '2-3',
    suggestedAgeText: '2–3 años',
    paragraphs: [
      'Hoy Ana fue de visita a la granja verde de su abuelo.',
      'En el prado, la vaca grande la miró y dijo: ¡muuu, muuu!',
      'Cerca del granero, la gallina paseaba con sus pollitos y dijo: ¡coc, coc, coc!',
      'Al llegar al camino, el perro guardián movió las orejas y dijo: ¡guau, guau!',
      'Ana sonrió feliz y saludó a cada animalito agitando su manita.',
      'Al atardecer, Ana le dio un abrazo a su abuelo por un día tan divertido.',
    ],
    comprehensionQuestions: [
      // Una sola pregunta por cuento (ACOPROS, 11/2026): tres eran demasiadas.
      {
        id: 'story_03_q3',
        question: '¿Cómo saludó Ana a los animalitos de la granja?',
        options: [
          { id: 'opt_mano', text: 'Agitando su manita con una sonrisa', pic: 'mano', isCorrect: true },
          { id: 'opt_corriendo', text: 'Corriendo rápido', pic: 'correr', isCorrect: false },
          { id: 'opt_escondida', text: 'Escondiéndose detrás de una puerta', pic: 'casa', isCorrect: false },
        ],
        hint: 'Levantó su manita para decirles hola con cariño.',
      },
    ],
    newWords: [
      { word: 'Vaca',
      pic: 'vaca', definition: 'Animal que vive en el campo, come hierba fresca y da rica leche.' },
      { word: 'Gallina',
      pic: 'gallina', definition: 'Ave que vive en la granja y pasea con sus pollitos.' },
      { word: 'Perro',
      pic: 'perro', definition: 'Compañero leal que saluda alegremente cuando llegamos.' },
    ],
    drawingPrompt: 'Dibuja la granja con la vaca, la gallina y el perro saludando a Ana.',
  },
  {
    id: 'lua_story_04',
    number: 4,
    title: 'El arbolito que quería flores',
    ageBand: '3-4',
    suggestedAgeText: '3–4 años',
    paragraphs: [
      'En el patio de la escuela crecía un arbolito delgado y muy pequeño.',
      'El arbolito miraba con admiración a los árboles grandes y soñaba con tener flores perfumadas.',
      'El sol de la mañana lo calentaba con ternura y las gotas de lluvia refrescaban sus raíces.',
      'Día tras día, el arbolito fue estirando sus ramas verdes hacia lo alto del cielo.',
      'Una mañana brillante de primavera, ¡sucedió la magia: brotaron hermosas flores rosadas!',
      'Las mariposas y las abejas llegaron a bailar entre sus ramas, y el arbolito se sintió lleno de orgullo.',
    ],
    comprehensionQuestions: [
      // Una sola pregunta por cuento (ACOPROS, 11/2026): tres eran demasiadas.
      {
        id: 'story_04_q3',
        question: '¿Quiénes visitaron al arbolito cuando floreció?',
        options: [
          { id: 'opt_mariposas_abejas', text: 'Las mariposas y las abejas', isCorrect: true },
          { id: 'opt_peces', text: 'Los pececitos del río', isCorrect: false },
          { id: 'opt_osos', text: 'Dos osos grandes', isCorrect: false },
        ],
        hint: 'Amiguitos con alas que buscan el polen de las flores.',
      },
    ],
    newWords: [
      { word: 'Árbol',
      pic: 'arbol', definition: 'Planta alta con tronco fuerte de madera y ramas llenas de hojas.' },
      { word: 'Flor',
      pic: 'flor', definition: 'Parte colorida y perfumada que brota en las plantas.' },
      { word: 'Primavera', pic: 'brote', definition: 'Estación del año llena de luz donde la naturaleza florece.' },
    ],
    drawingPrompt: 'Dibuja al arbolito lleno de flores rosadas rodeado de mariposas.',
  },
  {
    id: 'lua_story_05',
    number: 5,
    title: 'Un día de frutas',
    ageBand: '3-4',
    suggestedAgeText: '3–4 años',
    paragraphs: [
      'Mía fue al mercado de su barrio con su abuela para comprar frutas y preparar una rica ensalada.',
      'Primero escogieron una manzana roja, redonda y muy brillante.',
      'Después encontraron un racimo de uvas moradas y una cesta de fresas dulces y frescas.',
      'Al llegar a casa, entre las dos lavaron las frutas con agua limpia y las cortaron en pedacitos pequeños.',
      'Toda la familia se sentó en la mesa a compartir la merienda y a contarse historias divertidas.',
    ],
    comprehensionQuestions: [
      // Una sola pregunta por cuento (ACOPROS, 11/2026): tres eran demasiadas.
      {
        id: 'story_05_q3',
        question: '¿Qué hizo toda la familia al final de la tarde?',
        options: [
          { id: 'opt_familia_junta', text: 'Comieron juntos la ensalada y contaron historias', isCorrect: true },
          { id: 'opt_salieron_correr', text: 'Salieron corriendo sin merendar', isCorrect: false },
          { id: 'opt_durmieron', text: 'Se fueron a dormir sin hablar', isCorrect: false },
        ],
        hint: 'Compartieron un momento feliz y conversaron en la mesa.',
      },
    ],
    newWords: [
      { word: 'Manzana',
      pic: 'manzana', definition: 'Fruta crujiente y deliciosa, de cáscara roja o verde.' },
      { word: 'Uvas',
      pic: 'uvas', definition: 'Pequeñas frutas jugosas que crecen juntas en racimos.' },
      { word: 'Fresas',
      pic: 'fresa', definition: 'Frutillas dulces de color rojo vivo con hojitas verdes.' },
    ],
    drawingPrompt: 'Dibuja un tazón con trozos de manzana, fresas y uvas para la ensalada.',
  },
  {
    id: 'lua_story_06',
    number: 6,
    title: 'La casita de arena',
    ageBand: '4-5',
    suggestedAgeText: '4–5 años',
    paragraphs: [
      'La familia de Sofía pasó una hermosa tarde en la playa construyendo una casita de arena.',
      'Sofía recolectó conchitas marinas de muchos colores en la orilla para decorar las paredes.',
      'Las olitas suaves del mar llegaban despacio y mojaban con frescura la orilla de la casita.',
      'Cuando el sol comenzó a ponerse en el horizonte, el cielo se pintó de tonos dorados y naranja.',
      'Sofía tomó una fotografía con su familia para recordar ese día tan bonito frente al mar.',
    ],
    comprehensionQuestions: [
      // Una sola pregunta por cuento (ACOPROS, 11/2026): tres eran demasiadas.
      {
        id: 'story_06_q3',
        question: '¿De qué color se pintó el cielo al caer la tarde?',
        options: [
          { id: 'opt_naranja', text: 'De color dorado y naranja', isCorrect: true },
          { id: 'opt_verde', text: 'De verde brillante', isCorrect: false },
          { id: 'opt_negro', text: 'De negro oscuro con lluvia', isCorrect: false },
        ],
        hint: 'Los colores cálidos del atardecer cuando el sol se oculta.',
      },
    ],
    newWords: [
      { word: 'Ola',
      pic: 'ola', definition: 'Movimiento ondulante del agua del mar que llega a la orilla.' },
      { word: 'Concha',
      pic: 'concha', definition: 'Caparazón duro y brillante que protege a los moluscos del mar.' },
      { word: 'Playa',
      pic: 'ola', definition: 'Orilla de mar o río cubierta de arena limpia.' },
    ],
    drawingPrompt: 'Dibuja la casita de arena decorada con conchas frente a las olas y el atardecer.',
  },
  {
    id: 'lua_story_07',
    number: 7,
    title: 'El pececito y sus amigos nuevos',
    ageBand: '4-5',
    suggestedAgeText: '4–5 años',
    paragraphs: [
      'Nemi era un pececito azul de aletas brillantes que vivía en un arrecife lleno de corales de colores.',
      'Un día conoció a una estrella de mar dorada y a un simpático cangrejito que jugaban entre las rocas.',
      'Los tres inventaron un juego divertido: esconderse entre las conchas marinas y encontrarse por turnos.',
      'Nemi aprendió que nadar por el arrecife era mucho más emocionante cuando compartía sus aventuras con amigos.',
      'Desde ese día, los tres se reúnen todas las mañanas para nadar y explorar juntos el mar.',
    ],
    comprehensionQuestions: [
      // Una sola pregunta por cuento (ACOPROS, 11/2026): tres eran demasiadas.
      {
        id: 'story_07_q3',
        question: '¿A qué jugaban los tres amigos?',
        options: [
          { id: 'opt_esconderse', text: 'A esconderse y encontrarse por turnos', isCorrect: true },
          { id: 'opt_carreras', text: 'A saltar fuera del agua', isCorrect: false },
          { id: 'opt_pelear', text: 'A quitarse los juguetes', isCorrect: false },
        ],
        hint: 'El juego del escondite jugando en equipo.',
      },
    ],
    newWords: [
      { word: 'Pez / Pescado',
      pic: 'pez', definition: 'Animal acuático con aletas y escamas que nada en el agua.' },
      { word: 'Arrecife',
      pic: 'estrella-mar', definition: 'Comunidad submarina de corales y piedras donde viven muchos peces.' },
      { word: 'Estrella de mar',
      pic: 'estrella-mar', definition: 'Animal marino con forma de estrella de cinco puntas.' },
    ],
    drawingPrompt: 'Dibuja a Nemi el pececito azul jugando al escondite con la estrella y el cangrejo.',
  },
  {
    id: 'lua_story_08',
    number: 8,
    title: 'Las estrellas del cielo',
    ageBand: '5-7',
    suggestedAgeText: '5–7 años',
    paragraphs: [
      'Una noche despejada de verano, el abuelo de Iván sacó dos sillas al jardín para contemplar el firmamento.',
      '—Mira allá arriba, esa estrella titilante es la más fácil de encontrar —le dijo el abuelo señalando con calma.',
      'Iván comenzó a contar las estrellas brillantes que alcanzaba a ver, mientras su abuelo le explicaba historias sobre la luna.',
      'Conversaron sobre lo inmenso que es el universo y lo afortunados que se sentían de disfrutar ese momento en compañía.',
      'Antes de entrar a descansar, Iván cerró los ojos y pidió un deseo mirando a la estrella más resplandeciente.',
    ],
    comprehensionQuestions: [
      // Una sola pregunta por cuento (ACOPROS, 11/2026): tres eran demasiadas.
      {
        id: 'story_08_q3',
        question: '¿Qué hizo Iván antes de entrar a dormir?',
        options: [
          { id: 'opt_pidio_deseo', text: 'Pidió un deseo mirando a la estrella más brillante', isCorrect: true },
          { id: 'opt_lloro', text: 'Se enojó con su abuelo', isCorrect: false },
          { id: 'opt_rompio_silla', text: 'Dejó las sillas tiradas bajo la lluvia', isCorrect: false },
        ],
        hint: 'Cerró sus ojitos y pensó en algo muy bonito para el futuro.',
      },
    ],
    newWords: [
      { word: 'Estrella',
      pic: 'estrella', definition: 'Astro con luz propia que brilla en el cielo nocturno.' },
      { word: 'Luna',
      pic: 'luna', definition: 'Satélite natural de la Tierra que ilumina nuestras noches.' },
      { word: 'Amigos',
      pic: 'abrazo', definition: 'Personas queridas con quienes compartimos confianza y momentos felices.' },
    ],
    drawingPrompt: 'Dibuja a Iván y a su abuelo mirando el cielo nocturno lleno de estrellas brillantes.',
  },
  {
    id: 'lua_story_09',
    number: 9,
    title: 'El jardín de mariposas',
    ageBand: '5-7',
    suggestedAgeText: '5–7 años',
    paragraphs: [
      'En la escuela de Valentina, la maestra propuso un proyecto especial: crear un jardín de flores para invitar a las mariposas.',
      'Cada estudiante sembró una semilla diferente en la tierra fértil y prometió regarla con constancia y esmero.',
      'Durante varias semanas, los niños cuidaron los brotes con paciencia, observando cómo crecían las pequeñas hojitas.',
      'Una hermosa mañana, el patio se llenó de un festival de pétalos amarillos, rojos y violetas rodeados de mariposas danzantes.',
      'Toda la comunidad celebró el "Día de las Mariposas", orgullosos de lo que habían logrado trabajando en equipo.',
    ],
    comprehensionQuestions: [
      // Una sola pregunta por cuento (ACOPROS, 11/2026): tres eran demasiadas.
      {
        id: 'story_09_q3',
        question: '¿Por qué se sintieron todos tan orgullosos al final?',
        options: [
          { id: 'opt_trabajo_equipo', text: 'Por el fruto de su trabajo colaborativo en equipo', isCorrect: true },
          { id: 'opt_ganaron_dinero', text: 'Porque ganaron un premio en dinero', isCorrect: false },
          { id: 'opt_comieron_dulces', text: 'Porque no tuvieron que estudiar', isCorrect: false },
        ],
        hint: 'Descubrieron que ayudándose unos a otros se logran cosas asombrosas.',
      },
    ],
    newWords: [
      { word: 'Semilla',
      pic: 'semilla', definition: 'Grano del que nace y se desarrolla una nueva planta.' },
      { word: 'Paciencia', definition: 'Capacidad de esperar con calma mientras las cosas crecen.' },
      { word: 'Equipo',
      pic: 'abrazo', definition: 'Grupo de personas que colaboran unidas con un objetivo común.' },
    ],
    drawingPrompt: 'Dibuja el jardín florecido con mariposas de muchos colores y a los niños celebrando.',
  },
  {
    id: 'lua_story_10',
    number: 10,
    title: 'El equipo que cuidó la playa',
    ageBand: '7-10',
    suggestedAgeText: '7–10 años',
    paragraphs: [
      'Un grupo de amigos del barrio decidió organizar una jornada ecológica voluntaria para limpiar su playa favorita.',
      'Cada participante llevó bolsas de tela y guantes protectores, organizándose en cuadrillas para recorrer toda la franja costera.',
      'A medida que retiraban plásticos y residuos, también encontraron caracolas hermosas y conchas pulidas que decidieron conservar.',
      'Al finalizar la tarde, la playa lucía impecable y brillante bajo el sol, y todos compartieron una profunda satisfacción cívica.',
      'Para celebrar, organizaron una merienda comunitaria sobre la arena limpia y acordaron reunirse una vez al mes para mantener viva la iniciativa.',
    ],
    comprehensionQuestions: [
      // Una sola pregunta por cuento (ACOPROS, 11/2026): tres eran demasiadas.
      {
        id: 'story_10_q3',
        question: '¿Qué compromiso adoptó el grupo de cara al futuro?',
        options: [
          { id: 'opt_compromiso_mensual', text: 'Reunirse una vez al mes para cuidar y mantener limpia la playa', isCorrect: true },
          { id: 'opt_no_volver', text: 'No regresar nunca más a la playa', isCorrect: false },
          { id: 'opt_cobrar_entrada', text: 'Cobrar entrada a los bañistas', isCorrect: false },
        ],
        hint: 'Decidieron que el cuidado del medio ambiente debe ser constante.',
      },
    ],
    newWords: [
      { word: 'Comunidad',
      pic: 'casa', definition: 'Conjunto de personas que conviven y colaboran por el bienestar común.' },
      { word: 'Ecológico', definition: 'Que protege y respeta el equilibrio de la naturaleza y los ecosistemas.' },
      { word: 'Compromiso', definition: 'Promesa o responsabilidad que asumimos con nosotros mismos y con los demás.' },
    ],
    drawingPrompt: 'Dibuja la playa limpia y brillante con el grupo de amigos celebrando su merienda.',
  },
];

export const getStoryById = (id: string): LuaStory | undefined =>
  LUA_STORIES_CATALOG.find((s) => s.id === id);

export const getStoriesByAge = (ageBand: AgeBand): LuaStory[] =>
  LUA_STORIES_CATALOG.filter((s) => s.ageBand === ageBand);
