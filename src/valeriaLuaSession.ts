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
import { luaGrantCapsFor } from './valeriaLuaTouchPolicy';

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
//   4 · La concesión se renueva con `GRANT`, NUNCA con `HEARTBEAT`. En el
//       aparato el latido dibuja su propio efecto —un disco que late 4,5 s con
//       un corazón detrás de la cabeza, y uno cada 10 s deja el panel latiendo
//       media exposición—, y eso es exactamente la segunda fuente visual que
//       este módulo existe para no tener. Un `GRANT` repetido, en cambio, es
//       INERTE mientras la gata ya esté despierta: solo empuja la caducidad,
//       no toca la cara y no siembra una partícula.
//
// Sin aparato emparejado no hay emisor registrado y estas cinco funciones no
// hacen nada, que es lo que pasa hoy en una tableta sola — ni el temporizador
// de renovación llega a nadie.

// Renovación de la concesión mientras el turno está abierto.
//
// Hace falta porque este módulo tiene dos esperas que no tienen reloj y el
// firmware lo dejó por escrito: con `agencyMode: 'child_tap'` el sonido no
// arranca hasta que el niño pulsa su botón —y el niño para el que está hecho
// el módulo tarda—, y al cerrar el adulto rellena una valoración con notas.
// Con una sola concesión de 16-28 s, en los dos casos el aparato caduca a
// mitad y la gata se duerme justo cuando hacía falta.
let sensoryTtlS = 0;
let sensoryCaps: number = LUA_CAP.VISUAL;
let sensoryRenew: ReturnType<typeof setInterval> | null = null;

const stopSensoryRenew = (): void => {
  if (!sensoryRenew) return;
  clearInterval(sensoryRenew);
  sensoryRenew = null;
};

/**
 * Renueva por debajo del TTL concedido, porque el aparato solo atiende una
 * renovación mientras la concesión anterior siga viva: si llega tarde, ya está
 * en REPOSO. La mitad del TTL, y como mucho cada `heartbeatSeconds`.
 */
const startSensoryRenew = (ttl: number): void => {
  stopSensoryRenew();
  sensoryTtlS = ttl;
  const everyS = Math.max(1, Math.min(LUA_LIMITS.heartbeatSeconds, Math.floor(ttl / 2)));
  sensoryRenew = setInterval(() => {
    // Con la MISMA máscara: si la renovación perdiera el bit de bloqueo, el
    // dedo volvería a contar a los ocho segundos de empezar la exposición.
    send(luaFrame(LUA_OP.GRANT, luaGrantParam(sensoryTtlS, sensoryCaps)));
  }, everyS * 1000);
};

const grantSeconds = (seconds: number): number =>
  Math.max(1, Math.min(LUA_LIMITS.grantMaxSeconds, Math.trunc(seconds) || 1));

/**
 * Anticipación: se concede lo visual y la gata se pone en fase de escucha.
 *
 * La máscara sale de `luaGrantCapsFor`, que para este módulo pide además el
 * bloqueo del táctil: durante una exposición se está midiendo cuánto tolera el
 * niño, y un ronroneo que aparece cuando toca —y que aparecería más cuanto
 * peor lo esté pasando— es una variable suelta dentro de la medida (D-O).
 */
export function luaSensoryReady(seconds: number, exerciseCode: string): void {
  const s = grantSeconds(seconds);
  sensoryCaps = luaGrantCapsFor(exerciseCode);
  send(
    luaFrame(LUA_OP.GRANT, luaGrantParam(s, sensoryCaps)),
    luaFrame(LUA_OP.PHASE, 0), // 0 = escucha, la misma fase que en los ejercicios
  );
  startSensoryRenew(s);
}

/**
 * Reanudar después de una pausa. Es la misma trama que abrir el turno y por
 * eso delega, pero tiene nombre propio porque **faltaba**: sin ella la gata no
 * volvía. El `GRANT` de la pausa dura lo mismo que su descanso, así que a los
 * veinte segundos el aparato estaba en REPOSO y ni la exposición reanudada ni
 * el cierre lo despertaban en toda la sesión.
 */
export function luaSensoryResume(seconds: number, exerciseCode: string): void {
  luaSensoryReady(seconds, exerciseCode);
}

/** Pausa segura: el mismo descanso que el Ancla Visual Lejana. */
export function luaSensoryPause(seconds: number = 20): void {
  // La renovación se PARA aquí, y es deliberado: un `GRANT` que llegara en
  // mitad del descanso despertaría a la gata —el aparato lo trata como
  // cualquier otro gesto y corta el `RELAX`—, que es justo el estímulo que la
  // pausa venía a quitar. Si la pausa se alarga más que el descanso, el
  // aparato se va a REPOSO con la misma cara dormida que ya tenía; lo único
  // que se apaga es el anillo de la concesión. Quien lo devuelve al turno es
  // `luaSensoryResume`, cuando el adulto reanuda.
  stopSensoryRenew();
  const s = grantSeconds(seconds);
  send(
    luaFrame(LUA_OP.GRANT, luaGrantParam(s, sensoryCaps)),
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
  stopSensoryRenew(); // después de mandarlo: el cierre necesita la concesión viva
}

/** Salir del módulo: la gata vuelve a su cara neutra. */
export function luaSensoryIdle(): void {
  stopSensoryRenew();
  send(luaFrame(LUA_OP.IDLE));
}
