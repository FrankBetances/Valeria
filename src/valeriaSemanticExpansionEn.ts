// ============================================================================
// Valeria+ · Expansión Semántica en INGLÉS AMERICANO — plan en-US, EN-3.5
// Escenarios, categorías léxicas, progresiones y cápsulas de contraste.
// Módulo PURO (enumerable por el corpus de voz). Espejo estructural de
// valeriaSemanticExpansionEu.ts / …Gl.ts.
//
// Criterios que NO se heredan del castellano, aunque la estructura sí:
//
//  · ORDEN POR FAMILIARIDAD (ES-08). El campo `difficulty` ordena por
//    frecuencia de uso y edad de adquisición, no por dificultad articulatoria.
//    Aquí se sigue SUBTLEX-US y las normas Wordbank/CDI del inglés americano,
//    que no coinciden con las castellanas: `dog` y `shoe` están entre las
//    primeras cincuenta palabras del CDI inglés, y por eso abren sus categorías.
//
//  · `stt_expected_array` INCLUYE LAS PRONUNCIACIONES DIALECTALES como válidas.
//    Es la aplicación práctica de docs/guia-dialectal-en-US.md: si el niño dice
//    [bæf] por «bath» —realización regular del inglés afroamericano— o [espun]
//    por «spoon» —epéntesis del hispanohablante—, el reconocedor debe puntuarlo
//    como ACIERTO. Un array que solo admita la forma estándar convierte el
//    reconocedor en un filtro de acento, que es exactamente lo que la guía
//    prohíbe.
//
//  · Las cápsulas reutilizan los pictogramas ya dibujados (osito-grande,
//    cuchara-sucia, caja-abierta, vaso-frio…): son dibujos sin texto y por tanto
//    independientes de la lengua. No hace falta redibujar nada para el inglés.
//
// ESTADO: 🟡 BORRADOR PARA REVISIÓN CLÍNICA (EN-3.5). Cumple los gates
// mecánicos (check-content-rules, check-lexical-difficulty,
// check-pictogram-coverage); pendiente de la firma de EN-0.3 y de la pasada de
// hablante nativo (EN-7.4).
// ============================================================================
import {
  DailyScenario, LexicalCategory, ProgressionSequence, ContrastCapsule,
} from './valeriaSemanticExpansion';

