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
#define LUA_OP_MOOD 0x0B  // espeja LuaAffectState, la vida de la mascota FUERA del ejercicio: 0 serena · 1 antojo · 2 ronroneo (caricia) · 3 comiendo · 4 celebrando. Dentro del ejercicio mandan PHASE, VERDICT y CELEBRATE, que son los que llevan el turno.
#define LUA_OP_ACCESSORY 0x0C  // réplica del armario: la gata del aparato lleva puesto lo mismo que la de la tableta. Índice del catálogo de coleccionables de Valeria+, nunca su nombre. Se añade al final y no se reordena, igual que PICTO.
#define LUA_OP_RELAX 0x0D  // Ancla Visual Lejana (regla 20-20-20): la gata se echa a dormir mientras el niño mira lejos, para que el aparato no sea lo que le retiene la mirada. Es una SUGERENCIA que ejecuta el adulto, nunca un bloqueo: no revoca nada, no toca la concesión y no la renueva, y cualquier gesto posterior —PHASE, GRANT, IDLE— lo interrumpe en el acto. La duración se acota al techo del GRANT: un descanso no puede sobrevivir a la concesión que lo sostiene.
#define LUA_OP_GRANT 0x10  // concede capacidades (§5 del plan). El byte alto es la máscara de `capabilities`: 0x00 significa SOLO VISUAL, que es lo que valía un GRANT antes de que el campo existiera. La capacidad sonora NUNCA es implícita: hay que pedir su bit.
#define LUA_OP_HEARTBEAT 0x11  // renueva la concesión viva
#define LUA_OP_BENCH 0xF0  // Fase 0: pinta un frame completo y devuelve por STATE el tiempo de despacho. No se usa en producción.

// Capacidades · byte ALTO del parámetro de GRANT. El byte BAJO es el TTL.
// 0x00 = solo visual: es lo que valía un GRANT antes de que existiera el campo.
#define LUA_CAP_VISUAL 0x01  // dibujar en el panel. Es lo que concede un GRANT con el byte alto a 0
#define LUA_CAP_SOUND 0x02  // emitir sonido (zumbador de la D-F). Se concede aparte de la visual y caduca con ella. MUTE la quita sin apagar la pantalla
#define LUA_GRANT_TTL(param) ((uint8_t)((param) & 0xFF))
#define LUA_GRANT_CAPS(param) ((uint8_t)(((param) >> 8) & 0xFF))

// Estados de compañía · parámetro de MOOD. Espejan LuaAffectState en la app.
#define LUA_MOOD_SERENE 0x00  // IDLE_SERENE · respiración pautada y cola rítmica. Es el reposo de la mascota, no el REPOSO de la máquina de estados: aquí hay concesión viva
#define LUA_MOOD_CRAVING 0x01  // CRAVING_SNACK · hay un premio desbloqueado sin gastar. Antojo, no hambre: la mascota no se deteriora si nadie la atiende (§10.3)
#define LUA_MOOD_PURRING 0x02  // PURRING_LOVE · respuesta a la caricia. La MISMA en las dos superficies: se toque el cristal o se toque la tableta
#define LUA_MOOD_EATING 0x03  // EATING_SNACK · se está comiendo el premio
#define LUA_MOOD_CELEBRATING 0x04  // CELEBRATE_AWARD · celebra un hito ya ganado. No sustituye a CELEBRATE: este viene del hub, aquel del cierre del ejercicio

// Ranuras del armario · byte ALTO del parámetro de ACCESSORY.
#define LUA_SLOT_HEAD 0x00  // entre las orejas: flor, gorro
#define LUA_SLOT_NECK 0x01  // bajo la barbilla: pajarita, cascabel
#define LUA_ACCESSORY_NONE 0xFF  // byte bajo: quita lo que hubiera
#define LUA_ACCESSORY_ITEM(param) ((uint8_t)((param) & 0xFF))
#define LUA_ACCESSORY_SLOT(param) ((uint8_t)(((param) >> 8) & 0xFF))

// Operaciones de SAFE
#define LUA_SAFE_CLINICAL_SILENCE 0x01  // revoca toda concesión y bloquea nuevas. NO se toca: es el cierre total, y es el que cubre que alguien traiga el aparato a una medición que nadie planeó
#define LUA_SAFE_UNLOCK 0x02  // levanta el bloqueo Y el silencio sonoro; requiere comando explícito y devuelve a REPOSO, nunca a ACTIVA
#define LUA_SAFE_MUTE 0x03  // quita SOLO la capacidad sonora y deja viva la visual: la gata sigue dibujando. Pega hasta un UNLOCK explícito, así que un GRANT posterior tampoco puede devolver el sonido. Para «que no se vea nada» está CLINICAL_SILENCE

// Modos publicados en STATE
#define LUA_MODE_REST 0x00  // estado seguro y por omisión
#define LUA_MODE_ACTIVE 0x01  // solo con concesión viva
#define LUA_MODE_LOCKED 0x02  // silencio clínico

// Límites de la máquina de estados
#define LUA_GRANT_MAX_S 60
#define LUA_HEARTBEAT_S 10
