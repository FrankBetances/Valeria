// ============================================================================
// Valeria+ · Rondas del Microjuego de Pesca/Arrastre con Lúa
// Mapeadas a pictogramas existentes en ValeriaPixelArt
// ============================================================================
import type { Locale } from '../../../valeriaLocale';
import type { DragFishingRound } from './dragFishingTypes';

const ROUNDS_ES: DragFishingRound[] = [
  {
    id: 'round_es_1',
    prompt: '¡Ayuda a Lúa a pescar la manzana!',
    targetStimulus: { label: 'Manzana', emoji: '🍎', pictogramKey: 'manzana' },
    options: [
      { id: 'opt_manzana', label: 'Manzana', emoji: '🍎', pictogramKey: 'manzana', isCorrect: true },
      { id: 'opt_pan', label: 'Pan', emoji: '🥖', pictogramKey: 'pan', isCorrect: false },
      { id: 'opt_casa', label: 'Casa', emoji: '🏠', pictogramKey: 'casa', isCorrect: false },
      { id: 'opt_taza', label: 'Taza', emoji: '☕', pictogramKey: 'taza', isCorrect: false },
    ],
  },
  {
    id: 'round_es_2',
    prompt: '¡Lúa busca el pez brillante!',
    targetStimulus: { label: 'Pez', emoji: '🐟', pictogramKey: 'pez' },
    options: [
      { id: 'opt_pez', label: 'Pez', emoji: '🐟', pictogramKey: 'pez', isCorrect: true },
      { id: 'opt_flor', label: 'Flor', emoji: '🌸', pictogramKey: 'flor', isCorrect: false },
      { id: 'opt_ola', label: 'Ola', emoji: '🌊', pictogramKey: 'ola', isCorrect: false },
      { id: 'opt_arbol', label: 'Árbol', emoji: '🌳', pictogramKey: 'arbol', isCorrect: false },
    ],
  },
  {
    id: 'round_es_3',
    prompt: '¡Lleva a Lúa hacia la flor aromática!',
    targetStimulus: { label: 'Flor', emoji: '🌸', pictogramKey: 'flor' },
    options: [
      { id: 'opt_flor', label: 'Flor', emoji: '🌸', pictogramKey: 'flor', isCorrect: true },
      { id: 'opt_semilla', label: 'Semilla', emoji: '🌱', pictogramKey: 'semilla', isCorrect: false },
      { id: 'opt_estrella', label: 'Estrella', emoji: '⭐', pictogramKey: 'estrella', isCorrect: false },
      { id: 'opt_pollito', label: 'Pollito', emoji: '🐥', pictogramKey: 'pollito', isCorrect: false },
    ],
  },
  {
    id: 'round_es_4',
    prompt: '¡Lúa quiere escuchar la tambora!',
    targetStimulus: { label: 'Tambora', emoji: '🪘', pictogramKey: 'tambora' },
    options: [
      { id: 'opt_tambora', label: 'Tambora', emoji: '🪘', pictogramKey: 'tambora', isCorrect: true },
      { id: 'opt_pandereta', label: 'Pandereta', emoji: '🪇', pictogramKey: 'pandereta', isCorrect: false },
      { id: 'opt_maracas', label: 'Maracas', emoji: '🪇', pictogramKey: 'maracas', isCorrect: false },
      { id: 'opt_barco', label: 'Barco', emoji: '⛵', pictogramKey: 'barco', isCorrect: false },
    ],
  },
  {
    id: 'round_es_5',
    prompt: '¡Lúa busca a su amigo el pollito!',
    targetStimulus: { label: 'Pollito', emoji: '🐥', pictogramKey: 'pollito' },
    options: [
      { id: 'opt_pollito', label: 'Pollito', emoji: '🐥', pictogramKey: 'pollito', isCorrect: true },
      { id: 'opt_gallina', label: 'Gallina', emoji: '🐔', pictogramKey: 'gallina', isCorrect: false },
      { id: 'opt_osito', label: 'Osito', emoji: '🧸', pictogramKey: 'osito-pequeno', isCorrect: false },
      { id: 'opt_cubo', label: 'Cubo', emoji: '🪣', pictogramKey: 'cubo', isCorrect: false },
    ],
  },
];

