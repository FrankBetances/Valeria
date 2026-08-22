// ============================================================================
// Valeria+ · Integración Sensorial Auditiva — Tipos de dominio (SaMD Clase I)
// Protocolo multimodal de desensibilización sistemática, contracondicionamiento
// y anticipación visual estructurada para sobre-responsividad sensorial (SOR).
// ============================================================================
import { Locale } from '../valeriaLocale';

export type SensoryTriggerId =
  | 'vacuum'              // Aspiradora
  | 'blender'             // Licuadora
  | 'hairdryer'           // Secador de pelo
  | 'hand_dryer'          // Secador de manos
  | 'thunder'             // Tormenta / Trueno
  | 'siren'               // Sirena de emergencia
  | 'fireworks'           // Pirotecnia
  | 'school_bell'         // Timbre escolar
  | 'classroom_ambience'  // Aula de colegio: murmullo, sillas y eco de clase
  | 'mall_ambience'       // Centro comercial: carritos, megafonía y bullicio
  | 'street_ambience';    // Calle urbana: tráfico, coches, obreros y ambiente vivo

export type SensoryCategory = 'appliance' | 'nature' | 'alert' | 'ecological';

export interface LocalizedString {
  es: string;
  gl: string;
  eu: string;
  'es-DO': string;
  'en-US': string;
}

export interface SensoryStimulus {
  id: SensoryTriggerId;
  category: SensoryCategory;
  label: LocalizedString;
  description?: LocalizedString;
  /** Clave del WAV en assets/audio/. La sintetiza scripts/generate-sensory-assets.js
   *  y scripts/check-sensory-assets.js comprueba que existe y suena a lo que dice. */
  audioAssetKey: string;
  /** Frecuencia dominante declarada. No es decorativa: el gate de assets
   *  comprueba que la energía del fichero cae donde dice esta ficha. */
  baseFrequencyHz?: number;
  calmStrategyTpr: LocalizedString;
}

export type SensoryCategoryFilter = 'all' | 'ecological' | 'appliance' | 'alert';

export interface AuditorySensoryExercise {
  id: string; // ej: 'ISA-01', 'ISA-02', etc.
  titleKey: string;
  descKey: string;
  iconName: 'sensory_ear' | 'noise_filter' | 'sensory_anticipation' | 'calm_breath';
  defaultDurationSec: number;
  isAvailable: boolean;
  /** Con qué llega configurado el muro adulto al abrir la actividad. Las seis
   *  comparten player, así que sin esto abrir ISA-03 y ISA-05 era idéntico.
   *  El adulto lo cambia todo desde la pantalla: esto solo es el punto de
   *  partida coherente con lo que la ficha de la actividad promete. */
  defaultConfig: {
    categoryFilter: SensoryCategoryFilter;
    triggerId: SensoryTriggerId;
    relativeIntensity: 1 | 2 | 3 | 4 | 5;
    durationTier: 'micro' | 'short' | 'medium';
    agencyMode: 'child_tap' | 'shared_tap' | 'adult_cue';
  };
}

// --- Máquina de Estados del Módulo Sensorial (Muro de Control Adulto) ---------
export type SensoryFlowState =
  | 'IDLE'
  | 'INTRO'
  | 'ADULT_PREPARATION'
  | 'ANTICIPATION'
  | 'EXPLORING'
  | 'PAUSED'
  | 'CLOSING'
  | 'COMPLETED'
  | 'ABANDONED';

// Estados de Lúa durante el ejercicio sensorial
export type SensoryLuaVisualState =
  | 'SENSORY_READY'         // Lúa disponible y serena
  | 'SENSORY_ANTICIPATION'  // Lúa atenta con cuenta atrás visual
  | 'SENSORY_EXPOSURE'      // Lúa estática y muda (cero distracción/sobrecarga)
  | 'SENSORY_PAUSE'         // Lúa calmada validando la pausa
  | 'SENSORY_CLOSE'         // Cierre sereno
  | 'SENSORY_REWARD';       // Celebración suave tras validación adulta

// Configuración previa obligatoria realizada por el adulto
export interface SensoryAdultConfig {
  triggerId: SensoryTriggerId;
  initialChildState: 'calm' | 'sensitive' | 'tired' | 'overwhelmed';
  relativeIntensity: 1 | 2 | 3 | 4 | 5; // 1=Muy suave, 5=Moderada (sin falsos dB)
  durationTier: 'micro' | 'short' | 'medium'; // micro: 3s, short: 7s, medium: 15s
  agencyMode: 'child_tap' | 'shared_tap' | 'adult_cue';
  stopCriterion: 'button' | 'gesture' | 'word' | 'picto';
}

// Valoración adulta al cerrar la sesión
export interface SensoryAdultRating {
  childResponse: 'calm_regulated' | 'attentive_curious' | 'sensitive_paused' | 'overwhelmed_stopped';
  tprApplied: boolean;
  notes?: string;
}

// Resultado de una sesión sensorial (guardado cifrado)
export interface SensorySessionRecord {
  id: string;
  exerciseId: string;
  triggerId: SensoryTriggerId;
  timestamp: number;
  durationSeconds: number;
  relativeIntensity: number;
  completedFully: boolean;
  pausedCount: number;
  earnedXp: number;
  adultRating?: SensoryAdultRating;
}

// Estado del silo sensorial persistido
export interface ValeriaSensoryState {
  version: number;
  xp: number;
  sessionsCount: number;
  completedActivities: Record<string, number>; // id actividad -> veces completada
  lastSessionAt: number;
  unlockedBadges: string[];
}
