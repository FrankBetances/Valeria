// ============================================================================
// Valeria+ · Ancla Visual Lejana · el reloj de las 20-20-20
//
// Acumula tiempo de terapia ACTIVA y, pasados 20 minutos seguidos, levanta una
// bandera. Eso es todo lo que hace. Lo que NO hace es igual de importante y es
// lo que lo mantiene en Clase I:
//
//   · No bloquea, no interrumpe y no pausa nada. Sube `isVisualBreakRecommended`
//     y se calla. La tarjeta la lee el adulto y la pausa la ejecuta el adulto:
//     la app sugiere, el adulto manda.
//   · No persiste. Ni AsyncStorage, ni telemetría, ni un id de paciente cerca.
//     El contador vive en memoria y muere al cerrar la app: no hay dato que
//     exportar, que cifrar ni que declarar en Seguridad de los datos.
//
// Por qué no cuelga de `valeriaTelemetry`: aquello REGISTRA para el piloto y se
// escribe cifrado en disco. Esto solo mira un cronómetro para pintar una
// tarjeta. Mezclarlos habría metido un dato de uso clínico en el log
// exportable sin ninguna necesidad.
// ============================================================================
import { useEffect } from 'react';
import { useSyncExternalStore } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/** Los primeros dos 20 de la regla: 20 minutos mirando de cerca. */
export const VISUAL_BREAK_AFTER_MS = 20 * 60 * 1000;

/** El segundo 20: 20 segundos mirando lejos. Es lo que dura la pausa. */
export const VISUAL_BREAK_SECONDS = 20;

/**
 * Cuánto tiene que estar parada la terapia para que el contador vuelva a cero.
 * El criterio es «20 minutos CONTINUOS»: si el niño se levanta cinco minutos,
 * los ojos ya han descansado y avisar a los dos minutos de volver es ruido.
 * Por debajo de eso —cambiar de ejercicio, abrir el panel del adulto— el tramo
 * es el mismo y se suma.
 */
export const CONTINUITY_GAP_MS = 5 * 60 * 1000;

let accumulatedMs = 0;   // activo consolidado del tramo continuo en curso
let runningSince = 0;    // 0 = el cronómetro está parado
let lastStopAt = 0;      // para decidir si el tramo sigue siendo el mismo
let flagged = false;     // umbral superado; se memoriza para que no oscile
let version = 0;         // lo que hace re-renderizar a useSyncExternalStore
let dueTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<() => void>();
const getVersion = (): number => version;

function notify(): void {
  version += 1;
  listeners.forEach((l) => l());
}

const liveMs = (now: number): number =>
  accumulatedMs + (runningSince ? now - runningSince : 0);

/**
 * Con el cronómetro corriendo nadie vuelve a llamar a nada hasta que el niño
 * termine el ejercicio, así que el umbral tiene que avisar solo. Sin esto la
 * bandera aparecería tarde —en la siguiente pausa— y la recomendación llegaría
 * cuando el descanso ya no toca.
 */
function armDueTimer(now: number): void {
  clearDueTimer();
  if (flagged || !runningSince) return;
  const left = VISUAL_BREAK_AFTER_MS - liveMs(now);
  dueTimer = setTimeout(() => {
    dueTimer = null;
    flagged = true;
    notify();
  }, Math.max(0, left));
}

function clearDueTimer(): void {
  if (dueTimer) { clearTimeout(dueTimer); dueTimer = null; }
}

/** Ms de terapia activa acumulados en el tramo continuo en curso. */
export const getActiveTherapyMs = (now: number = Date.now()): number => liveMs(now);

/**
 * La bandera. `true` en cuanto el tramo pasa de 20 minutos, y se queda puesta
 * hasta que se haga la pausa o el tramo se corte: una recomendación que
 * apareciera y desapareciera sola es una que el adulto no llega a leer.
 */
export const isVisualBreakRecommended = (now: number = Date.now()): boolean =>
  flagged || liveMs(now) >= VISUAL_BREAK_AFTER_MS;

