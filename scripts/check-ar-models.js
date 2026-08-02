#!/usr/bin/env node
// ============================================================================
// Valeria+ · Verificación del contrato de assets del bloque de RA
//
//   npm run check:ar-models
//
// No valida el formato glTF —de eso ya se encarga el validador de Khronos—:
// valida el CONTRATO, que es lo que se rompe de verdad en un proyecto vivo.
//
// El fallo que este script existe para atrapar: alguien reexporta `perro.glb`
// desde Blender, la animación sale llamada `Celebrate` o `Armature|celebrate`,
// el APK compila, la escena carga el modelo... y el perro no celebra nunca.
// Un refuerzo que no aparece no es un bug visible: es un ejercicio que deja de
// ser terapéutico sin que salte ninguna alarma.
//
// Cinco comprobaciones:
//   1. Están los cinco modelos que el enum ArModel de Kotlin declara.
//   2. Cada uno expone EXACTAMENTE la animación que su ejercicio invoca.
//   3. La ruta del asset en Kotlin coincide con el fichero real.
//   4. Ninguno supera el presupuesto de 2 MB del contrato.
//   5. El modelo de señal facial está presente y con su SHA-256 correcto.
// ============================================================================
'use strict';

const fs = require('fs');
const path = require('path');
const { verify: verifySignalModel, MODEL: SIGNAL_MODEL } = require('./fetch-ar-model');

const ROOT = path.join(__dirname, '..');
const MODELS_DIR = path.join(ROOT, 'assets', 'models');
const SCENE_KT = path.join(
  ROOT, 'android-native', 'valeria-ar', 'src', 'main', 'java',
  'eu', 'futureforkids', 'valeria', 'ar', 'scene', 'SceneHost.kt',
);
const MAX_BYTES = 2 * 1024 * 1024;

/** Lee el enum ArModel de Kotlin: es la fuente de verdad, no una copia aquí. */
function readKotlinContract() {
  const source = fs.readFileSync(SCENE_KT, 'utf8');
  const enumBody = source.match(/enum class ArModel\([\s\S]*?\n\}/);
  if (!enumBody) throw new Error(`No se pudo leer el enum ArModel en ${path.relative(ROOT, SCENE_KT)}`);

  const entries = [];
  const re = /^\s{4}([A-Z_]+)\("([^"]*)",\s*(null|"([^"]*)")\),/gm;
  let m;
  while ((m = re.exec(enumBody[0])) !== null) {
    entries.push({ name: m[1], asset: m[2], animation: m[4] ?? null });
  }
  if (!entries.length) throw new Error('El enum ArModel no declaró ninguna entrada legible.');
  return entries;
}

/** Extrae el trozo JSON de un .glb sin cargar el binario entero en memoria. */
function readGlbJson(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const header = Buffer.alloc(20);
    fs.readSync(fd, header, 0, 20, 0);
    if (header.toString('ascii', 0, 4) !== 'glTF') throw new Error('no empieza por la firma glTF');
    if (header.readUInt32LE(4) !== 2) throw new Error('no es glTF 2.0');
    const jsonLength = header.readUInt32LE(12);
    if (header.toString('ascii', 16, 20) !== 'JSON') throw new Error('el primer chunk no es JSON');
    const json = Buffer.alloc(jsonLength);
    fs.readSync(fd, json, 0, jsonLength, 20);
    return JSON.parse(json.toString('utf8'));
  } finally {
    fs.closeSync(fd);
  }
}

function main() {
  const problems = [];
  const contract = readKotlinContract().filter((e) => e.asset);

  console.log('Modelos 3D declarados en ArModel (Kotlin):\n');
  for (const entry of contract) {
    // El enum los nombra "models/coche.glb" porque así los ve Android; en el
    // repositorio la carpeta canónica es assets/models/.
    const file = path.join(MODELS_DIR, path.basename(entry.asset));
    const rel = path.relative(ROOT, file);

    if (!fs.existsSync(file)) {
      problems.push(`${entry.name}: falta ${rel} (npm run build:ar-models)`);
      console.log(`  ✗ ${entry.name.padEnd(7)} ${rel} — NO EXISTE`);
      continue;
    }

    const bytes = fs.statSync(file).size;
    let gltf;
    try {
      gltf = readGlbJson(file);
    } catch (e) {
      problems.push(`${entry.name}: ${rel} no es un glb legible (${e.message})`);
      console.log(`  ✗ ${entry.name.padEnd(7)} ${rel} — ${e.message}`);
      continue;
    }

    const animations = (gltf.animations || []).map((a) => a.name);
    const notes = [];
    let rowOk = true;

    if (bytes > MAX_BYTES) {
      problems.push(`${entry.name}: ${rel} pesa ${bytes} B (máximo ${MAX_BYTES} B)`);
      rowOk = false;
    }
    if (entry.animation && !animations.includes(entry.animation)) {
      problems.push(
        `${entry.name}: el código invoca la animación '${entry.animation}' y ${rel} expone ` +
        `[${animations.join(', ') || 'ninguna'}]`,
      );
      notes.push(`FALTA la animación '${entry.animation}'`);
      rowOk = false;
    } else if (entry.animation) {
      notes.push(`animación '${entry.animation}'`);
    } else {
      notes.push('sin animación exigida');
    }

    console.log(
      `  ${rowOk ? '✓' : '✗'} ${entry.name.padEnd(7)} ${path.basename(entry.asset).padEnd(12)} ` +
      `${String(bytes).padStart(7)} B · ${notes.join(' · ')} · animaciones: [${animations.join(', ')}]`,
    );
  }

  console.log('\nModelo de señal facial (MediaPipe):');
  const signal = verifySignalModel(SIGNAL_MODEL.dest);
  if (signal.ok) {
    console.log(`  ✓ face_landmarker.task presente, ${SIGNAL_MODEL.bytes} B, SHA-256 verificado.`);
  } else {
    problems.push(`face_landmarker.task: ${signal.reason} (npm run fetch:ar-model)`);
    console.log(`  ✗ face_landmarker.task — ${signal.reason}`);
  }

  if (problems.length) {
    console.error(`\n✗ ${problems.length} problema(s) en el contrato de assets de RA:`);
    problems.forEach((p) => console.error(`  · ${p}`));
    process.exit(1);
  }
  console.log('\n✓ El contrato de assets de Realidad Aumentada se cumple.');
}

if (require.main === module) main();
