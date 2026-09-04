// ============================================================================
// Aventuras con Lúa · Cerrar una actividad cuenta
//
// El módulo entró sin tocar la gamificación: 90 actividades que no daban XP, no
// movían la racha, no desbloqueaban insignia y —lo que más se nota— no llegaban
// al aparato. El niño veía su premio en la tableta y la gata del cristal seguía
// con la cara de antes, que es justo lo que el espejo de §5b existe para evitar.
//
// Un único sitio para las CUATRO pantallas que cierran actividad —cuento,
// canción, juego y cribado—, para que no se vuelva a olvidar en la quinta.
//
// Y se olvidó igual, en la mitad que no es mandar (4/9/2026): las cuatro
// pantallas de §5b que cerraban sesión antes que este módulo llevan todas
// `useEffect(() => () => cancelSessionReward(), [])`, y estas cuatro no lo
// llevaban. El desfile del premio se manda A PLAZOS —un opcode cada 3 000 ms,
// porque es lo que dura una cara en el firmware—, así que salir de la pantalla
// a mitad dejaba los temporizadores corriendo: la gata del cristal seguía
// enseñando insignias de una actividad que el niño ya había abandonado, y sin
// el `IDLE` del final el panel se quedaba en el último fotograma hasta que
// caducaba la concesión. Justo donde el niño vuelve al hub, que es donde la
// caricia tiene que funcionar.
//
// Por eso el cierre vive AQUÍ y no en cada pantalla: `useLuaActivityCleanup()`
// es una línea, y la pantalla que se olvide de ella se nota al leerla al lado
// de las otras tres.
// ============================================================================
import { useEffect } from 'react';
import { registerSession } from '../valeriaGamification';
import { luaSessionReward, cancelSessionReward } from '../valeriaLuaSession';
import type { SessionReward } from '../valeriaGamification';

/**
 * Cierra una actividad del módulo y devuelve el premio, o null si la
 * gamificación no está disponible (no debe tumbar la pantalla del niño).
 *
 * `avg` es la nota media 0-3 del resto de la app. Aquí no hay puntuación
 * clínica —el banco es de observación, no de aciertos— así que se pasa el
 * valor neutro 2: suma XP y racha sin fabricar un rendimiento que nadie midió.
 */
export async function luaCompleteActivity(items: number): Promise<SessionReward | null> {
  try {
    const premio = await registerSession(2, Math.max(1, items));
    luaSessionReward(premio); // el mismo premio, en el cristal
    return premio;
  } catch (e) {
    return null;
  }
}

/**
 * Corta el desfile del premio al salir de la pantalla.
 *
 * Va en TODA pantalla de este módulo que llame a `luaCompleteActivity`, y es la
 * misma línea que llevan las cuatro pantallas de la app que cierran sesión. Sin
 * ella los temporizadores del desfile sobreviven a la pantalla y el cristal
 * sigue celebrando algo que ya no está en la tableta.
 *
 * `cancelSessionReward()` sin argumento manda `IDLE`, que es lo que devuelve la
 * cara a su sitio; el silencioso es solo para cuando un premio nuevo sustituye
 * al anterior.
 */
export function useLuaActivityCleanup(): void {
  useEffect(() => () => cancelSessionReward(), []);
}
