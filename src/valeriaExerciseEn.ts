// ============================================================================
// Valeria+ · Audición · Lenguaje · TEA · Dislexia en INGLÉS — plan en-US, EN-3.6
// Capa de overrides sobre el banco base (patrón valeriaExerciseEu/Gl): las
// pantallas no cambian, cambia lo que dicen y lo que evalúan.
//
// Dos bloques NO son traducción, son rediseño, porque el castellano y el inglés
// no comparten el problema (§4.2 del plan):
//
//  · MORFOSINTAXIS. El inglés no tiene género gramatical, así que el ejercicio
//    de flexión de género (ms2) se queda sin objeto: se sustituye por PLURALES
//    IRREGULARES (foot/feet), que es el objetivo clásico de la logopedia
//    angloamericana. El plural regular (ms1) mantiene la forma pero cambia de
//    naturaleza: en inglés hay tres realizaciones (/s/ · /z/ · /ɪz/) y el
//    ejercicio trabaja la producción, no el juicio de gramaticalidad — la
//    variabilidad de la -s es rasgo regular del inglés afroamericano y
//    juzgarla sería exactamente lo que prohíbe la guía dialectal (§4.9).
//
//  · DISLEXIA. El castellano es ortográficamente transparente y el bloque
//    original trabaja sílaba y velocidad. El inglés es OPACO, así que el bloque
//    inglés trabaja familias de rimas (-at, -op, -ight), dígrafos (sh, ch, th,
//    ck), la silent e y la lectura de pseudopalabras. Misma interfaz, contenido
//    nuevo.
//
// ESTADO: 🟡 BORRADOR PARA REVISIÓN CLÍNICA (EN-3.6). Pendiente de EN-0.3 y de
// la pasada de hablante nativo (EN-7.4).
// ============================================================================
import { Exercise } from './valeriaExerciseBank';
import { MIC_VERDICT_SAY_EN } from './valeriaContentEn';

export const EMO_EN: { face: string; label: string }[] = [
  { face: '😀', label: 'happy' }, { face: '😢', label: 'sad' },
  { face: '😠', label: 'angry' }, { face: '🤕', label: 'hurt' },
];
export const SESSION_DONE_LEAD_EN = 'Session complete!';
export const PLURAL_HINT_EN = 'That one shows just one. Find the one with many.';
export const EMOTION_PROMPT_EN = 'How do they feel?';
export const TOUCH_IMAGE_HINT_EN = 'First, touch one of the pictures.';

// Piezas fijas de voz (espejo de EXERCISE_FIXED_LINES en inglés). Los veredictos
// hablados viven en valeriaContentEn junto al resto de frases de aplicación.
export const EXERCISE_FIXED_LINES_EN: { style: 'tutor' | 'child' | 'slow'; text: string }[] = [
  ...MIC_VERDICT_SAY_EN.map((t) => ({ style: 'child' as const, text: t })),
  { style: 'child', text: TOUCH_IMAGE_HINT_EN },
  ...EMO_EN.map((e) => ({ style: 'child' as const, text: e.label })),
  { style: 'child', text: SESSION_DONE_LEAD_EN },
  { style: 'child', text: PLURAL_HINT_EN },
  // MISMO literal que construye emotionPromptFor(loc) en el player: si difiere
  // aunque sea en un espacio, el asset neuronal deja de resolver.
  { style: 'tutor', text: `${EMOTION_PROMPT_EN} ${EMO_EN.map((e) => e.label).join(', ')}?` },
];

