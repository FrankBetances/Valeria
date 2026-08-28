// ============================================================================
// Valeria+ · Puente del módulo de Realidad Aumentada (bloque 7)
// Única superficie que el resto de la app ve del host nativo de cámara +
// escena 3D. Dos llamadas de trabajo (lanzar un ejercicio, correr la Prueba de
// Aptitud) y una sonda de disponibilidad; nada más.
//
// ── Degradación elegante (idioma de la casa) ───────────────────────────────
// El módulo nativo se carga con require() dentro de try, igual que valeriaNoise
// con expo-audio. Si no existe —Expo Go, build sin el config plugin, plataforma
// sin implementación, dispositivo sin cámara frontal— isArAvailable() devuelve
// false y la tarjeta del hub NO se renderiza. Nadie ve una pantalla rota.
//
// ── Neutralidad de plataforma (§13.4 del plan) ─────────────────────────────
// Esta API no menciona Android en ninguna parte. isArAvailable() SONDEA el
// módulo; no pregunta por Platform.OS. El día que exista el host de iOS
// (AVCaptureSession + MediaPipeTasksVision + RealityKit) entra por aquí sin
// tocar una línea de JS. Por el mismo motivo las señales viajan en vocabulario
// ARKit-compatible (52 blendshapes + matriz 4×4), no en tipos de MediaPipe.
//
// ── Muro MDR (innegociable) ────────────────────────────────────────────────
// Los umbrales viajan HACIA el nativo desde el Panel del Adulto y son
// constantes dentro de la sesión. El nativo mide y devuelve magnitudes físicas
// (grados, milisegundos, ratios); jamás un veredicto, un percentil ni un
// umbral reajustado. Cualquier PR que añada aquí puntuación automática,
// comparación normativa o dificultad adaptativa cambia la clase regulatoria
// del producto (I → IIa) y debe rechazarse en revisión.
//
// ── Frontera de datos ──────────────────────────────────────────────────────
// El nativo NO escribe en AsyncStorage ni en Firestore: devuelve un
// ArSessionResult y es el JS quien lo enruta por valeriaTelemetry, igual que
// hace hoy el player. Una sola fuente de verdad para los datos del piloto.
// ============================================================================

// ---------------------------------------------------------------------------
// Vocabulario compartido con el host nativo
// ---------------------------------------------------------------------------

export type ArExerciseId = 'ar1' | 'ar2' | 'ar3' | 'ar4' | 'ar5' | 'ar6';

/** Fuente del puntero de AR-3. La elige el adulto; el ejercicio no sabe cuál corre. */
export type ArPointerSource = 'iris' | 'noseRay';

/** Nivel de aptitud del dispositivo (§3.5 del plan). D = el bloque no se ofrece. */
export type ArAptitudeLevel = 'A' | 'B' | 'C' | 'D';

/** Base de reloj de las marcas de tiempo de cámara. Decide si AR-2 mide o solo juega. */
export type ArTimestampSource = 'realtime' | 'unknown';

/** Transductor VIVO en el ensayo. Bluetooth está vetado: nunca aparece como válido. */
export type ArTransducer = 'externalSpeakers' | 'wiredHeadphones' | 'deviceSpeaker' | 'unknown';

/** Modo efectivo del ensayo: 'instrument' registra latencia; 'game' la deja en null. */
export type ArTrialMode = 'instrument' | 'game';

/**
 * Umbrales clínicos. Los fija el adulto en el Panel y son CONSTANTES dentro de
 * la sesión: viajan en cada registro para que el dato sea interpretable después.
 */
export interface ArThresholds {
  /** AR-1 · sostén exigido del redondeo labial, en ms (800-3000). */
  holdMs: number;
  /** AR-2 · giro cefálico mínimo para contar como orientación, en grados. */
  turnDeg: number;
  /** AR-2 · ventana de respuesta tras el estímulo, en ms. */
  responseWindowMs: number;
  /** AR-3 · fijación sostenida para seleccionar una diana, en ms. */
  dwellMs: number;
  /** AR-3 · fuente de puntero elegida por el adulto. */
  pointerSource: ArPointerSource;
}

export interface ArExerciseConfig {
  exerciseId: ArExerciseId;
  /** Clave opaca del paciente para recuperar su calibración. NUNCA un nombre. */
  patientKey: string;
  thresholds: ArThresholds;
  trials: number;
}

/**
 * Sondas de la Prueba de Aptitud. Se miden UNA vez por dispositivo (y se
 * repiten si cambia el aparato o la versión del sistema); viajan selladas con
 * la sesión para que el hardware pase de confundido a covariable.
 */
