#!/usr/bin/env node
// ============================================================================
// Valeria+ · Presupuesto de las capas de revelación
//
//   node scripts/check-ar-reveal-layers.js
//
// Los 15 GLB de assets/models/ (7 de ejercicio + 8 de revelación) pesan
// estrictamente menos de 100 KB (102400 B) y exponen, como único clip, la
// animación que declara el enum ArModel. Las 7 entradas originales de ese
// enum tienen que seguir escritas igual.
// ============================================================================
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MODELS_DIR = path.join(ROOT, 'assets', 'models');
const SCENE_KT = path.join(
  ROOT, 'android-native', 'valeria-ar', 'src', 'main', 'java',
  'eu', 'futureforkids', 'valeria', 'ar', 'scene', 'SceneHost.kt',
);
const MAX_BYTES = 102400;

const EXPECTED = [
  { file: 'coche.glb', animation: 'celebrate', enumName: 'CAR' },
  { file: 'perro.glb', animation: 'celebrate', enumName: 'DOG' },
  { file: 'manzana.glb', animation: 'spin360', enumName: 'APPLE' },
  { file: 'pelota.glb', animation: 'spin360', enumName: 'BALL' },
  { file: 'zapato.glb', animation: 'spin360', enumName: 'SHOE' },
  { file: 'lua.glb', animation: 'celebrate', enumName: 'LUA' },
  { file: 'pez.glb', animation: 'spin360', enumName: 'FISH' },
  { file: 'lua_v5_body.glb', animation: 'celebrate', enumName: 'LUA_V5_BODY' },
  { file: 'set_camino.glb', animation: 'flow', enumName: 'SET_CAMINO' },
  { file: 'set_sonido.glb', animation: 'resonate', enumName: 'SET_SONIDO' },
  { file: 'set_rampas.glb', animation: 'roll', enumName: 'SET_RAMPAS' },
  { file: 'set_soplo.glb', animation: 'spin_rotor', enumName: 'SET_SOPLO' },
  { file: 'set_puente.glb', animation: 'balance', enumName: 'SET_PUENTE' },
  { file: 'set_jardin.glb', animation: 'bloom', enumName: 'SET_JARDIN' },
  { file: 'set_oficios.glb', animation: 'celebrate', enumName: 'SET_OFICIOS' },
];

const ORIGINAL_LINES = [
  'CAR("models/coche.glb", "celebrate"),',
  'DOG("models/perro.glb", "celebrate"),',
  'APPLE("models/manzana.glb", "spin360"),',
  'BALL("models/pelota.glb", "spin360"),',
  'SHOE("models/zapato.glb", "spin360"),',
  'LUA("models/lua.glb", "celebrate"),',
  'FISH("models/pez.glb", "spin360"),',
];

const OFICIOS_NODES = ['policia', 'bomberos', 'hospital', 'trenes'];

function readGlb(file) {
  const buf = fs.readFileSync(file);
  if (buf.toString('ascii', 0, 4) !== 'glTF') throw new Error('no empieza por la firma glTF');
  if (buf.readUInt32LE(4) !== 2) throw new Error('no es glTF 2.0');
  const jsonLength = buf.readUInt32LE(12);
  if (buf.toString('ascii', 16, 20) !== 'JSON') throw new Error('el primer chunk no es JSON');
  const json = JSON.parse(buf.toString('utf8', 20, 20 + jsonLength));
  const binHeader = 20 + jsonLength;
  if (buf.toString('ascii', binHeader + 4, binHeader + 8) !== 'BIN\0') {
    throw new Error('el segundo chunk no es BIN');
  }
  const binLength = buf.readUInt32LE(binHeader);
  const bin = buf.subarray(binHeader + 8, binHeader + 8 + binLength);
  return { json, bin };
}

function readScalarFloats(glb, accessorIndex) {
  const accessor = glb.json.accessors[accessorIndex];
  const view = glb.json.bufferViews[accessor.bufferView];
  if (!accessor || accessor.type !== 'SCALAR' || accessor.componentType !== 5126) {
    throw new Error('el sampler de tiempo no es un SCALAR FLOAT');
  }
  const start = (view.byteOffset || 0) + (accessor.byteOffset || 0);
  const values = [];
  for (let i = 0; i < accessor.count; i++) values.push(glb.bin.readFloatLE(start + i * 4));
  return values;
}

function readKotlinContract(source) {
  const enumBody = source.match(/enum class ArModel\([\s\S]*?\n\}/);
  if (!enumBody) throw new Error('No se pudo leer el enum ArModel.');
  const entries = [];
  // [A-Z0-9_]: LUA_V5_BODY lleva un dígito. El patrón de check-ar-models.js
  // es [A-Z_]+ y por eso no llega a leer esa entrada.
  const re = /^\s{4}([A-Z0-9_]+)\("([^"]*)",\s*(null|"([^"]*)")\),/gm;
  let m;
  while ((m = re.exec(enumBody[0])) !== null) {
    entries.push({ name: m[1], asset: m[2], animation: m[4] ?? null });
  }
  return entries;
}

