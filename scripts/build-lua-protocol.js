// ============================================================================
// Valeria+ · Genera la tabla de opcodes de Lúa para los dos lados del enlace
//
//   node scripts/build-lua-protocol.js          → escribe los dos ficheros
//   node scripts/build-lua-protocol.js --check   → falla si no coinciden (gate)
//
// De `firmware/lua/protocol.json` salen:
//   · firmware/lua/include/lua_protocol.h   (lo compila el ESP32)
//   · src/valeriaLuaProtocol.ts             (lo importa Valeria+)
//
// Por qué generarlos en vez de escribirlos dos veces: el bug caro de un
// periférico es que firmware y app entiendan el mismo byte de forma distinta.
// No se manifiesta como un error de compilación ni como un fallo de test: se
// manifiesta como una mascota que hace cosas raras en casa de una familia.
// ============================================================================
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'firmware', 'lua', 'protocol.json');
const OUT_H = path.join(ROOT, 'firmware', 'lua', 'include', 'lua_protocol.h');
const OUT_TS = path.join(ROOT, 'src', 'valeriaLuaProtocol.ts');

const p = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const AVISO = 'GENERADO por scripts/build-lua-protocol.js — no editar a mano.';

const hx = (n) => `0x${n.toString(16).padStart(2, '0').toUpperCase()}`;

// ---------------------------------------------------------------- cabecera C
const h = `// ${AVISO}
// Fuente: firmware/lua/protocol.json
#pragma once

#define LUA_PROTOCOL_VERSION ${p.version}

#define LUA_SERVICE_UUID "${p.service.uuid}"
${p.characteristics.map((c) => `#define LUA_CHR_${c.key}_UUID "${c.uuid}"`).join('\n')}

// Opcodes de CTRL
${p.opcodes.map((o) => `#define LUA_OP_${o.key} ${hx(o.code)}  // ${o.note}`).join('\n')}

// Operaciones de SAFE
${p.safeOps.map((o) => `#define LUA_SAFE_${o.key} ${hx(o.code)}  // ${o.note}`).join('\n')}

// Modos publicados en STATE
${p.modes.map((m) => `#define LUA_MODE_${m.key} ${hx(m.code)}  // ${m.note}`).join('\n')}

// Límites de la máquina de estados
#define LUA_GRANT_MAX_S ${p.limits.grantMaxSeconds}
#define LUA_HEARTBEAT_S ${p.limits.heartbeatSeconds}
`;

// ------------------------------------------------------------- módulo de TS
const ts = `// ${AVISO}
// Fuente: firmware/lua/protocol.json
//
// Tabla de opcodes del periférico Lúa. Ni un campo de texto: es la garantía
// ESTRUCTURAL de Zero-PHI — un nombre de paciente no puede llegar al aparato
// porque no existe el sitio donde meterlo.

export const LUA_PROTOCOL_VERSION = ${p.version};

export const LUA_SERVICE_UUID = '${p.service.uuid}';

export const LUA_CHR = {
${p.characteristics.map((c) => `  ${c.key}: '${c.uuid}',`).join('\n')}
} as const;

/** Opcodes de la característica CTRL (camino de latencia, sin confirmación). */
export const LUA_OP = {
${p.opcodes.map((o) => `  ${o.key}: ${hx(o.code)},`).join('\n')}
} as const;

/** Operaciones de SAFE (con confirmación: aquí sí importa saber que llegó). */
export const LUA_SAFE = {
${p.safeOps.map((o) => `  ${o.key}: ${hx(o.code)},`).join('\n')}
} as const;

/** Modos que publica el aparato en STATE. REST es el estado seguro. */
export const LUA_MODE = {
${p.modes.map((m) => `  ${m.key}: ${hx(m.code)},`).join('\n')}
} as const;

export const LUA_LIMITS = {
  /** Toda concesión caduca. Sin latido, el aparato vuelve a reposo. */
  grantMaxSeconds: ${p.limits.grantMaxSeconds},
  heartbeatSeconds: ${p.limits.heartbeatSeconds},
  /** Del veredicto del adulto al primer fotograma. Criterio de la Fase 0. */
  latencyBudgetMs: ${p.limits.latencyBudgetMs},
  minFps: ${p.limits.minFps},
} as const;

export type LuaOp = (typeof LUA_OP)[keyof typeof LUA_OP];

/** Trama de CTRL: versión, opcode y parámetro de 16 bits little-endian. */
export const luaFrame = (op: LuaOp, param = 0): Uint8Array =>
  Uint8Array.from([LUA_PROTOCOL_VERSION, op, param & 0xff, (param >> 8) & 0xff]);
`;

const check = process.argv.includes('--check');
let bad = false;
for (const [file, content] of [[OUT_H, h], [OUT_TS, ts]]) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const cur = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (check) {
    if (cur !== content) {
      console.error(`✗ ${path.relative(ROOT, file)} no coincide con protocol.json`);
      bad = true;
    }
  } else if (cur !== content) {
    fs.writeFileSync(file, content);
    console.log(`· escrito ${path.relative(ROOT, file)}`);
  }
}

if (check) {
  if (bad) {
    console.error('\nLa tabla de opcodes y lo generado se han separado.');
    console.error('Corre `node scripts/build-lua-protocol.js` y vuelve a commitear.');
    process.exit(1);
  }
  console.log(`✓ Firmware y app comparten la tabla de opcodes (${p.opcodes.length} opcodes, versión ${p.version}).`);
}
