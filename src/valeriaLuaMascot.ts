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
// TRAMAS. Quien las mande —`valeriaLuaBridge.ts`, §7 del plan— todavía no
// existe, y por eso esto se puede probar entero sin radio y sin placa.
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
