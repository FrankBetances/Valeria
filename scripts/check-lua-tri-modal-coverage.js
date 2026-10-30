#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Cobertura tri-modal de las 28 actividades
 *   node scripts/check-lua-tri-modal-coverage.js
 *
 * La misma exigencia que check-steam-manifests.js: 28 actividades
 * (6 LUA_SOLO + 11 SET_SOLO + 11 SET_WITH_LUA), validator, ObservationReplay
 * (positiva, negativa, oclusión) y AdultText es/en/ca/gl sin términos
 * prohibidos. No está en verde si faltan luaSolo.ts o s0–s6.
 * ========================================================================== */
const { assertFullCatalog } = require('./check-steam-manifests.js');

assertFullCatalog();
