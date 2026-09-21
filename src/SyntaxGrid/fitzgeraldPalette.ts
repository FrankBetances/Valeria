// ============================================================================
// Valeria+ · Paleta Fitzgerald Modificada para CAA Pediátrica
// Implementación propietaria sin dependencias externas (Cero código GPL)
// ============================================================================
import type { GrammaticalRole } from './syntaxGridTypes';

export interface RoleColorTheme {
  primary: string;
  bgLight: string;
  border: string;
  text: string;
}

export const FITZGERALD_THEMES: Record<GrammaticalRole, RoleColorTheme> = {
  subject: {
    primary: '#FBC02D',   // Amarillo cálido (Pronombres / Sujetos)
    bgLight: '#FFFDE7',
    border: '#F57F17',
    text: '#5D4037',
  },
  action: {
    primary: '#4CAF50',   // Verde fresco (Verbos / Acciones)
    bgLight: '#E8F5E9',
    border: '#2E7D32',
    text: '#1B5E20',
  },
  object: {
    primary: '#FF9800',   // Naranja vibrante (Sustantivos / Objetos)
    bgLight: '#FFF3E0',
    border: '#E65100',
    text: '#BF360C',
  },
};

export function getRoleTheme(role: GrammaticalRole): RoleColorTheme {
  return FITZGERALD_THEMES[role];
}
