// ============================================================================
// Valeria+ · Rutas de Rutina — TPR 2.0 (Fase 1.2) · Morfosintaxis transaccional
// Evolución de las cápsulas TPR: la app deja de pedir gestos sueltos y emite
// órdenes morfosintácticamente densas (objeto + atributo + lugar/destinatario)
// ancladas en rutinas reales del hogar (baño, comedor).
//
// Mecánica transaccional: el NIÑO NO TOCA LA PANTALLA. La app dicta la orden
// (prosodia clínica continua), el niño la ejecuta con objetos reales y el
// CUIDADOR valida en un panel binario (lo hizo / no esta vez). La dificultad
// no se adapta sola: el adulto decide si repite, salta o continúa (muro MDR).
// ============================================================================

export interface RouteCommand {
  emoji: string;
  text: string;      // orden transaccional completa (se dicta con speakClinical)
  focus: string;     // estructura trabajada, visible para el adulto
}

export interface RoutineRoute {
  id: 'comedor' | 'bano';
  icon: string;
  title: string;
  scene: string;     // dónde colocarse antes de empezar
  commands: RouteCommand[];
}

export const ROUTINE_ROUTES: RoutineRoute[] = [
  {
    id: 'comedor', icon: '🍽️', title: 'Ruta del Comedor',
    scene: 'Id juntos a la mesa del comedor con vasos, cucharas y servilletas a mano.',
    commands: [
      { emoji: '🥤', text: 'Pon el vaso rojo en la silla.', focus: 'objeto + color + lugar' },
      { emoji: '🥄', text: 'Dale la cuchara pequeña a papá o a mamá.', focus: 'objeto + tamaño + destinatario' },
      { emoji: '🧻', text: 'Mete la servilleta debajo del plato.', focus: 'objeto + preposición locativa' },
      { emoji: '🍎', text: 'Coge la fruta más grande y ponla encima de la mesa.', focus: 'comparativo + secuencia de dos pasos' },
    ],
  },
  {
    id: 'bano', icon: '🛁', title: 'Ruta del Baño',
    scene: 'Id juntos al baño con el cepillo, la toalla y un vaso a la vista.',
    commands: [
      { emoji: '🪥', text: 'Pon el cepillo azul dentro del vaso.', focus: 'objeto + color + contenedor' },
      { emoji: '🧺', text: 'Trae la toalla pequeña y déjala en la silla.', focus: 'objeto + tamaño + secuencia de dos pasos' },
      { emoji: '🦆', text: 'Mete el patito en la bañera vacía.', focus: 'objeto + atributo del lugar' },
      { emoji: '🧼', text: 'Dale el jabón a papá o a mamá con la otra mano.', focus: 'destinatario + lateralidad' },
    ],
  },
];

export const pickRoutineRoute = (): RoutineRoute =>
  ROUTINE_ROUTES[Math.floor(Math.random() * ROUTINE_ROUTES.length)];
