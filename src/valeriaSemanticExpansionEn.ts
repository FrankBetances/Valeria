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
  {
    id: "park",
    title: "At the park",
    icon: "🌳",
    subtitle: "Swings, slides, running and playing outdoors",
    items: [
      {
        id: "en-park-swing", type: "sustantivo", label: "swing", emoji: "🪑",
        visual_prompt: "Playground swing hanging from chains, side view, flat colors, thick outline, no background.",
        tts_string: "We sit and fly high in the air. Say: swing.",
        stt_expected_array: ["swing", "wing", "sing", "swin"],
        parent_tpr_action: "Sit together and rock back and forth like a swing.",
      },
      {
        id: "en-park-ball", type: "sustantivo", label: "ball", emoji: "⚽",
        visual_prompt: "Classic red and white ball, side view, flat colors, thick outline, no background.",
        tts_string: "It is round and bounces on the grass. Say: ball.",
        stt_expected_array: ["ball", "baw", "bah", "bol"],
        parent_tpr_action: "Roll a small ball across the floor to each other.",
      },
      {
        id: "en-park-run", type: "verbo", label: "run", emoji: "🏃",
        visual_prompt: "Child running with joy, side view, flat colors, thick outline, no background.",
        tts_string: "We move our feet so fast across the park. Say: run.",
        stt_expected_array: ["run", "wun", "yun", "un"],
        parent_tpr_action: "Jog in place together counting one, two, three!",
      },
      {
        id: "en-park-slide", type: "verbo", label: "slide", emoji: "🛝",
        visual_prompt: "Playground slide, angled view, flat colors, thick outline, no background.",
        tts_string: "We climb up to the top and zoom down. Say: slide.",
        stt_expected_array: ["slide", "side", "swide", "lide"],
        parent_tpr_action: "Make your hand slide down your arm with a zooming sound.",
      },
      {
        id: "en-park-tall", type: "adjetivo", label: "tall", emoji: "🌲",
        visual_prompt: "Tall green tree reaching up, flat colors, thick outline, no background.",
        tts_string: "Look at the giant tree reaching for the sky. Say: tall.",
        stt_expected_array: ["tall", "taw", "tah", "to"],
        parent_tpr_action: "Stretch both arms as high up as you can.",
      },
      {
        id: "en-park-whee", type: "onomatopeya", label: "whee", emoji: "🎉",
        visual_prompt: "Confetti and excitement starburst, flat colors, thick outline, no background.",
        tts_string: "Going down the slide is so much fun. Say: whee!",
        stt_expected_array: ["whee", "wee", "we", "wi"],
        parent_tpr_action: "Throw your hands up in the air and yell whee!",
      },
    ],
  },
  {
    id: "bedtime",
    title: "Bedtime routine",
    icon: "🌙",
    subtitle: "Pajamas, stories and going to sleep",
    items: [
      {
        id: "en-bed-pajamas", type: "sustantivo", label: "pajamas", emoji: "👕",
        visual_prompt: "Two-piece cozy pajamas, flat colors, thick outline, no background.",
        tts_string: "We put on our cozy sleep clothes. Say: pajamas.",
        stt_expected_array: ["pajamas", "jamas", "jammies", "pajama"],
        parent_tpr_action: "Pat your tummy and pull on imaginary cozy pajamas.",
      },
      {
        id: "en-bed-book", type: "sustantivo", label: "book", emoji: "📖",
        visual_prompt: "Open children picture book, flat colors, thick outline, no background.",
        tts_string: "We turn the pages to read a bedtime story. Say: book.",
        stt_expected_array: ["book", "buk", "buh", "booc"],
        parent_tpr_action: "Hold your hands together like an open book and turn a page.",
      },
      {
        id: "en-bed-read", type: "verbo", label: "read", emoji: "👀",
        visual_prompt: "Child pointing at an open storybook, flat colors, thick outline, no background.",
        tts_string: "We look at pictures and tell the story. Say: read.",
        stt_expected_array: ["read", "weed", "yid", "eed"],
        parent_tpr_action: "Point with your index finger left-to-right on an open hand.",
      },
      {
        id: "en-bed-sleep", type: "verbo", label: "sleep", emoji: "😴",
        visual_prompt: "Sleeping moon on a soft pillow, flat colors, thick outline, no background.",
        tts_string: "We close our eyes and dream all night. Say: sleep.",
        stt_expected_array: ["sleep", "seep", "sweep", "leep"],
        parent_tpr_action: "Put both hands under your tilted cheek and close your eyes.",
      },
      {
        id: "en-bed-quiet", type: "adjetivo", label: "quiet", emoji: "🤫",
        visual_prompt: "Finger on lips gesture with starry night background, flat colors, thick outline.",
        tts_string: "The house is calm and peaceful now. Say: quiet.",
        stt_expected_array: ["quiet", "kwai-et", "kwiet", "kwayet"],
        parent_tpr_action: "Put your index finger to your lips with a soft shhh.",
      },
      {
        id: "en-bed-shh", type: "onomatopeya", label: "shh", emoji: "💤",
        visual_prompt: "Three sleepy zzz bubbles floating gently, flat colors, thick outline.",
        tts_string: "Time for all the toys to rest. Say: shh.",
        stt_expected_array: ["shh", "sh", "shhh", "ch"],
        parent_tpr_action: "Gently rock an imaginary baby and whisper shh.",
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
  {
    id: "en-seq-cow", theme: "Animals · The cow", icon: "🐄",
    phases: [
      {
        kind: "concepto", label: "cow", emoji: "🐄",
        visual_prompt: "Standing dairy cow with black spots, side view, flat colors, thick outline, no background.",
        tts_string: "This is the cow. Say: cow.",
        stt_expected_array: ["cow", "caw", "kaw", "kew"],
        parent_tpr_action: "Trace imaginary spots on your arm and make a soft moo together.",
      },
      {
        kind: "parte", label: "tail", emoji: "🪢",
        pictogram: "vaca-rabo",
        visual_prompt: "Cow tail swishing gently, flat colors, thick outline, no background.",
        tts_string: "The cow swishes its long tail. Say: tail.",
        stt_expected_array: ["tail", "tay", "tayo", "teil"],
        parent_tpr_action: "Swish one arm back and forth behind you like a happy tail.",
      },
      {
        kind: "accion", label: "eat", emoji: "🌱",
        pictogram: "comer",
        visual_prompt: "Cow munching green grass, flat colors, thick outline, no background.",
        tts_string: "The cow munches sweet green grass. Say: eat.",
        stt_expected_array: ["eat", "eet", "eht", "it"],
        parent_tpr_action: "Munch with your mouth open and closed like a chewing cow.",
      },
      {
        kind: "cualidad", label: "big", emoji: "🐄",
        visual_prompt: "Big round cow compared to tiny flower, flat colors, thick outline, no background.",
        tts_string: "The cow is very big and strong. Say: big.",
        stt_expected_array: ["big", "bih", "pig", "bi"],
        parent_tpr_action: "Spread both arms out wide to show how huge the cow is.",
      },
    ],
  },
  {
    id: "en-seq-cat", theme: "Animals · The cat", icon: "🐱",
    phases: [
      {
        kind: "concepto", label: "cat", emoji: "🐱",
        visual_prompt: "Friendly sitting striped cat, front view, flat colors, thick outline, no background.",
        tts_string: "This is the little cat. Say: cat.",
        stt_expected_array: ["cat", "kat", "ca", "gat"],
        parent_tpr_action: "Stroke an imaginary kitten gently on your lap.",
      },
      {
        kind: "parte", label: "whiskers", emoji: "🧔",
        pictogram: "gato-bigote",
        visual_prompt: "Cat whiskers on cheeks, flat colors, thick outline, no background.",
        tts_string: "The cat has tickly whiskers on its face. Say: whiskers.",
        stt_expected_array: ["whiskers", "whisker", "wisker", "wikers"],
        parent_tpr_action: "Draw three little whisker lines on your cheeks with your fingers.",
      },
      {
        kind: "accion", label: "climb", emoji: "🧗",
        pictogram: "subir",
        visual_prompt: "Cat climbing up a wooden post, flat colors, thick outline, no background.",
        tts_string: "The cat climbs up the tall tree. Say: climb.",
        stt_expected_array: ["climb", "kime", "cwimb", "lime"],
        parent_tpr_action: "Climb with hand-over-hand motions reaching up high.",
      },
      {
        kind: "cualidad", label: "soft", emoji: "🐱",
        visual_prompt: "Fluffy cat with soft fur texture, flat colors, thick outline, no background.",
        tts_string: "The cat has very soft fur. Say: soft.",
        stt_expected_array: ["soft", "soff", "sawt", "sof"],
        parent_tpr_action: "Gently stroke your cheek with the back of your hand.",
      },
    ],
  },
  {
    id: "en-seq-rain", theme: "Nature · The rain", icon: "🌧️",
    phases: [
      {
        kind: "concepto", label: "rain", emoji: "🌧️",
        visual_prompt: "Fluffy blue cloud with falling raindrops, flat colors, thick outline, no background.",
        tts_string: "Look at the sky, here comes the rain. Say: rain.",
        stt_expected_array: ["rain", "wain", "ane", "rein"],
        parent_tpr_action: "Wiggle your fingers moving down from the sky like falling raindrops.",
      },
      {
        kind: "parte", label: "drop", emoji: "💧",
        pictogram: "gota",
        visual_prompt: "Single clear water droplet, flat colors, thick outline, no background.",
        tts_string: "A tiny drop of water falls on your nose. Say: drop.",
        stt_expected_array: ["drop", "dwop", "dop", "gwop"],
        parent_tpr_action: "Gently tap the tip of your child’s nose with one finger.",
      },
      {
        kind: "accion", label: "fall", emoji: "⬇️",
        pictogram: "caer",
        visual_prompt: "Raindrops falling into a puddle, flat colors, thick outline, no background.",
        tts_string: "The raindrops fall all over the grass. Say: fall.",
        stt_expected_array: ["fall", "faw", "fow", "fah"],
        parent_tpr_action: "Tap your fingers rhythmically on the table, faster and faster.",
      },
      {
        kind: "cualidad", label: "wet", emoji: "💧",
        visual_prompt: "Wet leaf with sparkling water droplets, flat colors, thick outline, no background.",
        tts_string: "Everything outside is cool and wet. Say: wet.",
        stt_expected_array: ["wet", "weh", "wette", "wetty"],
        parent_tpr_action: "Shake your hands dry as if you just splashed in a puddle.",
      },
    ],
  },
  {
    id: "en-seq-train", theme: "Transportation · The train", icon: "🚂",
    phases: [
      {
        kind: "concepto", label: "train", emoji: "🚂",
        visual_prompt: "Classic steam engine locomotive, side view, flat colors, thick outline, no background.",
        tts_string: "Here comes the chugga chugga train. Say: train.",
        stt_expected_array: ["train", "twain", "tane", "chrain"],
        parent_tpr_action: "Pump your bent arms in circles like train wheels.",
      },
      {
        kind: "parte", label: "track", emoji: "🛤️",
        pictogram: "tren-via",
        visual_prompt: "Parallel train tracks with wooden ties, flat colors, thick outline, no background.",
        tts_string: "The train rolls along the metal track. Say: track.",
        stt_expected_array: ["track", "twack", "tack", "cwack"],
        parent_tpr_action: "Draw two parallel lines with both index fingers on the floor.",
      },
      {
        kind: "accion", label: "go", emoji: "💨",
        pictogram: "ir",
        visual_prompt: "Train moving forward with puffing steam cloud, flat colors, thick outline, no background.",
        tts_string: "The train starts to go down the line. Say: go.",
        stt_expected_array: ["go", "goh", "do", "gow"],
        parent_tpr_action: "Choo-choo march around the room together.",
      },
      {
        kind: "cualidad", label: "long", emoji: "🚂",
        visual_prompt: "Long line of passenger cars linked together, flat colors, thick outline, no background.",
        tts_string: "The train has so many cars, it is very long. Say: long.",
        stt_expected_array: ["long", "wong", "lawng", "lon"],
        parent_tpr_action: "Open both arms as wide as possible from side to side.",
      },
    ],
  },
  {
    id: "en-seq-bird", theme: "Animals · The bird", icon: "🐦",
    phases: [
      {
        kind: "concepto", label: "bird", emoji: "🐦",
        visual_prompt: "Little blue bird perched on a branch, side view, flat colors, thick outline, no background.",
        tts_string: "Look at the colorful little bird. Say: bird.",
        stt_expected_array: ["bird", "buhd", "boid", "berd"],
        parent_tpr_action: "Link your thumbs and flap your hands like bird wings.",
      },
      {
        kind: "parte", label: "wing", emoji: "🪶",
        pictogram: "pajaro-ala",
        visual_prompt: "Open bird wing with clear feathers, flat colors, thick outline, no background.",
        tts_string: "The bird opens its feather wing. Say: wing.",
        stt_expected_array: ["wing", "win", "wingy", "in"],
        parent_tpr_action: "Flap your elbows up and down like little wings.",
      },
      {
        kind: "accion", label: "fly", emoji: "✈️",
        pictogram: "volar",
        visual_prompt: "Bird soaring in the blue sky, flat colors, thick outline, no background.",
        tts_string: "The bird takes off and starts to fly. Say: fly.",
        stt_expected_array: ["fly", "fwy", "flai", "fai"],
        parent_tpr_action: "Soar with outstretched arms across the living room.",
      },
      {
        kind: "cualidad", label: "high", emoji: "☁️",
        visual_prompt: "Bird flying high above the clouds and trees, flat colors, thick outline, no background.",
        tts_string: "The bird flies way up in the high sky. Say: high.",
        stt_expected_array: ["high", "hai", "hy", "eye"],
        parent_tpr_action: "Stand on your tiptoes reaching both hands toward the ceiling.",
      },
    ],
  },
  {
    id: "en-seq-bread", theme: "Food · Breakfast", icon: "🍞",
    phases: [
      {
        kind: "concepto", label: "bread", emoji: "🍞",
        visual_prompt: "Loaf of golden sliced sandwich bread, flat colors, thick outline, no background.",
        tts_string: "Yummy toast for breakfast! Say: bread.",
        stt_expected_array: ["bread", "bwed", "bed", "bwet"],
        parent_tpr_action: "Pretend to butter a slice of toast in the palm of your hand.",
      },
      {
        kind: "parte", label: "crust", emoji: "🥖",
        pictogram: "pan-miga",
        visual_prompt: "Crispy outer crust of bread, flat colors, thick outline, no background.",
        tts_string: "The outside edge is the crunchy crust. Say: crust.",
        stt_expected_array: ["crust", "cwust", "kust", "trust"],
        parent_tpr_action: "Tap your knuckles together making a crunchy sound.",
      },
      {
        kind: "accion", label: "bite", emoji: "👄",
        pictogram: "morder",
        visual_prompt: "Slice of bread with one big clean bite taken out, flat colors, thick outline, no background.",
        tts_string: "Open wide and take a big bite. Say: bite.",
        stt_expected_array: ["bite", "bai", "by", "bitey"],
        parent_tpr_action: "Chomp your hands together like a giant bite.",
      },
      {
        kind: "cualidad", label: "warm", emoji: "🔥",
        visual_prompt: "Warm toast with soft steam curls, flat colors, thick outline, no background.",
        tts_string: "Fresh from the toaster, it feels warm. Say: warm.",
        stt_expected_array: ["warm", "wawm", "worm", "wahm"],
        parent_tpr_action: "Blow warm breath onto your cupped hands.",
      },
    ],
  },
  {
    id: "en-seq-balloon", theme: "Play · The balloon", icon: "🎈",
    phases: [
      {
        kind: "concepto", label: "balloon", emoji: "🎈",
        visual_prompt: "Bright red oval party balloon on string, flat colors, thick outline, no background.",
        tts_string: "Look at the red party balloon. Say: balloon.",
        stt_expected_array: ["balloon", "ba-woon", "ba-loon", "boon"],
        parent_tpr_action: "Pretend to hold a floating string in your hand.",
      },
      {
        kind: "parte", label: "string", emoji: "🧵",
        pictogram: "globo-cuerda",
        visual_prompt: "White curly string tied to a balloon, flat colors, thick outline, no background.",
        tts_string: "Hold tight to the long string. Say: string.",
        stt_expected_array: ["string", "tring", "swin", "sting"],
        parent_tpr_action: "Pinch two fingers tight and pull down gently.",
      },
      {
        kind: "accion", label: "pop", emoji: "💥",
        pictogram: "explotar",
        visual_prompt: "Balloon popping with confetti burst, flat colors, thick outline, no background.",
        tts_string: "When it pokes a pin, it goes pop! Say: pop.",
        stt_expected_array: ["pop", "pahp", "pap", "bop"],
        parent_tpr_action: "Clap hands together loudly on the word pop!",
      },
      {
        kind: "cualidad", label: "round", emoji: "⭕",
        visual_prompt: "Perfect round colorful ball shape, flat colors, thick outline, no background.",
        tts_string: "Full of air, the balloon is so round. Say: round.",
        stt_expected_array: ["round", "wound", "raon", "ownd"],
        parent_tpr_action: "Draw a big circular ball in the air with both hands.",
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
    id: "en-cap-big-small", code: "CT-EN-1", kind: "adjetivos",
    pair: ["big", "small"], icon: "🧸",
    physical_setup: "Get two teddy bears that look the same but are clearly different sizes: one clearly BIG and one clearly SMALL. Put both teddy bears in front of your child.",
    rounds: [
      {
        label: "big", emoji: "🧸", pictogram: "osito-grande",
        tts_trigger: "Which teddy is the BIG one? Hand it to me and tell me! Say: big.",
        stt_expected_array: ["big", "bih", "pig", "bi"],
        parent_action: "Your child hands you the big teddy; hug it wide and puff your cheeks to show how huge it is.",
      },
      {
        label: "small", emoji: "🧸", pictogram: "osito-pequeno",
        tts_trigger: "Now the other way round: which teddy is the SMALL one? Say: small.",
        stt_expected_array: ["small", "mall", "sma", "smaw"],
        parent_action: "Your child hands you the small teddy; hide it in one hand and whisper the word in a tiny voice.",
      },
    ],
  },
  {
    id: "en-cap-dirty-clean", code: "CT-EN-2", kind: "adjetivos",
    pair: ["dirty", "clean"], icon: "🥄",
    physical_setup: "Take two identical spoons: wash one until it shines and smear the other spoon with a little food. Put them side by side.",
    rounds: [
      {
        label: "dirty", emoji: "🥄", pictogram: "cuchara-sucia",
        tts_trigger: "Point to the spoon with food all over it. How is this one? Say: dirty.",
        stt_expected_array: ["dirty", "dudy", "dity", "duhty"],
        parent_action: "Your child points at it and you both pull a yuck face and push it away.",
      },
      {
        label: "clean", emoji: "🥄", pictogram: "cuchara-limpia",
        tts_trigger: "And this other spoon, how is it? Look how it shines! Say: clean.",
        stt_expected_array: ["clean", "kean", "cween", "kin"],
        parent_action: "Point at the shiny one, blow on it like you are polishing it, and high five.",
      },
    ],
  },
  {
    id: "en-cap-open-close", code: "CT-EN-3", kind: "verbos",
    pair: ["open", "close"], icon: "📦",
    physical_setup: "Put a box with a lid in front of your child and place their favourite toy inside where they can see it. Close the box lid.",
    rounds: [
      {
        label: "open", emoji: "📦", pictogram: "caja-abierta",
        tts_trigger: "The toy is stuck inside. What do we do to the box? Say: open.",
        stt_expected_array: ["open", "opa", "ope", "oben"],
        parent_action: "Lift the lid together the moment your child says it, and cheer.",
      },
      {
        label: "close", emoji: "📦", pictogram: "caja-cerrada",
        tts_trigger: "Now the toy goes back to sleep in the box. What do we do to the lid? Say: close.",
        stt_expected_array: ["close", "kose", "cwose", "cloze"],
        parent_action: "Push the lid down together and pat it twice.",
      },
    ],
  },
  {
    id: "en-cap-up-down", code: "CT-EN-4", kind: "verbos",
    pair: ["up", "down"], icon: "🚗",
    physical_setup: "Make a ramp by leaning a large hardcover book on a cushion and place a toy car at the bottom.",
    rounds: [
      {
        label: "up", emoji: "⬆️", pictogram: "coche-subiendo",
        tts_trigger: "The car goes up the steep hill! What does it do? Say: up.",
        stt_expected_array: ["up", "uhp", "ap", "up-up"],
        parent_action: "Push the toy car slowly up the book ramp together.",
      },
      {
        label: "down", emoji: "⬇️", pictogram: "coche-bajando",
        tts_trigger: "Now let go! The car zooms down the ramp! Say: down.",
        stt_expected_array: ["down", "dahn", "daon", "dow"],
        parent_action: "Let the car roll down fast and shout whee!",
      },
    ],
  },
  {
    id: "en-cap-cold-hot", code: "CT-EN-5", kind: "adjetivos",
    pair: ["cold", "hot"], icon: "🥤",
    physical_setup: "Fill one cup with cold water and another cup with warm water. Put both cups where your child can touch them.",
    rounds: [
      {
        label: "cold", emoji: "🥤", pictogram: "vaso-frio",
        tts_trigger: "Touch this cup. Brrr, how does it feel? Say: cold.",
        stt_expected_array: ["cold", "code", "coad", "tode"],
        parent_action: "Both of you touch the cup and shiver with your shoulders up.",
      },
      {
        label: "hot", emoji: "🥤", pictogram: "vaso-caliente",
        tts_trigger: "Now touch the other cup, carefully. How does this one feel? Say: hot.",
        stt_expected_array: ["hot", "ot", "hoh", "hat"],
        parent_action: "Touch it, pull your hand back quickly and blow on your fingers together.",
      },
    ],
  },
  {
    id: "en-cap-on-off", code: "CT-EN-6", kind: "verbos",
    pair: ["on", "off"], icon: "💡",
    physical_setup: "Stand next to the light switch with the light turned off, or hold a flashlight.",
    rounds: [
      {
        label: "on", emoji: "💡", pictogram: "bombilla-encendida",
        tts_trigger: "It is dark in here. What do we do to the light? Say: on.",
        stt_expected_array: ["on", "ahn", "awn", "on-on"],
        parent_action: "Your child flips the switch on and you both cheer.",
      },
      {
        label: "off", emoji: "💡", pictogram: "bombilla-apagada",
        tts_trigger: "Now time for bed. What do we do to the light? Say: off.",
        stt_expected_array: ["off", "awf", "ahf", "of"],
        parent_action: "Turn the light off and whisper goodnight together.",
      },
    ],
  },
  {
    id: "en-cap-full-empty", code: "CT-EN-7", kind: "adjetivos",
    pair: ["full", "empty"], icon: "🧺",
    physical_setup: "Prepare two identical baskets: fill one to the top with toys, and leave the other one completely empty.",
    rounds: [
      {
        label: "full", emoji: "🧺", pictogram: "cesta-llena",
        tts_trigger: "Which basket has toys piled all the way to the top? Say: full.",
        stt_expected_array: ["full", "foo", "ful", "fuw"],
        parent_action: "Lift the heavy basket together and grunt at how full it is.",
      },
      {
        label: "empty", emoji: "🧺", pictogram: "cesta-vacia",
        tts_trigger: "And look inside this other basket. There is nothing inside! Say: empty.",
        stt_expected_array: ["empty", "emty", "enti", "em-tee"],
        parent_action: "Turn the empty basket upside down over your child’s head like a funny hat.",
      },
    ],
  },
  {
    id: "en-cap-in-out", code: "CT-EN-8", kind: "verbos",
    pair: ["in", "out"], icon: "📥",
    physical_setup: "Place an open toy bin and three small toys on the floor outside the bin.",
    rounds: [
      {
        label: "in", emoji: "📥", pictogram: "juguete-dentro",
        tts_trigger: "Time to pack away the toys. Where do they go? Say: in.",
        stt_expected_array: ["in", "inn", "een", "in-in"],
        parent_action: "Drop a toy into the bin on each word and clap.",
      },
      {
        label: "out", emoji: "📤", pictogram: "juguete-fuera",
        tts_trigger: "Time to play! What do we do with the toys? Say: out.",
        stt_expected_array: ["out", "owt", "awt", "ou"],
        parent_action: "Dump the toys out gently on the rug.",
      },
    ],
  },
];

// Reintento y cierre de sesión del módulo.
export const SEM_RETRY_EN = (label: string): string => `One more time! Say: ${label}.`;
export const SEM_SESSION_DONE_EN = 'Session complete! High five!';
