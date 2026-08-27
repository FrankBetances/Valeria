// ============================================================================
// Valeria+ · Gate · la gata de la tableta y la del aparato son la misma
//
//   node scripts/check-lua-mascot-mirror.js
//
// El gate del sprite (`lua-firmware/tools/check-sprite-parity.js`) compara el
// DIBUJO. Este compara el COMPORTAMIENTO y el guardarropa, que es por donde se
// separaron de verdad: la tableta aprendió a ronronear, a comer y a llevar
// puesta una flor, y el aparato —que también responde al dedo desde la V2— no
// se enteró de nada de eso. Dos mascotas con la misma cara haciendo cosas
// distintas es peor que dos mascotas distintas, porque no se nota.
//
// Comprueba cinco cosas, todas ellas dentro de este repositorio, que es donde
// se decide (§3 del CLAUDE.md de lua-firmware: allí hay copias, no fuentes):
//
//   1. Cada `LuaAffectState` tiene su código en `MOOD`, y al revés. Ninguno de
//      los dos lados puede crecer solo.
//   2. `mirrorIndex` es append-only. Reordenar el catálogo le pone a la gata
//      del aparato ya flasheado el gorro del vecino.
//   3. Todo lo que se lleva puesto tiene dibujo Y anclaje para la pose del
//      aparato. Un accesorio sin `device` es uno que en el cristal no existe.
//   4. La rotación de caricias son índices de `AFFECT` válidos (0-7).
//   5. Las tramas salen de cuatro bytes, con su versión y su opcode.
//   6. Toda insignia del catálogo de gamificación resuelve a un índice REAL de
//      `AWARD_GLYPH_KEYS` y `AWARD_TIER_KEYS`, y esas dos listas son
//      append-only. Un glifo mal escrito no rompe nada aquí —`luaAwardFrame`
//      devuelve `null` a propósito, antes que enseñar otra insignia— así que
//      sin este gate el premio se quedaría fuera del cristal en silencio.
// ============================================================================
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-lua-mirror-'));

let fallos = 0;
const fallo = (msg) => { fallos += 1; console.error('  ✖ ' + msg); };

// El orden en que los coleccionables entraron en el enlace. Se AÑADE al final
// y no se toca nada de lo de arriba: un aparato ya flasheado se queda con los
// índices que tenga, igual que con los opcodes y los pictogramas.
// Lo mismo para las insignias: los dos ejes del parámetro de `AWARD`. El glifo
// va en el byte bajo y el rango en el alto, y los dos son POSICIONES en estas
// listas, que es lo que el aparato lleva flasheado. Los DIBUJOS pueden cambiar
// —Valeria+ redibujó los nueve el 25/8/2026 y el aparato lo agradeció— pero el
// orden no: reordenar le pone al niño la insignia del vecino.
const GLIFOS_CONGELADOS = ['flame', 'paw', 'star', 'sunrise', 'moon', 'home', 'yarn', 'heart', 'crown'];
const RANGOS_CONGELADOS = ['bronze', 'silver', 'gold', 'teal', 'violet'];

const INDICES_CONGELADOS = [
  'snack_fish',    // 0
  'neck_red_bow',  // 1
  'head_flower',   // 2
  'neck_bell',     // 3
  'head_wizard',   // 4
];

