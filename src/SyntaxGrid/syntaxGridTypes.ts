// ============================================================================
// Valeria+ · Cuadrícula Sintáctica de Comunicación Aumentativa y Alternativa (CAA)
// Tipos fundamentales para secuenciación sintáctica basada en Claves de Fitzgerald
// ============================================================================
import type { Locale } from '../valeriaLocale';

/** Roles sintácticos fijos de la cuadrícula de 3 ranuras */
export type GrammaticalRole = 'subject' | 'action' | 'object';

/** Elemento léxico-pictográfico para una ranura */
export interface SyntaxItem {
  id: string;
  role: GrammaticalRole;
  label: string;
  emoji: string;
  pictogramKey?: string; // Clave válida en PICTO_KEYS
  tprAction?: string;    // Acción física TPR del niño / cuidador
  ttsText?: string;      // Texto fonético para voz sintetizada
}

/** Estado de una ranura de la cuadrícula */
export interface SyntaxSlotState {
  role: GrammaticalRole;
  item: SyntaxItem | null;
  color: string;
  labelPlaceholder: string;
}

/** Estructura de vocabulario disponible por variedad */
export interface SyntaxVocabularyBank {
  locale: Locale;
  subjects: SyntaxItem[];
  actions: SyntaxItem[];
  objects: SyntaxItem[];
}