export const EXERCISE_EN: Record<string, Partial<Exercise>> = {
  // ======================= AUDICIÓN (fonética-fonología) ====================
  ff1: {
    name: 'Initial vowel association',
    category: 'Sounds and vowels (phonetics-phonology)',
    read: 'Your child touches a picture to hear its name, then touches the vowel it starts with. The app tells them if they got it right.',
    stageLabel: 'Match each picture to its first vowel',
    tiles: [{ cap: 'apple', emoji: '🍎' }, { cap: 'elephant', emoji: '🐘' }, { cap: 'igloo', emoji: '🧊' }],
    move: 'Draw the letter in the air with a big arm every time they get one right.',
    ept: [
      'Still cannot match a picture to its first vowel, even with help.',
      'Gets the vowel when you give a hint.',
      'Matches every picture to its vowel on their own.',
    ],
  },
  ff2: {
    name: 'Vowel articulation',
    category: 'Sounds and vowels (phonetics-phonology)',
    read: 'You say the word first, close to your child and slowly, and encourage them to copy you. The app’s voice is only a backup.',
    stageLabel: 'Repeat the word', phrase: 'BANANA', phraseEmoji: '🍌',
    move: 'Walk across the room stamping hard on each syllable: BA-NA-NA.',
    ept: [
      'Does not copy the sounds yet, or lands a long way from the word.',
      'Repeats the word after hearing you say it more than once.',
      'Says the word on their own, with every syllable clear.',
    ],
  },
  ff3: {
    name: 'Fill in the missing vowel',
    category: 'Sounds and vowels (phonetics-phonology)',
    read: 'Press 🔊 first so your child hears the whole word. Then have them touch the vowel that is missing from the written word.',
    stageLabel: 'Listen to the word and fill in the vowel',
    fillBefore: 'C', fillAfter: 'T', fillAnswer: 'A', fillEmoji: '🐱', fillCap: 'cat',
    move: 'When they find the vowel, stretch both arms up like a big cat.',
    ept: [
      'Cannot find the missing vowel yet, even with help.',
      'Completes the word if you repeat the sound or give a hint.',
      'Listens and touches the missing vowel on their own.',
    ],
  },

  // ========================== VOCABULARIO (semántica) ======================
  se1: {
    name: 'Find the odd one out',
    category: 'Vocabulary (semantics)',
    read: 'Press 🔊 to hear the name of all four cards. Three go together and one does not. Your child touches the one that does NOT belong.',
    stageLabel: 'Touch the card that does not belong',
    intruder: [{ cap: 'apple', emoji: '🍎' }, { cap: 'banana', emoji: '🍌' }, { cap: 'grapes', emoji: '🍇' }, { cap: 'car', emoji: '🚗' }],
    intruderAnswer: 3,
    move: 'If it is something you eat, touch your tummy; if it is the odd one out, star jump!',
    ept: [
      'Does not find the odd one out yet.',
      'Finds it when you ask a helping question ("which ones do we eat?").',
      'Finds it on their own and explains why it does not belong.',
    ],
  },
  se2: {
    name: 'Letter riddle guessing',
    category: 'Vocabulary (semantics)',
    read: 'Press 🔊 to play the riddle (or read it yourself). Your child answers by touching one of the three pictures.',
    stageLabel: 'Listen to the riddle and touch the answer',
    choicePrompt: 'It is yellow, it is long and soft, and monkeys love it. What is it?',
    choiceLabel: 'Play the riddle', choiceVoice: 'tutor',
    options: [{ cap: 'banana', emoji: '🍌' }, { cap: 'pear', emoji: '🍐' }, { cap: 'ball', emoji: '⚽' }],
    optionAnswer: 0,
    move: 'Hunt around the room for a real object that starts with the same sound.',
    ept: [
      'Does not get the answer yet, even with extra clues.',
      'Gets it after you repeat the riddle or add another clue.',
      'Gets it first time, just from listening.',
    ],
  },
  se3: {
    name: 'Clothing and multi-step commands',
    category: 'Vocabulary (semantics)',
    materials: 'A doll or puppet and some real clothes: a hat, shoes, a t-shirt…',
    read: 'Take the doll and the clothes. Give your child one instruction at a time: "Put the hat on the doll." Take turns changing the clothes.',
    stageLabel: 'Follow the clothing instructions',
    move: 'Every time they dress the doll, they put the same item on themselves.',
    ept: [
      'Does not follow the instruction yet, even when you point.',
      'Follows it when you point or show them first.',
      'Follows the instruction on their own, first time.',
    ],
  },

  // ========================= FRASES (morfosintaxis) ========================
  ms1: {
    name: 'Singular / plural',
    category: 'Sentences (morphosyntax)',
    read: 'Two cards: one shows a single thing and the other shows many. Your child touches the one you ask for and says it out loud.',
    stageLabel: 'Touch the card with many',
    plural: { cap: 'cat', capPlural: 'cats', emoji: '🐱', gender: 'm' },
    move: 'Clap once for one, and clap fast for many.',
    ept: [
      'Does not tell one from many yet.',
      'Gets it when you say the word with them.',
      'Tells them apart and says the plural on their own.',
    ],
  },
  // ms2 REDISEÑADO: el inglés no tiene género gramatical. El objetivo pasa a
  // ser el plural IRREGULAR, que es el clásico de la logopedia angloamericana
  // y no tiene equivalente en el ejercicio castellano.
  ms2: {
    name: 'Irregular plurals',
    read: 'Press 🔊 and listen. Some words do not just add an -s: one foot, two feet. Your child touches the picture that matches what they hear.',
    stageLabel: 'Listen and touch the right picture',
    choicePrompt: 'I can see two feet. Touch the picture that shows feet.',
    choiceLabel: 'Play it again', choiceVoice: 'tutor',
    options: [{ cap: 'foot', emoji: '🦶' }, { cap: 'feet', emoji: '👣' }, { cap: 'shoe', emoji: '👟' }],
    optionAnswer: 1,
    move: 'Stamp one foot for "foot" and both feet for "feet".',
    ept: [
      'Does not tell the singular from the irregular plural yet.',
      'Gets it when you say both words next to each other.',
      'Picks the irregular plural on their own and says it.',
    ],
  },
  ms3: {
    name: 'S-V-O sentence structure',
    category: 'Sentences (morphosyntax)',
    read: 'Three cards make one sentence. Your child puts them in order and then says the whole sentence out loud.',
    stageLabel: 'Build the sentence in order',
    parts: [
      { role: 'who', cap: 'the dog', emoji: '🐶' },
      { role: 'does', cap: 'eats', emoji: '😋' },
      { role: 'what', cap: 'the bone', emoji: '🦴' },
    ],
    sentence: 'The dog eats the bone.',
    move: 'Take one step forward for each card as you say it out loud.',
    ept: [
      'Does not put the cards in order yet.',
      'Gets the order when you say the sentence first.',
      'Orders the cards and says the whole sentence on their own.',
    ],
  },

  // ========================== USO SOCIAL (pragmática) ======================
  pr1: {
    name: '"What" question answering',
    category: 'Social communication (pragmatics)',
    read: 'Show your child a picture or an object and ask "what is this?". Wait five whole seconds before helping — that silence is what makes them answer.',
    stageLabel: 'Answer the what question',
    instrHint: 'Ask, then count to five in your head before you say anything else.',
    move: 'Every answer earns a high five.',
    ept: [
      'Does not answer the question yet.',
      'Answers when you start the word for them.',
      'Answers on their own within the five seconds.',
    ],
  },
  pr2: {
    name: 'Conversational adaptation',
    category: 'Social communication (pragmatics)',
    read: 'Your child tells the same little story twice: once to you and once to a younger toy or sibling. The point is that they change HOW they say it.',
    stageLabel: 'Tell it two ways',
    instrHint: 'For the younger listener: shorter sentences, slower, more gestures.',
    move: 'Sit on the floor for the younger listener and stand up for the grown-up one.',
    ept: [
      'Tells it exactly the same way both times.',
      'Changes something when you remind them who is listening.',
      'Changes how they tell it on their own.',
    ],
  },
  pr3: {
    name: 'Emotion recognition',
    category: 'Social communication (pragmatics)',
    read: 'Look at the face together. Your child says how that person feels and then makes the same face.',
    stageLabel: 'Name the feeling',
    emotionFace: '😢', emotionAnswer: 'sad',
    move: 'Both of you pull the same face and hold it while you count to three.',
    ept: [
      'Does not name the feeling yet.',
      'Names it when you offer two choices.',
      'Names the feeling on their own and copies the face.',
    ],
  },
  pr4: {
    name: 'Asking for clarification',
    category: 'Social communication (pragmatics)',
    read: 'Say something on purpose too quietly to hear. Your child has to ask you to say it again instead of guessing or going quiet.',
    stageLabel: 'Ask for a repeat',
    instrHint: 'Mumble it. If they guess, stay quiet and wait — do not repeat until they ask.',
    micTarget: 'what', micAlt: ['huh', 'what did you say', 'say it again'],
    micPrompt: 'When you cannot hear, ask: what?',
    move: 'Cup a hand behind your ear together as the signal for "say it again".',
    ept: [
      'Guesses or goes quiet instead of asking.',
      'Asks when you point at your ear.',
      'Asks for a repeat on their own.',
    ],
  },

  // ================= ESCUCHA EN RUIDO (rehabilitación auditiva) ============
  ra1: {
    name: 'Figure-ground speech in noise',
    category: 'Auditory training (speech in noise)',
    read: 'The app plays a word with background noise. Your child touches the picture that matches what they heard.',
    stageLabel: 'Listen through the noise and touch the picture',
    choicePrompt: 'Touch the picture of the dog.',
    choiceLabel: 'Play it again', choiceVoice: 'tutor',
    options: [{ cap: 'dog', emoji: '🐶' }, { cap: 'cat', emoji: '🐱' }, { cap: 'bird', emoji: '🐦' }],
    optionAnswer: 0,
    move: 'Point at the picture and then make that animal’s sound together.',
    ept: [
      'Does not find the word through the noise yet.',
      'Finds it when you lower the noise or repeat it.',
      'Finds it first time with the noise on.',
    ],
  },
  ra2: {
    name: 'Speechreading (lipreading)',
    category: 'Auditory training (speech in noise)',
    read: 'Say the word with NO voice at all — just your mouth. Your child has to read your lips and touch the right picture. The text is folded away so you can check it without showing them.',
    stageLabel: 'Read the lips and touch the picture',
    choicePrompt: 'cup',
    choiceLabel: 'Hear the word (grown-up only)', choiceVoice: 'slow',
    promptDisplay: 'adulto',
    options: [{ cap: 'cup', emoji: '🥛' }, { cap: 'spoon', emoji: '🥄' }, { cap: 'sock', emoji: '🧦' }],
    optionAnswer: 0,
    move: 'Swap over: your child mouths a word and you have to guess it.',
    ept: [
      'Cannot read the word from your lips yet.',
      'Gets it when you add a tiny bit of voice.',
      'Reads it from your lips alone.',
    ],
  },
  ra3: {
    name: 'Degraded closed-set identification',
    category: 'Auditory training (speech in noise)',
    read: 'The app plays a short instruction with the sound degraded. Your child picks the picture it asked for.',
    stageLabel: 'Listen and choose',
    choicePrompt: 'Find the ball.',
    choiceLabel: 'Play it again', choiceVoice: 'tutor',
    options: [{ cap: 'ball', emoji: '⚽' }, { cap: 'car', emoji: '🚗' }, { cap: 'cup', emoji: '🥛' }],
    optionAnswer: 0,
    move: 'Run to fetch the real object as soon as they choose.',
    ept: [
      'Does not pick the right picture yet.',
      'Picks it after a repeat.',
      'Picks it first time.',
    ],
  },
  ra4: {
    name: 'Sequential recall with delay',
    category: 'Auditory training (speech in noise)',
    read: 'Three cards make a sequence. Your child listens, waits for the whole thing to finish, and then puts them in order.',
    stageLabel: 'Listen to the whole sequence, then order it',
    parts: [
      { role: 'first', cap: 'wake up', emoji: '⏰' },
      { role: 'then', cap: 'get dressed', emoji: '👕' },
      { role: 'last', cap: 'eat', emoji: '🥣' },
    ],
    sentence: 'First we wake up, then we get dressed, and last we eat.',
    move: 'Act out each step as you place its card.',
    ept: [
      'Does not hold the sequence yet.',
      'Orders it when you repeat the steps one by one.',
      'Waits for the whole sequence and orders it on their own.',
    ],
  },
  ra5: {
    name: 'Sound localization',
    category: 'Auditory training (speech in noise)',
    read: 'Stand behind your child and make a sound from one side. They point to where it came from without turning around first.',
    stageLabel: 'Point to where the sound came from',
    instrHint: 'Change sides at random, and sometimes stay on the same side twice.',
    move: 'Every time they get it right, they get to make the sound for you.',
    ept: [
      'Does not locate the sound yet.',
      'Locates it when the sound lasts longer.',
      'Points straight to the right side on their own.',
    ],
  },

  // ===================== LENGUAJE · protocolo familiar ======================
  atencion_conjunta: {
    name: 'Joint attention',
    category: 'Gaze, bubbles and name response',
    read: 'Follow what your child is already looking at and name it. Do not redirect them to what YOU want to show: join in first, lead later.',
    stageLabel: 'Join their attention',
    instrHint: 'Name what they are looking at, then wait. The waiting is the exercise.',
    proposals: [
      'Blow bubbles and name each one they follow with their eyes.',
      'Roll a ball back and forth and name it every time it comes back.',
      'Say their name and wait for eye contact before handing them the toy.',
    ],
    move: 'Every shared look earns a bubble.',
    ept: [
      'Does not share attention with you yet.',
      'Shares it when you touch or nudge them.',
      'Looks from the object to you and back on their own.',
    ],
    levels: [
      { label: 'Inicial', read: 'Name what they are already looking at. Nothing else.', instrIcon: '👀', instrHint: 'No questions and no instructions for now: just name it.' },
      { label: 'Intermedio', read: 'Name it and then wait for them to look at you.', instrIcon: '🫧', instrHint: 'Count to five in your head before you say anything more.' },
      { label: 'Avanzado', read: 'Offer something new and wait for them to bring you into it.', instrIcon: '🤝', instrHint: 'Let them start it: your job is to answer, not to lead.' },
    ],
  },
  imitacion: {
    name: 'Motor & verbal imitation',
    category: 'Clapping, drumming and syllables',
    read: 'Do a short action and wait for your child to copy it. Start with the body, then move to sounds.',
    stageLabel: 'Copy the action',
    instrHint: 'Do the action, then freeze and wait. Do not do it for them.',
    move: 'Every copy earns a clap.',
    ept: [
      'Does not copy the action yet.',
      'Copies when you guide their hands.',
      'Copies on their own as soon as they see it.',
    ],
    levels: [
      { label: 'Inicial', read: 'Clap. Just clapping, over and over, until they join in.', instrIcon: '👏', instrHint: 'Big, slow claps right in front of them.' },
      { label: 'Intermedio', read: 'Tap a drum rhythm and have them copy it.', instrIcon: '🥁', instrHint: 'Two beats first, then three. Do not go faster than they can copy.' },
      { label: 'Avanzado', read: 'Clap out the syllables of a word and have them copy the rhythm and the word.', instrIcon: '🗣️', instrHint: 'BA-NA-NA, one clap per syllable.' },
    ],
  },
  comprension: {
    name: 'Verbal comprehension',
    category: 'Commands, body parts and categories',
    read: 'Give one instruction at a time and wait. If they do not respond, help with a gesture before you help with words.',
    stageLabel: 'Follow the instruction',
    instrHint: 'One instruction, then silence. Two instructions at once is a different exercise.',
    move: 'Each instruction they follow earns a step towards a hiding place.',
    ept: [
      'Does not follow the instruction yet.',
      'Follows it when you point or show them.',
      'Follows it from the words alone.',
    ],
    levels: [
      { label: 'Inicial', read: 'Touch your own body part and ask them to touch theirs.', instrIcon: '🖐️', instrHint: 'Head, nose, tummy. Show first, then just say it.' },
      { label: 'Intermedio', read: 'Ask for an object that is in sight but out of reach.', instrIcon: '🧺', instrHint: 'Two objects only, so the choice is real.' },
      { label: 'Avanzado', read: 'Ask for a whole category: "give me something we eat".', instrIcon: '🍎', instrHint: 'Put three things out, only one of which fits.' },
    ],
  },
  expresion: {
    name: 'Verbal expression',
    category: 'Animal sounds, naming and sentences',
    read: 'Give your child the first part and let them finish it. Start with sounds and build up to whole phrases.',
    stageLabel: 'Finish it off', phrase: 'MOO', phraseEmoji: '🐮',
    move: 'Act out the animal while you make its sound.',
    ept: [
      'Does not produce the sound or the word yet.',
      'Produces it when you start it for them.',
      'Produces it on their own.',
    ],
    levels: [
      { label: 'Inicial', read: 'Animal sounds: you start, they finish.', instrIcon: '🐮', instrHint: 'The cow says… and then wait.' },
      { label: 'Intermedio', read: 'Name what is in the picture with one word.', instrIcon: '🖼️', instrHint: 'Accept the approximation: "nana" for banana counts.' },
      { label: 'Avanzado', read: 'Two words together: "more milk", "big dog".', instrIcon: '🗨️', instrHint: 'Expand what they say instead of correcting it.' },
    ],
  },
  comunicacion_funcional: {
    name: 'Functional communication',
    category: 'Requesting "more", "help", "want"',
    read: 'Set things up so your child NEEDS to ask. Put the favourite thing in sight but out of reach and wait for a request.',
    stageLabel: 'Ask for it',
    instrHint: 'A gesture, a sound or a word all count as asking. Answer straight away when they do.',
    move: 'The moment they ask, they get it. No delay.',
    ept: [
      'Does not ask yet; takes it or gives up.',
      'Asks when you show them how.',
      'Asks on their own, with a gesture, a sound or a word.',
    ],
    levels: [
      { label: 'Inicial', read: 'Wait for any signal at all: a look, a reach, a sound.', instrIcon: '🫴', instrHint: 'Answer the first attempt, however small.' },
      { label: 'Intermedio', read: 'Wait for "more" or "help".', instrIcon: '➕', instrHint: 'Model it once, then wait.' },
      { label: 'Avanzado', read: 'Wait for "I want" plus the thing.', instrIcon: '🗣️', instrHint: 'Expand whatever they say into the full phrase.' },
    ],
  },
  regulacion_conductual: {
    name: 'Behavioral regulation',
    category: 'Transitions, routines and rewards',
    read: 'Announce what comes next BEFORE it happens. Transitions are easier when they are predictable.',
    stageLabel: 'Get through the transition',
    instrHint: 'Warn them twice: "two more minutes", then "one more minute".',
    move: 'Sing the same short song for every transition so it becomes the signal.',
    ept: [
      'The transition still breaks down.',
      'Gets through it with the warning and your help.',
      'Gets through it with just the warning.',
    ],
    levels: [
      { label: 'Inicial', read: 'One warning, then the change.', instrIcon: '⏳', instrHint: 'Same words every time.' },
      { label: 'Intermedio', read: 'Use a picture schedule they can see.', instrIcon: '🗓️', instrHint: 'Let them move the marker themselves.' },
      { label: 'Avanzado', read: 'Let them choose the order of two activities.', instrIcon: '🔀', instrHint: 'Both options have to be things you can live with.' },
    ],
  },
  interaccion_social: {
    name: 'Social interaction',
    category: 'Turn-taking, pretend play, emotions',
    read: 'Take turns at something your child already enjoys. The point is the turn, not the activity.',
    stageLabel: 'Take turns',
    instrHint: 'Say "my turn" and "your turn" out loud every single time.',
    move: 'Pass a small object back and forth as the turn token.',
    ept: [
      'Does not take turns yet.',
      'Takes turns when you prompt them.',
      'Takes turns on their own and waits for yours.',
    ],
    levels: [
      { label: 'Inicial', read: 'Two turns, then stop while it is still fun.', instrIcon: '🔁', instrHint: 'End before they lose interest, not after.' },
      { label: 'Intermedio', read: 'Bring a third person into the turns.', instrIcon: '👨‍👩‍👦', instrHint: 'A sibling or another grown-up.' },
      { label: 'Avanzado', read: 'Pretend play with roles: shop, doctor, kitchen.', instrIcon: '🎭', instrHint: 'Let them assign you your role.' },
    ],
  },

  // ================================= TEA ===================================
  tea1: {
    name: 'Triangulated joint attention',
    category: 'PRT · eye contact and dual validation',
    read: 'Hold the toy up next to your own eyes and wait. You are looking for the double seal: your child looks at the toy AND at you.',
    stageLabel: 'Wait for the double look',
    instrHint: 'Do not hand it over on the first look at the toy. Wait for the look at you.',
    move: 'Hand the toy over the instant both looks happen.',
    ept: [
      'Only looks at the toy.',
      'Looks at you when you say their name.',
      'Looks at the toy and then at you on their own.',
    ],
  },
  tea2: {
    name: 'Induced pragmatic breakdown',
    category: 'Communicative repair (caregiver-mediated)',
    read: 'Hand your child something on purpose that is wrong or broken, and wait for them to tell you. The repair is the exercise.',
    stageLabel: 'Wait for the repair',
    instrHint: 'Keep a neutral face and wait. Do not fix it until they signal.',
    move: 'Fix it together the moment they let you know.',
    ept: [
      'Accepts the wrong thing without signalling.',
      'Signals when you ask "is that right?".',
      'Tells you on their own that something is wrong.',
    ],
  },
  tea3: {
    name: 'Asymmetrical mirror imitation',
    category: 'Echopraxia inhibition',
    read: 'Do an action and ask your child NOT to copy it, but to do the paired one instead: you clap, they stamp.',
    stageLabel: 'Do the other one',
    instrHint: 'Go slowly at first. Speeding up is what makes it hard.',
    move: 'Swap who leads every five turns.',
    ept: [
      'Copies you instead of doing the paired action.',
      'Does the paired action when you remind them.',
      'Does the paired action on their own, even when you speed up.',
    ],
  },
  tea4: {
    name: 'Interrupted routine transition',
    category: 'Cognitive flexibility (caregiver-mediated)',
    read: 'Start a routine your child knows well and stop it halfway on purpose. Wait for them to handle the change.',
    stageLabel: 'Handle the interruption',
    instrHint: 'Stay calm and quiet. The pause is the whole exercise.',
    move: 'Finish the routine together as soon as they accept the change.',
    ept: [
      'The interruption breaks the activity down.',
      'Accepts it with your help and a warning.',
      'Accepts the change and carries on.',
    ],
  },
  tea5: {
    name: 'Categorization under sensory load',
    category: 'Sorting with background babble noise',
    read: 'Same sorting task, but with background noise on. Your child touches the card that does not belong.',
    stageLabel: 'Sort with the noise on',
    intruder: [{ cap: 'shirt', emoji: '👕' }, { cap: 'hat', emoji: '🧢' }, { cap: 'sock', emoji: '🧦' }, { cap: 'apple', emoji: '🍎' }],
    intruderAnswer: 3,
    move: 'Turn the noise down together once they have chosen.',
    ept: [
      'Cannot sort with the noise on.',
      'Sorts when you turn the noise down.',
      'Sorts with the noise at full level.',
    ],
  },
  tea6: {
    name: 'Multiple simultaneous cues',
    category: 'PRT · stimulus overselectivity',
    read: 'The app gives a sound cue and a visual cue at the same time. Your child has to use both to choose.',
    stageLabel: 'Use both cues',
    choicePrompt: 'Touch the big red ball.',
    choiceLabel: 'Play it again', choiceVoice: 'tutor',
    options: [{ cap: 'big red ball', emoji: '🔴' }, { cap: 'small red ball', emoji: '🟥' }, { cap: 'big blue ball', emoji: '🔵' }],
    optionAnswer: 0,
    move: 'Find a real object that matches both parts of the instruction.',
    ept: [
      'Only uses one of the two cues.',
      'Uses both when you say them separately.',
      'Uses both cues together, first time.',
    ],
  },

  // =========================== DISLEXIA (rediseñado) =======================
  // El castellano es transparente y su bloque trabaja sílaba y velocidad. El
  // inglés es opaco: aquí se trabaja rima, dígrafo, silent e y pseudopalabra.
  dx1: {
    name: 'Phonological intruder',
    category: 'Phonological awareness (pure auditory)',
    read: 'Listen only — no writing on screen. The app says four words. Three rhyme and one does not. Your child says which one is the odd one out.',
    stageLabel: 'Listen and find the word that does not rhyme',
    auditoryOnly: true,
    intruder: [{ cap: 'cat', emoji: '🐱' }, { cap: 'hat', emoji: '🧢' }, { cap: 'bat', emoji: '🦇' }, { cap: 'dog', emoji: '🐶' }],
    intruderAnswer: 3,
    move: 'Jump once for every word that rhymes and freeze for the one that does not.',
    ept: [
      'Does not hear the rhyme yet.',
      'Finds the odd one out after a repeat.',
      'Finds it first time, by ear alone.',
    ],
  },
  dx2: {
    name: 'Lexical tracking under interference',
    category: 'Reading fluency under cognitive load',
    read: 'Two letters, one sound. Your child finds every word on the card that starts with the same two letters as the target.',
    stageLabel: 'Find the words that start with SH',
    phrase: 'SHIP', phraseEmoji: '🚢',
    move: 'Put a finger on your lips for every "sh" they find.',
    ept: [
      'Does not spot the digraph yet.',
      'Spots it when you say the sound first.',
      'Spots every one on their own.',
    ],
  },
  dx3: {
    name: 'Rhythmic phonemic blending',
    category: 'Phoneme blending with latency',
    read: 'The app says the sounds one at a time with a gap between them. Your child blends them into a word and says it.',
    stageLabel: 'Blend the sounds into a word',
    phonemes: ['sh', 'i', 'p'], phonemeGapMs: 500,
    phrase: 'SHIP', phraseEmoji: '🚢',
    move: 'Slide a hand along the table as the sounds join up.',
    ept: [
      'Does not blend the sounds yet.',
      'Blends them when you shorten the gap.',
      'Blends them at the full gap on their own.',
    ],
  },
  dx4: {
    name: 'Pseudoword decoding screening',
    category: 'Phonological decoding · max 5 trials',
    read: 'Reading made-up words is what shows whether the rules have stuck, because they cannot be recognised from memory. Your child reads what is on the card out loud.',
    stageLabel: 'Read the made-up word out loud',
    phrase: 'MIPE', phraseEmoji: '🔤',
    maxTrials: 5,
    move: 'Say it once short and once with the silent e stretched: mip / mipe.',
    ept: [
      'Does not read the made-up word yet.',
      'Reads it after you sound out the first part.',
      'Reads it on their own, and the silent e changes the vowel.',
    ],
  },
  dx5: {
    name: 'Visual tracking of letter rotations',
    category: 'Letter discrimination b/d · p/q',
    read: 'A grid of letters that mirror each other. Your child crosses out only the target letter and leaves its mirror alone.',
    stageLabel: 'Find every b and leave the d alone',
    rotationTargets: { target: 'b', grid: ['b', 'd', 'p', 'b', 'q', 'd', 'b', 'p', 'd', 'q', 'b', 'd'] },
    move: 'Make the letter shape with your fists before you start.',
    ept: [
      'Does not tell the mirrored letters apart yet.',
      'Tells them apart with the hand shape as a reminder.',
      'Tells them apart on their own, at speed.',
    ],
  },
  dx6: {
    name: 'Rapid Automatized Naming (RAN)',
    category: 'Lexical access · timed naming',
    read: 'Your child names every picture out loud, left to right, as fast as they can without making mistakes.',
    stageLabel: 'Name them all, left to right, quickly',
    tiles: [
      { cap: 'cat', emoji: '🐱' }, { cap: 'sun', emoji: '☀️' }, { cap: 'ball', emoji: '⚽' },
      { cap: 'shoe', emoji: '👟' }, { cap: 'fish', emoji: '🐟' }, { cap: 'cup', emoji: '🥛' },
    ],
    move: 'Tap the table once for every picture as they name it.',
    ept: [
      'Cannot keep the naming going yet.',
      'Names them all with pauses or help.',
      'Names them all quickly and without mistakes.',
    ],
  },
};

