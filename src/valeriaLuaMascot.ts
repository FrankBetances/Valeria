// ============================================================================
// Valeria+ · Lúa · La capa espejo: una mascota, dos superficies
//
// Hasta ahora había dos gatas que no se hablaban. La de la tableta
// (`ValeriaCatInteractiveCard`) aprendió a ronronear, a comer y a llevar
// puesto lo que el niño le pone en el armario. La del aparato aprendió, por su
// lado, a responder al dedo en el cristal de la V2 rotando cuatro emociones.
// Ninguna de las dos sabía nada de la otra: acariciabas la tableta y el
// aparato seguía impasible, le ponías la flor y la del cristal iba sin ella.
//
// El §10 del plan no dice «se parecen»: dice que la cara de Lúa en el aparato
// y la de la app son «literalmente el mismo dibujo, no dos interpretaciones que
// se van separando versión a versión». Este módulo es lo que hace que esa
// frase siga siendo verdad ahora que la mascota tiene vida propia en los dos
// sitios.
//
// MÓDULO PURO. Ni React, ni AsyncStorage, ni Bluetooth: entra estado y salen
// TRAMAS. Quien decide cuándo mandarlas es `valeriaLuaSession.ts`; quien las
// pone en el aire —el puente BLE, §7 del plan— todavía no existe, y por eso esto
// se puede probar entero sin radio y sin placa.
//
// ⚠ Lo que este módulo NO hace, y conviene no confundirlo: no abre el enlace,
// no concede nada y no garantiza que el aparato obedezca. El aparato solo se
// mueve con `GRANT` vivo y capacidad visual (§5); estas tramas, sin concesión,
// las descarta el firmware por su `default`. Es a propósito: el espejo no
// puede ser una puerta trasera a ACTIVA.
// ============================================================================
import {
  LUA_OP,
  LUA_MOOD,
  LUA_SLOT,
  LUA_ACCESSORY_NONE,
  luaFrame,
  luaAccessoryParam,
} from './valeriaLuaProtocol';
import { AWARD_GLYPH_KEYS, AWARD_TIER_KEYS } from './ValeriaPixelArt';
// Solo tipos: `valeriaGamification` arrastra AsyncStorage y este módulo es puro.
import type { Badge, SessionReward } from './valeriaGamification';
import {
  LuaAffectState,
  LuaInventoryState,
  COLLECTIBLES_CATALOG,
  getCollectibleById,
} from './types/valeriaLua';

/**
 * El enum de la app contra la tabla del protocolo, uno a uno. No hay estado de
 * compañía que la tableta sepa expresar y el aparato no: eso es exactamente lo
 * que separaba a las dos mascotas.
 */
export const LUA_MOOD_OF_AFFECT: Record<LuaAffectState, number> = {
  IDLE_SERENE: LUA_MOOD.SERENE,
  CRAVING_SNACK: LUA_MOOD.CRAVING,
  PURRING_LOVE: LUA_MOOD.PURRING,
  EATING_SNACK: LUA_MOOD.EATING,
  CELEBRATE_AWARD: LUA_MOOD.CELEBRATING,
};

/**
 * Con qué emociones puras responde a caricias SEGUIDAS, y en qué orden.
 *
 * Existe porque el firmware ya rotaba cuatro (`device.cpp::onTouch`) por una
 * razón clínica que vale igual en la tableta: **la repetición idéntica deja de
 * ser refuerzo a la tercera**. Lo que no valía es que cada superficie rotara
 * las suyas. La tabla es esta, y `check-lua-mascot-mirror.js` la compara con la
 * del firmware: acariciar el cristal y acariciar la tableta tienen que dar la
 * misma secuencia, porque para el niño es la misma gata.
 *
 * Son índices de `AFFECT` (0-7), no de `MOOD`: esto es lo que pone las
 * partículas, y el ronroneo —que es lo que pone la cara— va detrás.
 */
export const LUA_CARESS_AFFECTS = [0, 7, 1, 2] as const; // Alegría · Diversión · Amor · Gratitud

/** Una trama de `MOOD` con el estado de compañía que tenga la tarjeta. */
export const luaMoodFrame = (affect: LuaAffectState): Uint8Array =>
  luaFrame(LUA_OP.MOOD, LUA_MOOD_OF_AFFECT[affect]);

