// ============================================================================
// Valeria+ · Catàleg de cadenes d'INTERFÍCIE · Català (ca-ES)
//
// Tipat contra el catàleg base en castellà (src/i18n/strings.es.ts): qualsevol
// clau afegida allà i que manqui aquí trenca `npm run typecheck`. Això és
// deliberat — una cadena absent ha de trencar la compilació, mai aparèixer en
// blanc a la tauleta d'una família.
//
// Adaptació clínica i cultural segons la normativa de l'IEC, el TERMCAT i el
// registre de salut digital pediàtrica (HSJD / CLC):
//   · «persona cuidadora» / «adult acompanyant», mai «tutor» ni «pares».
//   · «infant» / «criatura», mai «menor» en context clínic general.
//   · «teràpia auditivoverbal» (junt sense guió).
//   · «audiòfon», «implant coclear», «hipoacúsia», «sordesa», «parells mínims».
//   · «ajustos» per a les preferències de l'app; «desar» per a guardar dades.
//   · Sentence case en tots els botons, títols i missatges d'interfície.
//   · Ela geminada correcta (l·l) i apostrofació normativa.
//
// Les cadenes LOCUTADES no viuen aquí (vegeu la capçalera de strings.es.ts).
// ============================================================================
import { UiStrings } from './strings.es';

