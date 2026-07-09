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
  paresMinimos: '@valeria_pares_minimos',      // Registro por ensayo de pares mínimos (dislalias)
};

// Marca / mascota: oso "Valeria" en blanco sobre turquesa. El componente
// reutilizable <BearMark /> y <AppIconTile /> viven en ./ValeriaBearLogo.tsx.

// Logo: usar el wordmark turquesa de Valeria. En cabeceras sobre fondo turquesa,
// emplear la versión en blanco a una altura consistente de 21px.
//   import logoWhite from '../../assets/valeria-logo-white.png';
//   <Image source={logoWhite} style={{ height: 21, resizeMode: 'contain' }} />
