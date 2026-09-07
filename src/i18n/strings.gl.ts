// ============================================================================
// Valeria+ · Catálogo de cadeas de INTERFACE · Galego (gl-ES)
//
// Tipado contra o catálogo base en castelán (src/i18n/strings.es.ts): calquera
// clave engadida alí e ausente aquí rompe `npm run typecheck`. É deliberado —
// unha cadea que falta ten que romper a compilación, nunca aparecer en branco
// na tableta dunha familia.
//
// POR QUE EXISTE (set/2026). O galego era desde xullo de 2026 a variedade de
// terapia MELLOR cuberta —banco clínico completo nos oito bloques e voz
// neuronal propia (Celtia, Proxecto Nós)— e a única lingua cooficial SEN
// interface. Iso significaba que no hospital onde se pilota a app, en Lugo,
// Celtia faláballe en galego ao neno mentres a logopeda e a familia lían os
// botóns en castelán; e que o catalán, sen hospital, si tiña a app enteira na
// súa lingua. Esa asimetría non se sostiña nin clínica nin institucionalmente.
//
// Criterio de lingua: galego normativo da RAG (acordo ortográfico de 2003).
//   · «neno / nena», «persoa coidadora» ou «adulto acompañante»; «titor» só
//     no sentido legal da ficha.
//   · Terminoloxía clínica: «hipoacusia», «audiófono», «implante coclear»,
//     «pares mínimos», «logopeda», «xordeira».
//   · Segunda persoa de confianza (ti), como no castelán da app.
//   · Sen castelanismos de bulto: «axustes» (non «ajustes»), «gardar» (non
//     «guardar»), «pechar», «amosar», «obxectivo», «exercicio», «suxestión».
//   · Maiúscula só ao principio en botóns, títulos e mensaxes.
//
// ✅ AVALIADO E VALIDADO POR ACOPROS (comunicado por Frank o 6/9/2026), que é
// a mesma dobre validación que se lle esixiu ao inglés (logopeda de Howard) e
// ao catalán (Maria, Barcelona), e a mesma casa que validou o banco clínico
// galego en xullo de 2026.
//
// As cadeas LOCUTADAS non viven aquí (ver a cabeceira de strings.es.ts): van
// nos bancos por variedade, porque o corpus de voz enuméraas para pre-xerar o
// seu audio con Celtia.
// ============================================================================
import { UiStrings } from './strings.es';

