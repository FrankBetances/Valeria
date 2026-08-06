// ============================================================================
// Valeria+ · Pares Mínimos del INGLÉS AMERICANO (en-US) — plan en-US, EN-3.2
//
// Banco DISEÑADO, no traducido. Un par castellano traducido no contrasta nada
// (perro/cerro → dog/hill), así que el banco sale de la fonología del inglés
// americano y de las normas publicadas de adquisición consonántica
// (Crowe & McLeod 2020 y equivalentes: se citan como criterio, no se copian).
//
// Se mantiene el PRINCIPIO DETECTOR de toda la casa: el error de sustitución
// habitual del niño produce exactamente la otra palabra del par, de modo que un
// reconocedor de diccionario funciona como detector clínico.
//
// ── REGLA BLOQUEANTE ────────────────────────────────────────────────────────
// Cada par lleva su `dialect` (EN-0.5, docs/guia-dialectal-en-US.md). En el
// mercado estadounidense conviven el inglés afroamericano (AAE), el sureño y el
// inglés con influencia del español, y varios de sus rasgos REGULARES coinciden
// con los procesos que este banco detecta. Un banco que los puntúe como fallo
// convierte la app en un instrumento de discriminación lingüística.
//
// Por eso la guía PROHÍBE tres contrastes que el plan citaba como candidatos, y
// aquí no hay ni uno:
//   · /r/ postvocálica (car, bird) → AAE y sureño son no-róticos.
//   · grupos consonánticos FINALES (test→tes') → rasgo regular de AAE y SIE.
//   · sonoridad en posición FINAL (bad→bat) → ídem.
// Lo que sí entra marcado, porque quitarlo dejaría el banco clínicamente cojo:
// /θ/ (dialect-sensitive) y el contraste tenso/laxo (transfer). En esos dos la
// app avisa al adulto y él decide, que es el principio nº 2 del proyecto.
//
// Las transcripciones NO se escriben aquí a propósito: las pone CMUdict y las
// verifica scripts/check-minimal-pairs-en.js, que comprueba que cada par
// contrasta exactamente un fonema y que la etiqueta `phoneme` dice la verdad.
// La intuición del que escribe el banco no es fuente fiable — fue lo que dejó
// 25 de 35 pares premiando al distractor en la auditoría de §4.0 del plan ASR.
//
// ESTADO: 🟡 BORRADOR PARA REVISIÓN CLÍNICA (EN-3.2 no cerrado). Validado
// mecánicamente (CMUdict + asr:audit-pairs); pendiente de la firma de EN-0.3 y
// de los tres puntos abiertos de la §6 de la guía dialectal.
// ============================================================================
import { MinimalPair, PairGroup } from './valeriaMinimalPairs';

// Sin colisión dialectal conocida: proceso evolutivo universal.
const DEVELOPMENTAL = { verdict: 'developmental' as const };

