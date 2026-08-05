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