/** Abre tramo activo. Idempotente: llamarlo dos veces no acumula el doble. */
export function startActiveTherapy(now: number = Date.now()): void {
  if (runningSince) return;
  // Tramo nuevo si la parada fue larga; el mismo si solo se cambió de pantalla.
  if (lastStopAt && now - lastStopAt >= CONTINUITY_GAP_MS) {
    accumulatedMs = 0;
    flagged = false;
  }
  runningSince = now;
  lastStopAt = 0;
  armDueTimer(now);
  notify();
}

/** Cierra el tramo activo y consolida lo acumulado. */
export function stopActiveTherapy(now: number = Date.now()): void {
  if (!runningSince) return;
  accumulatedMs += now - runningSince;
  runningSince = 0;
  lastStopAt = now;
  if (accumulatedMs >= VISUAL_BREAK_AFTER_MS) flagged = true;
  clearDueTimer();
  notify();
}

/**
 * El reloj vuelve a cero sin cerrar el tramo: los siguientes 20 minutos
 * empiezan aquí. Es lo que hace la pausa cuando el adulto la ejecuta, y también
 * cuando la descarta — el aviso ya se dio, y repetirlo en cada ejercicio lo
 * convierte en algo que se ignora.
 */
export function noteVisualBreakTaken(now: number = Date.now()): void {
  accumulatedMs = 0;
  if (runningSince) runningSince = now;
  lastStopAt = 0;
  flagged = false;
  armDueTimer(now);
  notify();
}

/** Estado limpio. Para los tests y para cerrar sesión de paciente. */
export function resetActiveTimeMonitor(): void {
  accumulatedMs = 0;
  runningSince = 0;
  lastStopAt = 0;
  flagged = false;
  clearDueTimer();
  notify();
}

// La app en segundo plano no es terapia. Sin esto, dejar la tableta sobre la
// mesa durante la comida contaría como veinte minutos de mirar de cerca y el
// aviso saldría en el primer ejercicio de la tarde.
let appStateSub: { remove: () => void } | null = null;
let pausedByBackground = false;

function onAppState(state: AppStateStatus): void {
  if (state === 'active') {
    if (pausedByBackground) { pausedByBackground = false; startActiveTherapy(); }
  } else if (runningSince) {
    pausedByBackground = true;
    stopActiveTherapy();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!appStateSub) appStateSub = AppState.addEventListener('change', onAppState);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && appStateSub) { appStateSub.remove(); appStateSub = null; }
  };
}

export interface ActiveTimeMonitor {
  /** Ms activos del tramo continuo en curso. */
  activeMs: number;
  /** Han pasado los 20 minutos. Es una SUGERENCIA: nada se bloquea por esto. */
  isVisualBreakRecommended: boolean;
  /** Segundos que dura la pausa sugerida (el segundo 20 de la regla). */
  breakSeconds: number;
  /** Reinicia el reloj: la pausa se hizo, o el adulto la descartó. */
  noteVisualBreakTaken: () => void;
}

/**
 * El hook.
 *
 * `track` abre y cierra el cronómetro con el ciclo de vida de la pantalla
 * anfitriona, así que solo lo pasan las pantallas de ejercicio: el hub, los
 * ajustes y la ficha del paciente no son terapia y no cuentan. Quien solo
 * quiere LEER la bandera —la pausa activa— lo llama sin argumentos y no toca
 * el cronómetro.
 */
export function useActiveTimeMonitor(track = false): ActiveTimeMonitor {
  useSyncExternalStore(subscribe, getVersion, getVersion);

  useEffect(() => {
    if (!track) return;
    startActiveTherapy();
    return () => stopActiveTherapy();
  }, [track]);

  return {
    activeMs: getActiveTherapyMs(),
    isVisualBreakRecommended: isVisualBreakRecommended(),
    breakSeconds: VISUAL_BREAK_SECONDS,
    noteVisualBreakTaken: () => noteVisualBreakTaken(),
  };
}
