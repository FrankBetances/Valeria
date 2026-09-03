// ============================================================================
// Valeria+ · Catálogo de cadenas de INTERFAZ · castellano (EN-2.1)
//
// Este fichero es la FUENTE DE VERDAD del catálogo: su forma define el tipo
// `UiStrings`, y `strings.en.ts` se declara con ese tipo. Consecuencia
// buscada: si aquí se añade una clave y allí no, `npm run typecheck` falla.
// Una cadena que falta tiene que romper el build, no aparecer en blanco en la
// tablet de una familia.
//
// Convenciones:
//   · Un namespace por pantalla, más `common` para lo compartido.
//   · Texto con datos dentro → función tipada, nunca concatenación en la
//     pantalla: el orden de las palabras cambia entre idiomas.
//   · Las cadenas LOCUTADAS no viven aquí. Van en los bancos por variedad
//     (valeriaContent*.ts) porque el corpus de voz las enumera para
//     pre-generar su audio; mezclarlas rompería esa tubería.
// ============================================================================

export const ES = {
  common: {
    continue: 'Continuar',
    back: 'Atrás',
    cancel: 'Cancelar',
    save: 'Guardar',
    close: 'Cerrar',
    accept: 'Aceptar',
    loading: 'Cargando…',
  },

  // [v11] Etiquetas de la barra de pestañas inferior. OJO: son etiquetas
  // VISIBLES, no nombres de ruta. Los nombres de ruta internos no se traducen
  // ni se renombran, porque la telemetría del piloto indexa por nombre de ruta
  // (valeriaTelemetry.noteScreen) y renombrarlos partiría la serie histórica.
  tabs: {
    therapies: 'Ejercicios',
    academy: 'Academy',
    settings: 'Ajustes',
    therapiesA11y: 'Ejercicios. Bloques de ejercicios para practicar o prescribir.',
    academyA11y: 'Academy. Formación para el adulto cuidador.',
    settingsA11y: 'Ajustes. Recordatorios, voz, idioma y acceso profesional.',
  },

  welcome: {
    tagline: 'Entiende su lenguaje, practica en casa. Lúa os acompaña.',
    sub: 'Primero te formas, después practicáis juntos en casa. Valeria registra el progreso.',
    start: 'Comenzar',
    trust: 'Datos cifrados en el dispositivo · RGPD / HIPAA',
  },
  // Pantalla de presentación de Lúa física, entre Créditos y la ficha.
  // Sin la palabra «terapia»: no se lee en ninguna cadena de la app.
  luaIntro: {
    title: 'Conoce a Lúa',
    sub: 'La mascota física que os acompaña y anima en cada sesión de práctica.',
    deviceAlt: 'Lúa, la gata de Valeria, en la pantalla de su aparato',
    request: 'Quiero una Lúa',
    who: '¿Quién va a practicar hoy?',
    newPatient: 'Paciente nuevo',
    newPatientSub: 'Crear una ficha desde cero',
    existing: 'Ya tengo un paciente',
    existingSub: 'Abrir una ficha de la lista',
  },

  credits: {
    kicker: 'Proyecto desarrollado por',
    authorRole: 'Otorrinolaringólogo infantil',
    collaborators: 'En colaboración con',
    acoprosDesc: 'Asociación de Colaboración y Promoción del Sordo',
    quisqueyaDesc: 'Rehabilitación del lenguaje',
    recognition: 'Reconocimiento',
    qualitySeal: 'Sello de Calidad',
    qualitySealDesc: 'ITEMAS · Instituto de Salud Carlos III · 2024',
    voiceCredit:
      'Voz neuronal en castellano: «Sharvard» (Piper · rhasspy/piper-voices). '
      + 'En galego: «Celtia» · Proxecto Nós. '
      + 'Euskaraz: HiTZ-TTS · ILENIA/NEL-GAITU (UPV/EHU · Aholab). '
      + 'In English: «LJSpeech» (Piper · rhasspy/piper-voices, MIT), '
      + 'a partir de grabaciones de LibriVox en dominio público.',
    arCredit:
      'Realidad Aumentada: seguimiento facial con MediaPipe Tasks (Google, Apache 2.0) '
      + 'y escena 3D con Filament (Google, Apache 2.0), ambos ejecutándose íntegramente '
      + 'en el dispositivo. Modelos 3D generados para el proyecto y liberados en CC0.',
  },

  patientSelect: {
    title: 'Selecciona un paciente',
    // Cero, uno y varios se resuelven aquí: en inglés el plural no coincide
    // con el castellano y la pantalla no debe saber de morfología.
    subtitle: (n: number): string =>
      n === 0 ? 'Continúa donde lo dejaste'
        : n === 1 ? '1 paciente registrado en este dispositivo'
          : `${n} pacientes registrados en este dispositivo`,
    emptyTitle: 'Aún no hay pacientes',
    emptyBody: 'Registra tu primer paciente para empezar a prescribir ejercicios.',
    newPatient: 'Registrar nuevo paciente',
    patientFallback: 'Paciente',
    noDiagnosis: 'Sin diagnóstico asignado',
    privacy: 'Pacientes almacenados y cifrados en este dispositivo.',
  },

  // Ficha de registro. OJO con las tres listas de opciones (género, vínculo,
  // patología): lo que se GUARDA es el literal castellano, porque otras partes
  // de la app lo leen para enrutar —`domainFromPatologia` en Academy y el
  // `/Audífono|Implante Coclear/` que decide si toca Test de Ling—. Traducir el
  // valor almacenado rompería esas rutas y, peor, las fichas ya guardadas en los
  // dispositivos. Así que el id sigue siendo castellano y aquí solo se traduce
  // la ETIQUETA que se pinta.
  ficha: {
    title: 'Ficha de Registro',
    subtitle: 'Datos sociodemográficos del paciente',

    sectionChild: 'Niño / Niña',
    sectionCaregiver: 'Tutor / Cuidador',
    sectionDiagnosis: 'Diagnóstico y equipo médico',

    fullName: 'Nombre y apellidos',
    fullNamePlaceholder: 'Nombre del paciente',
    birthDate: 'Fecha de nacimiento',
    birthDatePlaceholder: 'DD / MM / AAAA',
    recordNumber: 'NHC',
    recordNumberPlaceholder: 'HC-…',
    gender: 'Género',

    caregiverName: 'Nombre completo',
    caregiverNamePlaceholder: 'Nombre del tutor',
    relationship: 'Vínculo familiar',
    relationshipPlaceholder: 'Selecciona el vínculo…',
    email: 'Correo electrónico',
    emailPlaceholder: 'tutor@correo.com',
    phone: 'Teléfono / WhatsApp',
    phoneHint: 'Se usará para enviar los reportes clínicos.',
    phonePlaceholder: 'Ej. 600 123 456',

    pathology: 'Patología / diagnóstico',
    pathologyPlaceholder: 'Selecciona una patología…',
    prescriber: 'Médico prescriptor (ORL / Pediatra)',
    prescriberPlaceholder: 'Dr./Dra. …',
    therapist: 'Logopeda asignado',
    therapistPlaceholder: 'Nombre del logopeda',

    required: 'Este campo es obligatorio.',
    invalidEmail: 'Introduce un correo válido.',
    recordNumberRequired: 'El NHC es obligatorio.',
    saved: 'Ficha guardada y cifrada en el dispositivo.',
    save: 'Guardar ficha',
    continueToAcademy: 'Empezar por la formación →',
    footer: 'Almacenamiento local cifrado (AES-256) · cumple RGPD / HIPAA.',

    // id almacenado (castellano, inmutable) → etiqueta visible
    genderLabel: (id: string): string => id,
    relationshipLabel: (id: string): string => id,
    pathologyLabel: (id: string): string => id,
  },

  // Hub de bloques + lista prescribible. Lo que NO se traduce aquí: el nombre,
  // la categoría y la edad de cada ejercicio salen del banco de contenido
  // terapéutico (valeriaExerciseBank), que se localiza por VARIEDAD, no por
  // idioma de interfaz.
  hub: {
    title: 'Selección de Ejercicios',
    subtitle: 'Elige un bloque para practicar o prescribir',
    streak: (n: number): string => `${n} ${n === 1 ? 'día de racha' : 'días de racha'}`,
    level: (n: number, name: string): string => `Nivel ${n} · ${name}`,
    sectionTraining: 'TU FORMACIÓN',
    sectionBlocks: 'BLOQUES DE EJERCICIOS',

    pairsTitle: 'Pares Mínimos',
    pairsSub: 'Dislalias: rotacismo, sigmatismo y más con juego de voz.',
    pairsBrief: 'Contrastes de sonido para dislalias.',
    pairsA11y: 'Practicar pares mínimos para dislalias',
    semanticTitle: 'Expansión Semántica',
    semanticSub: 'Escenarios diarios, progresión léxica y contrastes con acción física.',
    semanticBrief: 'Vocabulario y frases del día a día.',
    semanticA11y: 'Practicar expansión semántica y progresión léxica',
    hearingTitle: 'Audición',
    hearingSub: 'Inspirado en el protocolo ACOPROS: sonidos, vocabulario, frases y uso social, organizado por edades.',
    hearingBrief: 'Detectar, discriminar y reconocer.',
    hearingA11y: 'Abrir ejercicios de audición',
    languageTitle: 'Lenguaje',
    languageSub: 'Protocolo familiar: atención conjunta, imitación, comprensión y más.',
    languageBrief: 'Atención conjunta y comprensión.',
    languageA11y: 'Abrir ejercicios de lenguaje',
    autismTitle: 'TEA',
    autismSub: 'PRT + TCC: atención conjunta triangulada, reparación comunicativa y flexibilidad. Estresores siempre manuales.',
    autismBrief: 'Pragmática y flexibilidad social.',
    autismA11y: 'Abrir ejercicios del módulo TEA',
    dyslexiaTitle: 'Dislexia',
    dyslexiaSub: 'Conciencia fonológica, síntesis fonémica, pseudopalabras y rastreo de letras giradas (b/d, p/q).',
    dyslexiaBrief: 'Conciencia fonológica y lectura.',
    dyslexiaA11y: 'Abrir ejercicios del módulo Dislexia',
    arTitle: 'Realidad Aumentada',
    arSub: 'La cámara mira el gesto y el coche, el perro o la manzana reaccionan a él. Sin grabar nada y con el micrófono apagado.',
    arBrief: 'Gesto y mirada con la cámara.',
    arA11y: (n: number): string => `Abrir el bloque de realidad aumentada, ${n} ejercicios`,
    sensoryTitle: 'Integración Sensorial',
    sensorySub: 'Desensibilización gradual, modulación y anticipación visual ante sonidos cotidianos.',
    sensoryBrief: 'Anticipación y tolerancia a sonidos.',
    sensoryA11y: (n: number): string => `Abrir ejercicios de integración sensorial auditiva, ${n} actividades`,
    sensoryBadge: (n: number): string => `${n} actividades`,

    // Pizarra Mágica · Grafomotricidad y Escritura.
    writingTitle: 'Grafomotricidad',
    writingSub: 'Trazo guiado con pauta Montessori y control del orden para evitar la inversión b / d.',
    writingBrief: 'Trazo guiado y letras críticas.',
    writingA11y: (n: number): string => `Abrir la pizarra mágica de Lúa, ${n} trazos guiados`,
    writingBadge: (n: number): string => `${n} trazos`,

    statStreakUnit: (n: number): string => (n === 1 ? 'día de racha' : 'días de racha'),
    pairsBadge: (n: number): string => `${n} pares`,
    semanticBadge: (n: number): string => `${n} escenarios`,
    therapiesBadge: (n: number): string => `${n} ejercicios`,
    activeBadge: (n: number): string => `${n} activas`,

    remindersTitle: 'Recordatorios de sesión',
    remindersOff: 'Avisos en la pantalla de bloqueo para no perder la racha. Tú eliges en qué franjas, de una a cuatro.',
    remindersPickHint: 'Elige abajo las franjas que quieras.',
    remindersNone: 'Sin avisos: no llegará ninguna notificación.',
    remindersSummary: (n: number, hours: string): string =>
      n === 1
        ? `1 aviso al día (${hours}) en la pantalla de bloqueo.`
        : `${n} avisos al día (${hours}) en la pantalla de bloqueo.`,
    remindersOn: (summary: string): string => `Recordatorios activados: ${summary} 🔔`,
    remindersDisabled: 'Recordatorios desactivados.',
    remindersNoPermission: 'No se pudo activar: concede el permiso de notificaciones al sistema.',
    remindersNoSchedule: 'No se pudo programar: concede el permiso de notificaciones al sistema.',
    remindersNoSlots: 'Sin franjas activas: recordatorios desactivados.',
    // id de franja (inmutable) → etiqueta y descripción visibles
    slotLabel: (id: string, hour: number): string => {
      const name = id === 'manana' ? 'Mañana' : id === 'mediodia' ? 'Mediodía' : id === 'tarde' ? 'Tarde' : 'Noche';
      return `${name} · ${hour}:00`;
    },
    slotHint: (id: string): string =>
      id === 'manana' ? 'Invitación a la sesión del día.'
        : id === 'mediodia' ? 'Recordatorio corto a media jornada.'
          : id === 'tarde' ? 'Última llamada para no perder la racha.'
            : 'Consejo para el adulto, no aviso de juego.',

    proAccessTitle: 'Acceso Profesional',
    proAccessSub: 'Exportar evidencia de usabilidad del piloto (PIN del logopeda).',
    proAccessA11y: 'Acceso profesional: exportar evidencia de usabilidad',
    proPinSubtitle: 'Introduce el PIN del logopeda para exportar la evidencia de usabilidad del piloto.',
    proUnlocked: 'Modo profesional desbloqueado.',

    backToBlocks: 'Bloques',
    tabHearing: '👂 Audición',
    tabLanguage: '💬 Lenguaje',
    tabAutism: '🧠 TEA',
    tabDyslexia: '📖 Dislexia',
    protocolHearing: 'PROTOCOLO ACOPROS · AUDICIÓN',
    protocolLanguage: 'PROTOCOLO FAMILIAR · LENGUAJE',
    protocolAutism: 'PROTOCOLO TEA · PRT + TCC',
    protocolDyslexia: 'PROTOCOLO DISLEXIA · FONOLOGÍA Y ACCESO LÉXICO',

    editingOn: 'Edición profesional habilitada',
    editingOff: 'Modo Familia · solo lectura',
    blockChip: (total: number, prescribed: number): string => `${total} ejercicios · ${prescribed} prescritos`,
    fullSession: 'Sesión completa',
    fullSessionSub: (n: number): string => `Los ${n} ejercicios prescritos seguidos, con pausas de movimiento`,
    fullSessionA11y: (n: number): string => `Practicar los ${n} ejercicios prescritos seguidos`,
    prescribedCount: (n: number): string => `${n} prescritos`,
    practiceA11y: (name: string): string => `Practicar ${name}`,
    otherAges: 'Otras',

    refHearing:
      'Actividades inspiradas en los materiales de rehabilitación auditiva de ACOPROS '
      + '(Asociación Coruñesa de Promoción del Sordo), organizadas en 4 áreas: sonidos, '
      + 'vocabulario, frases y uso social. Las edades son orientativas: empieza por las de '
      + 'la edad de tu peque y deja que el logopeda ajuste la prescripción.',
    refAutism:
      'Batería PRT + TCC: la app orquesta las contingencias, pero la carga (quiebre '
      + 'pragmático, ruido, gata distractora) SIEMPRE la acciona el adulto desde el Panel del '
      + 'Adulto y es reversible al instante. La app nunca interrumpe ni ajusta nada sola, y '
      + 'el veredicto clínico es siempre tuyo y de tu logopeda.',
    refDyslexia:
      'Batería de conciencia fonológica y acceso léxico. La validación por voz respeta el '
      + 'habla de cada variedad (en dominicano, el seseo o la ese aspirada NUNCA cuentan '
      + 'como error) y la Criba de Pseudopalabras corta en 5 ensayos con pausa de descarga.',

    protocolCardOpen: 'Ver la ficha del protocolo',
    protocolCardClose: 'Ocultar la ficha',
    notPrescribed: 'No prescrito',
    prescribedOf: (active: number, total: number): string => `${active} de ${total} prescritas`,
    savePrescription: 'Guardar Prescripción',
    savedPrescription: (n: number): string => `Prescripción guardada · ${n} ejercicios activos.`,
    saveHelper: 'La selección se guarda en el dispositivo y la edición se bloquea de nuevo.',
    lockedHint: 'Modo Familia · solo el logopeda puede modificar la prescripción.',

    teaConsentTitle: 'Antes de empezar con TEA',
    teaConsentBreak: 'Quiebre Pragmático',
    teaConsentBody1: 'Este módulo incluye el ',
    teaConsentBody2:
      ': un ejercicio en el que TÚ congelas la app a propósito (una orden absurda o un '
      + 'silencio) para observar cómo tu peque repara la comunicación. Puede generarle una '
      + 'frustración breve y controlada — es el objetivo clínico, pautado por vuestro logopeda.',
    teaConsentItem1: '✋ El estresor lo lanzas siempre tú, desde el Panel del Adulto.',
    teaConsentItem2: '↩️ Es reversible al instante: un toque y la app vuelve a la normalidad.',
    teaConsentItem3: '🚫 La app nunca interrumpe, sube la dificultad ni diagnostica sola.',
    teaConsentItem4: '🛑 Si tu peque se desborda, para: no hay ningún mínimo que cumplir.',
    teaConsentAccept: 'Lo entiendo y acepto el encuadre',
    teaConsentAcceptA11y: 'Aceptar el encuadre y entrar al módulo TEA',
    teaConsentLater: 'Ahora no',

    // Nombres de nivel de la gamificación (valeriaGamification los da en
    // castellano; el índice es estable, el nombre no).
    levelNameByIndex: (i: number): string =>
      ['Gatita', 'Gata Curiosa', 'Gata Juguetona', 'Gata Valiente',
        'Gata Exploradora', 'Gata Saltarina', 'Gata Sabia', 'Gata Sigilosa',
        'Gata Estrella', 'Gran Gata', 'Gata Lunar', 'Gata Legendaria'][i]
      ?? 'Gata Legendaria',

    luaPurring: '¡Ronroneo!',
    luaEating: '¡Qué rico!',
    luaCraving: 'Tiene antojo',
    luaPatShort: 'Acaríciame',
    luaFeedFish: 'Dar pescadito',
    luaFeedFishA11y: 'Dar pescadito a Lúa',
    luaPatA11y: 'Acariciar a la gata Lúa',
    luaPatHintA11y: 'Toca para acariciarla y ver su ronroneo',
  },

  // --------------------------------------------------------------------------
  // Premios: la colección de Lúa. La COPIA vive aquí; qué se gana y cuándo, en
  // valeriaGamification. Los ids son inmutables (viajan en AsyncStorage).
  // --------------------------------------------------------------------------
  awards: {
    open: 'Premios',
    title: 'Los premios de Lúa',
    subtitle: 'Lo que has conseguido y lo que te falta.',
    close: 'Cerrar',
    levelLine: (n: number, name: string): string => `Nivel ${n} · ${name}`,
    xpToNext: (n: number): string => `${n} XP para el siguiente nivel`,
    xpTotal: (n: number): string => `${n} XP en total`,
    maxLevel: '¡Nivel máximo alcanzado!',
    streakLine: (n: number): string => (n === 1 ? '1 día de racha' : `${n} días de racha`),
    streakNone: 'Empieza hoy tu racha',
    collection: (won: number, total: number): string => `Insignias · ${won} de ${total}`,
    levelTrack: 'Escalera de niveles',
    lockedHint: 'Las insignias en gris todavía no están conseguidas.',
    a11yOpen: 'Abrir la colección de premios de Lúa',
    badgeA11y: (name: string, won: boolean): string =>
      `${name}. ${won ? 'Conseguida' : 'Todavía no conseguida'}.`,

    wardrobeTitle: 'El armario y premios de Lúa',
    itemSlotHead: 'Cabeza',
    itemSlotNeck: 'Cuello',
    itemSlotSnack: 'Premio',
    itemEquipped: 'Puesto en Lúa',
    itemEquipAction: 'Toca para poner',
    itemSnackAvailable: 'Disponible para premiar',
    itemA11y: (name: string, unlocked: boolean, equipped: boolean): string =>
      `${name}. ${unlocked ? (equipped ? 'Puesto en Lúa' : 'Toca para poner') : 'Bloqueado'}.`,

    itemName: (id: string): string => ({
      snack_fish: 'Pescadito Sabroso',
      neck_red_bow: 'Pajarita Escarlata',
      head_flower: 'Flor Turquesa Valeria',
      neck_bell: 'Cascabel Reluciente',
      head_wizard: 'Gorro de Maga Estelar',
    }[id] ?? id),


    itemUnlockCondition: (id: string): string => ({
      snack_fish: 'Disponible desde el principio',
      neck_red_bow: 'Completa 3 sesiones de ejercicios',
      head_flower: 'Alcanza una racha de 3 días',
      neck_bell: 'Completa 10 sesiones de ejercicios',
      head_wizard: 'Alcanza el Nivel 5 de Lúa',
    }[id] ?? ''),

    badgeName: (id: string): string => ({
      primera: 'Primer paso de Lúa',
      ses10: 'Paseo amigo',
      ses25: 'Gran exploradora',
      ses50: 'Guía del sendero',
      ses100: 'Pacto centenario',
      racha3: 'Cascabel sonoro',
      racha7: 'Semana cantarina',
      racha14: 'Melodía constante',
      racha30: 'Campana de oro',
      perfecta: 'Oído de lince',
      perf5: 'Radar mágico',
      perf10: 'Antena de cristal',
      madrugadora: 'Desayuno sonoro',
      nocturna: 'Cuento de luna',
      finde: 'Mochila de finde',
      maraton: 'Ovillo de historias',
      regreso: 'Abrazo de bienvenida',
      nivel10: 'Reina del lenguaje',
    }[id] ?? id),

    // La descripción es la REGLA de desbloqueo, no adorno: el adulto la usa para
    // decirle al niño qué falta. Cabe en tres líneas de 10 px (numberOfLines={3}
    // en ValeriaAwardsSheet), o sea ~55 caracteres; pasarse la corta con «…» y
    // deja la insignia sin explicar. El nombre ya pone la voz de Lúa.
    badgeDesc: (id: string): string => ({
      primera: 'Completa tu primera sesión con Lúa.',
      ses10: '10 sesiones de camino juntos.',
      ses25: '25 sesiones descubriendo palabras.',
      ses50: '50 sesiones: Lúa sabe el camino.',
      ses100: '100 sesiones. Un vínculo para siempre.',
      racha3: '3 días seguidos practicando.',
      racha7: '7 días seguidos practicando.',
      racha14: '14 días seguidos practicando.',
      racha30: '30 días seguidos practicando.',
      perfecta: 'Logra 3★ en todos los ejercicios de una sesión.',
      perf5: 'Logra 5 sesiones perfectas.',
      perf10: 'Logra 10 sesiones perfectas.',
      madrugadora: 'Practica antes de las 10 de la mañana.',
      nocturna: 'Practica después de las 8 de la tarde.',
      finde: 'Practica un sábado o un domingo.',
      maraton: 'Seis ejercicios o más en una sola sesión.',
      regreso: 'Vuelve a practicar tras una semana de pausa.',
      nivel10: 'Alcanza el nivel 10 y su corona.',
    }[id] ?? ''),
  },

  auth: {
    title: 'Acceso profesional',
    subtitleSignup: 'Crea tu cuenta para guardar tus pacientes y sesiones en la nube.',
    subtitleSignin: 'Inicia sesión para acceder a tus pacientes y sesiones.',
    name: 'Nombre',
    namePlaceholder: 'Tu nombre',
    emailPlaceholder: 'tu@correo.com',
    firebaseUnconfigured: '⚠︎ Firebase aún no está configurado (faltan las claves del proyecto). Ver docs/firebase-setup.md.',
    email: 'Correo electrónico',
    password: 'Contraseña',
    passwordPlaceholder: 'Mínimo 6 caracteres',
    signup: 'Crear cuenta',
    signin: 'Iniciar sesión',
    forgot: '¿Olvidaste tu contraseña?',
    haveAccount: '¿Ya tienes cuenta?',
    noAccount: '¿Aún no tienes cuenta?',
    goSignin: 'Inicia sesión',
    goSignup: 'Créala aquí',
    missingFields: 'Escribe tu correo y contraseña.',
    missingEmailForReset: 'Escribe tu correo para enviarte el enlace de recuperación.',
    resetSent: 'Te hemos enviado un correo para restablecer la contraseña.',
    // código normalizado (firebase/authErrors) → mensaje
    error: (code: string): string =>
      code === 'invalidEmail' ? 'El correo no tiene un formato válido.'
        : code === 'missingPassword' ? 'Escribe tu contraseña.'
          : code === 'weakPassword' ? 'La contraseña debe tener al menos 6 caracteres.'
            : code === 'emailInUse' ? 'Ya existe una cuenta con ese correo.'
              : code === 'badCredentials' ? 'Correo o contraseña incorrectos.'
                : code === 'tooManyRequests' ? 'Demasiados intentos. Inténtalo de nuevo en unos minutos.'
                  : code === 'network' ? 'Sin conexión. Comprueba tu red e inténtalo otra vez.'
                    : code === 'notAllowed' ? 'El acceso por correo y contraseña no está habilitado en el proyecto.'
                      : 'No se ha podido completar la operación. Inténtalo de nuevo.',
  },

  // Test de Ling. Los SEIS SONIDOS y sus consignas no están aquí: salen de
  // `lingContentForLocale`, que se localiza por VARIEDAD de terapia. Aquí vive
  // lo que lee el adulto: la pregunta previa, la escala de valoración y el
  // veredicto.
  ling: {
    title: 'Test de Ling',
    titleDone: 'Test completado',
    subAsk: (name: string): string => `${name} · Comprobación auditiva`,
    subTest: (name: string): string => `${name} · 6 sonidos de Ling`,
    subDone: (name: string): string => `${name} · Resultado de hoy`,

    askTitle: 'Antes de empezar',
    askQuestion1: '¿El paciente usa ',
    askQuestionHearingAids: 'audífonos',
    askQuestionOr: ' o ',
    askQuestionImplant: 'implante coclear',
    askQuestion2: '?',
    askSub: 'Si los usa, conviene comprobar primero que oye bien hoy con el Test de Ling.',
    yesTitle: 'Sí, usa audífonos / implante',
    yesSub: 'Realizar Test de Ling (6 sonidos)',
    noTitle: 'No',
    noSub: 'Ir directamente a los ejercicios',

    instrKicker: 'TU TURNO, TUTOR',
    instrTitle: 'Cúbrete la boca y produce el sonido',
    stageLabel: 'PRODUCE ESTE SONIDO',
    scaleTitle: '¿Cómo respondió?',
    scaleSub: 'Marca la respuesta del niño a este sonido',
    scaleIdentifies: 'Identifica',
    scaleIdentifiesDesc: 'Repite o reconoce el sonido correctamente.',
    scaleDetects: 'Detecta',
    scaleDetectsDesc: 'Reacciona o levanta la mano al oírlo.',
    scaleNoResponse: 'Sin respuesta',
    scaleNoResponseDesc: 'No reacciona al sonido.',
    legendNoResponseShort: 'Sin resp.',

    resultGoodTitle: '¡Oye con claridad!',
    resultGoodSub: 'Identificó los 6 sonidos. El equipo auditivo funciona bien hoy.',
    resultGoodRec: 'Todo en orden. Puedes continuar con los ejercicios de audición con normalidad.',
    resultCheckTitle: 'Revisar el equipo',
    resultCheckSub: 'No reaccionó a algún sonido. Comprueba pilas, molde y volumen antes de seguir.',
    resultCheckRec: 'Revisa el audífono / implante (pilas, conexión, programa) y repite el test. Si persiste, consulta con el ORL.',
    resultDetectTitle: 'Detecta todos los sonidos',
    resultDetectSub: (ident: number, total: number): string =>
      `Detectó los ${total}, e identificó ${ident} de ${total}. Puede continuar con la sesión.`,
    resultDetectRec: 'Refuerza con apoyo del tutor los sonidos más agudos (sh, s). Puedes continuar con los ejercicios.',

    startExercises: 'Comenzar ejercicios →',
    repeat: 'Repetir test',
    months: 'ene feb mar abr may jun jul ago sep oct nov dic',
  },

  // Pares Mínimos. NO están aquí: las palabras del par, la consigna, la pista,
  // las misiones físicas ni la etiqueta de error — todo eso sale del banco de
  // la VARIEDAD activa (valeriaMinimalPairs*). Aquí vive el andamiaje que lee
  // el adulto.
  pairs: {
    sealA11y: (who: string): string =>
      `Huella de ${who}. Pulsad las dos huellas a la vez para continuar, o mantén pulsada esta dos segundos.`,
    pinSubtitle: 'Introduce el PIN de 4 dígitos del logopeda para elegir qué pares practica la familia.',
    sessionName: (a: string, b: string): string => `Pares mínimos · ${a} / ${b}`,
    noteClean: (phoneme: string): string =>
      `Contraste ${phoneme} sin sustituciones detectadas. ¡Fonema consolidándose!`,
    noteSubs: (subs: number, total: number, corr: number, err: string): string =>
      `Sustitución detectada en ${subs} de ${total} ensayos; ${corr} con corrección (${err}).`,
    doneClean: (phoneme: string): string =>
      `Ninguna sustitución detectada en el contraste ${phoneme}. ¡El fonema se está consolidando!`,
    doneSubs: (subs: number, total: number): string =>
      `El micrófono detectó la sustitución en ${subs} de ${total} ensayos. Es normal: cada corrección es práctica del contraste.`,
    // Aviso dialectal del par (EN-0.5). El texto largo vive en el propio par
    // (dialect.note), porque es contenido clínico y cambia con cada contraste;
    // aquí solo van las etiquetas del marco.
    dialectSensitive: 'ANTES DE PUNTUAR ESTE PAR',
    dialectTransfer: 'ANTES DE PUNTUAR: NIÑO BILINGÜE',
    dialectRegularIn: (v: string): string => `Rasgo regular en: ${v}.`,
    title: 'Pares Mínimos',
    subtitlePick: 'Dislalias fonológicas · el niño pide la palabra con su voz',
    editingOn: 'Edición profesional habilitada',

    howKicker: 'CÓMO FUNCIONA',
    howBody:
      'Aparecen dos palabras casi iguales (rana / lana). La app pide una en voz alta, el niño '
      + 'la dice al micrófono y la app detecta si salió el fonema o la sustitución habitual. '
      + 'Cada ensayo termina con una misión física en pareja y el sello doble: ¡sin las manos '
      + 'de los dos en la pantalla no se avanza!',
    autoRecord: 'Grabación automática tras la consigna',
    autoRecordSub: 'Por defecto, apagada: el micro espera a que pulséis “Ya estoy listo”.',
    bankLabel: 'BANCO DE CONTRASTES',
    prescribedCount: (n: number): string => `${n} prescritos`,
    toggleA11y: (on: boolean, a: string, b: string): string => `${on ? 'Desactivar' : 'Activar'} el par ${a} y ${b}`,
    practiceA11y: (a: string, b: string): string => `Practicar el par ${a} y ${b}`,
    notPrescribedA11y: (a: string, b: string): string => `Par ${a} y ${b} no prescrito`,
    savePrescription: 'Guardar Prescripción',
    saveHelper: 'La selección se guarda en el dispositivo y la edición se bloquea de nuevo.',
    lockedHint: 'Modo Familia · solo el logopeda puede cambiar qué pares se practican.',

    appSpeaksSlow: 'LA APP MODELA DESPACIO',
    appSpeaks: 'LA APP DICE',
    stepSay: 'La app está hablando… preparad la voz.',
    stepReady: 'Preparad la voz. Cuando el niño esté listo, pulsad el micrófono.',
    readyBtn: 'Ya estoy listo',
    readyBtnA11y: 'Ya estoy listo. Empezar a escuchar.',
    repeatPrompt: 'Repetir consigna',
    stepListen: '¡Ahora el niño! Di la palabra al micrófono…',
    stopListening: 'Parar · decide el adulto',
    stepJudge: 'El adulto hace de juez: ¿qué dijo el niño?',
    saidWord: (w: string): string => `Dijo “${w}”`,
    notUnderstood: 'No se entendió · repetir consigna',
    micNoteKicker: '👤 PARA EL ADULTO · EL MICRÓFONO',

    successTitle: '¡Fonema conseguido!',
    heardBy: (w: string): string => `La app escuchó: “${w}”`,
    adultVerdict: 'Veredicto del adulto.',
    missionCelebration: 'MISIÓN FÍSICA DE CELEBRACIÓN',
    missionCorrective: 'MISIÓN FÍSICA CORRECTIVA',
    sealSuccess: 'Misión hecha: ¡sellad juntos para el siguiente ensayo!',

    heardFoil: (w: string): string => `Escuché “${w}”… ¡era la otra palabra!`,
    almostTitle: '¡Casi casi!',
    notHeardTitle: 'No te escuché bien',
    cuePrefix: (cue: string): string => `Pista: ${cue}`,
    almostSub: 'Se parece mucho. Escuchad el modelo despacio y otra vez.',
    notHeardSub: 'Este intento no cuenta. Acercaos al micrófono y repetimos.',
    hearSlowModel: 'Oír modelo despacio',
    retryBtn: '🎤 ¡Otra vez!',

    assistTitle: 'Imitación juntos (1★)',
    assistSub: (w: string): string =>
      `El adulto dice “${w}” muy despacio tocando la mejilla del niño, y el niño la repite `
      + 'a la vez. Sin prisa: hoy la practicamos, mañana sale sola.',
    sealAssist: '¿La dijisteis juntos? ¡Sellad y seguimos!',

    overrideLabel: '¿La app oyó mal? Corrige tú:',
    overridePill: (w: string): string => `dijo “${w}”`,

    doneTitle: '¡Par completado!',
    doneSessionTitle: '¡Sesión de pares completada!',
    seeResults: 'Ver Resultados →',
    repeatPair: 'Repetir este par',
    otherPair: 'Elegir otro par',

    // Rotación de roles: el niño pasa a juez. «El adulto» y no «papá»: el
    // acompañante puede ser cualquiera, y es el criterio que ACOPROS ya obligó
    // a aplicar en los bancos.
    swapKicker: '👑 ¡AHORA MANDAS TÚ!',
    swapTitle: 'El niño hace de juez',
    swapListening: '👂 Escuchando al adulto…',
    swapWhich: '¿Cuál dijo el adulto? ¡Tócala!',
    swapHit: '✅ ¡Acertó!',
    swapMiss: '❌ Era la otra',
    swapContinue: 'Seguimos con la sesión →',
    swapSkip: 'Saltar esta vez',
    swapIntro: 'El adulto elige EN SECRETO una de las dos palabras y la dice en voz alta, sin señalar.',
    swapIntroAsr: ' La app también escuchará para comprobar.',
    swapSpeakNow: '🎤 ¡Ahora, en voz alta!',
    swapAlreadySaid: '🗣️ Ya la dijo → seguir',
    subtitlePlay: 'Dislalias fonológicas · el niño pide la palabra con su voz',
    regionNote: ' · solo variedades con distinción s/z',
    streakChip: (n: number): string => (n === 1 ? 'día de racha' : 'días de racha'),

    sealKicker: '🤝 SELLO DOBLE PARA CONTINUAR',
    sealWhy:
      'Sirve para que el ejercicio no siga solo: hasta que no ponéis las dos manos, la app espera. '
      + 'Así cerráis juntos cada intento y el adulto no se queda mirando desde fuera.',
    sealAdult: 'ADULTO',
    sealChild: 'YO',
    sealPlus: 'a la vez',
    sealHint: 'Quien acompañe al niño. ¿Una sola mano libre? Mantén pulsada una huella 2 segundos.',
  },

  // Expansión Semántica. Del banco de la VARIEDAD salen los escenarios, las
  // categorías, las palabras, las consignas locutadas y las acciones físicas.
  // Aquí vive lo que lee el adulto — incluidas cuatro etiquetas (objetivo de
  // sección, nivel de dificultad, fase de progresión y tipo de palabra) que
  // vivían en `valeriaSemanticExpansion.ts`: son texto de interfaz, no
  // contenido, y por eso siguen al idioma de la UI y no a la variedad.
  semantic: {
    togglePrescribedA11y: (name: string, on: boolean): string => `${on ? 'Desactivar' : 'Activar'} ${name}`,
    pickRowA11y: (name: string, on: boolean): string => (on ? `Practicar ${name}` : `${name} no prescrito`),
    wordsOf: (available: number, total: number): string => `${available} de ${total} palabras`,
    backPillContinue: 'Seguir',
    backPillBack: 'Volver',
    noMaterialHint: 'Esta actividad no necesita material: basta con vuestras manos y un sitio tranquilo.',
    doneSessionSub: (n: number): string =>
      `${n} palabras trabajadas uniendo imagen, voz y acción física. La palabra se aprende cuando el niño la vive con el cuerpo, no solo cuando la oye.`,
    assistSub: (word: string): string =>
      `El adulto dice “${word}” muy despacio mirando al niño, y lo repiten a la vez. Sin prisa: hoy la practicamos, mañana sale sola.`,
    title: 'Expansión Semántica',
    setupTitle: 'Preparación',
    doneTitle: '¡Completado!',

    howKicker: 'CÓMO FUNCIONA',
    howBody:
      'Pulsando ▶ la app enseña una imagen y presenta la palabra en una frase corta antes de '
      + 'pedirla («Esto es la cama. Di: cama.»). El niño la repite con su voz y el micrófono '
      + 'valora el intento, aceptando las aproximaciones propias de la edad. Cada palabra se '
      + 'cierra con una acción física del adulto que la ancla al cuerpo y al entorno real.',
    autoRecord: 'Audio y grabación automáticos',
    autoRecordSub: 'Por defecto, apagado: pulsad para oír el modelo y para grabar.',

    levelKicker: '📶 NIVEL MÁXIMO DE DIFICULTAD',
    levelHint: 'Con el tope en 1, la sesión solo presenta las palabras más familiares de cada categoría.',
    difficultyLabel: (n: number): string =>
      n === 1 ? 'Nivel 1 · lo más familiar'
        : n === 2 ? 'Nivel 2 · familiar'
          : 'Nivel 3 · menos frecuente',

    sectionScenarios: 'ESCENARIOS DIARIOS',
    sectionCategories: 'CATEGORÍAS LÉXICAS',
    sectionSequences: 'PROGRESIÓN LÉXICA',
    sectionCapsules: 'CÁPSULAS DE CONTRASTE',
    prescribedCount: (n: number): string => `${n} prescritas`,
    goalKicker: 'QUÉ SE TRABAJA AQUÍ',
    sectionGoal: (section: string): string =>
      section === 'scenario' ? 'Repetición verbal: el niño imita la palabra objetivo en situaciones del día a día.'
        : section === 'category' ? 'Vocabulario nuevo por campo: se empieza por las palabras más familiares y se avanza a las menos frecuentes.'
          : section === 'sequence' ? 'Vocabulario alrededor de un concepto: qué es, qué tiene, qué hace y cómo es.'
            : 'Opuestos: primero elegir la imagen correcta y después decir la palabra.',
    phaseLabel: (kind: string): string =>
      kind === 'concepto' ? 'Paso 1 · Qué es'
        : kind === 'parte' ? 'Paso 2 · Qué tiene'
          : kind === 'accion' ? 'Paso 3 · Qué hace'
            : 'Paso 4 · Cómo es',
    wordTypeLabel: (kind: string): string =>
      kind === 'sustantivo' ? 'Sustantivo'
        : kind === 'verbo' ? 'Verbo'
          : kind === 'adjetivo' ? 'Adjetivo'
            : 'Onomatopeya',
    wordCount: (n: number): string => `${n} palabras`,

    savePrescription: 'Guardar Prescripción',
    saveHelper: 'La selección se guarda en el dispositivo y la edición se bloquea de nuevo.',
    lockedHint: 'Modo Familia · solo el logopeda puede cambiar qué actividades se practican.',
    pinSubtitle: 'Introduce el PIN de 4 dígitos del logopeda para elegir qué actividades practica la familia.',

    setupKicker: '🧰 MATERIAL QUE NECESITÁIS',
    stepsKicker: (n: number): string => `🤝 QUÉ VAIS A HACER · ${n} ${n === 1 ? 'PASO' : 'PASOS'}`,
    reviewSetup: 'Ver preparación',
    reviewSetupA11y: 'Volver a ver el material y la dinámica',

    appSpeaksSlow: 'LA APP MODELA DESPACIO',
    appSpeaks: 'LA APP DICE',
    listen: 'Escuchar',
    listenA11y: 'Escuchar el modelo de este paso',
    stepSay: 'La app está hablando… preparad la voz.',
    stepReady: 'Preparad la voz. Cuando el niño esté listo, pulsad el micrófono.',
    readyBtn: 'Ya estoy listo',
    readyBtnA11y: 'Ya estoy listo. Empezar a escuchar.',
    tapImage: '¡Toca la imagen correcta!',
    repeatQuestion: 'Repetir la pregunta',
    stepListen: '¡Ahora el niño! Di la palabra al micrófono…',
    saidIt: 'Lo dijo',
    saidItA11y: 'Lo dijo bien, dar por válido',
    almost: 'Casi / otra vez',
    almostA11y: 'Casi, volver a intentarlo',
    stopWithoutDeciding: 'Parar sin decidir',
    stepJudge: 'El adulto hace de juez: ¿lo intentó decir?',
    notUnderstood: 'No se entendió · repetir consigna',

    successTitle: '¡Palabra conseguida!',
    heardBy: (w: string): string => `La app escuchó: “${w}”`,
    adultVerdict: 'Veredicto del adulto.',
    finish: '✅ ¡Terminar!',
    nextStep: '✅ ¡Hecho! Siguiente →',
    notHeardTitle: 'No te oí bien',
    almostTitle: '¡Casi casi!',
    hearSlowModel: 'Oír modelo despacio',
    retryBtn: '🎤 ¡Otra vez!',
    assistTitle: 'Imitación juntos (1★)',
    finishShort: '¡Terminar!',
    saidTogether: 'La dijimos → seguir',

    doneSessionTitle: '¡Sesión completada!',
    streakChip: (n: number): string => (n === 1 ? 'día de racha' : 'días de racha'),
    seeResults: 'Ver Resultados →',
    repeatBlock: 'Repetir este bloque',
    otherBlock: 'Elegir otro bloque',
    subtitlePick: 'Progresión léxica · del símbolo al mundo real del niño',
    editingOn: 'Edición profesional habilitada',
    tabScenarios: 'Escenarios',
    tabCategories: 'Categorías',
    tabSequences: 'Progresión',
    tabContrasts: 'Contrastes',
    kindScenario: 'Escenario',
    kindSequence: 'Progresión',
    kindContrast: 'Contraste',
    stepPoints: ' · el niño señala',
    setupBack: 'Volver a la sesión',
    setupReady: 'Ya lo tengo todo',
    setupReadyA11y: 'Ya lo tengo todo, empezar',
    notHeardSub: 'El micrófono no captó nada, así que este intento no cuenta. Acercaos un poco y probad otra vez.',
    almostSub: 'Escuchad el modelo despacio y probad otra vez.',
    actionKickerAdult: 'MISIÓN FÍSICA DEL ADULTO',
    actionKickerTpr: 'INSTRUCCIÓN TPR PARA EL ADULTO',
    actionKickerPair: 'ACCIÓN FÍSICA EN PAREJA',
    actionKickerSecond: 'ACCIÓN FÍSICA · SEGUNDA VUELTA',
    capsuleKickerAdj: 'CONTRASTE DE ADJETIVOS',
    capsuleKickerVerb: 'VERBOS ANTÓNIMOS',
    capsuleRound1: 'VUELTA 1 · COMPRENDER',
    capsuleRound2: 'VUELTA 2 · DECIR',
    capsuleVisualPrompt: (a: string, b: string): string => `Par en contraste: ${a} / ${b}.`,
    capsuleKindAdj: 'Par de adjetivos',
    capsuleKindVerb: 'Verbos antónimos',
    capsuleMeta: 'cápsula TPR · 2 vueltas',
    rowScenarioA11y: (title: string): string => `escenario ${title}`,
    rowCategoryA11y: (title: string): string => `categoría ${title}`,
    rowSequenceA11y: (theme: string): string => `progresión ${theme}`,
    rowCapsuleA11y: (a: string, b: string): string => `cápsula de contraste ${a} y ${b}`,

    histNoteContrast: (kind: string, comp: string, nComp: number, prod: string, nProd: number): string =>
      `${kind}: comprensión ${comp}/3 en ${nComp} ${nComp === 1 ? 'vuelta' : 'vueltas'} · producción ${prod}/3 en ${nProd}.`,
    histNoteWords: (kind: string, n: number): string =>
      `${kind}: ${n} palabras trabajadas uniendo símbolo, voz y acción física.`,
  },

  // Reproductor de ejercicios. Del banco de la VARIEDAD salen: nombre, código,
  // consigna (`read`), frase, materiales, propuestas alternativas, escala EPT
  // por ejercicio (`ex.ept`) y todo el contenido de las rondas. Aquí vive el
  // andamiaje: pasos, botonera de juez, explicación de la escala y cierre.
  player: {
    zoomTileA11y: (cap?: string): string => `Ampliar imagen de ${cap ?? 'la ficha'}`,
    answerTileA11y: (cap: string): string => `Responder ${cap}. Mantén pulsado para ampliar la imagen`,
    roundOf: (cur: number, total: number): string => `Ronda ${cur} de ${total}`,
    trialLimit: (max: number): string =>
      `Límite de ${max} ensayos alcanzado: descargad con la pausa de movimiento y evalúa abajo (o cambia de ronda).`,
    matchedTileA11y: (cap: string): string => `${cap}: ya unida con su vocal`,
    pickTileA11y: (cap: string): string => `Elegir la imagen de ${cap}`,
    tileChosen: 'elegida',
    vowelA11y: (v: string): string => `Vocal ${v}`,
    fillMicPrompt: (word: string): string => `Cuando complete la palabra, pulsa el micro y que diga: “${word}”`,
    seriesWordRevealedA11y: (n: number, cap: string): string => `Palabra ${n} de la serie: ${cap}`,
    seriesWordA11y: (n: number): string => `Responder la palabra ${n} de la serie`,
    seriesWordMasked: (n: number): string => `palabra ${n}`,
    hearPhonemes: (phonemes: string): string => `Oír los sonidos · ${phonemes}`,
    synthesisMicPrompt: (word: string): string =>
      `Pulsa el micro y que UNA los sonidos en la palabra completa: “${word}”`,
    synthesisSolved: (word: string): string =>
      `La palabra era “${word}”. Puedes pasar a otra ronda o evaluar abajo.`,
    letterOfA11y: (n: number, total: number): string => `Letra ${n} de ${total}`,
    pictureOfA11y: (n: number, total: number): string => `Dibujo ${n} de ${total}`,
    restart: '↺ Volver a empezar',
    pluralCardA11y: (label: string): string => `Tarjeta con ${label}`,
    pluralHowManyPrompt: (target: string): string =>
      `Pregúntale «¿cuántos hay?» y pulsa el micro para que diga: “${target}”`,
    pluralWhatArePrompt: (target: string): string =>
      `Pregúntale «¿qué son?» y pulsa el micro para que diga: “${target}”`,
    orderTilePlacedA11y: (cap: string): string => `Ficha ${cap}, ya colocada`,
    orderTileA11y: (cap: string): string => `Ficha ${cap}`,
    sceneA11y: (label: string): string => `${label}. Oír un ejemplo`,
    selloHint: (sec: number): string =>
      `El botón se desbloquea tras ${sec} segundos de espera. Púlsalo SOLO cuando el niño te mire de verdad a ti (no al objeto); después se bloquea para el siguiente intento.`,
    doneSub: (total: number): string => (total === 1
      ? 'Has evaluado este ejercicio. El resultado se ha guardado en el dispositivo.'
      : `Has evaluado las ${total} actividades del plan. El resultado se guardó en el dispositivo.`),
    zoomClose: 'Toca para cerrar',
    zoomCloseA11y: 'Cerrar imagen ampliada',
    zoomTip: 'Para ampliar una imagen: tócala, o en los juegos mantenla pulsada',
    zoomIconA11y: 'Ampliar el icono',
    zoomFaceA11y: 'Ampliar la cara',

    adultOnlyKicker: 'SOLO PARA EL ADULTO',
    adultOnlyShow: 'Toca para ver qué palabra tienes que decir sin voz.',
    adultOnlyHide: 'Aparta la pantalla del niño. Toca para volver a ocultarla.',
    adultOnlyShowA11y: 'Ver la palabra que debes pronunciar, sin enseñar la pantalla al niño',
    adultOnlyHideA11y: 'Ocultar la palabra que debes pronunciar',

    judgeSaidIt: 'Lo dijo',
    judgeSaidItA11y: 'Juez: lo dijo bien',
    judgeAlmost: 'Casi',
    judgeAlmostA11y: 'Juez: casi lo dijo',
    judgeHint: '¿El micro va lento o no le entiende? Valora tú el intento:',

    materialsKicker: 'ANTES DE EMPEZAR · NECESITARÁS',
    proposalsKicker: 'OTRAS FORMAS DE HACERLA · ALTERNA ENTRE SESIONES',
    step1Kicker: 'PASO 1 · CONSIGNA DEL TUTOR',
    step1Small: 'Este texto es para el adulto: díselo al niño con tus palabras',
    listenPrompt: 'Escuchar consigna',
    newRound: 'Otra ronda',
    newRoundA11y: 'Cambiar a otra ronda con contenido nuevo',
    step2: (label: string): string => `PASO 2 · ${label}`,
    levelLabel: (label: string): string => `NIVEL ${label.toUpperCase()}`,
    guidedActivity: 'Actividad guiada',
    hearWordSlow: 'Oír la palabra despacio',
    modelNote: 'El mejor modelo es tu voz: dísela tú primero, cerca y despacio. La voz de la app es solo un refuerzo.',
    trialKicker: (n: number, max: number): string => `JUEZ · ENSAYO ${n} DE ${max}`,
    trialHint: 'Si el micro falla o va lento, valora tú cada intento. Al llegar al límite, la app propone una pausa de movimiento para descargar.',

    vowelHint: '1º Toca una imagen para oír su nombre · 2º Toca la vocal con la que empieza',
    allMatched: '🎉 ¡Todas unidas! Puedes pasar a otra ronda o evaluar abajo.',
    allFound: '🎉 ¡Todas encontradas! Puedes pasar a otra ronda o evaluar abajo.',
    matrixDone: '🎉 ¡Matriz completa! Puedes pasar a otra ronda o evaluar abajo.',
    hearAllNames: 'Oír todos los nombres',
    hearFullWord: '1º Oír la palabra completa',
    hearWords: 'Oír las palabras',
    hearFullSeries: 'Oír la serie completa',
    hearOptions: 'Oír las opciones',
    hearSentence: '1º Oír la frase',
    intruderHint: 'Solo por el oído: primero escuchad la serie completa; después el niño toca el altavoz de la palabra que no suena como las demás.',
    synthesisHint: 'La app dice cada sonido por separado, con una pausa entre ellos. El niño los une y dice la palabra completa.',
    synthesisA11y: 'Oír los sonidos por separado',
    findAllOf: 'BUSCA TODAS LAS',
    namedLabel: 'NOMBRADOS',
    orderHint: 'En orden de lectura (→): el niño NOMBRA el dibujo en voz alta y lo toca. Tú persigues su dedo con el tuyo, como pilla-pilla.',
    startOver: '↺ Volver a empezar',
    sentenceRetry: 'Casi… vuelve a escuchar la frase y probad otra vez.',
    promptTextKicker: 'TEXTO · PUEDES LEERLO TÚ EN VOZ ALTA',
    hearExample: '🔊 Oír ejemplo',

    selloKicker: '🤝 SELLO DOBLE · INSTIGACIÓN RETARDADA',
    selloWait: (s: number): string => `⏳ Espera ${s} s…`,
    selloGive: '🤝 Dar el Sello Doble',
    selloGiveA11y: 'Dar el sello doble por contacto visual real',
    selloCount: (stars: string, n: number): string => `Sellos por contacto visual: ${stars} (${n})`,
    breakNow: '⏸️ Interrumpir ahora (cápsula sorpresa)',
    breakNowA11y: 'Interrumpir ahora con una cápsula de movimiento sorpresa',

    step3Kicker: 'PASO 3 · VERSIÓN EN MOVIMIENTO',
    waitTxt: 'Espera y observa la respuesta del niño',

    step4Kicker: 'PASO 4 · EVALUACIÓN',
    scoreTitle: '¿Cómo le ha salido?',
    scoreSubRounds: 'Jugad las rondas que queráis y toca la frase que mejor describa su respuesta',
    scoreSub: 'Toca la frase que mejor describa su respuesta',
    eptToggle: '¿Qué es la escala EPT-3?',
    eptToggleA11y: 'Qué es la escala EPT-3',
    eptExplain:
      'La EPT-3 es la escala de 3 niveles con la que se anota cómo respondió el niño en cada '
      + 'actividad: 1★ todavía no lo consigue, 2★ lo consigue con ayuda del adulto y 3★ lo '
      + 'consigue él solo. No es una nota: sirve para que el logopeda vea el progreso entre sesiones.',
    nextUpKicker: 'A CONTINUACIÓN · ANÚNCIASELO ANTES DE CAMBIAR',

    doneTitle: '¡Sesión completada!',
    streakChip: (n: number): string => (n === 1 ? 'día de racha' : 'días de racha'),
    streakExtended: '¡Racha ampliada! Vuelve mañana para no perderla.',
    levelChip: (n: number, name: string, up: boolean): string =>
      `Nivel ${n} · ${name}${up ? ' · ¡SUBISTE DE NIVEL!' : ''}`,
    xpToNext: (n: number): string => `${n} XP para el siguiente nivel`,
    badgesTitle: '¡LOGROS DESBLOQUEADOS!',
    doneStatKicker: 'PROMEDIO DE LA SESIÓN · ESCALA EPT-3 (DE 1★ A 3★)',
    seeResults: 'Ver Resultados →',
    repeatSession: 'Repetir sesión',
    sessionName: 'Sesión de ejercicios',
    headerDone: 'Sesión Completada',
    headerPlaying: 'Sesión de Ejercicios',
    noteGreat: 'Sesión muy fluida, gran respuesta en las consignas.',
    noteGood: 'Buena sesión, alguna consigna costó pero se mantuvo atento.',
    noteHard: 'Sesión difícil hoy, conviene reforzar con más apoyo del tutor.',
    seriesSolved: '✅ Solución de la serie: estas eran las palabras que sonaron, en el mismo orden.',
    seriesHint: '🔊 Cada tarjeta es una palabra de la serie, en el orden en que suenan. Las palabras se ven al responder.',
    hearQuestion: 'Oír la pregunta',
    // Roles S-V-O del juego de construir frases. El ROL lo declara el banco de
    // contenido (castellano); la pregunta que se le enseña al niño es andamiaje.
    // Los roles que no son S-V-O (Primero/Luego/Después) se muestran tal cual.
    roleQuestion: (role: string): string =>
      role === 'Sujeto' ? '¿Quién?'
        : role === 'Verbo' ? '¿Qué hace?'
          : role === 'Objeto' ? '¿Qué cosa?'
            : role,
    redirecting: (s: number): string => `Redirigiendo a resultados en ${s}s…`,
    prescribedPlan: (n: number): string => `Plan prescrito · ${n} ejercicios`,
  },

  // Panel del adulto, modales y resultados. Regla de siempre: lo que la app
  // LOCUTA (órdenes TPR, rutas de rutina) sale del banco de la variedad; lo que
  // el adulto LEE está aquí. El quiebre pragmático y la escala de reparación son
  // instrucciones y observación clínica PARA EL ADULTO, así que son interfaz.
  adult: {
    kicker: 'PANEL DEL ADULTO · RETO EXTRA',
    openA11y: 'Abrir el panel del adulto',
    closeA11y: 'Cerrar el panel del adulto',
    distractorTitle: 'Gata distractora (doble tarea)',
    distractorSub: 'La gata se asoma y se mueve por el borde; el niño debe seguir atendiendo a la voz. Tocarla no cuenta como error.',
    launchPragmatic: 'Lanzar un quiebre pragmático',
    hint: 'Controles manuales para entrenar la escucha en ambiente real. Úsalos si vuestro logopeda os lo ha pautado: la app nunca los activa ni los ajusta sola.',
    stepDownA11y: (label: string): string => `Bajar ${label}`,
    stepUpA11y: (label: string): string => `Subir ${label}`,
    arHint: 'Lo que se le va a exigir al peque en cada ejercicio. Los fijas tú antes de empezar y no cambian durante la sesión: la app mide y registra, el criterio clínico es siempre vuestro.',
    arHoldLabel: 'Sostén del gesto (AR-1)',
    arHoldHint: 'Cuánto tiempo debe mantener los labios redondeados para que el coche llegue a la meta.',
    arTurnLabel: 'Giro de cabeza (AR-2)',
    arTurnHint: 'Cuántos grados debe girar hacia el sonido para contar como orientación.',
    arWindowLabel: 'Ventana de respuesta (AR-2)',
    arWindowHint: 'Tiempo que se le da tras el sonido. Fuera de ventana es «sin respuesta», nunca «error».',
    arDwellLabel: 'Fijación para elegir (AR-3)',
    arDwellHint: 'Cuánto debe mirar un dibujo para seleccionarlo. El anillo de progreso se lo enseña.',
    gazePointerHint: 'El iris es más preciso; la nariz, más estable en teléfonos modestos. Si el puntero tiembla, cambia a nariz: el ejercicio no se entera.',
    arKicker: '🎯 REALIDAD AUMENTADA · UMBRALES CLÍNICOS',
    gazePointer: 'Puntero de la mirada (AR-3)',
    pointerIris: 'Iris',
    pointerNose: 'Nariz',
    pointerIrisA11y: 'Puntero por iris',
    pointerNoseA11y: 'Puntero por nariz',
  },

  pragmatic: {
    kicker: 'QUIEBRE PRAGMÁTICO · SOLO ADULTOS',
    warnTitle: 'Esta tarea generará frustración útil',
    warnBody:
      'Vas a romper la comunicación A PROPÓSITO para observar cómo tu hijo/a la repara. '
      + 'Es normal (y valioso) que se extrañe, proteste o se frustre un poco: esa reacción '
      + 'ES el ejercicio. Hazlo una sola vez, con calma, y termina siempre con un abrazo '
      + 'y la orden dicha bien.',
    closeLoopUpset:
      'Cierra ahora el quiebre: repite la orden bien dicha, valida la emoción («te confundí, '
      + '¿verdad?») y dad un abrazo. La reparación adulta también enseña.',
    notToday: 'Hoy no',
    understood: 'Entendido, seguimos',
    swapVariant: 'Prefiero la otra variante →',
    didIt: 'Ya lo hice · ¿qué hizo el niño?',
    repairTitle: '¿Cómo reparó el quiebre?',
    repairBody: 'Elige lo PRIMERO que hizo tu hijo/a. No hay respuestas malas: todas informan.',
    recorded: 'Registrado',
    closeLoop: 'Cierra el círculo: repite la orden bien dicha y celebra su reacción. Reparar es una habilidad, ¡y la acaba de practicar!',
    backToSession: 'Volver a la sesión',
    // Estresores: instrucciones para el adulto, no texto locutado.
    stressorMurmurTitle: 'Murmullo',
    stressorMurmurText: 'Da una orden sencilla en voz MUY baja y poco clara, mirando hacia otro lado. Ejemplo: “tráeme el…” (ininteligible).',
    stressorAbsurdTitle: 'Orden absurda',
    stressorAbsurdText: 'Pide algo imposible o sin sentido con cara seria. Ejemplo: “Pon el zapato dentro de la nevera” o “Dame la nube de la mesa”.',
    // Escala de reparación: observación clínica del adulto.
    repairAskLabel: 'Pidió repetición',
    repairAskDesc: '“¿Qué?”, “¿otra vez?”, se acercó a escuchar',
    repairRephraseLabel: 'Reformuló',
    repairRephraseDesc: 'Corrigió o negoció la orden absurda con sus palabras',
    repairGestureLabel: 'Usó gestos',
    repairGestureDesc: 'Señaló, encogió los hombros, buscó tu mirada',
    repairWithdrawLabel: 'Se aisló',
    repairWithdrawDesc: 'Se retiró de la interacción o cambió de actividad',
    repairCryLabel: 'Llanto',
    repairCryDesc: 'Desborde emocional ante el quiebre',
    repairNoneLabel: 'No registró el quiebre',
    repairNoneDesc: 'Siguió como si la orden hubiera sido normal',
  },

  breaks: {
    routeKicker: '🏠 RUTA DE RUTINA · TPR 2.0',
    adultBanner: '👤 Panel del adulto · el niño NO toca la pantalla: escucha y actúa con objetos reales.',
    ready: '▶ Estamos listos',
    repeatOrder: '🔊 Repetir la orden',
    repeatOrderA11y: 'Repetir la orden en voz alta',
    structure: (focus: string): string => `Estructura: ${focus}`,
    notThisTime: '✖️ No esta vez',
    skip: 'Saltar esta vez',
    tprKicker: '🧩 CÁPSULA TPR · ESCUCHA Y MUÉVETE',
    tprSub: 'La app dice la orden en voz alta y el niño responde con el cuerpo (Total Physical Response).',
    tprRepeat: '🔊 Repetir orden',
    tprDoneLast: '✅ ¡Hecho! Seguimos →',
    tprDone: '✅ ¡Lo hizo!',
    routeDoneLast: '✅ Lo hizo · terminar',
    routeDone: '✅ Lo hizo',
    // Ancla Visual Lejana (20-20-20). El copy dice SUGERENCIA en todas sus
    // formas: nada aquí detiene la sesión y el pie lo deja por escrito.
    visualAnchorKicker: '👁️ DESCANSO VISUAL · REGLA 20-20-20',
    visualAnchorTitle: 'Descanso visual recomendado',
    visualAnchorBody: 'Lleváis 20 minutos de pantalla cerca. Lúa está lista para una pausa de 20 segundos: que mire algo lejano —una ventana, el fondo de la sala— mientras la gata duerme.',
    visualAnchorStart: (n: number): string => `▶ Empezar los ${n} segundos`,
    visualAnchorRunning: (n: number): string => `Mirando lejos · ${n} s`,
    visualAnchorFarAway: 'Que siga mirando lo más lejos que haya en la sala. Lúa duerme hasta que termine.',
    visualAnchorResume: 'Reanudar ahora',
    visualAnchorLater: 'Ahora no',
    visualAnchorHint: 'Lúa se duerme durante la pausa. La sesión no se detiene.',
    visualAnchorFoot: 'Sugerencia · la app no detiene la sesión, la pausa la decides tú.',
  },

  pro: {
    unlockPill: 'Desbloquear Edición Profesional',
    unlockedPill: 'Modo profesional activo',
    modalTitle: 'Modo Profesional',
    pinError: 'PIN incorrecto. Inténtalo de nuevo.',
    demoPin: 'PIN de demostración: 1985',
    pinSubtitleDefault: 'Introduce el PIN de 4 dígitos del logopeda para editar la prescripción.',
    shareCancelled: 'Exportación cancelada · el log se conserva para reintentar.',
    shareFailed: 'No se pudo abrir el menú de compartir · el log se conserva.',
    exportKicker: '🔓 MODO PROFESIONAL · EXPORTACIÓN',
    exportTitle: 'Evidencia de usabilidad',
    exportSub: 'Escanea el QR para el resumen offline o comparte el log completo cuando haya conexión.',
    qrCaption: 'Resumen offline · escaneable con la cámara',
    shareLog: '📤 Compartir log completo (email · WhatsApp)',
    packaging: 'Empaquetando log…',
    shareTitle: 'Log de usabilidad · Valeria+ (piloto)',
    exportPurged: 'Log exportado y purgado del dispositivo.',
    statSessions: 'Sesiones',
    statTprAbandon: 'Abandono TPR',
    statMisclicks: 'Misclicks',
    statSusMean: 'Media SUS',
    statSusAnswers: 'Respuestas SUS',
    statFullBlocks: '4 bloques',
  },

  sus: {
    kicker: '💬 UNA PREGUNTA RÁPIDA',
    question: 'Fue fácil integrar este ejercicio en la rutina de mi hijo/a.',
    scaleA11y: (v: number, label: string): string => `${v} de 5: ${label}`,
    thanks: '¡Gracias por ayudarnos a mejorar Valeria+!',
    sub: 'Toca la carita que mejor lo describa. Es anónimo y solo tardas un segundo.',
    disagree: 'Nada de acuerdo',
    agree: 'Muy de acuerdo',
    neutral: 'Neutral',
    somewhat: 'Bastante',
    slightly: 'Poco',
  },

  results: {
    back: '‹ Volver a ejercicios',
    title: 'Resultados y Evolución',
    noPatient: 'Paciente sin ficha registrada',
    recordNumber: (nhc: string): string => `NHC ${nhc}`,

    gameTitle: 'Motivación y logros',
    currentStreak: 'racha actual',
    totalXp: 'XP total',
    bestStreak: 'mejor racha',
    level: (n: number, name: string): string => `Nivel ${n} · ${name}`,
    xpToNext: (n: number): string => `${n} XP para el siguiente nivel`,
    badgesLabel: (won: number, total: number): string => `INSIGNIAS · ${won}/${total}`,

    adherenceTitle: 'Adherencia semanal',
    adherenceLabel: 'Adherencia de la semana',
    adherenceValue: (done: number, goal: number): string => `${done} de ${goal} sesiones completadas`,

    evolutionTitle: 'Evolución por estrellas',
    pairsChartSub: 'Pares mínimos · % de ensayos con la sustitución detectada por el micrófono (bajar = mejorar)',
    sessionsCount: (n: number): string => `${n} ${n === 1 ? 'sesión' : 'sesiones'}`,
    arTargetMs: (ms: number): string => `objetivo ${ms} ms`,
    arMeasuredOn: (device: string, level: string, fps: number): string =>
      `Medido en ${device} · nivel ${level} · ${fps} fps sostenidos`,
    arVoidedTrials: (n: number): string =>
      ` · ${n} ensayo${n === 1 ? '' : 's'} anulado${n === 1 ? '' : 's'} por movimiento del teléfono`,
    evolutionSub: (n: number): string => `Promedio de estrellas · últimas ${n} sesiones`,
    trendUp: (d: number): string => `▲ +${d} ★`,
    trendDown: (d: number): string => `▼ ${d} ★`,
    trendStable: '= estable',

    // Recuento del micrófono.
    //
    // Decisión de Frank: esto es un APOYO DEL EJERCICIO y nada más. No es una
    // medida del lenguaje, no tiene finalidad sanitaria y no entra en ninguna
    // decisión clínica. Por eso el rótulo no dice «producción», ni «evolución»,
    // ni desde luego «LME» —la longitud media del enunciado se cuenta en
    // morfemas sobre habla espontánea, y esto son frases dictadas—: cualquiera
    // de esas palabras lo convertiría, a ojos de quien lo lea, en un indicador.
    // Dice lo que hace: contar palabras que el micrófono reconoció.
    speechTitle: 'Recuento del micrófono',
    speechSub: 'Cuántas palabras de la frase pedida reconoció el micrófono. Es un apoyo del ejercicio, no una medida.',
    speechWpu: 'palabras por frase',
    speechCoverage: 'de la frase pedida',
    speechUtterances: (n: number): string => (n === 1 ? 'frase practicada' : 'frases practicadas'),
    speechNote:
      'Esto NO es una medida clínica ni tiene finalidad sanitaria. Es un apoyo del ejercicio: sirve '
      + 'para que el niño vea por dónde va y para que tú veas qué palabra se cayó. No evalúa el '
      + 'lenguaje, no vale para un diagnóstico ni para un informe, y no debe usarse para tomar '
      + 'ninguna decisión sobre el tratamiento. Quien valora cómo habla el niño eres tú, con la '
      + 'escala EPT-3, igual que en el resto de la app.',

    phonemeTitle: 'Sustitución por fonema',
    pmFirstSession: 'primera sesión',
    pmImproving: (d: number): string => `▼ ${d} pp · mejora`,
    pmWorsening: (d: number): string => `▲ +${d} pp · reforzar`,

    arNoTiming: 'Se jugó sin cronometrar: hacen falta altavoces externos por cable para medir los tiempos. Los aciertos sí quedaron registrados.',
    arNoTrials: 'Todavía no hay ensayos con medida en este ejercicio.',
    arTrials: 'ensayos',
    arVoided: 'anulados',
    arMean: (unit: string): string => `media (${unit})`,
    arMax: (unit: string): string => `máximo (${unit})`,
    arShareLine: (name: string, n: number, medida: string): string => `• ${name}: ${n} ensayos · ${medida}`,
    arTrial1: 'ensayo 1',
    arLabel: (id: string): string => {
      switch (id) {
        case 'ar1': return 'Sostén del gesto';
        case 'ar2': return 'Latencia del giro';
        case 'ar3': return 'Fijación hasta elegir';
        case 'ar4': return 'Búsqueda espacial de Lúa';
        case 'ar5': return 'Latencia de lanzamiento';
        case 'ar6': return 'Sostén de praxia mímica';
        default: return 'Medida AR';
      }
    },
    arHint: (id: string): string => {
      switch (id) {
        case 'ar1': return 'Milisegundos que mantuvo el redondeo labial en cada ensayo. La línea de puntos es el objetivo que fijasteis vosotros.';
        case 'ar2': return 'Milisegundos entre el sonido y el giro de cabeza. Solo aparecen los ensayos que se pudieron cronometrar.';
        case 'ar3': return 'Milisegundos de mirada sostenida hasta confirmar el dibujo.';
        case 'ar4': return 'Milisegundos hasta localizar a Lúa con la retícula foveal y alinear la postura cefálica.';
        case 'ar5': return 'Milisegundos desde que Lúa pide el pez hasta que el peque termina el gesto de lanzarlo.';
        case 'ar6': return 'Milisegundos que sostuvo la expresión o praxia facial guiada con simetría bilateral.';
        default: return 'Milisegundos medidos durante el ejercicio de realidad aumentada.';
      }
    },
    arTitle: (id: string): string => {
      switch (id) {
        case 'ar1': return 'AR-1 · Cinemática orofacial';
        case 'ar2': return 'AR-2 · Localización del sonido';
        case 'ar3': return 'AR-3 · Selección por fijación';
        case 'ar4': return 'AR-4 · Búsqueda espacial de Lúa';
        case 'ar5': return 'AR-5 · Alimentar a Lúa';
        case 'ar6': return 'AR-6 · Espejo mímico con Buddy Lúa';
        default: return `AR · ${id.toUpperCase()}`;
      }
    },
    arTrialN: (n: number): string => `ensayo ${n}`,

    historyLabel: 'HISTORIAL DE SESIONES',
    historyCount: (n: number): string => `${n} registradas`,
    average: (v: string): string => `Promedio: ${v} / 3`,
    understands: '👆 COMPRENDE',
    produces: '🗣 PRODUCE',
    responsesKicker: '📝 RESPUESTAS REGISTRADAS',

    newSession: 'Iniciar nueva sesión →',
    backGhost: '↩ Volver a ejercicios',
    sharePdf: '📄 Compartir PDF',
    footNote: 'Historial almacenado únicamente en este dispositivo (local-first).',
    shareTitle: 'Resultados Valeria+',
    // Historial de EJEMPLO que se muestra antes de que existan sesiones reales.
    demoHistory: (): Array<{ date: string; name: string; note: string }> => [
      { date: '10 jun', name: 'Asociación vocal inicial', note: 'Le costó arrancar, pero acabó asociando las vocales con apoyo.' },
      { date: '12 jun', name: 'Detección del intruso', note: 'Buena sesión, encontró el intruso tras la pregunta guía.' },
      { date: '15 jun', name: 'Reconocimiento de emociones', note: 'Muy concentrado hoy, nombró casi todas las emociones.' },
      { date: '17 jun', name: 'Estructura S-V-O', note: 'Construyó frases completas con los dados, gran avance.' },
      { date: '19 jun', name: 'Sesión de ejercicios', note: 'Excelente. Respondió las consignas casi sin ayuda.' },
    ],
    // Informe que el clínico comparte. Lo lee una persona, así que sigue al
    // idioma de la interfaz.
    shareHeader: 'VALERIA+ · Resultados y Evolución',
    shareAdherence: (pct: number, done: number, goal: number): string => `Adherencia semanal: ${pct}% (${done}/${goal})`,
    shareTrend: (trend: string): string => `Tendencia: ${trend}`,
    shareHistory: 'Historial de sesiones:',
    sharePm: 'Pares mínimos · sustitución por fonema:',
    shareAr: 'Realidad aumentada · magnitudes medidas:',
    shareFoot: 'Informe local-first generado en el dispositivo.',
    shareSessionLine: (date: string, name: string, avg: string, stars: string, split: string, resp: string): string =>
      `• ${date} · ${name} — ${avg}/3 ${stars}${split}${resp}`,
    shareSplit: (comp: string, prod: string): string => ` [comprende ${comp}/3 · produce ${prod}/3]`,
    shareResponse: (code: string, text: string): string => `\n    · ${code} respondió: “${text}”`,
    sharePmLine: (phoneme: string, pct: number, n: number): string =>
      `• ${phoneme}: ${pct}% de sustitución en la última sesión (${n} ${n === 1 ? 'sesión' : 'sesiones'})`,
    shareArMeasure: (label: string, mean: number, unit: string, max: number, n: number): string =>
      `${label.toLowerCase()} media ${mean} ${unit} (máx. ${max} ${unit}, n=${n})`,
    shareArNoTiming: 'sin medida cronometrada',
    shareArVoided: (n: number): string => ` · ${n} anulados por movimiento del teléfono`,
    shareDevice: (mk: string, model: string, level: string, fps: string): string =>
      `\n  Medido en ${mk} ${model} · nivel de aptitud ${level} · ${fps} fps sostenidos`,
    shareThresholds: (hold: number, turn: number, win: number, dwell: number): string =>
      `\n  Umbrales fijados por el adulto: sostén ${hold} ms · giro ${turn}° · ventana ${win} ms · fijación ${dwell} ms`,
  },

  // Notificaciones locales. Las escribe la app y las lee el ADULTO en la
  // pantalla de bloqueo, así que siguen al idioma de interfaz. Los mensajes se
  // programan por adelantado: al cambiar de idioma hay que REPROGRAMAR, o los
  // avisos ya en cola seguirían llegando en el idioma anterior (lo hace
  // AppNavigator al suscribirse al cambio).
  notifications: {
    channelName: 'Recordatorios de sesión',
    messages: (): Array<{ title: string; body: string }> => [
      { title: '🧸 ¡La osita Valeria te espera!', body: '5 minutitos de juego valen oro. ¿Hacemos una sesión rápida?' },
      { title: '🔥 ¡No pierdas tu racha!', body: 'Una sesión al día mantiene viva la llama. ¡Vamos a jugar!' },
      { title: '👂 Momento de escuchar', body: '¿Probamos el juego de los sonidos? Solo toma unos minutos.' },
      { title: '⭐ Hora de ganar estrellas', body: 'Cada ejercicio suma XP. ¡A por las 3 estrellas!' },
      { title: '🐸 ¡A saltar y aprender!', body: 'Los juegos con movimiento son los favoritos. ¿Jugamos?' },
      { title: '🎯 Pequeño reto, gran avance', body: 'Un ejercicio ahora = un gran paso en su lenguaje.' },
      { title: '🎉 ¡Valeria tiene un juego nuevo!', body: 'Entra y descubre la pausa activa de hoy.' },
      { title: '💪 Constancia = progreso', body: 'Las familias que practican a diario ven el doble de avance.' },
      { title: '🌈 Un ratito juntos', body: 'Jugar, mover el cuerpo y aprender: todo en una sesión Valeria.' },
      { title: '🏆 Tu logro te espera', body: 'Estás cerca de desbloquear una insignia nueva. ¡Entra a por ella!' },
      { title: '🎵 ¿Oyes eso?', body: 'Es la hora del Test de Ling y los juegos de audición.' },
      { title: '🧩 Última llamada del día', body: 'Todavía estás a tiempo de sumar la sesión de hoy. ¡Ánimo!' },
    ],
    parentTips: (): Array<{ title: string; body: string }> => [
      {
        title: '👀 Consejo 1 · Tus ojos y tu boca son su mapa',
        body: 'Para aprender a articular, tu hijo necesita ver cómo se fabrican las palabras. Agáchate a su nivel, mírale a los ojos y deja que vea tu boca: su cerebro es un espejo que copia tus movimientos. Si le hablas desde otra habitación, de espaldas o mirando el celular, le quitas el mapa visual que necesita para mover los labios y la lengua.',
      },
      {
        title: '📵 Consejo 2 · La trampa de las pantallas educativas',
        body: 'Celulares, tabletas y televisores no enseñan a hablar, aunque el programa repita números o colores. El lenguaje vivo requiere turnos: hablar, escuchar y responder. Una pantalla no hace pausas para escuchar a tu hijo, no le sonríe cuando lo intenta ni le corrige con cariño. Las horas de práctica real solo se las puedes dar tú.',
      },
      {
        title: '🤫 Consejo 3 · La regla del silencio',
        body: 'Los adultos hablamos rápido y llenamos todos los silencios. Cuando le ofrezcas algo (por ejemplo, leche) y le preguntes "¿qué quieres?", haz una pausa y cuenta mentalmente hasta cinco. Dale tiempo a su cerebro para procesar y organizar los músculos. Ese silencio estratégico es el que lo empuja a usar un sonido, un gesto o una palabra.',
      },
      {
        title: '🛁 Consejo 4 · La rutina es tu mejor aliada',
        body: 'No necesitas una hora de ejercicios ni materiales costosos. El mejor momento para el lenguaje es lo que ya haces cada día: mientras lo bañas, nombra el jabón, el agua y las partes del cuerpo; mientras recogen la ropa, nombra los colores. Repetir palabras sencillas en situaciones reales de la casa graba el vocabulario de forma definitiva.',
      },
      {
        title: '🐶 Consejo 5 · Expande lo que dice, sin regañar',
        body: 'Si señala un perro y dice "guau guau", no le digas "así no se dice": devuélvele la frase mejorada, "¡sí, es un perro grande!". Si dice "agua", respóndele "quieres tomar agua". Al expandir sus palabras sin criticarlo le das el modelo correcto y le confirmas que su intento de comunicarse fue exitoso y valorado.',
      },
    ],
  },

  // Componentes de voz compartidos (ValeriaVoiceUI): botón de escucha, mapa del
  // turno, juego de micrófono, registro de respuesta, tarjeta «Voz de la app» y
  // bloque de privacidad del micrófono. Se migran juntos porque los cinco viven
  // en el mismo fichero y aparecen dentro de pantallas ya traducidas: sin esto,
  // elegir English dejaba media pantalla en castellano (EN-1.3).
  voice: {
    listen: 'Escuchar',
    listenA11y: (text: string): string => `Escuchar: ${text}`,

    phaseListen: 'Escucha',
    phaseRepeat: 'Repite',
    phaseVerdict: 'Veredicto',
    phaseMission: 'Misión',
    currentPhase: (label: string): string => `Fase actual: ${label}`,

    micKicker: 'JUEGO DE VOZ · ¡AHORA EL NIÑO!',
    micPrompt: (target: string): string => `Pulsa el micro y que diga: “${target}”`,
    micHearModel: 'Oír modelo',
    micStartA11y: 'Empezar a escuchar',
    micStopA11y: 'Dejar de escuchar',
    micListening: 'Escuchando…',
    micTapToSpeak: 'Toca para hablar',
    micHeard: 'La app escuchó:',
    micUnavailable:
      'El juego de micrófono se activa en la app instalada (APK). Mientras tanto, '
      + 'el niño puede repetir la palabra y tú valoras abajo.',
    // Veredicto VISUAL del intento (para el adulto). Lo HABLADO va por
    // micVerdictSayFor, en los bancos por variedad: son cosas distintas.
    micVerdicts: [
      { icon: '👂', title: 'Otra vez juntos', sub: 'Escuchad la palabra despacio y repetid a la vez.' },
      { icon: '💪', title: '¡Casi casi!', sub: 'Se parece mucho. Repetid el modelo y probad otra vez.' },
      { icon: '🎉', title: '¡Lo dijo genial!', sub: 'La app entendió la palabra objetivo.' },
    ],

    // Debajo del veredicto. Dice CUÁNTO de la frase salió, que es lo que las
    // tres estrellas no pueden decir: «casi» le toca igual a quien dijo una
    // palabra de cinco que a quien dijo cuatro.
    micCoverage: (hits: number, total: number): string =>
      `${hits} de ${total} palabras de la frase`,

    sentenceCardsKicker: 'LÁMINAS DE LA FRASE',
    // Corto a propósito: convive en la misma línea con el rótulo, y «conseguidas»
    // lo dice ya el check verde de cada lámina.
    sentenceCardsProgress: (hits: number, total: number): string => `${hits} de ${total} palabras`,
    sentenceWordMatched: (word: string): string => `Palabra conseguida: ${word}`,
    sentenceWordPending: (word: string): string => `Palabra pendiente: ${word}`,

    captureKicker: '📝 REGISTRA SU RESPUESTA',
    capturePrompt: 'Graba con el micro o escribe lo que dijo el niño.',
    capturePlaceholder: 'Escribe aquí lo que dijo…',
    captureWriteA11y: 'Escribir la respuesta del niño',
    captureRecordA11y: 'Grabar la respuesta con el micrófono',
    captureStopA11y: 'Dejar de grabar',
    captureListening: 'Escuchando… habla ahora',
    captureOk: '✓ Respuesta registrada: se guardará con la sesión en Resultados.',

    cardTitle: 'Voz de la app',
    varietyLabel: 'Variedad de la voz',
    // Nombres de las variedades. En castellano se usan los endónimos de siempre;
    // en inglés, los nombres que un cuidador estadounidense reconoce.
    localeEs: 'Castellano',
    localeGl: 'Galego',
    localeEsDO: 'Dominicano',
    localeEu: 'Euskara',
    localeEnUS: 'English (US)',
    localeCa: 'Català',
    varietyA11y: (label: string, beta: boolean): string =>
      `Voz en ${label}${beta ? ', en pruebas' : ''}`,

    chipChecking: 'Comprobando…',
    chipNatural: '✓ Voz natural',
    chipStandard: 'Voz estándar',
    chipPoor: 'Voz mejorable',
    chipCeltia: '✓ Voz Celtia',
    chipHitz: '✓ HiTZ ahotsa',
    chipPiperEn: '✓ Piper en_US',
    chipMatxaCa: '✓ Veu Matxa (AINA)',

    detailSearching: 'Buscando la mejor voz en español instalada en este dispositivo…',
    detailNoVoice:
      'No hay ninguna voz en español instalada: la app no podrá leer las consignas hasta descargarla.',
    detailDo: (name: string): string =>
      `En dominicano la app usa la voz latina del dispositivo${name ? ` («${name}»)` : ''} y el micrófono `
      + 'en es-DO. Si suena peninsular o robótica, instala una voz de Español (Latinoamérica).',
    detailGood: (name: string): string =>
      `La app usará la mejor voz del dispositivo${name ? ` («${name}»)` : ''}. Suena natural, no robótica.`,
    detailAndroidPoor:
      'Este dispositivo solo ofrece una voz sencilla y puede sonar robótica. Instala las voces de '
      + 'Google (gratis y sin conexión) para que la app suene natural.',
    detailIosPoor:
      'Puedes mejorar la voz en Ajustes → Accesibilidad → Contenido leído → Voces → Español, '
      + 'descargando la voz mejorada.',
    // Inglés. Este texto decía que los ejercicios seguían en revisión clínica y
    // que la sesión se quedaba en castellano. Dejó de ser cierto cuando se
    // firmó la guía dialectal (EN-0.5) y EN_THERAPY_CONTENT_READY pasó a true:
    // el banco existe y la variedad se comporta como cualquier otra. El aviso
    // sobrevivió al cambio y estuvo contradiciendo al propio código.
    // Lo que sí hay que seguir diciendo aquí es el respeto dialectal, igual que
    // en `detailDo`: es lo que el adulto necesita saber antes de la primera
    // sesión, no el estado del proyecto.
    detailEn:
      'La voz neuronal en inglés (Piper en_US) viaja dentro de la app y funciona sin conexión: toca '
      + '«Probar la voz» para oírla. Los ejercicios tienen banco propio y guía dialectal firmada: no '
      + 'se marcan como error los rasgos del inglés afroamericano ni los del hablante bilingüe. Al '
      + 'elegir esta variedad cambian la locución, el micrófono y el idioma de la interfaz.',

    testVoice: '▶ Probar la voz',
    testVoiceA11y: 'Probar cómo suena la voz',
    installGoogle: '⬇️ Instalar voces de Google',
    installGoogleA11y: 'Instalar las voces de Google',
    recheck: '🔄 Volver a comprobar',
    recheckA11y: 'Volver a comprobar la voz',
    installHint:
      'Tras instalar: Ajustes → Sistema → Salida de texto a voz → elige «Motor de voz de Google» y '
      + 'descarga la voz de Español (España). Después vuelve aquí y toca «Volver a comprobar».',

    privCapture:
      '⏺ CAPTURA DE CORPUS ACTIVA. Esta build guarda en el dispositivo el audio del turno de habla. '
      + 'No es una build de producción: no debe usarse en una sesión normal ni quedarse en el aparato '
      + 'de una familia.',
    privKicker: 'MICRÓFONO DEL EJERCICIO',
    privChecking: 'Comprobando dónde se procesa la voz del niño en esta variedad…',
    privLocal: (label: string): string =>
      `En ${label} el reconocimiento se hace dentro del teléfono: el audio del turno de habla no sale `
      + 'del dispositivo.',
    privLocalFailed: (label: string): string =>
      `El paquete de ${label} figura instalado, pero al escuchar de verdad el reconocedor del teléfono `
      + 'no arrancó. Para no dejar el ejercicio roto, la app ha vuelto al servicio de reconocimiento '
      + 'del sistema, que puede enviar el audio a sus servidores. Toca «Volver a comprobar» para '
      + 'intentarlo otra vez en local.',
    privNotCapable: (label: string): string =>
      `Este dispositivo no sabe reconocer voz sin conexión, así que en ${label} el audio del turno de `
      + 'habla lo procesa el servicio de reconocimiento del sistema, que puede enviarlo a sus servidores.',
    privNoService: (label: string): string =>
      `Este dispositivo no expone ningún servicio de reconocimiento de voz, así que en ${label} el juego `
      + 'de micrófono no puede funcionar. Comprueba en Ajustes que el reconocimiento de voz del sistema '
      + 'esté instalado y activado.',
    privCanDownload: (label: string): string =>
      `Este móvil puede reconocer sin conexión, pero le falta el paquete de ${label}. Mientras tanto, el `
      + 'audio del turno de habla lo procesa el servicio del sistema, que puede enviarlo a sus servidores.',
    privNoDownload: (label: string): string =>
      `Falta el paquete de ${label} y esta versión de Android no permite descargarlo desde la app. Puedes `
      + 'instalarlo en Ajustes → Sistema → Idiomas → Entrada por voz; hasta entonces el audio lo procesa '
      + 'el servicio del sistema.',
    privOffer: (label: string): string =>
      `Si descargas el paquete de ${label}, la voz del niño deja de salir del teléfono. Ocupa espacio y se `
      + 'descarga una sola vez; los ejercicios funcionan igual si prefieres no hacerlo.',
    privDownload: '⬇️ Descargar el paquete',
    privDownloadA11y: (label: string): string =>
      `Descargar el paquete de reconocimiento de voz en ${label}`,
    privNotNow: 'Ahora no',
    privNotNowA11y: 'No descargar el paquete de voz',
    privRecheckA11y: 'Volver a comprobar dónde se reconoce la voz',
    privNoteOk: '✓ Paquete descargado. A partir de ahora la voz se reconoce dentro del teléfono.',
    privNoteDialog:
      'Se abrió la pantalla de descarga del sistema. Cuando termine, toca «Volver a comprobar».',
    privNoteCancelled: 'Descarga cancelada. Se sigue usando el reconocimiento del sistema.',
    privNoteFailed:
      'No se pudo pedir la descarga en este dispositivo. Puedes hacerlo desde Ajustes → Sistema → '
      + 'Idiomas → Entrada por voz.',
    privNoteDeclined: 'Sin problema: los ejercicios funcionan igual con el reconocimiento del sistema.',
    privLastListen: (local: boolean): string =>
      `Última escucha de esta sesión: ${local ? 'en el teléfono' : 'servicio del sistema'}.`,
    privRecognizer: (name: string): string => `Reconocedor del sistema: ${name}.`,
  },

  // Slider de ruido babble del panel del adulto. Vivía suelto en el componente:
  // no es una pantalla, así que se quedó fuera de los cinco tramos de EN-2.3.
  noise: {
    kicker: 'RUIDO DE FONDO (BABBLE)',
    off: 'apagado',
    levelTag: (n: number): string => `nivel ${n}`,
    hint: 'Solo lo controlas tú: sube el murmullo de cafetería poco a poco si tu logopeda te lo ha indicado. La app nunca lo cambia sola.',
    sliderA11y: 'Nivel de ruido de fondo',
    silence: 'Silencio',
    cafe: 'Cafetería',
  },

  settings: {
    uiLangTitle: 'Idioma de la aplicación',
    // Antes decía que esto NO cambiaba los ejercicios. Ya no es verdad y era
    // media app en cada idioma: elegir idioma cambia la app entera.
    uiLangHint:
      'Cambia la app entera: los menús que lees tú y también lo que suena en '
      + 'los ejercicios. Si quieres la interfaz en un idioma y los ejercicios en '
      + 'otro, cámbiala después en «Voz de la app».',
    uiLangAuto: 'Automático',
    uiLangAutoHint: 'Sigue al idioma de los ejercicios.',
    uiLangEs: 'Español',
    uiLangEn: 'English',
    uiLangCa: 'Català',
  },


  // Bloque de Realidad Aumentada. La cámara MIRA, no graba: el copy de
  // consentimiento es parte del muro MDR, no adorno — se traduce entero o no se
  // traduce (una mezcla de idiomas aquí es un consentimiento inválido).
  ar: {
    title: 'Realidad Aumentada',
    subPreparing: 'Preparando la sesión',
    subUnsupported: 'No disponible en este dispositivo',
    subConsent: 'Antes de encender la cámara',
    subWarmup: 'Calentamiento con Lúa',
    subNotApt: 'Este teléfono no da para estos juegos',
    subLevel: (label: string): string => `Nivel de este teléfono: ${label}`,
    sessionDone: 'Sesión terminada',
    oneMoment: 'Un momento…',

    busyMeasuring: 'Midiendo este teléfono… (unos 90 segundos)',
    busyCalibrating: 'Vamos a jugar a seguir a Lúa por las esquinas (15 segundos)…',
    busyOpeningCamera: 'Abriendo la cámara…',

    noticeAptitudeFailed: 'No se pudo completar la prueba en este teléfono. Puedes intentarlo de nuevo.',
    noticeCameraBusy: 'Otra aplicación está usando la cámara. Ciérrala y vuelve a intentarlo.',
    noticeArServicesOutdated: 'Actualiza «Servicios de Google para RA» desde Play Store y vuelve a intentarlo.',
    noticeArServicesMissing: 'Este bloque necesita «Servicios de Google para RA». Acepta la instalación cuando te la ofrezca.',
    noticeCameraDenied: 'Sin permiso de cámara no se puede hacer el calentamiento. Puedes concederlo y volver a intentarlo.',
    noticeCalibrationFailed: 'La calibración no se completó. Coloca el teléfono apoyado, en horizontal, a un palmo y medio de la cara y prueba otra vez.',
    noticeLaunchFailed: 'El ejercicio no llegó a abrirse. Comprueba que la app tiene permiso de cámara.',
    noticeDenied: 'Sin permiso de cámara no hay ejercicios de Realidad Aumentada. El resto de la app funciona igual.',
    noticeTimeout: 'El ejercicio se cerró porque la cámara dejó de ver la cara del peque. Apoya el teléfono en horizontal, a un palmo y medio de su cara y a la altura de sus ojos, y prueba otra vez.',

    unsupportedTitle: 'Aquí no se puede jugar todavía',
    unsupportedBody: 'Estos ejercicios necesitan la cámara frontal y una versión de la app instalada en el teléfono (no funcionan en la vista previa de Expo Go). Los otros seis bloques de ejercicios funcionan exactamente igual de bien.',

    consentTitle: 'Qué hace la cámara en estos juegos',
    consentLead1: 'En este bloque la cámara frontal no graba: ',
    consentLeadStrong: 'mira',
    consentLead2: '. Sirve para saber si tu peque redondea los labios, gira la cabeza hacia un sonido o mira un dibujo, y para que el coche, el perro o la manzana reaccionen a ese gesto.',
    consentNoRecordStrong: 'No se graba ni se guarda ninguna imagen.',
    consentNoRecord: ' Cada fotograma se analiza y se descarta al instante.',
    consentNoUploadStrong: 'Ningún vídeo sale del teléfono.',
    consentNoUpload: ' Todo el análisis ocurre aquí dentro, sin internet.',
    consentNoFaceIdStrong: 'No se reconoce la cara de nadie.',
    consentNoFaceId: ' Solo se miden gestos: grados, milisegundos y proporciones.',
    consentMicOffPre: 'En dos de los tres ejercicios el ',
    consentMicOffStrong: 'micrófono está apagado',
    consentMicOffPost: ': se premia el esfuerzo motor antes de pedir que hable.',
    consentRevoke: 'Puedes salir en cualquier momento y retirar este permiso desde los ajustes de Android.',
    consentAccept: 'Lo entiendo y acepto',
    consentAcceptA11y: 'Aceptar el uso de la cámara y continuar',
    consentDecline: 'Ahora no',

    warmupTitle: 'Un juego de calentamiento de minuto y medio',
    warmupBody1a: 'Cada teléfono es distinto y estos ejercicios exigen bastante. Antes de empezar, la app hace una prueba corta —mirar a Lúa, seguirla a las esquinas, escuchar dos sonidos— para saber qué puede ofrecer ',
    warmupBody1Strong: 'en este teléfono concreto',
    warmupBody1b: '. Se hace una sola vez.',
    warmupBody2a: 'Apoya el teléfono en un libro o una caja, en ',
    warmupBody2Strong: 'horizontal',
    warmupBody2b: ', a un palmo y medio de la cara del peque (unos 30-35 cm), y déjalo quieto.',
    warmupStart: 'Empezar el calentamiento',
    warmupStartA11y: 'Empezar el calentamiento',
    warmupRedo: 'Repetir el calentamiento',
    warmupRedoA11y: 'Repetir el calentamiento de este teléfono',

    notAptTitle: 'Mejor no forzarlo',
    notAptBody: 'No es un fallo tuyo ni del peque: la cámara y los dibujos en 3D a la vez piden más de lo que este aparato puede sostener, y un ejercicio a tirones no mide nada.',
    notAptNoFrontCamera: 'Este teléfono no ofrece su cámara frontal a la Realidad Aumentada. No es cuestión de actualizar nada: los ejercicios de este bloque necesitan ver la cara del peque y aquí no pueden.',
    notAptDeviceUnsupported: 'Este teléfono no está entre los que admiten Realidad Aumentada. No es cuestión de actualizar nada: el resto de bloques de Valeria+ funcionan con normalidad.',
    notAptBack: 'Volver a los bloques',

    levelLabel: (level: string): string => ({
      A: 'Instrumento', B: 'Clínico', C: 'Reducido', D: 'No apto',
    }[level] ?? level),
    levelNote: (level: string): string => ({
      A: 'Este teléfono mide con precisión suficiente: los tres ejercicios están disponibles y la sesión puede entrar en el estudio.',
      B: 'Los ejercicios funcionan bien, pero el reloj de la cámara o la salida de audio no permiten cronometrar el giro: la localización del sonido se juega sin registrar tiempos.',
      C: 'El puntero de este teléfono es demasiado inestable para tres dianas: la selección por mirada va con dos, que es una elección forzada perfectamente válida.',
      D: 'Este teléfono no sostiene la cámara y la escena 3D a la vez. El bloque de Realidad Aumentada no aparece; los otros seis funcionan igual de bien.',
    }[level] ?? ''),
    levelHeading: (maker: string, model: string, level: string, label: string): string =>
      `${maker} ${model} · nivel ${level} (${label})`,

    shareProfile: 'Compartir ficha del teléfono',
    shareProfileA11y: 'Compartir la ficha técnica de este teléfono',
    shareTitle: 'Valeria+ · ficha de aptitud del teléfono',
    shareHeader: 'VALERIA+ · Censo de dispositivos (bloque de Realidad Aumentada)',
    shareMaker: 'Fabricante', shareModel: 'Modelo', shareOs: 'Sistema',
    shareLevel: 'NIVEL DE APTITUD',
    shareFps: 'fps sostenidos (p5)', shareThermal: 'Caída térmica',
    shareTimestamps: 'Marcas de tiempo de cámara', shareJitter: 'Jitter de audio',
    shareJitterNone: 'sin medir (sin montaje)',
    sharePointer: 'RMS del puntero', shareImu: 'IMU disponible',
    shareYes: 'sí', shareNo: 'no',
    shareScreen: 'Pantalla', shareSeparation: 'Separación alcanzable con 3 dianas',
    shareFooter: (date: string): string =>
      `Medido el ${date}. Sin datos del niño: es la ficha del aparato.`,

    exercisesKicker: 'EJERCICIOS DISPONIBLES',
    practiceA11y: (name: string): string => `Practicar ${name}`,
    unavailableA11y: (name: string): string => `${name}: no disponible en este teléfono`,
    flagGameOnly: 'Se juega, pero sin cronometrar el giro: hace falta un montaje de altavoces.',
    flagTwoTargets: 'Con dos dibujos en pantalla: en este teléfono tres quedarían demasiado juntos.',
    flagUnavailable: 'No disponible en este teléfono.',

    liveSignals: 'Ver las señales en vivo',
    liveSignalsA11y: 'Ver las señales en vivo, herramienta para la logopeda',
    liveSignalsSub: 'Para la logopeda: distancia, grados de giro, apertura de labios y fotogramas por segundo, en crudo. Sin refuerzo y sin registrar nada.',

    setupTitle: 'Cómo colocar el teléfono',
    setupBody: 'Apoyado en un libro, una caja o contra la pared, en horizontal, a un palmo y medio de la cara. La pantalla avisa en verde cuando la posición vale. Si el teléfono se mueve durante un ensayo, ese ensayo se anula: es preferible perderlo a apuntarlo mal.',

    measuredTitle: 'Lo que se ha medido',
    mdrNote: 'Estos son datos en bruto, no una valoración. La app mide y anota; quien interpreta si esto es mucho o poco para vuestro peque es vuestra logopeda.',
    backToExercises: 'Volver a los ejercicios',
    streakLine: (days: number, level: number, levelName: string): string =>
      `${days} ${days === 1 ? 'día' : 'días'} de racha · Nivel ${level} · ${levelName}`,

    rowTrials: 'Ensayos jugados',
    rowVoided: 'Ensayos anulados (el teléfono se movió)',
    rowHoldMax: 'Sostén más largo',
    rowHoldMean: 'Sostén medio',
    rowHoldTarget: 'Objetivo fijado por vosotros',
    rowCatchTrials: 'Ensayos sin sonido (control)',
    rowTimedTurns: 'Giros medidos con reloj',
    rowTimedTurnsNone: 'ninguno: se jugó sin cronómetro',
    rowLatencyMedian: 'Latencia mediana del giro',
    rowTargets: 'Dianas en pantalla',
    rowDwellMean: 'Fijación media hasta elegir',
    rowAcquisitionMean: 'Tiempo medio de búsqueda espacial',
    rowJitterRms: 'Estabilidad angular (Jitter RMS)',
    rowThrowVelocityMean: 'Velocidad media de lanzamiento',
    rowThrowLatency: 'Latencia media de lanzamiento',
    rowAimDeviation: 'Desviación media de puntería',
    rowMimicHoldMean: 'Sostén medio de praxia',
    rowSymmetryMean: 'Simetría bilateral media',
  },
  academy: {
    back: '‹ Volver',
    backA11y: 'Volver al hub de Academy',
    headerTitle: 'Academy',
    headerSub: 'Entiende qué le pasa a tu peque y cómo acompañarle, en cápsulas de dos minutos.',
    langFallbackNotice: 'Las cápsulas de formación todavía no están en catalán: las lees en castellano. El resto de la app y todos los ejercicios sí están en catalán.',
    progressTxt: (completed: number, total: number, pct: number): string => `${completed}/${total} · ${pct}%`,
    xpTxt: (xp: number): string => `${xp} XP`,
    hubCardTag: 'PARA TI',
    hubCardSub: 'Entiende el trastorno antes de ejercitarlo: Lenguaje, Hipoacusia, Dislalias, Dislexia y TEA.',
    hubCardComplete: 'Formación completada',
    hubCardProgress: (completed: number, total: number, pct: number): string => `${completed}/${total} unidades · ${pct}%`,
    hubCardA11y: (completed: number, total: number): string => `Valeria Academy: formación para cuidadores. ${completed} de ${total} cápsulas completadas.`,
    priorityKicker: 'TU PRIORIDAD DE HOY',
    priorityA11y: (title: string, domain: string): string => `Prioridad sugerida: ${title}. Dominio ${domain}.`,
    whyKicker: '¿POR QUÉ ESTA CÁPSULA?',
    readTime: (min: number): string => `${min} min de lectura`,
    startCapsule: 'Empezar cápsula',
    domainsKicker: 'DOMINIOS FORMATIVOS',
    domainCardA11y: (label: string, completed: number, total: number, level: string): string => `${label}. ${completed} de ${total} completadas. Nivel ${level}.`,
    comingSoon: 'Próximamente',
    slideOf: (cur: number, total: number): string => `Diapositiva ${cur} de ${total}`,
    nextSlide: 'Siguiente',
    takeQuiz: 'Hacer el quiz',
    quizKicker: 'MICRO-QUIZ · COMPROBACIÓN',
    quizSub: 'Responde a estas preguntas para fijar lo aprendido.',
    questionOf: (cur: number, total: number): string => `Pregunta ${cur} de ${total}`,
    passedTitle: '¡Cápsula superada!',
    failedTitle: 'Casi lo tienes',
    scoreSub: (pct: number): string => `Has acertado el ${pct}% de las preguntas.`,
    passRequirement: (threshold: number): string => `Necesitas al menos ${threshold}% para superarla. ¡Repasa y vuelve a intentarlo!`,
    claimXp: (xp: number): string => `Reclamar +${xp} XP`,
    reviewAndRetry: 'Repasar y reintentar',
    close: 'Cerrar',
    closeA11y: 'Cerrar ventana de Academy',
    badgesKicker: 'INSIGNIAS DEL DOMINIO',
    noBadgesYet: 'Completa cápsulas para desbloquear insignias.',
    capsulesKicker: 'CÁPSULAS DISPONIBLES',
    completedTag: 'COMPLETADA',
    perfectTag: '100% PERFECTO',
    deviceGuideTitle: 'Hipoacusia / Sordera',
    deviceGuideProgress: (completed: number, total: number, pct: number, level: string): string => `${completed}/${total} guías · ${pct}% · ${level}`,
    tabClinicalConcepts: 'Conceptos clínicos',
    tabDeviceManagement: 'Manejo de dispositivos',
    earAnatomyCaption: 'Cómo viaja el sonido hasta la cóclea.',
    markSeen: 'Marcar como vista',
    seenTag: '✓ Vista',
    claimGuideXp: (xp: number): string => `+${xp} XP`,
    badgesTxt: (count: number): string => `${count} ${count === 1 ? 'insignia' : 'insignias'}`,
    backToCapsules: 'Volver a las cápsulas',
    signPreviewTitle: 'Configuraciones de mano dibujadas',
    signPreviewSub: 'Las 27 letras del alfabeto dactilológico están en la cápsula «El alfabeto dactilológico».',
    nextQuestion: 'Siguiente pregunta',
    seeResult: 'Ver resultado',
    exitQuiz: 'Salir',
    receptiveLang: 'Lenguaje Receptivo (Comprensión)',
    expressiveLang: 'Lenguaje Expresivo (Producción / Habla)',

    // Rótulos de los esquemas vectoriales de hardware auditivo. Van dentro del
    // SVG y por eso están CENTRADOS: anclados a la izquierda, el inglés (más
    // largo) se salía del viewBox de 200.
    schema: {
      earA11y: 'Esquema del oído: pabellón, conducto auditivo, tímpano y cóclea.',
      earOuter: 'Externo',
      earMiddle: 'Medio',
      earCochlea: 'Cóclea',
      aidA11y: 'Esquema de un audífono retroauricular: cuerpo, tubo y molde.',
      aidMic: 'Micrófono',
      aidMold: 'Molde',
      aidTube: 'Tubo',
      ciA11y: 'Esquema de un implante coclear: procesador externo, antena con imán y electrodos en la cóclea.',
      ciProcessor: 'Procesador',
      ciCoil: 'Antena / imán',
      ciElectrodes: 'Electrodos',
      baA11y: 'Esquema de un implante osteointegrado: procesador, pilar anclado al hueso y transmisión por vía ósea.',
      baAbutment: 'Pilar (hueso)',
      baProcessor: 'Procesador',
      baBone: 'Vía ósea',
    },
  },
  sensory: {
    blockTag: 'MÓDULO SENSORIAL',
    blockTitle: 'Integración Sensorial',
    blockSubtitle: 'Desensibilización sistemática, modulación y anticipación visual ante sonidos cotidianos.',
    xpTotal: (xp: number): string => `${xp} XP`,
    sessionsCount: (n: number): string => `${n} ${n === 1 ? 'sesión' : 'sesiones'}`,
    clinicalNoticeTitle: 'Muro de Control Adulto y Seguridad Clínica',
    clinicalNoticeBody:
      'Tú configuras la intensidad y la duración. El niño o la niña puede pedir una pausa o detener el ejercicio en cualquier momento. Parar nunca es un fallo ni resta progreso.',
    activitiesHeader: 'ACTIVIDADES SENSORIALES',
    pilotBadge: 'PILOTO FUNCIONAL',
    inDevBadge: 'PRÓXIMAMENTE',
    availableTag: 'Disponible',
    inDevTag: 'En desarrollo',

    // Prescripción del logopeda sobre las seis actividades (PIN profesional).
    prescribedOf: (active: number, total: number): string => `${active} de ${total} prescritas`,
    notPrescribed: 'No prescrita',
    pinSubtitle: 'Introduce el PIN de 4 dígitos del logopeda para elegir qué actividades sensoriales practica la familia.',
    proUnlocked: 'Modo profesional desbloqueado.',
    savePrescription: 'Guardar Prescripción',
    saveHelper: 'La selección se guarda en el dispositivo y la edición se bloquea de nuevo.',
    savedPrescription: (n: number): string => `Prescripción guardada · ${n} actividades sensoriales activas.`,
    lockedHint: 'Modo Familia · solo el logopeda puede cambiar qué actividades sensoriales se practican.',
    prescriptionEmpty: 'Sin actividades prescritas. El logopeda decide cuáles se practican.',
    completedTimes: (n: number): string => `Completada ${n} ${n === 1 ? 'vez' : 'veces'}`,

    isa01Title: 'Mi sonido, mi botón',
    isa01Desc: 'Construir control, agencia y previsibilidad sobre el estímulo sonoro.',
    isa02Title: 'Semáforo de sonidos',
    isa02Desc: 'Asociar señal visual, inicio y fin del estímulo.',
    isa03Title: 'Detective de sonidos',
    isa03Desc: 'Identificar sonidos cotidianos sin sobrecarga.',
    isa04Title: 'Cerca y lejos',
    isa04Desc: 'Explorar distancia e intensidad bajo control adulto.',
    isa05Title: 'Encuentra la voz',
    isa05Desc: 'Práctica de figura-fondo simple con ruido suave.',
    isa06Title: 'Ambientes vivos cotidianos',
    isa06Desc: 'Simulación controlada de aula escolar, centro comercial y calle con tráfico y obras.',

    catAll: 'Todos',
    catEcological: 'Ambientes vivos (Colegio, Súper, Calle)',
    catAppliances: 'Electrodomésticos',
    catAlerts: 'Alertas y Naturaleza',
    ecologicalBadge: 'AMBIENTE VIVO SIMULADO',

    adultGateTag: 'CONTROL ADULTO · CONFIGURACIÓN',
    prepTitle: 'Preparación de la Sesión',
    prepSubtitle: 'Ajusta los parámetros antes de ceder el dispositivo.',
    selectStimulusLabel: 'Estímulo o ambiente acústico',
    selectCategoryLabel: 'Filtrar por tipo de entorno',
    intensityLabel: 'Intensidad sonora relativa',
    intensityHint1: 'Nivel 1: Muy suave (filtrado sub-umbral)',
    intensityHint2: 'Nivel 2: Suave (volumen bajo confortable)',
    intensityHint3: 'Nivel 3: Media (volumen ambiente controlado)',
    intensityHint4: 'Nivel 4: Moderada (estímulo natural graduado)',
    intensityHint5: 'Nivel 5: Media-alta (acercamiento ecológico)',
    durationLabel: 'Duración de la microexposición',
    tierMicro: 'Micro (3s)',
    tierShort: 'Corta (7s)',
    tierMedium: 'Media (15s)',
    tprStrategyTitle: 'Estrategia de regulación asociada (TPR)',
    startWithChildBtn: 'Iniciar sesión con el niño/a',

    anticipationKicker: 'ANTICIPACIÓN VISUAL',
    anticipationSub: 'El sonido va a comenzar sin sorpresas.',

    exploringTag: 'EXPLORACIÓN CONTROLADA',
    listeningNotice: 'Sonido en reproducción. Mantén la calma.',
    pressToStartNotice: 'Toca el botón cuando estés preparado/a para escuchar.',
    // Expo web y las builds sin el módulo nativo de audio no sacan sonido. Se
    // dice, no se disimula: la primera versión de esta pantalla rotulaba
    // «Sonido en reproducción» sobre el silencio.
    noAudioNotice: 'Este dispositivo no reproduce el estímulo sonoro.',
    noAudioWarning:
      'Este dispositivo no puede reproducir el sonido del ejercicio. La sesión se puede recorrer, pero NO hay estímulo auditivo: no la uses como exposición real.',
    luaQuietHint: 'Lúa acompaña en silencio y tranquilidad.',
    mySoundMyButton: 'Mi sonido, mi botón',
    soundActiveBtn: 'Escuchando…',
    askPauseBtn: 'Pedir pausa',
    stopActivityBtn: 'Detener',

    pausedTag: 'PAUSA SEGURA',
    pausedTitle: 'Pausa para regularse',
    pausedSubtitle: 'Parar está bien y es parte del aprendizaje.',
    stoppingIsOkTitle: 'La autorregulación es un éxito',
    stoppingIsOkBody:
      'Has decidido pausar. Respira hondo o realiza la estrategia de calma antes de continuar.',
    tryThisStrategy: 'Estrategia de calma sugerida:',
    resumeBtn: 'Reanudar sonido',
    closeAndRateBtn: 'Finalizar y registrar',

    sessionCloseTag: 'REGISTRO CLÍNICO ADULTO',
    sessionSummaryTitle: 'Valoración de la Sesión',
    sessionSummarySub: 'El adulto registra la respuesta. La participación siempre suma progreso.',
    childResponseLabel: '¿Cómo ha respondido el niño o la niña?',
    respCalm: 'Tranquilo / Regulado',
    respAttentive: 'Atento / Con curiosidad',
    respSensitive: 'Sensible / Ha pedido pausa',
    respOverwhelmed: 'Incomodidad / Detención temprana',
    tprAppliedToggle: 'Se ha realizado la estrategia de calma (TPR)',
    saveSessionBtn: 'Guardar sesión y sumar XP',

    wellDoneTitle: '¡Sesión completada!',
    wellDoneSub: 'Has explorado y regulado la escucha con éxito.',
    xpAddedToSensorySilo: 'Añadidos al progreso de Integración Sensorial',
    backToSensoryListBtn: 'Volver a actividades sensoriales',
  },

  // La Pizarra Mágica de Lúa · Módulo de Grafomotricidad, Escritura y Dislexia
  writing: {
    kicker: 'PIZARRA MÁGICA DE LÚA',
    title: 'Grafomotricidad y Escritura',
    sub: 'Trazado guiado con lápiz óptico · Dislexia y discriminación de grafemas',
    tabCritical: 'Letras críticas',
    tabWarmup: 'Lazos',
    tabFree: 'Pizarra libre',
    // Lo que suena es el NOMBRE de la letra, no el fonema aislado: el botón
    // dice lo que hace. (Un modelo de fonema aislado necesitaría su propia
    // grabación; mientras no exista, no se promete.)
    hearModel: 'Oír la letra',
    clearCanvas: 'Limpiar pizarra',
    toggleGuide: 'Pauta Montessori',
    checkStroke: '¡Comprobar trazo!',
    strokeCompleted: '¡Trazo perfecto!',
    strokeCompletedSub: 'Has seguido la dirección y el orden sin dudar.',
    strokeAlmost: '¡Casi lo tienes!',
    strokeAlmostSub: 'Sigue las flechas y los puntos de control en orden.',
    strokeColor: 'Color de tiza mágica',
    strokeWidth: 'Grosor del trazo',
    targetLetter: (l: string): string => `Traza la letra: ${l}`,
    targetWord: (w: string): string => `Escribe la palabra: ${w}`,
    targetLoop: 'Sigue el camino de Lúa sin levantar el lápiz',
    nextExercise: 'Siguiente trazo →',
    congratsTitle: '¡Pizarra completada!',
    congratsSub: 'Has completado todos los trazos de la serie con gran destreza.',


    // Barra de herramientas: solo se leen en voz alta (lector de pantalla).
    colorTurquoise: 'Tiza turquesa',
    colorGold: 'Tiza dorada',
    colorCoral: 'Tiza coral',
    colorSky: 'Tiza azul cielo',
    colorViolet: 'Tiza lavanda',
    widthFine: 'Trazo fino',
    widthMedium: 'Trazo medio',
    widthThick: 'Trazo grueso',
  },
};

// Tipo que debe cumplir CUALQUIER catálogo, derivado del castellano. Sin
// `as const` a propósito: los literales ensanchan a `string`, porque el inglés
// no dice lo mismo, dice lo equivalente. Lo que sí se hereda —y es el punto—
// son las CLAVES y las FIRMAS de las funciones.
export type UiStrings = typeof ES;
