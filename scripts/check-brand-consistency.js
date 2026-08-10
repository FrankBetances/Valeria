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
  // Los comentarios cuentan. La cabecera de ValeriaWelcomeScreen siguió
  // describiendo al oso mucho después de que la pantalla pintara la gata:
  // saltarse los comentarios es justamente como sobrevivió.
  src.split('\n').forEach((line, i) => {
    if (/\bBearMark\b|\bValeriaDistractorBear\b|oso pardo|Osezno|Oso Legendario/i.test(line)) {
      fail.push(`${rel}:${i + 1}: rastro de la mascota retirada (los comentarios también cuentan).`);
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

// 5 · Las LÁMINAS. El código estaba limpio y el icono de iOS seguía siendo el
//     oso pardo: los PNG no los ve ningún grep, y build-brand-assets.js solo
//     escribía en assets/, así que ios-native/ se quedó atrás sin que nadie lo
//     notara. Un PNG desfasado no lo detecta leer el diff — hay que exigirlo.
const crypto = require('crypto');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const R = (p) => path.join(__dirname, '..', p);

const IOS_ICON = 'ios-native/Valeria/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png';
const BRAND_ASSETS = [
  'assets/icon.png', 'assets/adaptive-icon.png', 'assets/splash.png',
  'docs/lua-mascota.png', IOS_ICON,
];

// Láminas retiradas: si un fichero de marca vuelve a tener uno de estos
// contenidos, es que alguien restauró la lámina vieja.
const RETIRED = {
  '738dc8364559c1014ac84584d98ad22016df2240f90395ebba9fa8984c79f0db':
    'icono de iOS con la mascota anterior',
};

for (const a of BRAND_ASSETS) {
  if (!fs.existsSync(R(a))) { fail.push(`Falta el asset de marca ${a}.`); continue; }
  const h = sha(R(a));
  if (RETIRED[h]) fail.push(`${a}: es una LÁMINA RETIRADA (${RETIRED[h]}). Corre npm run build:brand.`);
}

// Los dos iconos de 1024 salen del mismo lienzo y del mismo sprite: si dejan de
// ser idénticos es que se regeneró uno y se olvidó el otro. Exactamente lo que
// pasó.
if (fs.existsSync(R('assets/icon.png')) && fs.existsSync(R(IOS_ICON))
    && sha(R('assets/icon.png')) !== sha(R(IOS_ICON))) {
  fail.push('El icono de Android y el de iOS no coinciden: se regeneró uno y no el otro. Corre npm run build:brand.');
}

// El generador tiene que seguir escribiendo las cinco láminas.
const gen = fs.readFileSync(R('scripts/build-brand-assets.js'), 'utf8');
if (!/ios-native/.test(gen)) {
  fail.push('scripts/build-brand-assets.js ya no genera el icono de iOS: volvería a desfasarse en silencio.');
}

// 6 · Lúa también vive en VIA+ (FrankBetances/via, src/Components/Mascot/
//     LuaPixel.tsx), que la copia de aquí. Este hash del DIBUJO —rejillas y
//     paleta, sin comentarios— es el contrato entre los dos repositorios.
//
//     SI CAMBIAS EL SPRITE: corre `npm run build:brand`, actualiza este hash
//     con el que imprime el error, y **vuelve a copiar el fichero entero a
//     VIA+** actualizando allí EXPECTED en scripts/check-lua-sprite.js. Si no,
//     las dos caras de Lúa divergen versión a versión.
const SPRITE_SHA = '13f146b8df78ee7d397a050d7d69e347e159f3f433e1d8cb48570b919d29bc92';
{
  const s = fs.readFileSync(R('src/ValeriaCatPixel.tsx'), 'utf8');
  const grid = (name) => {
    const i = s.indexOf(`const ${name}: PixelMap = [`);
    const j = s.indexOf('];', i);
    return [...s.slice(i, j).matchAll(/'([.a-z]+)'/g)].map((m) => m[1]).join('|');
  };
  const pal = [...s
    .slice(s.indexOf('CAT_TUXEDO: CatPalette = {'), s.indexOf('};', s.indexOf('CAT_TUXEDO')))
    .matchAll(/(\w): '(#[0-9a-fA-F]+)'/g)].map((m) => m[1] + m[2].toLowerCase()).join(',');
  const got = crypto.createHash('sha256')
    .update(`${grid('HEAD')}#${grid('SIT')}#${pal}`).digest('hex');
  if (got !== SPRITE_SHA) {
    fail.push(`El sprite de Lúa cambió (${got.slice(0, 12)}…). Actualiza SPRITE_SHA aquí, `
      + 'corre npm run build:brand, y copia el fichero a VIA+ (src/Components/Mascot/LuaPixel.tsx) '
      + 'actualizando allí EXPECTED en scripts/check-lua-sprite.js.');
  }
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
