// GENERADO por scripts/build-lua-protocol.js — no editar a mano.
// Fuente: firmware/lua/protocol.json
//
// Tabla de opcodes del periférico Lúa. Ni un campo de texto: es la garantía
// ESTRUCTURAL de Zero-PHI — un nombre de paciente no puede llegar al aparato
// porque no existe el sitio donde meterlo.

export const LUA_PROTOCOL_VERSION = 1;

export const LUA_SERVICE_UUID = '6c75612d-0001-4000-b000-000000000001';

export const LUA_CHR = {
  CTRL: '6c75612d-0002-4000-b000-000000000001',
  SAFE: '6c75612d-0003-4000-b000-000000000001',
  STATE: '6c75612d-0004-4000-b000-000000000001',
  CFG: '6c75612d-0005-4000-b000-000000000001',
} as const;

/** Opcodes de la característica CTRL (camino de latencia, sin confirmación). */
export const LUA_OP = {
  PHASE: 0x01,
  VERDICT: 0x02,
  CELEBRATE: 0x03,
  IDLE: 0x04,
  CALL: 0x05,
  AFFECT: 0x06,
  PICTO: 0x07,
  AWARD: 0x08,
  LEVEL: 0x09,
  PICTO_PAIR: 0x0A,
  MOOD: 0x0B,
  ACCESSORY: 0x0C,
  RELAX: 0x0D,
  GRANT: 0x10,
  HEARTBEAT: 0x11,
  BENCH: 0xF0,
} as const;

/**
 * Capacidades concedibles. Viajan en el byte ALTO del parámetro de `GRANT`;
 * el byte bajo es el TTL. Una máscara de 0 concede SOLO la visual, que es lo
 * que valía un `GRANT` antes de que este campo existiera.
 */
export const LUA_CAP = {
  VISUAL: 0x01,
  SOUND: 0x02,
  NO_TOUCH: 0x04,
} as const;

/**
 * Estados de compañía · parámetro de `MOOD`. Es la vida de la mascota fuera
 * del ejercicio, y el enum de la app (`LuaAffectState`) se mapea uno a uno
 * contra esta tabla: `scripts/check-lua-mascot-mirror.js` falla si alguno de
 * los dos crece sin el otro.
 */
export const LUA_MOOD = {
  SERENE: 0x00,
  CRAVING: 0x01,
  PURRING: 0x02,
  EATING: 0x03,
  CELEBRATING: 0x04,
} as const;

/** Ranuras del armario · byte ALTO del parámetro de `ACCESSORY`. */
export const LUA_SLOT = {
  HEAD: 0x00,
  NECK: 0x01,
} as const;

/** Byte bajo de `ACCESSORY` que quita lo que la gata llevara puesto. */
export const LUA_ACCESSORY_NONE = 0xFF;

/** Operaciones de SAFE (con confirmación: aquí sí importa saber que llegó). */
export const LUA_SAFE = {
  CLINICAL_SILENCE: 0x01,
  UNLOCK: 0x02,
  MUTE: 0x03,
} as const;

/** Modos que publica el aparato en STATE. REST es el estado seguro. */
export const LUA_MODE = {
  REST: 0x00,
  ACTIVE: 0x01,
  LOCKED: 0x02,
} as const;

export const LUA_LIMITS = {
  /** Toda concesión caduca. Sin latido, el aparato vuelve a reposo. */
  grantMaxSeconds: 60,
  heartbeatSeconds: 10,
  /** Del veredicto del adulto al primer fotograma. Criterio de la Fase 0. */
  latencyBudgetMs: 300,
  minFps: 20,
} as const;

export type LuaOp = (typeof LUA_OP)[keyof typeof LUA_OP];

/** Trama de CTRL: versión, opcode y parámetro de 16 bits little-endian. */
export const luaFrame = (op: LuaOp, param = 0): Uint8Array =>
  Uint8Array.from([LUA_PROTOCOL_VERSION, op, param & 0xff, (param >> 8) & 0xff]);

/**
 * Parámetro de `GRANT`: TTL en el byte bajo, capacidades en el alto.
 * Sin capacidades explícitas concede solo la visual — la sonora se pide, nunca
 * se hereda.
 */
export const luaGrantParam = (ttlSeconds: number, caps = 0): number => {
  const ttl = Math.max(1, Math.min(LUA_LIMITS.grantMaxSeconds, Math.trunc(ttlSeconds)));
  return ((caps & 0xff) << 8) | ttl;
};

/**
 * Parámetro de `ACCESSORY`: índice del ítem en el byte bajo, ranura en el alto.
 * `LUA_ACCESSORY_NONE` deja la ranura vacía — que es lo que hay que mandar al
 * desequipar, porque el aparato no adivina que algo ha dejado de estar puesto.
 */
export const luaAccessoryParam = (slot: number, itemIndex: number): number =>
  ((slot & 0xff) << 8) | (itemIndex & 0xff);
