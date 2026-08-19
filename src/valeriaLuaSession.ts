// ============================================================================
// Valeria+ · Lúa · La sesión del enlace: quién manda las tramas y cuándo
//
// `valeriaLuaMascot.ts` FABRICA tramas y no las manda; el transporte BLE (§7
// del plan, `valeriaLuaBridge.ts`) todavía no existe. Este módulo es la costura
// entre los dos: se le REGISTRA un emisor y él decide la secuencia y los
// tiempos. Sin emisor registrado no manda nada y no rompe nada — que es lo que
// hoy pasa en una tableta sin aparato emparejado.
//
// MÓDULO PURO: ni React ni radio. Se puede probar entero en Node.
//
// Zero-PHI, igual que el resto del enlace: por aquí solo pasan opcodes y
// números de la tabla generada. No hay campo donde meter un nombre.
// ============================================================================
import {
  LUA_OP,
  LUA_CAP,
  LUA_LIMITS,
  luaFrame,
  luaGrantParam,
} from './valeriaLuaProtocol';
import { VISUAL_BREAK_SECONDS } from './valeriaActiveTimeMonitor';

export type LuaSender = (frames: Uint8Array[]) => void;

let sender: LuaSender | null = null;

/** Lo registra el transporte al conectar y lo quita al perder el enlace. */
export const setLuaSender = (fn: LuaSender | null): void => { sender = fn; };

const send = (...frames: Uint8Array[]): void => { if (sender) sender(frames); };

// ---------------------------------------------------------------------------
// Ancla Visual Lejana · la ejecución de la regla 20-20-20 en el aparato
// ---------------------------------------------------------------------------
let breakTimer: ReturnType<typeof setTimeout> | null = null;

/** ¿Hay una pausa visual corriendo ahora mismo? */
export const isVisualAnchorBreakActive = (): boolean => breakTimer !== null;

/**
 * Corta la pausa antes de tiempo y devuelve a Lúa a su cara despierta.
 *
 * Lo llama el adulto al reanudar. `IDLE` es el opcode correcto para esto y no
 * un `PHASE`: el firmware lo obedece SIEMPRE —no exige concesión— y deja a la
 * gata neutra si la hay y dormida si no. Quién vuelve a llevar el turno lo dirá
 * el `PHASE` que mande la pantalla del ejercicio, que es quien lo sabe.
 */
export function cancelVisualAnchorBreak(silent = false): void {
  if (!breakTimer) return;
  clearTimeout(breakTimer);
  breakTimer = null;
  if (!silent) send(luaFrame(LUA_OP.IDLE));
}

/**
 * Los 20 segundos de mirar lejos, en el cristal: Lúa se echa a dormir para
 * dejar de ser lo que retiene la mirada del niño.
 *
 * La secuencia es GRANT y luego RELAX, en ese orden y no al revés: el firmware
 * despierta la cara al conceder, así que un GRANT posterior borraría el
 * descanso que acaba de empezar. La concesión cubre la pausa entera —el techo
 * son 60 s y la pausa son 20— y por eso no hacen falta latidos: si el enlace se
 * cae a mitad, el aparato se va a REPOSO solo, que es la cara que ya tenía.
 *
 * NADA de esto bloquea la app. La pausa es una sugerencia que el adulto ha
 * aceptado, y puede cortarla en cualquier momento con `cancelVisualAnchorBreak`.
 *
 * @param seconds duración en segundos; se acota al techo del GRANT.
 * @param onEnd    se llama al terminar la pausa, no al cortarla.
 */
export function triggerVisualAnchorBreak(
  seconds: number = VISUAL_BREAK_SECONDS,
  onEnd?: () => void,
): () => void {
  const s = Math.max(1, Math.min(LUA_LIMITS.grantMaxSeconds, Math.trunc(seconds) || 0));

  cancelVisualAnchorBreak(true); // una pausa nueva sustituye a la anterior

  send(
    luaFrame(LUA_OP.GRANT, luaGrantParam(s, LUA_CAP.VISUAL)),
    luaFrame(LUA_OP.RELAX, s),
  );

  breakTimer = setTimeout(() => {
    breakTimer = null;
    send(luaFrame(LUA_OP.IDLE));
    onEnd?.();
  }, s * 1000);

  return () => cancelVisualAnchorBreak();
}
