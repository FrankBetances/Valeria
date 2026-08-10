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
  GRANT: 0x10,
  HEARTBEAT: 0x11,
  BENCH: 0xF0,
} as const;

/** Operaciones de SAFE (con confirmación: aquí sí importa saber que llegó). */
export const LUA_SAFE = {
  CLINICAL_SILENCE: 0x01,
  UNLOCK: 0x02,
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