/**
 * La caricia, en las dos tramas que la cuentan: la emoción que toca por número
 * de caricia y el ronroneo. `patCount` es el total histórico —el mismo
 * `totalPatsCount` que ya se persiste—, así que la rotación sobrevive a cerrar
 * la app y no vuelve a empezar en Alegría cada sesión.
 *
 * El orden NO es indiferente y costó entenderlo: `AFFECT` en el aparato hace
 * dos cosas —siembra las partículas Y pone su cara—, así que si fuera el
 * último, la gata acabaría con cara de Alegría en vez de ronroneando y la
 * tableta y el cristal volverían a discrepar. `MOOD` va detrás para quedarse
 * con la cara; las partículas ya están sembradas.
 */
export const luaCaressFrames = (patCount: number): Uint8Array[] => {
  const n = Math.max(0, Math.trunc(patCount));
  const affect = LUA_CARESS_AFFECTS[n % LUA_CARESS_AFFECTS.length];
  return [luaFrame(LUA_OP.AFFECT, affect), luaMoodFrame('PURRING_LOVE')];
};

/** Comer: el estado de compañía y nada más. El premio no viaja, solo el gesto. */
export const luaFeedFrames = (): Uint8Array[] => [luaMoodFrame('EATING_SNACK')];

/**
 * Lo que la gata lleva puesto, SIEMPRE las dos ranuras.
 *
 * Mandar solo la que cambió deja al aparato con lo anterior en la otra en
 * cuanto se pierde una trama —y `CTRL` es `writeNoResponse` a propósito (§6.1),
 * así que perder una trama es el caso normal, no el raro—. Dos tramas de cuatro
 * bytes no son un coste; una gata con la flor de ayer, sí.
 */
export const luaAccessoryFrames = (inv: LuaInventoryState): Uint8Array[] => {
  const idx = (id?: string): number => {
    if (!id) return LUA_ACCESSORY_NONE;
    const item = getCollectibleById(id);
    return item ? item.mirrorIndex : LUA_ACCESSORY_NONE;
  };
  return [
    luaFrame(LUA_OP.ACCESSORY, luaAccessoryParam(LUA_SLOT.HEAD, idx(inv.equipped.head))),
    luaFrame(LUA_OP.ACCESSORY, luaAccessoryParam(LUA_SLOT.NECK, idx(inv.equipped.neck))),
  ];
};

/**
 * Todo lo que el aparato necesita para ponerse al día. Se manda al conectar y
 * al volver al hub, que son los dos momentos en los que el aparato puede
 * llevar puesto algo que ya no es verdad.
 *
 * El orden importa: primero cómo va vestida y luego cómo está. Al revés, la
 * cara correcta se pinta con la flor de antes durante un frame.
 */
export const luaMascotSnapshot = (
  inv: LuaInventoryState,
  affect: LuaAffectState = 'IDLE_SERENE',
): Uint8Array[] => [...luaAccessoryFrames(inv), luaMoodFrame(affect)];

/**
 * ¿Hay algo desbloqueado que el niño no se haya puesto ni gastado? Es lo que
 * enciende el antojo, y es la única regla de este módulo que mira el inventario
 * en vez de traducirlo.
 *
 * Antojo, NO hambre: la mascota no se deteriora, no adelgaza y no pone cara
 * triste si nadie la atiende. Un tamagotchi que se muere de hambre convierte
 * faltar a una sesión en un castigo, y aquí el que falta a una sesión suele ser
 * un niño de cuatro años que no decide su agenda. Es la misma regla que impide
 * la cara triste en `VERDICT(0)`.
 */
export const luaCraves = (inv: LuaInventoryState, nowMs: number = Date.now()): boolean => {
  const tieneSnack = COLLECTIBLES_CATALOG.some(
    (c) => c.slot === 'snack' && inv.unlockedItemIds.includes(c.id),
  );
  if (!tieneSnack) return false;
  const desdeLaUltima = nowMs - (inv.lastFedTimestamp || 0);
  return desdeLaUltima > 6 * 60 * 60 * 1000; // seis horas: una vez por sesión, no un reloj
};

// ---------------------------------------------------------------------------
// El premio de la sesión · la insignia y el nivel, en el cristal
// ---------------------------------------------------------------------------
//
// `AWARD` y `LEVEL` llevaban en la tabla desde la primera tanda, el firmware
// los pinta —`docs/insignias/` tiene las 45 insignias capturadas— y esta app
// no los mandaba NUNCA. La gamificación desbloqueaba una insignia, subía el
// nivel, y en el aparato no pasaba nada: el niño veía su premio en la tableta
// y la gata del cristal seguía con la cara de antes. Es la misma separación
// que arreglaron `MOOD` y `ACCESSORY` el 19/8/2026, en la única capa que
// quedaba fuera.
//
// Lo que viaja son DOS NÚMEROS por insignia: la familia y el rango. Ni el id
// (`ses10`, `racha30`), ni el nombre traducido, ni la descripción. El aparato
// enseña el dibujo número N de un catálogo que lleva flasheado y no sabe qué
// se ha ganado — que es la garantía del §6.1 aplicada al premio.

