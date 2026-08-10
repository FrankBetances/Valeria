// GENERADO por scripts/build-lua-protocol.js — no editar a mano.
// Fuente: firmware/lua/protocol.json
#pragma once

#define LUA_PROTOCOL_VERSION 1

#define LUA_SERVICE_UUID "6c75612d-0001-4000-b000-000000000001"
#define LUA_CHR_CTRL_UUID "6c75612d-0002-4000-b000-000000000001"
#define LUA_CHR_SAFE_UUID "6c75612d-0003-4000-b000-000000000001"
#define LUA_CHR_STATE_UUID "6c75612d-0004-4000-b000-000000000001"
#define LUA_CHR_CFG_UUID "6c75612d-0005-4000-b000-000000000001"

// Opcodes de CTRL
#define LUA_OP_PHASE 0x01  // espeja TurnPhaseStrip: escucha / repite / veredicto / misión
#define LUA_OP_VERDICT 0x02  // 0 no coincide · 1 casi · 2 lo dijo. Lúa mapea nivel → animación; no interpreta.
#define LUA_OP_CELEBRATE 0x03  // cierre de sesión, subida de nivel, insignia
#define LUA_OP_IDLE 0x04  // cara neutra
#define LUA_OP_CALL 0x05  // animación de llamada del Modo Vínculo
#define LUA_OP_GRANT 0x10  // concede capacidad visual
#define LUA_OP_HEARTBEAT 0x11  // renueva la concesión viva
#define LUA_OP_BENCH 0xF0  // Fase 0: pinta un frame completo y devuelve por STATE el tiempo de despacho. No se usa en producción.

// Operaciones de SAFE
#define LUA_SAFE_CLINICAL_SILENCE 0x01  // revoca toda concesión y bloquea nuevas
#define LUA_SAFE_UNLOCK 0x02  // levanta el bloqueo; requiere comando explícito

// Modos publicados en STATE
#define LUA_MODE_REST 0x00  // estado seguro y por omisión
#define LUA_MODE_ACTIVE 0x01  // solo con concesión viva
#define LUA_MODE_LOCKED 0x02  // silencio clínico

// Límites de la máquina de estados
#define LUA_GRANT_MAX_S 60
#define LUA_HEARTBEAT_S 10
