// ============================================================================
// Valeria+ · Tokens de diseño unificados (V3.0)
// Fuente única de verdad para color, radios y tipografía en todas las pantallas.
// Importar en cada screen: import { V } from './valeriaTheme';
// ============================================================================

export const V = {
  color: {
    primary: '#00c4be',       // Turquesa marca Valeria
    primaryDark: '#00a39e',   // Hover / activos
    primaryLight: '#e6f9f8',  // Fondo destacado
    primaryTint: '#f0fdf9',   // Fondo muy suave (instrucciones)
    pageBg: '#f6fafa',        // Fondo de página
    card: '#ffffff',
    border: '#e9eeee',
    borderActive: '#cdeeec',
    textPrimary: '#1f2937',
    textSecondary: '#4b5563',
    textMuted: '#9aa6a5',
    error: '#ef4444',
    errorBg: '#fff1f2',
    success: '#10b981',
    successBg: '#eafaf2',
    star: '#facc15',
    dark: '#0b1220',
  },
  radius: {
    card: 16,
    field: 12,
    button: 14,
    pill: 14,
  },
  // Tipografía redondeada y amigable. En la app, registrar la familia "Nunito"
  // (Nunito-Regular/SemiBold/Bold/ExtraBold) o usar la de sistema con estos pesos.
  font: {
    family: 'Nunito',
    regular: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  // --------------------------------------------------------------------------
  // [v11] Escala de espaciado y de tipografía. ADITIVO: ninguna clave anterior
  // cambia de valor, para que las pantallas actuales sigan pintando idénticas.
  // Las pantallas v11 usan SOLO estas escalas; las clásicas conservan sus
  // valores sueltos (11, 13, 15, 18…) hasta que se retiren.
  // --------------------------------------------------------------------------

  // Múltiplos de 4. El hub actual mezcla 11/13/15/18 px sin sistema: esa es
  // parte de la sensación de "amontonado" que reportaron los testers.
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },

  // Cinco tamaños con su interlineado. Los PESOS no se duplican aquí: siguen
  // siendo los de `V.font` (regular/semibold/bold/extrabold), que ya existían.
  type: {
    caption: { fontSize: 11, lineHeight: 14 },
    body: { fontSize: 13, lineHeight: 18 },
    title: { fontSize: 15, lineHeight: 20 },
    heading: { fontSize: 20, lineHeight: 26 },
    display: { fontSize: 24, lineHeight: 30 },
  },

  // Área táctil mínima accesible: 48 dp Android / 44 pt iOS. Se toma el mayor
  // de los dos como un único número seguro en ambas plataformas.
  touchMin: 48,

  shadow: {
    card: {
      shadowColor: 'rgba(15, 23, 42, 0.08)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 2,
    },
    button: {
      shadowColor: 'rgba(0, 196, 190, 0.32)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 18,
      elevation: 4,
    },
  },
};

// Claves de almacenamiento cifrado (AsyncStorage / EncryptedStorage)
export const STORAGE_KEYS = {
  registro: '@valeria_paciente',               // Ficha del paciente ACTIVO (seleccionado)
  pacientes: '@valeria_pacientes',             // [V3] Lista multi-paciente del dispositivo
  audicion: '@valeria_prescripcion_ejercicios',
  lenguaje: '@valeria_prescripcion_lenguaje',
  historial: '@valeria_historial_completo',    // Historial de sesiones (escribe Player, lee el panel de resultados)
  ling: '@valeria_ling',                       // Historial del Test de Ling (6 sonidos)
  juego: '@valeria_juego',                     // Gamificación: XP, racha diaria, nivel y logros
  recordatorios: '@valeria_recordatorios',     // Preferencia de recordatorios diarios (on/off)
  recordatoriosFranjas: '@valeria_recordatorios_franjas', // GEN-01: qué franjas quiere el usuario (ausente = las cuatro)
  paresMinimos: '@valeria_pares_minimos',      // Registro por ensayo de pares mínimos (dislalias)
  expansionSemantica: '@valeria_expansion_semantica', // Registro por sesión de expansión semántica / progresión léxica
  paresPrescripcion: '@valeria_prescripcion_pares',   // Prescripción del logopeda: { [pairId]: boolean } (ausente = activo)
  expansionPrescripcion: '@valeria_prescripcion_expansion', // Prescripción del logopeda: { [id]: boolean } (ausente = activo)
  expansionNivelMax: '@valeria_expansion_nivel_max', // ES-08: tope de dificultad de las categorías léxicas
  tea: '@valeria_prescripcion_tea',            // Prescripción del módulo TEA (boolean[])
  dislexia: '@valeria_prescripcion_dislexia',  // Prescripción del módulo Dislexia (boolean[])
  teaConsent: '@valeria_tea_consentimiento',   // Consentimiento informado del Quiebre Pragmático (Modo Familia)
  academy: '@valeria_academy',                 // Valeria Academy: progreso de cápsulas de conocimiento (cifrado con valeriaCrypto)
  sensory: '@valeria_sensory',                 // Integración Sensorial: progreso de silo (cifrado)
  sensorySessions: '@valeria_sensory_sessions', // Registro de sesiones de desensibilización sensorial
  autoRecord: '@valeria_grabacion_automatica',  // PM-04/ES-03: 'on' arranca el micro solo tras la consigna; por defecto MANUAL (botón)
  arUmbrales: '@valeria_ar_umbrales',          // RA: umbrales clínicos fijados por el adulto (sostén, giro, ventana, dwell, puntero)
  arConsentimiento: '@valeria_ar_consentimiento', // RA: consentimiento informado de cámara, con sufijo POR PACIENTE
  arPerfilDispositivo: '@valeria_ar_perfil_dispositivo', // RA: DeviceProfile de la Prueba de Aptitud + huella del aparato
  asrOfertaLocal: '@valeria_asr_oferta_local', // ASR §3.3: variedades a las que el adulto ya declinó la descarga del paquete local (sufijo por variedad)
};

// Marca / mascota: la gata Lúa en píxel art. El componente reutilizable
// <CatPixel /> vive en ./ValeriaCatPixel.tsx (rejilla de caracteres, sin PNG).

// Logo: usar el wordmark turquesa de Valeria. En cabeceras sobre fondo turquesa,
// emplear la versión en blanco a una altura consistente de 21px.
//   import logoWhite from '../../assets/valeria-logo-white.png';
//   <Image source={logoWhite} style={{ height: 21, resizeMode: 'contain' }} />
