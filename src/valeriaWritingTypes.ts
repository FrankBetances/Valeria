// ============================================================================
// Valeria+ · Geometría de la Pizarra Mágica · MÓDULO PURO
//
// Vive aparte del lienzo por la misma razón que `i18n/catalog.ts` vive aparte
// de `i18n/index.ts`: el banco de trazos entra en el corpus de voz, y el
// exportador del corpus compila sus módulos con tsc y los ejecuta en Node. Si
// el banco tirase del .tsx del lienzo arrastraría react-native y el gate
// `check-voice-corpus-coverage` reventaría con «Cannot find module».
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

/** Punto de control numerado del modelo: fija el ORDEN del trazo (anti-inversión). */
export interface Waypoint {
  id: number;
  x: number;
  y: number;
  label?: string;
  order: number;
}

/** Modelo de trazo: la silueta que se sigue y sus puntos de control. */
export interface ModelPathGuide {
  id: string;
  label: string;
  svgPath: string;
  waypoints: Waypoint[];
  soundCue?: string;
}