export interface ArDeviceProbes {
  /** fps en el percentil 5 de un run sostenido, con la escena 3D ya montada. */
  fpsP5: number;
  /** Pendiente térmica: fps al final / fps al principio. < 0,7 es caída seria. */
  thermalSlope: number;
  /** Estado térmico alcanzado durante la sonda (PowerManager). */
  thermalStatus: number;
  timestampSource: ArTimestampSource;
  /** Desfase medido entre la base boottime de cámara y la monotonic de audio. */
  clockOffsetUs: number | null;
  /** Dispersión de AudioTrack.getTimestamp() sobre 20 disparos, en ms. */
  audioJitterMs: number | null;
  /** Diferencia entre canales medida con el micrófono, en dB. Corta si > 1,5. */
  channelBalanceDb: number | null;
  /** RMS del puntero durante la calibración de 5 puntos, en grados. */
  pointerRmsDeg: number;
  imuAvailable: boolean;
  screenWidthMm: number;
  screenHeightMm: number;
  /** Separación angular alcanzable entre 3 dianas a la distancia estimada. */
  achievableSeparationDeg: number;
}

export interface ArDeviceProfile {
  level: ArAptitudeLevel;
  probes: ArDeviceProbes;
  manufacturer: string;
  model: string;
  osVersion: string;
  /** Motor de señal facial. Viaja siempre: si algún día conviven dos, es covariable. */
  signalEngine: 'mediapipe' | 'arkit';
  platform: string;
  measuredAt: number;
}

/** Campos comunes a todo ensayo de AR, sea del ejercicio que sea. */
export interface ArTrialBase {
  exerciseId: ArExerciseId;
  /** Índice del ensayo dentro de la sesión, empezando en 1. */
  index: number;
  at: number;
  /** Estado térmico en el instante del ensayo: permite descartar los degradados. */
  thermalStatus: number;
  /** Separación angular REALMENTE conseguida, derivada de la distancia estimada. */
  angularSeparationDeg: number | null;
  mode: ArTrialMode;
  /** Un ensayo anulado (móvil movido, cara perdida) es barato; uno contaminado, no. */
  voided: boolean;
  voidReason: string | null;
}

export interface Ar1Trial extends ArTrialBase {
  exerciseId: 'ar1';
  holdMaxMs: number;
  holdTotalMs: number;
  puckerPeak: number;
  apertureRatioPeak: number;
  symmetryWorst: number;
  framesValid: number;
  framesTotal: number;
  attemptsToFire: number;
}

export interface Ar2Trial extends ArTrialBase {
  exerciseId: 'ar2';
  side: 'left' | 'right';
  isCatch: boolean;
  transducer: ArTransducer;
  /** Nivel de presentación en dB SPL medido en la posición de la cabeza. */
  gainDbSpl: number | null;
  tStimulusUs: number | null;
  tTurnUs: number | null;
  /** null cuando el montaje o el reloj no permiten medir: ausente y etiquetado. */
  latencyMs: number | null;
  latencyNullReason: string | null;
  peakYawDeg: number;
  correctSide: boolean;
  timedOut: boolean;
  deviceLatencyUncertaintyMs: number | null;
}

export interface Ar3Trial extends ArTrialBase {
  exerciseId: 'ar3';
  targetId: string;
  targetCount: 2 | 3;
  firstFixationId: string | null;
  tFirstFixationMs: number | null;
  selectedId: string | null;
  dwellMs: number;
  revisits: number;
  pointerSource: ArPointerSource;
  calibrationRmsPx: number;
  outOfBoundsMs: number;
}

export interface Ar4Trial extends ArTrialBase {
  exerciseId: 'ar4';
  targetQuadrant: string;
  targetYawDeg: number;
  targetPitchDeg: number;
  acquisitionTimeMs: number;
  fovealDwellMs: number;
  yawRmsDeg: number;
  success: boolean;
}

export interface Ar5Trial extends ArTrialBase {
  exerciseId: 'ar5';
  /** Velocidad real del deslizamiento, del VelocityTracker de Compose. */
  throwVelocityPxPerS: number;
  /** Desviación de puntería en grados respecto a la recta dedo→Lúa. */
  throwAngleDeg: number;
  targetDistanceMm: number;
  /** Latencia de iniciación: del arranque del ensayo al dedo levantado. */
  timeToThrowMs: number;
  hit: boolean;
}

export interface Ar6Trial extends ArTrialBase {
  exerciseId: 'ar6';
  targetExpression: string;
  blendshapePeak: number;
  holdMs: number;
  symmetryRatio: number;
  mimicSuccess: boolean;
}

export type ArTrial = Ar1Trial | Ar2Trial | Ar3Trial | Ar4Trial | Ar5Trial | Ar6Trial;