// Variantes de la ronda 2 en adelante (mismo objetivo, otro envoltorio).
export const VARIANTS_EN: Record<string, Partial<Exercise>[]> = {
  ff2: [
    { phrase: 'RABBIT', phraseEmoji: '🐰', move: 'Hop once for each syllable: RA-BBIT.' },
    { phrase: 'BUTTERFLY', phraseEmoji: '🦋', move: 'Flap your arms once per syllable: BU-TTER-FLY.' },
  ],
  se1: [
    {
      intruder: [{ cap: 'dog', emoji: '🐶' }, { cap: 'cat', emoji: '🐱' }, { cap: 'horse', emoji: '🐴' }, { cap: 'shoe', emoji: '👟' }],
      intruderAnswer: 3,
    },
  ],
  ms1: [
    { plural: { cap: 'dog', capPlural: 'dogs', emoji: '🐶', gender: 'm' } },
    { plural: { cap: 'shoe', capPlural: 'shoes', emoji: '👟', gender: 'm' } },
  ],
  dx1: [
    {
      intruder: [{ cap: 'top', emoji: '🌀' }, { cap: 'mop', emoji: '🧹' }, { cap: 'hop', emoji: '🐇' }, { cap: 'cup', emoji: '🥛' }],
      intruderAnswer: 3,
    },
  ],
  dx4: [
    { phrase: 'TANE', phraseEmoji: '🔤' },
    { phrase: 'FOPE', phraseEmoji: '🔤' },
  ],
};
