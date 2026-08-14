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
#define LUA_OP_VERDICT 0x02  // 0 no coincide · 1 casi (Impulso ⚡) · 2 lo dijo (Calma Aprobatoria ✓). Lúa mapea nivel → animación; no interpreta.
#define LUA_OP_CELEBRATE 0x03  // 0 cierre · 1 subida de nivel (Epifanía !) · 2 insignia (Éxito Absoluto ⭐)
#define LUA_OP_IDLE 0x04  // cara neutra
#define LUA_OP_CALL 0x05  // animación de llamada del Modo Vínculo
#define LUA_OP_AFFECT 0x06  // 0:Alegría 1:Amor 2:Gratitud 3:Tranquilidad 4:Esperanza 5:Orgullo 6:Inspiración 7:Diversión
#define LUA_OP_PICTO 0x07  // la ficha del ejercicio en el panel. Índice del registro de ValeriaPictograms.tsx, nunca texto: el aparato no sabe qué palabra es.
#define LUA_OP_AWARD 0x08  // réplica de la insignia: familia y rango, nunca su nombre ni su descripción.
#define LUA_OP_LEVEL 0x09  // réplica del nivel: doce segmentos en el anillo. Sin número y sin el nombre del nivel.
#define LUA_OP_PICTO_PAIR 0x0A  // RESERVADO · dos fichas para la vuelta de comprensión de Pares Mínimos (§6.5, capa 2). El código queda tomado para que no lo ocupe otro; el firmware todavía NO lo dibuja y lo ignora por el `default` del switch.
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
