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

// ---------------------------------------------------------------------------
// Integración Sensorial Auditiva · Lúa acompaña la exposición desde el cristal
// ---------------------------------------------------------------------------
//
// El módulo sensorial es el primero en el que la gata tiene que hacer MENOS,
// no más. El niño está atendiendo a un sonido que le desborda; una mascota
// animándose al lado es una segunda fuente de estimulación justo cuando
// estamos midiendo su tolerancia a la primera.
//
// De ahí las tres reglas de esta sección:
//
//   1 · La concesión es SIEMPRE solo visual. Nunca se pide `LUA_CAP.SOUND`.
//       El estímulo sale del altavoz de la tableta, bajo el dedo del adulto y
//       con su nivel; un aparato que además sonara sería una segunda fuente
//       sin control de intensidad, y arruinaría la jerarquía.
//   2 · Durante la exposición no se manda NADA. Ni un opcode. La cara que dejó
//       la anticipación se queda quieta hasta que el turno cambia: es el
//       equivalente en el cristal del `pose="sit"` de la tableta.
//   3 · La pausa reutiliza `RELAX`, el mismo descanso de la regla 20-20-20. No
//       es un atajo: el gesto es literalmente el mismo —la gata se echa a
//       dormir para dejar de ser lo que retiene la atención— y el niño que
//       pide pausa necesita exactamente eso.
//
// Sin aparato emparejado no hay emisor registrado y estas cuatro funciones no
// hacen nada, que es lo que pasa hoy en una tableta sola.

/** Anticipación: se concede lo visual y la gata se pone en fase de escucha. */
export function luaSensoryReady(seconds: number): void {
  const s = Math.max(1, Math.min(LUA_LIMITS.grantMaxSeconds, Math.trunc(seconds) || 1));
  send(
    luaFrame(LUA_OP.GRANT, luaGrantParam(s, LUA_CAP.VISUAL)),
    luaFrame(LUA_OP.PHASE, 0), // 0 = escucha, la misma fase que en los ejercicios
  );
}

/** Pausa segura: el mismo descanso que el Ancla Visual Lejana. */
export function luaSensoryPause(seconds: number = 20): void {
  const s = Math.max(1, Math.min(LUA_LIMITS.grantMaxSeconds, Math.trunc(seconds) || 1));
  send(
    luaFrame(LUA_OP.GRANT, luaGrantParam(s, LUA_CAP.VISUAL)),
    luaFrame(LUA_OP.RELAX, s),
  );
}

/**
 * Cierre del turno. `CELEBRATE(0)` es el cierre sereno, no la insignia: haber
 * tolerado una exposición no es una hazaña que celebrar a lo grande, y para el
 * niño que ha parado a los dos segundos una fiesta sería un contraste cruel.
 */
export function luaSensoryClose(): void {
  send(luaFrame(LUA_OP.CELEBRATE, 0));
}

/** Salir del módulo: la gata vuelve a su cara neutra. */
export function luaSensoryIdle(): void {
  send(luaFrame(LUA_OP.IDLE));
}
