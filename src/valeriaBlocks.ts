// ============================================================================
// Valeria+ · Registro de bloques prescribibles (v11)
//
// Fuente única de la correspondencia bloque → metadatos, clave de persistencia
// y par de color de acento. Hasta la v10.2 esta relación vivía dispersa en
// cadenas de ternarios dentro de ValeriaExerciseSelectionScreen:
//
//   const list = tab === 'audicion' ? EXERCISES_AUD : tab === 'lenguaje' ? ...
//   const active = tab === 'audicion' ? activeAud : tab === 'lenguaje' ? ...
//
// Con el hub y la lista ya separados en dos pantallas, esos ternarios habría
// que duplicarlos en ambas. Un registro los sustituye por un acceso por clave.
//
// IMPORTANTE: las claves de AsyncStorage NO cambian. Son las mismas de
// STORAGE_KEYS de siempre, así que una app que actualice a la v11 lee la
// prescripción que el logopeda ya había guardado, sin migración de datos.
// ============================================================================
import { STORAGE_KEYS } from './valeriaTheme';
import {
  ExerciseMeta, AUDICION_META, LENGUAJE_META, TEA_META, DISLEXIA_META,
} from './valeriaExerciseMeta';

/** Bloques con lista prescribible. Pares Mínimos, Expansión y RA no están: su
 *  contenido no se prescribe desde esta pantalla. */
export type BlockKey = 'audicion' | 'lenguaje' | 'tea' | 'dislexia';

export interface BlockDef {
  key: BlockKey;
  meta: ExerciseMeta[];
  /** Clave de AsyncStorage. Idéntica a la de la v10.2: sin migración. */
  storageKey: string;
  icon: string;
  accentBg: string;
  accentFg: string;
  /** Solo Audición secciona la lista por bandas de edad. */
  byAge: boolean;
}

export const BLOCKS: Record<BlockKey, BlockDef> = {
  audicion: {
    key: 'audicion', meta: AUDICION_META, storageKey: STORAGE_KEYS.audicion,
    icon: '👂', accentBg: '#e0edff', accentFg: '#3b6fd4', byAge: true,
  },
  lenguaje: {
    key: 'lenguaje', meta: LENGUAJE_META, storageKey: STORAGE_KEYS.lenguaje,
    icon: '💬', accentBg: '#fff1dc', accentFg: '#d98a1f', byAge: false,
  },
  tea: {
    key: 'tea', meta: TEA_META, storageKey: STORAGE_KEYS.tea,
    icon: '🧠', accentBg: '#fdeef2', accentFg: '#c2477e', byAge: false,
  },
  dislexia: {
    key: 'dislexia', meta: DISLEXIA_META, storageKey: STORAGE_KEYS.dislexia,
    icon: '📖', accentBg: '#f3e8fd', accentFg: '#8b5cf6', byAge: false,
  },
};

/** Orden de aparición en el hub. */
export const BLOCK_ORDER: BlockKey[] = ['audicion', 'lenguaje', 'tea', 'dislexia'];