export const GL: UiStrings = {
  common: {
    continue: 'Continuar',
    back: 'Atrás',
    cancel: 'Cancelar',
    save: 'Gardar',
    close: 'Pechar',
    accept: 'Aceptar',
    loading: 'Cargando…',
  },

  // [v11] Etiquetas da barra de lapelas inferior. OLLO: son etiquetas VISIBLES,
  // non nomes de ruta. Os nomes de ruta internos non se traducen nin se
  // renomean, porque a telemetría do piloto indexa por nome de ruta.
  tabs: {
    therapies: 'Exercicios',
    academy: 'Academy',
    settings: 'Axustes',
    therapiesA11y: 'Exercicios. Bloques de exercicios para practicar ou prescribir.',
    academyA11y: 'Academy. Formación para o adulto coidador.',
    settingsA11y: 'Axustes. Lembranzas, voz, idioma e acceso profesional.',
  },

  welcome: {
    tagline: 'Entende a súa linguaxe, practica na casa. Lúa acompáñavos.',
    sub: 'Primeiro fórmaste, despois practicades xuntos na casa. Valeria rexistra o progreso.',
    start: 'Comezar',
    trust: 'Os datos non saen do dispositivo · RXPD / HIPAA',
  },
  luaIntro: {
    title: 'Coñece a Lúa',
    sub: 'A mascota física que vos acompaña e anima en cada sesión de práctica.',
    deviceAlt: 'Lúa, a gata de Valeria, na pantalla do seu aparello',
    request: 'Quero unha Lúa',
    who: 'Quen vai practicar hoxe?',
    newPatient: 'Paciente novo',
    newPatientSub: 'Crear unha ficha desde cero',
    existing: 'Xa teño un paciente',
    existingSub: 'Abrir unha ficha da lista',
  },

  credits: {
    kicker: 'Proxecto desenvolvido por',
    authorRole: 'Otorrinolaringólogo infantil',
    collaborators: 'En colaboración con',
    acoprosDesc: 'Asociación de Colaboración e Promoción do Xordo',
    quisqueyaDesc: 'Rehabilitación da linguaxe',
    recognition: 'Recoñecemento',
    qualitySeal: 'Selo de Calidade',
    qualitySealDesc: 'ITEMAS · Instituto de Salud Carlos III · 2024',
    voiceCredit:
      'Voz neuronal en castelán: «Sharvard» (Piper · rhasspy/piper-voices). '
      + 'En galego: «Celtia» · Proxecto Nós. '
      + 'Euskaraz: HiTZ-TTS · ILENIA/NEL-GAITU (UPV/EHU · Aholab). '
      + 'In English: «LJSpeech» (Piper · rhasspy/piper-voices, MIT), '
      + 'a partir de gravacións de LibriVox en dominio público.',
    arCredit:
      'Realidade Aumentada: seguimento facial con MediaPipe Tasks (Google, Apache 2.0) '
      + 'e escena 3D con Filament (Google, Apache 2.0), ambos executándose integramente '
      + 'no dispositivo. Modelos 3D xerados para o proxecto e liberados en CC0.',
  },

  patientSelect: {
    title: 'Selecciona un paciente',
    subtitle: (n: number): string =>
      n === 0 ? 'Continúa onde o deixaches'
        : n === 1 ? '1 paciente rexistrado neste dispositivo'
          : `${n} pacientes rexistrados neste dispositivo`,
    emptyTitle: 'Aínda non hai pacientes',
    emptyBody: 'Rexistra o teu primeiro paciente para empezar a prescribir exercicios.',
    newPatient: 'Rexistrar paciente novo',
    patientFallback: 'Paciente',
    noDiagnosis: 'Sen diagnóstico asignado',
    privacy: 'Pacientes almacenados e cifrados neste dispositivo.',
  },

  // OLLO coas tres listas de opcións (xénero, vínculo, patoloxía): o que se
  // GARDA é o literal castelán, porque outras partes da app o len para enrutar.
  // Aquí só se traduce a ETIQUETA que se pinta.
  ficha: {
    title: 'Ficha de Rexistro',
    subtitle: 'Datos sociodemográficos do paciente',

    sectionChild: 'Neno / Nena',
    sectionCaregiver: 'Titor / Coidador',
    sectionDiagnosis: 'Diagnóstico e equipo médico',

    fullName: 'Nome e apelidos',
    fullNamePlaceholder: 'Nome do paciente',
    birthDate: 'Data de nacemento',
    birthDatePlaceholder: 'DD / MM / AAAA',
    recordNumber: 'NHC',
    recordNumberPlaceholder: 'HC-…',
    gender: 'Xénero',

    caregiverName: 'Nome completo',
    caregiverNamePlaceholder: 'Nome do titor',
    relationship: 'Vínculo familiar',
    relationshipPlaceholder: 'Selecciona o vínculo…',
    email: 'Correo electrónico',
    emailPlaceholder: 'titor@correo.com',
    phone: 'Teléfono / WhatsApp',
    phoneHint: 'Usarase para enviar os informes clínicos.',
    phonePlaceholder: 'Ex. 600 123 456',

    therapyLanguage: 'Lingua da terapia',
    therapyLanguageHint: 'Aplicarase ao seleccionar este paciente. Sen elixir, mantense a da app.',

    glDialect: 'Variedade do galego',
    glDialectHint: 'No occidente (costa da Coruña e Pontevedra) sesease. Se o elixes, o par casa / caza sae do banco e o micrófono deixa de contar o seseo como erro.',
    glDialectDistincion: 'Distingue s / z',
    glDialectSeseo: 'Sesea',

    pathology: 'Patoloxía / diagnóstico',
    pathologyPlaceholder: 'Selecciona unha patoloxía…',
    prescriber: 'Médico prescritor (ORL / Pediatra)',
    prescriberPlaceholder: 'Dr./Dra. …',
    therapist: 'Logopeda asignado',
    therapistPlaceholder: 'Nome do logopeda',

    required: 'Este campo é obrigatorio.',
    invalidEmail: 'Introduce un correo válido.',
    recordNumberRequired: 'O NHC é obrigatorio.',
    saved: 'Ficha gardada neste dispositivo. Non sae de aquí.',
    save: 'Gardar ficha',
    continueToAcademy: 'Empezar pola formación →',
    footer: 'Todo queda no dispositivo: sen servidor nin contas · cumpre o RXPD / HIPAA.',

    // id almacenado (castelán, inmutable) → etiqueta visible
    genderLabel: (id: string): string =>
      id === 'Niña' ? 'Nena'
        : id === 'Niño' ? 'Neno'
          : id === 'Otro' ? 'Outro'
            : id,
    relationshipLabel: (id: string): string =>
      id === 'Madre' ? 'Nai'
        : id === 'Padre' ? 'Pai'
          : id === 'Tutor legal' ? 'Titor/a legal'
            : id === 'Logopeda' ? 'Logopeda'
              : id,
    pathologyLabel: (id: string): string =>
      id === 'Hipoacusia con Implante Coclear' ? 'Hipoacusia con implante coclear'
        : id === 'Hipoacusia con Audífono' ? 'Hipoacusia con audiófono'
          : id === 'Hipoacusia sin Audífono' ? 'Hipoacusia sen audiófono'
            : id === 'Trastorno Específico del Lenguaje' ? 'Trastorno do desenvolvemento da linguaxe (TDL)'
              : id === 'Retraso Simple del Lenguaje' ? 'Atraso simple da linguaxe'
                : id === 'Trastorno del Espectro Autista (TEA)' ? 'Trastorno do espectro autista (TEA)'
                  : id === 'Dislalia' ? 'Dislalia'
                    : id === 'Otros' ? 'Outros'
                      : id,
  },

  // Hub de bloques + lista prescribible. O que NON se traduce aquí: o nome, a
  // categoría e a idade de cada exercicio saen do banco de contido terapéutico
  // (valeriaExerciseBank), que se localiza por VARIEDADE, non por interface.
  hub: {
    title: 'Selección de Exercicios',
    subtitle: 'Elixe un bloque para practicar ou prescribir',
    streak: (n: number): string => `${n} ${n === 1 ? 'día de racha' : 'días de racha'}`,
    level: (n: number, name: string): string => `Nivel ${n} · ${name}`,
    sectionTraining: 'A TÚA FORMACIÓN',
    sectionBlocks: 'BLOQUES DE EXERCICIOS',

    pairsTitle: 'Pares Mínimos',
    pairsSub: 'Dislalias: rotacismo, sigmatismo e máis, con xogo de voz.',
    pairsBrief: 'Contrastes de son para dislalias.',
    pairsA11y: 'Practicar pares mínimos para dislalias',
    semanticTitle: 'Expansión Semántica',
    semanticSub: 'Escenarios diarios, progresión léxica e contrastes con acción física.',
    semanticBrief: 'Vocabulario e frases do día a día.',
    semanticA11y: 'Practicar expansión semántica e progresión léxica',
    hearingTitle: 'Audición',
    hearingSub: 'Inspirado no protocolo ACOPROS: sons, vocabulario, frases e uso social, organizado por idades.',
    hearingBrief: 'Detectar, discriminar e recoñecer.',
    hearingA11y: 'Abrir exercicios de audición',
    languageTitle: 'Linguaxe',
    languageSub: 'Protocolo familiar: atención conxunta, imitación, comprensión e máis.',
    languageBrief: 'Atención conxunta e comprensión.',
    languageA11y: 'Abrir exercicios de linguaxe',
    autismTitle: 'TEA',
    autismSub: 'PRT + TCC: atención conxunta triangulada, reparación comunicativa e flexibilidade. Estresores sempre manuais.',
    autismBrief: 'Pragmática e flexibilidade social.',
    autismA11y: 'Abrir exercicios do módulo TEA',
    dyslexiaTitle: 'Dislexia',
    dyslexiaSub: 'Conciencia fonolóxica, síntese fonémica, pseudopalabras e rastrexo de letras xiradas (b/d, p/q).',
    dyslexiaBrief: 'Conciencia fonolóxica e lectura.',
    dyslexiaA11y: 'Abrir exercicios do módulo Dislexia',
    arTitle: 'Realidade Aumentada',
    arSub: 'A cámara mira o xesto e o coche, o can ou a mazá reaccionan a el. Sen gravar nada e co micrófono apagado.',
    arBrief: 'Xesto e mirada coa cámara.',
    arA11y: (n: number): string => `Abrir o bloque de realidade aumentada, ${n} exercicios`,
    sensoryTitle: 'Integración Sensorial',
    sensorySub: 'Desensibilización gradual, modulación e anticipación visual ante sons cotiáns.',
    sensoryBrief: 'Anticipación e tolerancia a sons.',
    sensoryA11y: (n: number): string => `Abrir exercicios de integración sensorial auditiva, ${n} actividades`,
    sensoryBadge: (n: number): string => `${n} actividades`,

    // Encerado Máxico · Grafomotricidade e Escritura.
    writingTitle: 'Grafomotricidade',
    writingSub: 'Trazo guiado con pauta Montessori e control da orde para evitar a inversión b / d.',
    writingBrief: 'Trazo guiado e letras críticas.',
    writingA11y: (n: number): string => `Abrir o encerado máxico de Lúa, ${n} trazos guiados`,
    writingBadge: (n: number): string => `${n} trazos`,

    luaTitle: 'Aventuras con Lúa',
    luaSub: 'Banco interactivo de linguaxe, contos, cancións e imprimibles por idade (0 a 10 anos).',
    luaBrief: 'Linguaxe, contos e cancións.',
    luaA11y: (n: number): string => `Abrir Aventuras con Lúa, ${n} actividades interactivas`,
    luaBadge: (n: number): string => `${n} act.`,

    statStreakUnit: (n: number): string => (n === 1 ? 'día de racha' : 'días de racha'),
    pairsBadge: (n: number): string => `${n} pares`,
    semanticBadge: (n: number): string => `${n} escenarios`,
    therapiesBadge: (n: number): string => `${n} exercicios`,
    activeBadge: (n: number): string => `${n} activas`,

    remindersTitle: 'Lembranzas de sesión',
    remindersOff: 'Avisos na pantalla de bloqueo para non perder a racha. Ti elixes en que franxas, dunha a catro.',
    remindersPickHint: 'Elixe abaixo as franxas que queiras.',
    remindersNone: 'Sen avisos: non chegará ningunha notificación.',
    remindersSummary: (n: number, hours: string): string =>
      n === 1
        ? `1 aviso ao día (${hours}) na pantalla de bloqueo.`
        : `${n} avisos ao día (${hours}) na pantalla de bloqueo.`,
    remindersOn: (summary: string): string => `Lembranzas activadas: ${summary} 🔔`,
    remindersDisabled: 'Lembranzas desactivadas.',
    remindersNoPermission: 'Non se puido activar: concede o permiso de notificacións ao sistema.',
    remindersNoSchedule: 'Non se puido programar: concede o permiso de notificacións ao sistema.',
    remindersNoSlots: 'Sen franxas activas: lembranzas desactivadas.',
    // id de franxa (inmutable) → etiqueta e descrición visibles
    slotLabel: (id: string, hour: number): string => {
      const name = id === 'manana' ? 'Mañá' : id === 'mediodia' ? 'Mediodía' : id === 'tarde' ? 'Tarde' : 'Noite';
      return `${name} · ${hour}:00`;
    },
    slotHint: (id: string): string =>
      id === 'manana' ? 'Convite á sesión do día.'
        : id === 'mediodia' ? 'Lembranza curta a media xornada.'
          : id === 'tarde' ? 'Última chamada para non perder a racha.'
            : 'Consello para o adulto, non aviso de xogo.',

    proAccessTitle: 'Acceso Profesional',
    proAccessSub: 'Exportar evidencia de usabilidade do piloto (PIN do logopeda).',
    proAccessA11y: 'Acceso profesional: exportar evidencia de usabilidade',
    proPinSubtitle: 'Introduce o PIN do logopeda para exportar a evidencia de usabilidade do piloto.',
    proUnlocked: 'Modo profesional desbloqueado.',

    backToBlocks: 'Bloques',
    tabHearing: '👂 Audición',
    tabLanguage: '💬 Linguaxe',
    tabAutism: '🧠 TEA',
    tabDyslexia: '📖 Dislexia',
    protocolHearing: 'PROTOCOLO ACOPROS · AUDICIÓN',
    protocolLanguage: 'PROTOCOLO FAMILIAR · LINGUAXE',
    protocolAutism: 'PROTOCOLO TEA · PRT + TCC',
    protocolDyslexia: 'PROTOCOLO DISLEXIA · FONOLOXÍA E ACCESO LÉXICO',

    editingOn: 'Edición profesional habilitada',
    editingOff: 'Modo Familia · só lectura',
    blockChip: (total: number, prescribed: number): string => `${total} exercicios · ${prescribed} prescritos`,
    fullSession: 'Sesión completa',
    fullSessionSub: (n: number): string => `Os ${n} exercicios prescritos seguidos, con pausas de movemento`,
    fullSessionA11y: (n: number): string => `Practicar os ${n} exercicios prescritos seguidos`,
    prescribedCount: (n: number): string => `${n} prescritos`,
    practiceA11y: (name: string): string => `Practicar ${name}`,
    otherAges: 'Outras',

    refHearing:
      'Actividades inspiradas nos materiais de rehabilitación auditiva de ACOPROS '
      + '(Asociación Coruñesa de Promoción do Xordo), organizadas en 4 áreas: sons, '
      + 'vocabulario, frases e uso social. As idades son orientativas: empeza polas da '
      + 'idade do teu pequeno e deixa que o logopeda axuste a prescrición.',
    refAutism:
      'Batería PRT + TCC: a app orquestra as continxencias, pero a carga (quebra '
      + 'pragmática, ruído, gata distractora) SEMPRE a acciona o adulto desde o Panel do '
      + 'Adulto e é reversible ao instante. A app nunca interrompe nin axusta nada soa, e '
      + 'o veredicto clínico é sempre teu e do teu logopeda.',
    refDyslexia:
      'Batería de conciencia fonolóxica e acceso léxico. A validación por voz respecta a '
      + 'fala de cada variedade (en dominicano, o seseo ou o s aspirado NUNCA contan '
      + 'como erro) e a Criba de Pseudopalabras corta en 5 ensaios con pausa de descarga.',

    protocolCardOpen: 'Ver a ficha do protocolo',
    protocolCardClose: 'Agochar a ficha',
    notPrescribed: 'Non prescrito',
    prescribedOf: (active: number, total: number): string => `${active} de ${total} prescritas`,
    savePrescription: 'Gardar Prescrición',
    savedPrescription: (n: number): string => `Prescrición gardada · ${n} exercicios activos.`,
    saveHelper: 'A selección gárdase no dispositivo e a edición bloquéase de novo.',
    lockedHint: 'Modo Familia · só o logopeda pode modificar a prescrición.',

    teaConsentTitle: 'Antes de empezar con TEA',
    teaConsentBreak: 'Quebra Pragmática',
    teaConsentBody1: 'Este módulo inclúe a ',
    teaConsentBody2:
      ': un exercicio no que TI conxelas a app a propósito (unha orde absurda ou un '
      + 'silencio) para observar como o teu pequeno repara a comunicación. Pode xerarlle unha '
      + 'frustración breve e controlada — é o obxectivo clínico, pautado polo voso logopeda.',
    teaConsentItem1: '✋ O estresor lánzalo sempre ti, desde o Panel do Adulto.',
    teaConsentItem2: '↩️ É reversible ao instante: un toque e a app volve á normalidade.',
    teaConsentItem3: '🚫 A app nunca interrompe, sobe a dificultade nin diagnostica soa.',
    teaConsentItem4: '🛑 Se o teu pequeno se desborda, para: non hai ningún mínimo que cumprir.',
    teaConsentAccept: 'Enténdoo e acepto o encadre',
    teaConsentAcceptA11y: 'Aceptar o encadre e entrar no módulo TEA',
    teaConsentLater: 'Agora non',

    // Nomes de nivel da gamificación (valeriaGamification dáos en castelán; o
    // índice é estable, o nome non).
    levelNameByIndex: (i: number): string =>
      ['Gatiña', 'Gata Curiosa', 'Gata Xoguetona', 'Gata Valente',
        'Gata Exploradora', 'Gata Saltareira', 'Gata Sabia', 'Gata Sixilosa',
        'Gata Estrela', 'Gran Gata', 'Gata Lunar', 'Gata Lendaria'][i]
      ?? 'Gata Lendaria',

    luaPurring: 'Ronroneo!',
    luaEating: 'Que rico!',
    luaCraving: 'Ten antollo',
    luaPatShort: 'Acariñame',
    luaFeedFish: 'Dar peixiño',
    luaFeedFishA11y: 'Dar peixiño a Lúa',
    luaPatA11y: 'Acariñar a gata Lúa',
    luaPatHintA11y: 'Toca para acariñala e ver o seu ronroneo',
  },

  // --------------------------------------------------------------------------
  // Premios: a colección de Lúa. A COPIA vive aquí; que se gaña e cando, en
  // valeriaGamification. Os ids son inmutables (viaxan en AsyncStorage).
  // --------------------------------------------------------------------------
  awards: {
    open: 'Premios',
    title: 'Os premios de Lúa',
    subtitle: 'O que conseguiches e o que che falta.',
    close: 'Pechar',
    levelLine: (n: number, name: string): string => `Nivel ${n} · ${name}`,
    xpToNext: (n: number): string => `${n} XP para o seguinte nivel`,
    xpTotal: (n: number): string => `${n} XP en total`,
    maxLevel: 'Nivel máximo acadado!',
    streakLine: (n: number): string => (n === 1 ? '1 día de racha' : `${n} días de racha`),
    streakNone: 'Empeza hoxe a túa racha',
    collection: (won: number, total: number): string => `Insignias · ${won} de ${total}`,
    levelTrack: 'Escaleira de niveis',
    lockedHint: 'As insignias en gris aínda non están conseguidas.',
    a11yOpen: 'Abrir a colección de premios de Lúa',
    badgeA11y: (name: string, won: boolean): string =>
      `${name}. ${won ? 'Conseguida' : 'Aínda non conseguida'}.`,

    wardrobeTitle: 'O armario e premios de Lúa',
    itemSlotHead: 'Cabeza',
    itemSlotNeck: 'Pescozo',
    itemSlotSnack: 'Premio',
    itemEquipped: 'Posto en Lúa',
    itemEquipAction: 'Toca para poñer',
    itemSnackAvailable: 'Dispoñible para premiar',
    itemA11y: (name: string, unlocked: boolean, equipped: boolean): string =>
      `${name}. ${unlocked ? (equipped ? 'Posto en Lúa' : 'Toca para poñer') : 'Bloqueado'}.`,

    itemName: (id: string): string => ({
      snack_fish: 'Peixiño Saboroso',
      neck_red_bow: 'Lazo Escarlata',
      head_flower: 'Flor Turquesa Valeria',
      neck_bell: 'Axóuxere Relucente',
      head_wizard: 'Gorro de Maga Estelar',
    }[id] ?? id),


    itemUnlockCondition: (id: string): string => ({
      snack_fish: 'Dispoñible desde o principio',
      neck_red_bow: 'Completa 3 sesións de exercicios',
      head_flower: 'Acada unha racha de 3 días',
      neck_bell: 'Completa 10 sesións de exercicios',
      head_wizard: 'Acada o Nivel 5 de Lúa',
    }[id] ?? ''),

    badgeName: (id: string): string => ({
      primera: 'Primeiro paso de Lúa',
      ses10: 'Paseo amigo',
      ses25: 'Gran exploradora',
      ses50: 'Guía do carreiro',
      ses100: 'Pacto centenario',
      racha3: 'Axóuxere sonoro',
      racha7: 'Semana cantareira',
      racha14: 'Melodía constante',
      racha30: 'Campá de ouro',
      perfecta: 'Oído de lince',
      perf5: 'Radar máxico',
      perf10: 'Antena de cristal',
      madrugadora: 'Almorzo sonoro',
      nocturna: 'Conto de lúa',
      finde: 'Mochila de fin de semana',
      maraton: 'Nobelo de historias',
      regreso: 'Aperta de benvida',
      nivel10: 'Raíña da linguaxe',
    }[id] ?? id),

    // A descrición é a REGRA de desbloqueo, non adorno: o adulto úsaa para
    // dicirlle ao neno que falta. Cabe en tres liñas de 10 px (~55 caracteres);
    // pasarse córtaa cun «…» e deixa a insignia sen explicar.
    badgeDesc: (id: string): string => ({
      primera: 'Completa a túa primeira sesión con Lúa.',
      ses10: '10 sesións de camiño xuntos.',
      ses25: '25 sesións descubrindo palabras.',
      ses50: '50 sesións: Lúa sabe o camiño.',
      ses100: '100 sesións. Un vínculo para sempre.',
      racha3: '3 días seguidos practicando.',
      racha7: '7 días seguidos practicando.',
      racha14: '14 días seguidos practicando.',
      racha30: '30 días seguidos practicando.',
      perfecta: 'Consegue 3★ en todos os exercicios dunha sesión.',
      perf5: 'Consegue 5 sesións perfectas.',
      perf10: 'Consegue 10 sesións perfectas.',
      madrugadora: 'Practica antes das 10 da mañá.',
      nocturna: 'Practica despois das 8 da tarde.',
      finde: 'Practica un sábado ou un domingo.',
      maraton: 'Seis exercicios ou máis nunha soa sesión.',
      regreso: 'Volve practicar tras unha semana de pausa.',
      nivel10: 'Acada o nivel 10 e a súa coroa.',
    }[id] ?? ''),
  },


  // Test de Ling. Os SEIS SONS e as súas consignas non están aquí: saen de
  // `lingContentForLocale`, que se localiza por VARIEDADE de terapia. Aquí vive
  // o que le o adulto: a pregunta previa, a escala de valoración e o veredicto.
  ling: {
    title: 'Test de Ling',
    titleDone: 'Test completado',
    subAsk: (name: string): string => `${name} · Comprobación auditiva`,
    subTest: (name: string): string => `${name} · 6 sons de Ling`,
    subDone: (name: string): string => `${name} · Resultado de hoxe`,

    askTitle: 'Antes de empezar',
    askQuestion1: 'O paciente usa ',
    askQuestionHearingAids: 'audiófonos',
    askQuestionOr: ' ou ',
    askQuestionImplant: 'implante coclear',
    askQuestion2: '?',
    askSub: 'Se os usa, convén comprobar primeiro que oe ben hoxe co Test de Ling.',
    yesTitle: 'Si, usa audiófonos / implante',
    yesSub: 'Realizar o Test de Ling (6 sons)',
    noTitle: 'Non',
    noSub: 'Ir directamente aos exercicios',

    instrKicker: 'A TÚA QUENDA, TITOR',
    instrTitle: 'Tapa a boca e produce o son',
    stageLabel: 'PRODUCE ESTE SON',
    scaleTitle: 'Como respondeu?',
    scaleSub: 'Marca a resposta do neno a este son',
    scaleIdentifies: 'Identifica',
    scaleIdentifiesDesc: 'Repite ou recoñece o son correctamente.',
    scaleDetects: 'Detecta',
    scaleDetectsDesc: 'Reacciona ou levanta a man ao oílo.',
    scaleNoResponse: 'Sen resposta',
    scaleNoResponseDesc: 'Non reacciona ao son.',
    legendNoResponseShort: 'Sen resp.',

    resultGoodTitle: 'Oe con claridade!',
    resultGoodSub: 'Identificou os 6 sons. O equipo auditivo funciona ben hoxe.',
    resultGoodRec: 'Todo en orde. Podes continuar cos exercicios de audición con normalidade.',
    resultCheckTitle: 'Revisar o equipo',
    resultCheckSub: 'Non reaccionou a algún son. Comproba as pilas, o molde e o volume antes de seguir.',
    resultCheckRec: 'Revisa o audiófono / implante (pilas, conexión, programa) e repite o test. Se persiste, consulta co ORL.',
    resultDetectTitle: 'Detecta todos os sons',
    resultDetectSub: (ident: number, total: number): string =>
      `Detectou os ${total} e identificou ${ident} de ${total}. Pode continuar coa sesión.`,
    resultDetectRec: 'Reforza co apoio do titor os sons máis agudos (sh, s). Podes continuar cos exercicios.',

    startExercises: 'Comezar exercicios →',
    repeat: 'Repetir o test',
    months: 'xan feb mar abr mai xuñ xul ago set out nov dec',
  },

  // Pares Mínimos. NON están aquí: as palabras do par, a consigna, a pista, as
  // misións físicas nin a etiqueta de erro — todo iso sae do banco da VARIEDADE
  // activa (valeriaMinimalPairs*). Aquí vive o andamio que le o adulto.
  pairs: {
    sealA11y: (who: string): string =>
      `Pegada de ${who}. Premede as dúas pegadas á vez para continuar, ou mantén premida esta dous segundos.`,
    pinSubtitle: 'Introduce o PIN de 4 díxitos do logopeda para elixir que pares practica a familia.',
    sessionName: (a: string, b: string): string => `Pares mínimos · ${a} / ${b}`,
    noteClean: (phoneme: string): string =>
      `Contraste ${phoneme} sen substitucións detectadas. Fonema consolidándose!`,
    noteSubs: (subs: number, total: number, corr: number, err: string): string =>
      `Substitución detectada en ${subs} de ${total} ensaios; ${corr} con corrección (${err}).`,
    doneClean: (phoneme: string): string =>
      `Ningunha substitución detectada no contraste ${phoneme}. O fonema estase a consolidar!`,
    doneSubs: (subs: number, total: number): string =>
      `O micrófono detectou a substitución en ${subs} de ${total} ensaios. É normal: cada corrección é práctica do contraste.`,
    dialectSensitive: 'ANTES DE PUNTUAR ESTE PAR',
    dialectTransfer: 'ANTES DE PUNTUAR: NENO BILINGÜE',
    dialectRegularIn: (v: string): string => `Trazo regular en: ${v}.`,
    title: 'Pares Mínimos',
    subtitlePick: 'Dislalias fonolóxicas · o neno pide a palabra coa súa voz',
    editingOn: 'Edición profesional habilitada',

    howKicker: 'COMO FUNCIONA',
    howBody:
      'Aparecen dúas palabras case iguais (rúa / lúa). A app pide unha en voz alta, o neno '
      + 'dilla ao micrófono e a app detecta se saíu o fonema ou a substitución habitual. '
      + 'Cada ensaio remata cunha misión física en parella e o selo dobre: sen as mans '
      + 'dos dous na pantalla non se avanza!',
    autoRecord: 'Gravación automática tras a consigna',
    autoRecordSub: 'Por defecto, apagada: o micro agarda a que premades «Xa estou listo».',
    bankLabel: 'BANCO DE CONTRASTES',
    prescribedCount: (n: number): string => `${n} prescritos`,
    toggleA11y: (on: boolean, a: string, b: string): string => `${on ? 'Desactivar' : 'Activar'} o par ${a} e ${b}`,
    practiceA11y: (a: string, b: string): string => `Practicar o par ${a} e ${b}`,
    notPrescribedA11y: (a: string, b: string): string => `Par ${a} e ${b} non prescrito`,
    savePrescription: 'Gardar Prescrición',
    saveHelper: 'A selección gárdase no dispositivo e a edición bloquéase de novo.',
    lockedHint: 'Modo Familia · só o logopeda pode cambiar que pares se practican.',

    appSpeaksSlow: 'A APP MODELA DEVAGAR',
    appSpeaks: 'A APP DI',
    stepSay: 'A app está a falar… preparade a voz.',
    stepReady: 'Preparade a voz. Cando o neno estea listo, premede o micrófono.',
    readyBtn: 'Xa estou listo',
    readyBtnA11y: 'Xa estou listo. Empezar a escoitar.',
    repeatPrompt: 'Repetir a consigna',
    stepListen: 'Agora o neno! Di a palabra ao micrófono…',
    stopListening: 'Parar · decide o adulto',
    stepJudge: 'O adulto fai de xuíz: que dixo o neno?',
    saidWord: (w: string): string => `Dixo «${w}»`,
    notUnderstood: 'Non se entendeu · repetir a consigna',
    micNoteKicker: '👤 PARA O ADULTO · O MICRÓFONO',

    successTitle: 'Fonema conseguido!',
    heardBy: (w: string): string => `A app escoitou: «${w}»`,
    adultVerdict: 'Veredicto do adulto.',
    missionCelebration: 'MISIÓN FÍSICA DE CELEBRACIÓN',
    missionCorrective: 'MISIÓN FÍSICA CORRECTIVA',
    sealSuccess: 'Misión feita: selade xuntos para o seguinte ensaio!',

    heardFoil: (w: string): string => `Escoitei «${w}»… era a outra palabra!`,
    almostTitle: 'Case case!',
    notHeardTitle: 'Non te escoitei ben',
    cuePrefix: (cue: string): string => `Pista: ${cue}`,
    almostSub: 'Parécese moito. Escoitade o modelo devagar e outra vez.',
    notHeardSub: 'Este intento non conta. Achegádevos ao micrófono e repetimos.',
    hearSlowModel: 'Oír o modelo devagar',
    retryBtn: '🎤 Outra vez!',

    assistTitle: 'Imitación xuntos (1★)',
    assistSub: (w: string): string =>
      `O adulto di «${w}» moi devagar tocando a meixela do neno, e o neno repítea `
      + 'á vez. Sen présa: hoxe practicámola, mañá sae soa.',
    sealAssist: 'Dixéstela xuntos? Selade e seguimos!',

    overrideLabel: 'A app oíu mal? Corrixe ti:',
    overridePill: (w: string): string => `dixo «${w}»`,

    doneTitle: 'Par completado!',
    doneSessionTitle: 'Sesión de pares completada!',
    seeResults: 'Ver Resultados →',
    repeatPair: 'Repetir este par',
    otherPair: 'Elixir outro par',

    // Rotación de roles: o neno pasa a xuíz. «O adulto» e non «papá»: o
    // acompañante pode ser calquera, e é o criterio que ACOPROS xa obrigou a
    // aplicar nos bancos.
    swapKicker: '👑 AGORA MANDAS TI!',
    swapTitle: 'O neno fai de xuíz',
    swapListening: '👂 Escoitando o adulto…',
    swapWhich: 'Cal dixo o adulto? Tócaa!',
    swapHit: '✅ Acertou!',
    swapMiss: '❌ Era a outra',
    swapContinue: 'Seguimos coa sesión →',
    swapSkip: 'Saltar esta vez',
    swapIntro: 'O adulto elixe EN SEGREDO unha das dúas palabras e dina en voz alta, sen sinalar.',
    swapIntroAsr: ' A app tamén escoitará para comprobalo.',
    swapSpeakNow: '🎤 Agora, en voz alta!',
    swapAlreadySaid: '🗣️ Xa a dixo → seguir',
    subtitlePlay: 'Dislalias fonolóxicas · o neno pide a palabra coa súa voz',
    regionNote: ' · só variedades con distinción s/z',
    streakChip: (n: number): string => (n === 1 ? 'día de racha' : 'días de racha'),

    sealKicker: '🤝 SELO DOBRE PARA CONTINUAR',
    sealWhy:
      'Serve para que o exercicio non siga só: ata que non poñedes as dúas mans, a app agarda. '
      + 'Así pechades xuntos cada intento e o adulto non queda mirando desde fóra.',
    sealAdult: 'ADULTO',
    sealChild: 'EU',
    sealPlus: 'á vez',
    sealHint: 'Quen acompañe o neno. Unha soa man libre? Mantén premida unha pegada 2 segundos.',
  },

  // Expansión Semántica. Do banco da VARIEDADE saen os escenarios, as
  // categorías, as palabras, as consignas locutadas e as accións físicas. Aquí
  // vive o que le o adulto.
  semantic: {
    togglePrescribedA11y: (name: string, on: boolean): string => `${on ? 'Desactivar' : 'Activar'} ${name}`,
    pickRowA11y: (name: string, on: boolean): string => (on ? `Practicar ${name}` : `${name} non prescrito`),
    wordsOf: (available: number, total: number): string => `${available} de ${total} palabras`,
    backPillContinue: 'Seguir',
    backPillBack: 'Volver',
    noMaterialHint: 'Esta actividade non precisa material: abondan as vosas mans e un sitio tranquilo.',
    doneSessionSub: (n: number): string =>
      `${n} palabras traballadas unindo imaxe, voz e acción física. A palabra apréndese cando o neno a vive co corpo, non só cando a oe.`,
    assistSub: (word: string): string =>
      `O adulto di «${word}» moi devagar mirando o neno, e repítena á vez. Sen présa: hoxe practicámola, mañá sae soa.`,
    title: 'Expansión Semántica',
    setupTitle: 'Preparación',
    doneTitle: 'Completado!',

    howKicker: 'COMO FUNCIONA',
    howBody:
      'Premendo ▶ a app amosa unha imaxe e presenta a palabra nunha frase curta antes de '
      + 'pedila («Isto é a cama. Di: cama.»). O neno repítea coa súa voz e o micrófono '
      + 'valora o intento, aceptando as aproximacións propias da idade. Cada palabra '
      + 'péchase cunha acción física do adulto que a ancora ao corpo e á contorna real.',
    autoRecord: 'Audio e gravación automáticos',
    autoRecordSub: 'Por defecto, apagado: premede para oír o modelo e para gravar.',

    levelKicker: '📶 NIVEL MÁXIMO DE DIFICULTADE',
    levelHint: 'Co tope en 1, a sesión só presenta as palabras máis familiares de cada categoría.',
    difficultyLabel: (n: number): string =>
      n === 1 ? 'Nivel 1 · o máis familiar'
        : n === 2 ? 'Nivel 2 · familiar'
          : 'Nivel 3 · menos frecuente',

    sectionScenarios: 'ESCENARIOS DIARIOS',
    sectionCategories: 'CATEGORÍAS LÉXICAS',
    sectionSequences: 'PROGRESIÓN LÉXICA',
    sectionCapsules: 'CÁPSULAS DE CONTRASTE',
    prescribedCount: (n: number): string => `${n} prescritas`,
    goalKicker: 'QUE SE TRABALLA AQUÍ',
    sectionGoal: (section: string): string =>
      section === 'scenario' ? 'Repetición verbal: o neno imita a palabra obxectivo en situacións do día a día.'
        : section === 'category' ? 'Vocabulario novo por campo: empézase polas palabras máis familiares e avánzase ás menos frecuentes.'
          : section === 'sequence' ? 'Vocabulario arredor dun concepto: que é, que ten, que fai e como é.'
            : 'Opostos: primeiro elixir a imaxe correcta e despois dicir a palabra.',
    phaseLabel: (kind: string): string =>
      kind === 'concepto' ? 'Paso 1 · Que é'
        : kind === 'parte' ? 'Paso 2 · Que ten'
          : kind === 'accion' ? 'Paso 3 · Que fai'
            : 'Paso 4 · Como é',
    wordTypeLabel: (kind: string): string =>
      kind === 'sustantivo' ? 'Substantivo'
        : kind === 'verbo' ? 'Verbo'
          : kind === 'adjetivo' ? 'Adxectivo'
            : 'Onomatopea',
    wordCount: (n: number): string => `${n} palabras`,

    savePrescription: 'Gardar Prescrición',
    saveHelper: 'A selección gárdase no dispositivo e a edición bloquéase de novo.',
    lockedHint: 'Modo Familia · só o logopeda pode cambiar que actividades se practican.',
    pinSubtitle: 'Introduce o PIN de 4 díxitos do logopeda para elixir que actividades practica a familia.',

    setupKicker: '🧰 MATERIAL QUE PRECISADES',
    stepsKicker: (n: number): string => `🤝 QUE IDES FACER · ${n} ${n === 1 ? 'PASO' : 'PASOS'}`,
    reviewSetup: 'Ver a preparación',
    reviewSetupA11y: 'Volver ver o material e a dinámica',

    appSpeaksSlow: 'A APP MODELA DEVAGAR',
    appSpeaks: 'A APP DI',
    listen: 'Escoitar',
    listenA11y: 'Escoitar o modelo deste paso',
    stepSay: 'A app está a falar… preparade a voz.',
    stepReady: 'Preparade a voz. Cando o neno estea listo, premede o micrófono.',
    readyBtn: 'Xa estou listo',
    readyBtnA11y: 'Xa estou listo. Empezar a escoitar.',
    tapImage: 'Toca a imaxe correcta!',
    repeatQuestion: 'Repetir a pregunta',
    stepListen: 'Agora o neno! Di a palabra ao micrófono…',
    saidIt: 'Dixoo',
    saidItA11y: 'Dixoo ben, dar por válido',
    almost: 'Case / outra vez',
    almostA11y: 'Case, volver tentalo',
    stopWithoutDeciding: 'Parar sen decidir',
    stepJudge: 'O adulto fai de xuíz: tentou dicilo?',
    notUnderstood: 'Non se entendeu · repetir a consigna',

    successTitle: 'Palabra conseguida!',
    heardBy: (w: string): string => `A app escoitou: «${w}»`,
    adultVerdict: 'Veredicto do adulto.',
    finish: '✅ Rematar!',
    nextStep: '✅ Feito! Seguinte →',
    notHeardTitle: 'Non te oín ben',
    almostTitle: 'Case case!',
    hearSlowModel: 'Oír o modelo devagar',
    retryBtn: '🎤 Outra vez!',
    assistTitle: 'Imitación xuntos (1★)',
    finishShort: 'Rematar!',
    saidTogether: 'Dixémola → seguir',

    doneSessionTitle: 'Sesión completada!',
    streakChip: (n: number): string => (n === 1 ? 'día de racha' : 'días de racha'),
    seeResults: 'Ver Resultados →',
    repeatBlock: 'Repetir este bloque',
    otherBlock: 'Elixir outro bloque',
    subtitlePick: 'Progresión léxica · do símbolo ao mundo real do neno',
    editingOn: 'Edición profesional habilitada',
    tabScenarios: 'Escenarios',
    tabCategories: 'Categorías',
    tabSequences: 'Progresión',
    tabContrasts: 'Contrastes',
    kindScenario: 'Escenario',
    kindSequence: 'Progresión',
    kindContrast: 'Contraste',
    stepPoints: ' · o neno sinala',
    setupBack: 'Volver á sesión',
    setupReady: 'Xa o teño todo',
    setupReadyA11y: 'Xa o teño todo, empezar',
    notHeardSub: 'O micrófono non captou nada, así que este intento non conta. Achegádevos un pouco e probade outra vez.',
    almostSub: 'Escoitade o modelo devagar e probade outra vez.',
    actionKickerAdult: 'MISIÓN FÍSICA DO ADULTO',
    actionKickerTpr: 'INSTRUCIÓN TPR PARA O ADULTO',
    actionKickerPair: 'ACCIÓN FÍSICA EN PARELLA',
    actionKickerSecond: 'ACCIÓN FÍSICA · SEGUNDA VOLTA',
    capsuleKickerAdj: 'CONTRASTE DE ADXECTIVOS',
    capsuleKickerVerb: 'VERBOS ANTÓNIMOS',
    capsuleRound1: 'VOLTA 1 · COMPRENDER',
    capsuleRound2: 'VOLTA 2 · DICIR',
    capsuleVisualPrompt: (a: string, b: string): string => `Par en contraste: ${a} / ${b}.`,
    capsuleKindAdj: 'Par de adxectivos',
    capsuleKindVerb: 'Verbos antónimos',
    capsuleMeta: 'cápsula TPR · 2 voltas',
    rowScenarioA11y: (title: string): string => `escenario ${title}`,
    rowCategoryA11y: (title: string): string => `categoría ${title}`,
    rowSequenceA11y: (theme: string): string => `progresión ${theme}`,
    rowCapsuleA11y: (a: string, b: string): string => `cápsula de contraste ${a} e ${b}`,

    histNoteContrast: (kind: string, comp: string, nComp: number, prod: string, nProd: number): string =>
      `${kind}: comprensión ${comp}/3 en ${nComp} ${nComp === 1 ? 'volta' : 'voltas'} · produción ${prod}/3 en ${nProd}.`,
    histNoteWords: (kind: string, n: number): string =>
      `${kind}: ${n} palabras traballadas unindo símbolo, voz e acción física.`,
  },

  // Reprodutor de exercicios. Do banco da VARIEDADE saen: nome, código,
  // consigna (`read`), frase, materiais, propostas alternativas, escala EPT por
  // exercicio (`ex.ept`) e todo o contido das roldas. Aquí vive o andamio.
  player: {
    zoomTileA11y: (cap?: string): string => `Ampliar a imaxe de ${cap ?? 'a ficha'}`,
    answerTileA11y: (cap: string): string => `Responder ${cap}. Mantén premido para ampliar a imaxe`,
    roundOf: (cur: number, total: number): string => `Rolda ${cur} de ${total}`,
    trialLimit: (max: number): string =>
      `Límite de ${max} ensaios acadado: descargade coa pausa de movemento e avalía abaixo (ou cambia de rolda).`,
    matchedTileA11y: (cap: string): string => `${cap}: xa unida coa súa vogal`,
    pickTileA11y: (cap: string): string => `Elixir a imaxe de ${cap}`,
    tileChosen: 'elixida',
    vowelA11y: (v: string): string => `Vogal ${v}`,
    fillMicPrompt: (word: string): string => `Cando complete a palabra, preme o micro e que diga: «${word}»`,
    seriesWordRevealedA11y: (n: number, cap: string): string => `Palabra ${n} da serie: ${cap}`,
    seriesWordA11y: (n: number): string => `Responder a palabra ${n} da serie`,
    seriesWordMasked: (n: number): string => `palabra ${n}`,
    hearPhonemes: (phonemes: string): string => `Oír os sons · ${phonemes}`,
    synthesisMicPrompt: (word: string): string =>
      `Preme o micro e que UNA os sons na palabra completa: «${word}»`,
    synthesisSolved: (word: string): string =>
      `A palabra era «${word}». Podes pasar a outra rolda ou avaliar abaixo.`,
    letterOfA11y: (n: number, total: number): string => `Letra ${n} de ${total}`,
    pictureOfA11y: (n: number, total: number): string => `Debuxo ${n} de ${total}`,
    restart: '↺ Volver empezar',
    pluralCardA11y: (label: string): string => `Tarxeta con ${label}`,
    pluralHowManyPrompt: (target: string): string =>
      `Pregúntalle «cantos hai?» e preme o micro para que diga: «${target}»`,
    pluralWhatArePrompt: (target: string): string =>
      `Pregúntalle «que son?» e preme o micro para que diga: «${target}»`,
    orderTilePlacedA11y: (cap: string): string => `Ficha ${cap}, xa colocada`,
    orderTileA11y: (cap: string): string => `Ficha ${cap}`,
    sceneA11y: (label: string): string => `${label}. Oír un exemplo`,
    selloHint: (sec: number): string =>
      `O botón desbloquéase tras ${sec} segundos de espera. Prémeo SÓ cando o neno te mire de verdade a ti (non ao obxecto); despois bloquéase para o seguinte intento.`,
    doneSub: (total: number): string => (total === 1
      ? 'Avaliaches este exercicio. O resultado gardouse no dispositivo.'
      : `Avaliaches as ${total} actividades do plan. O resultado gardouse no dispositivo.`),
    zoomClose: 'Toca para pechar',
    zoomCloseA11y: 'Pechar a imaxe ampliada',
    zoomTip: 'Para ampliar unha imaxe: tócaa, ou nos xogos mantena premida',
    zoomIconA11y: 'Ampliar a icona',
    zoomFaceA11y: 'Ampliar a cara',

    adultOnlyKicker: 'SÓ PARA O ADULTO',
    adultOnlyShow: 'Toca para ver que palabra tes que dicir sen voz.',
    adultOnlyHide: 'Aparta a pantalla do neno. Toca para volver agochala.',
    adultOnlyShowA11y: 'Ver a palabra que debes pronunciar, sen amosarlle a pantalla ao neno',
    adultOnlyHideA11y: 'Agochar a palabra que debes pronunciar',

    judgeSaidIt: 'Dixoo',
    judgeSaidItA11y: 'Xuíz: dixoo ben',
    judgeAlmost: 'Case',
    judgeAlmostA11y: 'Xuíz: case o dixo',
    judgeHint: 'O micro vai lento ou non o entende? Valora ti o intento:',

    materialsKicker: 'ANTES DE EMPEZAR · PRECISARÁS',
    proposalsKicker: 'OUTRAS FORMAS DE FACELA · ALTERNA ENTRE SESIÓNS',
    step1Kicker: 'PASO 1 · CONSIGNA DO TITOR',
    step1Small: 'Este texto é para o adulto: dillo ao neno coas túas palabras',
    listenPrompt: 'Escoitar a consigna',
    newRound: 'Outra rolda',
    newRoundA11y: 'Cambiar a outra rolda con contido novo',
    step2: (label: string): string => `PASO 2 · ${label}`,
    levelLabel: (label: string): string => `NIVEL ${label.toUpperCase()}`,
    guidedActivity: 'Actividade guiada',
    hearWordSlow: 'Oír a palabra devagar',
    modelNote: 'O mellor modelo é a túa voz: dilla ti primeiro, preto e devagar. A voz da app é só un reforzo.',
    trialKicker: (n: number, max: number): string => `XUÍZ · ENSAIO ${n} DE ${max}`,
    trialHint: 'Se o micro falla ou vai lento, valora ti cada intento. Ao chegar ao límite, a app propón unha pausa de movemento para descargar.',

    vowelHint: '1º Toca unha imaxe para oír o seu nome · 2º Toca a vogal coa que empeza',
    allMatched: '🎉 Todas unidas! Podes pasar a outra rolda ou avaliar abaixo.',
    allFound: '🎉 Todas atopadas! Podes pasar a outra rolda ou avaliar abaixo.',
    matrixDone: '🎉 Matriz completa! Podes pasar a outra rolda ou avaliar abaixo.',
    hearAllNames: 'Oír todos os nomes',
    hearFullWord: '1º Oír a palabra completa',
    hearWords: 'Oír as palabras',
    hearFullSeries: 'Oír a serie completa',
    hearOptions: 'Oír as opcións',
    hearSentence: '1º Oír a frase',
    intruderHint: 'Só polo oído: primeiro escoitade a serie completa; despois o neno toca o altofalante da palabra que non soa coma as demais.',
    synthesisHint: 'A app di cada son por separado, cunha pausa entre eles. O neno úneos e di a palabra completa.',
    synthesisA11y: 'Oír os sons por separado',
    findAllOf: 'BUSCA TODAS AS',
    namedLabel: 'NOMEADOS',
    orderHint: 'En orde de lectura (→): o neno NOMEA o debuxo en voz alta e tócao. Ti persegues o seu dedo co teu, coma no pilla-pilla.',
    startOver: '↺ Volver empezar',
    sentenceRetry: 'Case… volve escoitar a frase e probade outra vez.',
    promptTextKicker: 'TEXTO · PODES LELO TI EN VOZ ALTA',
    hearExample: '🔊 Oír exemplo',

    selloKicker: '🤝 SELO DOBRE · INSTIGACIÓN RETARDADA',
    selloWait: (s: number): string => `⏳ Agarda ${s} s…`,
    selloGive: '🤝 Dar o Selo Dobre',
    selloGiveA11y: 'Dar o selo dobre por contacto visual real',
    selloCount: (stars: string, n: number): string => `Selos por contacto visual: ${stars} (${n})`,
    breakNow: '⏸️ Interromper agora (cápsula sorpresa)',
    breakNowA11y: 'Interromper agora cunha cápsula de movemento sorpresa',

    step3Kicker: 'PASO 3 · VERSIÓN EN MOVEMENTO',
    waitTxt: 'Agarda e observa a resposta do neno',

    step4Kicker: 'PASO 4 · AVALIACIÓN',
    scoreTitle: 'Como lle saíu?',
    scoreSubRounds: 'Xogade as roldas que queirades e toca a frase que mellor describa a súa resposta',
    scoreSub: 'Toca a frase que mellor describa a súa resposta',
    eptToggle: 'Que é a escala EPT-3?',
    eptToggleA11y: 'Que é a escala EPT-3',
    eptExplain:
      'A EPT-3 é a escala de 3 niveis coa que se anota como respondeu o neno en cada '
      + 'actividade: 1★ aínda non o consegue, 2★ conségueo coa axuda do adulto e 3★ '
      + 'conségueo el só. Non é unha nota: serve para que o logopeda vexa o progreso entre sesións.',
    nextUpKicker: 'A CONTINUACIÓN · ANÚNCIALLO ANTES DE CAMBIAR',

    doneTitle: 'Sesión completada!',
    streakChip: (n: number): string => (n === 1 ? 'día de racha' : 'días de racha'),
    streakExtended: 'Racha ampliada! Volve mañá para non perdela.',
    levelChip: (n: number, name: string, up: boolean): string =>
      `Nivel ${n} · ${name}${up ? ' · SUBICHES DE NIVEL!' : ''}`,
    xpToNext: (n: number): string => `${n} XP para o seguinte nivel`,
    badgesTitle: 'LOGROS DESBLOQUEADOS!',
    doneStatKicker: 'PROMEDIO DA SESIÓN · ESCALA EPT-3 (DE 1★ A 3★)',
    seeResults: 'Ver Resultados →',
    repeatSession: 'Repetir a sesión',
    sessionName: 'Sesión de exercicios',
    headerDone: 'Sesión Completada',
    headerPlaying: 'Sesión de Exercicios',
    noteGreat: 'Sesión moi fluída, gran resposta nas consignas.',
    noteGood: 'Boa sesión, algunha consigna custou pero mantívose atento.',
    noteHard: 'Sesión difícil hoxe, convén reforzar con máis apoio do titor.',
    seriesSolved: '✅ Solución da serie: estas eran as palabras que soaron, na mesma orde.',
    seriesHint: '🔊 Cada tarxeta é unha palabra da serie, na orde en que soan. As palabras vense ao responder.',
    hearQuestion: 'Oír a pregunta',
    // Roles S-V-O do xogo de construír frases. O ROL declárao o banco de contido
    // (castelán); a pregunta que se lle amosa ao neno é andamio.
    roleQuestion: (role: string): string =>
      role === 'Sujeto' ? 'Quen?'
        : role === 'Verbo' ? 'Que fai?'
          : role === 'Objeto' ? 'Que cousa?'
            : role,
    redirecting: (s: number): string => `Redirixindo a resultados en ${s}s…`,
    prescribedPlan: (n: number): string => `Plan prescrito · ${n} exercicios`,
  },

  // Panel do adulto, modais e resultados. Regra de sempre: o que a app LOCUTA
  // sae do banco da variedade; o que o adulto LE está aquí.
  adult: {
    kicker: 'PANEL DO ADULTO · RETO EXTRA',
    openA11y: 'Abrir o panel do adulto',
    closeA11y: 'Pechar o panel do adulto',
    distractorTitle: 'Gata distractora (dobre tarefa)',
    distractorSub: 'A gata asómase e móvese polo bordo; o neno debe seguir atendendo á voz. Tocala non conta como erro.',
    launchPragmatic: 'Lanzar unha quebra pragmática',
    hint: 'Controis manuais para adestrar a escoita en ambiente real. Úsaos se o voso logopeda vos o pautou: a app nunca os activa nin os axusta soa.',
    stepDownA11y: (label: string): string => `Baixar ${label}`,
    stepUpA11y: (label: string): string => `Subir ${label}`,
    arHint: 'O que se lle vai esixir ao pequeno en cada exercicio. Fíxalos ti antes de empezar e non cambian durante a sesión: a app mide e rexistra, o criterio clínico é sempre voso.',
    arHoldLabel: 'Sostén do xesto (AR-1)',
    arHoldHint: 'Canto tempo debe manter os beizos redondeados para que o coche chegue á meta.',
    arTurnLabel: 'Xiro de cabeza (AR-2)',
    arTurnHint: 'Cantos graos debe xirar cara ao son para contar como orientación.',
    arWindowLabel: 'Xanela de resposta (AR-2)',
    arWindowHint: 'Tempo que se lle dá tras o son. Fóra de xanela é «sen resposta», nunca «erro».',
    arDwellLabel: 'Fixación para elixir (AR-3)',
    arDwellHint: 'Canto debe mirar un debuxo para seleccionalo. O anel de progreso amósallo.',
    gazePointerHint: 'O iris é máis preciso; o nariz, máis estable en teléfonos modestos. Se o punteiro treme, cambia a nariz: o exercicio non se entera.',
    arKicker: '🎯 REALIDADE AUMENTADA · LIMIARES CLÍNICOS',
    gazePointer: 'Punteiro da mirada (AR-3)',
    pointerIris: 'Iris',
    pointerNose: 'Nariz',
    pointerIrisA11y: 'Punteiro por iris',
    pointerNoseA11y: 'Punteiro por nariz',
  },

  pragmatic: {
    kicker: 'QUEBRA PRAGMÁTICA · SÓ ADULTOS',
    warnTitle: 'Esta tarefa xerará frustración útil',
    warnBody:
      'Vas romper a comunicación A PROPÓSITO para observar como o teu fillo/a a repara. '
      + 'É normal (e valioso) que se estrañe, proteste ou se frustre un pouco: esa reacción '
      + 'É o exercicio. Faino unha soa vez, con calma, e remata sempre cunha aperta '
      + 'e a orde dita ben.',
    closeLoopUpset:
      'Pecha agora a quebra: repite a orde ben dita, valida a emoción («confundinte, '
      + 'verdade?») e dádevos unha aperta. A reparación adulta tamén ensina.',
    notToday: 'Hoxe non',
    understood: 'Entendido, seguimos',
    swapVariant: 'Prefiro a outra variante →',
    didIt: 'Xa o fixen · que fixo o neno?',
    repairTitle: 'Como reparou a quebra?',
    repairBody: 'Elixe o PRIMEIRO que fixo o teu fillo/a. Non hai respostas malas: todas informan.',
    recorded: 'Rexistrado',
    closeLoop: 'Pecha o círculo: repite a orde ben dita e celebra a súa reacción. Reparar é unha habilidade, e acábaa de practicar!',
    backToSession: 'Volver á sesión',
    // Estresores: instrucións para o adulto, non texto locutado.
    stressorMurmurTitle: 'Murmurio',
    stressorMurmurText: 'Dá unha orde sinxela en voz MOI baixa e pouco clara, mirando cara a outro lado. Exemplo: «tráeme o…» (ininteligible).',
    stressorAbsurdTitle: 'Orde absurda',
    stressorAbsurdText: 'Pide algo imposible ou sen sentido con cara seria. Exemplo: «Pon o zapato dentro da neveira» ou «Dáme a nube da mesa».',
    // Escala de reparación: observación clínica do adulto.
    repairAskLabel: 'Pediu repetición',
    repairAskDesc: '«Que?», «outra vez?», achegouse a escoitar',
    repairRephraseLabel: 'Reformulou',
    repairRephraseDesc: 'Corrixiu ou negociou a orde absurda coas súas palabras',
    repairGestureLabel: 'Usou xestos',
    repairGestureDesc: 'Sinalou, encolleu os ombros, buscou a túa mirada',
    repairWithdrawLabel: 'Illouse',
    repairWithdrawDesc: 'Retirouse da interacción ou cambiou de actividade',
    repairCryLabel: 'Choro',
    repairCryDesc: 'Desborde emocional ante a quebra',
    repairNoneLabel: 'Non rexistrou a quebra',
    repairNoneDesc: 'Seguiu coma se a orde fose normal',
  },

  breaks: {
    routeKicker: '🏠 RUTA DE ROTINA · TPR 2.0',
    adultBanner: '👤 Panel do adulto · o neno NON toca a pantalla: escoita e actúa con obxectos reais.',
    ready: '▶ Estamos listos',
    repeatOrder: '🔊 Repetir a orde',
    repeatOrderA11y: 'Repetir a orde en voz alta',
    structure: (focus: string): string => `Estrutura: ${focus}`,
    notThisTime: '✖️ Non esta vez',
    skip: 'Saltar esta vez',
    tprKicker: '🧩 CÁPSULA TPR · ESCOITA E MÓVETE',
    tprSub: 'A app di a orde en voz alta e o neno responde co corpo (Total Physical Response).',
    tprRepeat: '🔊 Repetir a orde',
    tprDoneLast: '✅ Feito! Seguimos →',
    tprDone: '✅ Fíxoo!',
    routeDoneLast: '✅ Fíxoo · rematar',
    routeDone: '✅ Fíxoo',
    // Ancoraxe Visual Distante (20-20-20). O texto di SUXESTIÓN en todas as súas
    // formas: nada aquí detén a sesión e o pé déixao por escrito.
    visualAnchorKicker: '👁️ DESCANSO VISUAL · REGRA 20-20-20',
    visualAnchorTitle: 'Descanso visual recomendado',
    visualAnchorBody: 'Levades 20 minutos de pantalla preto. Lúa está lista para unha pausa de 20 segundos: que mire algo distante —unha xanela, o fondo da sala— mentres a gata dorme.',
    visualAnchorStart: (n: number): string => `▶ Empezar os ${n} segundos`,
    visualAnchorRunning: (n: number): string => `Mirando lonxe · ${n} s`,
    visualAnchorFarAway: 'Que siga mirando o máis lonxe que haxa na sala. Lúa dorme ata que remate.',
    visualAnchorResume: 'Retomar agora',
    visualAnchorLater: 'Agora non',
    visualAnchorHint: 'Lúa adormece durante a pausa. A sesión non se detén.',
    visualAnchorFoot: 'Suxestión · a app non detén a sesión, a pausa decídela ti.',
  },

  pro: {
    unlockPill: 'Desbloquear a Edición Profesional',
    unlockedPill: 'Modo profesional activo',
    modalTitle: 'Modo Profesional',
    pinError: 'PIN incorrecto. Téntao de novo.',
    demoPin: 'PIN de demostración: 1985',
    pinSubtitleDefault: 'Introduce o PIN de 4 díxitos do logopeda para editar a prescrición.',
    shareCancelled: 'Exportación cancelada · o rexistro consérvase para reintentar.',
    shareFailed: 'Non se puido abrir o menú de compartir · o rexistro consérvase.',
    exportKicker: '🔓 MODO PROFESIONAL · EXPORTACIÓN',
    exportTitle: 'Evidencia de usabilidade',
    exportSub: 'Escanea o QR para o resumo sen conexión ou comparte o rexistro completo cando haxa conexión.',
    qrCaption: 'Resumo sen conexión · escaneable coa cámara',
    shareLog: '📤 Compartir o rexistro completo (email · WhatsApp)',
    packaging: 'Empaquetando o rexistro…',
    shareTitle: 'Rexistro de usabilidade · Valeria+ (piloto)',
    exportPurged: 'Rexistro exportado e purgado do dispositivo.',
    statSessions: 'Sesións',
    statTprAbandon: 'Abandono TPR',
    statMisclicks: 'Misclicks',
    statSusMean: 'Media SUS',
    statSusAnswers: 'Respostas SUS',
    statFullBlocks: '4 bloques',
  },

  sus: {
    kicker: '💬 UNHA PREGUNTA RÁPIDA',
    question: 'Foi doado integrar este exercicio na rutina do meu fillo/a.',
    scaleA11y: (v: number, label: string): string => `${v} de 5: ${label}`,
    thanks: 'Grazas por axudarnos a mellorar Valeria+!',
    sub: 'Toca a cariña que mellor o describa. É anónimo e só tardas un segundo.',
    disagree: 'Nada de acordo',
    agree: 'Moi de acordo',
    neutral: 'Neutral',
    somewhat: 'Bastante',
    slightly: 'Pouco',
  },

  results: {
    back: '‹ Volver aos exercicios',
    title: 'Resultados e Evolución',
    noPatient: 'Paciente sen ficha rexistrada',
    recordNumber: (nhc: string): string => `NHC ${nhc}`,

    gameTitle: 'Motivación e logros',
    currentStreak: 'racha actual',
    totalXp: 'XP total',
    bestStreak: 'mellor racha',
    level: (n: number, name: string): string => `Nivel ${n} · ${name}`,
    xpToNext: (n: number): string => `${n} XP para o seguinte nivel`,
    badgesLabel: (won: number, total: number): string => `INSIGNIAS · ${won}/${total}`,

    adherenceTitle: 'Adherencia semanal',
    adherenceLabel: 'Adherencia da semana',
    adherenceValue: (done: number, goal: number): string => `${done} de ${goal} sesións completadas`,

    evolutionTitle: 'Evolución por estrelas',
    pairsChartSub: 'Pares mínimos · % de ensaios coa substitución detectada polo micrófono (baixar = mellorar)',
    sessionsCount: (n: number): string => `${n} ${n === 1 ? 'sesión' : 'sesións'}`,
    arTargetMs: (ms: number): string => `obxectivo ${ms} ms`,
    arMeasuredOn: (device: string, level: string, fps: number): string =>
      `Medido en ${device} · nivel ${level} · ${fps} fps sostidos`,
    arVoidedTrials: (n: number): string =>
      ` · ${n} ensaio${n === 1 ? '' : 's'} anulado${n === 1 ? '' : 's'} por movemento do teléfono`,
    evolutionSub: (n: number): string => `Promedio de estrelas · últimas ${n} sesións`,
    trendUp: (d: number): string => `▲ +${d} ★`,
    trendDown: (d: number): string => `▼ ${d} ★`,
    trendStable: '= estable',

    // Reconto do micrófono. Decisión de Frank: isto é un APOIO DO EXERCICIO e
    // nada máis. Non é unha medida da linguaxe, non ten finalidade sanitaria e
    // non entra en ningunha decisión clínica.
    speechTitle: 'Reconto do micrófono',
    speechSub: 'Cantas palabras da frase pedida recoñeceu o micrófono. É un apoio do exercicio, non unha medida.',
    speechWpu: 'palabras por frase',
    speechCoverage: 'da frase pedida',
    speechUtterances: (n: number): string => (n === 1 ? 'frase practicada' : 'frases practicadas'),
    speechNote:
      'Isto NON é unha medida clínica nin ten finalidade sanitaria. É un apoio do exercicio: serve '
      + 'para que o neno vexa por onde vai e para que ti vexas que palabra caeu. Non avalía a '
      + 'linguaxe, non vale para un diagnóstico nin para un informe, e non debe usarse para tomar '
      + 'ningunha decisión sobre o tratamento. Quen valora como fala o neno es ti, coa escala '
      + 'EPT-3, igual que no resto da app.',

    phonemeTitle: 'Substitución por fonema',
    pmFirstSession: 'primeira sesión',
    pmImproving: (d: number): string => `▼ ${d} pp · mellora`,
    pmWorsening: (d: number): string => `▲ +${d} pp · reforzar`,

    arNoTiming: 'Xogouse sen cronometrar: fan falta altofalantes externos por cable para medir os tempos. Os acertos si quedaron rexistrados.',
    arNoTrials: 'Aínda non hai ensaios con medida neste exercicio.',
    arTrials: 'ensaios',
    arVoided: 'anulados',
    arMean: (unit: string): string => `media (${unit})`,
    arMax: (unit: string): string => `máximo (${unit})`,
    arShareLine: (name: string, n: number, medida: string): string => `• ${name}: ${n} ensaios · ${medida}`,
    arTrial1: 'ensaio 1',
    arLabel: (id: string): string => {
      switch (id) {
        case 'ar1': return 'Sostén do xesto';
        case 'ar2': return 'Latencia do xiro';
        case 'ar3': return 'Fixación ata elixir';
        case 'ar4': return 'Busca espacial de Lúa';
        case 'ar5': return 'Latencia de lanzamento';
        case 'ar6': return 'Sostén de praxia mímica';
        default: return 'Medida AR';
      }
    },
    arHint: (id: string): string => {
      switch (id) {
        case 'ar1': return 'Milisegundos que mantivo o redondeo labial en cada ensaio. A liña de puntos é o obxectivo que fixastes vós.';
        case 'ar2': return 'Milisegundos entre o son e o xiro de cabeza. Só aparecen os ensaios que se puideron cronometrar.';
        case 'ar3': return 'Milisegundos de mirada sostida ata confirmar o debuxo.';
        case 'ar4': return 'Milisegundos ata localizar a Lúa coa retícula foveal e aliñar a postura cefálica.';
        case 'ar5': return 'Milisegundos desde que Lúa pide o peixe ata que o pequeno remata o xesto de lanzalo.';
        case 'ar6': return 'Milisegundos que sostivo a expresión ou praxia facial guiada con simetría bilateral.';
        default: return 'Milisegundos medidos durante o exercicio de realidade aumentada.';
      }
    },
    arTitle: (id: string): string => {
      switch (id) {
        case 'ar1': return 'AR-1 · Cinemática orofacial';
        case 'ar2': return 'AR-2 · Localización do son';
        case 'ar3': return 'AR-3 · Selección por fixación';
        case 'ar4': return 'AR-4 · Busca espacial de Lúa';
        case 'ar5': return 'AR-5 · Alimentar a Lúa';
        case 'ar6': return 'AR-6 · Espello mímico con Buddy Lúa';
        default: return `AR · ${id.toUpperCase()}`;
      }
    },
    arTrialN: (n: number): string => `ensaio ${n}`,

    historyLabel: 'HISTORIAL DE SESIÓNS',
    historyCount: (n: number): string => `${n} rexistradas`,
    average: (v: string): string => `Promedio: ${v} / 3`,
    understands: '👆 COMPRENDE',
    produces: '🗣 PRODUCE',
    responsesKicker: '📝 RESPOSTAS REXISTRADAS',

    newSession: 'Iniciar unha sesión nova →',
    backGhost: '↩ Volver aos exercicios',
    sharePdf: '📄 Compartir PDF',
    footNote: 'Historial almacenado unicamente neste dispositivo (local-first).',
    shareTitle: 'Resultados Valeria+',
    // Historial de EXEMPLO que se amosa antes de que existan sesións reais.
    demoHistory: (): Array<{ date: string; name: string; note: string }> => [
      { date: '10 xuñ', name: 'Asociación vocal inicial', note: 'Custoulle arrincar, pero acabou asociando as vogais con apoio.' },
      { date: '12 xuñ', name: 'Detección do intruso', note: 'Boa sesión, atopou o intruso tras a pregunta guía.' },
      { date: '15 xuñ', name: 'Recoñecemento de emocións', note: 'Moi concentrado hoxe, nomeou case todas as emocións.' },
      { date: '17 xuñ', name: 'Estrutura S-V-O', note: 'Construíu frases completas cos dados, gran avance.' },
      { date: '19 xuñ', name: 'Sesión de exercicios', note: 'Excelente. Respondeu as consignas case sen axuda.' },
    ],
    // Informe que o clínico comparte. Léeo unha persoa, así que segue o idioma
    // da interface.
    shareHeader: 'VALERIA+ · Resultados e Evolución',
    shareAdherence: (pct: number, done: number, goal: number): string => `Adherencia semanal: ${pct}% (${done}/${goal})`,
    shareTrend: (trend: string): string => `Tendencia: ${trend}`,
    shareHistory: 'Historial de sesións:',
    sharePm: 'Pares mínimos · substitución por fonema:',
    shareAr: 'Realidade aumentada · magnitudes medidas:',
    shareFoot: 'Informe local-first xerado no dispositivo.',
    shareSessionLine: (date: string, name: string, avg: string, stars: string, split: string, resp: string): string =>
      `• ${date} · ${name} — ${avg}/3 ${stars}${split}${resp}`,
    shareSplit: (comp: string, prod: string): string => ` [comprende ${comp}/3 · produce ${prod}/3]`,
    shareResponse: (code: string, text: string): string => `\n    · ${code} respondeu: «${text}»`,
    sharePmLine: (phoneme: string, pct: number, n: number): string =>
      `• ${phoneme}: ${pct}% de substitución na última sesión (${n} ${n === 1 ? 'sesión' : 'sesións'})`,
    shareArMeasure: (label: string, mean: number, unit: string, max: number, n: number): string =>
      `${label.toLowerCase()} media ${mean} ${unit} (máx. ${max} ${unit}, n=${n})`,
    shareArNoTiming: 'sen medida cronometrada',
    shareArVoided: (n: number): string => ` · ${n} anulados por movemento do teléfono`,
    shareDevice: (mk: string, model: string, level: string, fps: string): string =>
      `\n  Medido en ${mk} ${model} · nivel de aptitude ${level} · ${fps} fps sostidos`,
    shareThresholds: (hold: number, turn: number, win: number, dwell: number): string =>
      `\n  Limiares fixados polo adulto: sostén ${hold} ms · xiro ${turn}° · xanela ${win} ms · fixación ${dwell} ms`,
  },

  // Notificacións locais. Escríbeas a app e léeas o ADULTO na pantalla de
  // bloqueo, así que seguen o idioma de interface. As mensaxes prográmanse por
  // adiantado: ao cambiar de idioma hai que REPROGRAMAR, ou os avisos xa en cola
  // seguirían chegando no idioma anterior (faino AppNavigator).
  notifications: {
    channelName: 'Lembranzas de sesión',
    messages: (): Array<{ title: string; body: string }> => [
      { title: '🐱 A gata Lúa agárdate!', body: '5 minutiños de xogo valen ouro. Facemos unha sesión rápida?' },
      { title: '🔥 Non perdas a túa racha!', body: 'Unha sesión ao día mantén viva a chama. Imos xogar!' },
      { title: '👂 Momento de escoitar', body: 'Probamos o xogo dos sons? Só leva uns minutos.' },
      { title: '⭐ Hora de gañar estrelas', body: 'Cada exercicio suma XP. A por as 3 estrelas!' },
      { title: '🐸 A saltar e aprender!', body: 'Os xogos con movemento son os favoritos. Xogamos?' },
      { title: '🎯 Pequeno reto, gran avance', body: 'Un exercicio agora = un gran paso na súa linguaxe.' },
      { title: '🎉 Valeria ten un xogo novo!', body: 'Entra e descobre a pausa activa de hoxe.' },
      { title: '💪 Constancia = progreso', body: 'As familias que practican a diario ven o dobre de avance.' },
      { title: '🌈 Un anaquiño xuntos', body: 'Xogar, mover o corpo e aprender: todo nunha sesión Valeria.' },
      { title: '🏆 O teu logro agárdate', body: 'Estás preto de desbloquear unha insignia nova. Entra a por ela!' },
      { title: '🎵 Oes iso?', body: 'É a hora do Test de Ling e dos xogos de audición.' },
      { title: '🧩 Última chamada do día', body: 'Aínda estás a tempo de sumar a sesión de hoxe. Ánimo!' },
    ],
    parentTips: (): Array<{ title: string; body: string }> => [
      {
        title: '👀 Consello 1 · Os teus ollos e a túa boca son o seu mapa',
        body: 'Para aprender a articular, o teu fillo precisa ver como se fabrican as palabras. Agáchate ao seu nivel, mírao aos ollos e deixa que vexa a túa boca: o seu cerebro é un espello que copia os teus movementos. Se lle falas desde outra habitación, de costas ou mirando o móbil, quítaslle o mapa visual que precisa para mover os beizos e a lingua.',
      },
      {
        title: '📵 Consello 2 · A trampa das pantallas educativas',
        body: 'Móbiles, tabletas e televisores non ensinan a falar, aínda que o programa repita números ou cores. A linguaxe viva require quendas: falar, escoitar e responder. Unha pantalla non fai pausas para escoitar o teu fillo, non lle sorrí cando o tenta nin o corrixe con agarimo. As horas de práctica real só llas podes dar ti.',
      },
      {
        title: '🤫 Consello 3 · A regra do silencio',
        body: 'Os adultos falamos rápido e enchemos todos os silencios. Cando lle ofrezas algo (por exemplo, leite) e lle preguntes «que queres?», fai unha pausa e conta mentalmente ata cinco. Dálle tempo ao seu cerebro para procesar e organizar os músculos. Ese silencio estratéxico é o que o empurra a usar un son, un xesto ou unha palabra.',
      },
      {
        title: '🛁 Consello 4 · A rutina é a túa mellor aliada',
        body: 'Non precisas unha hora de exercicios nin materiais caros. O mellor momento para a linguaxe é o que xa fas cada día: mentres o bañas, nomea o xabón, a auga e as partes do corpo; mentres recollen a roupa, nomea as cores. Repetir palabras sinxelas en situacións reais da casa grava o vocabulario de forma definitiva.',
      },
      {
        title: '🐶 Consello 5 · Expande o que di, sen rifar',
        body: 'Se sinala un can e di «guau guau», non lle digas «así non se di»: devólvelle a frase mellorada, «si, é un can grande!». Se di «auga», respóndelle «queres beber auga». Ao expandir as súas palabras sen criticalo dáslle o modelo correcto e confírmaslle que o seu intento de comunicarse foi exitoso e valorado.',
      },
    ],
  },

  // Compoñentes de voz compartidos (ValeriaVoiceUI): botón de escoita, mapa da
  // quenda, xogo de micrófono, rexistro de resposta, tarxeta «Voz da app» e
  // bloque de privacidade do micrófono.
  voice: {
    listen: 'Escoitar',
    listenA11y: (text: string): string => `Escoitar: ${text}`,

    phaseListen: 'Escoita',
    phaseRepeat: 'Repite',
    phaseVerdict: 'Veredicto',
    phaseMission: 'Misión',
    currentPhase: (label: string): string => `Fase actual: ${label}`,

    micKicker: 'XOGO DE VOZ · AGORA O NENO!',
    micPrompt: (target: string): string => `Preme o micro e que diga: «${target}»`,
    micHearModel: 'Oír o modelo',
    micStartA11y: 'Empezar a escoitar',
    micStopA11y: 'Deixar de escoitar',
    micListening: 'Escoitando…',
    micTapToSpeak: 'Toca para falar',
    micHeard: 'A app escoitou:',
    micUnavailable:
      'O xogo de micrófono actívase na app instalada (APK). Mentres tanto, '
      + 'o neno pode repetir a palabra e ti valoras abaixo.',
    // Veredicto VISUAL do intento (para o adulto). O FALADO vai por
    // micVerdictSayFor, nos bancos por variedade: son cousas distintas.
    micVerdicts: [
      { icon: '👂', title: 'Outra vez xuntos', sub: 'Escoitade a palabra devagar e repetide á vez.' },
      { icon: '💪', title: 'Case case!', sub: 'Parécese moito. Repetide o modelo e probade outra vez.' },
      { icon: '🎉', title: 'Dixoo xenial!', sub: 'A app entendeu a palabra obxectivo.' },
    ],

    micCoverage: (hits: number, total: number): string =>
      `${hits} de ${total} palabras da frase`,

    sentenceCardsKicker: 'LÁMINAS DA FRASE',
    sentenceCardsProgress: (hits: number, total: number): string => `${hits} de ${total} palabras`,
    sentenceWordMatched: (word: string): string => `Palabra conseguida: ${word}`,
    sentenceWordPending: (word: string): string => `Palabra pendente: ${word}`,

    captureKicker: '📝 REXISTRA A SÚA RESPOSTA',
    capturePrompt: 'Grava co micro ou escribe o que dixo o neno.',
    capturePlaceholder: 'Escribe aquí o que dixo…',
    captureWriteA11y: 'Escribir a resposta do neno',
    captureRecordA11y: 'Gravar a resposta co micrófono',
    captureStopA11y: 'Deixar de gravar',
    captureListening: 'Escoitando… fala agora',
    captureOk: '✓ Resposta rexistrada: gardarase coa sesión en Resultados.',

    cardTitle: 'Voz da app',
    varietyLabel: 'Variedade da voz',
    // Nomes das variedades: endónimos, coma no resto da app.
    localeEs: 'Castelán',
    localeGl: 'Galego',
    localeEsDO: 'Dominicano',
    localeEu: 'Euskara',
    localeEnUS: 'English (US)',
    localeCa: 'Català',
    varietyA11y: (label: string, beta: boolean): string =>
      `Voz en ${label}${beta ? ', en probas' : ''}`,

    chipChecking: 'Comprobando…',
    chipNatural: '✓ Voz natural',
    chipStandard: 'Voz estándar',
    chipPoor: 'Voz mellorable',
    chipCeltia: '✓ Voz Celtia',
    chipHitz: '✓ HiTZ ahotsa',
    chipPiperEn: '✓ Piper en_US',
    chipMatxaCa: '✓ Veu Matxa (AINA)',

    detailSearching: 'Buscando a mellor voz en castelán instalada neste dispositivo…',
    detailNoVoice:
      'Non hai ningunha voz en castelán instalada: a app non poderá ler as consignas ata descargala.',
    detailDo: (name: string): string =>
      `En dominicano a app usa a voz latina do dispositivo${name ? ` («${name}»)` : ''} e o micrófono `
      + 'en es-DO. Se soa peninsular ou robótica, instala unha voz de Español (Latinoamérica).',
    detailGood: (name: string): string =>
      `A app usará a mellor voz do dispositivo${name ? ` («${name}»)` : ''}. Soa natural, non robótica.`,
    detailAndroidPoor:
      'Este dispositivo só ofrece unha voz sinxela e pode soar robótica. Instala as voces de '
      + 'Google (de balde e sen conexión) para que a app soe natural.',
    detailIosPoor:
      'Podes mellorar a voz en Axustes → Accesibilidade → Contido lido → Voces → Español, '
      + 'descargando a voz mellorada.',
    detailEn:
      'A voz neuronal en inglés (Piper en_US) viaxa dentro da app e funciona sen conexión: toca '
      + '«Probar a voz» para oíla. Os exercicios teñen banco propio e guía dialectal asinada: non '
      + 'se marcan como erro os trazos do inglés afroamericano nin os do falante bilingüe. Ao '
      + 'elixir esta variedade cambian a locución, o micrófono e o idioma da interface.',

    testVoice: '▶ Probar a voz',
    testVoiceA11y: 'Probar como soa a voz',
    installGoogle: '⬇️ Instalar as voces de Google',
    installGoogleA11y: 'Instalar as voces de Google',
    recheck: '🔄 Volver comprobar',
    recheckA11y: 'Volver comprobar a voz',
    installHint:
      'Tras instalar: Axustes → Sistema → Saída de texto a voz → elixe «Motor de voz de Google» e '
      + 'descarga a voz de Español (España). Despois volve aquí e toca «Volver comprobar».',

    privCapture:
      '⏺ CAPTURA DE CORPUS ACTIVA. Esta build garda no dispositivo o audio da quenda de fala. '
      + 'Non é unha build de produción: non debe usarse nunha sesión normal nin quedar no aparello '
      + 'dunha familia.',
    privKicker: 'MICRÓFONO DO EXERCICIO',
    privChecking: 'Comprobando onde se procesa a voz do neno nesta variedade…',
    privLocal: (label: string): string =>
      `En ${label} o recoñecemento faise dentro do teléfono: o audio da quenda de fala non sae `
      + 'do dispositivo.',
    privLocalFailed: (label: string): string =>
      `O paquete de ${label} figura instalado, pero ao escoitar de verdade o recoñecedor do teléfono `
      + 'non arrincou. Para non deixar o exercicio roto, a app volveu ao servizo de recoñecemento '
      + 'do sistema, que pode enviar o audio aos seus servidores. Toca «Volver comprobar» para '
      + 'tentalo outra vez en local.',
    privNotCapable: (label: string): string =>
      `Este dispositivo non sabe recoñecer voz sen conexión, así que en ${label} o audio da quenda de `
      + 'fala procésao o servizo de recoñecemento do sistema, que pode envialo aos seus servidores.',
    privNoService: (label: string): string =>
      `Este dispositivo non expón ningún servizo de recoñecemento de voz, así que en ${label} o xogo `
      + 'de micrófono non pode funcionar. Comproba en Axustes que o recoñecemento de voz do sistema '
      + 'estea instalado e activado.',
    privCanDownload: (label: string): string =>
      `Este móbil pode recoñecer sen conexión, pero fáltalle o paquete de ${label}. Mentres tanto, o `
      + 'audio da quenda de fala procésao o servizo do sistema, que pode envialo aos seus servidores.',
    privNoDownload: (label: string): string =>
      `Falta o paquete de ${label} e esta versión de Android non permite descargalo desde a app. Podes `
      + 'instalalo en Axustes → Sistema → Idiomas → Entrada por voz; ata entón o audio procésao '
      + 'o servizo do sistema.',
    privOffer: (label: string): string =>
      `Se descargas o paquete de ${label}, a voz do neno deixa de saír do teléfono. Ocupa espazo e `
      + 'descárgase unha soa vez; os exercicios funcionan igual se prefires non facelo.',
    privDownload: '⬇️ Descargar o paquete',
    privDownloadA11y: (label: string): string =>
      `Descargar o paquete de recoñecemento de voz en ${label}`,
    privNotNow: 'Agora non',
    privNotNowA11y: 'Non descargar o paquete de voz',
    privRecheckA11y: 'Volver comprobar onde se recoñece a voz',
    privNoteOk: '✓ Paquete descargado. A partir de agora a voz recoñécese dentro do teléfono.',
    privNoteDialog:
      'Abriuse a pantalla de descarga do sistema. Cando remate, toca «Volver comprobar».',
    privNoteCancelled: 'Descarga cancelada. Séguese usando o recoñecemento do sistema.',
    privNoteFailed:
      'Non se puido pedir a descarga neste dispositivo. Podes facelo desde Axustes → Sistema → '
      + 'Idiomas → Entrada por voz.',
    privNoteDeclined: 'Sen problema: os exercicios funcionan igual co recoñecemento do sistema.',
    privLastListen: (local: boolean): string =>
      `Última escoita desta sesión: ${local ? 'no teléfono' : 'servizo do sistema'}.`,
    privRecognizer: (name: string): string => `Recoñecedor do sistema: ${name}.`,
  },

  // Control de ruído babble do panel do adulto.
  noise: {
    kicker: 'RUÍDO DE FONDO (BABBLE)',
    off: 'apagado',
    levelTag: (n: number): string => `nivel ${n}`,
    hint: 'Só o controlas ti: sobe o murmurio de cafetería pouco a pouco se o teu logopeda cho indicou. A app nunca o cambia soa.',
    sliderA11y: 'Nivel de ruído de fondo',
    silence: 'Silencio',
    cafe: 'Cafetería',
  },

  settings: {
    uiLangTitle: 'Idioma da aplicación',
    uiLangHint:
      'Cambia a app enteira: os menús que les ti e tamén o que soa nos '
      + 'exercicios. Se queres a interface nun idioma e os exercicios noutro, '
      + 'cámbiaa despois en «Voz da app».',
    uiLangAuto: 'Automático',
    uiLangAutoHint: 'Segue o idioma dos exercicios.',
    uiLangEs: 'Español',
    uiLangEn: 'English',
    uiLangCa: 'Català',
    uiLangGl: 'Galego',
  },


  // Bloque de Realidade Aumentada. A cámara MIRA, non grava: o texto de
  // consentimento é parte do muro MDR, non adorno — tradúcese enteiro ou non se
  // traduce (unha mestura de idiomas aquí é un consentimento inválido).
  ar: {
    title: 'Realidade Aumentada',
    subPreparing: 'Preparando a sesión',
    subUnsupported: 'Non dispoñible neste dispositivo',
    subConsent: 'Antes de acender a cámara',
    subWarmup: 'Quecemento con Lúa',
    subNotApt: 'Este teléfono non dá para estes xogos',
    subLevel: (label: string): string => `Nivel deste teléfono: ${label}`,
    sessionDone: 'Sesión rematada',
    oneMoment: 'Un momento…',

    busyMeasuring: 'Medindo este teléfono… (uns 90 segundos)',
    busyCalibrating: 'Imos xogar a seguir a Lúa polas esquinas (15 segundos)…',
    busyOpeningCamera: 'Abrindo a cámara…',

    noticeAptitudeFailed: 'Non se puido completar a proba neste teléfono. Podes tentalo de novo.',
    noticeCameraBusy: 'Outra aplicación está a usar a cámara. Péchaa e volve tentalo.',
    noticeArServicesOutdated: 'Actualiza «Servizos de Google para RA» desde Play Store e volve tentalo.',
    noticeArServicesMissing: 'Este bloque precisa «Servizos de Google para RA». Acepta a instalación cando cha ofreza.',
    noticeArServicesInstalling: '«Servizos de Google para RA» aínda se está a instalar. Agarda uns segundos e volve tentalo.',
    noticeCameraDenied: 'Sen permiso de cámara non se pode facer o quecemento. Podes concedelo e volver tentalo.',
    noticeCalibrationFailed: 'A calibración non se completou. Coloca o teléfono apoiado, en horizontal, a un palmo e medio da cara e proba outra vez.',
    noticeLaunchFailed: 'O exercicio non chegou a abrirse. Comproba que a app ten permiso de cámara.',
    noticeDenied: 'Sen permiso de cámara non hai exercicios de Realidade Aumentada. O resto da app funciona igual.',
    noticeTimeout: 'O exercicio pechouse porque a cámara deixou de ver a cara do pequeno. Apoia o teléfono en horizontal, a un palmo e medio da súa cara e á altura dos seus ollos, e proba outra vez.',

    noticeNoMeasurement: 'O quecemento rematou sen poder medir nada. Pecha as demais aplicacións que usen a cámara, comproba que hai luz abondo e volve tentalo. En «Ver os sinais en vivo» podes comprobar se a cámara está a entregar imaxe.',
    noticeReviewUnavailable: 'O Modo Revisión non está dispoñible nesta versión da app.',

    busyReview: 'Preparando o Modo Revisión…',
    reviewBanner: 'MODO REVISIÓN · Este teléfono NON está caracterizado. O que fagas aquí non se rexistra, non conta para o neno e non entra no estudo.',
    reviewEnter: 'Modo Revisión (PIN profesional)',
    reviewEnterA11y: 'Entrar no Modo Revisión co PIN profesional',
    reviewPinSubtitle: 'O Modo Revisión abre os exercicios sen o quecemento. Non mide nada: é para revisar as pantallas, non para usar cun pequeno.',

    unsupportedTitle: 'Aquí non se pode xogar aínda',
    unsupportedBody: 'Estes exercicios precisan a cámara frontal e unha versión da app instalada no teléfono (non funcionan na vista previa de Expo Go). Os outros seis bloques de exercicios funcionan exactamente igual de ben.',

    consentTitle: 'Que fai a cámara nestes xogos',
    consentLead1: 'Neste bloque a cámara frontal non grava: ',
    consentLeadStrong: 'mira',
    consentLead2: '. Serve para saber se o teu pequeno redondea os beizos, xira a cabeza cara a un son ou mira un debuxo, e para que o coche, o can ou a mazá reaccionen a ese xesto.',
    consentNoRecordStrong: 'Non se grava nin se garda ningunha imaxe.',
    consentNoRecord: ' Cada fotograma analízase e descártase ao instante.',
    consentNoUploadStrong: 'Ningún vídeo sae do teléfono.',
    consentNoUpload: ' Toda a análise ocorre aquí dentro, sen internet.',
    consentNoFaceIdStrong: 'Non se recoñece a cara de ninguén.',
    consentNoFaceId: ' Só se miden xestos: graos, milisegundos e proporcións.',
    consentMicOffPre: 'En dous dos tres exercicios o ',
    consentMicOffStrong: 'micrófono está apagado',
    consentMicOffPost: ': prémiase o esforzo motor antes de pedir que fale.',
    consentRevoke: 'Podes saír en calquera momento e retirar este permiso desde os axustes de Android.',
    consentAccept: 'Enténdoo e acepto',
    consentAcceptA11y: 'Aceptar o uso da cámara e continuar',
    consentDecline: 'Agora non',

    warmupTitle: 'Un xogo de quecemento de minuto e medio',
    warmupBody1a: 'Cada teléfono é distinto e estes exercicios esixen bastante. Antes de empezar, a app fai unha proba curta —mirar a Lúa, seguila ás esquinas, escoitar dous sons— para saber que pode ofrecer ',
    warmupBody1Strong: 'neste teléfono concreto',
    warmupBody1b: '. Faise unha soa vez.',
    warmupBody2a: 'Apoia o teléfono nun libro ou nunha caixa, en ',
    warmupBody2Strong: 'horizontal',
    warmupBody2b: ', a un palmo e medio da cara do pequeno (uns 30-35 cm), e déixao quieto.',
    warmupStart: 'Empezar o quecemento',
    warmupStartA11y: 'Empezar o quecemento',
    warmupRedo: 'Repetir o quecemento',
    warmupRedoA11y: 'Repetir o quecemento deste teléfono',

    notAptTitle: 'Mellor non forzalo',
    notAptBody: 'Non é un fallo teu nin do pequeno: a cámara e os debuxos en 3D á vez piden máis do que este aparello pode soster, e un exercicio a tiróns non mide nada.',
    notAptNoFrontCamera: 'Este teléfono non ofrece a súa cámara frontal á Realidade Aumentada. Non é cuestión de actualizar nada: os exercicios deste bloque precisan ver a cara do pequeno e aquí non poden.',
    notAptDeviceUnsupported: 'Este teléfono non está entre os que admiten Realidade Aumentada. Non é cuestión de actualizar nada: o resto de bloques de Valeria+ funcionan con normalidade.',
    notAptBack: 'Volver aos bloques',

    levelLabel: (level: string): string => ({
      A: 'Instrumento', B: 'Clínico', C: 'Reducido', D: 'Non apto',
    }[level] ?? level),
    levelNote: (level: string): string => ({
      A: 'Este teléfono mide con precisión abonda: os tres exercicios están dispoñibles e a sesión pode entrar no estudo.',
      B: 'Os exercicios funcionan ben, pero o reloxo da cámara ou a saída de audio non permiten cronometrar o xiro: a localización do son xógase sen rexistrar tempos.',
      C: 'O punteiro deste teléfono é demasiado inestable para tres dianas: a selección por mirada vai con dúas, que é unha elección forzada perfectamente válida.',
      D: 'Este teléfono non sostén a cámara e a escena 3D á vez. O bloque de Realidade Aumentada non aparece; os outros seis funcionan igual de ben.',
    }[level] ?? ''),
    levelHeading: (maker: string, model: string, level: string, label: string): string =>
      `${maker} ${model} · nivel ${level} (${label})`,

    shareProfile: 'Compartir a ficha do teléfono',
    shareProfileA11y: 'Compartir a ficha técnica deste teléfono',
    shareTitle: 'Valeria+ · ficha de aptitude do teléfono',
    shareHeader: 'VALERIA+ · Censo de dispositivos (bloque de Realidade Aumentada)',
    shareMaker: 'Fabricante', shareModel: 'Modelo', shareOs: 'Sistema',
    shareLevel: 'NIVEL DE APTITUDE',
    shareFps: 'fps sostidos (p5)', shareThermal: 'Caída térmica',
    shareTimestamps: 'Marcas de tempo de cámara', shareJitter: 'Jitter de audio',
    shareJitterNone: 'sen medir (sen montaxe)',
    sharePointer: 'RMS do punteiro', shareImu: 'IMU dispoñible',
    shareYes: 'si', shareNo: 'non',
    shareScreen: 'Pantalla', shareSeparation: 'Separación acadable con 3 dianas',
    shareFooter: (date: string): string =>
      `Medido o ${date}. Sen datos do neno: é a ficha do aparello.`,

    exercisesKicker: 'EXERCICIOS DISPOÑIBLES',
    practiceA11y: (name: string): string => `Practicar ${name}`,
    unavailableA11y: (name: string): string => `${name}: non dispoñible neste teléfono`,
    flagGameOnly: 'Xógase, pero sen cronometrar o xiro: fai falta unha montaxe de altofalantes.',
    flagTwoTargets: 'Con dous debuxos en pantalla: neste teléfono tres quedarían demasiado xuntos.',
    flagUnavailable: 'Non dispoñible neste teléfono.',

    liveSignals: 'Ver os sinais en vivo',
    liveSignalsA11y: 'Ver os sinais en vivo, ferramenta para a logopeda',
    liveSignalsSub: 'Para a logopeda: distancia, graos de xiro, apertura de beizos e fotogramas por segundo, en cru. Sen reforzo e sen rexistrar nada.',

    setupTitle: 'Como colocar o teléfono',
    setupBody: 'Apoiado nun libro, nunha caixa ou contra a parede, en horizontal, a un palmo e medio da cara. A pantalla avisa en verde cando a posición vale. Se o teléfono se move durante un ensaio, ese ensaio anúlase: é preferible perdelo a apuntalo mal.',

    measuredTitle: 'O que se mediu',
    mdrNote: 'Estes son datos en bruto, non unha valoración. A app mide e anota; quen interpreta se isto é moito ou pouco para o voso pequeno é a vosa logopeda.',
    backToExercises: 'Volver aos exercicios',
    streakLine: (days: number, level: number, levelName: string): string =>
      `${days} ${days === 1 ? 'día' : 'días'} de racha · Nivel ${level} · ${levelName}`,

    rowTrials: 'Ensaios xogados',
    rowVoided: 'Ensaios anulados (o teléfono moveuse)',
    rowHoldMax: 'Sostén máis longo',
    rowHoldMean: 'Sostén medio',
    rowHoldTarget: 'Obxectivo fixado por vós',
    rowCatchTrials: 'Ensaios sen son (control)',
    rowTimedTurns: 'Xiros medidos con reloxo',
    rowTimedTurnsNone: 'ningún: xogouse sen cronómetro',
    rowLatencyMedian: 'Latencia mediana do xiro',
    rowTargets: 'Dianas en pantalla',
    rowDwellMean: 'Fixación media ata elixir',
    rowAcquisitionMean: 'Tempo medio de busca espacial',
    rowJitterRms: 'Estabilidade angular (Jitter RMS)',
    rowThrowVelocityMean: 'Velocidade media de lanzamento',
    rowThrowLatency: 'Latencia media de lanzamento',
    rowAimDeviation: 'Desviación media de puntería',
    rowMimicHoldMean: 'Sostén medio de praxia',
    rowSymmetryMean: 'Simetría bilateral media',
  },
  academy: {
    back: '‹ Volver',
    backA11y: 'Volver ao hub de Academy',
    headerTitle: 'Academy',
    headerSub: 'Entende que lle pasa ao teu pequeno e como acompañalo, en cápsulas de dous minutos.',
    langFallbackNotice: 'As cápsulas de formación aínda non están en galego: léelas en castelán. O resto da app e todos os exercicios si están en galego.',
    progressTxt: (completed: number, total: number, pct: number): string => `${completed}/${total} · ${pct}%`,
    xpTxt: (xp: number): string => `${xp} XP`,
    hubCardTag: 'PARA TI',
    hubCardSub: 'Entende o trastorno antes de exercitalo: Linguaxe, Hipoacusia, Dislalias, Dislexia e TEA.',
    hubCardComplete: 'Formación completada',
    hubCardProgress: (completed: number, total: number, pct: number): string => `${completed}/${total} unidades · ${pct}%`,
    hubCardA11y: (completed: number, total: number): string => `Valeria Academy: formación para coidadores. ${completed} de ${total} cápsulas completadas.`,
    nextStepKicker: 'EMPEZA POR AQUÍ',
    nextStepReason: (domain: string): string => `Suxerido pola ficha: ${domain}.`,
    priorityA11y: (title: string, domain: string): string => `Prioridade suxerida: ${title}. Dominio ${domain}.`,
    whyKicker: 'POR QUE ESTA CÁPSULA?',
    readTime: (min: number): string => `${min} min de lectura`,
    startCapsule: 'Empezar a cápsula',
    domainsKicker: 'DOMINIOS FORMATIVOS',
    domainCardA11y: (label: string, completed: number, total: number, level: string): string => `${label}. ${completed} de ${total} completadas. Nivel ${level}.`,
    comingSoon: 'Proximamente',
    slideOf: (cur: number, total: number): string => `Diapositiva ${cur} de ${total}`,
    nextSlide: 'Seguinte',
    takeQuiz: 'Facer o quiz',
    quizKicker: 'MICROQUIZ · COMPROBACIÓN',
    quizSub: 'Responde a estas preguntas para fixar o aprendido.',
    questionOf: (cur: number, total: number): string => `Pregunta ${cur} de ${total}`,
    passedTitle: 'Cápsula superada!',
    failedTitle: 'Case o tes',
    scoreSub: (pct: number): string => `Acertaches o ${pct}% das preguntas.`,
    passRequirement: (threshold: number): string => `Precisas polo menos ${threshold}% para superala. Repasa e volve tentalo!`,
    claimXp: (xp: number): string => `Reclamar +${xp} XP`,
    reviewAndRetry: 'Repasar e reintentar',
    close: 'Pechar',
    closeA11y: 'Pechar a xanela de Academy',
    badgesKicker: 'INSIGNIAS DO DOMINIO',
    noBadgesYet: 'Completa cápsulas para desbloquear insignias.',
    capsulesKicker: 'CÁPSULAS DISPOÑIBLES',
    completedTag: 'COMPLETADA',
    perfectTag: '100% PERFECTO',
    deviceGuideTitle: 'Hipoacusia / Xordeira',
    deviceGuideProgress: (completed: number, total: number, pct: number, level: string): string => `${completed}/${total} guías · ${pct}% · ${level}`,
    tabClinicalConcepts: 'Conceptos clínicos',
    tabDeviceManagement: 'Manexo de dispositivos',
    earAnatomyCaption: 'Como viaxa o son ata a cóclea.',
    markSeen: 'Marcar como vista',
    seenTag: '✓ Vista',
    claimGuideXp: (xp: number): string => `+${xp} XP`,
    badgesTxt: (count: number): string => `${count} ${count === 1 ? 'insignia' : 'insignias'}`,
    backToCapsules: 'Volver ás cápsulas',
    signPreviewTitle: 'Configuracións de man debuxadas',
    signPreviewSub: 'As 27 letras do alfabeto dactilolóxico están na cápsula «O alfabeto dactilolóxico».',
    nextQuestion: 'Seguinte pregunta',
    seeResult: 'Ver o resultado',
    exitQuiz: 'Saír',
    receptiveLang: 'Linguaxe Receptiva (Comprensión)',
    expressiveLang: 'Linguaxe Expresiva (Produción / Fala)',

    // Rótulos dos esquemas vectoriais de hardware auditivo. Van dentro do SVG e
    // por iso están CENTRADOS: ancorados á esquerda, o inglés (máis longo) saía
    // do viewBox de 200.
    schema: {
      earA11y: 'Esquema do oído: pavillón, conduto auditivo, tímpano e cóclea.',
      earOuter: 'Externo',
      earMiddle: 'Medio',
      earCochlea: 'Cóclea',
      aidA11y: 'Esquema dun audiófono retroauricular: corpo, tubo e molde.',
      aidMic: 'Micrófono',
      aidMold: 'Molde',
      aidTube: 'Tubo',
      ciA11y: 'Esquema dun implante coclear: procesador externo, antena con imán e electrodos na cóclea.',
      ciProcessor: 'Procesador',
      ciCoil: 'Antena / imán',
      ciElectrodes: 'Electrodos',
      baA11y: 'Esquema dun implante osteointegrado: procesador, piar ancorado ao óso e transmisión por vía ósea.',
      baAbutment: 'Piar (óso)',
      baProcessor: 'Procesador',
      baBone: 'Vía ósea',
    },
  },
  sensory: {
    blockTag: 'MÓDULO SENSORIAL',
    blockTitle: 'Integración Sensorial',
    blockSubtitle: 'Desensibilización sistemática, modulación e anticipación visual ante sons cotiáns.',
    xpTotal: (xp: number): string => `${xp} XP`,
    sessionsCount: (n: number): string => `${n} ${n === 1 ? 'sesión' : 'sesións'}`,
    clinicalNoticeTitle: 'Muro de Control Adulto e Seguridade Clínica',
    clinicalNoticeBody:
      'Ti configuras a intensidade e a duración. O neno ou a nena pode pedir unha pausa ou deter o exercicio en calquera momento. Parar nunca é un fallo nin resta progreso.',
    activitiesHeader: 'ACTIVIDADES SENSORIAIS',
    pilotBadge: 'PILOTO FUNCIONAL',
    inDevBadge: 'PROXIMAMENTE',
    availableTag: 'Dispoñible',
    inDevTag: 'En desenvolvemento',

    // Prescrición do logopeda sobre as seis actividades (PIN profesional).
    prescribedOf: (active: number, total: number): string => `${active} de ${total} prescritas`,
    notPrescribed: 'Non prescrita',
    pinSubtitle: 'Introduce o PIN de 4 díxitos do logopeda para elixir que actividades sensoriais practica a familia.',
    proUnlocked: 'Modo profesional desbloqueado.',
    savePrescription: 'Gardar Prescrición',
    saveHelper: 'A selección gárdase no dispositivo e a edición bloquéase de novo.',
    savedPrescription: (n: number): string => `Prescrición gardada · ${n} actividades sensoriais activas.`,
    lockedHint: 'Modo Familia · só o logopeda pode cambiar que actividades sensoriais se practican.',
    prescriptionEmpty: 'Sen actividades prescritas. O logopeda decide cales se practican.',
    completedTimes: (n: number): string => `Completada ${n} ${n === 1 ? 'vez' : 'veces'}`,

    isa01Title: 'O meu son, o meu botón',
    isa01Desc: 'Construír control, axencia e previsibilidade sobre o estímulo sonoro.',
    isa02Title: 'Semáforo de sons',
    isa02Desc: 'Asociar sinal visual, inicio e fin do estímulo.',
    isa03Title: 'Detective de sons',
    isa03Desc: 'Identificar sons cotiáns sen sobrecarga.',
    isa04Title: 'Preto e lonxe',
    isa04Desc: 'Explorar distancia e intensidade baixo control adulto.',
    isa05Title: 'Atopa a voz',
    isa05Desc: 'Práctica de figura-fondo simple con ruído suave.',
    isa06Title: 'Ambientes vivos cotiáns',
    isa06Desc: 'Simulación controlada de aula escolar, centro comercial e rúa con tráfico e obras.',

    catAll: 'Todos',
    catEcological: 'Ambientes vivos (Colexio, Súper, Rúa)',
    catAppliances: 'Electrodomésticos',
    catAlerts: 'Alertas e Natureza',
    ecologicalBadge: 'AMBIENTE VIVO SIMULADO',

    adultGateTag: 'CONTROL ADULTO · CONFIGURACIÓN',
    prepTitle: 'Preparación da Sesión',
    prepSubtitle: 'Axusta os parámetros antes de ceder o dispositivo.',
    selectStimulusLabel: 'Estímulo ou ambiente acústico',
    selectCategoryLabel: 'Filtrar por tipo de contorna',
    intensityLabel: 'Intensidade sonora relativa',
    intensityHint1: 'Nivel 1: Moi suave (filtrado sublimiar)',
    intensityHint2: 'Nivel 2: Suave (volume baixo confortable)',
    intensityHint3: 'Nivel 3: Media (volume ambiente controlado)',
    intensityHint4: 'Nivel 4: Moderada (estímulo natural graduado)',
    intensityHint5: 'Nivel 5: Media-alta (achegamento ecolóxico)',
    durationLabel: 'Duración da microexposición',
    tierMicro: 'Micro (3s)',
    tierShort: 'Curta (7s)',
    tierMedium: 'Media (15s)',
    tprStrategyTitle: 'Estratexia de regulación asociada (TPR)',
    startWithChildBtn: 'Iniciar a sesión co neno/a',

    anticipationKicker: 'ANTICIPACIÓN VISUAL',
    anticipationSub: 'O son vai comezar sen sorpresas.',

    exploringTag: 'EXPLORACIÓN CONTROLADA',
    listeningNotice: 'Son en reprodución. Mantén a calma.',
    pressToStartNotice: 'Toca o botón cando esteas preparado/a para escoitar.',
    noAudioNotice: 'Este dispositivo non reproduce o estímulo sonoro.',
    noAudioWarning:
      'Este dispositivo non pode reproducir o son do exercicio. A sesión pódese percorrer, pero NON hai estímulo auditivo: non a uses como exposición real.',
    luaQuietHint: 'Lúa acompaña en silencio e tranquilidade.',
    mySoundMyButton: 'O meu son, o meu botón',
    soundActiveBtn: 'Escoitando…',
    askPauseBtn: 'Pedir unha pausa',
    stopActivityBtn: 'Deter',

    pausedTag: 'PAUSA SEGURA',
    pausedTitle: 'Pausa para regularse',
    pausedSubtitle: 'Parar está ben e é parte da aprendizaxe.',
    stoppingIsOkTitle: 'A autorregulación é un éxito',
    stoppingIsOkBody:
      'Decidiches pausar. Respira fondo ou realiza a estratexia de calma antes de continuar.',
    tryThisStrategy: 'Estratexia de calma suxerida:',
    resumeBtn: 'Retomar o son',
    closeAndRateBtn: 'Finalizar e rexistrar',

    sessionCloseTag: 'REXISTRO CLÍNICO ADULTO',
    sessionSummaryTitle: 'Valoración da Sesión',
    sessionSummarySub: 'O adulto rexistra a resposta. A participación sempre suma progreso.',
    childResponseLabel: 'Como respondeu o neno ou a nena?',
    respCalm: 'Tranquilo / Regulado',
    respAttentive: 'Atento / Con curiosidade',
    respSensitive: 'Sensible / Pediu unha pausa',
    respOverwhelmed: 'Incomodidade / Detención temperá',
    tprAppliedToggle: 'Realizouse a estratexia de calma (TPR)',
    saveSessionBtn: 'Gardar a sesión e sumar XP',

    wellDoneTitle: 'Sesión completada!',
    wellDoneSub: 'Exploraches e regulaches a escoita con éxito.',
    xpAddedToSensorySilo: 'Engadidos ao progreso de Integración Sensorial',
    backToSensoryListBtn: 'Volver ás actividades sensoriais',
  },

  // O Encerado Máxico de Lúa · Módulo de Grafomotricidade, Escritura e Dislexia
  writing: {
    kicker: 'ENCERADO MÁXICO DE LÚA',
    title: 'Grafomotricidade e Escritura',
    sub: 'Trazado guiado con lapis óptico · Dislexia e discriminación de grafemas',
    tabCritical: 'Letras críticas',
    tabWarmup: 'Lazos',
    tabFree: 'Encerado libre',
    // O que soa é o NOME da letra, non o fonema illado: o botón di o que fai.
    hearModel: 'Oír a letra',
    clearCanvas: 'Limpar o encerado',
    toggleGuide: 'Pauta Montessori',
    checkStroke: 'Comprobar o trazo!',
    strokeCompleted: 'Trazo perfecto!',
    strokeCompletedSub: 'Seguiches a dirección e a orde sen dubidar.',
    strokeAlmost: 'Case o tes!',
    strokeAlmostSub: 'Segue as frechas e os puntos de control en orde.',
    strokeColor: 'Cor do xiz máxico',
    strokeWidth: 'Grosor do trazo',
    targetLetter: (l: string): string => `Traza a letra: ${l}`,
    targetWord: (w: string): string => `Escribe a palabra: ${w}`,
    targetLoop: 'Segue o camiño de Lúa sen levantar o lapis',
    nextExercise: 'Seguinte trazo →',
    prevExercise: 'Trazo anterior',
    progress: (curr: number, total: number): string => `Trazo ${curr} de ${total}`,
    congratsTitle: 'Encerado completado!',
    congratsSub: 'Completaches todos os trazos da serie con gran destreza.',


    // Barra de ferramentas: só se len en voz alta (lector de pantalla).
    colorTurquoise: 'Xiz turquesa',
    colorGold: 'Xiz dourado',
    colorCoral: 'Xiz coral',
    colorSky: 'Xiz azul ceo',
    colorViolet: 'Xiz lavanda',
    widthFine: 'Trazo fino',
    widthMedium: 'Trazo medio',
    widthThick: 'Trazo groso',
  },

  luaHub: {
    title: 'Aventuras con Lúa',
    subtitle: 'Actividades de linguaxe e comunicación por idade',
    allAges: 'Todas',
    band02: '0–2 anos',
    band23: '2–3 anos',
    band34: '3–4 anos',
    band45: '4–5 anos',
    band57: '5–7 anos',
    band710: '7–10 anos',
    bandSubtitle02: 'Atención conxunta, imitación e vocalizacións',
    bandSubtitle23: 'Vocabulario e fonoloxía temperá',
    bandSubtitle34: 'Instrucións, pragmática e fluidez suave',
    bandSubtitle45: 'Narrativa, sintaxe e conceptos',
    bandSubtitle57: 'Conciencia fonolóxica e estratexias de fluidez',
    bandSubtitle710: 'Linguaxe abstracta, narrativa complexa e autorregulación',

    secAssessmentTitle: 'Exercicios con Lúa',
    secAssessmentSub: 'Lúa pide unha cousa cada vez, graduada por idade. Acerte ou non, devólvella ben dita, sen dicirlle que está mal.',
    secAssessmentBadge: (n: number): string => `${n} exercicios`,
    secStoriesTitle: 'Contos con Lúa',
    secStoriesSub: '10 historias ilustradas con comprensión, vocabulario clave e debuxo libre.',
    secStoriesBadge: (n: number): string => `${n} contos`,
    secSongsTitle: 'Cancións e Praxias',
    secSongsSub: '10 cancións con pausas activas, ritmo e patróns motores orofaciais.',
    secSongsBadge: (n: number): string => `${n} cancións`,

    evalProgress: (curr: number, total: number): string => `Exercicio ${curr} de ${total}`,
    evalClinicalSupport: 'Pauta de apoio para o adulto',
    evalAdultCue: 'Para o adulto',
    evalAdultRecord: 'Rexistro do adulto',
    evalAdultRecordHint: 'Observa o pequeno e marca o que fixo. Isto non o elixe el.',
    activityFinish: 'Rematar e gañar o premio',
    activityDone: 'Actividade completada! Lúa viuno.',
    sectionEmptyForBand: 'Aínda non hai nada desta sección para esta idade.',
    gameBlankSlot: 'Espazo libre',
    gameClue: (n: number): string => `Pista ${n}`,
    secGamesTitle: 'Xogos con Lúa',
    secGamesSub: 'Xogos de selección: memorama, imaxe-palabra, sons iniciais, secuencias, clasificación, atención e pistas.',
    secGamesBadge: (n: number): string => `${n} xogos`,
    evalTargetReinforcement: 'Excelente resposta!',
    evalRecastModel: 'Modelado suxerido (sen castigo)',
    evalAdultGuidance: 'Guía clínica práctica',
    evalPlayAudio: 'Escoitar outra vez',
    evalNextQuestion: 'Seguinte exercicio →',
    evalPrevQuestion: '← Anterior',
    evalFinishBand: 'Completar a serie',
    evalBandCompletedTitle: 'Serie completada!',
    evalBandCompletedSub: 'Fixeches todos os exercicios desta idade con Lúa.',
    evalBackToHub: 'Volver ao módulo',
    evalTryAgain: 'Repetir a serie',

    storyPages: (curr: number, total: number): string => `Páxina ${curr} de ${total}`,
    storyReadAloud: 'Ler en voz alta',
    storyVocabTitle: 'Vocabulario clave',
    storyQuestionsTitle: 'Preguntas de comprensión',
    storyDrawingPrompt: 'Debuxa con Lúa',
    storyOpenDrawing: 'Abrir o lenzo de debuxo',

        rhythmTitle: 'Recitado rítmico',
    rhythmHint: 'A app non canta: recita a letra a un pulso constante. Seguide o punto que se acende e dicide un verso por compás. Serve para marcar sílabas, baixar a velocidade da fala e practicar o acento.',
    rhythmStart: '▶ Recitar a pulso',
    rhythmStop: '■ Parar o pulso',
    rhythmTempo: (bpm: number): string => `${bpm} pulsos por minuto`,
    rhythmA11y: (bpm: number, beats: number): string =>
      `Metrónomo visual: ${bpm} pulsos por minuto, ${beats} pulsos por verso.`,

    songPlayTrack: 'Reproducir a canción',
    songMotorInstructions: 'Instrucións de movemento',
    songPraxiasTitle: 'Praxias e articulación',

    printableAges: (age: string): string => `Idade recomendada: ${age}`,
  },
};
