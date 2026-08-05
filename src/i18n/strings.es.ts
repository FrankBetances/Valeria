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

  welcome: {
    tagline: 'Terapia auditiva y de lenguaje, en casa y guiada por ti.',
    sub: 'Tú diriges cada ejercicio y valoras la respuesta del niño. Valeria registra el progreso.',
    start: 'Comenzar',
    hasPatient: 'Ya tengo un paciente registrado',
    trust: 'Datos cifrados en el dispositivo · RGPD / HIPAA',
  },

  credits: {
    kicker: 'Proyecto desarrollado por',
    authorRole: 'Otorrinolaringólogo infantil',
    collaborators: 'En colaboración con',
    acoprosDesc: 'Asociación de Colaboración y Promoción del Sordo',
    quisqueyaDesc: 'Rehabilitación del lenguaje',
    voiceCredit:
      'Voz neuronal en castellano: «Sharvard» (Piper · rhasspy/piper-voices). '
      + 'En galego: «Celtia» · Proxecto Nós. '
      + 'Euskaraz: HiTZ-TTS · ILENIA/NEL-GAITU (UPV/EHU · Aholab).',
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
    emptyBody: 'Registra tu primer paciente para empezar a prescribir terapias.',
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
    continueToPrescription: 'Continuar a Prescripción →',
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
    title: 'Prescripción de Terapias',
    subtitle: 'Elige un bloque para practicar o prescribir',
    streak: (n: number): string => `${n} ${n === 1 ? 'día de racha' : 'días de racha'}`,
    level: (n: number, name: string): string => `Nivel ${n} · ${name}`,
    sectionTraining: 'TU FORMACIÓN',
    sectionBlocks: 'BLOQUES DE TERAPIA',

    pairsTitle: 'Pares Mínimos',
    pairsSub: 'Dislalias: rotacismo, sigmatismo y más con juego de voz.',
    pairsA11y: 'Practicar pares mínimos para dislalias',
    semanticTitle: 'Expansión Semántica',
    semanticSub: 'Escenarios diarios, progresión léxica y contrastes con acción física.',
    semanticA11y: 'Practicar expansión semántica y progresión léxica',
    hearingTitle: 'Audición',
    hearingSub: 'Inspirado en el protocolo ACOPROS: sonidos, vocabulario, frases y uso social, organizado por edades.',
    hearingA11y: 'Abrir terapias de audición',
    languageTitle: 'Lenguaje',
    languageSub: 'Protocolo familiar: atención conjunta, imitación, comprensión y más.',
    languageA11y: 'Abrir terapias de lenguaje',
    autismTitle: 'TEA',
    autismSub: 'PRT + TCC: atención conjunta triangulada, reparación comunicativa y flexibilidad. Estresores siempre manuales.',
    autismA11y: 'Abrir terapias del módulo TEA',
    dyslexiaTitle: 'Dislexia',
    dyslexiaSub: 'Conciencia fonológica, síntesis fonémica, pseudopalabras y rastreo de letras giradas (b/d, p/q).',
    dyslexiaA11y: 'Abrir terapias del módulo Dislexia',
    arTitle: 'Realidad Aumentada',
    arSub: 'La cámara mira el gesto y el coche, el perro o la manzana reaccionan a él. Sin grabar nada y con el micrófono apagado.',
    arA11y: (n: number): string => `Abrir el bloque de realidad aumentada, ${n} ejercicios`,

    therapiesBadge: (n: number): string => `${n} terapias`,
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
    blockChip: (total: number, prescribed: number): string => `${total} terapias · ${prescribed} prescritas`,
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
      + 'pragmático, ruido, oso distractor) SIEMPRE la acciona el adulto desde el Panel del '
      + 'Adulto y es reversible al instante. La app nunca interrumpe ni ajusta nada sola, y '
      + 'el veredicto clínico es siempre tuyo y de tu logopeda.',
    refDyslexia:
      'Batería de conciencia fonológica y acceso léxico. La validación por voz respeta el '
      + 'habla de cada variedad (en dominicano, el seseo o la ese aspirada NUNCA cuentan '
      + 'como error) y la Criba de Pseudopalabras corta en 5 ensayos con pausa de descarga.',

    savePrescription: 'Guardar Prescripción',
    savedPrescription: (n: number): string => `Prescripción guardada · ${n} terapias activas.`,
    saveHelper: 'La selección se guarda en el dispositivo y la edición se bloquea de nuevo.',
    lockedHint: 'Modo Familia · solo el logopeda puede modificar la prescripción.',

    teaConsentTitle: 'Antes de empezar con TEA',
    teaConsentBreak: 'Quiebre Pragmático',
    teaConsentBody1: 'Este módulo incluye el ',
    teaConsentBody2:
      ': un ejercicio en el que TÚ congelas la app a propósito (una orden absurda o un '
      + 'silencio) para observar cómo tu peque repara la comunicación. Puede generarle una '
      + 'frustración breve y controlada — es el objetivo terapéutico, pautado por vuestro logopeda.',
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
      ['Osezno', 'Oso Curioso', 'Oso Valiente', 'Oso Explorador', 'Oso Sabio', 'Gran Oso', 'Oso Legendario'][i]
      ?? 'Oso Legendario',
  },

  auth: {
    title: 'Acceso profesional',
    subtitleSignup: 'Crea tu cuenta para guardar tus pacientes y sesiones en la nube.',
    subtitleSignin: 'Inicia sesión para acceder a tus pacientes y sesiones.',
    name: 'Nombre',
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

  settings: {
    uiLangTitle: 'Idioma de la aplicación',
    // El adulto necesita entender que son dos cosas distintas, o va a pensar
    // que el selector está roto cuando cambie uno y no cambie el otro.
    uiLangHint:
      'Cambia los menús y textos que lees tú. El idioma de los ejercicios del '
      + 'niño se elige aparte, en «Voz de la app».',
    uiLangAuto: 'Automático',
    uiLangAutoHint: 'Sigue al idioma de los ejercicios.',
    uiLangEs: 'Español',
    uiLangEn: 'English',
  },
};

// Tipo que debe cumplir CUALQUIER catálogo, derivado del castellano. Sin
// `as const` a propósito: los literales ensanchan a `string`, porque el inglés
// no dice lo mismo, dice lo equivalente. Lo que sí se hereda —y es el punto—
// son las CLAVES y las FIRMAS de las funciones.
export type UiStrings = typeof ES;
