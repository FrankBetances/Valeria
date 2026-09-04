// ============================================================================
// Valeria+ · UI string catalogue · US English (EN-2.1)
//
// Typed against the Spanish catalogue: a key added there and missing here
// fails `npm run typecheck`. That is deliberate — a missing string must break
// the build, never show up blank on a family's tablet.
//
// This is NOT a literal translation. US register decisions taken here, to be
// confirmed by the clinical reviewer (EN-0.3) and the native pass (EN-7.4):
//
//   · "caregiver", not "tutor" — in US English a tutor teaches school subjects.
//   · "child", not "kid", in anything a clinician reads.
//   · Sentence case on buttons, which is what US mobile apps use.
//   · HIPAA before GDPR in the trust line: US-first audience.
//
// Spoken content does NOT live here (see the header of strings.es.ts).
// ============================================================================
import { UiStrings } from './strings.es';

export const EN: UiStrings = {
  common: {
    continue: 'Continue',
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    accept: 'OK',
    loading: 'Loading…',
  },

  // [v11] Bottom tab bar labels. These are VISIBLE labels, not route names:
  // route names stay untranslated and unchanged, because the pilot telemetry
  // indexes screen time by route name (valeriaTelemetry.noteScreen).
  tabs: {
    therapies: 'Exercises',
    academy: 'Academy',
    settings: 'Settings',
    therapiesA11y: 'Exercises. Exercise blocks to practise or prescribe.',
    academyA11y: 'Academy. Training for the caregiving adult.',
    settingsA11y: 'Settings. Reminders, voice, language and professional access.',
  },

  welcome: {
    tagline: 'Understand their language, practise at home. Lúa joins you.',
    sub: 'First you learn, then you practise together at home. Valeria keeps track of the progress.',
    start: 'Get started',
    trust: 'Data encrypted on this device · HIPAA / GDPR',
  },
  luaIntro: {
    title: 'Meet Lúa',
    sub: 'The physical companion that cheers your child on through every practice session.',
    deviceAlt: 'Lúa, the Valeria cat, on her device screen',
    request: 'I want a Lúa',
    who: 'Who is practising today?',
    newPatient: 'New patient',
    newPatientSub: 'Start a record from scratch',
    existing: 'I already have a patient',
    existingSub: 'Open a record from the list',
  },

  credits: {
    kicker: 'A project by',
    authorRole: 'Pediatric ENT specialist',
    collaborators: 'In collaboration with',
    acoprosDesc: 'Association for the Support and Advancement of the Deaf',
    quisqueyaDesc: 'Language rehabilitation',
    recognition: 'Recognition',
    qualitySeal: 'Quality Seal',
    qualitySealDesc: 'ITEMAS · Instituto de Salud Carlos III · 2024',
    voiceCredit:
      'Neural voice in Spanish: "Sharvard" (Piper · rhasspy/piper-voices). '
      + 'In Galician: "Celtia" · Proxecto Nós. '
      + 'In Basque: HiTZ-TTS · ILENIA/NEL-GAITU (UPV/EHU · Aholab). '
      + 'In English: "LJSpeech" (Piper · rhasspy/piper-voices, MIT), built from '
      + 'public-domain LibriVox recordings.',
    arCredit:
      'Augmented Reality: face tracking with MediaPipe Tasks (Google, Apache 2.0) '
      + 'and 3D rendering with Filament (Google, Apache 2.0), both running entirely '
      + 'on the device. 3D models created for this project and released under CC0.',
  },

  patientSelect: {
    title: 'Select a patient',
    subtitle: (n: number): string =>
      n === 0 ? 'Pick up where you left off'
        : n === 1 ? '1 patient saved on this device'
          : `${n} patients saved on this device`,
    emptyTitle: 'No patients yet',
    emptyBody: 'Add your first patient to start assigning exercises.',
    newPatient: 'Add a new patient',
    patientFallback: 'Patient',
    noDiagnosis: 'No diagnosis on file',
    privacy: 'Patients are stored and encrypted on this device.',
  },

  // See the note in strings.es.ts: the stored value of gender / relationship /
  // pathology stays Spanish (it is an id other screens route on, and it is
  // already written into patient records on real devices). Only the visible
  // label is translated, by the three *Label functions at the end.
  ficha: {
    title: 'Patient record',
    subtitle: 'Background information',

    sectionChild: 'Child',
    sectionCaregiver: 'Parent / caregiver',
    sectionDiagnosis: 'Diagnosis and care team',

    fullName: 'Full name',
    fullNamePlaceholder: 'Child’s name',
    birthDate: 'Date of birth',
    birthDatePlaceholder: 'MM / DD / YYYY',
    recordNumber: 'Record #',
    recordNumberPlaceholder: 'MRN-…',
    gender: 'Gender',

    caregiverName: 'Full name',
    caregiverNamePlaceholder: 'Caregiver’s name',
    relationship: 'Relationship to child',
    relationshipPlaceholder: 'Select relationship…',
    email: 'Email',
    emailPlaceholder: 'caregiver@email.com',
    phone: 'Phone / WhatsApp',
    phoneHint: 'Used to send clinical reports.',
    phonePlaceholder: 'e.g. (555) 123-4567',

    pathology: 'Diagnosis',
    pathologyPlaceholder: 'Select a diagnosis…',
    prescriber: 'Referring physician (ENT / pediatrician)',
    prescriberPlaceholder: 'Dr. …',
    therapist: 'Assigned SLP',
    therapistPlaceholder: 'Speech-language pathologist',

    required: 'This field is required.',
    invalidEmail: 'Enter a valid email address.',
    recordNumberRequired: 'The record number is required.',
    saved: 'Record saved and encrypted on this device.',
    save: 'Save record',
    continueToAcademy: 'Start with the training →',
    footer: 'Encrypted local storage (AES-256) · HIPAA / GDPR compliant.',

    // The argument is the stored Spanish id; the return value is what the user
    // reads. Unknown ids fall through unchanged so an old record never renders
    // blank.
    genderLabel: (id: string): string =>
      id === 'Niña' ? 'Girl'
        : id === 'Niño' ? 'Boy'
          : id === 'Otro' ? 'Other'
            : id,
    relationshipLabel: (id: string): string =>
      id === 'Madre' ? 'Mother'
        : id === 'Padre' ? 'Father'
          : id === 'Tutor legal' ? 'Legal guardian'
            : id === 'Logopeda' ? 'Speech-language pathologist'
              : id,
    pathologyLabel: (id: string): string =>
      id === 'Hipoacusia con Implante Coclear' ? 'Hearing loss · cochlear implant'
        : id === 'Hipoacusia con Audífono' ? 'Hearing loss · hearing aid'
          : id === 'Hipoacusia sin Audífono' ? 'Hearing loss · unaided'
            : id === 'Trastorno Específico del Lenguaje' ? 'Developmental language disorder (DLD)'
              : id === 'Retraso Simple del Lenguaje' ? 'Late language emergence'
                : id === 'Trastorno del Espectro Autista (TEA)' ? 'Autism spectrum disorder (ASD)'
                  : id === 'Dislalia' ? 'Speech sound disorder'
                    : id === 'Otros' ? 'Other'
                      : id,
  },

  // Exercise names, categories and age bands are NOT here: they come from the
  // therapy content bank, which is localised by variety, not by UI language.
  hub: {
    title: 'Exercise Selection',
    subtitle: 'Pick a block to practice or to assign',
    streak: (n: number): string => `${n}-day streak`,
    level: (n: number, name: string): string => `Level ${n} · ${name}`,
    sectionTraining: 'YOUR TRAINING',
    sectionBlocks: 'EXERCISE BLOCKS',

    pairsTitle: 'Minimal Pairs',
    pairsSub: 'Speech sound errors: /r/, /s/ and more, with a voice game.',
    pairsBrief: 'Sound contrasts for speech errors.',
    pairsA11y: 'Practice minimal pairs for speech sound errors',
    semanticTitle: 'Semantic Expansion',
    semanticSub: 'Everyday routines, vocabulary growth and contrasts with hands-on action.',
    semanticBrief: 'Everyday vocabulary and phrases.',
    semanticA11y: 'Practice semantic expansion and vocabulary growth',
    hearingTitle: 'Listening',
    hearingSub: 'Based on the ACOPROS protocol: sounds, vocabulary, phrases and social use, organized by age.',
    hearingBrief: 'Detect, discriminate, recognise.',
    hearingA11y: 'Open listening exercises',
    languageTitle: 'Language',
    languageSub: 'Family protocol: joint attention, imitation, comprehension and more.',
    languageBrief: 'Joint attention and comprehension.',
    languageA11y: 'Open language exercises',
    autismTitle: 'Autism',
    autismSub: 'PRT + CBT: triangulated joint attention, communication repair and flexibility. Stressors are always caregiver-triggered.',
    autismBrief: 'Pragmatics and social flexibility.',
    autismA11y: 'Open the autism module',
    dyslexiaTitle: 'Dyslexia',
    dyslexiaSub: 'Phonological awareness, phoneme blending, nonwords and reversed-letter tracking (b/d, p/q).',
    dyslexiaBrief: 'Phonological awareness and reading.',
    dyslexiaA11y: 'Open the dyslexia module',
    arTitle: 'Augmented Reality',
    arSub: 'The camera watches the movement and the car, the dog or the apple reacts to it. Nothing is recorded and the mic stays off.',
    arBrief: 'Gesture and gaze with the camera.',
    arA11y: (n: number): string => `Open the augmented reality block, ${n} exercises`,
    sensoryTitle: 'Sensory Integration',
    sensorySub: 'Gradual desensitization, modulation and visual anticipation for everyday environmental sounds.',
    sensoryBrief: 'Sound anticipation and tolerance.',
    sensoryA11y: (n: number): string => `Open auditory sensory integration exercises, ${n} activities`,
    sensoryBadge: (n: number): string => `${n} activities`,

    writingTitle: 'Handwriting',
    writingSub: 'Guided tracing with Montessori lines and stroke-order control to prevent b / d reversals.',
    writingBrief: 'Guided tracing and critical letters.',
    writingA11y: (n: number): string => `Open Lúa’s magic chalkboard, ${n} guided strokes`,
    writingBadge: (n: number): string => `${n} strokes`,

    luaTitle: 'Adventures with Lúa',
    luaSub: 'Interactive language question bank, stories, songs and printables by age (0 to 10 years).',
    luaBrief: 'Language, stories and songs.',
    luaA11y: (n: number): string => `Open Adventures with Lúa, ${n} interactive activities`,
    luaBadge: (n: number): string => `${n} act.`,

    statStreakUnit: (n: number): string => (n === 1 ? 'day streak' : 'day streak'),
    pairsBadge: (n: number): string => `${n} pairs`,
    semanticBadge: (n: number): string => `${n} scenarios`,
    therapiesBadge: (n: number): string => `${n} exercises`,
    activeBadge: (n: number): string => `${n} active`,

    remindersTitle: 'Session reminders',
    remindersOff: 'Lock-screen reminders so you don’t lose your streak. You choose the times, from one to four.',
    remindersPickHint: 'Pick the times you want below.',
    remindersNone: 'No reminders: nothing will be sent.',
    remindersSummary: (n: number, hours: string): string =>
      n === 1
        ? `1 reminder a day (${hours}) on the lock screen.`
        : `${n} reminders a day (${hours}) on the lock screen.`,
    remindersOn: (summary: string): string => `Reminders on: ${summary} 🔔`,
    remindersDisabled: 'Reminders turned off.',
    remindersNoPermission: 'Couldn’t turn these on: allow notifications in your system settings.',
    remindersNoSchedule: 'Couldn’t schedule these: allow notifications in your system settings.',
    remindersNoSlots: 'No times selected: reminders are off.',
    slotLabel: (id: string, hour: number): string => {
      const h12 = hour % 12 === 0 ? 12 : hour % 12;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const name = id === 'manana' ? 'Morning' : id === 'mediodia' ? 'Midday' : id === 'tarde' ? 'Afternoon' : 'Evening';
      return `${name} · ${h12}:00 ${ampm}`;
    },
    slotHint: (id: string): string =>
      id === 'manana' ? 'An invitation to today’s session.'
        : id === 'mediodia' ? 'A short nudge in the middle of the day.'
          : id === 'tarde' ? 'Last call so you don’t lose the streak.'
            : 'A tip for the grown-up, not a prompt to play.',

    proAccessTitle: 'Professional access',
    proAccessSub: 'Export usability evidence from the pilot (clinician PIN).',
    proAccessA11y: 'Professional access: export usability evidence',
    proPinSubtitle: 'Enter the clinician PIN to export usability evidence from the pilot.',
    proUnlocked: 'Professional mode unlocked.',

    backToBlocks: 'Blocks',
    tabHearing: '👂 Listening',
    tabLanguage: '💬 Language',
    tabAutism: '🧠 Autism',
    tabDyslexia: '📖 Dyslexia',
    protocolHearing: 'ACOPROS PROTOCOL · LISTENING',
    protocolLanguage: 'FAMILY PROTOCOL · LANGUAGE',
    protocolAutism: 'AUTISM PROTOCOL · PRT + CBT',
    protocolDyslexia: 'DYSLEXIA PROTOCOL · PHONOLOGY AND LEXICAL ACCESS',

    editingOn: 'Professional editing enabled',
    editingOff: 'Family mode · read only',
    blockChip: (total: number, prescribed: number): string => `${total} exercises · ${prescribed} assigned`,
    fullSession: 'Full session',
    fullSessionSub: (n: number): string => `All ${n} assigned exercises back to back, with movement breaks`,
    fullSessionA11y: (n: number): string => `Practice all ${n} assigned exercises back to back`,
    prescribedCount: (n: number): string => `${n} assigned`,
    practiceA11y: (name: string): string => `Practice ${name}`,
    otherAges: 'Other',

    refHearing:
      'Activities based on the auditory rehabilitation materials of ACOPROS '
      + '(Asociación Coruñesa de Promoción del Sordo), organized into 4 areas: sounds, '
      + 'vocabulary, phrases and social use. The ages are a guide: start with your child’s '
      + 'age band and let your SLP adjust the plan.',
    refAutism:
      'PRT + CBT battery: the app orchestrates the contingencies, but the load (pragmatic '
      + 'breakdown, noise, distractor cat) is ALWAYS triggered by the grown-up from the '
      + 'Caregiver Panel, and is reversible instantly. The app never interrupts or adjusts '
      + 'anything on its own, and the clinical judgment is always yours and your SLP’s.',
    refDyslexia:
      'Phonological awareness and lexical access battery. Voice scoring respects the speech '
      + 'of each variety (in Dominican Spanish, seseo and aspirated /s/ NEVER count as errors) '
      + 'and the Nonword Screen stops after 5 trials with a rest break.',

    protocolCardOpen: 'View the protocol note',
    protocolCardClose: 'Hide the note',
    notPrescribed: 'Not prescribed',
    prescribedOf: (active: number, total: number): string => `${active} of ${total} prescribed`,
    savePrescription: 'Save plan',
    savedPrescription: (n: number): string => `Plan saved · ${n} exercises active.`,
    saveHelper: 'Your selection is saved on this device and editing locks again.',
    lockedHint: 'Family mode · only the clinician can change the plan.',

    teaConsentTitle: 'Before you start the autism module',
    teaConsentBreak: 'Pragmatic Breakdown',
    teaConsentBody1: 'This module includes the ',
    teaConsentBody2:
      ': an exercise where YOU freeze the app on purpose (an absurd instruction or silence) '
      + 'to watch how your child repairs the communication. It can cause brief, controlled '
      + 'frustration — that is the clinical goal, and it should be set by your SLP.',
    teaConsentItem1: '✋ You always trigger the stressor yourself, from the Caregiver Panel.',
    teaConsentItem2: '↩️ It reverses instantly: one tap and the app goes back to normal.',
    teaConsentItem3: '🚫 The app never interrupts, raises difficulty or diagnoses on its own.',
    teaConsentItem4: '🛑 If your child gets overwhelmed, stop: there is no quota to meet.',
    teaConsentAccept: 'I understand and accept',
    teaConsentAcceptA11y: 'Accept the framing and enter the autism module',
    teaConsentLater: 'Not now',

    levelNameByIndex: (i: number): string =>
      ['Kitten', 'Curious Cat', 'Playful Cat', 'Brave Cat',
        'Explorer Cat', 'Leaping Cat', 'Wise Cat', 'Silent Cat',
        'Star Cat', 'Great Cat', 'Moon Cat', 'Legendary Cat'][i]
      ?? 'Legendary Cat',

    luaPurring: 'Purring!',
    luaEating: 'Yummy!',
    luaCraving: 'Feeling peckish',
    luaPatShort: 'Pet me',
    luaFeedFish: 'Give the fish',
    luaFeedFishA11y: 'Give Lúa the fish',
    luaPatA11y: 'Pet Lúa the cat',
    luaPatHintA11y: 'Tap to pet her and see her purr',
  },

  awards: {
    open: 'Awards',
    title: 'Lúa’s awards',
    subtitle: 'What you have earned, and what is still ahead.',
    close: 'Close',
    levelLine: (n: number, name: string): string => `Level ${n} · ${name}`,
    xpToNext: (n: number): string => `${n} XP to the next level`,
    xpTotal: (n: number): string => `${n} XP in total`,
    maxLevel: 'Top level reached!',
    streakLine: (n: number): string => (n === 1 ? '1 day streak' : `${n} day streak`),
    streakNone: 'Start your streak today',
    collection: (won: number, total: number): string => `Badges · ${won} of ${total}`,
    levelTrack: 'Level ladder',
    lockedHint: 'Badges shown in grey have not been earned yet.',
    a11yOpen: 'Open Lúa’s award collection',
    badgeA11y: (name: string, won: boolean): string =>
      `${name}. ${won ? 'Earned' : 'Not earned yet'}.`,

    wardrobeTitle: 'Lúa’s wardrobe and awards',
    itemSlotHead: 'Head',
    itemSlotNeck: 'Neck',
    itemSlotSnack: 'Reward',
    itemEquipped: 'Equipped on Lúa',
    itemEquipAction: 'Tap to equip',
    itemSnackAvailable: 'Available to reward',
    itemA11y: (name: string, unlocked: boolean, equipped: boolean): string =>
      `${name}. ${unlocked ? (equipped ? 'Equipped on Lúa' : 'Tap to equip') : 'Locked'}.`,

    itemName: (id: string): string => ({
      snack_fish: 'Tasty Little Fish',
      neck_red_bow: 'Scarlet Bow Tie',
      head_flower: 'Valeria Turquoise Flower',
      neck_bell: 'Shining Bell',
      head_wizard: 'Starry Wizard Hat',
    }[id] ?? id),


    itemUnlockCondition: (id: string): string => ({
      snack_fish: 'Available from the start',
      neck_red_bow: 'Complete 3 exercise sessions',
      head_flower: 'Reach a 3-day streak',
      neck_bell: 'Complete 10 exercise sessions',
      head_wizard: 'Reach Lúa Level 5',
    }[id] ?? ''),

    badgeName: (id: string): string => ({
      primera: "Lúa's first step",
      ses10: 'Companion walk',
      ses25: 'Great explorer',
      ses50: 'Trail guide',
      ses100: 'Centennial bond',
      racha3: 'Ringing bell',
      racha7: 'Singing week',
      racha14: 'Steady melody',
      racha30: 'Golden chime',
      perfecta: 'Lynx ears',
      perf5: 'Magic radar',
      perf10: 'Crystal antenna',
      madrugadora: 'Morning chime',
      nocturna: 'Moonlit story',
      finde: 'Weekend backpack',
      maraton: 'Yarn of tales',
      regreso: 'Welcome hug',
      nivel10: 'Language queen',
    }[id] ?? id),

    // Same budget as the Spanish catalogue: this line is the unlock RULE and it
    // has to fit three 10 px lines (numberOfLines={3}), ~55 characters.
    badgeDesc: (id: string): string => ({
      primera: 'Complete your first session with Lúa.',
      ses10: '10 sessions walking together.',
      ses25: '25 sessions discovering words.',
      ses50: '50 sessions: Lúa knows the trail.',
      ses100: '100 sessions. A bond for life.',
      racha3: '3 days in a row practising.',
      racha7: '7 days in a row practising.',
      racha14: '14 days in a row practising.',
      racha30: '30 days in a row practising.',
      perfecta: 'Get 3★ in every exercise of a session.',
      perf5: 'Get 5 perfect sessions.',
      perf10: 'Get 10 perfect sessions.',
      madrugadora: 'Practise before 10 in the morning.',
      nocturna: 'Practise after 8 in the evening.',
      finde: 'Practise on a Saturday or a Sunday.',
      maraton: 'Six or more exercises in one session.',
      regreso: 'Come back after a week off.',
      nivel10: 'Reach level 10 and her crown.',
    }[id] ?? ''),
  },

  auth: {
    title: 'Professional access',
    subtitleSignup: 'Create an account to store your patients and sessions in the cloud.',
    subtitleSignin: 'Sign in to reach your patients and sessions.',
    name: 'Name',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'you@email.com',
    firebaseUnconfigured: '⚠︎ Firebase is not configured yet (the project keys are missing). See docs/firebase-setup.md.',
    email: 'Email',
    password: 'Password',
    passwordPlaceholder: 'At least 6 characters',
    signup: 'Create account',
    signin: 'Sign in',
    forgot: 'Forgot your password?',
    haveAccount: 'Already have an account?',
    noAccount: 'Don’t have an account yet?',
    goSignin: 'Sign in',
    goSignup: 'Create one',
    missingFields: 'Enter your email and password.',
    missingEmailForReset: 'Enter your email so we can send you a reset link.',
    resetSent: 'We’ve sent you an email to reset your password.',
    error: (code: string): string =>
      code === 'invalidEmail' ? 'That email address isn’t valid.'
        : code === 'missingPassword' ? 'Enter your password.'
          : code === 'weakPassword' ? 'Your password must be at least 6 characters.'
            : code === 'emailInUse' ? 'An account with that email already exists.'
              : code === 'badCredentials' ? 'Incorrect email or password.'
                : code === 'tooManyRequests' ? 'Too many attempts. Try again in a few minutes.'
                  : code === 'network' ? 'No connection. Check your network and try again.'
                    : code === 'notAllowed' ? 'Email and password sign-in is not enabled for this project.'
                      : 'We couldn’t complete that. Please try again.',
  },

  // The six Ling sounds and their prompts are NOT here: they come from
  // `lingContentForLocale`, localised by therapy variety. What lives here is
  // what the grown-up reads: the screening question, the rating scale and the
  // verdict.
  ling: {
    title: 'Ling Sound Check',
    titleDone: 'Check complete',
    subAsk: (name: string): string => `${name} · Hearing check`,
    subTest: (name: string): string => `${name} · Ling 6 sounds`,
    subDone: (name: string): string => `${name} · Today’s result`,

    askTitle: 'Before you start',
    askQuestion1: 'Does this child wear ',
    askQuestionHearingAids: 'hearing aids',
    askQuestionOr: ' or a ',
    askQuestionImplant: 'cochlear implant',
    askQuestion2: '?',
    askSub: 'If they do, it’s worth checking that they’re hearing well today with the Ling Sound Check.',
    yesTitle: 'Yes, hearing aids / implant',
    yesSub: 'Run the Ling Sound Check (6 sounds)',
    noTitle: 'No',
    noSub: 'Go straight to the exercises',

    instrKicker: 'YOUR TURN, GROWN-UP',
    instrTitle: 'Cover your mouth and make the sound',
    stageLabel: 'MAKE THIS SOUND',
    scaleTitle: 'How did they respond?',
    scaleSub: 'Score how the child responded to this sound',
    scaleIdentifies: 'Identifies',
    scaleIdentifiesDesc: 'Repeats or recognizes the sound correctly.',
    scaleDetects: 'Detects',
    scaleDetectsDesc: 'Reacts or raises a hand on hearing it.',
    scaleNoResponse: 'No response',
    scaleNoResponseDesc: 'Does not react to the sound.',
    legendNoResponseShort: 'None',

    resultGoodTitle: 'Hearing clearly!',
    resultGoodSub: 'Identified all 6 sounds. The hearing equipment is working well today.',
    resultGoodRec: 'All good. You can go on with the listening exercises as usual.',
    resultCheckTitle: 'Check the equipment',
    resultCheckSub: 'Did not react to one of the sounds. Check batteries, earmold and volume before going on.',
    resultCheckRec: 'Check the hearing aid / implant (batteries, connection, program) and repeat the check. If it persists, contact the ENT.',
    resultDetectTitle: 'Detects every sound',
    resultDetectSub: (ident: number, total: number): string =>
      `Detected all ${total}, and identified ${ident} of ${total}. You can go on with the session.`,
    resultDetectRec: 'Give extra support on the high-frequency sounds (sh, s). You can go on with the exercises.',

    startExercises: 'Start exercises →',
    repeat: 'Repeat check',
    months: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec',
  },

  // NOT here: the words of the pair, the prompt, the cue, the physical missions
  // and the error label — those come from the active VARIETY's bank
  // (valeriaMinimalPairs*). What lives here is the scaffolding the grown-up reads.
  pairs: {
    sealA11y: (who: string): string =>
      `${who}'s handprint. Press both handprints at once to continue, or hold this one for two seconds.`,
    pinSubtitle: "Enter the speech-language pathologist's 4-digit PIN to choose which pairs the family practices.",
    sessionName: (a: string, b: string): string => `Minimal pairs · ${a} / ${b}`,
    noteClean: (phoneme: string): string =>
      `No substitutions detected on the ${phoneme} contrast. The sound is settling in!`,
    noteSubs: (subs: number, total: number, corr: number, err: string): string =>
      `Substitution detected in ${subs} of ${total} trials; ${corr} self-corrected (${err}).`,
    doneClean: (phoneme: string): string =>
      `No substitutions detected on the ${phoneme} contrast. The sound is settling in!`,
    doneSubs: (subs: number, total: number): string =>
      `The microphone picked up the substitution in ${subs} of ${total} trials. That is normal: every correction is practice on the contrast.`,
    dialectSensitive: 'BEFORE YOU SCORE THIS PAIR',
    dialectTransfer: 'BEFORE YOU SCORE: BILINGUAL CHILD',
    dialectRegularIn: (v: string): string => `Regular feature in: ${v}.`,
    title: 'Minimal Pairs',
    subtitlePick: 'Speech sound errors · the child asks for the word with their own voice',
    editingOn: 'Professional editing enabled',

    howKicker: 'HOW IT WORKS',
    howBody:
      'Two nearly identical words appear (rake / wake). The app says one out loud, the child '
      + 'says it into the mic, and the app detects whether the target sound came out or the '
      + 'usual substitution did. Every trial ends with a physical mission for the two of you '
      + 'and the double seal: without both pairs of hands on the screen, nothing moves on!',
    autoRecord: 'Start recording automatically after the prompt',
    autoRecordSub: 'Off by default: the mic waits until you tap “I’m ready”.',
    bankLabel: 'CONTRAST BANK',
    prescribedCount: (n: number): string => `${n} assigned`,
    toggleA11y: (on: boolean, a: string, b: string): string => `${on ? 'Turn off' : 'Turn on'} the pair ${a} and ${b}`,
    practiceA11y: (a: string, b: string): string => `Practice the pair ${a} and ${b}`,
    notPrescribedA11y: (a: string, b: string): string => `Pair ${a} and ${b} not assigned`,
    savePrescription: 'Save plan',
    saveHelper: 'Your selection is saved on this device and editing locks again.',
    lockedHint: 'Family mode · only the clinician can change which pairs are practiced.',

    appSpeaksSlow: 'THE APP MODELS IT SLOWLY',
    appSpeaks: 'THE APP SAYS',
    stepSay: 'The app is speaking… get your voices ready.',
    stepReady: 'Get ready. When your child is set, tap the microphone.',
    readyBtn: 'I’m ready',
    readyBtnA11y: 'I’m ready. Start listening.',
    repeatPrompt: 'Say it again',
    stepListen: 'Your turn! Say the word into the microphone…',
    stopListening: 'Stop · the grown-up decides',
    stepJudge: 'You’re the judge: what did your child say?',
    saidWord: (w: string): string => `Said “${w}”`,
    notUnderstood: 'Couldn’t tell · say the prompt again',
    micNoteKicker: '👤 FOR THE GROWN-UP · THE MICROPHONE',

    successTitle: 'You got the sound!',
    heardBy: (w: string): string => `The app heard: “${w}”`,
    adultVerdict: 'Scored by the grown-up.',
    missionCelebration: 'CELEBRATION MISSION',
    missionCorrective: 'CORRECTIVE MISSION',
    sealSuccess: 'Mission done: seal it together for the next trial!',

    heardFoil: (w: string): string => `I heard “${w}”… that was the other word!`,
    almostTitle: 'So close!',
    notHeardTitle: 'I didn’t catch that',
    cuePrefix: (cue: string): string => `Hint: ${cue}`,
    almostSub: 'Very close. Listen to the slow model and try once more.',
    notHeardSub: 'This try doesn’t count. Move closer to the mic and let’s go again.',
    hearSlowModel: 'Hear it slowly',
    retryBtn: '🎤 One more time!',

    assistTitle: 'Say it together (1★)',
    assistSub: (w: string): string =>
      `The grown-up says “${w}” very slowly while touching the child’s cheek, and the child `
      + 'says it at the same time. No rush: we practice today, tomorrow it comes on its own.',
    sealAssist: 'Did you say it together? Seal it and off we go!',

    overrideLabel: 'Did the app mishear? Fix it here:',
    overridePill: (w: string): string => `said “${w}”`,

    doneTitle: 'Pair complete!',
    doneSessionTitle: 'Minimal pairs session complete!',
    seeResults: 'See results →',
    repeatPair: 'Repeat this pair',
    otherPair: 'Pick another pair',

    swapKicker: '👑 NOW YOU’RE IN CHARGE!',
    swapTitle: 'The child is the judge',
    swapListening: '👂 Listening to the grown-up…',
    swapWhich: 'Which one did the grown-up say? Tap it!',
    swapHit: '✅ Got it!',
    swapMiss: '❌ It was the other one',
    swapContinue: 'Back to the session →',
    swapSkip: 'Skip this time',
    swapIntro: 'The grown-up SECRETLY picks one of the two words and says it out loud, without pointing.',
    swapIntroAsr: ' The app will listen too, to check.',
    swapSpeakNow: '🎤 Now, say it out loud!',
    swapAlreadySaid: '🗣️ Already said it → keep going',
    subtitlePlay: 'Speech sound errors · the child asks for the word with their own voice',
    regionNote: ' · only varieties that distinguish s/z',
    streakChip: (n: number): string => (n === 1 ? 'day streak' : 'day streak'),

    sealKicker: '🤝 DOUBLE SEAL TO CONTINUE',
    sealWhy:
      'It keeps the exercise from running on its own: until both of you put a hand down, the '
      + 'app waits. That way you close each try together and the grown-up isn’t left watching '
      + 'from the outside.',
    sealAdult: 'GROWN-UP',
    sealChild: 'ME',
    sealPlus: 'together',
    sealHint: 'Whoever is with the child. Only one hand free? Press and hold one print for 2 seconds.',
  },

  // Scenarios, categories, words, spoken prompts and physical actions come from
  // the active VARIETY's bank. What lives here is what the grown-up reads —
  // including four labels (section goal, difficulty level, progression phase
  // and word type) that used to live in `valeriaSemanticExpansion.ts`: they are
  // interface text, not content, so they follow the UI language, not the variety.
  semantic: {
    togglePrescribedA11y: (name: string, on: boolean): string => `${on ? 'Turn off' : 'Turn on'} ${name}`,
    pickRowA11y: (name: string, on: boolean): string => (on ? `Practice ${name}` : `${name} not prescribed`),
    wordsOf: (available: number, total: number): string => `${available} of ${total} words`,
    backPillContinue: 'Continue',
    backPillBack: 'Back',
    noMaterialHint: 'This activity needs no materials: your hands and a quiet spot are enough.',
    doneSessionSub: (n: number): string =>
      `${n} words practiced by pairing picture, voice and physical action. A word is learned when the child lives it with their body, not just when they hear it.`,
    assistSub: (word: string): string =>
      `The grown-up says “${word}” very slowly while looking at the child, and they say it together. No rush: today we practice it, tomorrow it comes out on its own.`,
    title: 'Semantic Expansion',
    setupTitle: 'Getting ready',
    doneTitle: 'All done!',

    howKicker: 'HOW IT WORKS',
    howBody:
      'Tap ▶ and the app shows a picture and puts the word in a short sentence before asking '
      + 'for it (“This is the bed. Say: bed.”). Your child repeats it in their own voice and the '
      + 'microphone scores the attempt, accepting the approximations that are normal for their '
      + 'age. Every word ends with a physical action led by the grown-up that anchors it to the '
      + 'body and to the real world.',
    autoRecord: 'Play audio and record automatically',
    autoRecordSub: 'Off by default: tap to hear the model and to record.',

    levelKicker: '📶 MAXIMUM DIFFICULTY LEVEL',
    levelHint: 'With the cap at 1, the session only presents the most familiar words in each category.',
    difficultyLabel: (n: number): string =>
      n === 1 ? 'Level 1 · most familiar'
        : n === 2 ? 'Level 2 · familiar'
          : 'Level 3 · less frequent',

    sectionScenarios: 'EVERYDAY ROUTINES',
    sectionCategories: 'VOCABULARY CATEGORIES',
    sectionSequences: 'VOCABULARY PROGRESSION',
    sectionCapsules: 'CONTRAST CAPSULES',
    prescribedCount: (n: number): string => `${n} assigned`,
    goalKicker: 'WHAT THIS WORKS ON',
    sectionGoal: (section: string): string =>
      section === 'scenario' ? 'Verbal repetition: the child imitates the target word in everyday situations.'
        : section === 'category' ? 'New vocabulary by field: start with the most familiar words and move to less frequent ones.'
          : section === 'sequence' ? 'Vocabulary around one concept: what it is, what it has, what it does and what it’s like.'
            : 'Opposites: first pick the right picture, then say the word.',
    phaseLabel: (kind: string): string =>
      kind === 'concepto' ? 'Step 1 · What it is'
        : kind === 'parte' ? 'Step 2 · What it has'
          : kind === 'accion' ? 'Step 3 · What it does'
            : 'Step 4 · What it’s like',
    wordTypeLabel: (kind: string): string =>
      kind === 'sustantivo' ? 'Noun'
        : kind === 'verbo' ? 'Verb'
          : kind === 'adjetivo' ? 'Adjective'
            : 'Sound word',
    wordCount: (n: number): string => `${n} words`,

    savePrescription: 'Save plan',
    saveHelper: 'Your selection is saved on this device and editing locks again.',
    lockedHint: 'Family mode · only the clinician can change which activities are practiced.',
    pinSubtitle: 'Enter the clinician’s 4-digit PIN to choose which activities the family practices.',

    setupKicker: '🧰 WHAT YOU’LL NEED',
    stepsKicker: (n: number): string => `🤝 WHAT YOU’LL DO · ${n} ${n === 1 ? 'STEP' : 'STEPS'}`,
    reviewSetup: 'See setup',
    reviewSetupA11y: 'See the materials and the routine again',

    appSpeaksSlow: 'THE APP MODELS IT SLOWLY',
    appSpeaks: 'THE APP SAYS',
    listen: 'Listen',
    listenA11y: 'Hear the model for this step',
    stepSay: 'The app is speaking… get your voices ready.',
    stepReady: 'Get ready. When your child is set, tap the microphone.',
    readyBtn: 'I’m ready',
    readyBtnA11y: 'I’m ready. Start listening.',
    tapImage: 'Tap the right picture!',
    repeatQuestion: 'Ask again',
    stepListen: 'Your turn! Say the word into the microphone…',
    saidIt: 'Said it',
    saidItA11y: 'Said it correctly, count it',
    almost: 'Almost / again',
    almostA11y: 'Almost, try again',
    stopWithoutDeciding: 'Stop without scoring',
    stepJudge: 'You’re the judge: did they try to say it?',
    notUnderstood: 'Couldn’t tell · say the prompt again',

    successTitle: 'You got the word!',
    heardBy: (w: string): string => `The app heard: “${w}”`,
    adultVerdict: 'Scored by the grown-up.',
    finish: '✅ Finish!',
    nextStep: '✅ Done! Next →',
    notHeardTitle: 'I didn’t catch that',
    almostTitle: 'So close!',
    hearSlowModel: 'Hear it slowly',
    retryBtn: '🎤 One more time!',
    assistTitle: 'Say it together (1★)',
    finishShort: 'Finish!',
    saidTogether: 'We said it → keep going',

    doneSessionTitle: 'Session complete!',
    streakChip: (n: number): string => (n === 1 ? 'day streak' : 'day streak'),
    seeResults: 'See results →',
    repeatBlock: 'Repeat this block',
    otherBlock: 'Pick another block',
    subtitlePick: 'Vocabulary progression · from the symbol to the child’s real world',
    editingOn: 'Professional editing enabled',
    tabScenarios: 'Routines',
    tabCategories: 'Categories',
    tabSequences: 'Progression',
    tabContrasts: 'Contrasts',
    kindScenario: 'Routine',
    kindSequence: 'Progression',
    kindContrast: 'Contrast',
    stepPoints: ' · the child points',
    setupBack: 'Back to the session',
    setupReady: 'I have everything',
    setupReadyA11y: 'I have everything, start',
    notHeardSub: 'The microphone didn’t pick anything up, so this try doesn’t count. Move a little closer and try again.',
    almostSub: 'Listen to the slow model and try again.',
    actionKickerAdult: 'PHYSICAL MISSION FOR THE GROWN-UP',
    actionKickerTpr: 'TPR INSTRUCTION FOR THE GROWN-UP',
    actionKickerPair: 'PHYSICAL ACTION TOGETHER',
    actionKickerSecond: 'PHYSICAL ACTION · SECOND ROUND',
    capsuleKickerAdj: 'ADJECTIVE CONTRAST',
    capsuleKickerVerb: 'OPPOSITE VERBS',
    capsuleRound1: 'ROUND 1 · UNDERSTAND',
    capsuleRound2: 'ROUND 2 · SAY IT',
    capsuleVisualPrompt: (a: string, b: string): string => `Contrasting pair: ${a} / ${b}.`,
    capsuleKindAdj: 'Adjective pair',
    capsuleKindVerb: 'Opposite verbs',
    capsuleMeta: 'TPR capsule · 2 rounds',
    rowScenarioA11y: (title: string): string => `routine ${title}`,
    rowCategoryA11y: (title: string): string => `category ${title}`,
    rowSequenceA11y: (theme: string): string => `progression ${theme}`,
    rowCapsuleA11y: (a: string, b: string): string => `contrast capsule ${a} and ${b}`,

    histNoteContrast: (kind: string, comp: string, nComp: number, prod: string, nProd: number): string =>
      `${kind}: comprehension ${comp}/3 over ${nComp} ${nComp === 1 ? 'round' : 'rounds'} · production ${prod}/3 over ${nProd}.`,
    histNoteWords: (kind: string, n: number): string =>
      `${kind}: ${n} words practised linking symbol, voice and physical action.`,
  },

  // Exercise name, code, prompt (`read`), phrase, materials, alternative
  // proposals, the per-exercise EPT wording (`ex.ept`) and all round content
  // come from the active VARIETY's bank. What lives here is the scaffolding:
  // steps, the judge buttons, the scale explanation and the wrap-up.
  player: {
    zoomTileA11y: (cap?: string): string => `Enlarge the picture of ${cap ?? 'the card'}`,
    answerTileA11y: (cap: string): string => `Answer ${cap}. Press and hold to enlarge the picture`,
    roundOf: (cur: number, total: number): string => `Round ${cur} of ${total}`,
    trialLimit: (max: number): string =>
      `${max}-trial limit reached: wind down with the movement break and score below (or switch rounds).`,
    matchedTileA11y: (cap: string): string => `${cap}: already matched to its vowel`,
    pickTileA11y: (cap: string): string => `Choose the picture of ${cap}`,
    tileChosen: 'chosen',
    vowelA11y: (v: string): string => `Vowel ${v}`,
    fillMicPrompt: (word: string): string =>
      `Once they complete the word, tap the mic and have them say: “${word}”`,
    seriesWordRevealedA11y: (n: number, cap: string): string => `Word ${n} in the series: ${cap}`,
    seriesWordA11y: (n: number): string => `Answer word ${n} in the series`,
    seriesWordMasked: (n: number): string => `word ${n}`,
    hearPhonemes: (phonemes: string): string => `Hear the sounds · ${phonemes}`,
    synthesisMicPrompt: (word: string): string =>
      `Tap the mic and have them BLEND the sounds into the whole word: “${word}”`,
    synthesisSolved: (word: string): string =>
      `The word was “${word}”. You can move on to another round or score below.`,
    letterOfA11y: (n: number, total: number): string => `Letter ${n} of ${total}`,
    pictureOfA11y: (n: number, total: number): string => `Picture ${n} of ${total}`,
    restart: '↺ Start over',
    pluralCardA11y: (label: string): string => `Card with ${label}`,
    pluralHowManyPrompt: (target: string): string =>
      `Ask them “how many are there?” and tap the mic to have them say: “${target}”`,
    pluralWhatArePrompt: (target: string): string =>
      `Ask them “what are they?” and tap the mic to have them say: “${target}”`,
    orderTilePlacedA11y: (cap: string): string => `${cap} card, already placed`,
    orderTileA11y: (cap: string): string => `${cap} card`,
    sceneA11y: (label: string): string => `${label}. Hear an example`,
    selloHint: (sec: number): string =>
      `The button unlocks after ${sec} seconds of waiting. Tap it ONLY when the child truly looks at you (not at the object); it then locks again for the next attempt.`,
    doneSub: (total: number): string => (total === 1
      ? 'You have scored this exercise. The result is saved on the device.'
      : `You have scored all ${total} activities in the plan. The result is saved on the device.`),
    zoomClose: 'Tap to close',
    zoomCloseA11y: 'Close enlarged image',
    zoomTip: 'To enlarge an image: tap it, or press and hold it during games',
    zoomIconA11y: 'Enlarge the icon',
    zoomFaceA11y: 'Enlarge the face',

    adultOnlyKicker: 'FOR THE GROWN-UP ONLY',
    adultOnlyShow: 'Tap to see which word you have to say without your voice.',
    adultOnlyHide: 'Turn the screen away from your child. Tap to hide it again.',
    adultOnlyShowA11y: 'See the word you have to say, without showing the screen to the child',
    adultOnlyHideA11y: 'Hide the word you have to say',

    judgeSaidIt: 'Said it',
    judgeSaidItA11y: 'Judge: said it correctly',
    judgeAlmost: 'Almost',
    judgeAlmostA11y: 'Judge: almost said it',
    judgeHint: 'Is the mic slow or not understanding? Score the attempt yourself:',

    materialsKicker: 'BEFORE YOU START · YOU’LL NEED',
    proposalsKicker: 'OTHER WAYS TO DO IT · ALTERNATE BETWEEN SESSIONS',
    step1Kicker: 'STEP 1 · WHAT THE GROWN-UP SAYS',
    step1Small: 'This text is for you: say it to your child in your own words',
    listenPrompt: 'Hear the prompt',
    newRound: 'Another round',
    newRoundA11y: 'Switch to another round with new content',
    step2: (label: string): string => `STEP 2 · ${label}`,
    levelLabel: (label: string): string => `LEVEL ${label.toUpperCase()}`,
    guidedActivity: 'Guided activity',
    hearWordSlow: 'Hear the word slowly',
    modelNote: 'The best model is your own voice: say it first, up close and slowly. The app’s voice is only backup.',
    trialKicker: (n: number, max: number): string => `JUDGE · TRIAL ${n} OF ${max}`,
    trialHint: 'If the mic fails or lags, score each attempt yourself. At the limit, the app offers a movement break to let off steam.',

    vowelHint: '1st Tap a picture to hear its name · 2nd Tap the vowel it starts with',
    allMatched: '🎉 All matched! You can go to another round or score below.',
    allFound: '🎉 All found! You can go to another round or score below.',
    matrixDone: '🎉 Grid complete! You can go to another round or score below.',
    hearAllNames: 'Hear all the names',
    hearFullWord: '1st Hear the whole word',
    hearWords: 'Hear the words',
    hearFullSeries: 'Hear the whole series',
    hearOptions: 'Hear the options',
    hearSentence: '1st Hear the sentence',
    intruderHint: 'By ear only: first listen to the whole series; then the child taps the speaker of the word that doesn’t sound like the rest.',
    synthesisHint: 'The app says each sound separately, with a pause between them. The child blends them and says the whole word.',
    synthesisA11y: 'Hear the sounds separately',
    findAllOf: 'FIND ALL THE',
    namedLabel: 'NAMED',
    orderHint: 'In reading order (→): the child NAMES the picture out loud and taps it. You chase their finger with yours, like tag.',
    startOver: '↺ Start over',
    sentenceRetry: 'Almost… listen to the sentence again and try once more.',
    promptTextKicker: 'TEXT · YOU CAN READ IT OUT LOUD',
    hearExample: '🔊 Hear an example',

    selloKicker: '🤝 DOUBLE SEAL · TIME DELAY',
    selloWait: (s: number): string => `⏳ Wait ${s} s…`,
    selloGive: '🤝 Give the Double Seal',
    selloGiveA11y: 'Give the double seal for real eye contact',
    selloCount: (stars: string, n: number): string => `Seals for eye contact: ${stars} (${n})`,
    breakNow: '⏸️ Interrupt now (surprise capsule)',
    breakNowA11y: 'Interrupt now with a surprise movement capsule',

    step3Kicker: 'STEP 3 · MOVEMENT VERSION',
    waitTxt: 'Wait and watch how your child responds',

    step4Kicker: 'STEP 4 · SCORING',
    scoreTitle: 'How did it go?',
    scoreSubRounds: 'Play as many rounds as you like, then tap the sentence that best describes the response',
    scoreSub: 'Tap the sentence that best describes the response',
    eptToggle: 'What is the EPT-3 scale?',
    eptToggleA11y: 'What the EPT-3 scale is',
    eptExplain:
      'EPT-3 is the 3-level scale used to record how the child responded in each activity: '
      + '1★ can’t do it yet, 2★ does it with the grown-up’s help, and 3★ does it alone. It is '
      + 'not a grade: it lets the SLP see progress from session to session.',
    nextUpKicker: 'UP NEXT · TELL THEM BEFORE YOU SWITCH',

    doneTitle: 'Session complete!',
    streakChip: (n: number): string => (n === 1 ? 'day streak' : 'day streak'),
    streakExtended: 'Streak extended! Come back tomorrow so you don’t lose it.',
    levelChip: (n: number, name: string, up: boolean): string =>
      `Level ${n} · ${name}${up ? ' · LEVELED UP!' : ''}`,
    xpToNext: (n: number): string => `${n} XP to the next level`,
    badgesTitle: 'BADGES UNLOCKED!',
    doneStatKicker: 'SESSION AVERAGE · EPT-3 SCALE (1★ TO 3★)',
    seeResults: 'See results →',
    repeatSession: 'Repeat session',
    sessionName: 'Exercise session',
    headerDone: 'Session Complete',
    headerPlaying: 'Exercise Session',
    noteGreat: 'Very smooth session, great responses to the prompts.',
    noteGood: 'Good session, some prompts were hard but attention held.',
    noteHard: 'Hard session today, worth reinforcing with more support from the grown-up.',
    seriesSolved: '✅ Series solution: these were the words that played, in the same order.',
    seriesHint: '🔊 Each card is a word from the series, in the order they play. The words appear once you answer.',
    hearQuestion: 'Hear the question',
    // The ROLE id comes from the (Spanish) content bank; the question shown to
    // the child is scaffolding. Non-S-V-O roles pass through unchanged.
    roleQuestion: (role: string): string =>
      role === 'Sujeto' ? 'Who?'
        : role === 'Verbo' ? 'Doing what?'
          : role === 'Objeto' ? 'What thing?'
            : role,
    redirecting: (s: number): string => `Going to results in ${s}s…`,
    prescribedPlan: (n: number): string => `Prescribed plan · ${n} exercises`,
  },

  // Caregiver panel, modals and results. Same rule as always: what the app
  // SPEAKS (TPR commands, routine routes) comes from the variety bank; what the
  // grown-up READS lives here. The pragmatic breakdown and the repair scale are
  // instructions and clinical observation FOR THE GROWN-UP, so they are interface.
  adult: {
    kicker: 'CAREGIVER PANEL · EXTRA CHALLENGE',
    openA11y: 'Open the caregiver panel',
    closeA11y: 'Close the caregiver panel',
    distractorTitle: 'Distractor cat (dual task)',
    distractorSub: 'The cat peeks in and moves along the edge; the child has to keep attending to the voice. Tapping it does not count as an error.',
    launchPragmatic: 'Trigger a pragmatic breakdown',
    hint: 'Manual controls for practicing listening in a real-world environment. Use them if your speech-language pathologist prescribed them: the app never turns them on or adjusts them by itself.',
    stepDownA11y: (label: string): string => `Decrease ${label}`,
    stepUpA11y: (label: string): string => `Increase ${label}`,
    arHint: 'What the child will be asked for in each exercise. You set them before you start and they stay fixed for the whole session: the app measures and records, the clinical judgment is always yours.',
    arHoldLabel: 'Gesture hold (AR-1)',
    arHoldHint: 'How long they must keep their lips rounded for the car to reach the finish line.',
    arTurnLabel: 'Head turn (AR-2)',
    arTurnHint: 'How many degrees they must turn toward the sound for it to count as localization.',
    arWindowLabel: 'Response window (AR-2)',
    arWindowHint: 'How long they get after the sound. Outside the window it is “no response”, never “error”.',
    arDwellLabel: 'Dwell to select (AR-3)',
    arDwellHint: 'How long they must look at a picture to select it. The progress ring shows them.',
    gazePointerHint: 'The iris is more precise; the nose is steadier on modest phones. If the pointer shakes, switch to nose: the exercise does not notice.',
    arKicker: '🎯 AUGMENTED REALITY · CLINICAL THRESHOLDS',
    gazePointer: 'Gaze pointer (AR-3)',
    pointerIris: 'Iris',
    pointerNose: 'Nose',
    pointerIrisA11y: 'Iris-based pointer',
    pointerNoseA11y: 'Nose-based pointer',
  },

  pragmatic: {
    kicker: 'PRAGMATIC BREAKDOWN · GROWN-UPS ONLY',
    warnTitle: 'This task will create useful frustration',
    warnBody:
      'You are about to break communication ON PURPOSE to watch how your child repairs it. '
      + 'It is normal (and valuable) for them to be puzzled, to protest or to get a little '
      + 'frustrated: that reaction IS the exercise. Do it once, calmly, and always finish with '
      + 'a hug and the instruction said properly.',
    closeLoopUpset:
      'Close the breakdown now: repeat the instruction properly, name the feeling (“I confused '
      + 'you, didn’t I?”) and give them a hug. Repair by the grown-up teaches too.',
    notToday: 'Not today',
    understood: 'Understood, let’s go',
    swapVariant: 'I’d rather use the other variant →',
    didIt: 'Done · what did your child do?',
    repairTitle: 'How did they repair the breakdown?',
    repairBody: 'Pick the FIRST thing your child did. There are no wrong answers: they all tell us something.',
    recorded: 'Recorded',
    closeLoop: 'Close the loop: repeat the instruction properly and celebrate their reaction. Repairing is a skill, and they just practiced it!',
    backToSession: 'Back to the session',
    stressorMurmurTitle: 'Mumble',
    stressorMurmurText: 'Give a simple instruction in a VERY quiet, unclear voice, looking away. Example: “bring me the…” (unintelligible).',
    stressorAbsurdTitle: 'Absurd instruction',
    stressorAbsurdText: 'Ask for something impossible or nonsensical with a straight face. Example: “Put the shoe inside the fridge” or “Hand me the cloud on the table”.',
    repairAskLabel: 'Asked for repetition',
    repairAskDesc: '“What?”, “again?”, moved closer to listen',
    repairRephraseLabel: 'Rephrased',
    repairRephraseDesc: 'Corrected or negotiated the absurd instruction in their own words',
    repairGestureLabel: 'Used gestures',
    repairGestureDesc: 'Pointed, shrugged, looked to you',
    repairWithdrawLabel: 'Withdrew',
    repairWithdrawDesc: 'Pulled out of the interaction or switched activity',
    repairCryLabel: 'Cried',
    repairCryDesc: 'Emotional overflow at the breakdown',
    repairNoneLabel: 'Didn’t notice the breakdown',
    repairNoneDesc: 'Carried on as if the instruction had been normal',
  },

  breaks: {
    routeKicker: '🏠 ROUTINE ROUTE · TPR 2.0',
    adultBanner: '👤 Caregiver panel · the child does NOT touch the screen: they listen and act with real objects.',
    ready: '▶ We’re ready',
    repeatOrder: '🔊 Repeat the instruction',
    repeatOrderA11y: 'Repeat the instruction out loud',
    structure: (focus: string): string => `Structure: ${focus}`,
    notThisTime: '✖️ Not this time',
    skip: 'Skip this time',
    tprKicker: '🧩 TPR CAPSULE · LISTEN AND MOVE',
    tprSub: 'The app says the instruction out loud and the child responds with their body (Total Physical Response).',
    tprRepeat: '🔊 Repeat instruction',
    tprDoneLast: '✅ Done! Let’s go →',
    tprDone: '✅ They did it!',
    routeDoneLast: '✅ Did it · finish',
    routeDone: '✅ Did it',
    // Far Visual Anchor (20-20-20). The copy says SUGGESTION throughout:
    // nothing here stops the session, and the footer says so outright.
    visualAnchorKicker: '👁️ VISUAL BREAK · 20-20-20 RULE',
    visualAnchorTitle: 'Visual break recommended',
    visualAnchorBody: 'That’s 20 minutes of close screen work. Lúa is ready for a 20-second break: have them look at something far away —a window, the back of the room— while the cat sleeps.',
    visualAnchorStart: (n: number): string => `▶ Start the ${n} seconds`,
    visualAnchorRunning: (n: number): string => `Looking far away · ${n} s`,
    visualAnchorFarAway: 'Keep them looking at the furthest thing in the room. Lúa sleeps until it’s over.',
    visualAnchorResume: 'Resume now',
    visualAnchorLater: 'Not now',
    visualAnchorHint: 'Lúa falls asleep during the break. The session does not stop.',
    visualAnchorFoot: 'Suggestion · the app never stops the session; the break is your call.',
  },

  pro: {
    unlockPill: 'Unlock professional editing',
    unlockedPill: 'Professional mode active',
    modalTitle: 'Professional Mode',
    pinError: 'Wrong PIN. Try again.',
    demoPin: 'Demo PIN: 1985',
    pinSubtitleDefault: 'Enter the clinician’s 4-digit PIN to edit the assigned plan.',
    shareCancelled: 'Export cancelled · the log is kept so you can retry.',
    shareFailed: 'Couldn’t open the share menu · the log is kept.',
    exportKicker: '🔓 PROFESSIONAL MODE · EXPORT',
    exportTitle: 'Usability evidence',
    exportSub: 'Scan the QR code for the offline summary, or share the full log when you have a connection.',
    qrCaption: 'Offline summary · scannable with the camera',
    shareLog: '📤 Share full log (email · WhatsApp)',
    packaging: 'Packaging log…',
    shareTitle: 'Usability log · Valeria+ (pilot)',
    exportPurged: 'Log exported and wiped from the device.',
    statSessions: 'Sessions',
    statTprAbandon: 'TPR drop-off',
    statMisclicks: 'Misclicks',
    statSusMean: 'SUS mean',
    statSusAnswers: 'SUS answers',
    statFullBlocks: 'All 4 blocks',
  },

  sus: {
    kicker: '💬 ONE QUICK QUESTION',
    question: 'It was easy to fit this exercise into my child’s routine.',
    scaleA11y: (v: number, label: string): string => `${v} of 5: ${label}`,
    thanks: 'Thanks for helping us make Valeria+ better!',
    sub: 'Tap the face that fits best. It’s anonymous and takes a second.',
    disagree: 'Strongly disagree',
    agree: 'Strongly agree',
    neutral: 'Neutral',
    somewhat: 'Somewhat agree',
    slightly: 'Somewhat disagree',
  },

  results: {
    back: '‹ Back to exercises',
    title: 'Results and Progress',
    noPatient: 'No patient record',
    recordNumber: (nhc: string): string => `Record ${nhc}`,

    gameTitle: 'Motivation and achievements',
    currentStreak: 'current streak',
    totalXp: 'total XP',
    bestStreak: 'best streak',
    level: (n: number, name: string): string => `Level ${n} · ${name}`,
    xpToNext: (n: number): string => `${n} XP to the next level`,
    badgesLabel: (won: number, total: number): string => `BADGES · ${won}/${total}`,

    adherenceTitle: 'Weekly adherence',
    adherenceLabel: 'This week’s adherence',
    adherenceValue: (done: number, goal: number): string => `${done} of ${goal} sessions completed`,

    evolutionTitle: 'Progress by stars',
    pairsChartSub: 'Minimal pairs · % of trials where the microphone picked up the substitution (lower = better)',
    sessionsCount: (n: number): string => `${n} ${n === 1 ? 'session' : 'sessions'}`,
    arTargetMs: (ms: number): string => `target ${ms} ms`,
    arMeasuredOn: (device: string, level: string, fps: number): string =>
      `Measured on ${device} · level ${level} · ${fps} fps sustained`,
    arVoidedTrials: (n: number): string =>
      ` · ${n} trial${n === 1 ? '' : 's'} voided because the phone moved`,
    evolutionSub: (n: number): string => `Average stars · last ${n} sessions`,
    trendUp: (d: number): string => `▲ +${d} ★`,
    trendDown: (d: number): string => `▼ ${d} ★`,
    trendStable: '= steady',

    speechTitle: 'Microphone tally',
    speechSub: 'How many words of the prompted sentence the microphone picked up. It is an exercise aid, not a measure.',
    speechWpu: 'words per sentence',
    speechCoverage: 'of the prompted sentence',
    speechUtterances: (n: number): string => (n === 1 ? 'sentence practised' : 'sentences practised'),
    speechNote:
      'This is NOT a clinical measure and has no health purpose. It is an exercise aid: it lets the '
      + 'child see how far they got and lets you see which word dropped. It does not assess language, '
      + 'it is not valid for a diagnosis or a report, and it must not drive any treatment decision. '
      + 'You are the one who rates how the child spoke, on the EPT-3 scale, as everywhere else in the app.',

    phonemeTitle: 'Substitution by phoneme',
    pmFirstSession: 'first session',
    pmImproving: (d: number): string => `▼ ${d} pp · improving`,
    pmWorsening: (d: number): string => `▲ +${d} pp · needs work`,

    arNoTiming: 'Played without timing: measuring the times needs external wired speakers. The correct answers were recorded.',
    arNoTrials: 'No measured trials in this exercise yet.',
    arTrials: 'trials',
    arVoided: 'voided',
    arMean: (unit: string): string => `mean (${unit})`,
    arMax: (unit: string): string => `max (${unit})`,
    arShareLine: (name: string, n: number, medida: string): string => `• ${name}: ${n} trials · ${medida}`,
    arTrial1: 'trial 1',
    arLabel: (id: string): string => {
      switch (id) {
        case 'ar1': return 'Lip-rounding hold';
        case 'ar2': return 'Head-turn latency';
        case 'ar3': return 'Fixation before choosing';
        case 'ar4': return 'Spatial search acquisition';
        case 'ar5': return 'Throw latency';
        case 'ar6': return 'Mimicry hold time';
        default: return 'AR metric';
      }
    },
    arHint: (id: string): string => {
      switch (id) {
        case 'ar1': return 'Milliseconds the lip rounding was held in each trial. The dotted line is the target you set yourselves.';
        case 'ar2': return 'Milliseconds between the sound and the head turn. Only trials that could be timed appear here.';
        case 'ar3': return 'Milliseconds of sustained gaze before confirming the picture.';
        case 'ar4': return 'Milliseconds to locate Lúa with the foveal reticle and align head pose.';
        case 'ar5': return 'Milliseconds from Lúa asking for the fish to the child completing the throwing gesture.';
        case 'ar6': return 'Milliseconds the guided facial expression was held with bilateral symmetry.';
        default: return 'Milliseconds measured during the augmented reality exercise.';
      }
    },
    arTitle: (id: string): string => {
      switch (id) {
        case 'ar1': return 'AR-1 · Orofacial kinematics';
        case 'ar2': return 'AR-2 · Sound localization';
        case 'ar3': return 'AR-3 · Selection by fixation';
        case 'ar4': return 'AR-4 · Spatial search for Lúa';
        case 'ar5': return 'AR-5 · Feed Lúa (Throw and catch)';
        case 'ar6': return 'AR-6 · Mirror mimicry with Buddy Lúa';
        default: return `AR · ${id.toUpperCase()}`;
      }
    },
    arTrialN: (n: number): string => `trial ${n}`,

    historyLabel: 'SESSION HISTORY',
    historyCount: (n: number): string => `${n} recorded`,
    average: (v: string): string => `Average: ${v} / 3`,
    understands: '👆 UNDERSTANDS',
    produces: '🗣 PRODUCES',
    responsesKicker: '📝 RECORDED RESPONSES',

    newSession: 'Start a new session →',
    backGhost: '↩ Back to exercises',
    sharePdf: '📄 Share PDF',
    footNote: 'History stored on this device only (local-first).',
    shareTitle: 'Valeria+ results',
    // EXAMPLE history shown before any real session exists.
    demoHistory: (): Array<{ date: string; name: string; note: string }> => [
      { date: 'Jun 10', name: 'Initial vowel matching', note: 'Slow to start, but ended up matching the vowels with support.' },
      { date: 'Jun 12', name: 'Odd-one-out detection', note: 'Good session, found the odd one out after the guiding question.' },
      { date: 'Jun 15', name: 'Emotion recognition', note: 'Very focused today, named almost all the emotions.' },
      { date: 'Jun 17', name: 'S-V-O structure', note: 'Built complete sentences with the dice, big step forward.' },
      { date: 'Jun 19', name: 'Exercise session', note: 'Excellent. Answered the prompts with almost no help.' },
    ],
    shareHeader: 'VALERIA+ · Results and Progress',
    shareAdherence: (pct: number, done: number, goal: number): string => `Weekly adherence: ${pct}% (${done}/${goal})`,
    shareTrend: (trend: string): string => `Trend: ${trend}`,
    shareHistory: 'Session history:',
    sharePm: 'Minimal pairs · substitution by phoneme:',
    shareAr: 'Augmented reality · measured values:',
    shareFoot: 'Local-first report generated on the device.',
    shareSessionLine: (date: string, name: string, avg: string, stars: string, split: string, resp: string): string =>
      `• ${date} · ${name} — ${avg}/3 ${stars}${split}${resp}`,
    shareSplit: (comp: string, prod: string): string => ` [understands ${comp}/3 · produces ${prod}/3]`,
    shareResponse: (code: string, text: string): string => `\n    · ${code} answered: “${text}”`,
    sharePmLine: (phoneme: string, pct: number, n: number): string =>
      `• ${phoneme}: ${pct}% substitution in the last session (${n} ${n === 1 ? 'session' : 'sessions'})`,
    shareArMeasure: (label: string, mean: number, unit: string, max: number, n: number): string =>
      `${label.toLowerCase()} mean ${mean} ${unit} (max ${max} ${unit}, n=${n})`,
    shareArNoTiming: 'no timed measurement',
    shareArVoided: (n: number): string => ` · ${n} voided by phone movement`,
    shareDevice: (mk: string, model: string, level: string, fps: string): string =>
      `\n  Measured on ${mk} ${model} · capability level ${level} · ${fps} sustained fps`,
    shareThresholds: (hold: number, turn: number, win: number, dwell: number): string =>
      `\n  Thresholds set by the grown-up: hold ${hold} ms · turn ${turn}° · window ${win} ms · fixation ${dwell} ms`,
  },

  notifications: {
    channelName: 'Session reminders',
    messages: (): Array<{ title: string; body: string }> => [
      { title: '🧸 Valeria the bear is waiting!', body: '5 little minutes of play are worth a lot. Quick session?' },
      { title: '🔥 Don’t lose your streak!', body: 'One session a day keeps the flame alive. Let’s play!' },
      { title: '👂 Time to listen', body: 'How about the sounds game? It only takes a few minutes.' },
      { title: '⭐ Time to earn stars', body: 'Every exercise adds XP. Go for all 3 stars!' },
      { title: '🐸 Jump and learn!', body: 'The movement games are the favorites. Shall we play?' },
      { title: '🎯 Small challenge, big step', body: 'One exercise now = a big step in their language.' },
      { title: '🎉 Valeria has a new game!', body: 'Come in and find today’s movement break.' },
      { title: '💪 Consistency = progress', body: 'Families who practice daily see twice the progress.' },
      { title: '🌈 A little time together', body: 'Play, move and learn: all in one Valeria session.' },
      { title: '🏆 Your achievement is waiting', body: 'You’re close to unlocking a new badge. Come and get it!' },
      { title: '🎵 Hear that?', body: 'It’s time for the Ling Sound Check and the listening games.' },
      { title: '🧩 Last call for today', body: 'There’s still time to add today’s session. You’ve got this!' },
    ],
    parentTips: (): Array<{ title: string; body: string }> => [
      {
        title: '👀 Tip 1 · Your eyes and mouth are their map',
        body: 'To learn to articulate, your child needs to see how words are made. Get down to their level, meet their eyes and let them see your mouth: their brain is a mirror that copies your movements. If you talk from another room, with your back turned or while looking at your phone, you take away the visual map they need to move their lips and tongue.',
      },
      {
        title: '📵 Tip 2 · The educational-screen trap',
        body: 'Phones, tablets and TVs do not teach a child to talk, even when the program repeats numbers or colors. Live language needs turns: speaking, listening and answering. A screen does not pause to listen to your child, does not smile when they try, and does not correct them kindly. Only you can give them the hours of real practice.',
      },
      {
        title: '🤫 Tip 3 · The silence rule',
        body: 'Grown-ups talk fast and fill every silence. When you offer something (milk, for example) and ask “what do you want?”, pause and count to five in your head. Give their brain time to process and organize the muscles. That strategic silence is what pushes them to use a sound, a gesture or a word.',
      },
      {
        title: '🛁 Tip 4 · Routine is your best ally',
        body: 'You don’t need an hour of exercises or expensive materials. The best moment for language is what you already do every day: while you bathe them, name the soap, the water and the body parts; while you put clothes away, name the colors. Repeating simple words in real situations at home is what fixes vocabulary for good.',
      },
      {
        title: '🐶 Tip 5 · Expand what they say, without correcting them',
        body: 'If they point at a dog and say “woof woof”, don’t say “that’s not how you say it”: give the sentence back improved — “yes, it’s a big dog!”. If they say “water”, answer “you want to drink water”. Expanding their words without criticizing gives them the correct model and confirms that their attempt to communicate worked and mattered.',
      },
    ],
  },

  voice: {
    listen: 'Listen',
    listenA11y: (text: string): string => `Listen: ${text}`,

    phaseListen: 'Listen',
    phaseRepeat: 'Repeat',
    phaseVerdict: 'Result',
    phaseMission: 'Mission',
    currentPhase: (label: string): string => `Current step: ${label}`,

    micKicker: 'VOICE GAME · THE CHILD’S TURN!',
    micPrompt: (target: string): string => `Tap the mic and have them say: “${target}”`,
    micHearModel: 'Hear the model',
    micStartA11y: 'Start listening',
    micStopA11y: 'Stop listening',
    micListening: 'Listening…',
    micTapToSpeak: 'Tap to speak',
    micHeard: 'The app heard:',
    micUnavailable:
      'The microphone game works in the installed app (APK). In the meantime, your child can repeat '
      + 'the word and you score it below.',
    micVerdicts: [
      { icon: '👂', title: 'Let’s try together', sub: 'Listen to the word slowly and say it together.' },
      { icon: '💪', title: 'So close!', sub: 'That was very close. Repeat the model and try again.' },
      { icon: '🎉', title: 'They nailed it!', sub: 'The app understood the target word.' },
    ],

    micCoverage: (hits: number, total: number): string =>
      `${hits} of ${total} words in the sentence`,

    sentenceCardsKicker: 'SENTENCE CARDS',
    sentenceCardsProgress: (hits: number, total: number): string => `${hits} of ${total} words`,
    sentenceWordMatched: (word: string): string => `Word matched: ${word}`,
    sentenceWordPending: (word: string): string => `Word pending: ${word}`,

    captureKicker: '📝 RECORD THEIR ANSWER',
    capturePrompt: 'Record with the mic or type what your child said.',
    capturePlaceholder: 'Type what they said here…',
    captureWriteA11y: 'Type the child’s answer',
    captureRecordA11y: 'Record the answer with the microphone',
    captureStopA11y: 'Stop recording',
    captureListening: 'Listening… speak now',
    captureOk: '✓ Answer saved: it will be stored with the session in Results.',

    cardTitle: 'App voice',
    varietyLabel: 'Voice variety',
    localeEs: 'Spanish (Spain)',
    localeGl: 'Galician',
    localeEsDO: 'Dominican Spanish',
    localeEu: 'Basque',
    localeEnUS: 'English (US)',
    localeCa: 'Català',
    varietyA11y: (label: string, beta: boolean): string =>
      `${label} voice${beta ? ', in testing' : ''}`,

    chipChecking: 'Checking…',
    chipNatural: '✓ Natural voice',
    chipStandard: 'Standard voice',
    chipPoor: 'Voice can be improved',
    chipCeltia: '✓ Celtia voice',
    chipHitz: '✓ HiTZ ahotsa',
    chipPiperEn: '✓ Piper en_US',
    chipMatxaCa: '✓ Veu Matxa (AINA)',

    detailSearching: 'Looking for the best Spanish voice installed on this device…',
    detailNoVoice:
      'There is no Spanish voice installed: the app cannot read the prompts out loud until you '
      + 'download one.',
    detailDo: (name: string): string =>
      `In Dominican Spanish the app uses the device’s Latin American voice${name ? ` (“${name}”)` : ''} `
      + 'and the microphone in es-DO. If it sounds European or robotic, install a Spanish (Latin '
      + 'America) voice.',
    detailGood: (name: string): string =>
      `The app will use the best voice on this device${name ? ` (“${name}”)` : ''}. It sounds natural, `
      + 'not robotic.',
    detailAndroidPoor:
      'This device only offers a basic voice and it may sound robotic. Install the Google voices '
      + '(free and offline) so the app sounds natural.',
    detailIosPoor:
      'You can improve the voice in Settings → Accessibility → Spoken Content → Voices → English, '
      + 'downloading the enhanced voice.',
    detailEn:
      'The English neural voice (Piper en_US) ships inside the app and works offline: tap “Test the '
      + 'voice” to hear it. The exercises have their own bank and a signed dialect guide: African '
      + 'American English and bilingual-speaker features are not scored as errors. Picking this '
      + 'variety switches the voice, the microphone and the interface language.',

    testVoice: '▶ Test the voice',
    testVoiceA11y: 'Hear how the voice sounds',
    installGoogle: '⬇️ Install the Google voices',
    installGoogleA11y: 'Install the Google voices',
    recheck: '🔄 Check again',
    recheckA11y: 'Check the voice again',
    installHint:
      'After installing: Settings → System → Text-to-speech output → pick “Google Speech Services” and '
      + 'download the Spanish (Spain) voice. Then come back here and tap “Check again”.',

    privCapture:
      '⏺ CORPUS CAPTURE IS ON. This build stores the audio of the speaking turn on the device. It is '
      + 'not a production build: it must not be used in a normal session or left on a family’s device.',
    privKicker: 'EXERCISE MICROPHONE',
    privChecking: 'Checking where your child’s voice is processed for this variety…',
    privLocal: (label: string): string =>
      `In ${label}, recognition happens inside the phone: the audio of the speaking turn never leaves `
      + 'the device.',
    privLocalFailed: (label: string): string =>
      `The ${label} pack shows as installed, but when it came to actually listening, the phone’s `
      + 'recognizer did not start. So the exercise would not break, the app fell back to the system '
      + 'recognition service, which may send audio to its servers. Tap “Check again” to retry on-device.',
    privNotCapable: (label: string): string =>
      `This device cannot recognize speech offline, so in ${label} the audio of the speaking turn is `
      + 'handled by the system recognition service, which may send it to its servers.',
    privNoService: (label: string): string =>
      `This device exposes no speech recognition service at all, so in ${label} the microphone game `
      + 'cannot work. Check in Settings that the system speech recognition is installed and enabled.',
    privCanDownload: (label: string): string =>
      `This phone can recognize speech offline, but the ${label} pack is missing. In the meantime the `
      + 'audio of the speaking turn is handled by the system service, which may send it to its servers.',
    privNoDownload: (label: string): string =>
      `The ${label} pack is missing and this version of Android does not allow downloading it from the `
      + 'app. You can install it in Settings → System → Languages → Voice input; until then the audio '
      + 'is handled by the system service.',
    privOffer: (label: string): string =>
      `If you download the ${label} pack, your child’s voice stops leaving the phone. It takes up space `
      + 'and downloads only once; the exercises work just the same if you would rather not.',
    privDownload: '⬇️ Download the pack',
    privDownloadA11y: (label: string): string => `Download the ${label} speech recognition pack`,
    privNotNow: 'Not now',
    privNotNowA11y: 'Do not download the speech pack',
    privRecheckA11y: 'Check again where speech is recognized',
    privNoteOk: '✓ Pack downloaded. From now on, speech is recognized inside the phone.',
    privNoteDialog: 'The system download screen opened. When it finishes, tap “Check again”.',
    privNoteCancelled: 'Download cancelled. The system recognition service is still being used.',
    privNoteFailed:
      'The download could not be requested on this device. You can do it from Settings → System → '
      + 'Languages → Voice input.',
    privNoteDeclined: 'No problem: the exercises work just the same with the system recognition.',
    privLastListen: (local: boolean): string =>
      `Last listen this session: ${local ? 'on the phone' : 'system service'}.`,
    privRecognizer: (name: string): string => `System recognizer: ${name}.`,
  },

  noise: {
    kicker: 'BACKGROUND NOISE (BABBLE)',
    off: 'off',
    levelTag: (n: number): string => `level ${n}`,
    hint: 'You are the only one who changes this: raise the cafeteria babble little by little if your speech-language pathologist told you to. The app never moves it on its own.',
    sliderA11y: 'Background noise level',
    silence: 'Quiet',
    cafe: 'Cafeteria',
  },

  settings: {
    uiLangTitle: 'App language',
    uiLangHint:
      'Changes the whole app: the menus you read and what your child hears in '
      + 'the exercises too. If you want the interface in one language and the '
      + 'the exercises in another, change it afterwards under "App voice".',
    uiLangAuto: 'Automatic',
    uiLangAutoHint: 'Follows the language of the exercises.',
    uiLangEs: 'Español',
    uiLangEn: 'English',
    uiLangCa: 'Catalan',
  },


  // Bloque de Realidad Aumentada. La cámara MIRA, no graba: el copy de
  // consentimiento es parte del muro MDR, no adorno — se traduce entero o no se
  // traduce (una mezcla de idiomas aquí es un consentimiento inválido).
  ar: {
    title: 'Augmented Reality',
    subPreparing: 'Getting the session ready',
    subUnsupported: 'Not available on this device',
    subConsent: 'Before you turn the camera on',
    subWarmup: 'Warm-up with Lúa',
    subNotApt: 'This phone cannot handle these games',
    subLevel: (label: string): string => `This phone's tier: ${label}`,
    sessionDone: 'Session finished',
    oneMoment: 'One moment…',

    busyMeasuring: 'Measuring this phone… (about 90 seconds)',
    busyCalibrating: 'Let\u2019s play at following Lúa into the corners (15 seconds)…',
    busyOpeningCamera: 'Opening the camera…',

    noticeAptitudeFailed: 'The test could not be completed on this phone. You can try again.',
    noticeCameraBusy: 'Another app is using the camera. Close it and try again.',
    noticeArServicesOutdated: 'Update “Google Play Services for AR” from the Play Store and try again.',
    noticeArServicesMissing: 'This block needs “Google Play Services for AR”. Accept the installation when it is offered.',
    noticeArServicesInstalling: '“Google Play Services for AR” is still installing. Wait a few seconds and try again.',
    noticeCameraDenied: 'The warm-up cannot run without camera permission. You can grant it and try again.',
    noticeCalibrationFailed: 'Calibration did not finish. Prop the phone up in landscape, about a foot from your child\u2019s face, and try again.',
    noticeLaunchFailed: 'The exercise did not open. Check that the app has camera permission.',
    noticeDenied: 'Without camera permission there are no Augmented Reality exercises. The rest of the app works exactly the same.',
    noticeTimeout: 'The exercise closed because the camera lost sight of your child\u2019s face. Prop the phone up in landscape, about a foot from their face and at eye level, and try again.',

    unsupportedTitle: 'These games cannot run here yet',
    unsupportedBody: 'These exercises need the front camera and a version of the app installed on the phone (they do not work in the Expo Go preview). The other six exercise blocks work exactly as well.',

    consentTitle: 'What the camera does in these games',
    consentLead1: 'In this block the front camera does not record: it ',
    consentLeadStrong: 'watches',
    consentLead2: '. It tells whether your child rounds their lips, turns their head towards a sound or looks at a picture, so the car, the dog or the apple can react to that movement.',
    consentNoRecordStrong: 'No image is ever recorded or stored.',
    consentNoRecord: ' Every frame is analysed and discarded instantly.',
    consentNoUploadStrong: 'No video leaves the phone.',
    consentNoUpload: ' All the analysis happens right here, with no internet.',
    consentNoFaceIdStrong: 'Nobody\u2019s face is recognised.',
    consentNoFaceId: ' Only movements are measured: degrees, milliseconds and ratios.',
    consentMicOffPre: 'In two of the three exercises the ',
    consentMicOffStrong: 'microphone is off',
    consentMicOffPost: ': motor effort is rewarded before your child is asked to speak.',
    consentRevoke: 'You can leave at any time and withdraw this permission from your Android settings.',
    consentAccept: 'I understand and agree',
    consentAcceptA11y: 'Agree to camera use and continue',
    consentDecline: 'Not now',

    warmupTitle: 'A ninety-second warm-up game',
    warmupBody1a: 'Every phone is different and these exercises are demanding. Before starting, the app runs a short test —looking at Lúa, following her into the corners, listening to two sounds— to find out what it can offer ',
    warmupBody1Strong: 'on this particular phone',
    warmupBody1b: '. It only happens once.',
    warmupBody2a: 'Prop the phone on a book or a box, in ',
    warmupBody2Strong: 'landscape',
    warmupBody2b: ', about a foot from your child\u2019s face (12-14 in), and leave it still.',
    warmupStart: 'Start the warm-up',
    warmupStartA11y: 'Start the warm-up',
    warmupRedo: 'Run the warm-up again',
    warmupRedoA11y: 'Run this phone\u2019s warm-up again',

    notAptTitle: 'Better not to push it',
    notAptBody: 'This is not your fault or your child\u2019s: running the camera and 3D graphics at once asks more than this device can sustain, and a stuttering exercise measures nothing.',
    notAptNoFrontCamera: 'This phone does not offer its front camera to Augmented Reality. Updating will not help: the exercises in this block need to see your child\u2019s face, and here they cannot.',
    notAptDeviceUnsupported: 'This phone is not among those that support Augmented Reality. Updating will not help: every other Valeria+ block works normally.',
    notAptBack: 'Back to the blocks',

    levelLabel: (level: string): string => ({
      A: 'Research-grade', B: 'Clinical', C: 'Reduced', D: 'Not supported',
    }[level] ?? level),
    levelNote: (level: string): string => ({
      A: 'This phone measures precisely enough: all three exercises are available and the session can enter the study.',
      B: 'The exercises run well, but the camera clock or the audio output cannot time the head turn: sound localization is played without recording times.',
      C: 'This phone\u2019s pointer is too unsteady for three targets: gaze selection runs with two, which is a perfectly valid forced choice.',
      D: 'This phone cannot sustain the camera and the 3D scene at once. The Augmented Reality block is hidden; the other six work just as well.',
    }[level] ?? ''),
    levelHeading: (maker: string, model: string, level: string, label: string): string =>
      `${maker} ${model} · tier ${level} (${label})`,

    shareProfile: 'Share this phone\u2019s report',
    shareProfileA11y: 'Share the technical report for this phone',
    shareTitle: 'Valeria+ · phone aptitude report',
    shareHeader: 'VALERIA+ · Device census (Augmented Reality block)',
    shareMaker: 'Manufacturer', shareModel: 'Model', shareOs: 'OS',
    shareLevel: 'APTITUDE TIER',
    shareFps: 'sustained fps (p5)', shareThermal: 'Thermal drop',
    shareTimestamps: 'Camera timestamps', shareJitter: 'Audio jitter',
    shareJitterNone: 'not measured (no speaker rig)',
    sharePointer: 'Pointer RMS', shareImu: 'IMU available',
    shareYes: 'yes', shareNo: 'no',
    shareScreen: 'Screen', shareSeparation: 'Separation achievable with 3 targets',
    shareFooter: (date: string): string =>
      `Measured on ${date}. No child data: this is the device\u2019s report.`,

    exercisesKicker: 'AVAILABLE EXERCISES',
    practiceA11y: (name: string): string => `Practice ${name}`,
    unavailableA11y: (name: string): string => `${name}: not available on this phone`,
    flagGameOnly: 'Playable, but the head turn is not timed: that needs a speaker rig.',
    flagTwoTargets: 'With two pictures on screen: on this phone three would sit too close together.',
    flagUnavailable: 'Not available on this phone.',

    liveSignals: 'View the live signals',
    liveSignalsA11y: 'View the live signals, a tool for the speech-language pathologist',
    liveSignalsSub: 'For the SLP: distance, degrees of head turn, lip aperture and frames per second, raw. No reinforcement and nothing recorded.',

    setupTitle: 'How to position the phone',
    setupBody: 'Propped on a book, a box or against the wall, in landscape, about a foot from the face. The screen turns green when the position is good. If the phone moves during a trial, that trial is voided: better to lose it than to record it wrong.',

    measuredTitle: 'What was measured',
    mdrNote: 'These are raw figures, not an assessment. The app measures and records; your speech-language pathologist is the one who interprets whether this is a lot or a little for your child.',
    backToExercises: 'Back to the exercises',
    streakLine: (days: number, level: number, levelName: string): string =>
      `${days}-day streak · Level ${level} · ${levelName}`,

    rowTrials: 'Trials played',
    rowVoided: 'Trials voided (the phone moved)',
    rowHoldMax: 'Longest hold',
    rowHoldMean: 'Mean hold',
    rowHoldTarget: 'Target you set',
    rowCatchTrials: 'Silent trials (control)',
    rowTimedTurns: 'Head turns timed',
    rowTimedTurnsNone: 'none: played without timing',
    rowLatencyMedian: 'Median head-turn latency',
    rowTargets: 'Targets on screen',
    rowDwellMean: 'Mean dwell before choosing',
    rowAcquisitionMean: 'Mean spatial search time',
    rowJitterRms: 'Angular stability (Jitter RMS)',
    rowThrowVelocityMean: 'Mean throw velocity',
    rowThrowLatency: 'Mean throw latency',
    rowAimDeviation: 'Mean aiming deviation',
    rowMimicHoldMean: 'Mean praxia hold',
    rowSymmetryMean: 'Mean bilateral symmetry',
  },
  academy: {
    back: '‹ Back',
    backA11y: 'Go back to the Academy hub',
    headerTitle: 'Academy',
    headerSub: 'Understand what your child is going through and how to help, in two-minute capsules.',
    langFallbackNotice: 'The training capsules are not available in Catalan yet: you are reading them in Spanish. The rest of the app and all the exercises are in Catalan.',
    progressTxt: (completed: number, total: number, pct: number): string => `${completed}/${total} · ${pct}%`,
    xpTxt: (xp: number): string => `${xp} XP`,
    hubCardTag: 'FOR YOU',
    hubCardSub: 'Understand the condition before you practise it: Language, Hearing loss, Articulation, Dyslexia and Autism.',
    hubCardComplete: 'Training complete',
    hubCardProgress: (completed: number, total: number, pct: number): string => `${completed}/${total} units · ${pct}%`,
    hubCardA11y: (completed: number, total: number): string => `Valeria Academy: caregiver training. ${completed} of ${total} capsules completed.`,
    priorityKicker: 'YOUR PRIORITY TODAY',
    priorityA11y: (title: string, domain: string): string => `Suggested priority: ${title}. Domain ${domain}.`,
    whyKicker: 'WHY THIS CAPSULE?',
    readTime: (min: number): string => `${min} min read`,
    startCapsule: 'Start capsule',
    domainsKicker: 'TRAINING DOMAINS',
    domainCardA11y: (label: string, completed: number, total: number, level: string): string => `${label}. ${completed} of ${total} completed. Level ${level}.`,
    comingSoon: 'Coming soon',
    slideOf: (cur: number, total: number): string => `Slide ${cur} of ${total}`,
    nextSlide: 'Next',
    takeQuiz: 'Take quiz',
    quizKicker: 'KNOWLEDGE CHECK',
    quizSub: 'Answer these questions to reinforce what you learned.',
    questionOf: (cur: number, total: number): string => `Question ${cur} of ${total}`,
    passedTitle: 'Capsule completed!',
    failedTitle: 'Almost there',
    scoreSub: (pct: number): string => `You scored ${pct}%.`,
    passRequirement: (threshold: number): string => `You need at least ${threshold}% to pass. Review and try again!`,
    claimXp: (xp: number): string => `Claim +${xp} XP`,
    reviewAndRetry: 'Review and retry',
    close: 'Close',
    closeA11y: 'Close Academy window',
    badgesKicker: 'DOMAIN BADGES',
    noBadgesYet: 'Complete capsules to unlock badges.',
    capsulesKicker: 'AVAILABLE CAPSULES',
    completedTag: 'COMPLETED',
    perfectTag: '100% FLAWLESS',
    deviceGuideTitle: 'Hearing loss / Deafness',
    deviceGuideProgress: (completed: number, total: number, pct: number, level: string): string => `${completed}/${total} guides · ${pct}% · ${level}`,
    tabClinicalConcepts: 'Clinical concepts',
    tabDeviceManagement: 'Device management',
    earAnatomyCaption: 'How sound travels to the cochlea.',
    markSeen: 'Mark as read',
    seenTag: '✓ Read',
    claimGuideXp: (xp: number): string => `+${xp} XP`,
    badgesTxt: (count: number): string => `${count} ${count === 1 ? 'badge' : 'badges'}`,
    backToCapsules: 'Back to capsules',
    signPreviewTitle: 'Fingerspelling handshapes',
    signPreviewSub: 'All 27 manual alphabet handshapes are included in the "Fingerspelling alphabet" capsule.',
    nextQuestion: 'Next question',
    seeResult: 'See result',
    exitQuiz: 'Exit',
    receptiveLang: 'Receptive Language (Comprehension)',
    expressiveLang: 'Expressive Language (Production / Speech)',

    schema: {
      earA11y: 'Diagram of the ear: pinna, ear canal, eardrum and cochlea.',
      earOuter: 'Outer',
      earMiddle: 'Middle',
      earCochlea: 'Cochlea',
      aidA11y: 'Diagram of a behind-the-ear hearing aid: body, tubing and earmold.',
      aidMic: 'Microphone',
      aidMold: 'Earmold',
      aidTube: 'Tubing',
      ciA11y: 'Diagram of a cochlear implant: external processor, magnet coil and electrode array in the cochlea.',
      ciProcessor: 'Processor',
      ciCoil: 'Coil / magnet',
      ciElectrodes: 'Electrodes',
      baA11y: 'Diagram of a bone-anchored implant: processor, abutment anchored to the bone and bone-conduction transmission.',
      baAbutment: 'Abutment (bone)',
      baProcessor: 'Processor',
      baBone: 'Bone conduction',
    },
  },
  sensory: {
    blockTag: 'SENSORY MODULE',
    blockTitle: 'Sensory Integration',
    blockSubtitle: 'Systematic desensitization, modulation and visual anticipation for everyday sounds.',
    xpTotal: (xp: number): string => `${xp} XP`,
    sessionsCount: (n: number): string => `${n} ${n === 1 ? 'session' : 'sessions'}`,
    clinicalNoticeTitle: 'Caregiver Control Wall & Clinical Safety',
    clinicalNoticeBody:
      'You configure sound intensity and duration. The child may pause or stop the activity at any time. Stopping is never a failure nor does it deduct progress.',
    activitiesHeader: 'SENSORY ACTIVITIES',
    pilotBadge: 'PILOT READY',
    inDevBadge: 'COMING SOON',
    availableTag: 'Available',
    inDevTag: 'In development',

    // Clinician's plan over the six activities (professional PIN).
    prescribedOf: (active: number, total: number): string => `${active} of ${total} prescribed`,
    notPrescribed: 'Not prescribed',
    pinSubtitle: 'Enter the clinician’s 4-digit PIN to choose which sensory activities the family practices.',
    proUnlocked: 'Professional mode unlocked.',
    savePrescription: 'Save plan',
    saveHelper: 'Your selection is saved on this device and editing locks again.',
    savedPrescription: (n: number): string => `Plan saved · ${n} sensory activities active.`,
    lockedHint: 'Family mode · only the clinician can change which sensory activities are practiced.',
    prescriptionEmpty: 'No activities prescribed. The clinician decides which ones are practiced.',
    completedTimes: (n: number): string => `Completed ${n} ${n === 1 ? 'time' : 'times'}`,

    isa01Title: 'My sound, my button',
    isa01Desc: 'Build agency, voluntary control, and predictability over sound exposure.',
    isa02Title: 'Sound traffic light',
    isa02Desc: 'Pair visual cues with stimulus onset and termination.',
    isa03Title: 'Sound detective',
    isa03Desc: 'Identify everyday sound sources without cognitive overload.',
    isa04Title: 'Near and far',
    isa04Desc: 'Explore distance and relative intensity under caregiver guidance.',
    isa05Title: 'Find the voice',
    isa05Desc: 'Practice gentle figure-ground discrimination in low background noise.',
    isa06Title: 'Living Everyday Environments',
    isa06Desc: 'Controlled simulation of classroom, shopping mall and lively street with traffic and construction.',

    catAll: 'All',
    catEcological: 'Living Environments (School, Mall, Street)',
    catAppliances: 'Household Appliances',
    catAlerts: 'Alerts & Nature',
    ecologicalBadge: 'SIMULATED LIVING ENVIRONMENT',

    adultGateTag: 'CAREGIVER CONTROL · SETUP',
    prepTitle: 'Session Preparation',
    prepSubtitle: 'Adjust parameters before handing the device to the child.',
    selectStimulusLabel: 'Acoustic stimulus or environment',
    selectCategoryLabel: 'Filter by environment type',
    intensityLabel: 'Relative sound intensity',
    intensityHint1: 'Level 1: Very gentle (sub-threshold filtered)',
    intensityHint2: 'Level 2: Soft (comfortable low volume)',
    intensityHint3: 'Level 3: Moderate (controlled ambient volume)',
    intensityHint4: 'Level 4: Standard (graduated natural sound)',
    intensityHint5: 'Level 5: Medium-high (ecological exposure)',
    durationLabel: 'Micro-exposure duration',
    tierMicro: 'Micro (3s)',
    tierShort: 'Short (7s)',
    tierMedium: 'Medium (15s)',
    tprStrategyTitle: 'Associated calming strategy (TPR)',
    startWithChildBtn: 'Start session with child',

    anticipationKicker: 'VISUAL ANTICIPATION',
    anticipationSub: 'Sound is about to start with no surprises.',

    exploringTag: 'CONTROLLED EXPLORATION',
    listeningNotice: 'Sound playing. Stay calm and listen.',
    pressToStartNotice: 'Tap the button when ready to listen.',
    noAudioNotice: 'This device is not playing the sound stimulus.',
    noAudioWarning:
      'This device cannot play the exercise sound. You can walk through the session, but there is NO auditory stimulus: do not use it as a real exposure.',
    luaQuietHint: 'Lúa accompanies quietly in calm stillness.',
    mySoundMyButton: 'My sound, my button',
    soundActiveBtn: 'Listening…',
    askPauseBtn: 'Ask for pause',
    stopActivityBtn: 'Stop',

    pausedTag: 'SAFE PAUSE',
    pausedTitle: 'Pause for regulation',
    pausedSubtitle: 'Pausing is completely safe and part of learning.',
    stoppingIsOkTitle: 'Self-regulation is a success',
    stoppingIsOkBody:
      'You decided to pause. Take a deep breath or practice the calming strategy before resuming.',
    tryThisStrategy: 'Suggested calming strategy:',
    resumeBtn: 'Resume sound',
    closeAndRateBtn: 'Finish & log session',

    sessionCloseTag: 'CAREGIVER CLINICAL LOG',
    sessionSummaryTitle: 'Session Evaluation',
    sessionSummarySub: 'The caregiver logs the child’s response. Participation always earns XP.',
    childResponseLabel: 'How did the child respond?',
    respCalm: 'Calm / Well-regulated',
    respAttentive: 'Attentive / Curious',
    respSensitive: 'Sensitive / Requested pause',
    respOverwhelmed: 'Discomfort / Early stop',
    tprAppliedToggle: 'Calming strategy (TPR) was practiced',
    saveSessionBtn: 'Save session and claim XP',

    wellDoneTitle: 'Session completed!',
    wellDoneSub: 'You successfully explored and regulated auditory listening.',
    xpAddedToSensorySilo: 'Added to Sensory Integration progress',
    backToSensoryListBtn: 'Back to sensory activities',
  },

  // Lúa's Magic Chalkboard · Handwriting, Tracing and Dyslexia Module
  writing: {
    kicker: 'LÚA’S MAGIC CHALKBOARD',
    title: 'Handwriting & Tracing',
    sub: 'Guided stylus tracing · Dyslexia & letter discrimination',
    tabCritical: 'Critical letters',
    tabWarmup: 'Loops',
    tabFree: 'Free board',
    hearModel: 'Hear the letter',
    clearCanvas: 'Clear board',
    toggleGuide: 'Montessori lines',
    checkStroke: 'Check stroke!',
    strokeCompleted: 'Perfect stroke!',
    strokeCompletedSub: 'You followed the direction and order accurately.',
    strokeAlmost: 'So close!',
    strokeAlmostSub: 'Follow the arrows and numbered waypoints in order.',
    strokeColor: 'Magic chalk color',
    strokeWidth: 'Stroke thickness',
    targetLetter: (l: string): string => `Trace the letter: ${l}`,
    targetWord: (w: string): string => `Write the word: ${w}`,
    targetLoop: 'Follow Lúa’s path without lifting the pen',
    nextExercise: 'Next stroke →',
    congratsTitle: 'Chalkboard complete!',
    congratsSub: 'You completed all strokes in the series with great skill.',


    colorTurquoise: 'Turquoise chalk',
    colorGold: 'Golden chalk',
    colorCoral: 'Coral chalk',
    colorSky: 'Sky blue chalk',
    colorViolet: 'Lavender chalk',
    widthFine: 'Fine stroke',
    widthMedium: 'Medium stroke',
    widthThick: 'Thick stroke',
  },

  luaHub: {
    title: 'Adventures with Lúa',
    subtitle: 'Language and communication activities by age',
    allAges: 'All',
    band02: '0–2 years',
    band23: '2–3 years',
    band34: '3–4 years',
    band45: '4–5 years',
    band57: '5–7 years',
    band710: '7–10 years',
    bandSubtitle02: 'Joint attention, imitation and early vocalizations',
    bandSubtitle23: 'Early vocabulary and phonology',
    bandSubtitle34: 'Instructions, pragmatics and gentle fluency',
    bandSubtitle45: 'Narrative, syntax and core concepts',
    bandSubtitle57: 'Phonological awareness and fluency strategies',
    bandSubtitle710: 'Abstract language, complex narrative and self-regulation',

    secAssessmentTitle: 'Interactive Question Bank',
    secAssessmentSub: '60 playful clinical assessment activities with non-punitive recasting.',
    secAssessmentBadge: (n: number): string => `${n} questions`,
    secStoriesTitle: 'Stories with Lúa',
    secStoriesSub: '10 illustrated stories with reading comprehension, key vocabulary and free drawing.',
    secStoriesBadge: (n: number): string => `${n} stories`,
    secSongsTitle: 'Songs and Praxias',
    secSongsSub: '10 songs with active movement breaks, rhythm and oral-motor practice.',
    secSongsBadge: (n: number): string => `${n} songs`,

    evalProgress: (curr: number, total: number): string => `Question ${curr} of ${total}`,
    evalClinicalSupport: 'Caregiver clinical guidance',
    evalAdultRecord: 'Adult observation',
    evalAdultRecordHint: 'Watch the child and mark what they did. This is not their choice.',
    activityFinish: 'Finish and earn a reward',
    activityDone: 'Activity complete! Lúa saw it too.',
    sectionEmptyForBand: 'Nothing in this section for this age yet.',
    gameBlankSlot: 'Blank slot',
    gameClue: (n: number): string => `Clue ${n}`,
    secGamesTitle: 'Games with Lúa',
    secGamesSub: 'Selection games: memory, image-word, initial sounds, sequences, sorting, attention and clues.',
    secGamesBadge: (n: number): string => `${n} games`,
    evalTargetReinforcement: 'Great answer!',
    evalRecastModel: 'Suggested modeling (recast)',
    evalAdultGuidance: 'Practical clinical tip',
    evalPlayAudio: 'Listen to question',
    evalNextQuestion: 'Next activity →',
    evalPrevQuestion: '← Previous',
    evalFinishBand: 'Complete series',
    evalBandCompletedTitle: 'Series completed!',
    evalBandCompletedSub: 'You completed all activities in this stage with Lúa.',
    evalBackToHub: 'Back to module',
    evalTryAgain: 'Repeat series',

    storyPages: (curr: number, total: number): string => `Page ${curr} of ${total}`,
    storyReadAloud: 'Read aloud',
    storyVocabTitle: 'Key vocabulary',
    storyQuestionsTitle: 'Comprehension questions',
    storyDrawingPrompt: 'Draw with Lúa',
    storyOpenDrawing: 'Open drawing canvas',

    songPlayTrack: 'Play song',
    songMotorInstructions: 'Movement instructions',
    songPraxiasTitle: 'Oral motor praxias',

    printableAges: (age: string): string => `Recommended age: ${age}`,
  },
};