export interface ArSessionResult {
  exerciseId: ArExerciseId;
  /**
   * 'completed' | 'aborted' (el adulto cerró) | 'denied' (permiso de cámara) |
   * 'timeout' (el nativo cerró la sesión solo).
   *
   * 'timeout' llega cuando el host no vio la cara del niño durante un minuto
   * seguido, o cuando la sesión rebasó su techo de duración. Los tres ejercicios
   * solo avanzan con la cara dentro del encuadre, así que sin ella no hay nada
   * que medir: cerrar con un resultado —aunque venga con cero ensayos— es lo
   * honesto, y evita dejar la cámara abierta esperando a alguien que no está.
   * Los ensayos que se hubieran completado antes viajan igual.
   */
  outcome: 'completed' | 'aborted' | 'denied' | 'timeout';
  startedAt: number;
  endedAt: number;
  /** Umbrales realmente vigentes, tal cual los aplicó el nativo. */
  thresholds: ArThresholds;
  /** Constante dentro de la sesión: se guarda una vez, no por ensayo. */
  deviceProfile: ArDeviceProfile;
  trials: ArTrial[];
}

// ---------------------------------------------------------------------------
// Carga perezosa del host nativo
// ---------------------------------------------------------------------------

interface ArNativeModule {
  isSupported: () => boolean;
  runAptitudeTest: () => Promise<ArDeviceProfile>;
  launch: (cfg: ArExerciseConfig) => Promise<ArSessionResult>;
  calibrate: (patientKey: string, pointerSource: ArPointerSource) => Promise<{ rmsPx: number; rmsDeg: number }>;
  hasCalibration: (patientKey: string) => Promise<boolean>;
  openDiagnostics: () => Promise<unknown>;
}

let Native: ArNativeModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { NativeModules } = require('react-native');
  const mod = NativeModules?.ValeriaAr;
  // La sonda es de FORMA, no de plataforma: cualquier host que cumpla el
  // contrato entra, venga de Kotlin, de Swift o de un doble de pruebas.
  Native = mod && typeof mod.launch === 'function' && typeof mod.isSupported === 'function'
    ? (mod as ArNativeModule)
    : null;
} catch (e) {
  Native = null;
}

/**
 * ¿Hay host de RA utilizable en este dispositivo? Sondea el módulo nativo, que
 * a su vez comprueba cámara frontal, delegado de inferencia y modelo cargable.
 * Nunca lanza: en el peor caso devuelve false y el bloque simplemente no existe.
 */
export function isArAvailable(): boolean {
  if (!Native) return false;
  try {
    return Native.isSupported() === true;
  } catch (e) {
    return false;
  }
}

/**
 * Prueba de Aptitud del Dispositivo (§3.5): 60-90 s de sondas presentadas al
 * niño como un juego de calentamiento. Es el sustituto de conocer el modelo de
 * teléfono en un despliegue BYOD: si no se puede saber qué hardware habrá, se
 * mide el que haya.
 */
export async function runAptitudeTest(): Promise<ArDeviceProfile | null> {
  if (!Native) return null;
  try {
    return await Native.runAptitudeTest();
  } catch (e) {
    return null;
  }
}

/**
 * Calibración de 5 puntos de AR-3 (por paciente y por dispositivo). Un rayo
 * facial sin calibrar no apunta a nada, así que esto no es opcional.
 */
export async function calibrateAr(
  patientKey: string,
  pointerSource: ArPointerSource,
): Promise<{ rmsPx: number; rmsDeg: number } | null> {
  if (!Native) return null;
  try {
    return await Native.calibrate(patientKey, pointerSource);
  } catch (e) {
    return null;
  }
}

export async function hasArCalibration(patientKey: string): Promise<boolean> {
  if (!Native) return false;
  try {
    return await Native.hasCalibration(patientKey);
  } catch (e) {
    return false;
  }
}

/**
 * Pantalla de señales en vivo. Es una herramienta de la LOGOPEDA, no del niño:
 * no hay refuerzo, no se registra nada y no produce ensayos. Sirve para colocar
 * el teléfono con criterio —distancia, separación angular, cono de pose— y para
 * ver qué mide cada ejercicio. Quien no puede ver la señal tampoco puede
 * defender el dato que sale de ella.
 */
export async function openArDiagnostics(): Promise<boolean> {
  if (!Native || typeof Native.openDiagnostics !== 'function') return false;
  try {
    await Native.openDiagnostics();
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Abre el host nativo a pantalla completa y resuelve cuando la sesión termina.
 * Devuelve null si no hay host: quien llama decide qué contar al adulto, pero
 * nunca se queda con una promesa colgada ni con una excepción sin dueño.
 */
export async function launchAr(cfg: ArExerciseConfig): Promise<ArSessionResult | null> {
  if (!Native) return null;
  try {
    return await Native.launch(cfg);
  } catch (e) {
    return null;
  }
}