export const MINIMAL_PAIRS_EN: MinimalPair[] = [
  // ────────────────────────────── Gliding de líquidas ──────────────────────
  // El proceso más característico del habla infantil angloamericana. Solo en
  // posición PREVOCÁLICA: la /r/ postvocálica está prohibida por §4.5.
  {
    id: 'rake-wake', code: 'EN-PM-1', group: 'Gliding',
    target: 'rake', targetEmoji: '🍂', foil: 'wake', foilEmoji: '⏰',
    phoneme: '/r/ → /w/', errorLabel: 'Gliding of /r/',
    prompt: 'Say: rake.',
    dialect: DEVELOPMENTAL,
    onTarget: {
      say: 'Rrrake! Your lips stayed wide open for that /r/!',
      mission: 'Rake the leaves! Three big sweeps across the floor, then high five.',
    },
    onFoil: {
      say: 'I heard wake, like waking up. I asked for rrrake. Listen…',
      cue: 'Pull your tongue back and up, and keep your lips from rounding: rrr.',
      mission: 'Mirror game: the grown-up says rrr with wide lips, the child copies watching the mirror.',
    },
  },
  {
    id: 'lock-rock', code: 'EN-PM-2', group: 'Gliding',
    target: 'rock', targetEmoji: '🪨', foil: 'lock', foilEmoji: '🔒',
    phoneme: '/r/ → /l/', errorLabel: 'Liquid substitution',
    prompt: 'Say: rock.',
    dialect: DEVELOPMENTAL,
    onTarget: {
      say: 'Rrrock! That was a strong /r/!',
      mission: 'Be a rock: freeze completely still while the grown-up counts to five.',
    },
    onFoil: {
      say: 'I heard lock, the one on the door. I asked for rrrock. Let’s try…',
      cue: 'For /l/ the tongue touches behind your teeth. For /r/ it pulls back and never touches.',
      mission: 'Take turns: grown-up says lock, child says rock, faster and faster.',
    },
  },

  // ──────────────────────────────── Fronting velar ─────────────────────────
  {
    id: 'key-tea', code: 'EN-PM-3', group: 'Fronting',
    target: 'key', targetEmoji: '🔑', foil: 'tea', foilEmoji: '🍵',
    phoneme: '/k/ → /t/', errorLabel: 'Velar fronting',
    prompt: 'Say: key.',
    dialect: DEVELOPMENTAL,
    onTarget: {
      say: 'Key! The back of your tongue did the work!',
      mission: 'Unlock the door: pretend to turn a key three times and open an imaginary door.',
    },
    onFoil: {
      say: 'I heard tea, the one you drink. I asked for key. Listen…',
      cue: 'Keep the tip of your tongue down and lift the BACK of it: k, k, k.',
      mission: 'Hold a finger on the tip of the tongue (gently, on the chin) so only the back lifts: k-k-k together.',
    },
  },

  // ─────────────────────────────── Sonorización inicial ────────────────────
  // En posición INICIAL a propósito: en final chocaría con el AAE (§4.4).
  {
    id: 'peach-beach', code: 'EN-PM-4', group: 'Voicing',
    target: 'peach', targetEmoji: '🍑', foil: 'beach', foilEmoji: '🏖️',
    phoneme: '/p/ → /b/', errorLabel: 'Prevocalic voicing',
    prompt: 'Say: peach.',
    dialect: DEVELOPMENTAL,
    onTarget: {
      say: 'Peach! Nice and quiet at the start!',
      mission: 'Pretend to bite a juicy peach and wipe your chin. Now the grown-up copies you.',
    },
    onFoil: {
      say: 'I heard beach, with the sand and the sea. I asked for peach. Let’s listen…',
      cue: 'Hand on your throat: /b/ buzzes, /p/ is a quiet puff of air.',
      mission: 'Puff test: hold a small piece of paper in front of your mouth — /p/ makes it move, /b/ does not.',
    },
  },

  // ──────────────────────────────── Sibilantes ─────────────────────────────
  {
    id: 'sip-ship', code: 'EN-PM-5', group: 'Sibilants',
    target: 'ship', targetEmoji: '🚢', foil: 'sip', foilEmoji: '🥤',
    phoneme: '/ʃ/ → /s/', errorLabel: 'Depalatalization',
    prompt: 'Say: ship.',
    dialect: DEVELOPMENTAL,
    onTarget: {
      say: 'Ship! That was a long, quiet shhh!',
      mission: 'Sail the ship: rock side to side like a boat while the grown-up makes wave sounds.',
    },
    onFoil: {
      say: 'I heard sip, like sipping a drink. I asked for ship. Listen…',
      cue: 'Round your lips and pull the tongue back: shhh, like asking for quiet.',
      mission: 'Quiet game: both of you go shhh with a finger on the lips for three seconds.',
    },
  },

  // ─────────────────────── Reducción de grupo INICIAL ──────────────────────
  // Solo inicial: la reducción de grupos FINALES está prohibida por §4.3.
  {
    id: 'snail-nail', code: 'EN-PM-6', group: 'Cluster reduction',
    target: 'snail', targetEmoji: '🐌', foil: 'nail', foilEmoji: '💅',
    phoneme: '/sn-/ → /n-/', errorLabel: 'Initial cluster reduction',
    prompt: 'Say: snail.',
    dialect: DEVELOPMENTAL,
    onTarget: {
      say: 'Snail! You kept both sounds together!',
      mission: 'Move like a snail: crawl very, very slowly to the grown-up.',
    },
    onFoil: {
      say: 'I heard nail, the one on your finger. I asked for snail — it starts with a long sss. Listen…',
      cue: 'Start with a long ssss and slide into the n: ssss-nail.',
      mission: 'Snake first: hiss ssss together for three seconds, then add the word.',
    },
  },

  // ─────────────────────── Consonante final (simple y sorda) ───────────────
  // Consonante simple y SORDA a propósito: no toca la devocalización final ni
  // los grupos finales, que son rasgos regulares del AAE (§4.4).
  {
    id: 'seat-sea', code: 'EN-PM-7', group: 'Final consonant',
    target: 'seat', targetEmoji: '💺', foil: 'sea', foilEmoji: '🌊',
    phoneme: '/-t/ → ∅', errorLabel: 'Final consonant deletion',
    prompt: 'Say: seat.',
    dialect: DEVELOPMENTAL,
    onTarget: {
      say: 'Seat! You put the /t/ right at the end!',
      mission: 'Musical chairs, mini version: walk around a chair and sit down when the grown-up claps.',
    },
    onFoil: {
      say: 'I heard sea, the water. I asked for seat — it needs a /t/ at the end. Listen…',
      cue: 'Finish the word with a little tap of the tongue: seat-t.',
      mission: 'Tap it out: the grown-up taps the table on the final /t/ and the child copies.',
    },
  },

  // ──────────────────────── Interdental · DIALECT-SENSITIVE ────────────────
  {
    id: 'thin-fin', code: 'EN-PM-8', group: 'Fronting',
    target: 'thin', targetEmoji: '📏', foil: 'fin', foilEmoji: '🐟',
    phoneme: '/θ/ → /f/', errorLabel: 'Interdental fronting',
    prompt: 'Say: thin.',
    dialect: {
      verdict: 'dialect-sensitive',
      regularIn: ['African American English (AAE)', 'Spanish-influenced English'],
      note:
        'Heads-up before you score this one: saying [f] for /th/ is a REGULAR feature of '
        + 'African American English, not a speech error — and Spanish has no /th/ either. If '
        + 'this is how your child’s family and community speak, count “fin” as CORRECT and '
        + 'move on. Only work on it when /th/ is inconsistent in your child’s own variety.',
    },
    onTarget: {
      say: 'Thin! Your tongue peeked out between your teeth!',
      mission: 'Thin and wide: make yourself as thin as you can, then as wide as you can.',
    },
    onFoil: {
      say: 'I heard fin, like a fish fin. I asked for thin. Listen…',
      cue: 'Put the tip of your tongue gently between your teeth and blow: thhh.',
      mission: 'Mirror check: both of you show your tongue between your teeth and blow softly.',
    },
  },

  // ───────────────────── Vocal tensa/laxa · TRANSFER (bilingüe) ────────────
  {
    id: 'sheep-ship', code: 'EN-PM-9', group: 'Vowels',
    target: 'sheep', targetEmoji: '🐑', foil: 'ship', foilEmoji: '🚢',
    phoneme: '/i/ → /ɪ/', errorLabel: 'Tense–lax vowel contrast',
    prompt: 'Say: sheep.',
    dialect: {
      verdict: 'transfer',
      regularIn: ['Spanish-influenced English'],
      note:
        'Heads-up before you score this one: Spanish has five vowels and English has about '
        + 'fourteen, so merging “sheep” and “ship” is second-language transfer, not a speech '
        + 'disorder. With a bilingual child, use this as a LISTENING game — hear the '
        + 'difference first — and don’t record it as an error.',
    },
    onTarget: {
      say: 'Sheep! You made that vowel nice and long!',
      mission: 'Count sheep: jump over an imaginary fence three times, baaing each jump.',
    },
    onFoil: {
      say: 'I heard ship, the one on the water. I asked for sheep — a longer eeee. Listen…',
      cue: 'Stretch it out and smile wide: sheeeep. The short one is quick: ship.',
      mission: 'Long and short: stretch your arms wide for sheep, bring them close for ship.',
    },
  },
];

// Grupos del banco inglés, en orden de presentación en la pantalla.
export const PAIR_GROUPS_EN: PairGroup[] = [
  'Gliding', 'Fronting', 'Voicing', 'Sibilants', 'Cluster reduction',
  'Final consonant', 'Vowels',
];
