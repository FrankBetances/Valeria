// ============================================================================
// Valeria+ · Quita las orejas de oso del logotipo
//
// El logotipo llevaba dos discos redondos sobre la «e». Eran orejas de oso, y
// la mascota es una gata desde la v12, así que el logotipo seguía contando la
// marca anterior en el README, en la portada del manual y en cualquier sitio
// donde se pegue. Se quitan y la «e» queda como una «e».
//
//   node scripts/build-logo-ears.js
//
// Por qué un script y no un PNG retocado a mano: a mano nadie sabe rehacerlo, y
// en el diff no se lee qué se tocó. Esto se puede volver a correr y dice
// exactamente qué geometría usa.
//
// ── Qué se borra, exactamente ──────────────────────────────────────────────
// Solo lo que sobresale del contorno de la «e», y solo por encima de y=54. De
// ahí para abajo NO se toca un píxel: la oreja izquierda muere en y≈53 y la
// derecha en y≈40, así que por debajo el glifo ya está limpio.
//
// El contorno NO es un círculo perfecto —la letra es un tipo redondeado, no
// geometría—, así que el arco se ajusta por tres puntos medidos en el propio
// glifo: la cima (241,5 · 33) y los dos flancos a y=54 (x=209 y x=273).
// Validación: ese arco predice el borde derecho en 266,4 a y=44 y en 271 a
// y=50; el glifo mide 266 y 271. El borde derecho está limpio de oreja ahí, o
// sea que el arco es el de la letra y no una aproximación cómoda.
// ============================================================================
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const ROOT = path.join(__dirname, '..');
const SS = 4;                        // supermuestreo para el borde

// Arco de la «e» por los tres puntos medidos (ver cabecera).
const BOWL = { cx: 241, cy: 67.9, r: 34.9 };

// Ventana de trabajo: la «e» y solo por encima de y=54. Fuera de aquí no se
// escribe, así que las otras seis letras y el © quedan intactos por
// construcción, no por confianza.
const WIN = { x0: 182, x1: 300, y0: 0, y1: 54 };

const inBowl = (px, py) =>
  (px - BOWL.cx) ** 2 + (py - BOWL.cy) ** 2 <= BOWL.r ** 2;

const build = (file) => {
  const png = PNG.sync.read(fs.readFileSync(path.join(ROOT, file)));
  const { width: W, data } = png;
  let borrados = 0;

  for (let y = WIN.y0; y < WIN.y1; y++) {
    for (let x = WIN.x0; x < WIN.x1; x++) {
      const i = (y * W + x) * 4;
      if (data[i + 3] === 0) continue;

      // Cuánto del píxel cae DENTRO del contorno de la letra.
      let hit = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          if (inBowl(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS)) hit++;
        }
      }
      const cover = hit / (SS * SS);

      // Se conserva el alfa original atenuado por la cobertura: dentro queda
      // igual, fuera desaparece, y en el filo el borde sigue siendo suave. En
      // ningún caso se AÑADE tinta — la letra no se rellena, solo se recorta.
      const nuevo = Math.round(data[i + 3] * cover);
      if (nuevo < data[i + 3]) borrados += data[i + 3] - nuevo;
      data[i + 3] = nuevo;
    }
  }
  fs.writeFileSync(path.join(ROOT, file), PNG.sync.write(png));
  return `${file} · ${(borrados / 255).toFixed(0)} px de tinta retirados`;
};

console.log(build('assets/valeria-logo.png'));
console.log(build('assets/valeria-logo-white.png'));
