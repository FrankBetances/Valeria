#!/usr/bin/env node
// ============================================================================
// Valeria+ · Descarga verificada del modelo de señal facial (bloque de RA)
//
//   npm run fetch:ar-model            (idempotente: si ya está y cuadra, no baja nada)
//   npm run fetch:ar-model -- --force (vuelve a bajarlo aunque exista)
//
// El bundle `face_landmarker.task` (3,6 MB) es de Google y se distribuye bajo
// Apache 2.0. Va versionado en el repositorio —igual que el resto de assets
// pesados del proyecto— para que un clon recién hecho compile sin pasos
// extra. Este script existe para dos cosas distintas de descargarlo:
//
//   1. **Dejar registrado de dónde salió.** La URL apunta a la revisión FIJADA
//      (`/float16/1/`), no a `latest`: un modelo que cambia bajo los pies
//      cambia las medidas, y este módulo produce datos destinados a publicarse.
//   2. **Verificar la integridad** con SHA-256 antes de dar nada por bueno. Un
//      binario truncado no falla al compilar: falla en el teléfono de una
//      familia, a mitad de sesión.
// ============================================================================
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Revisión fijada del catálogo de MediaPipe Tasks. Si alguna vez hay que subir
// de versión, se cambian URL y hash A LA VEZ y se vuelve a correr la Fase 0:
// los umbrales de las sondas se calibraron contra ESTE modelo.
const MODEL = {
  url: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  sha256: '64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff',
  bytes: 3758596,
  dest: path.join(__dirname, '..', 'android-native', 'valeria-ar', 'src', 'main', 'assets', 'face_landmarker.task'),
};

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');

function verify(file) {
  if (!fs.existsSync(file)) return { ok: false, reason: 'no existe' };
  const data = fs.readFileSync(file);
  if (data.length !== MODEL.bytes) return { ok: false, reason: `${data.length} B, se esperaban ${MODEL.bytes}` };
  const digest = sha256(data);
  if (digest !== MODEL.sha256) return { ok: false, reason: `SHA-256 ${digest.slice(0, 16)}… no coincide` };
  return { ok: true };
}

function download(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('demasiadas redirecciones'));
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(download(res.headers.location, redirects + 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} al descargar el modelo`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const force = process.argv.includes('--force');
  const current = verify(MODEL.dest);

  if (current.ok && !force) {
    console.log('✓ face_landmarker.task ya presente y verificado (SHA-256 correcto).');
    return;
  }
  if (!current.ok && fs.existsSync(MODEL.dest)) {
    console.log(`⚠ El modelo presente no es el esperado (${current.reason}). Se vuelve a descargar.`);
  }

  console.log(`Descargando ${MODEL.url}`);
  const data = await download(MODEL.url);

  const digest = sha256(data);
  if (digest !== MODEL.sha256) {
    throw new Error(
      `SHA-256 inesperado.\n  esperado: ${MODEL.sha256}\n  obtenido: ${digest}\n` +
      'No se escribe nada: el modelo del catálogo ha cambiado o la descarga vino corrupta.',
    );
  }

  fs.mkdirSync(path.dirname(MODEL.dest), { recursive: true });
  fs.writeFileSync(MODEL.dest, data);
  console.log(`✓ Escrito en ${path.relative(process.cwd(), MODEL.dest)} (${data.length} B, SHA-256 verificado).`);
}

if (require.main === module) {
  main().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}

module.exports = { MODEL, verify };
