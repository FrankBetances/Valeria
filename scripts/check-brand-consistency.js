// Gate de marca: la mascota es Lúa y el oso está retirado.
//
// Existe porque la migración se dio por terminada TRES veces estando a medias:
// primero quedaron los PNG de icono y splash, luego el fichero y el componente
// del distractor, y por último el texto LOCUTADO de las consignas —la app decía
// "oso distractor" en voz alta con la gata en pantalla—. Cada capa la encontró
// Frank, no el que decía "listo".
//
// Distingue marca de contenido: "oso" es vocabulario terapéutico legítimo (par
// mínimo ocho/oso, "EL OSO COME PAN", la orden TPR, hartza en euskera) y no se
// toca. Lo que este gate persigue son los identificadores y el copy de MARCA.
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const fail = [];

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : [p];
}).filter((p) => /\.tsx?$/.test(p));

const files = walk(SRC);

// 1 · Identificadores de la mascota retirada.
for (const f of files) {
  const rel = path.relative(path.join(__dirname, '..'), f);
  if (/DistractorBear|BearMark/.test(path.basename(f))) {
    fail.push(`${rel}: el fichero lleva el nombre de la mascota retirada.`);
  }
  const src = fs.readFileSync(f, 'utf8');
  // Se ignoran las líneas de comentario que documentan la migración a propósito.
  src.split('\n').forEach((line, i) => {
    if (/^\s*(\/\/|\*)/.test(line)) return;
    if (/\bBearMark\b|\bValeriaDistractorBear\b/.test(line)) {
      fail.push(`${rel}:${i + 1}: identificador de la mascota retirada.`);
    }
  });
}

// 2 · Copy del distractor en los bancos y en i18n, en las cuatro variedades.
//    Es el que más veces se ha quedado atrás porque además va sintetizado a voz.
const BRAND_COPY = [
  [/Oso\s+Distractor|oso\s+distractor/, 'es/gl · "Oso Distractor"'],
  [/Hartz\s+Distraitzailea/, 'eu · "Hartz Distraitzailea"'],
  [/Distractor\s+Bear|distractor\s+bear/, 'en · "Distractor Bear"'],
];
for (const f of files) {
  const rel = path.relative(path.join(__dirname, '..'), f);
  const src = fs.readFileSync(f, 'utf8');
  src.split('\n').forEach((line, i) => {
    if (/^\s*(\/\/|\*)/.test(line)) return;
    for (const [re, what] of BRAND_COPY) {
      if (re.test(line)) fail.push(`${rel}:${i + 1}: copy de la mascota retirada — ${what}.`);
    }
  });
}

// 3 · El distractor tiene que pintar la mascota vigente, no un segundo personaje.
const distractor = files.find((f) => /Distractor(Cat|Bear|Pet)\.tsx$/.test(path.basename(f)));
if (!distractor) {
  fail.push('No encuentro el componente del distractor de doble tarea.');
} else if (!/CatPixel/.test(fs.readFileSync(distractor, 'utf8'))) {
  fail.push(`${path.relative(path.join(__dirname, '..'), distractor)}: el distractor no pinta CatPixel.`);
}

// 4 · Los assets de marca se generan del sprite; el generador no puede faltar.
for (const need of ['scripts/build-brand-assets.js', 'src/ValeriaCatPixel.tsx']) {
  if (!fs.existsSync(path.join(__dirname, '..', need))) fail.push(`Falta ${need}.`);
}

if (fail.length) {
  console.error(`\n✖ La migración de la mascota está a medias (${fail.length}):\n`);
  fail.forEach((f) => console.error('  · ' + f));
  console.error(`
La mascota es Lúa (src/ValeriaCatPixel.tsx). El oso se retiró como MARCA; sigue
siendo vocabulario terapéutico y eso no se toca.

Si has cambiado copy que la app LOCUTA, corre además:
  node scripts/export-voice-corpus.js
en el MISMO commit, o el gate del corpus de voz cortará el build.\n`);
  process.exit(1);
}

console.log(`Marca coherente: ${files.length} ficheros, sin rastro de la mascota retirada.`);