// ---------------------------------------------------------------------------
// 1 · Escenarios de la vida diaria (2 sustantivos · 2 verbos · 1 adjetivo · 1
//     onomatopeya). El hogar es el estadounidense: no hay «merienda» y el baño
//     es shower/tub, no el bidé de los escenarios peninsulares.
// ---------------------------------------------------------------------------
export const DAILY_SCENARIOS_EN: DailyScenario[] = [
  {
    id: 'morning',
    title: 'Morning routine',
    icon: '☀️',
    subtitle: 'Waking up, washing and getting dressed',
    items: [
      {
        id: 'en-morning-bed', type: 'sustantivo', label: 'bed', emoji: '🛏️',
        visual_prompt: 'Child-size bed seen from the side, flat colors, thick outline, no background, high contrast.',
        tts_string: 'Every morning we hop out of it. Say: bed.',
        stt_expected_array: ['bed', 'beh', 'ded', 'bet'],
        parent_tpr_action: 'Pat the mattress twice together, then both hop off the bed.',
      },
      {
        id: 'en-morning-shirt', type: 'sustantivo', label: 'shirt', emoji: '👕',
        visual_prompt: 'Plain t-shirt laid flat, front view, flat colors, thick outline, no background.',
        tts_string: 'We pull this one over our head. Say: shirt.',
        // [sɜt] sin /r/ es la realización no-rótica del AAE y del inglés
        // sureño: entra como acierto, no como error (guía dialectal §4.5).
        stt_expected_array: ['shirt', 'shert', 'shut', 'sirt', 'sut'],
        parent_tpr_action: 'Hold the shirt up and pop your child’s head through the neck hole together.',
      },
      {
        id: 'en-morning-brush', type: 'verbo', label: 'brush', emoji: '🪥',
        visual_prompt: 'Toothbrush with a stripe of toothpaste, side view, flat colors, thick outline, no background.',
        tts_string: 'Up and down on every tooth. Say: brush.',
        stt_expected_array: ['brush', 'bwush', 'bush', 'buhsh'],
        parent_tpr_action: 'Both of you brush in the air, up and down, counting to ten out loud.',
      },
      {
        id: 'en-morning-wash', type: 'verbo', label: 'wash', emoji: '🧼',
        visual_prompt: 'Two hands under a stream of water with bubbles, flat colors, thick outline, no background.',
        tts_string: 'Hands under the water, rub, rub, rub. Say: wash.',
        stt_expected_array: ['wash', 'wosh', 'wash', 'was'],
        parent_tpr_action: 'Rub your hands together like you are washing, then blow the pretend bubbles away.',
      },
      {
        id: 'en-morning-sleepy', type: 'adjetivo', label: 'sleepy', emoji: '😴',
        visual_prompt: 'Child’s face with half-closed eyes and an open yawn, flat colors, thick outline, no background.',
        tts_string: 'Your eyes are still heavy and you want to yawn. Say: sleepy.',
        stt_expected_array: ['sleepy', 'seepy', 'sweepy', 'slippy'],
        parent_tpr_action: 'Have a big pretend yawn together and stretch your arms as wide as they go.',
      },
      {
        id: 'en-morning-beep', type: 'onomatopeya', label: 'beep beep', emoji: '⏰',
        visual_prompt: 'Ringing alarm clock with motion lines, flat colors, thick outline, no background.',
        tts_string: 'The alarm clock wakes everybody up. Say: beep beep.',
        stt_expected_array: ['beep beep', 'beep', 'bee bee', 'bip bip'],
        parent_tpr_action: 'Press your child’s nose like a button and shout it together, then swap roles.',
      },
    ],
  },
  {
    id: 'mealtime',
    title: 'Mealtime',
    icon: '🍽️',
    subtitle: 'Setting the table, eating and drinking',
    items: [
      {
        id: 'en-meal-spoon', type: 'sustantivo', label: 'spoon', emoji: '🥄',
        pictogram: 'cuchara',
        visual_prompt: 'Single spoon seen from above, flat colors, thick outline, no background, high contrast.',
        tts_string: 'We scoop the soup with it. Say: spoon.',
        // «espoon» es la epéntesis del hispanohablante ante grupo /sp-/: rasgo
        // de transferencia, no error articulatorio (guía dialectal §4.2).
        stt_expected_array: ['spoon', 'poon', 'espoon', 'soon'],
        parent_tpr_action: 'Take turns scooping pretend soup and feeding each other.',
      },
      {
        id: 'en-meal-cup', type: 'sustantivo', label: 'cup', emoji: '🥛',
        pictogram: 'vaso',
        visual_prompt: 'Child’s cup full of milk, front view, flat colors, thick outline, no background.',
        tts_string: 'We drink our milk out of it. Say: cup.',
        stt_expected_array: ['cup', 'tup', 'cuh', 'gup'],
        parent_tpr_action: 'Clink your cups together and take a sip at the same time.',
      },
      {
        id: 'en-meal-eat', type: 'verbo', label: 'eat', emoji: '😋',
        pictogram: 'comer',
        visual_prompt: 'Child bringing a spoon to an open mouth, side view, flat colors, thick outline, no background.',
        tts_string: 'Open wide and chew it all up. Say: eat.',
        stt_expected_array: ['eat', 'ea', 'eet', 'it'],
        parent_tpr_action: 'Chew a big pretend bite together and rub your tummies.',
      },
      {
        id: 'en-meal-pour', type: 'verbo', label: 'pour', emoji: '🫗',
        visual_prompt: 'Jug tipping water into a cup, side view, flat colors, thick outline, no background.',
        tts_string: 'Tip the jug slowly so nothing spills. Say: pour.',
        stt_expected_array: ['pour', 'poh', 'por', 'pow'],
        parent_tpr_action: 'Guide your child’s hands on the jug and pour a little water together.',
      },
      {
        id: 'en-meal-hot', type: 'adjetivo', label: 'hot', emoji: '🔥',
        visual_prompt: 'Bowl of soup with steam lines rising, flat colors, thick outline, no background.',
        tts_string: 'The steam is coming up, so we blow first. Say: hot.',
        stt_expected_array: ['hot', 'ot', 'hoh', 'hat'],
        parent_tpr_action: 'Blow on a spoonful together and wave a hand like it is too warm.',
      },
      {
        id: 'en-meal-yum', type: 'onomatopeya', label: 'yum yum', emoji: '🤤',
        visual_prompt: 'Smiling child’s face licking their lips, flat colors, thick outline, no background.',
        tts_string: 'That is what we say when the food is really good. Say: yum yum.',
        stt_expected_array: ['yum yum', 'yum', 'num num', 'yumyum'],
        parent_tpr_action: 'Rub your tummies and say it together, louder each time.',
      },
    ],
  },
  {
    id: 'bathtime',
    title: 'Bath time',
    icon: '🛁',
    subtitle: 'Water, soap and drying off',
    items: [
      {
        id: 'en-bath-soap', type: 'sustantivo', label: 'soap', emoji: '🧼',
        pictogram: 'jabon',
        visual_prompt: 'Bar of soap with bubbles around it, flat colors, thick outline, no background.',
        tts_string: 'It makes all the bubbles in the tub. Say: soap.',
        stt_expected_array: ['soap', 'sope', 'soa', 'thoap'],
        parent_tpr_action: 'Rub the bar between your hands until it foams and show your child the bubbles.',
      },
      {
        id: 'en-bath-towel', type: 'sustantivo', label: 'towel', emoji: '🧺',
        visual_prompt: 'Folded bath towel, front view, flat colors, thick outline, no background.',
        tts_string: 'We wrap up in it when we get out. Say: towel.',
        stt_expected_array: ['towel', 'tow', 'towe', 'tao'],
        parent_tpr_action: 'Wrap your child up like a burrito and give them a squeeze.',
      },
      {
        id: 'en-bath-rinse', type: 'verbo', label: 'rinse', emoji: '🚿',
        visual_prompt: 'Shower head with water falling over a child’s head, flat colors, thick outline, no background.',
        tts_string: 'The water takes all the bubbles away. Say: rinse.',
        stt_expected_array: ['rinse', 'wince', 'rins', 'ins'],
        parent_tpr_action: 'Pour a cup of water down your child’s arm and watch the bubbles disappear.',
      },
      {
        id: 'en-bath-dry', type: 'verbo', label: 'dry', emoji: '🌬️',
        visual_prompt: 'Towel rubbing a child’s hair, motion lines, flat colors, thick outline, no background.',
        tts_string: 'Rub the towel all over until no water is left. Say: dry.',
        stt_expected_array: ['dry', 'dwy', 'die', 'gry'],
        parent_tpr_action: 'Rub your child’s hair with the towel while they say it, then let them do yours.',
      },
      {
        id: 'en-bath-wet', type: 'adjetivo', label: 'wet', emoji: '💧',
        visual_prompt: 'Child’s hand with big water drops falling from it, flat colors, thick outline, no background.',
        tts_string: 'Water is dripping right off your fingers. Say: wet.',
        stt_expected_array: ['wet', 'weh', 'vet', 'wed'],
        parent_tpr_action: 'Touch your child’s wet hand to your cheek and pull a surprised face.',
      },
      {
        id: 'en-bath-splash', type: 'onomatopeya', label: 'splash', emoji: '💦',
        visual_prompt: 'Water splashing up from a tub with droplets flying, flat colors, thick outline, no background.',
        tts_string: 'That is the sound your hands make in the water. Say: splash.',
        stt_expected_array: ['splash', 'plash', 'pash', 'esplash'],
        parent_tpr_action: 'Slap the water together three times and let it splash you both.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2 · Categorías léxicas — ordenadas por FAMILIARIDAD (ES-08).
//     El orden sale de SUBTLEX-US y de Wordbank/CDI, no de la intuición ni del
//     orden castellano: en inglés `dog` y `shoe` son de las primeras palabras
//     del CDI, y `grapes` entra mucho antes que `mango`.
// ---------------------------------------------------------------------------
export const LEXICAL_CATEGORIES_EN: LexicalCategory[] = [
  {
    id: 'en-cat-fruit', title: 'Fruit', icon: '🍎',
    subtitle: 'From the everyday ones to the special treats',
    items: [
      {
        id: 'en-fruit-apple', type: 'sustantivo', label: 'apple', emoji: '🍎', difficulty: 1,
        visual_prompt: 'Red apple with a green leaf, front view, flat colors, thick outline, no background.',
        tts_string: 'Red, round and crunchy. Say: apple.',
        stt_expected_array: ['apple', 'appo', 'apo', 'appuh'],
        parent_tpr_action: 'Take a big crunchy pretend bite together.',
      },
      {
        id: 'en-fruit-banana', type: 'sustantivo', label: 'banana', emoji: '🍌', difficulty: 1,
        visual_prompt: 'Yellow banana, slight curve, side view, flat colors, thick outline, no background.',
        tts_string: 'Yellow and curved, and you peel it first. Say: banana.',
        stt_expected_array: ['banana', 'nana', 'bana', 'manana'],
        parent_tpr_action: 'Peel an imaginary one from the top down, together.',
      },
      {
        id: 'en-fruit-orange', type: 'sustantivo', label: 'orange', emoji: '🍊', difficulty: 2,
        visual_prompt: 'Whole orange next to one segment, flat colors, thick outline, no background.',
        tts_string: 'Round, and it comes apart in little pieces. Say: orange.',
        stt_expected_array: ['orange', 'ornj', 'oanj', 'orang'],
        parent_tpr_action: 'Pull apart an imaginary one and share the pieces.',
      },
      {
        id: 'en-fruit-grapes', type: 'sustantivo', label: 'grapes', emoji: '🍇', difficulty: 2,
        visual_prompt: 'Small bunch of purple grapes, front view, flat colors, thick outline, no background.',
        tts_string: 'Little purple balls that grow in a bunch. Say: grapes.',
        stt_expected_array: ['grapes', 'gapes', 'gwapes', 'grape'],
        parent_tpr_action: 'Pick them off an imaginary bunch one by one and pop them in your mouths.',
      },
      {
        id: 'en-fruit-mango', type: 'sustantivo', label: 'mango', emoji: '🥭', difficulty: 3,
        visual_prompt: 'Whole mango, orange and red skin, side view, flat colors, thick outline, no background.',
        tts_string: 'Sweet, juicy and it drips down your chin. Say: mango.',
        stt_expected_array: ['mango', 'mago', 'manggo', 'mano'],
        parent_tpr_action: 'Eat an imaginary slice and wipe the juice off your chins.',
      },
    ],
  },
  {
    id: 'en-cat-animals', title: 'Animals', icon: '🐶',
    subtitle: 'From the ones at home to the ones at the zoo',
    items: [
      {
        id: 'en-animal-dog', type: 'sustantivo', label: 'dog', emoji: '🐶', difficulty: 1,
        visual_prompt: 'Friendly dog sitting, side view, flat colors, thick outline, no background.',
        tts_string: 'It wags its tail and goes woof. Say: dog.',
        stt_expected_array: ['dog', 'daw', 'dah', 'gog'],
        parent_tpr_action: 'Get on all fours and bark at each other twice.',
      },
      {
        id: 'en-animal-cat', type: 'sustantivo', label: 'cat', emoji: '🐱', difficulty: 1,
        visual_prompt: 'Sitting cat with pointy ears, front view, flat colors, thick outline, no background.',
        tts_string: 'Soft, with whiskers, and it goes meow. Say: cat.',
        stt_expected_array: ['cat', 'tat', 'ca', 'gat'],
        parent_tpr_action: 'Stroke each other’s arm like petting fur and purr together.',
      },
      {
        id: 'en-animal-bird', type: 'sustantivo', label: 'bird', emoji: '🐦', difficulty: 2,
        pictogram: 'pajaro',
        visual_prompt: 'Small bird perched on a branch, side view, flat colors, thick outline, no background.',
        // Ojo: aquí la palabra lleva /r/ postvocálica, que en AAE y en el
        // inglés sureño no se pronuncia. Como ítem LÉXICO no pasa nada —lo que
        // se trabaja es el vocabulario—; lo que estaría prohibido es usarla
        // como CONTRASTE en un par mínimo (guía dialectal §4.5).
        tts_string: 'It has feathers and flies away. Say: bird.',
        stt_expected_array: ['bird', 'bud', 'bid', 'boid', 'buhd'],
        parent_tpr_action: 'Flap your arms like wings and fly across the room together.',
      },
      {
        id: 'en-animal-horse', type: 'sustantivo', label: 'horse', emoji: '🐴', difficulty: 2,
        visual_prompt: 'Standing horse, side view, flat colors, thick outline, no background.',
        tts_string: 'Big, with a long mane, and you can ride it. Say: horse.',
        stt_expected_array: ['horse', 'hoss', 'hoas', 'orse'],
        parent_tpr_action: 'Gallop around the room slapping your thighs for hooves.',
      },
      {
        id: 'en-animal-zebra', type: 'sustantivo', label: 'zebra', emoji: '🦓', difficulty: 3,
        visual_prompt: 'Zebra standing, side view, bold black and white stripes, thick outline, no background.',
        tts_string: 'Black and white stripes all over. Say: zebra.',
        stt_expected_array: ['zebra', 'sebra', 'zeba', 'zebwa'],
        parent_tpr_action: 'Draw stripes down each other’s arms with a finger.',
      },
    ],
  },
  {
    id: 'en-cat-clothes', title: 'Clothes', icon: '👕',
    subtitle: 'What we put on to go outside',
    items: [
      {
        id: 'en-clothes-shoe', type: 'sustantivo', label: 'shoe', emoji: '👟', difficulty: 1,
        visual_prompt: 'Single sneaker, side view, flat colors, thick outline, no background.',
        tts_string: 'It goes on your foot before we go out. Say: shoe.',
        stt_expected_array: ['shoe', 'sue', 'shu', 'soo'],
        parent_tpr_action: 'Put one on together and pull the strap tight.',
      },
      {
        id: 'en-clothes-hat', type: 'sustantivo', label: 'hat', emoji: '🧢', difficulty: 1,
        visual_prompt: 'Baseball cap, side view, flat colors, thick outline, no background.',
        tts_string: 'It goes right on top of your head. Say: hat.',
        stt_expected_array: ['hat', 'at', 'ha', 'tat'],
        parent_tpr_action: 'Pop it on each other’s head and pull the brim down.',
      },
      {
        id: 'en-clothes-sock', type: 'sustantivo', label: 'sock', emoji: '🧦', difficulty: 2,
        visual_prompt: 'Single striped sock, front view, flat colors, thick outline, no background.',
        tts_string: 'It goes on before the shoe. Say: sock.',
        stt_expected_array: ['sock', 'sok', 'thock', 'soc'],
        parent_tpr_action: 'Pull one onto your child’s foot while they say it, then swap.',
      },
      {
        id: 'en-clothes-jacket', type: 'sustantivo', label: 'jacket', emoji: '🧥', difficulty: 2,
        visual_prompt: 'Zipped jacket seen from the front, flat colors, thick outline, no background.',
        tts_string: 'We zip it up when it gets cold. Say: jacket.',
        stt_expected_array: ['jacket', 'jaket', 'yacket', 'jackuh'],
        parent_tpr_action: 'Zip an imaginary one all the way up to the chin, both of you.',
      },
      {
        id: 'en-clothes-scarf', type: 'sustantivo', label: 'scarf', emoji: '🧣', difficulty: 3,
        visual_prompt: 'Long knitted scarf laid in a loose loop, flat colors, thick outline, no background.',
        tts_string: 'It wraps around and around your neck. Say: scarf.',
        stt_expected_array: ['scarf', 'scaf', 'car', 'escarf'],
        parent_tpr_action: 'Wind it around each other’s neck twice and tuck the ends in.',
      },
    ],
  },
  {
    id: 'en-cat-colors', title: 'Colors', icon: '🎨',
    subtitle: 'From the first ones children name to the trickier ones',
    items: [
      {
        id: 'en-color-red', type: 'adjetivo', label: 'red', emoji: '🔴', difficulty: 1,
        visual_prompt: 'Solid red circle on white, thick outline, no background, high contrast.',
        tts_string: 'The color of a fire truck. Say: red.',
        stt_expected_array: ['red', 'wed', 'reh', 'weh'],
        parent_tpr_action: 'Race to touch something of that color in the room before your child does.',
      },
      {
        id: 'en-color-blue', type: 'adjetivo', label: 'blue', emoji: '🔵', difficulty: 1,
        visual_prompt: 'Solid blue circle on white, thick outline, no background, high contrast.',
        tts_string: 'The color of the sky on a clear day. Say: blue.',
        stt_expected_array: ['blue', 'boo', 'bwue', 'bue'],
        parent_tpr_action: 'Point up at the sky together, then find something the same color indoors.',
      },
      {
        id: 'en-color-green', type: 'adjetivo', label: 'green', emoji: '🟢', difficulty: 2,
        visual_prompt: 'Solid green circle on white, thick outline, no background, high contrast.',
        tts_string: 'The color of grass and leaves. Say: green.',
        stt_expected_array: ['green', 'gween', 'geen', 'grin'],
        parent_tpr_action: 'Wiggle your fingers like grass growing and find something that color.',
      },
      {
        id: 'en-color-yellow', type: 'adjetivo', label: 'yellow', emoji: '🟡', difficulty: 2,
        visual_prompt: 'Solid yellow circle on white, thick outline, no background, high contrast.',
        tts_string: 'The color of the sun and a banana. Say: yellow.',
        stt_expected_array: ['yellow', 'yeyo', 'lello', 'yeoh'],
        parent_tpr_action: 'Make a big sun shape with your arms over your heads together.',
      },
      {
        id: 'en-color-purple', type: 'adjetivo', label: 'purple', emoji: '🟣', difficulty: 3,
        visual_prompt: 'Solid purple circle on white, thick outline, no background, high contrast.',
        tts_string: 'The color of grapes and eggplants. Say: purple.',
        stt_expected_array: ['purple', 'pupo', 'puhpo', 'purpo'],
        parent_tpr_action: 'Hunt around the room for that color and clap when one of you finds it.',
      },
    ],
  },
  {
    id: 'en-cat-body', title: 'The body', icon: '🖐️',
    subtitle: 'The parts children point to first',
    items: [
      {
        id: 'en-body-hand', type: 'sustantivo', label: 'hand', emoji: '✋', difficulty: 1,
        pictogram: 'mano',
        visual_prompt: 'Open child’s hand, palm forward, flat colors, thick outline, no background.',
        tts_string: 'Five fingers, and we wave with it. Say: hand.',
        stt_expected_array: ['hand', 'han', 'and', 'hah'],
        parent_tpr_action: 'Press your palms together and count the fingers out loud.',
      },
      {
        id: 'en-body-nose', type: 'sustantivo', label: 'nose', emoji: '👃', difficulty: 1,
        visual_prompt: 'Simple front-facing nose on a plain face outline, flat colors, thick outline, no background.',
        tts_string: 'Right in the middle of your face, for smelling. Say: nose.',
        stt_expected_array: ['nose', 'noh', 'noze', 'dose'],
        parent_tpr_action: 'Boop each other’s nose and make a beeping sound.',
      },
      {
        id: 'en-body-foot', type: 'sustantivo', label: 'foot', emoji: '🦶', difficulty: 2,
        visual_prompt: 'Bare child’s foot seen from the side, flat colors, thick outline, no background.',
        tts_string: 'It goes inside the shoe. Say: foot.',
        stt_expected_array: ['foot', 'fut', 'foo', 'poot'],
        parent_tpr_action: 'Stand sole to sole and compare whose is bigger.',
      },
      {
        id: 'en-body-tummy', type: 'sustantivo', label: 'tummy', emoji: '🫃', difficulty: 2,
        visual_prompt: 'Child’s torso with a hand resting on the belly, flat colors, thick outline, no background.',
        tts_string: 'It rumbles when you are hungry. Say: tummy.',
        stt_expected_array: ['tummy', 'tumy', 'tuhmy', 'dummy'],
        parent_tpr_action: 'Rub your bellies in circles and make a rumbling noise together.',
      },
      {
        id: 'en-body-shoulder', type: 'sustantivo', label: 'shoulder', emoji: '💪', difficulty: 3,
        visual_prompt: 'Child’s upper body with one shoulder highlighted, flat colors, thick outline, no background.',
        tts_string: 'It is where your arm joins the rest of you. Say: shoulder.',
        stt_expected_array: ['shoulder', 'shoulda', 'souder', 'sholda'],
        parent_tpr_action: 'Shrug them up to your ears and drop them down, three times each.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 3 · Progresiones: concepto → parte → acción → cualidad (ES-10).
//     Ninguna fase puede ser una onomatopeya: el criterio es el campo semántico.
// ---------------------------------------------------------------------------
export const PROGRESSION_SEQUENCES_EN: ProgressionSequence[] = [
  {
    id: 'en-seq-car', theme: 'Transportation · The car', icon: '🚗',
    phases: [
      {
        kind: 'concepto', label: 'car', emoji: '🚗',
        visual_prompt: 'Toy car seen from the front, big wheels, flat colors, thick outline, no background.',
        tts_string: 'It takes us places on four wheels. Say: car.',
        stt_expected_array: ['car', 'cah', 'ca', 'tar'],
        parent_tpr_action: 'Roll a toy car along the floor towards your child.',
      },
      {
        kind: 'parte', label: 'wheel', emoji: '🛞',
        pictogram: 'rueda',
        visual_prompt: 'Single car wheel with visible tread, side view, flat colors, thick outline, no background.',
        tts_string: 'This round part is what turns and turns. Say: wheel.',
        stt_expected_array: ['wheel', 'weel', 'wee', 'heel'],
        parent_tpr_action: 'Spin the wheel with a finger and let your child stop it.',
      },
      {
        kind: 'accion', label: 'drive', emoji: '🛣️',
        visual_prompt: 'Hands on a steering wheel seen from behind, flat colors, thick outline, no background.',
        tts_string: 'Hands on the wheel and off we go. Say: drive.',
        stt_expected_array: ['drive', 'dwive', 'dive', 'gribe'],
        parent_tpr_action: 'Hold an imaginary steering wheel and turn it left and right together.',
      },
      {
        kind: 'cualidad', label: 'fast', emoji: '💨',
        visual_prompt: 'Car with speed lines behind it, side view, flat colors, thick outline, no background.',
        tts_string: 'Zooming along with the speed lines behind. Say: fast.',
        stt_expected_array: ['fast', 'fas', 'past', 'faht'],
        parent_tpr_action: 'Race the toy car across the floor as quickly as you both can.',
      },
    ],
  },
  {
    id: 'en-seq-dog', theme: 'Animals · The dog', icon: '🐶',
    phases: [
      {
        kind: 'concepto', label: 'dog', emoji: '🐶',
        visual_prompt: 'Friendly dog standing, side view, flat colors, thick outline, no background.',
        tts_string: 'It lives with us and goes woof. Say: dog.',
        stt_expected_array: ['dog', 'daw', 'dah', 'gog'],
        parent_tpr_action: 'Walk a stuffed dog across the table towards your child.',
      },
      {
        kind: 'parte', label: 'tail', emoji: '🐕',
        visual_prompt: 'Close-up of a dog’s wagging tail with motion lines, flat colors, thick outline, no background.',
        tts_string: 'This is the part that wags when it is happy. Say: tail.',
        stt_expected_array: ['tail', 'tay', 'teo', 'kail'],
        parent_tpr_action: 'Wag a hand behind you like a tail while your child copies.',
      },
      {
        kind: 'accion', label: 'run', emoji: '🏃',
        pictogram: 'correr',
        visual_prompt: 'Dog running with legs stretched out, side view, flat colors, thick outline, no background.',
        tts_string: 'Four legs going as fast as they can. Say: run.',
        stt_expected_array: ['run', 'wun', 'ruh', 'gun'],
        parent_tpr_action: 'Run on the spot together for five seconds.',
      },
      {
        kind: 'cualidad', label: 'soft', emoji: '🧸',
        visual_prompt: 'Hand stroking fluffy dog fur, close-up, flat colors, thick outline, no background.',
        tts_string: 'That is how the fur feels under your hand. Say: soft.',
        stt_expected_array: ['soft', 'sof', 'thoft', 'foft'],
        parent_tpr_action: 'Stroke the stuffed dog and then your child’s cheek with the same gentle touch.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 4 · Cápsulas de contraste. Dos vueltas por cápsula (objetivo + opuesto), el
//     MISMO objeto en las dos (congruencia ES-13) y pictogramas distintos por
//     vuelta (ES-12), reutilizando los dibujos ya existentes.
// ---------------------------------------------------------------------------
export const CONTRAST_CAPSULES_EN: ContrastCapsule[] = [
  {
    id: 'en-cap-big-small', code: 'CT-EN-1', kind: 'adjetivos',
    pair: ['big', 'small'], icon: '🧸',
    physical_setup: 'Get two teddy bears that look the same but are clearly different sizes: one clearly BIG and one clearly SMALL. Put both teddy bears in front of your child.',
    rounds: [
      {
        label: 'big', emoji: '🧸', pictogram: 'osito-grande',
        tts_trigger: 'Which teddy is the BIG one? Hand it to me and tell me! Say: big.',
        stt_expected_array: ['big', 'bih', 'pig', 'bi'],
        parent_action: 'Your child hands you the big teddy; hug it wide and puff your cheeks to show how huge it is.',
      },
      {
        label: 'small', emoji: '🧸', pictogram: 'osito-pequeno',
        tts_trigger: 'Now the other way round: which teddy is the SMALL one? Say: small.',
        stt_expected_array: ['small', 'mall', 'sma', 'smaw'],
        parent_action: 'Your child hands you the small teddy; hide it in one hand and whisper the word in a tiny voice.',
      },
    ],
  },
  {
    id: 'en-cap-dirty-clean', code: 'CT-EN-2', kind: 'adjetivos',
    pair: ['dirty', 'clean'], icon: '🥄',
    physical_setup: 'Take two identical spoons: wash one until it shines and smear the other spoon with a little food. Put them side by side.',
    rounds: [
      {
        label: 'dirty', emoji: '🥄', pictogram: 'cuchara-sucia',
        tts_trigger: 'Point to the spoon with food all over it. How is this one? Say: dirty.',
        stt_expected_array: ['dirty', 'dudy', 'dity', 'duhty'],
        parent_action: 'Your child points at it and you both pull a yuck face and push it away.',
      },
      {
        label: 'clean', emoji: '🥄', pictogram: 'cuchara-limpia',
        tts_trigger: 'And this other spoon, how is it? Look how it shines! Say: clean.',
        stt_expected_array: ['clean', 'kean', 'cween', 'kin'],
        parent_action: 'Point at the shiny one, blow on it like you are polishing it, and high five.',
      },
    ],
  },
  {
    id: 'en-cap-open-closed', code: 'CT-EN-3', kind: 'verbos',
    pair: ['open', 'closed'], icon: '📦',
    physical_setup: 'Put a box with a lid in front of your child and place their favourite toy inside where they can see it. Close the box lid.',
    rounds: [
      {
        label: 'open', emoji: '📦', pictogram: 'caja-abierta',
        tts_trigger: 'The toy is stuck inside. What do we do to the box? Say: open.',
        stt_expected_array: ['open', 'opa', 'ope', 'oben'],
        parent_action: 'Lift the lid together the moment your child says it, and cheer.',
      },
      {
        label: 'closed', emoji: '📦', pictogram: 'caja-cerrada',
        tts_trigger: 'Now the toy goes back to sleep in the box. How is the lid? Say: closed.',
        stt_expected_array: ['closed', 'close', 'kose', 'cwosed'],
        parent_action: 'Push the lid down together and pat it twice.',
      },
    ],
  },
  {
    id: 'en-cap-cold-hot', code: 'CT-EN-4', kind: 'adjetivos',
    pair: ['cold', 'hot'], icon: '🥤',
    physical_setup: 'Fill one cup with cold water and another cup with warm (not hot) water. Put both cups where your child can touch them.',
    rounds: [
      {
        label: 'cold', emoji: '🥤', pictogram: 'vaso-frio',
        tts_trigger: 'Touch this cup. Brrr, how does it feel? Say: cold.',
        stt_expected_array: ['cold', 'code', 'coad', 'tode'],
        parent_action: 'Both of you touch the cup and shiver with your shoulders up.',
      },
      {
        label: 'hot', emoji: '🥤', pictogram: 'vaso-caliente',
        tts_trigger: 'Now touch the other cup, carefully. How does this one feel? Say: hot.',
        stt_expected_array: ['hot', 'ot', 'hoh', 'hat'],
        parent_action: 'Touch it, pull your hand back quickly and blow on your fingers together.',
      },
    ],
  },
];

// Reintento y cierre de sesión del módulo.
export const SEM_RETRY_EN = (label: string): string => `One more time! Say: ${label}.`;
export const SEM_SESSION_DONE_EN = 'Session complete! High five!';
