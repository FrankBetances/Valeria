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

  welcome: {
    tagline: 'Listening and language therapy at home, guided by you.',
    sub: 'You lead every exercise and score how your child responds. Valeria keeps track of the progress.',
    start: 'Get started',
    hasPatient: 'I already have a patient',
    trust: 'Data encrypted on this device · HIPAA / GDPR',
  },

  credits: {
    kicker: 'A project by',
    authorRole: 'Pediatric ENT specialist',
    collaborators: 'In collaboration with',
    acoprosDesc: 'Association for the Support and Advancement of the Deaf',
    quisqueyaDesc: 'Language rehabilitation',
    voiceCredit:
      'Neural voice in Spanish: "Sharvard" (Piper · rhasspy/piper-voices). '
      + 'In Galician: "Celtia" · Proxecto Nós. '
      + 'In Basque: HiTZ-TTS · ILENIA/NEL-GAITU (UPV/EHU · Aholab).',
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
    emptyBody: 'Add your first patient to start assigning therapy.',
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
    continueToPrescription: 'Continue to therapy plan →',
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
    title: 'Therapy plan',
    subtitle: 'Pick a block to practice or to assign',
    streak: (n: number): string => `${n}-day streak`,
    level: (n: number, name: string): string => `Level ${n} · ${name}`,
    sectionTraining: 'YOUR TRAINING',
    sectionBlocks: 'THERAPY BLOCKS',

    pairsTitle: 'Minimal Pairs',
    pairsSub: 'Speech sound errors: /r/, /s/ and more, with a voice game.',
    pairsA11y: 'Practice minimal pairs for speech sound errors',
    semanticTitle: 'Semantic Expansion',
    semanticSub: 'Everyday routines, vocabulary growth and contrasts with hands-on action.',
    semanticA11y: 'Practice semantic expansion and vocabulary growth',
    hearingTitle: 'Listening',
    hearingSub: 'Based on the ACOPROS protocol: sounds, vocabulary, phrases and social use, organized by age.',
    hearingA11y: 'Open listening therapy',
    languageTitle: 'Language',
    languageSub: 'Family protocol: joint attention, imitation, comprehension and more.',
    languageA11y: 'Open language therapy',
    autismTitle: 'Autism',
    autismSub: 'PRT + CBT: triangulated joint attention, communication repair and flexibility. Stressors are always caregiver-triggered.',
    autismA11y: 'Open the autism module',
    dyslexiaTitle: 'Dyslexia',
    dyslexiaSub: 'Phonological awareness, phoneme blending, nonwords and reversed-letter tracking (b/d, p/q).',
    dyslexiaA11y: 'Open the dyslexia module',
    arTitle: 'Augmented Reality',
    arSub: 'The camera watches the movement and the car, the dog or the apple reacts to it. Nothing is recorded and the mic stays off.',
    arA11y: (n: number): string => `Open the augmented reality block, ${n} exercises`,

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
      + 'breakdown, noise, distractor bear) is ALWAYS triggered by the grown-up from the '
      + 'Caregiver Panel, and is reversible instantly. The app never interrupts or adjusts '
      + 'anything on its own, and the clinical judgment is always yours and your SLP’s.',
    refDyslexia:
      'Phonological awareness and lexical access battery. Voice scoring respects the speech '
      + 'of each variety (in Dominican Spanish, seseo and aspirated /s/ NEVER count as errors) '
      + 'and the Nonword Screen stops after 5 trials with a rest break.',

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
      + 'frustration — that is the therapeutic goal, and it should be set by your SLP.',
    teaConsentItem1: '✋ You always trigger the stressor yourself, from the Caregiver Panel.',
    teaConsentItem2: '↩️ It reverses instantly: one tap and the app goes back to normal.',
    teaConsentItem3: '🚫 The app never interrupts, raises difficulty or diagnoses on its own.',
    teaConsentItem4: '🛑 If your child gets overwhelmed, stop: there is no quota to meet.',
    teaConsentAccept: 'I understand and accept',
    teaConsentAcceptA11y: 'Accept the framing and enter the autism module',
    teaConsentLater: 'Not now',

    levelNameByIndex: (i: number): string =>
      ['Bear Cub', 'Curious Bear', 'Brave Bear', 'Explorer Bear', 'Wise Bear', 'Great Bear', 'Legendary Bear'][i]
      ?? 'Legendary Bear',
  },

  auth: {
    title: 'Professional access',
    subtitleSignup: 'Create an account to store your patients and sessions in the cloud.',
    subtitleSignin: 'Sign in to reach your patients and sessions.',
    name: 'Name',
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
    title: 'Minimal Pairs',
    subtitlePick: 'Speech sound errors · the child asks for the word with their own voice',
    editingOn: 'Professional editing enabled',

    howKicker: '⚡ HOW IT WORKS',
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

  settings: {
    uiLangTitle: 'App language',
    uiLangHint:
      'Changes the menus and text that you read. The language of your child’s '
      + 'exercises is set separately, under "App voice".',
    uiLangAuto: 'Automatic',
    uiLangAutoHint: 'Follows the language of the exercises.',
    uiLangEs: 'Español',
    uiLangEn: 'English',
  },
};
