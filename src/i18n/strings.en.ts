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
    therapies: 'Therapies',
    academy: 'Academy',
    settings: 'Settings',
    therapiesA11y: 'Therapies. Exercise blocks to practise or prescribe.',
    academyA11y: 'Academy. Training for the caregiving adult.',
    settingsA11y: 'Settings. Reminders, voice, language and professional access.',
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
      + 'frustration — that is the therapeutic goal, and it should be set by your SLP.',
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

    badgeName: (id: string): string => ({
      primera: 'First paw print',
      ses10: 'Regular',
      ses25: 'Explorer',
      ses50: 'Valeria Master',
      ses100: 'Centurion',
      racha3: 'On fire',
      racha7: 'Perfect week',
      racha14: 'Unstoppable',
      racha30: 'A whole month',
      perfecta: 'Star session',
      perf5: 'Constellation',
      perf10: 'Milky Way',
      madrugadora: 'Early bird',
      nocturna: 'Night watch',
      finde: 'Weekend at home',
      maraton: 'Long yarn',
      regreso: 'I missed you',
      nivel10: 'Summit',
    }[id] ?? id),

    badgeDesc: (id: string): string => ({
      primera: 'Complete your first session.',
      ses10: 'Complete 10 sessions.',
      ses25: 'Complete 25 sessions.',
      ses50: 'Complete 50 sessions.',
      ses100: 'Complete 100 sessions.',
      racha3: 'Practise 3 days in a row.',
      racha7: 'Practise 7 days in a row.',
      racha14: 'Practise 14 days in a row.',
      racha30: 'Practise 30 days in a row.',
      perfecta: 'Score 3★ on every exercise of a session.',
      perf5: 'Complete 5 perfect sessions.',
      perf10: 'Complete 10 perfect sessions.',
      madrugadora: 'Practise before 10 in the morning.',
      nocturna: 'Practise after 8 in the evening.',
      finde: 'Practise on a Saturday or a Sunday.',
      maraton: 'Six or more exercises in a single session.',
      regreso: 'Come back after a week off.',
      nivel10: 'Reach level 10.',
    }[id] ?? ''),
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
    reviewSetup: '🧰 See setup',
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
  },

  // Exercise name, code, prompt (`read`), phrase, materials, alternative
  // proposals, the per-exercise EPT wording (`ex.ept`) and all round content
  // come from the active VARIETY's bank. What lives here is the scaffolding:
  // steps, the judge buttons, the scale explanation and the wrap-up.
  player: {
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
    sessionName: 'Therapy session',
    headerDone: 'Session Complete',
    headerPlaying: 'Therapy Session',
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
    launchPragmatic: '🎭 Trigger a pragmatic breakdown',
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
    notThisTime: '✖️ Not this time',
    skip: 'Skip this time',
    tprKicker: '🧩 TPR CAPSULE · LISTEN AND MOVE',
    tprSub: 'The app says the instruction out loud and the child responds with their body (Total Physical Response).',
    tprRepeat: '🔊 Repeat instruction',
    tprDoneLast: '✅ Done! Let’s go →',
    tprDone: '✅ They did it!',
    routeDoneLast: '✅ Did it · finish',
    routeDone: '✅ Did it',
  },

  pro: {
    unlockPill: 'Unlock professional editing',
    unlockedPill: 'Professional mode active',
    modalTitle: 'Professional Mode',
    pinError: 'Wrong PIN. Try again.',
    demoPin: 'Demo PIN: 1985',
    pinSubtitleDefault: 'Enter the clinician’s 4-digit PIN to edit the therapy plan.',
    shareCancelled: 'Export cancelled · the log is kept so you can retry.',
    shareFailed: 'Couldn’t open the share menu · the log is kept.',
    exportKicker: '🔓 PROFESSIONAL MODE · EXPORT',
    exportTitle: 'Usability evidence',
    exportSub: 'Scan the QR code for the offline summary, or share the full log when you have a connection.',
    qrCaption: 'Offline summary · scannable with the camera',
    shareLog: '📤 Share full log (email · WhatsApp)',
    packaging: 'Packaging log…',
    shareTitle: 'Usability log · Valeria+ (pilot)',
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
    evolutionSub: (n: number): string => `Average stars · last ${n} sessions`,
    trendUp: (d: number): string => `▲ +${d} ★`,
    trendDown: (d: number): string => `▼ ${d} ★`,
    trendStable: '= steady',

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
    arLabel: (id: string): string =>
      id === 'ar1' ? 'Lip-rounding hold' : id === 'ar2' ? 'Head-turn latency' : 'Fixation before choosing',
    arHint: (id: string): string =>
      id === 'ar1' ? 'Milliseconds the lip rounding was held in each trial. The dotted line is the target you set yourselves.'
        : id === 'ar2' ? 'Milliseconds between the sound and the head turn. Only trials that could be timed appear here.'
          : 'Milliseconds of sustained gaze before confirming the picture.',
    arTitle: (id: string): string =>
      id === 'ar1' ? 'AR-1 · Orofacial kinematics'
        : id === 'ar2' ? 'AR-2 · Sound localization'
          : 'AR-3 · Selection by fixation',
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
      { date: 'Jun 19', name: 'Therapy session', note: 'Excellent. Answered the prompts with almost no help.' },
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
      { title: '🎯 Small challenge, big step', body: 'One exercise now = a big step in their therapy.' },
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
        title: '🛁 Tip 4 · Routine is your best therapy',
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
    varietyA11y: (label: string, beta: boolean): string =>
      `${label} voice${beta ? ', in testing' : ''}`,

    chipChecking: 'Checking…',
    chipNatural: '✓ Natural voice',
    chipStandard: 'Standard voice',
    chipPoor: 'Voice can be improved',
    chipCeltia: '✓ Celtia voice',
    chipHitz: '✓ HiTZ ahotsa',
    chipPiperEn: '✓ Piper en_US',

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
    detailEnPending:
      'The English neural voice (Piper en_US) already ships with the app: tap “Test the voice” to hear '
      + 'it. The English exercises are still in clinical review, so for now the session keeps its '
      + 'content and voice in Spanish; what does change when you pick this variety is the language of '
      + 'the interface.',

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
    privChipLocal: 'On the phone',
    privChipNet: 'System service',
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