try {
  const entradas = [
    path.join(ROOT, 'src', 'valeriaLuaMascot.ts'),
    path.join(ROOT, 'src', 'types', 'valeriaLua.ts'),
    path.join(ROOT, 'src', 'valeriaLuaProtocol.ts'),
    path.join(ROOT, 'src', 'ValeriaPixelArt.ts'),
  ];
  try {
    execSync(
      ['npx tsc', ...entradas.map((e) => JSON.stringify(e)),
        '--module commonjs', '--target es2020', '--moduleResolution node',
        // `--jsx` porque `valeriaLuaMascot` importa los TIPOS del catálogo de
        // insignias y ese fichero cuelga de un `.tsx`. El import es `import
        // type`, así que se borra al emitir y aquí no entra ni React ni el
        // componente: lo único que hacía falta era que tsc supiera leerlo.
        '--jsx', 'react',
        '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp)].join(' '),
      { cwd: ROOT, stdio: 'inherit' },
    );
  } catch {
    // Un estado de compañía nuevo en el tipo y no en la tabla no llega ni a
    // compilar, porque `LUA_MOOD_OF_AFFECT` es un `Record` del tipo entero.
    // Eso ya es la comprobación 1; lo que aquí falta es DECIRLO.
    console.error('  ✖ los módulos del espejo no compilan (mira el error de tsc de arriba)');
    console.error('    Suele ser un LuaAffectState nuevo sin su entrada en LUA_MOOD_OF_AFFECT,');
    console.error('    o una insignia de BADGES con un glifo o un rango que no está en el arte.');
    process.exit(1);
  }

  const mascot = require(path.join(tmp, 'valeriaLuaMascot.js'));
  const tipos = require(path.join(tmp, 'types', 'valeriaLua.js'));
  const proto = require(path.join(tmp, 'valeriaLuaProtocol.js'));

  // ── 1. estados de compañía ────────────────────────────────────────────────
  // El enum de TS no existe en tiempo de ejecución, así que se lee del fuente:
  // es la única forma de cazar el estado que alguien añade al tipo y no mapea.
  const fuente = fs.readFileSync(path.join(ROOT, 'src', 'types', 'valeriaLua.ts'), 'utf8');
  const bloque = fuente.match(/export type LuaAffectState =([\s\S]*?);/);
  if (!bloque) fallo('no encuentro el tipo LuaAffectState en types/valeriaLua.ts');
  const estados = bloque ? [...bloque[1].matchAll(/'([A-Z_]+)'/g)].map((m) => m[1]) : [];

  const mapa = mascot.LUA_MOOD_OF_AFFECT;
  for (const e of estados) {
    if (mapa[e] === undefined) {
      fallo(`el estado ${e} no tiene código de MOOD: en el aparato no existe`);
    }
  }
  const codigos = Object.values(proto.LUA_MOOD);
  for (const c of codigos) {
    if (!Object.values(mapa).includes(c)) {
      fallo(`el código MOOD ${c} no lo produce ningún LuaAffectState`);
    }
  }
  if (new Set(Object.values(mapa)).size !== Object.values(mapa).length) {
    fallo('dos estados de compañía comparten código de MOOD');
  }
  if (estados.length !== codigos.length) {
    fallo(`${estados.length} estados en la app y ${codigos.length} en protocol.json`);
  }

  // ── 2. índices que no se reordenan ────────────────────────────────────────
  const catalogo = tipos.COLLECTIBLES_CATALOG;
  for (const [i, id] of INDICES_CONGELADOS.entries()) {
    const item = catalogo.find((c) => c.id === id);
    if (!item) {
      fallo(`el coleccionable ${id} (índice ${i}) ha desaparecido del catálogo`);
    } else if (item.mirrorIndex !== i) {
      fallo(`${id} tenía el índice ${i} y ahora tiene el ${item.mirrorIndex}`);
    }
  }
  const vistos = new Set();
  for (const c of catalogo) {
    if (typeof c.mirrorIndex !== 'number' || c.mirrorIndex < 0 || c.mirrorIndex > 254) {
      fallo(`${c.id} tiene un mirrorIndex fuera de 0-254 (255 es «ninguno»)`);
    }
    if (vistos.has(c.mirrorIndex)) fallo(`el índice ${c.mirrorIndex} está repetido (${c.id})`);
    vistos.add(c.mirrorIndex);
    if (c.mirrorIndex >= INDICES_CONGELADOS.length && !INDICES_CONGELADOS.includes(c.id)) {
      // Un ítem nuevo es legítimo; lo que no lo es es que se olvide aquí.
      fallo(`${c.id} es nuevo: añádelo AL FINAL de INDICES_CONGELADOS en este gate`);
    }
  }

  // ── 3. lo que se lleva puesto se dibuja en las dos superficies ────────────
  const segmentos = fs.readFileSync(
    path.join(ROOT, 'src', 'components', 'lua', 'luaPixelSegments.ts'), 'utf8');
  for (const c of catalogo) {
    const sprite = segmentos.match(
      new RegExp(`${c.id}:\\s*\\{([\\s\\S]*?)\\n  \\},`));
    if (!sprite) {
      fallo(`${c.id} no tiene dibujo en luaPixelSegments.ts`);
      continue;
    }
    if (c.slot === 'snack') continue;  // no se lleva puesto: no va al cristal
    if (!/device:\s*\{\s*row:\s*\d+,\s*col:\s*\d+\s*\}/.test(sprite[1])) {
      fallo(`${c.id} se lleva puesto y no tiene anclaje «device»: en el aparato no se pintaría`);
    }
  }

  // ── 4. la rotación de caricias ────────────────────────────────────────────
  const rotacion = mascot.LUA_CARESS_AFFECTS;
  if (!Array.isArray(rotacion) || rotacion.length === 0) {
    fallo('LUA_CARESS_AFFECTS está vacía: la caricia no tendría respuesta');
  }
  for (const a of rotacion) {
    if (!Number.isInteger(a) || a < 0 || a > 7) {
      fallo(`la caricia responde con AFFECT(${a}), y AFFECT solo llega a 7`);
    }
  }

  // ── 5. las tramas ─────────────────────────────────────────────────────────
  const inventario = tipos.createDefaultLuaInventory();
  inventario.equipped.head = 'head_flower';
  const tramas = [
    ...mascot.luaCaressFrames(0),
    ...mascot.luaFeedFrames(),
    ...mascot.luaMascotSnapshot(inventario, 'PURRING_LOVE'),
  ];
  for (const t of tramas) {
    if (t.length !== 4) fallo(`una trama mide ${t.length} bytes y CTRL son 4`);
    if (t[0] !== proto.LUA_PROTOCOL_VERSION) fallo('una trama lleva otra versión de protocolo');
    if (!Object.values(proto.LUA_OP).includes(t[1])) fallo(`opcode desconocido ${t[1]} en una trama`);
  }
  // El accesorio de la cabeza tiene que viajar con su índice y su ranura, y el
  // del cuello tiene que viajar VACÍO: mandar solo lo que cambió deja puesto lo
  // de antes en cuanto se pierde una trama, y CTRL no confirma nada.
  const [cabeza, cuello] = mascot.luaAccessoryFrames(inventario);
  if (cabeza[2] !== 2 || cabeza[3] !== proto.LUA_SLOT.HEAD) {
    fallo('la trama de la flor no lleva su índice y su ranura');
  }
  if (cuello[2] !== proto.LUA_ACCESSORY_NONE || cuello[3] !== proto.LUA_SLOT.NECK) {
    fallo('la ranura vacía del cuello no se manda: el aparato se quedaría con lo de antes');
  }
  // ── 6. el premio de la sesión llega al cristal ────────────────────────────
  // `valeriaGamification` arrastra AsyncStorage, que en Node no existe, así que
  // el catálogo se lee del fuente. Es la misma técnica que la comprobación 1.
  const arte = require(path.join(tmp, 'ValeriaPixelArt.js'));
  const glifos = arte.AWARD_GLYPH_KEYS;
  const rangos = arte.AWARD_TIER_KEYS;

  GLIFOS_CONGELADOS.forEach((k, i) => {
    if (glifos[i] !== k) fallo(`el glifo ${i} era «${k}» y ahora es «${glifos[i]}»`);
  });
  RANGOS_CONGELADOS.forEach((k, i) => {
    if (rangos[i] !== k) fallo(`el rango ${i} era «${k}» y ahora es «${rangos[i]}»`);
  });
  if (glifos.length < GLIFOS_CONGELADOS.length) {
    fallo(`había ${GLIFOS_CONGELADOS.length} glifos y ahora hay ${glifos.length}: se añade al final, no se quita`);
  }
  if (rangos.length !== RANGOS_CONGELADOS.length) {
    fallo(`los rangos han pasado de ${RANGOS_CONGELADOS.length} a ${rangos.length}`);
  }

  const juego = fs.readFileSync(path.join(ROOT, 'src', 'valeriaGamification.ts'), 'utf8');
  const catalogoInsignias = juego.match(/export const BADGES: Badge\[\] = \[([\s\S]*?)\n\];/);
  if (!catalogoInsignias) fallo('no encuentro el catálogo BADGES en valeriaGamification.ts');
  const insignias = catalogoInsignias
    ? [...catalogoInsignias[1].matchAll(
        /id:\s*'([^']+)',\s*glyph:\s*'([^']+)',\s*tier:\s*'([^']+)'/g)]
      .map((m) => ({ id: m[1], glyph: m[2], tier: m[3] }))
    : [];
  if (insignias.length === 0) fallo('el catálogo BADGES no ha dado ni una insignia: ¿ha cambiado el formato?');
  for (const b of insignias) {
    if (!glifos.includes(b.glyph)) {
      fallo(`la insignia «${b.id}» usa el glifo «${b.glyph}», que no está en AWARD_GLYPH_KEYS`);
    }
    if (!rangos.includes(b.tier)) {
      fallo(`la insignia «${b.id}» usa el rango «${b.tier}», que no está en AWARD_TIER_KEYS`);
    }
    const trama = mascot.luaAwardFrame(b);
    if (!trama) {
      fallo(`la insignia «${b.id}» no produce trama: en el cristal no existiría`);
      continue;
    }
    if (trama.length !== 4 || trama[1] !== proto.LUA_OP.AWARD) {
      fallo(`la trama de «${b.id}» no es un AWARD de cuatro bytes`);
    }
    if (trama[2] !== glifos.indexOf(b.glyph) || trama[3] !== rangos.indexOf(b.tier)) {
      fallo(`la trama de «${b.id}» no lleva glifo en el byte bajo y rango en el alto`);
    }
  }

  // El desfile entero, con el reparto de CELEBRATE que manda la tabla:
  // 0 cierre · 1 subida de nivel · 2 insignia.
  const premio = (extra) => ({
    xpGained: 0, xpTotal: 0, streak: 1, streakExtended: true, level: 3,
    levelUp: false, levelName: '', newBadges: [], perfect: false, ...extra,
  });
  const seco = mascot.luaSessionRewardFrames(premio({}));
  if (seco.length !== 1 || seco[0][2] !== 0) {
    fallo('una sesión sin premio tendría que ser un CELEBRATE(0) y nada más');
  }
  const subida = mascot.luaSessionRewardFrames(premio({ levelUp: true, level: 7 }));
  if (subida.length !== 2 || subida[0][2] !== 1 || subida[1][1] !== proto.LUA_OP.LEVEL
      || subida[1][2] !== 7) {
    fallo('una subida de nivel tendría que ser CELEBRATE(1) y LEVEL(7)');
  }
  const conInsignia = mascot.luaSessionRewardFrames(
    premio({ levelUp: true, level: 99, newBadges: [insignias[0]] }));
  if (conInsignia[0][2] !== 2) fallo('una insignia nueva tendría que ser CELEBRATE(2)');
  if (conInsignia[1][2] !== mascot.LUA_LEVEL_MAX) {
    fallo(`el nivel 99 tendría que recortarse a ${mascot.LUA_LEVEL_MAX}: el firmware ignora lo que se salga`);
  }
  if (conInsignia.length !== 3 || conInsignia[2][1] !== proto.LUA_OP.AWARD) {
    fallo('la insignia no va detrás del nivel en el desfile');
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (fallos > 0) {
  console.error(`\n✗ La mascota de la tableta y la del aparato se han separado (${fallos}).`);
  process.exit(1);
}
console.log('✓ Una sola Lúa: estados de compañía, armario e índices espejados en el aparato.');