/** Parámetro de `AWARD`: glifo en el byte bajo, rango en el alto. */
export const luaAwardParam = (glyph: number, tier: number): number =>
  ((tier & 0xff) << 8) | (glyph & 0xff);

/**
 * La insignia, del catálogo de `valeriaGamification` al enlace.
 *
 * Los dos índices son la POSICIÓN en `AWARD_GLYPH_KEYS` y `AWARD_TIER_KEYS`,
 * que es lo que el firmware tiene flasheado. Por eso esas dos listas se añaden
 * por el final y no se reordenan nunca, igual que `PICTO_KEYS`: reordenar le
 * pone al niño la insignia del vecino en un aparato que ya está en su casa.
 *
 * Devuelve `null` en vez de una trama inventada si el glifo o el rango no
 * están en la tabla. Una insignia que el aparato no conoce se queda sin
 * enseñar; lo que no puede pasar es que enseñe otra.
 */
export const luaAwardFrame = (badge: Badge): Uint8Array | null => {
  const glyph = (AWARD_GLYPH_KEYS as readonly string[]).indexOf(badge.glyph);
  const tier = (AWARD_TIER_KEYS as readonly string[]).indexOf(badge.tier);
  if (glyph < 0 || tier < 0) return null;
  return luaFrame(LUA_OP.AWARD, luaAwardParam(glyph, tier));
};

/** Los segmentos del anillo del aparato. No es `LEVEL_COUNT`: es la trama. */
export const LUA_LEVEL_MAX = 12;

/**
 * El nivel, en los doce segmentos del anillo. Sin número y sin el nombre del
 * nivel: en el panel no se escribe.
 *
 * Se acota a 1-12 aquí y no allí porque el firmware IGNORA lo que se salga
 * (`device.cpp`: `if (param >= 1 && param <= 12)`), y `levelFor(xp)` no tiene
 * techo. Un niño con 1 300 XP es nivel 14 en la tableta y el anillo se
 * quedaría en el nivel de la sesión anterior sin que nadie se enterara. Es el
 * mismo recorte que ya hace `levelName`.
 */
export const luaLevelFrame = (level: number): Uint8Array =>
  luaFrame(LUA_OP.LEVEL, Math.max(1, Math.min(LUA_LEVEL_MAX, Math.trunc(level) || 1)));

/**
 * Intensidad de `CELEBRATE` que le corresponde a un premio de sesión.
 *
 * La tabla del protocolo ya reparte las tres —«0 cierre · 1 subida de nivel
 * (Epifanía) · 2 insignia (Éxito Absoluto)»— y el premio trae exactamente esas
 * tres situaciones. No hay nada que decidir aquí: se lee.
 */
export const luaCelebrationFor = (reward: SessionReward): number =>
  (reward.newBadges.length ? 2 : reward.levelUp ? 1 : 0);

/**
 * El desfile entero, en orden y sin tiempos: la celebración, el nivel si ha
 * subido y una trama por insignia nueva.
 *
 * NO se manda de golpe. Cada opcode SUSTITUYE la cara —`setExpression` en el
 * firmware— así que cuatro tramas seguidas dejan ver la última y nada más. Los
 * tiempos los pone `valeriaLuaSession.luaSessionReward`, que es de quien es esa
 * responsabilidad en este repositorio.
 *
 * El orden es celebración → nivel → insignias, y no al revés: la subida de
 * nivel es el marco («has llegado a Gata Sabia») y las insignias son lo que se
 * mira. Terminar en el nivel dejaría el premio concreto enterrado debajo.
 */
export const luaSessionRewardFrames = (reward: SessionReward): Uint8Array[] => {
  const frames: Uint8Array[] = [luaFrame(LUA_OP.CELEBRATE, luaCelebrationFor(reward))];
  if (reward.levelUp) frames.push(luaLevelFrame(reward.level));
  for (const badge of reward.newBadges) {
    const f = luaAwardFrame(badge);
    if (f) frames.push(f);
  }
  return frames;
};