const ROUNDS_GL: DragFishingRound[] = [
  {
    id: 'round_gl_1',
    prompt: '¡Axuda a Lúa a pescar a mazá!',
    targetStimulus: { label: 'Mazá', emoji: '🍎', pictogramKey: 'manzana' },
    options: [
      { id: 'opt_maza', label: 'Mazá', emoji: '🍎', pictogramKey: 'manzana', isCorrect: true },
      { id: 'opt_pan', label: 'Pan', emoji: '🥖', pictogramKey: 'pan', isCorrect: false },
      { id: 'opt_casa', label: 'Casa', emoji: '🏠', pictogramKey: 'casa', isCorrect: false },
      { id: 'opt_cunca', label: 'Cunca', emoji: '☕', pictogramKey: 'taza', isCorrect: false },
    ],
  },
  {
    id: 'round_gl_2',
    prompt: '¡Lúa busca o peixe brillante!',
    targetStimulus: { label: 'Peixe', emoji: '🐟', pictogramKey: 'pez' },
    options: [
      { id: 'opt_peixe', label: 'Peixe', emoji: '🐟', pictogramKey: 'pez', isCorrect: true },
      { id: 'opt_flor', label: 'Flor', emoji: '🌸', pictogramKey: 'flor', isCorrect: false },
      { id: 'opt_onda', label: 'Onda', emoji: '🌊', pictogramKey: 'ola', isCorrect: false },
      { id: 'opt_arbo', label: 'Árbore', emoji: '🌳', pictogramKey: 'arbol', isCorrect: false },
    ],
  },
  {
    id: 'round_gl_3',
    prompt: '¡Leva a Lúa cara á flor!',
    targetStimulus: { label: 'Flor', emoji: '🌸', pictogramKey: 'flor' },
    options: [
      { id: 'opt_flor', label: 'Flor', emoji: '🌸', pictogramKey: 'flor', isCorrect: true },
      { id: 'opt_semente', label: 'Semente', emoji: '🌱', pictogramKey: 'semilla', isCorrect: false },
      { id: 'opt_estrela', label: 'Estrela', emoji: '⭐', pictogramKey: 'estrella', isCorrect: false },
      { id: 'opt_pitino', label: 'Pitiño', emoji: '🐥', pictogramKey: 'pollito', isCorrect: false },
    ],
  },
  {
    id: 'round_gl_4',
    prompt: '¡Lúa quere escoitar o tambor!',
    targetStimulus: { label: 'Tambor', emoji: '🪘', pictogramKey: 'tambora' },
    options: [
      { id: 'opt_tambor', label: 'Tambor', emoji: '🪘', pictogramKey: 'tambora', isCorrect: true },
      { id: 'opt_pandeireta', label: 'Pandeireta', emoji: '🪇', pictogramKey: 'pandereta', isCorrect: false },
      { id: 'opt_maracas', label: 'Maracas', emoji: '🪇', pictogramKey: 'maracas', isCorrect: false },
      { id: 'opt_barco', label: 'Barco', emoji: '⛵', pictogramKey: 'barco', isCorrect: false },
    ],
  },
  {
    id: 'round_gl_5',
    prompt: '¡Lúa busca ao seu amigo o pitiño!',
    targetStimulus: { label: 'Pitiño', emoji: '🐥', pictogramKey: 'pollito' },
    options: [
      { id: 'opt_pitino', label: 'Pitiño', emoji: '🐥', pictogramKey: 'pollito', isCorrect: true },
      { id: 'opt_gaina', label: 'Galiña', emoji: '🐔', pictogramKey: 'gallina', isCorrect: false },
      { id: 'opt_osino', label: 'Osiño', emoji: '🧸', pictogramKey: 'osito-pequeno', isCorrect: false },
      { id: 'opt_balde', label: 'Balde', emoji: '🪣', pictogramKey: 'cubo', isCorrect: false },
    ],
  },
];

export function getDragFishingRounds(locale: Locale): DragFishingRound[] {
  switch (locale) {
    case 'gl':
      return ROUNDS_GL;
    case 'es':
    case 'es-DO':
    case 'eu':
    case 'en-US':
    case 'ca':
    default:
      return ROUNDS_ES;
  }
}
