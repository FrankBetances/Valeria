// ============================================================================
// Aventuras con Lúa · Cerrar una actividad cuenta
//
// El módulo entró sin tocar la gamificación: 90 actividades que no daban XP, no
// movían la racha, no desbloqueaban insignia y —lo que más se nota— no llegaban
// al aparato. El niño veía su premio en la tableta y la gata del cristal seguía
// con la cara de antes, que es justo lo que el espejo de §5b existe para evitar.
//
// Un único sitio para las tres pantallas que cierran actividad, para que no se
// vuelva a olvidar en la cuarta.
// ============================================================================
import { registerSession } from '../valeriaGamification';
import { luaSessionReward } from '../valeriaLuaSession';
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