export const CA: UiStrings = {
  common: {
    continue: 'Continuar',
    back: 'Enrere',
    cancel: 'Cancel·lar',
    save: 'Desar',
    close: 'Tancar',
    accept: 'D\'acord',
    loading: 'S\'està carregant…',
  },

  // [v11] Etiquetes de la barra de pestanyes inferior. Són etiquetes VISIBLES,
  // no pas noms de ruta interns (que indexen la telemetria històrica).
  tabs: {
    therapies: 'Exercicis',
    academy: 'Academy',
    settings: 'Ajustos',
    therapiesA11y: 'Exercicis. Blocs d\'exercicis per practicar o prescriure.',
    academyA11y: 'Academy. Formació per a l\'adult acompanyant.',
    settingsA11y: 'Ajustos. Recordatoris, veu, idioma i accés professional.',
  },

  welcome: {
    tagline: 'Entén el seu llenguatge, practica a casa. La Lúa us acompanya.',
    sub: 'Primer et formes, després practiqueu junts a casa. Valeria registra el progrés.',
    start: 'Començar',
    trust: 'Dades xifrades al dispositiu · RGPD / HIPAA',
  },
  luaIntro: {
    title: 'Coneix la Lúa',
    sub: 'La mascota física que us acompanya i anima en cada sessió de pràctica.',
    deviceAlt: 'La Lúa, la gata de Valeria, a la pantalla del seu aparell',
    request: 'Vull una Lúa',
    who: 'Qui practicarà avui?',
    newPatient: 'Pacient nou',
    newPatientSub: 'Crear una fitxa des de zero',
    existing: 'Ja tinc un pacient',
    existingSub: 'Obrir una fitxa de la llista',
  },

  credits: {
    kicker: 'Projecte desenvolupat per',
    authorRole: 'Otorrinolaringòleg infantil',
    collaborators: 'En col·laboració amb',
    acoprosDesc: 'Associació de Col·laboració i Promoció del Sord',
    quisqueyaDesc: 'Rehabilitació del llenguatge',
    recognition: 'Reconeixement',
    qualitySeal: 'Segell de Qualitat',
    qualitySealDesc: 'ITEMAS · Instituto de Salud Carlos III · 2024',
    voiceCredit:
      'Veu neuronal en castellà: «Sharvard» (Piper · rhasspy/piper-voices). '
      + 'En gallec: «Celtia» · Proxecto Nós. '
      + 'En basc: HiTZ-TTS · ILENIA/NEL-GAITU (UPV/EHU · Aholab). '
      + 'En anglès: «LJSpeech» (Piper · rhasspy/piper-voices, MIT), '
      + 'a partir d\'enregistraments de LibriVox en domini públic.',
    arCredit:
      'Realitat augmentada: seguiment facial amb MediaPipe Tasks (Google, Apache 2.0) '
      + 'i escena 3D amb Filament (Google, Apache 2.0), tots dos executant-se íntegrament '
      + 'al dispositiu. Models 3D generats per al projecte i alliberats en CC0.',
  },

  patientSelect: {
    title: 'Selecciona un pacient',
    subtitle: (n: number): string =>
      n === 0 ? 'Continua on ho vas deixar'
        : n === 1 ? '1 pacient registrat en aquest dispositiu'
          : `${n} pacients registrats en aquest dispositiu`,
    emptyTitle: 'Encara no hi ha pacients',
    emptyBody: 'Registra el teu primer pacient per començar a prescriure exercicis.',
    newPatient: 'Registrar un nou pacient',
    patientFallback: 'Pacient',
    noDiagnosis: 'Sense diagnòstic assignat',
    privacy: 'Pacients emmagatzemats i xifrats en aquest dispositiu.',
  },

  ficha: {
    title: 'Fitxa de registre',
    subtitle: 'Dades sociodemogràfiques del pacient',

    sectionChild: 'Infant',
    sectionCaregiver: 'Persona cuidadora',
    sectionDiagnosis: 'Diagnòstic i equip mèdic',

    fullName: 'Nom i cognoms',
    fullNamePlaceholder: 'Nom del pacient',
    birthDate: 'Data de naixement',
    birthDatePlaceholder: 'DD / MM / AAAA',
    recordNumber: 'NHC',
    recordNumberPlaceholder: 'HC-…',
    gender: 'Gènere',

    caregiverName: 'Nom complet',
    caregiverNamePlaceholder: 'Nom de la persona cuidadora',
    relationship: 'Vincle familiar',
    relationshipPlaceholder: 'Selecciona el vincle…',
    email: 'Correu electrònic',
    emailPlaceholder: 'cuidador@correu.com',
    phone: 'Telèfon / WhatsApp',
    phoneHint: 'S\'utilitzarà per enviar els informes clínics.',
    phonePlaceholder: 'Ex. 600 123 456',

    pathology: 'Patologia / diagnòstic',
    pathologyPlaceholder: 'Selecciona una patologia…',
    prescriber: 'Metge prescriptor (ORL / Pediatre)',
    prescriberPlaceholder: 'Dr./Dra. …',
    therapist: 'Logopeda assignat',
    therapistPlaceholder: 'Nom del logopeda',

    required: 'Aquest camp és obligatori.',
    invalidEmail: 'Introdueix un correu vàlid.',
    recordNumberRequired: 'El NHC és obligatori.',
    saved: 'Fitxa desada i xifrada al dispositiu.',
    save: 'Desar la fitxa',
    continueToAcademy: 'Comença per la formació →',
    footer: 'Emmagatzematge local xifrat (AES-256) · compleix RGPD / HIPAA.',

    genderLabel: (id: string): string =>
      id === 'Niña' ? 'Nena'
        : id === 'Niño' ? 'Nen'
          : id === 'Otro' ? 'Altre'
            : id,
    relationshipLabel: (id: string): string =>
      id === 'Madre' ? 'Mare'
        : id === 'Padre' ? 'Pare'
          : id === 'Tutor legal' ? 'Tutor/a legal'
            : id === 'Logopeda' ? 'Logopeda'
              : id,
    pathologyLabel: (id: string): string =>
      id === 'Hipoacusia con Implante Coclear' ? 'Hipoacúsia amb implant coclear'
        : id === 'Hipoacusia con Audífono' ? 'Hipoacúsia amb audiòfon'
          : id === 'Hipoacusia sin Audífono' ? 'Hipoacúsia sense audiòfon'
            : id === 'Trastorno Específico del Lenguaje' ? 'Trastorn del desenvolupament del llenguatge (TDL)'
              : id === 'Retraso Simple del Lenguaje' ? 'Retard simple del llenguatge'
                : id === 'Trastorno del Espectro Autista (TEA)' ? 'Trastorn de l\'espectre autista (TEA)'
                  : id === 'Dislalia' ? 'Dislàlia'
                    : id === 'Otros' ? 'Altres'
                      : id,
  },

  hub: {
    title: 'Selecció d\'Exercicis',
    subtitle: 'Tria un bloc per practicar o prescriure',
    streak: (n: number): string => `${n} ${n === 1 ? 'dia de ratxa' : 'dies de ratxa'}`,
    level: (n: number, name: string): string => `Nivell ${n} · ${name}`,
    sectionTraining: 'LA TEVA FORMACIÓ',
    sectionBlocks: 'BLOCS D\'EXERCICIS',

    pairsTitle: 'Parells Mínims',
    pairsSub: 'Dislàlies: rotacisme, sigmatisme i més amb joc de veu.',
    pairsBrief: 'Contrastos de so per a dislàlies.',
    pairsA11y: 'Practicar parells mínims per a dislàlies',
    semanticTitle: 'Expansió Semàntica',
    semanticSub: 'Escenaris diaris, progressió lèxica i contrastos amb acció física.',
    semanticBrief: 'Vocabulari i frases del dia a dia.',
    semanticA11y: 'Practicar expansió semàntica i progressió lèxica',
    hearingTitle: 'Audició',
    hearingSub: 'Inspirat en el protocol ACOPROS: sons, vocabulari, frases i ús social, organitzat per edats.',
    hearingBrief: 'Detectar, discriminar i reconèixer.',
    hearingA11y: 'Obrir exercicis d\'audició',
    languageTitle: 'Llenguatge',
    languageSub: 'Protocol familiar: atenció conjunta, imitació, comprensió i més.',
    languageBrief: 'Atenció conjunta i comprensió.',
    languageA11y: 'Obrir exercicis de llenguatge',
    autismTitle: 'TEA',
    autismSub: 'PRT + TCC: atenció conjunta triangulada, reparació comunicativa i flexibilitat. Estressors sempre manuals.',
    autismBrief: 'Pragmàtica i flexibilitat social.',
    autismA11y: 'Obrir exercicis del mòdul TEA',
    dyslexiaTitle: 'Dislèxia',
    dyslexiaSub: 'Consciència fonològica, síntesi fonèmica, pseudoparaules i rastreig de lletres girades (b/d, p/q).',
    dyslexiaBrief: 'Consciència fonològica i lectura.',
    dyslexiaA11y: 'Obrir exercicis del mòdul Dislèxia',
    arTitle: 'Realitat Augmentada',
    arSub: 'La càmera mira el gest i el cotxe, el gos o la poma reaccionen al moviment. Sense enregistrar res i amb el micròfon apagat.',
    arBrief: 'Gest i mirada amb la càmera.',
    arA11y: (n: number): string => `Obrir el bloc de realitat augmentada, ${n} exercicis`,
    sensoryTitle: 'Integració Sensorial',
    sensorySub: 'Desensibilització gradual, modulació i anticipació visual davant de sons quotidians.',
    sensoryBrief: 'Anticipació i tolerància a sons.',
    sensoryA11y: (n: number): string => `Obrir exercicis d'integració sensorial auditiva, ${n} activitats`,
    sensoryBadge: (n: number): string => `${n} activitats`,

    writingTitle: 'Grafomotricitat',
    writingSub: 'Traç guiat amb pauta Montessori i control de l\'ordre per evitar la inversió b / d.',
    writingBrief: 'Traç guiat i lletres crítiques.',
    writingA11y: (n: number): string => `Obrir la pissarra màgica de la Lúa, ${n} traços guiats`,
    writingBadge: (n: number): string => `${n} traços`,

    statStreakUnit: (n: number): string => (n === 1 ? 'dia de ratxa' : 'dies de ratxa'),
    pairsBadge: (n: number): string => `${n} parells`,
    semanticBadge: (n: number): string => `${n} escenaris`,
    therapiesBadge: (n: number): string => `${n} exercicis`,
    activeBadge: (n: number): string => `${n} actives`,

    remindersTitle: 'Recordatoris de sessió',
    remindersOff: 'Avisos a la pantalla de bloqueig per no perdre la ratxa. Tu tries en quines franges, d\'una a quatre.',
    remindersPickHint: 'Tria a sota les franges que vulguis.',
    remindersNone: 'Sense avisos: no arribarà cap notificació.',
    remindersSummary: (n: number, hours: string): string =>
      n === 1
        ? `1 avís al dia (${hours}) a la pantalla de bloqueig.`
        : `${n} avisos al dia (${hours}) a la pantalla de bloqueig.`,
    remindersOn: (summary: string): string => `Recordatoris activats: ${summary} 🔔`,
    remindersDisabled: 'Recordatoris desactivats.',
    remindersNoPermission: 'No s\'ha pogut activar: concedeix el permís de notificacions al sistema.',
    remindersNoSchedule: 'No s\'ha pogut programar: concedeix el permís de notificacions al sistema.',
    remindersNoSlots: 'Sense franges actives: recordatoris desactivats.',
    slotLabel: (id: string, hour: number): string => {
      const name = id === 'manana' ? 'Matí' : id === 'mediodia' ? 'Migdia' : id === 'tarde' ? 'Tarda' : 'Nit';
      return `${name} · ${hour}:00`;
    },
    slotHint: (id: string): string =>
      id === 'manana' ? 'Invitació a la sessió del dia.'
        : id === 'mediodia' ? 'Recordatori curt a mitja jornada.'
          : id === 'tarde' ? 'Última crida per no perdre la ratxa.'
            : 'Consell per a l\'adult, no pas avís de joc.',

    proAccessTitle: 'Accés Professional',
    proAccessSub: 'Exportar evidència d\'usabilitat del pilot (PIN del logopeda).',
    proAccessA11y: 'Accés professional: exportar evidència d\'usabilitat',
    proPinSubtitle: 'Introdueix el PIN del logopeda per exportar l\'evidència d\'usabilitat del pilot.',
    proUnlocked: 'Mode professional desbloquejat.',

    backToBlocks: 'Blocs',
    tabHearing: '👂 Audició',
    tabLanguage: '💬 Llenguatge',
    tabAutism: '🧠 TEA',
    tabDyslexia: '📖 Dislèxia',
    protocolHearing: 'PROTOCOL ACOPROS · AUDICIÓ',
    protocolLanguage: 'PROTOCOL FAMILIAR · LLENGUATGE',
    protocolAutism: 'PROTOCOL TEA · PRT + TCC',
    protocolDyslexia: 'PROTOCOL DISLÈXIA · FONOLOGIA I ACCÉS LÈXIC',

    editingOn: 'Edició professional habilitada',
    editingOff: 'Mode Família · només lectura',
    blockChip: (total: number, prescribed: number): string => `${total} exercicis · ${prescribed} prescrits`,
    fullSession: 'Sessió completa',
    fullSessionSub: (n: number): string => `Els ${n} exercicis prescrits seguits, amb pauses de moviment`,
    fullSessionA11y: (n: number): string => `Practicar els ${n} exercicis prescrits seguits`,
    prescribedCount: (n: number): string => `${n} prescrits`,
    practiceA11y: (name: string): string => `Practicar ${name}`,
    otherAges: 'Altres',

    refHearing:
      'Activitats inspirades en els materials de rehabilitació auditiva d\'ACOPROS '
      + '(Asociación Coruñesa de Promoción del Sordo), organitzades en 4 àrees: sons, '
      + 'vocabulari, frases i ús social. Les edats són orientatives: comença per les de '
      + 'l\'edat de l\'infant i deixa que el logopeda ajusti la prescripció.',
    refAutism:
      'Bateria PRT + TCC: l\'aplicació orquestra les contingències, però la càrrega (fallida '
      + 'pragmàtica, soroll, gata distractora) SEMPRE l\'acciona l\'adult des del Panell de l\'Adult i '
      + 'és reversible a l\'instant. L\'aplicació mai no interromp ni ajusta res per si sola, i '
      + 'el veredicte clínic és sempre teu i del vostre logopeda.',
    refDyslexia:
      'Bateria de consciència fonològica i accés lèxic. La validació per veu respecta la '
      + 'parla de cada varietat (en dominicà, el seseo o la essa aspirada MAI no compten '
      + 'com a error) i el garbellament de pseudoparaules talla en 5 assajos amb pausa de descàrrega.',

    protocolCardOpen: 'Veure la fitxa del protocol',
    protocolCardClose: 'Amagar la fitxa',
    notPrescribed: 'No prescrit',
    prescribedOf: (active: number, total: number): string => `${active} de ${total} prescrites`,
    savePrescription: 'Desar la Prescripció',
    savedPrescription: (n: number): string => `Prescripció desada · ${n} exercicis actius.`,
    saveHelper: 'La selecció es desa al dispositiu i l\'edició es bloqueja de nou.',
    lockedHint: 'Mode Família · només el logopeda pot modificar la prescripció.',

    teaConsentTitle: 'Abans de començar amb TEA',
    teaConsentBreak: 'Fallida Pragmàtica',
    teaConsentBody1: 'Aquest mòdul inclou la ',
    teaConsentBody2:
      ': un exercici en què TU congeles l\'aplicació a propòsit (una ordre absurda o un '
      + 'silenci) per observar com l\'infant repara la comunicació. Li pot generar una '
      + 'frustració breu i controlada — és l\'objectiu clínic, pautat pel vostre logopeda.',
    teaConsentItem1: '✋ L\'estressor el llances sempre tu, des del Panell de l\'Adult.',
    teaConsentItem2: '↩️ És reversible a l\'instant: un toc i l\'aplicació torna a la normalitat.',
    teaConsentItem3: '🚫 L\'aplicació mai no interromp, no apuja la dificultat ni diagnostica per si sola.',
    teaConsentItem4: '🛑 Si l\'infant es desborda, atura\'t: no hi ha cap mínim que s\'hagi de complir.',
    teaConsentAccept: 'Ho entenc i accepto l\'enfocament',
    teaConsentAcceptA11y: 'Acceptar l\'enfocament i entrar al mòdul TEA',
    teaConsentLater: 'Ara no',

    levelNameByIndex: (i: number): string =>
      ['Gateta', 'Gata Curiosa', 'Gata Juganera', 'Gata Valenta',
        'Gata Exploradora', 'Gata Saltarina', 'Gata Sàvia', 'Gata Sigil·losa',
        'Gata Estrella', 'Gran Gata', 'Gata Lunar', 'Gata Legendària'][i]
      ?? 'Gata Legendària',

    luaPurring: 'Ronsament!',
    luaEating: 'Que bo!',
    luaCraving: 'Té un caprici',
    luaPatShort: 'Acarona\'m',
    luaFeedFish: 'Donar peixet',
    luaFeedFishA11y: 'Donar peixet a la Lúa',
    luaPatA11y: 'Acaronar la gata Lúa',
    luaPatHintA11y: 'Toca per acaronar-la i veure com ronsa',
  },

  awards: {
    open: 'Premis',
    title: 'Els premis de la Lúa',
    subtitle: 'El que has aconseguit i el que et falta.',
    close: 'Tancar',
    levelLine: (n: number, name: string): string => `Nivell ${n} · ${name}`,
    xpToNext: (n: number): string => `${n} XP per al següent nivell`,
    xpTotal: (n: number): string => `${n} XP en total`,
    maxLevel: 'Nivell màxim assolit!',
    streakLine: (n: number): string => (n === 1 ? '1 dia de ratxa' : `${n} dies de ratxa`),
    streakNone: 'Comença avui la teva ratxa',
    collection: (won: number, total: number): string => `Insígnies · ${won} de ${total}`,
    levelTrack: 'Escala de nivells',
    lockedHint: 'Les insígnies en gris encara no s\'han aconseguit.',
    a11yOpen: 'Obrir la col·lecció de premis de la Lúa',
    badgeA11y: (name: string, won: boolean): string =>
      `${name}. ${won ? 'Aconseguida' : 'Encara no aconseguida'}.`,

    wardrobeTitle: 'L\'armari i premis de la Lúa',
    itemSlotHead: 'Cap',
    itemSlotNeck: 'Coll',
    itemSlotSnack: 'Premi',
    itemEquipped: 'Posat a la Lúa',
    itemEquipAction: 'Toca per posar',
    itemSnackAvailable: 'Disponible per premiar',
    itemA11y: (name: string, unlocked: boolean, equipped: boolean): string =>
      `${name}. ${unlocked ? (equipped ? 'Posat a la Lúa' : 'Toca per posar') : 'Bloquejat'}.`,

    itemName: (id: string): string => ({
      snack_fish: 'Peixet Saborós',
      neck_red_bow: 'Llacet Escarlata',
      head_flower: 'Flor Turquesa Valeria',
      neck_bell: 'Cascavell Brillant',
      head_wizard: 'Barret de Maga Estel·lar',
    }[id] ?? id),

    itemUnlockCondition: (id: string): string => ({
      snack_fish: 'Disponible des del principi',
      neck_red_bow: 'Completa 3 sessions d\'exercicis',
      head_flower: 'Arriba a una ratxa de 3 dies',
      neck_bell: 'Completa 10 sessions d\'exercicis',
      head_wizard: 'Arriba al Nivell 5 de la Lúa',
    }[id] ?? ''),

    badgeName: (id: string): string => ({
      primera: 'Primer pas de la Lúa',
      ses10: 'Passeig amic',
      ses25: 'Gran exploradora',
      ses50: 'Guia del sender',
      ses100: 'Pacte centenari',
      racha3: 'Cascavell sonor',
      racha7: 'Setmana cantadora',
      racha14: 'Melodia constant',
      racha30: 'Campana d\'or',
      perfecta: 'Oïda de linx',
      perf5: 'Radar màgic',
      perf10: 'Antena de cristall',
      madrugadora: 'Esmorzar sonor',
      nocturna: 'Conte de lluna',
      finde: 'Motxilla de cap de setmana',
      maraton: 'Cabdell d\'històries',
      regreso: 'Abraçada de benvinguda',
      nivel10: 'Reina del llenguatge',
    }[id] ?? id),

    badgeDesc: (id: string): string => ({
      primera: 'Completa la teva primera sessió amb la Lúa.',
      ses10: '10 sessions de camí plegats.',
      ses25: '25 sessions descobrint paraules.',
      ses50: '50 sessions: la Lúa sap el camí.',
      ses100: '100 sessions. Un vincle per sempre.',
      racha3: '3 dies seguits practicant.',
      racha7: '7 dies seguits practicant.',
      racha14: '14 dies seguits practicant.',
      racha30: '30 dies seguits practicant.',
      perfecta: 'Aconsegueix 3★ a tots els exercicis d\'una sessió.',
      perf5: 'Aconsegueix 5 sessions perfectes.',
      perf10: 'Aconsegueix 10 sessions perfectes.',
      madrugadora: 'Practica abans de les 10 del matí.',
      nocturna: 'Practica després de les 8 del vespre.',
      finde: 'Practica un dissabte o un diumenge.',
      maraton: 'Sis exercicis o més en una sola sessió.',
      regreso: 'Torna a practicar després d\'una setmana de pausa.',
      nivel10: 'Arriba al nivell 10 i a la seva corona.',
    }[id] ?? ''),
  },

  auth: {
    title: 'Accés professional',
    subtitleSignup: 'Crea el teu compte per desar els teus pacients i sessions al núvol.',
    subtitleSignin: 'Inicia la sessió per accedir als teus pacients i sessions.',
    name: 'Nom',
    namePlaceholder: 'El teu nom',
    emailPlaceholder: 'el-teu@correu.com',
    firebaseUnconfigured: '⚠︎ Firebase encara no està configurat (falten les claus del projecte). Vegeu docs/firebase-setup.md.',
    email: 'Correu electrònic',
    password: 'Contrasenya',
    passwordPlaceholder: 'Mínim 6 caràcters',
    signup: 'Crear compte',
    signin: 'Iniciar sessió',
    forgot: 'Has oblidat la contrasenya?',
    haveAccount: 'Ja tens compte?',
    noAccount: 'Encara no tens compte?',
    goSignin: 'Inicia la sessió',
    goSignup: 'Crea\'l aquí',
    missingFields: 'Escriu el teu correu i la contrasenya.',
    missingEmailForReset: 'Escriu el teu correu per enviar-te l\'enllaç de recuperació.',
    resetSent: 'T\'hem enviat un correu per restablir la contrasenya.',
    error: (code: string): string =>
      code === 'invalidEmail' ? 'El correu no té un format vàlid.'
        : code === 'missingPassword' ? 'Escriu la teva contrasenya.'
          : code === 'weakPassword' ? 'La contrasenya ha de tenir com a mínim 6 caràcters.'
            : code === 'emailInUse' ? 'Ja existeix un compte amb aquest correu.'
              : code === 'badCredentials' ? 'Correu o contrasenya incorrectes.'
                : code === 'tooManyRequests' ? 'Massa intents. Torna-ho a provar d\'aquí a uns minuts.'
                  : code === 'network' ? 'Sense connexió. Comprova la teva xarxa i torna-ho a provar.'
                    : code === 'notAllowed' ? 'L\'accés per correu i contrasenya no està habilitat al projecte.'
                      : 'No s\'ha pogut completar l\'operació. Torna-ho a provar.',
  },

  ling: {
    title: 'Test de Ling',
    titleDone: 'Test completat',
    subAsk: (name: string): string => `${name} · Comprovació auditiva`,
    subTest: (name: string): string => `${name} · 6 sons de Ling`,
    subDone: (name: string): string => `${name} · Resultat d'avui`,

    askTitle: 'Abans de començar',
    askQuestion1: 'El pacient utilitza ',
    askQuestionHearingAids: 'audiòfons',
    askQuestionOr: ' o ',
    askQuestionImplant: 'implant coclear',
    askQuestion2: '?',
    askSub: 'Si en fa servir, convé comprovar primer que avui hi sent bé amb el Test de Ling.',
    yesTitle: 'Sí, utilitza audiòfons / implant',
    yesSub: 'Fer el Test de Ling (6 sons)',
    noTitle: 'No',
    noSub: 'Anar directament als exercicis',

    instrKicker: 'EL TEU TORN, ADULT ACOMPANYANT',
    instrTitle: 'Tapa\'t la boca i produeix el so',
    stageLabel: 'PRODUEIX AQUEST SO',
    scaleTitle: 'Com ha respost?',
    scaleSub: 'Marca la resposta de l\'infant a aquest so',
    scaleIdentifies: 'Identifica',
    scaleIdentifiesDesc: 'Repeteix o reconeix el so correctament.',
    scaleDetects: 'Detecta',
    scaleDetectsDesc: 'Reacciona o aixeca la mà en sentir-lo.',
    scaleNoResponse: 'Sense resposta',
    scaleNoResponseDesc: 'No reacciona al so.',
    legendNoResponseShort: 'Sense resp.',

    resultGoodTitle: 'Hi sent amb claredat!',
    resultGoodSub: 'Ha identificat els 6 sons. L\'equip auditiu funciona bé avui.',
    resultGoodRec: 'Tot en ordre. Pots continuar amb els exercicis d\'audició amb normalitat.',
    resultCheckTitle: 'Revisar l\'equip',
    resultCheckSub: 'No ha reaccionat a algun so. Comprova piles, motlle i volum abans de continuar.',
    resultCheckRec: 'Revisa l\'audiòfon / implant (piles, connexió, programa) i repeteix el test. Si persisteix, consulta-ho amb l\'ORL.',
    resultDetectTitle: 'Detecta tots els sons',
    resultDetectSub: (ident: number, total: number): string =>
      `Ha detectat els ${total}, i n'ha identificat ${ident} de ${total}. Pot continuar amb la sessió.`,
    resultDetectRec: 'Reforça amb el suport de la persona cuidadora els sons més aguts (sh, s). Pots continuar amb els exercicis.',

    startExercises: 'Començar els exercicis →',
    repeat: 'Repetir el test',
    months: 'gen feb mar abr mai jun jul ago set oct nov des',
  },

  pairs: {
    sealA11y: (who: string): string =>
      `Petjada de ${who}. Premeu totes dues petjades alhora per continuar, o mantén premuda aquesta dos segons.`,
    pinSubtitle: 'Introdueix el PIN de 4 xifres del logopeda per triar quins parells practica la família.',
    sessionName: (a: string, b: string): string => `Parells mínims · ${a} / ${b}`,
    noteClean: (phoneme: string): string =>
      `Contrast ${phoneme} sense substitucions detectades. Fonema consolidant-se!`,
    noteSubs: (subs: number, total: number, corr: number, err: string): string =>
      `Substitució detectada en ${subs} de ${total} assajos; ${corr} amb correcció (${err}).`,
    doneClean: (phoneme: string): string =>
      `Cap substitució detectada en el contrast ${phoneme}. El fonema s'està consolidant!`,
    doneSubs: (subs: number, total: number): string =>
      `El micròfon ha detectat la substitució en ${subs} de ${total} assajos. És normal: cada correcció és pràctica del contrast.`,
    dialectSensitive: 'ABANS DE PUNTUAR AQUEST PARELL',
    dialectTransfer: 'ABANS DE PUNTUAR: INFANT BILINGÜE',
    dialectRegularIn: (v: string): string => `Tret regular a: ${v}.`,
    title: 'Parells Mínims',
    subtitlePick: 'Dislàlies fonològiques · l\'infant demana la paraula amb la veu',
    editingOn: 'Edició professional habilitada',

    howKicker: 'COM FUNCIONA',
    howBody:
      'Apareixen dues paraules gairebé iguals (rana / lana). L\'aplicació en demana una en veu alta, l\'infant '
      + 'la diu al micròfon i l\'aplicació detecta si ha sortit el fonema o la substitució habitual. '
      + 'Cada assaig acaba amb una missió física en parella i el segell doble: sense les mans '
      + 'de tots dos a la pantalla no s\'avança!',
    autoRecord: 'Enregistrament automàtic després de la consigna',
    autoRecordSub: 'Per defecte, apagat: el micròfon espera que premeu “Ja estic a punt”.',
    bankLabel: 'BANC DE CONTRASTOS',
    prescribedCount: (n: number): string => `${n} prescrits`,
    toggleA11y: (on: boolean, a: string, b: string): string => `${on ? 'Desactivar' : 'Activar'} el parell ${a} i ${b}`,
    practiceA11y: (a: string, b: string): string => `Practicar el parell ${a} i ${b}`,
    notPrescribedA11y: (a: string, b: string): string => `Parell ${a} i ${b} no prescrit`,
    savePrescription: 'Desar la Prescripció',
    saveHelper: 'La selecció es desa al dispositiu i l\'edició es bloqueja de nou.',
    lockedHint: 'Mode Família · només el logopeda pot canviar quins parells es practiquen.',

    appSpeaksSlow: 'L\'APLICACIÓ MODULA A ESPAI',
    appSpeaks: 'L\'APLICACIÓ DIU',
    stepSay: 'L\'aplicació està parlant… prepareu la veu.',
    stepReady: 'Prepareu la veu. Quan l\'infant estigui a punt, premeu el micròfon.',
    readyBtn: 'Ja estic a punt',
    readyBtnA11y: 'Ja estic a punt. Començar a escoltar.',
    repeatPrompt: 'Repetir la consigna',
    stepListen: 'Ara l\'infant! Diu la paraula al micròfon…',
    stopListening: 'Aturar · decideix l\'adult',
    stepJudge: 'L\'adult fa de jutge: què ha dit l\'infant?',
    saidWord: (w: string): string => `Ha dit “${w}”`,
    notUnderstood: 'No s\'ha entès · repetir la consigna',
    micNoteKicker: '👤 PER A L\'ADULT · EL MICRÒFON',

    successTitle: 'Fonema aconseguit!',
    heardBy: (w: string): string => `L'aplicació ha sentit: “${w}”`,
    adultVerdict: 'Veredicte de l\'adult.',
    missionCelebration: 'MISSIÓ FÍSICA DE CELEBRACIÓ',
    missionCorrective: 'MISSIÓ FÍSICA CORRECTIVA',
    sealSuccess: 'Missió feta: segelleu plegats per al següent assaig!',

    heardFoil: (w: string): string => `He sentit “${w}”… era l'altra paraula!`,
    almostTitle: 'Gairebé!',
    notHeardTitle: 'No t\'he sentit bé',
    cuePrefix: (cue: string): string => `Pista: ${cue}`,
    almostSub: 'S\'hi assembla molt. Escolteu el model a espai i un altre cop.',
    notHeardSub: 'Aquest intent no compta. Apropeu-vos al micròfon i repetim.',
    hearSlowModel: 'Sentir el model a espai',
    retryBtn: '🎤 Un altre cop!',

    assistTitle: 'Imitació plegats (1★)',
    assistSub: (w: string): string =>
      `L'adult diu “${w}” molt a espai tocant la galta de l'infant, i l'infant la repeteix `
      + 'alhora. Sense pressa: avui la practiquem, demà sortirà sola.',
    sealAssist: 'L\'heu dita plegats? Segelleu i continuem!',

    overrideLabel: 'L\'aplicació ha sentit malament? Corregeix tu:',
    overridePill: (w: string): string => `ha dit “${w}”`,

    doneTitle: 'Parell completat!',
    doneSessionTitle: 'Sessió de parells completada!',
    seeResults: 'Veure els Resultats →',
    repeatPair: 'Repetir aquest parell',
    otherPair: 'Triar un altre parell',

    swapKicker: '👑 ARA MANES TU!',
    swapTitle: 'L\'infant fa de jutge',
    swapListening: '👂 Escoltant l\'adult…',
    swapWhich: 'Quina ha dit l\'adult? Toca-la!',
    swapHit: '✅ Ha encertat!',
    swapMiss: '❌ Era l\'altra',
    swapContinue: 'Continuem amb la sessió →',
    swapSkip: 'Ometre aquesta vegada',
    swapIntro: 'L\'adult tria EN SECRET una de les dues paraules i la diu en veu alta, sense assenyalar.',
    swapIntroAsr: ' L\'aplicació també escoltarà per comprovar-ho.',
    swapSpeakNow: '🎤 Ara, en veu alta!',
    swapAlreadySaid: '🗣️ Ja l\'ha dita → continuar',
    subtitlePlay: 'Dislàlies fonològiques · l\'infant demana la paraula amb la veu',
    regionNote: ' · només varietats amb distinció s/z',
    streakChip: (n: number): string => (n === 1 ? 'dia de ratxa' : 'dies de ratxa'),

    sealKicker: '🤝 SEGELL DOBLE PER CONTINUAR',
    sealWhy:
      'Serveix perquè l\'exercici no continuï sol: fins que no poseu totes dues mans, l\'aplicació espera. '
      + 'Així tanqueu plegats cada intent i l\'adult no es queda mirant des de fora.',
    sealAdult: 'ADULT',
    sealChild: 'JO',
    sealPlus: 'alhora',
    sealHint: 'Qui acompanyi l\'infant. Només teniu una mà lliure? Mantén premuda una petjada 2 segons.',
  },

  semantic: {
    togglePrescribedA11y: (name: string, on: boolean): string => `${on ? 'Desactivar' : 'Activar'} ${name}`,
    pickRowA11y: (name: string, on: boolean): string => (on ? `Practicar ${name}` : `${name} no prescrit`),
    wordsOf: (available: number, total: number): string => `${available} de ${total} paraules`,
    backPillContinue: 'Continuar',
    backPillBack: 'Tornar',
    noMaterialHint: 'Aquesta activitat no necessita material: n\'hi ha prou amb les vostres mans i un lloc tranquil.',
    doneSessionSub: (n: number): string =>
      `${n} paraules treballades unint imatge, veu i acció física. La paraula s'aprèn quan l'infant la viu amb el cos, no només quan la sent.`,
    assistSub: (word: string): string =>
      `L'adult diu “${word}” molt a espai mirant l'infant, i ho repeteixen alhora. Sense pressa: avui la practiquem, demà sortirà sola.`,
    title: 'Expansió Semàntica',
    setupTitle: 'Preparació',
    doneTitle: 'Completat!',

    howKicker: 'COM FUNCIONA',
    howBody:
      'En prémer ▶ l\'aplicació ensenya una imatge i presenta la paraula en una frase curta abans de '
      + 'demanar-la («Això és el llit. Diu: llit.»). L\'infant la repeteix amb la veu i el micròfon '
      + 'valora l\'intent, acceptant les aproximacions pròpies de l\'edat. Cada paraula es '
      + 'tanca amb una acció física de l\'adult que l\'ancora al cos i a l\'entorn real.',
    autoRecord: 'Àudio i enregistrament automàtics',
    autoRecordSub: 'Per defecte, apagat: premeu per sentir el model i per enregistrar.',

    levelKicker: '📶 NIVELL MÀXIM DE DIFICULTAT',
    levelHint: 'Amb el límit a 1, la sessió només presenta les paraules més familiars de cada categoria.',
    difficultyLabel: (n: number): string =>
      n === 1 ? 'Nivell 1 · el més familiar'
        : n === 2 ? 'Nivell 2 · familiar'
          : 'Nivell 3 · menys freqüent',

    sectionScenarios: 'ESCENARIS DIARIS',
    sectionCategories: 'CATEGORIES LÈXIQUES',
    sectionSequences: 'PROGRESSIÓ LÈXICA',
    sectionCapsules: 'CÀPSULES DE CONTRAST',
    prescribedCount: (n: number): string => `${n} prescrites`,
    goalKicker: 'QUÈ ES TREBALLA AQUÍ',
    sectionGoal: (section: string): string =>
      section === 'scenario' ? 'Repetició verbal: l\'infant imita la paraula objectiu en situacions del dia a dia.'
        : section === 'category' ? 'Vocabulari nou per camp: es comença per les paraules més familiars i s\'avança cap a les menys freqüents.'
          : section === 'sequence' ? 'Vocabulari al voltant d\'un concepte: què és, què té, què fa i com és.'
            : 'Oposats: primer triar la imatge correcta i després dir la paraula.',
    phaseLabel: (kind: string): string =>
      kind === 'concepto' ? 'Pas 1 · Què és'
        : kind === 'parte' ? 'Pas 2 · Què té'
          : kind === 'accion' ? 'Pas 3 · Què fa'
            : 'Pas 4 · Com és',
    wordTypeLabel: (kind: string): string =>
      kind === 'sustantivo' ? 'Substantiu'
        : kind === 'verbo' ? 'Verb'
          : kind === 'adjetivo' ? 'Adjectiu'
            : 'Onomatopeia',
    wordCount: (n: number): string => `${n} paraules`,

    savePrescription: 'Desar la Prescripció',
    saveHelper: 'La selecció es desa al dispositiu i l\'edició es bloqueja de nou.',
    lockedHint: 'Mode Família · només el logopeda pot canviar quines activitats es practiquen.',
    pinSubtitle: 'Introdueix el PIN de 4 xifres del logopeda per triar quines activitats practica la família.',

    setupKicker: '🧰 MATERIAL QUE NECESSITEU',
    stepsKicker: (n: number): string => `🤝 QUÈ FAREU · ${n} ${n === 1 ? 'PAS' : 'PASSOS'}`,
    reviewSetup: 'Veure la preparació',
    reviewSetupA11y: 'Tornar a veure el material i la dinàmica',

    appSpeaksSlow: 'L\'APLICACIÓ MODULA A ESPAI',
    appSpeaks: 'L\'APLICACIÓ DIU',
    listen: 'Escoltar',
    listenA11y: 'Escoltar el model d\'aquest pas',
    stepSay: 'L\'aplicació està parlant… prepareu la veu.',
    stepReady: 'Prepareu la veu. Quan l\'infant estigui a punt, premeu el micròfon.',
    readyBtn: 'Ja estic a punt',
    readyBtnA11y: 'Ja estic a punt. Començar a escoltar.',
    tapImage: 'Toca la imatge correcta!',
    repeatQuestion: 'Repetir la pregunta',
    stepListen: 'Ara l\'infant! Diu la paraula al micròfon…',
    saidIt: 'Ho ha dit',
    saidItA11y: 'Ho ha dit bé, donar per vàlid',
    almost: 'Gairebé / un altre cop',
    almostA11y: 'Gairebé, tornar-ho a intentar',
    stopWithoutDeciding: 'Aturar sense decidir',
    stepJudge: 'L\'adult fa de jutge: ho ha intentat dir?',
    notUnderstood: 'No s\'ha entès · repetir la consigna',

    successTitle: 'Paraula aconseguida!',
    heardBy: (w: string): string => `L'aplicació ha sentit: “${w}”`,
    adultVerdict: 'Veredicte de l\'adult.',
    finish: '✅ Acabar!',
    nextStep: '✅ Fet! Següent →',
    notHeardTitle: 'No t\'he sentit bé',
    almostTitle: 'Gairebé!',
    hearSlowModel: 'Sentir el model a espai',
    retryBtn: '🎤 Un altre cop!',
    assistTitle: 'Imitació plegats (1★)',
    finishShort: 'Acabar!',
    saidTogether: 'L\'hem dita → continuar',

    doneSessionTitle: 'Sessió completada!',
    streakChip: (n: number): string => (n === 1 ? 'dia de ratxa' : 'dies de ratxa'),
    seeResults: 'Veure els Resultats →',
    repeatBlock: 'Repetir aquest bloc',
    otherBlock: 'Triar un altre bloc',
    subtitlePick: 'Progressió lèxica · del símbol al món real de l\'infant',
    editingOn: 'Edició professional habilitada',
    tabScenarios: 'Escenaris',
    tabCategories: 'Categories',
    tabSequences: 'Progressió',
    tabContrasts: 'Contrastos',
    kindScenario: 'Escenari',
    kindSequence: 'Progressió',
    kindContrast: 'Contrast',
    stepPoints: ' · l\'infant assenyala',
    setupBack: 'Tornar a la sessió',
    setupReady: 'Ja ho tinc tot',
    setupReadyA11y: 'Ja ho tinc tot, començar',
    notHeardSub: 'El micròfon no ha captat res, de manera que aquest intent no compta. Apropeu-vos una mica i proveu-ho una altra vegada.',
    almostSub: 'Escolteu el model a espai i proveu-ho una altra vegada.',
    actionKickerAdult: 'MISSIÓ FÍSICA DE L\'ADULT',
    actionKickerTpr: 'INSTRUCCIÓ TPR PER A L\'ADULT',
    actionKickerPair: 'ACCIÓ FÍSICA EN PARELLA',
    actionKickerSecond: 'ACCIÓ FÍSICA · SEGONA VOLTA',
    capsuleKickerAdj: 'CONTRAST D\'ADJECTIUS',
    capsuleKickerVerb: 'VERBS ANTÒNIMS',
    capsuleRound1: 'VOLTA 1 · COMPRENDRE',
    capsuleRound2: 'VOLTA 2 · DIR',
    capsuleVisualPrompt: (a: string, b: string): string => `Parell en contrast: ${a} / ${b}.`,
    capsuleKindAdj: 'Parell d\'adjectius',
    capsuleKindVerb: 'Verbs antònims',
    capsuleMeta: 'càpsula TPR · 2 voltes',
    rowScenarioA11y: (title: string): string => `escenari ${title}`,
    rowCategoryA11y: (title: string): string => `categoria ${title}`,
    rowSequenceA11y: (theme: string): string => `progressió ${theme}`,
    rowCapsuleA11y: (a: string, b: string): string => `càpsula de contrast ${a} i ${b}`,

    histNoteContrast: (kind: string, comp: string, nComp: number, prod: string, nProd: number): string =>
      `${kind}: comprensió ${comp}/3 en ${nComp} ${nComp === 1 ? 'volta' : 'voltes'} · producció ${prod}/3 en ${nProd}.`,
    histNoteWords: (kind: string, n: number): string =>
      `${kind}: ${n} paraules treballades unint símbol, veu i acció física.`,
  },

  player: {
    zoomTileA11y: (cap?: string): string => `Ampliar imatge de ${cap ?? 'la fitxa'}`,
    answerTileA11y: (cap: string): string => `Respondre ${cap}. Mantén premut per ampliar la imatge`,
    roundOf: (cur: number, total: number): string => `Ronda ${cur} de ${total}`,
    trialLimit: (max: number): string =>
      `Límit de ${max} assajos assolit: descarregueu amb la pausa de moviment i avalua a sota (o canvia de ronda).`,
    matchedTileA11y: (cap: string): string => `${cap}: ja unida amb la seva vocal`,
    pickTileA11y: (cap: string): string => `Triar la imatge de ${cap}`,
    tileChosen: 'triada',
    vowelA11y: (v: string): string => `Vocal ${v}`,
    fillMicPrompt: (word: string): string => `Quan completi la paraula, prem el micròfon i que digui: “${word}”`,
    seriesWordRevealedA11y: (n: number, cap: string): string => `Paraula ${n} de la sèrie: ${cap}`,
    seriesWordA11y: (n: number): string => `Respondre la paraula ${n} de la sèrie`,
    seriesWordMasked: (n: number): string => `paraula ${n}`,
    hearPhonemes: (phonemes: string): string => `Sentir els sons · ${phonemes}`,
    synthesisMicPrompt: (word: string): string =>
      `Prem el micròfon i que UNEIXI els sons en la paraula completa: “${word}”`,
    synthesisSolved: (word: string): string =>
      `La paraula era “${word}”. Pots passar a una altra ronda o avaluar a sota.`,
    letterOfA11y: (n: number, total: number): string => `Lletra ${n} de ${total}`,
    pictureOfA11y: (n: number, total: number): string => `Dibuix ${n} de ${total}`,
    restart: '↺ Tornar a començar',
    pluralCardA11y: (label: string): string => `Targeta amb ${label}`,
    pluralHowManyPrompt: (target: string): string =>
      `Pregunta-li «quants n'hi ha?» i prem el micròfon perquè digui: “${target}”`,
    pluralWhatArePrompt: (target: string): string =>
      `Pregunta-li «què són?» i prem el micròfon perquè digui: “${target}”`,
    orderTilePlacedA11y: (cap: string): string => `Fitxa ${cap}, ja col·locada`,
    orderTileA11y: (cap: string): string => `Fitxa ${cap}`,
    sceneA11y: (label: string): string => `${label}. Sentir un exemple`,
    selloHint: (sec: number): string =>
      `El botó es desbloqueja després de ${sec} segons d'espera. Prem-lo NOMÉS quan l'infant et miri de debò a tu (no pas a l'objecte); després es bloqueja per al següent intent.`,
    doneSub: (total: number): string => (total === 1
      ? 'Has avaluat aquest exercici. El resultat s\'ha desat al dispositiu.'
      : `Has avaluat les ${total} activitats del pla. El resultat s'ha desat al dispositiu.`),
    zoomClose: 'Toca per tancar',
    zoomCloseA11y: 'Tancar la imatge ampliada',
    zoomTip: 'Per ampliar una imatge: toca-la, o en els jocs mantén-la premuda',
    zoomIconA11y: 'Ampliar la icona',
    zoomFaceA11y: 'Ampliar la cara',

    adultOnlyKicker: 'NOMÉS PER A L\'ADULT',
    adultOnlyShow: 'Toca per veure quina paraula has de dir sense veu.',
    adultOnlyHide: 'Aparta la pantalla de l\'infant. Toca per tornar a amagar-la.',
    adultOnlyShowA11y: 'Veure la paraula que has de pronunciar, sense ensenyar la pantalla a l\'infant',
    adultOnlyHideA11y: 'Amagar la paraula que has de pronunciar',

    judgeSaidIt: 'Ho ha dit',
    judgeSaidItA11y: 'Jutge: ho ha dit bé',
    judgeAlmost: 'Gairebé',
    judgeAlmostA11y: 'Jutge: gairebé ho ha dit',
    judgeHint: 'El micròfon va lent o no l\'entén? Valora tu l\'intent:',

    materialsKicker: 'ABANS DE COMENÇAR · NECESSITARÀS',
    proposalsKicker: 'ALTRES MANERES DE FER-LA · ALTERNA ENTRE SESSIONS',
    step1Kicker: 'PAS 1 · CONSIGNA DE LA PERSONA CUIDADORA',
    step1Small: 'Aquest text és per a l\'adult: digues-l\'hi a l\'infant amb les teves paraules',
    listenPrompt: 'Escoltar la consigna',
    newRound: 'Una altra ronda',
    newRoundA11y: 'Canviar a una altra ronda amb contingut nou',
    step2: (label: string): string => `PAS 2 · ${label}`,
    levelLabel: (label: string): string => `NIVELL ${label.toUpperCase()}`,
    guidedActivity: 'Activitat guiada',
    hearWordSlow: 'Sentir la paraula a espai',
    modelNote: 'El millor model és la teva veu: digues-l\'hi tu primer, a prop i a espai. La veu de l\'aplicació és només un reforç.',
    trialKicker: (n: number, max: number): string => `JUTGE · ASSAIG ${n} DE ${max}`,
    trialHint: 'Si el micròfon falla o va lent, valora tu cada intent. En arribar al límit, l\'aplicació proposa una pausa de moviment per descarregar.',

    vowelHint: '1r Toca una imatge per sentir el seu nom · 2n Toca la vocal amb què comença',
    allMatched: '🎉 Totes unides! Pots passar a una altra ronda o avaluar a sota.',
    allFound: '🎉 Totes trobades! Pots passar a una altra ronda o avaluar a sota.',
    matrixDone: '🎉 Matriu completa! Pots passar a una altra ronda o avaluar a sota.',
    hearAllNames: 'Sentir tots els noms',
    hearFullWord: '1r Sentir la paraula completa',
    hearWords: 'Sentir les paraules',
    hearFullSeries: 'Sentir la sèrie completa',
    hearOptions: 'Sentir les opcions',
    hearSentence: '1r Sentir la frase',
    intruderHint: 'Només per l\'oïda: primer escolteu la sèrie completa; després l\'infant toca l\'altaveu de la paraula que no sona com les altres.',
    synthesisHint: 'L\'aplicació diu cada so per separat, amb una pausa entremig. L\'infant els uneix i diu la paraula completa.',
    synthesisA11y: 'Sentir els sons per separat',
    findAllOf: 'BUSCA TOTES LES',
    namedLabel: 'ANOMENATS',
    orderHint: 'En ordre de lectura (→): l\'infant ANOMENA el dibuix en veu alta i el toca. Tu persegueixes el seu dit amb el teu, com a fet i amagar.',
    startOver: '↺ Tornar a començar',
    sentenceRetry: 'Gairebé… torna a escoltar la frase i proveu-ho una altra vegada.',
    promptTextKicker: 'TEXT · POTS LLEGIR-LO TU EN VEU ALTA',
    hearExample: '🔊 Sentir exemple',

    selloKicker: '🤝 SEGELL DOBLE · INSTIGACIÓ RETARDADA',
    selloWait: (s: number): string => `⏳ Espera ${s} s…`,
    selloGive: '🤝 Donar el Segell Doble',
    selloGiveA11y: 'Donar el segell doble per contacte visual real',
    selloCount: (stars: string, n: number): string => `Segells per contacte visual: ${stars} (${n})`,
    breakNow: '⏸️ Interrompre ara (càpsula sorpresa)',
    breakNowA11y: 'Interrompre ara amb una càpsula de moviment sorpresa',

    step3Kicker: 'PAS 3 · VERSIÓ EN MOVIMENT',
    waitTxt: 'Espera i observa la resposta de l\'infant',

    step4Kicker: 'PAS 4 · AVALUACIÓ',
    scoreTitle: 'Com li ha sortit?',
    scoreSubRounds: 'Jugueu les rondes que vulgueu i toca la frase que millor descrigui la seva resposta',
    scoreSub: 'Toca la frase que millor descrigui la seva resposta',
    eptToggle: 'Què és l\'escala EPT-3?',
    eptToggleA11y: 'Què és l\'escala EPT-3',
    eptExplain:
      'L\'EPT-3 és l\'escala de 3 nivells amb què s\'anota com ha respost l\'infant en cada '
      + 'activitat: 1★ encara no ho aconsegueix, 2★ ho aconsegueix amb ajuda de l\'adult i 3★ ho '
      + 'aconsegueix tot sol. No és una nota: serveix perquè el logopeda vegi el progrés entre sessions.',
    nextUpKicker: 'A CONTINUACIÓ · ANUNCIA-L\'HI ABANS DE CANVIAR',

    doneTitle: 'Sessió completada!',
    streakChip: (n: number): string => (n === 1 ? 'dia de ratxa' : 'dies de ratxa'),
    streakExtended: 'Ratxa ampliada! Torna demà per no perdre-la.',
    levelChip: (n: number, name: string, up: boolean): string =>
      `Nivell ${n} · ${name}${up ? ' · HAS PUJAT DE NIVELL!' : ''}`,
    xpToNext: (n: number): string => `${n} XP per al següent nivell`,
    badgesTitle: 'ASSOLIMENTS DESBLOQUEJATS!',
    doneStatKicker: 'MITJANA DE LA SESSIÓ · ESCALA EPT-3 (D\'1★ A 3★)',
    seeResults: 'Veure els Resultats →',
    repeatSession: 'Repetir la sessió',
    sessionName: 'Sessió d\'exercicis',
    headerDone: 'Sessió Completada',
    headerPlaying: 'Sessió d\'Exercicis',
    noteGreat: 'Sessió molt fluida, gran resposta en les consignes.',
    noteGood: 'Bona sessió, alguna consigna ha costat però s\'ha mantingut atent.',
    noteHard: 'Sessió difícil avui, convé reforçar amb més suport de la persona cuidadora.',
    seriesSolved: '✅ Solució de la sèrie: aquestes eren les paraules que han sonat, en el mateix ordre.',
    seriesHint: '🔊 Cada targeta és una paraula de la sèrie, en l\'ordre en què sonen. Les paraules es veuen en respondre.',
    hearQuestion: 'Sentir la pregunta',
    roleQuestion: (role: string): string =>
      role === 'Sujeto' ? 'Qui?'
        : role === 'Verbo' ? 'Què fa?'
          : role === 'Objeto' ? 'Quina cosa?'
            : role,
    redirecting: (s: number): string => `Redirigint a resultats en ${s} s…`,
    prescribedPlan: (n: number): string => `Pla prescrit · ${n} exercicis`,
  },

  adult: {
    kicker: 'PANELL DE L\'ADULT · REPTE EXTRA',
    openA11y: 'Obrir el panell de l\'adult',
    closeA11y: 'Tancar el panell de l\'adult',
    distractorTitle: 'Gata distractora (doble tasca)',
    distractorSub: 'La gata treu el cap i es mou per la vora; l\'infant ha de continuar atenent a la veu. Tocar-la no compta com a error.',
    launchPragmatic: 'Llançar una fallida pragmàtica',
    hint: 'Controls manuals per entrenar l\'escolta en ambient real. Utilitza\'ls si el vostre logopeda us ho ha pautat: l\'aplicació mai no els activa ni els ajusta per si sola.',
    stepDownA11y: (label: string): string => `Abaixar ${label}`,
    stepUpA11y: (label: string): string => `Apuja ${label}`,
    arHint: 'El que s\'exigirà a l\'infant en cada exercici. Els fixes tu abans de començar i no canvien durant la sessió: l\'aplicació mesura i registra, el criteri clínic és sempre vostre.',
    arHoldLabel: 'Manteniment del gest (AR-1)',
    arHoldHint: 'Quant de temps ha de mantenir els llavis arrodonits perquè el cotxe arribi a la meta.',
    arTurnLabel: 'Gir de cap (AR-2)',
    arTurnHint: 'Quants graus ha de girar cap al so per comptar com a orientació.',
    arWindowLabel: 'Finestra de resposta (AR-2)',
    arWindowHint: 'Temps que se li dona després del so. Fora de finestra és «sense resposta», mai «error».',
    arDwellLabel: 'Fixació per triar (AR-3)',
    arDwellHint: 'Quant ha de mirar un dibuix per seleccionar-lo. L\'anell de progrés l\'hi ensenya.',
    gazePointerHint: 'L\'iris és més precís; el nas, més estable en telèfons modestos. Si el punter tremola, canvia a nas: l\'exercici no se n\'adona.',
    arKicker: '🎯 REALITAT AUGMENTADA · UMBRARS CLÍNICS',
    gazePointer: 'Punter de la mirada (AR-3)',
    pointerIris: 'Iris',
    pointerNose: 'Nas',
    pointerIrisA11y: 'Punter per iris',
    pointerNoseA11y: 'Punter per nas',
  },

  pragmatic: {
    kicker: 'FALLIDA PRAGMÀTICA · NOMÉS ADULTS',
    warnTitle: 'Aquesta tasca generarà frustració útil',
    warnBody:
      'Trencaràs la comunicació A PROPÒSIT per observar com el teu fill/a la repara. '
      + 'És normal (i valuós) que s\'estranyi, protesti o es frustri una mica: aquesta reacció '
      + 'ÉS l\'exercici. Fes-ho una sola vegada, amb calma, i acaba sempre amb una abraçada '
      + 'i l\'ordre ben dita.',
    closeLoopUpset:
      'Tanca ara la fallida: repeteix l\'ordre ben dita, valida l\'emoció («t\'he confós, '
      + 'oi?») i feu una abraçada. La reparació adulta també ensenya.',
    notToday: 'Avui no',
    understood: 'Entès, continuem',
    swapVariant: 'Prefereixo l\'altra variant →',
    didIt: 'Ja ho he fet · què ha fet l\'infant?',
    repairTitle: 'Com ha reparat la fallida?',
    repairBody: 'Tria el PRIMER que ha fet el teu fill/a. No hi ha respostes dolentes: totes informen.',
    recorded: 'Registrat',
    closeLoop: 'Tanca el cercle: repeteix l\'ordre ben dita i celebra la seva reacció. Reparar és una habilitat, i l\'acaba de practicar!',
    backToSession: 'Tornar a la sessió',
    stressorMurmurTitle: 'Murmuri',
    stressorMurmurText: 'Dona una ordre senzilla en veu MOLT baixa i poc clara, mirant cap a un altre costat. Exemple: “porta\'m el…” (inintel·ligible).',
    stressorAbsurdTitle: 'Ordre absurda',
    stressorAbsurdText: 'Demana una cosa impossible o sense sentit amb cara seriosa. Exemple: “Posa la sabata dins de la nevera” o “Dona\'m el núvol de la taula”.',
    repairAskLabel: 'Ha demanat repetició',
    repairAskDesc: '“Què?”, “un altre cop?”, s\'ha acostat a escoltar',
    repairRephraseLabel: 'Ha reformulat',
    repairRephraseDesc: 'Ha corregit o negociat l\'ordre absurda amb les seves paraules',
    repairGestureLabel: 'Ha utilitzat gestos',
    repairGestureDesc: 'Ha assenyalat, ha arronsat les espatlles, ha buscat la teva mirada',
    repairWithdrawLabel: 'S\'ha aïllat',
    repairWithdrawDesc: 'S\'ha retirat de la interacció o ha canviat d\'activitat',
    repairCryLabel: 'Plor',
    repairCryDesc: 'Desbordament emocional davant de la fallida',
    repairNoneLabel: 'No ha registrat la fallida',
    repairNoneDesc: 'Ha continuat com si l\'ordre hagués estat normal',
  },

  breaks: {
    routeKicker: '🏠 RUTA DE RUTINA · TPR 2.0',
    adultBanner: '👤 Panell de l\'adult · l\'infant NO toca la pantalla: escolta i actua amb objectes reals.',
    ready: '▶ Estem a punt',
    repeatOrder: '🔊 Repetir l\'ordre',
    repeatOrderA11y: 'Repetir l\'ordre en veu alta',
    structure: (focus: string): string => `Estructura: ${focus}`,
    notThisTime: '✖️ Aquest cop no',
    skip: 'Ometre aquesta vegada',
    tprKicker: '🧩 CÀPSULA TPR · ESCOLTA I MOU-TE',
    tprSub: 'L\'aplicació diu l\'ordre en veu alta i l\'infant respon amb el cos (Total Physical Response).',
    tprRepeat: '🔊 Repetir l\'ordre',
    tprDoneLast: '✅ Fet! Continuem →',
    tprDone: '✅ Ho ha fet!',
    routeDoneLast: '✅ Ho ha fet · acabar',
    routeDone: '✅ Ho ha fet',
    visualAnchorKicker: '👁️ DESCANS VISUAL · REGLA 20-20-20',
    visualAnchorTitle: 'Descans visual recomanat',
    visualAnchorBody: 'Porteu 20 minuts de pantalla a prop. La Lúa està a punt per a una pausa de 20 segons: que miri una cosa llunyana —una finestra, el fons de la sala— mentre la gata dorm.',
    visualAnchorStart: (n: number): string => `▶ Començar els ${n} segons`,
    visualAnchorRunning: (n: number): string => `Mirant lluny · ${n} s`,
    visualAnchorFarAway: 'Que continuï mirant el més lluny que hi hagi a la sala. La Lúa dorm fins que acabi.',
    visualAnchorResume: 'Reprendre ara',
    visualAnchorLater: 'Ara no',
    visualAnchorHint: 'La Lúa s\'adorm durant la pausa. La sessió no s\'atura.',
    visualAnchorFoot: 'Suggeriment · l\'aplicació no atura la sessió, la pausa la decideixes tu.',
  },

  pro: {
    unlockPill: 'Desbloquejar l\'Edició Professional',
    unlockedPill: 'Mode professional actiu',
    modalTitle: 'Mode Professional',
    pinError: 'PIN incorrecte. Torna-ho a provar.',
    demoPin: 'PIN de demostració: 1985',
    pinSubtitleDefault: 'Introdueix el PIN de 4 xifres del logopeda per editar la prescripció.',
    shareCancelled: 'Exportació cancel·lada · el registre es conserva per reintentar-ho.',
    shareFailed: 'No s\'ha pogut obrir el menú de compartir · el registre es conserva.',
    exportKicker: '🔓 MODE PROFESSIONAL · EXPORTACIÓ',
    exportTitle: 'Evidència d\'usabilitat',
    exportSub: 'Escaneja el QR per al resum fora de línia o comparteix el registre complet quan hi hagi connexió.',
    qrCaption: 'Resum fora de línia · escanejable amb la càmera',
    shareLog: '📤 Compartir el registre complet (correu · WhatsApp)',
    packaging: 'Empaquetant el registre…',
    shareTitle: 'Registre d\'usabilitat · Valeria+ (pilot)',
    exportPurged: 'Registre exportat i purgat del dispositiu.',
    statSessions: 'Sessions',
    statTprAbandon: 'Abandonament TPR',
    statMisclicks: 'Clics erronis',
    statSusMean: 'Mitjana SUS',
    statSusAnswers: 'Respostes SUS',
    statFullBlocks: '4 blocs',
  },

  sus: {
    kicker: '💬 UNA PREGUNTA RÀPIDA',
    question: 'Ha estat fàcil integrar aquest exercici en la rutina del meu fill/a.',
    scaleA11y: (v: number, label: string): string => `${v} de 5: ${label}`,
    thanks: 'Gràcies per ajudar-nos a millorar Valeria+!',
    sub: 'Toca la carona que millor ho descrigui. És anònim i només trigues un segon.',
    disagree: 'Gens d\'acord',
    agree: 'Molt d\'acord',
    neutral: 'Neutral',
    somewhat: 'Bastant',
    slightly: 'Poc',
  },

  results: {
    back: '‹ Tornar a exercicis',
    title: 'Resultats i Evolució',
    noPatient: 'Pacient sense fitxa registrada',
    recordNumber: (nhc: string): string => `NHC ${nhc}`,

    gameTitle: 'Motivació i assoliments',
    currentStreak: 'ratxa actual',
    totalXp: 'XP total',
    bestStreak: 'millor ratxa',
    level: (n: number, name: string): string => `Nivell ${n} · ${name}`,
    xpToNext: (n: number): string => `${n} XP per al següent nivell`,
    badgesLabel: (won: number, total: number): string => `INSÍGNIES · ${won}/${total}`,

    adherenceTitle: 'Adherència setmanal',
    adherenceLabel: 'Adherència de la setmana',
    adherenceValue: (done: number, goal: number): string => `${done} de ${goal} sessions completades`,

    evolutionTitle: 'Evolució per estrelles',
    pairsChartSub: 'Parells mínims · % d\'assajos amb la substitució detectada pel micròfon (baixar = millorar)',
    sessionsCount: (n: number): string => `${n} ${n === 1 ? 'sessió' : 'sessions'}`,
    arTargetMs: (ms: number): string => `objectiu ${ms} ms`,
    arMeasuredOn: (device: string, level: string, fps: number): string =>
      `Mesurat a ${device} · nivell ${level} · ${fps} fps sostinguts`,
    arVoidedTrials: (n: number): string =>
      ` · ${n} assaig${n === 1 ? '' : 'os'} anul·lat${n === 1 ? '' : 's'} per moviment del telèfon`,
    evolutionSub: (n: number): string => `Mitjana d'estrelles · últimes ${n} sessions`,
    trendUp: (d: number): string => `▲ +${d} ★`,
    trendDown: (d: number): string => `▼ ${d} ★`,
    trendStable: '= estable',

    speechTitle: 'Recompte del micròfon',
    speechSub: 'Quantes paraules de la frase demanada ha reconegut el micròfon. És un suport de l\'exercici, no pas una mesura.',
    speechWpu: 'paraules per frase',
    speechCoverage: 'de la frase demanada',
    speechUtterances: (n: number): string => (n === 1 ? 'frase practicada' : 'frases practicades'),
    speechNote:
      'Això NO és una mesura clínica ni té finalitat sanitària. És un suport de l\'exercici: serveix '
      + 'perquè l\'infant vegi per on va i perquè tu vegis quina paraula ha caigut. No avalua el '
      + 'llenguatge, no val per a un diagnòstic ni per a un informe, i no s\'ha d\'utilitzar per prendre '
      + 'cap decisió sobre el tractament. Qui valora com parla l\'infant ets tu, amb '
      + 'l\'escala EPT-3, igual que a la resta de l\'aplicació.',

    phonemeTitle: 'Substitució per fonema',
    pmFirstSession: 'primera sessió',
    pmImproving: (d: number): string => `▼ ${d} pp · millora`,
    pmWorsening: (d: number): string => `▲ +${d} pp · reforçar`,

    arNoTiming: 'S\'ha jugat sense cronometrar: calen altaveus externs per cable per mesurar els temps. Els encerts sí que han quedat registrats.',
    arNoTrials: 'Encara no hi ha assajos amb mesura en aquest exercici.',
    arTrials: 'assajos',
    arVoided: 'anul·lats',
    arMean: (unit: string): string => `mitjana (${unit})`,
    arMax: (unit: string): string => `màxim (${unit})`,
    arShareLine: (name: string, n: number, medida: string): string => `• ${name}: ${n} assajos · ${medida}`,
    arTrial1: 'assaig 1',
    arLabel: (id: string): string => {
      switch (id) {
        case 'ar1': return 'Manteniment del gest';
        case 'ar2': return 'Latència del gir';
        case 'ar3': return 'Fixació fins a triar';
        case 'ar4': return 'Cerca espacial de la Lúa';
        case 'ar5': return 'Latència de llançament';
        case 'ar6': return 'Manteniment de pràxia mímica';
        default: return 'Mesura AR';
      }
    },
    arHint: (id: string): string => {
      switch (id) {
        case 'ar1': return 'Milisegons que ha mantingut l\'arrodoniment labial en cada assaig. La línia de punts és l\'objectiu que heu fixat vosaltres.';
        case 'ar2': return 'Milisegons entre el so i el gir de cap. Només apareixen els assajos que s\'han pogut cronometrar.';
        case 'ar3': return 'Milisegons de mirada sostinguda fins a confirmar el dibuix.';
        case 'ar4': return 'Milisegons fins a localitzar la Lúa amb la retícula foveal i alinear la postura cefàlica.';
        case 'ar5': return 'Milisegons des que la Lúa demana el peix fins que l\'infant acaba el gest de llançar-lo.';
        case 'ar6': return 'Milisegons que ha sostingut l\'expressió o pràxia facial guiada amb simetria bilateral.';
        default: return 'Milisegons mesurats durant l\'exercici de realitat augmentada.';
      }
    },
    arTitle: (id: string): string => {
      switch (id) {
        case 'ar1': return 'AR-1 · Cinemàtica orofacial';
        case 'ar2': return 'AR-2 · Localització del so';
        case 'ar3': return 'AR-3 · Selecció per fixació';
        case 'ar4': return 'AR-4 · Cerca espacial de la Lúa';
        case 'ar5': return 'AR-5 · Alimentar la Lúa';
        case 'ar6': return 'AR-6 · Mirall mímic amb Buddy Lúa';
        default: return `AR · ${id.toUpperCase()}`;
      }
    },
    arTrialN: (n: number): string => `assaig ${n}`,

    historyLabel: 'HISTORIAL DE SESSIONS',
    historyCount: (n: number): string => `${n} registrades`,
    average: (v: string): string => `Mitjana: ${v} / 3`,
    understands: '👆 COMPRÈN',
    produces: '🗣 PRODUEIX',
    responsesKicker: '📝 RESPOSTES REGISTRADES',

    newSession: 'Iniciar nova sessió →',
    backGhost: '↩ Tornar a exercicis',
    sharePdf: '📄 Compartir PDF',
    footNote: 'Historial emmagatzemat únicament en aquest dispositiu (local-first).',
    shareTitle: 'Resultats Valeria+',
    demoHistory: (): Array<{ date: string; name: string; note: string }> => [
      { date: '10 juny', name: 'Associació vocal inicial', note: 'Li ha costat arrencar, però ha acabat associant les vocals amb suport.' },
      { date: '12 juny', name: 'Detecció de l\'intrús', note: 'Bona sessió, ha trobat l\'intrús després de la pregunta guia.' },
      { date: '15 juny', name: 'Reconeixement d\'emocions', note: 'Molt concentrat avui, ha anomenat gairebé totes les emocions.' },
      { date: '17 juny', name: 'Estructura S-V-O', note: 'Ha construït frases completes amb els daus, gran avanç.' },
      { date: '19 juny', name: 'Sessió d\'exercicis', note: 'Excel·lent. Ha respost a les consignes gairebé sense ajuda.' },
    ],
    shareHeader: 'VALERIA+ · Resultats i Evolució',
    shareAdherence: (pct: number, done: number, goal: number): string => `Adherència setmanal: ${pct}% (${done}/${goal})`,
    shareTrend: (trend: string): string => `Tendència: ${trend}`,
    shareHistory: 'Historial de sessions:',
    sharePm: 'Parells mínims · substitució per fonema:',
    shareAr: 'Realitat augmentada · magnituds mesurades:',
    shareFoot: 'Informe local-first generat al dispositiu.',
    shareSessionLine: (date: string, name: string, avg: string, stars: string, split: string, resp: string): string =>
      `• ${date} · ${name} — ${avg}/3 ${stars}${split}${resp}`,
    shareSplit: (comp: string, prod: string): string => ` [comprèn ${comp}/3 · produeix ${prod}/3]`,
    shareResponse: (code: string, text: string): string => `\n    · ${code} ha respost: “${text}”`,
    sharePmLine: (phoneme: string, pct: number, n: number): string =>
      `• ${phoneme}: ${pct}% de substitució a l'última sessió (${n} ${n === 1 ? 'sessió' : 'sessions'})`,
    shareArMeasure: (label: string, mean: number, unit: string, max: number, n: number): string =>
      `${label.toLowerCase()} mitjana ${mean} ${unit} (màx. ${max} ${unit}, n=${n})`,
    shareArNoTiming: 'sense mesura cronometrada',
    shareArVoided: (n: number): string => ` · ${n} anul·lats per moviment del telèfon`,
    shareDevice: (mk: string, model: string, level: string, fps: string): string =>
      `\n  Mesurat a ${mk} ${model} · nivell d'aptitud ${level} · ${fps} fps sostinguts`,
    shareThresholds: (hold: number, turn: number, win: number, dwell: number): string =>
      `\n  Umbrars fixats per l'adult: manteniment ${hold} ms · gir ${turn}° · finestra ${win} ms · fixació ${dwell} ms`,
  },

  notifications: {
    channelName: 'Recordatoris de sessió',
    messages: (): Array<{ title: string; body: string }> => [
      { title: '🧸 La gosseta Valeria t\'espera!', body: '5 minutets de joc valen or. Fem una sessió ràpida?' },
      { title: '🔥 No perdis la teva ratxa!', body: 'Una sessió al dia manté viva la flama. Som-hi a jugar!' },
      { title: '👂 Moment d\'escoltar', body: 'Provem el joc dels sons? Només calen uns minuts.' },
      { title: '⭐ Hora de guanyar estrelles', body: 'Cada exercici suma XP. A per les 3 estrelles!' },
      { title: '🐸 A saltar i aprendre!', body: 'Els jocs amb moviment són els favorits. Juguem?' },
      { title: '🎯 Petit repte, gran avanç', body: 'Un exercici ara = un gran pas en el seu llenguatge.' },
      { title: '🎉 Valeria té un joc nou!', body: 'Entra i descobreix la pausa activa d\'avui.' },
      { title: '💪 Constància = progrés', body: 'Les famílies que practiquen diàriament veuen el doble d\'avanç.' },
      { title: '🌈 Una estoneta plegats', body: 'Jugar, moure el cos i aprendre: tot en una sessió Valeria.' },
      { title: '🏆 El teu assoliment t\'espera', body: 'Ets a prop de desbloquejar una insígnia nova. Entra a aconseguir-la!' },
      { title: '🎵 Sents això?', body: 'És l\'hora del Test de Ling i dels jocs d\'audició.' },
      { title: '🧩 Última crida del dia', body: 'Encara ets a temps de sumar la sessió d\'avui. Ànims!' },
    ],
    parentTips: (): Array<{ title: string; body: string }> => [
      {
        title: '👀 Consell 1 · Els teus ulls i la teva boca són el seu mapa',
        body: 'Per aprendre a articular, el teu fill necessita veure com es fabriquen les paraules. Ajup-te al seu nivell, mira\'l als ulls i deixa que vegi la teva boca: el seu cervell és un mirall que copia els teus moviments. Si li parles des d\'una altra habitació, d\'esquena o mirant el mòbil, li treus el mapa visual que necessita per moure els llavis i la llengua.',
      },
      {
        title: '📵 Consell 2 · El parany de les pantalles educatives',
        body: 'Mòbils, tauletes i televisors no ensenyen a parlar, encara que el programa repeteixi números o colors. El llenguatge viu requereix torns: parlar, escoltar i respondre. Una pantalla no fa pauses per escoltar el teu fill, no li somriu quan ho intenta ni el corregeix amb afecte. Les hores de pràctica real només les hi pots donar tu.',
      },
      {
        title: '🤫 Consell 3 · La regla del silenci',
        body: 'Els adults parlem ràpid i omplim tots els silencis. Quan li ofereixis alguna cosa (per exemple, llet) i li preguntis "què vols?", fes una pausa i compta mentalment fins a cinc. Dona temps al seu cervell per processar i organitzar els músculs. Aquest silenci estratègic és el que l\'empeny a fer servir un so, un gest o una paraula.',
      },
      {
        title: '🛁 Consell 4 · La rutina és la teva millor aliada',
        body: 'No necessites una hora d\'exercicis ni materials costosos. El millor moment per al llenguatge és el que ja fas cada dia: mentre el banyes, anomena el sabó, l\'aigua i les parts del cos; mentre recolliu la roba, anomena els colors. Repetir paraules senzilles en situacions reals de la casa grava el vocabulari de manera definitiva.',
      },
      {
        title: '🐶 Consell 5 · Expandeix el que diu, sense renyar',
        body: 'Si assenyala un gos i diu "bup-bup", no li diguis "així no es diu": retorna-li la frase millorada, "sí, és un gos gran!". Si diu "aigua", respon-li "vols beure aigua". En expandir les seves paraules sense criticar-lo li dones el model correcte i li confirmes que el seu intent de comunicar-se ha estat reeixit i valorat.',
      },
    ],
  },

  voice: {
    listen: 'Escoltar',
    listenA11y: (text: string): string => `Escoltar: ${text}`,

    phaseListen: 'Escolta',
    phaseRepeat: 'Repeteix',
    phaseVerdict: 'Veredicte',
    phaseMission: 'Missió',
    currentPhase: (label: string): string => `Fase actual: ${label}`,

    micKicker: 'JOC DE VEU · ARA L\'INFANT!',
    micPrompt: (target: string): string => `Prem el micròfon i que digui: “${target}”`,
    micHearModel: 'Sentir el model',
    micStartA11y: 'Començar a escoltar',
    micStopA11y: 'Deixar d\'escoltar',
    micListening: 'Escoltant…',
    micTapToSpeak: 'Toca per parlar',
    micHeard: 'L\'aplicació ha sentit:',
    micUnavailable:
      'El joc de micròfon s\'activa a l\'aplicació instal·lada (APK). Mentrestant, '
      + 'l\'infant pot repetir la paraula i tu valores a sota.',
    micVerdicts: [
      { icon: '👂', title: 'Un altre cop plegats', sub: 'Escolteu la paraula a espai i repetid alhora.' },
      { icon: '💪', title: 'Gairebé!', sub: 'S\'hi assembla molt. Repetiu el model i proveu-ho una altra vegada.' },
      { icon: '🎉', title: 'Ho ha dit genial!', sub: 'L\'aplicació ha entès la paraula objectiu.' },
    ],

    micCoverage: (hits: number, total: number): string =>
      `${hits} de ${total} paraules de la frase`,

    sentenceCardsKicker: 'LÀMINES DE LA FRASE',
    sentenceCardsProgress: (hits: number, total: number): string => `${hits} de ${total} paraules`,
    sentenceWordMatched: (word: string): string => `Paraula aconseguida: ${word}`,
    sentenceWordPending: (word: string): string => `Paraula pendent: ${word}`,

    captureKicker: '📝 REGISTRA LA SEVA RESPOSTA',
    capturePrompt: 'Enregistra amb el micròfon o escriu el que ha dit l\'infant.',
    capturePlaceholder: 'Escriu aquí el que ha dit…',
    captureWriteA11y: 'Escriure la resposta de l\'infant',
    captureRecordA11y: 'Enregistrar la resposta amb el micròfon',
    captureStopA11y: 'Deixar d\'enregistrar',
    captureListening: 'Escoltant… parla ara',
    captureOk: '✓ Resposta registrada: es desarà amb la sessió a Resultats.',

    cardTitle: 'Veu de l\'aplicació',
    varietyLabel: 'Varietat de la veu',
    localeEs: 'Castellano',
    localeGl: 'Galego',
    localeEsDO: 'Dominicano',
    localeEu: 'Euskara',
    localeEnUS: 'English (US)',
    localeCa: 'Català',
    varietyA11y: (label: string, beta: boolean): string =>
      `Veu en ${label}${beta ? ', en proves' : ''}`,

    chipChecking: 'Comprovant…',
    chipNatural: '✓ Veu natural',
    chipStandard: 'Veu estàndard',
    chipPoor: 'Veu millorable',
    chipCeltia: '✓ Veu Celtia',
    chipHitz: '✓ HiTZ ahotsa',
    chipPiperEn: '✓ Piper en_US',
    chipMatxaCa: '✓ Veu Matxa (AINA)',

    detailSearching: 'Cercant la millor veu en espanyol instal·lada en aquest dispositiu…',
    detailNoVoice:
      'No hi ha cap veu en espanyol instal·lada: l\'aplicació no podrà llegir les consignes fins a descarregar-la.',
    detailDo: (name: string): string =>
      `En dominicà l'aplicació utilitza la veu llatina del dispositiu${name ? ` («${name}»)` : ''} i el micròfon `
      + 'en es-DO. Si sona peninsular o robòtica, instal·la una veu d\'Espanyol (Llatinoamèrica).',
    detailGood: (name: string): string =>
      `L'aplicació utilitzarà la millor veu del dispositiu${name ? ` («${name}»)` : ''}. Sona natural, no pas robòtica.`,
    detailAndroidPoor:
      'Aquest dispositiu només ofereix una veu senzilla i pot sonar robòtica. Instal·la les veus de '
      + 'Google (de franc i fora de línia) perquè l\'aplicació soni natural.',
    detailIosPoor:
      'Pots millorar la veu a Ajustos → Accessibilitat → Contingut llegit → Veus → Espanyol, '
      + 'descarregant la veu millorada.',
    detailEn:
      'La veu neuronal en anglès (Piper en_US) viatja dins de l\'aplicació i funciona fora de línia: toca '
      + '«Provar la veu» per escoltar-la. Els exercicis tenen banc propi i guia dialectal signada: no '
      + 'es marquen com a error els trets de l\'anglès afroamericà ni els del parlant bilingüe. En '
      + 'triar aquesta varietat canvien la locució, el micròfon i l\'idioma de la interfície.',

    testVoice: '▶ Provar la veu',
    testVoiceA11y: 'Provar com sona la veu',
    installGoogle: '⬇️ Instal·lar veus de Google',
    installGoogleA11y: 'Instal·lar les veus de Google',
    recheck: '🔄 Tornar a comprovar',
    recheckA11y: 'Tornar a comprovar la veu',
    installHint:
      'Després d\'instal·lar: Ajustos → Sistema → Sortida de text a veu → tria «Motor de veu de Google» i '
      + 'descarrega la veu d\'Espanyol (Espanya). Després torna aquí i toca «Tornar a comprovar».',

    privCapture:
      '⏺ CAPTURA DE CORPUS ACTIVA. Aquesta versió desa al dispositiu l\'àudio del torn de parla. '
      + 'No és una versió de producció: no s\'ha d\'utilitzar en una sessió normal ni quedar-se a l\'aparell '
      + 'd\'una família.',
    privKicker: 'MICRÒFON DE L\'EXERCICI',
    privChecking: 'Comprovant on es processa la veu de l\'infant en aquesta varietat…',
    privLocal: (label: string): string =>
      `En ${label} el reconeixement es fa dins del telèfon: l'àudio del torn de parla no surt `
      + 'del dispositiu.',
    privLocalFailed: (label: string): string =>
      `El paquet de ${label} figura instal·lat, però en escoltar de debò el reconeixedor del telèfon `
      + 'no ha arrencat. Per no deixar l\'exercici trencat, l\'aplicació ha tornat al servei de reconeixement '
      + 'del sistema, que pot enviar l\'àudio als seus servidors. Toca «Tornar a comprovar» per '
      + 'intentar-ho una altra vegada en local.',
    privNotCapable: (label: string): string =>
      `Aquest dispositiu no sap reconèixer veu fora de línia, de manera que en ${label} l'àudio del torn de `
      + 'parla el processa el servei de reconeixement del sistema, que pot enviar-lo als seus servidors.',
    privNoService: (label: string): string =>
      `Aquest dispositiu no exposa cap servei de reconeixement de veu, de manera que en ${label} el joc `
      + 'de micròfon no pot funcionar. Comprova a Ajustos que el reconeixement de veu del sistema '
      + 'estigui instal·lat i activat.',
    privCanDownload: (label: string): string =>
      `Aquest mòbil pot reconèixer fora de línia, però li falta el paquet de ${label}. Mentrestant, `
      + 'l\'àudio del torn de parla el processa el servei del sistema, que pot enviar-lo als seus servidors.',
    privNoDownload: (label: string): string =>
      `Falta el paquet de ${label} i aquesta versió d'Android no permet descarregar-lo des de l'aplicació. Pots `
      + 'instal·lar-lo a Ajustos → Sistema → Idiomes → Entrada per veu; fins aleshores l\'àudio el processa '
      + 'el servei del sistema.',
    privOffer: (label: string): string =>
      `Si descarregues el paquet de ${label}, la veu de l'infant deixa de sortir del telèfon. Ocupa espai i es `
      + 'descarrega una sola vegada; els exercicis funcionen igual si prefereixes no fer-ho.',
    privDownload: '⬇️ Descarregar el paquet',
    privDownloadA11y: (label: string): string =>
      `Descarregar el paquet de reconeixement de veu en ${label}`,
    privNotNow: 'Ara no',
    privNotNowA11y: 'No descarregar el paquet de veu',
    privRecheckA11y: 'Tornar a comprovar on es reconeix la veu',
    privNoteOk: '✓ Paquet descarregat. A partir d\'ara la veu es reconeix dins del telèfon.',
    privNoteDialog:
      'S\'ha obert la pantalla de descàrrega del sistema. Quan acabi, toca «Tornar a comprovar».',
    privNoteCancelled: 'Descàrrega cancel·lada. Es continua utilitzant el reconeixement del sistema.',
    privNoteFailed:
      'No s\'ha pogut demanar la descàrrega en aquest dispositiu. Pots fer-ho des d\'Ajustos → Sistema → '
      + 'Idiomes → Entrada per veu.',
    privNoteDeclined: 'Cap problema: els exercicis funcionen igual amb el reconeixement del sistema.',
    privLastListen: (local: boolean): string =>
      `Última escolta d'aquesta sessió: ${local ? 'al telèfon' : 'servei del sistema'}.`,
    privRecognizer: (name: string): string => `Reconeixedor del sistema: ${name}.`,
  },

  noise: {
    kicker: 'SOROLL DE FONS (BABBLE)',
    off: 'apagat',
    levelTag: (n: number): string => `nivell ${n}`,
    hint: 'Només ho controles tu: apuja el murmuri de cafeteria a poc a poc si el teu logopeda t\'ho ha indicat. L\'aplicació mai no el canvia per si sola.',
    sliderA11y: 'Nivell de soroll de fons',
    silence: 'Silenci',
    cafe: 'Cafeteria',
  },

  settings: {
    uiLangTitle: 'Idioma de l\'aplicació',
    uiLangHint:
      'Canvia l\'aplicació sencera: els menús que llegeixes tu i també el que sona en '
      + 'els exercicis. Si vols la interfície en un idioma i els exercicis en un '
      + 'altre, canvia-la després a «Veu de l\'aplicació».',
    uiLangAuto: 'Automàtic',
    uiLangAutoHint: 'Segueix l\'idioma dels exercicis.',
    uiLangEs: 'Español',
    uiLangEn: 'English',
    uiLangCa: 'Català',
  },

  ar: {
    title: 'Realitat Augmentada',
    subPreparing: 'Preparant la sessió',
    subUnsupported: 'No disponible en aquest dispositiu',
    subConsent: 'Abans d\'encendre la càmera',
    subWarmup: 'Escalfament amb la Lúa',
    subNotApt: 'Aquest telèfon no és apte per a aquests jocs',
    subLevel: (label: string): string => `Nivell d'aquest telèfon: ${label}`,
    sessionDone: 'Sessió acabada',
    oneMoment: 'Un moment…',

    busyMeasuring: 'Mesurant aquest telèfon… (uns 90 segons)',
    busyCalibrating: 'Jugarem a seguir la Lúa per les cantonades (15 segons)…',
    busyOpeningCamera: 'Obrint la càmera…',

    noticeAptitudeFailed: 'No s\'ha pogut completar la prova en aquest telèfon. Pots intentar-ho de nou.',
    noticeCalibrationFailed: 'La calibració no s\'ha completat. Col·loca el telèfon recolzat, en horitzontal, a un pam i mig de la cara i prova-ho una altra vegada.',
    noticeLaunchFailed: 'L\'exercici no s\'ha arribat a obrir. Comprova que l\'aplicació té permís de càmera.',
    noticeDenied: 'Sense permís de càmera no hi ha exercicis de Realitat Augmentada. La resta de l\'aplicació funciona igual.',
    noticeTimeout: 'L\'exercici s\'ha tancat perquè la càmera ha deixat de veure la cara de l\'infant. Recolza el telèfon en horitzontal, a un pam i mig de la seva cara i a l\'alçada dels seus ulls, i prova-ho una altra vegada.',

    unsupportedTitle: 'Aquí no es pot jugar encara',
    unsupportedBody: 'Aquests exercicis necessiten la càmera frontal i una versió de l\'aplicació instal·lada al telèfon (no funcionen a la vista prèvia d\'Expo Go). Els altres sis blocs d\'exercicis funcionen exactament igual de bé.',

    consentTitle: 'Què fa la càmera en aquests jocs',
    consentLead1: 'En aquest bloc la càmera frontal no enregistra: ',
    consentLeadStrong: 'mira',
    consentLead2: '. Serveix per saber si l\'infant arrodoneix els llavis, gira el cap cap a un so o mira un dibuix, i perquè el cotxe, el gos o la poma reaccionin a aquest gest.',
    consentNoRecordStrong: 'No s\'enregistra ni es desa cap imatge.',
    consentNoRecord: ' Cada fotograma s\'analitza i es descarta a l\'instant.',
    consentNoUploadStrong: 'Cap vídeo no surt del telèfon.',
    consentNoUpload: ' Tot l\'anàlisi passa aquí dins, sense internet.',
    consentNoFaceIdStrong: 'No es reconeix la cara de ningú.',
    consentNoFaceId: ' Només es mesuren gestos: graus, milisegons i proporcions.',
    consentMicOffPre: 'En dos dels tres exercicis el ',
    consentMicOffStrong: 'micròfon està apagat',
    consentMicOffPost: ': es premia l\'esforç motor abans de demanar que parli.',
    consentRevoke: 'Pots sortir en qualsevol moment i retirar aquest permís des dels ajustos d\'Android.',
    consentAccept: 'Ho entenc i ho accepto',
    consentAcceptA11y: 'Acceptar l\'ús de la càmera i continuar',
    consentDecline: 'Ara no',

    warmupTitle: 'Un joc d\'escalfament d\'un minut i mig',
    warmupBody1a: 'Cada telèfon és diferent i aquests exercicis exigeixen bastant. Abans de començar, l\'aplicació fa una prova curta —mirar la Lúa, seguir-la a les cantonades, escoltar dos sons— per saber què pot oferir ',
    warmupBody1Strong: 'en aquest telèfon concret',
    warmupBody1b: '. Es fa una sola vegada.',
    warmupBody2a: 'Recolza el telèfon en un llibre o una caixa, en ',
    warmupBody2Strong: 'horitzontal',
    warmupBody2b: ', a un pam i mig de la cara de l\'infant (uns 30-35 cm), i deixa\'l quiet.',
    warmupStart: 'Començar l\'escalfament',
    warmupStartA11y: 'Començar l\'escalfament',
    warmupRedo: 'Repetir l\'escalfament',
    warmupRedoA11y: 'Repetir l\'escalfament d\'aquest telèfon',

    notAptTitle: 'Val més no forçar-ho',
    notAptBody: 'No és una errada teva ni de l\'infant: la càmera i els dibuixos en 3D alhora demanen més del que aquest aparell pot sostenir, i un exercici a batzegades no mesura res.',
    notAptBack: 'Tornar als blocs',

    levelLabel: (level: string): string => ({
      A: 'Instrument', B: 'Clínic', C: 'Reduït', D: 'No apte',
    }[level] ?? level),
    levelNote: (level: string): string => ({
      A: 'Aquest telèfon mesura amb precisió suficient: tots tres exercicis estan disponibles i la sessió pot entrar a l\'estudi.',
      B: 'Els exercicis funcionen bé, però el rellotge de la càmera o la sortida d\'àudio no permeten cronometrar el gir: la localització del so es juga sense registrar temps.',
      C: 'El punter d\'aquest telèfon és massa inestable per a tres dianes: la selecció per mirada va amb dues, que és una elecció forçada perfectament vàlida.',
      D: 'Aquest telèfon no sosté la càmera i l\'escena 3D alhora. El bloc de Realitat Augmentada no apareix; els altres sis funcionen igual de bé.',
    }[level] ?? ''),
    levelHeading: (maker: string, model: string, level: string, label: string): string =>
      `${maker} ${model} · nivell ${level} (${label})`,

    shareProfile: 'Compartir la fitxa del telèfon',
    shareProfileA11y: 'Compartir la fitxa tècnica d\'aquest telèfon',
    shareTitle: 'Valeria+ · fitxa d\'aptitud del telèfon',
    shareHeader: 'VALERIA+ · Cens de dispositius (bloc de Realitat Augmentada)',
    shareMaker: 'Fabricant', shareModel: 'Model', shareOs: 'Sistema',
    shareLevel: 'NIVELL D\'APTITUD',
    shareFps: 'fps sostinguts (p5)', shareThermal: 'Caiguda tèrmica',
    shareTimestamps: 'Marques de temps de càmera', shareJitter: 'Jitter d\'àudio',
    shareJitterNone: 'sense mesurar (sense muntatge)',
    sharePointer: 'RMS del punter', shareImu: 'IMU disponible',
    shareYes: 'sí', shareNo: 'no',
    shareScreen: 'Pantalla', shareSeparation: 'Separació assolible amb 3 dianes',
    shareFooter: (date: string): string =>
      `Mesurat el ${date}. Sense dades de l'infant: és la fitxa de l'aparell.`,

    exercisesKicker: 'EXERCICIS DISPONIBLES',
    practiceA11y: (name: string): string => `Practicar ${name}`,
    unavailableA11y: (name: string): string => `${name}: no disponible en aquest telèfon`,
    flagGameOnly: 'Es juga, però sense cronometrar el gir: cal un muntatge d\'altaveus.',
    flagTwoTargets: 'Amb dos dibuixos a la pantalla: en aquest telèfon tres quedarien massa junts.',
    flagUnavailable: 'No disponible en aquest telèfon.',

    liveSignals: 'Veure els senyals en viu',
    liveSignalsA11y: 'Veure els senyals en viu, eina per a la logopeda',
    liveSignalsSub: 'Per a la logopeda: distància, graus de gir, obertura de llavis i fotogrames per segon, en brut. Sense reforç i sense registrar res.',

    setupTitle: 'Com col·locar el telèfon',
    setupBody: 'Recolzat en un llibre, una caixa o contra la paret, en horitzontal, a un pam i mig de la cara. La pantalla avisa en verd quan la posició és bona. Si el telèfon es mou durant un assaig, aquest assaig s\'anul·la: és preferible perdre\'l que apuntar-lo malament.',

    measuredTitle: 'El que s\'ha mesurat',
    mdrNote: 'Aquestes són dades en brut, no una valoració. L\'aplicació mesura i anota; qui interpreta si això és molt o poc per al vostre infant és la vostra logopeda.',
    backToExercises: 'Tornar als exercicis',
    streakLine: (days: number, level: number, levelName: string): string =>
      `${days} ${days === 1 ? 'dia' : 'dies'} de ratxa · Nivell ${level} · ${levelName}`,

    rowTrials: 'Assajos jugats',
    rowVoided: 'Assajos anul·lats (el telèfon s\'ha mogut)',
    rowHoldMax: 'Manteniment més llarg',
    rowHoldMean: 'Manteniment mitjà',
    rowHoldTarget: 'Objectiu fixat per vosaltres',
    rowCatchTrials: 'Assajos sense so (control)',
    rowTimedTurns: 'Girs mesurats amb rellotge',
    rowTimedTurnsNone: 'cap: es va jugar sense cronòmetre',
    rowLatencyMedian: 'Latència mediana del gir',
    rowTargets: 'Dianes a la pantalla',
    rowDwellMean: 'Fixació mitjana fins a triar',
    rowAcquisitionMean: 'Temps mitjà de cerca espacial',
    rowJitterRms: 'Estabilitat angular (Jitter RMS)',
    rowThrowVelocityMean: 'Velocitat mitjana de llançament',
    rowThrowLatency: 'Latència mitjana de llançament',
    rowAimDeviation: 'Desviació mitjana de punteria',
    rowMimicHoldMean: 'Manteniment mitjà de pràxia',
    rowSymmetryMean: 'Simetria bilateral mitjana',
  },

  academy: {
    back: '‹ Tornar',
    backA11y: 'Tornar al hub d\'Academy',
    headerTitle: 'Academy',
    headerSub: 'Entén què li passa a la teva criatura i com acompanyar-la, en càpsules de dos minuts.',
    langFallbackNotice: 'Les càpsules de formació encara no estan en català: les llegeixes en castellà. La resta de l\'app i tots els exercicis sí que són en català.',
    progressTxt: (completed: number, total: number, pct: number): string => `${completed}/${total} · ${pct}%`,
    xpTxt: (xp: number): string => `${xp} XP`,
    hubCardTag: 'PER A TU',
    hubCardSub: 'Entén el trastorn abans d\'exercitar-lo: Llenguatge, Hipoacúsia, Dislàlies, Dislèxia i TEA.',
    hubCardComplete: 'Formació completada',
    hubCardProgress: (completed: number, total: number, pct: number): string => `${completed}/${total} unitats · ${pct}%`,
    hubCardA11y: (completed: number, total: number): string => `Valeria Academy: formació per a persones cuidadores. ${completed} de ${total} càpsules completades.`,
    priorityKicker: 'LA TEVA PRIORITAT D\'AVUI',
    priorityA11y: (title: string, domain: string): string => `Prioritat suggerida: ${title}. Domini ${domain}.`,
    whyKicker: 'PER QUÈ AQUESTA CÀPSULA?',
    readTime: (min: number): string => `${min} min de lectura`,
    startCapsule: 'Començar la càpsula',
    domainsKicker: 'DOMINIS FORMATIUS',
    domainCardA11y: (label: string, completed: number, total: number, level: string): string => `${label}. ${completed} de ${total} completades. Nivell ${level}.`,
    comingSoon: 'Properament',
    slideOf: (cur: number, total: number): string => `Diapositiva ${cur} de ${total}`,
    nextSlide: 'Següent',
    takeQuiz: 'Fer el qüestionari',
    quizKicker: 'MICRO-QÜESTIONARI · COMPROVACIÓ',
    quizSub: 'Respon a aquestes preguntes per fixar el que has après.',
    questionOf: (cur: number, total: number): string => `Pregunta ${cur} de ${total}`,
    passedTitle: 'Càpsula superada!',
    failedTitle: 'Gairebé ho tens',
    scoreSub: (pct: number): string => `Has encertat el ${pct}% de les preguntes.`,
    passRequirement: (threshold: number): string => `Necessites almenys el ${threshold}% per superar-la. Repassa i torna-ho a intentar!`,
    claimXp: (xp: number): string => `Reclamar +${xp} XP`,
    reviewAndRetry: 'Repassar i reintentar',
    close: 'Tancar',
    closeA11y: 'Tancar la finestra d\'Academy',
    badgesKicker: 'INSÍGNIES DEL DOMINI',
    noBadgesYet: 'Completa càpsules per desbloquejar insígnies.',
    capsulesKicker: 'CÀPSULES DISPONIBLES',
    completedTag: 'COMPLETADA',
    perfectTag: '100% PERFECTE',
    deviceGuideTitle: 'Hipoacúsia / Sordesa',
    deviceGuideProgress: (completed: number, total: number, pct: number, level: string): string => `${completed}/${total} guies · ${pct}% · ${level}`,
    tabClinicalConcepts: 'Conceptes clínics',
    tabDeviceManagement: 'Gestió de dispositius',
    earAnatomyCaption: 'Com viatja el so fins a la còclea.',
    markSeen: 'Marcar com a vista',
    seenTag: '✓ Vista',
    claimGuideXp: (xp: number): string => `+${xp} XP`,
    badgesTxt: (count: number): string => `${count} ${count === 1 ? 'insígnia' : 'insígnies'}`,
    backToCapsules: 'Tornar a les càpsules',
    signPreviewTitle: 'Configuracions de mà dibuixades',
    signPreviewSub: 'Les 27 lletres de l\'alfabet dactilològic són a la càpsula «L\'alfabet dactilològic».',
    nextQuestion: 'Següent pregunta',
    seeResult: 'Veure el resultat',
    exitQuiz: 'Sortir',
    receptiveLang: 'Llenguatge Receptiu (Comprensió)',
    expressiveLang: 'Llenguatge Expressiu (Producció / Parla)',

    schema: {
      earA11y: 'Esquema de l\'oïda: pavelló auricular, conducte auditiu, timpà i còclea.',
      earOuter: 'Extern',
      earMiddle: 'Mitjà',
      earCochlea: 'Còclea',
      aidA11y: 'Esquema d\'un audiòfon retroauricular: cos, tub i motlle.',
      aidMic: 'Micròfon',
      aidMold: 'Motlle',
      aidTube: 'Tub',
      ciA11y: 'Esquema d\'un implant coclear: processador extern, antena amb imant i elèctrodes a la còclea.',
      ciProcessor: 'Processador',
      ciCoil: 'Antena / imant',
      ciElectrodes: 'Elèctrodes',
      baA11y: 'Esquema d\'un implant osteointegrat: processador, pilar ancorat a l\'os i transmissió per via òssia.',
      baAbutment: 'Pilar (os)',
      baProcessor: 'Processador',
      baBone: 'Via òssia',
    },
  },

  sensory: {
    blockTag: 'MÒDUL SENSORIAL',
    blockTitle: 'Integració Sensorial',
    blockSubtitle: 'Desensibilització sistemàtica, modulació i anticipació visual davant de sons quotidians.',
    xpTotal: (xp: number): string => `${xp} XP`,
    sessionsCount: (n: number): string => `${n} ${n === 1 ? 'sessió' : 'sessions'}`,
    clinicalNoticeTitle: 'Mur de Control Adult i Seguretat Clínica',
    clinicalNoticeBody:
      'Tu configures la intensitat i la durada. L\'infant pot demanar una pausa o aturar l\'exercici en qualsevol moment. Aturar-se mai no és una errada ni resta progrés.',
    activitiesHeader: 'ACTIVITATS SENSORIALS',
    pilotBadge: 'PILOT FUNCIONAL',
    inDevBadge: 'PROPERAMENT',
    availableTag: 'Disponible',
    inDevTag: 'En desenvolupament',

    prescribedOf: (active: number, total: number): string => `${active} de ${total} prescrites`,
    notPrescribed: 'No prescrita',
    pinSubtitle: 'Introdueix el PIN de 4 xifres del logopeda per triar quines activitats sensorials practica la família.',
    proUnlocked: 'Mode professional desbloquejat.',
    savePrescription: 'Desar la Prescripció',
    saveHelper: 'La selecció es desa al dispositiu i l\'edició es bloqueja de nou.',
    savedPrescription: (n: number): string => `Prescripció desada · ${n} activitats sensorials actives.`,
    lockedHint: 'Mode Família · només el logopeda pot canviar quines activitats sensorials es practiquen.',
    prescriptionEmpty: 'Sense activitats prescrites. El logopeda decideix quines es practiquen.',
    completedTimes: (n: number): string => `Completada ${n} ${n === 1 ? 'vegada' : 'vegades'}`,

    isa01Title: 'El meu so, el meu botó',
    isa01Desc: 'Construir control, agència i predictibilitat sobre l\'estímul sonor.',
    isa02Title: 'Semàfor de sons',
    isa02Desc: 'Associar senyal visual, inici i fi de l\'estímul.',
    isa03Title: 'Detectiu de sons',
    isa03Desc: 'Identificar sons quotidians sense sobrecàrrega.',
    isa04Title: 'A prop i lluny',
    isa04Desc: 'Explorar distància i intensitat sota control adult.',
    isa05Title: 'Troba la veu',
    isa05Desc: 'Pràctica de figura-fons simple amb soroll suau.',
    isa06Title: 'Ambients vius quotidians',
    isa06Desc: 'Simulació controlada d\'aula escolar, centre comercial i carrer amb trànsit i obres.',

    catAll: 'Tots',
    catEcological: 'Ambients vius (Escola, Súper, Carrer)',
    catAppliances: 'Electrodomèstics',
    catAlerts: 'Alertes i Natura',
    ecologicalBadge: 'AMBIENT VIU SIMULAT',

    adultGateTag: 'CONTROL ADULT · CONFIGURACIÓ',
    prepTitle: 'Preparació de la Sessió',
    prepSubtitle: 'Ajusta els paràmetres abans de cedir el dispositiu.',
    selectStimulusLabel: 'Estímul o ambient acústic',
    selectCategoryLabel: 'Filtrar per tipus d\'entorn',
    intensityLabel: 'Intensitat sonora relativa',
    intensityHint1: 'Nivell 1: Molt suau (filtratge subllindar)',
    intensityHint2: 'Nivell 2: Suau (volum baix confortable)',
    intensityHint3: 'Nivell 3: Mitjana (volum ambient controlat)',
    intensityHint4: 'Nivell 4: Moderada (estímul natural graduat)',
    intensityHint5: 'Nivell 5: Mitjana-alta (acostament ecològic)',
    durationLabel: 'Durada de la microexposició',
    tierMicro: 'Micro (3 s)',
    tierShort: 'Curta (7 s)',
    tierMedium: 'Mitjana (15 s)',
    tprStrategyTitle: 'Estratègia de regulació associada (TPR)',
    startWithChildBtn: 'Iniciar la sessió amb l\'infant',

    anticipationKicker: 'ANTICIPACIÓ VISUAL',
    anticipationSub: 'El so començarà sense sorpreses.',

    exploringTag: 'EXPLORACIÓ CONTROLADA',
    listeningNotice: 'So en reproducció. Mantén la calma.',
    pressToStartNotice: 'Toca el botó quan estiguis a punt per escoltar.',
    noAudioNotice: 'Aquest dispositiu no reprodueix l\'estímul sonor.',
    noAudioWarning:
      'Aquest dispositiu no pot reproduir el so de l\'exercici. La sessió es pot recórrer, però NO hi ha estímul auditiu: no la facis servir com a exposició real.',
    luaQuietHint: 'La Lúa acompanya en silenci i tranquil·litat.',
    mySoundMyButton: 'El meu so, el meu botó',
    soundActiveBtn: 'Escoltant…',
    askPauseBtn: 'Demanar pausa',
    stopActivityBtn: 'Aturar',

    pausedTag: 'PAUSA SEGURA',
    pausedTitle: 'Pausa per regular-se',
    pausedSubtitle: 'Aturar-se està bé i és part de l\'aprenentatge.',
    stoppingIsOkTitle: 'L\'autoregulació és un èxit',
    stoppingIsOkBody:
      'Has decidit fer una pausa. Respira a fons o realitza l\'estratègia de calma abans de continuar.',
    tryThisStrategy: 'Estratègia de calma suggerida:',
    resumeBtn: 'Reprendre el so',
    closeAndRateBtn: 'Finalitzar i registrar',

    sessionCloseTag: 'REGISTRE CLÍNIC ADULT',
    sessionSummaryTitle: 'Valoració de la Sessió',
    sessionSummarySub: 'L\'adult registra la resposta. La participació sempre suma progrés.',
    childResponseLabel: 'Com ha respost l\'infant?',
    respCalm: 'Tranquil / Regulat',
    respAttentive: 'Atent / Amb curiositat',
    respSensitive: 'Sensible / Ha demanat pausa',
    respOverwhelmed: 'Incomoditat / Aturada primerenca',
    tprAppliedToggle: 'S\'ha realitzat l\'estratègia de calma (TPR)',
    saveSessionBtn: 'Desar la sessió i sumar XP',

    wellDoneTitle: 'Sessió completada!',
    wellDoneSub: 'Has explorat i regulat l\'escolta amb èxit.',
    xpAddedToSensorySilo: 'Afegits al progrés d\'Integració Sensorial',
    backToSensoryListBtn: 'Tornar a activitats sensorials',
  },

  writing: {
    kicker: 'PISSARRA MÀGICA DE LA LÚA',
    title: 'Grafomotricitat i Escriptura',
    sub: 'Traç guiat amb llapis òptic · Dislèxia i discriminació de grafemes',
    tabCritical: 'Lletres crítiques',
    tabWarmup: 'Llaços',
    tabFree: 'Pissarra lliure',
    hearModel: 'Sentir la lletra',
    clearCanvas: 'Netejar la pissarra',
    toggleGuide: 'Pauta Montessori',
    checkStroke: 'Comprovar el traç!',
    strokeCompleted: 'Traç perfecte!',
    strokeCompletedSub: 'Has seguit la direcció i l\'ordre sense dubtar.',
    strokeAlmost: 'Gairebé ho tens!',
    strokeAlmostSub: 'Segueix les fletxes i els punts de control en ordre.',
    strokeColor: 'Color de guix màgic',
    strokeWidth: 'Gruix del traç',
    targetLetter: (l: string): string => `Traça la lletra: ${l}`,
    targetWord: (w: string): string => `Escriu la paraula: ${w}`,
    targetLoop: 'Segueix el camí de la Lúa sense aixecar el llapis',
    nextExercise: 'Següent traç →',
    congratsTitle: 'Pissarra completada!',
    congratsSub: 'Has completat tots els traços de la sèrie amb gran destresa.',

    colorTurquoise: 'Guix turquesa',
    colorGold: 'Guix daurat',
    colorCoral: 'Guix coral',
    colorSky: 'Guix blau cel',
    colorViolet: 'Guix lavanda',
    widthFine: 'Traç fi',
    widthMedium: 'Traç mitjà',
    widthThick: 'Traç gruixut',
  },
};
