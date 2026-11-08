// Aviso de acierto/ánimo para que Lúa reaccione en pantalla (R17). Módulo puro,
// sin React Native: valeriaVoice lo importa y los gates lo cargan en Node.
export type LuaCheer = { ok: boolean; text: string; at: number };
const listeners = new Set<(c: LuaCheer) => void>();
export const emitLuaCheer = (ok: boolean, text: string): void => {
  const c = { ok, text, at: Date.now() };
  listeners.forEach((fn) => fn(c));
};
export const onLuaCheer = (fn: (c: LuaCheer) => void): (() => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};
// Solo en desarrollo (no llega al APK de publicación): permite fotografiar la
// reacción de Lúa en las capturas de web.
declare const __DEV__: boolean | undefined;
if (typeof __DEV__ !== 'undefined' && __DEV__ && typeof globalThis !== 'undefined') {
  (globalThis as any).__luaCheer = emitLuaCheer;
}
