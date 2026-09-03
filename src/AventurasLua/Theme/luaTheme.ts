// ============================================================================
// Aventuras con Lúa · Lúa y las Palabras — Tokens de Diseño Médico Cálido
// Directrices clínicas: react-expo-medical-uiux-expert
// Paleta empática, sin frialdad hospitalaria ni estrés.
//
// NOTA: aquí decía «accesible (WCAG AAA)». Nadie ha medido un solo contraste,
// y el verificador del módulo llegó a IMPRIMIR «WCAG AAA validado» comprobando
// únicamente que el color primario fuera la cadena '#0D7685'. Afirmar una
// comprobación que no se ha hecho es lo que prohíbe la regla 0. Cuando alguien
// calcule los ratios de verdad, que lo diga aquí y lo compruebe un gate.
// ============================================================================

export const LUA_COLORS = {
  // Primario: Teal Terapéutico y Sereno (equilibrio clínico, calma y estabilidad)
  primary: '#0D7685',
  primaryLight: '#E6F4F6',
  primaryMid: '#149AA8',
  primaryDark: '#08535D',

  // Acento 1: Ámbar Sol (atención cálida, motivación y luz)
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  amberDark: '#B45309',

  // Acento 2: Coral Melocotón (afectividad, calidez y celebración)
  coral: '#FB7185',
  coralLight: '#FFF1F2',
  coralDark: '#E11D48',

  // Acento 3: Menta Esperanza (aciertos, avance y fluidez)
  mint: '#10B981',
  mintLight: '#ECFDF5',
  mintDark: '#047857',

  // Fondos y Superficies (Cero deslumbramiento en tabletas)
  background: '#FBF9F5', // Hueso suave orgánico
  surface: '#FFFFFF',
  surfaceSubtle: '#F4F1EA',
  surfaceElevated: '#FFFFFF',

  // Textos sobre fondo claro (ratios sin medir, ver nota de cabecera)
  textPrimary: '#1E293B',   // Pizarra profunda de alta legibilidad
  textSecondary: '#475569', // Neutro suave para explicaciones
  textMuted: '#64748B',     // Guías clínicas secundarias
  textOnPrimary: '#FFFFFF', // Blanco puro

  // Bordes y Delimitadores Táctiles
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  borderFocus: '#0D7685',
  divider: '#EDE8DF',

  // Feedback Emocional Clínico (Cero-Castigo)
  feedbackSuccess: '#10B981',
  feedbackHint: '#F59E0B',
  feedbackExplore: '#3B82F6',
} as const;

export const LUA_TYPOGRAPHY = {
  fontFamilyTitle: 'System',
  fontFamilyBody: 'System',

  sizes: {
    hero: 32,
    titleLg: 26,
    titleMd: 20,
    subtitle: 17,
    bodyLg: 16,
    bodyMd: 14,
    caption: 12,
    badge: 11,
  },

  lineHeights: {
    hero: 38,
    titleLg: 32,
    titleMd: 26,
    subtitle: 23,
    bodyLg: 24,
    bodyMd: 20,
    caption: 16,
    badge: 14,
  },

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
} as const;

export const LUA_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const LUA_RADII = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  full: 9999,
} as const;

export const LUA_SHADOWS = {
  card: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: '#0D7685',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modal: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const LUA_TOUCH_TARGET = {
  minSize: 56, // Ergonomía táctil para manos infantiles y motricidad en desarrollo
  largeButtonHeight: 60,
  cardMinHeight: 90,
} as const;
