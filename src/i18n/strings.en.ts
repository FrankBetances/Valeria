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
