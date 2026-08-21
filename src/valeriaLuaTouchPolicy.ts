// ============================================================================
// Valeria+ · Lúa · Qué dinámicas admiten el dedo en el cristal
//
// Decidido por dirección el 21/8/2026: **el toque funciona para los ejercicios
// que correspondan y está bloqueado para los que no; depende de la dinámica.**
//
// Se resuelve con el bit `LUA_CAP.NO_TOUCH` del `GRANT`, que es el único de la
// máscara que RESTA en vez de conceder. Está montado así a propósito: el dedo
// ya se atendía antes de que el bit existiera, así que un bit aditivo habría
// dejado sin caricia a todo lo ya escrito —el hub, el Modo Vínculo— sin que
// nadie lo notara hasta tener la placa delante. Aquí se pide el bloqueo, no el
// permiso.
//
// OJO, porque son DOS reglas y hay que tener las dos en la cabeza para saber
// por qué el aparato no responde:
//
//   1 · Esta tabla, que es la dinámica del ejercicio y la rellena logopedia.
//   2 · La fase del turno, que la aplica el aparato SOLO: durante `PHASE(0)`
//       (escucha) y `PHASE(1)` (repite) el dedo no cuenta, pida esta tabla lo
//       que pida. Mientras la tableta presenta el estímulo o captura la voz
//       del niño, la gata no compite por su atención. Está en `Device::onTouch`
//       del firmware y probado en `testTouch()`, no aquí.
//
// O sea que esta tabla es para las dinámicas que no admiten el dedo **fuera**
// de esas dos fases. La lista nace corta a propósito: lo que no esté aquí,
// admite el dedo.
// ============================================================================
import { LUA_CAP } from './valeriaLuaProtocol';

/**
 * Códigos de ejercicio cuya dinámica NO admite el dedo en el cristal.
 *
 * Se identifican por `code` —`FF-1`, `ISA-01`…— y no por `id`, porque el
 * código es el mismo en las cinco variedades y los metadatos están duplicados
 * por idioma: una tabla por idioma sería cinco sitios donde equivocarse.
 *
 * **La lista la decide logopedia, no un commit.** Hoy solo tiene el módulo
 * sensorial, que es el único caso ya razonado: durante una exposición se está
 * midiendo cuánta tolera el niño, y un ronroneo que aparece cuando toca —y que
 * aparecería MÁS cuanto peor lo esté pasando— es una variable suelta dentro de
 * la medida. Los demás bloques entran aquí cuando alguien los revise uno a uno.
 */
export const LUA_TOUCH_BLOCKED: readonly string[] = [
  'ISA-01', // Mi sonido, mi botón
  'ISA-06', // Ambientes vivos cotidianos
];

/** ¿La dinámica de este ejercicio admite el dedo en el cristal? */
export const luaTouchAllowed = (exerciseCode: string): boolean =>
  !LUA_TOUCH_BLOCKED.includes(exerciseCode);

/**
 * Máscara de capacidades del `GRANT` para este ejercicio.
 *
 * Nunca pide `LUA_CAP.SOUND`, y eso no es un olvido: el aparato no suena, y en
 * el módulo sensorial además sería una segunda fuente sin control de
 * intensidad. La capacidad sonora se pide expresamente o no se tiene.
 */
export const luaGrantCapsFor = (exerciseCode: string): number =>
  LUA_CAP.VISUAL | (luaTouchAllowed(exerciseCode) ? 0 : LUA_CAP.NO_TOUCH);