function main() {
  const problems = [];
  const onDisk = fs.readdirSync(MODELS_DIR).filter((name) => name.endsWith('.glb')).sort();
  const expectedNames = EXPECTED.map((row) => row.file).sort();
  if (onDisk.length !== 15 || onDisk.join('\n') !== expectedNames.join('\n')) {
    problems.push(
      `assets/models/ debe contener exactamente estos 15 GLB y contiene [${onDisk.join(', ')}]`,
    );
  }

  const kotlin = fs.readFileSync(SCENE_KT, 'utf8');
  for (const line of ORIGINAL_LINES) {
    if (!kotlin.includes(line)) problems.push(`entrada original alterada o ausente: ${line}`);
  }
  let contract;
  try {
    contract = readKotlinContract(kotlin);
  } catch (e) {
    problems.push(e.message);
    contract = [];
  }

  console.log('Capas de revelación y modelos de ejercicio (< 102400 B):\n');
  for (const row of EXPECTED) {
    const file = path.join(MODELS_DIR, row.file);
    const entry = contract.find((item) => item.name === row.enumName);
    if (!entry) {
      problems.push(`ArModel no declara ${row.enumName}`);
    } else if (path.basename(entry.asset) !== row.file || entry.animation !== row.animation) {
      problems.push(
        `${row.enumName} declara ${entry.asset} / ${entry.animation} y el contrato es ${row.file} / ${row.animation}`,
      );
    }

    if (!fs.existsSync(file)) {
      console.log(`  ✗ ${row.file} — NO EXISTE`);
      continue;
    }

    const bytes = fs.statSync(file).size;
    let glb;
    try {
      glb = readGlb(file);
    } catch (e) {
      problems.push(`${row.file}: ${e.message}`);
      console.log(`  ✗ ${row.file.padEnd(20)} ${e.message}`);
      continue;
    }
    const gltf = glb.json;

    const names = (gltf.animations || []).map((animation) => animation.name);
    let rowOk = true;
    if (bytes >= MAX_BYTES) {
      problems.push(`${row.file} pesa ${bytes} B (máximo estricto ${MAX_BYTES - 1} B)`);
      rowOk = false;
    }
    if (names.length !== 1 || names[0] !== row.animation) {
      problems.push(
        `${row.file} debe exponer exactamente ['${row.animation}'] y expone [${names.join(', ') || 'ninguna'}]`,
      );
      rowOk = false;
    }
    for (const animation of gltf.animations || []) {
      for (const channel of animation.channels || []) {
        const node = channel.target && channel.target.node;
        if (typeof node !== 'number' || node < 0 || node >= (gltf.nodes || []).length) {
          problems.push(`${row.file}: un canal de '${animation.name}' apunta a un nodo inexistente`);
          rowOk = false;
        }
      }
      for (const sampler of animation.samplers || []) {
        let times;
        try {
          times = readScalarFloats(glb, sampler.input);
        } catch (e) {
          problems.push(`${row.file}: ${e.message}`);
          rowOk = false;
          continue;
        }
        if (times.length < 2) {
          problems.push(`${row.file}: la animación '${animation.name}' no tiene claves de tiempo`);
          rowOk = false;
          continue;
        }
        for (let i = 1; i < times.length; i++) {
          if (!(times[i] > times[i - 1])) {
            problems.push(`${row.file}: el tiempo de '${animation.name}' no es estrictamente creciente`);
            rowOk = false;
            break;
          }
        }
      }
    }
    if (row.file === 'set_oficios.glb') {
      const nodes = new Set((gltf.nodes || []).map((node) => node.name));
      for (const name of OFICIOS_NODES) {
        if (!nodes.has(name)) {
          problems.push(`set_oficios.glb no tiene el nodo '${name}'`);
          rowOk = false;
        }
      }
    }

    console.log(
      `  ${rowOk ? '✓' : '✗'} ${row.file.padEnd(20)} ${String(bytes).padStart(7)} B · animación '${names.join(', ') || '—'}'`,
    );
  }

  if (problems.length) {
    console.error(`\n✗ ${problems.length} problema(s) en las capas de revelación:`);
    problems.forEach((problem) => console.error(`  · ${problem}`));
    process.exit(1);
  }
  console.log('\n✓ Los 15 GLB pesan menos de 100 KB y exponen su animación exacta.');
}

if (require.main === module) main();
