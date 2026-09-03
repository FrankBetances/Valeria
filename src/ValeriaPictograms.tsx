// ============================================================================
// Valeria+ · Pictogramas de ficha (V2.0)
// Los testers veían fichas "rotas": varios emojis del banco (🪚 sierra, 🪣 cubo,
// 🪥 cepillo, 🛝 tobogán…) son de Unicode 13/14 y en muchos Android se pintan
// como un cuadro vacío (tofu); otros (💇 pelo, 0️⃣/8️⃣, 🌉) se ven pero son
// confusos o de bajo contraste para la ficha grande.
//
// Solución: pictogramas SVG propios —sin fondo, alto contraste, contorno
// grueso y colores planos, como exige el visual_prompt clínico— con fallback
// a emoji para el resto de palabras.
//
// ---------------------------------------------------------------------------
// V2 · CLAVE EXPLÍCITA (DC-4 · ES-09 · ES-12)
//
// Las logopedas de ACOPROS pidieron sustituir las imágenes ambiguas por
// pictogramas. Se descartó adoptar un banco externo: ARASAAC es CC BY-NC-SA
// (la cláusula NC bloquea el uso comercial), Mulberry es CC BY-SA (el
// share-alike se contagiaría al diseño de la app) y Sclera añade ND. Pero el
// argumento que decide no es la licencia: NINGÚN banco, ni de pago, trae
// «cuchara sucia» y «cuchara limpia» como par sobre el mismo objeto, que es
// exactamente lo que ES-12 necesita. Eso hay que dibujarlo a propósito.
//
// Por eso el dato ahora nombra el pictograma por una CLAVE, en vez de que este
// módulo lo adivine a partir de la palabra o del emoji:
//
//   · Adivinar por palabra falla en los contrastes, donde el label nombra el
//     ATRIBUTO («sucio») y no el objeto, y falla fuera del castellano, donde la
//     ficha dice «eskuila» o «txirristra» (fue lo que obligó a añadir el
//     registro por emoji).
//   · Adivinar por emoji falla dentro de una cápsula, donde las dos vueltas
//     comparten emoji por la regla de congruencia de ES-13.
//   · La clave es independiente de la lengua: un dibujo sirve a es, es-DO, gl
//     y eu sin duplicar.
//
// Orden de resolución: clave → palabra → emoji → emoji crudo. Una clave sin
// dibujo no rompe nada: cae al emoji, sin hueco visual.
//
//   <FichaVisual pic="cuchara-sucia" word="sucio" emoji="🥄" size={58} />
//
// ---------------------------------------------------------------------------
// V3 · EL DIBUJO ES EL DEL APARATO (D-J · 14/8/2026)
//
// Los pictogramas ya NO son SVG dibujados aquí. Son las mismas matrices de
// píxel art de 24×24 que enseña Lúa en su panel, y viven en
// `ValeriaPixelArt.ts`, que es la fuente única de las dos superficies.
//
// El motivo es clínico, no estético: el niño mira a la mascota, no a la
// tableta, y el estímulo tiene que ser EL MISMO dibujo en los dos sitios. Con
// dos juegos de dibujos —SVG aquí, píxeles allí— la misma palabra se veía de
// dos formas distintas según dónde mirase, que es justo lo que el espejo
// pretende evitar.
//
// Los 66 SVG anteriores se han retirado. Estaban bien dibujados, pero eran el
// segundo dibujo de la misma cosa; conservarlos era no cerrar nada. Siguen en
// el historial de git si alguna vez hace falta volver.
//
// Lo que NO ha cambiado, y es lo que importa para la seguridad:
//   · las 66 claves y su ORDEN son exactamente los de antes;
//   · la resolución sigue siendo clave → palabra → emoji → emoji crudo;
//   · una clave sin dibujo sigue cayendo al emoji, sin hueco visual.
//
//   <FichaVisual pic="cuchara-sucia" word="sucio" emoji="🥄" size={58} />
// ============================================================================
import React from 'react';
import { Text, View } from 'react-native';

import { PICTOS, type PictoKey } from './ValeriaPixelArt';
import ValeriaPixelSprite from './ValeriaPixelSprite';

type Pic = React.FC<{ size: number }>;

/**
 * Convierte una clave del catálogo en un componente de ficha.
 *
 * Se resuelve la matriz una vez, al construir el registro, para que un fallo de
 * clave salte al arrancar y no en mitad de una sesión con un niño delante.
 */
const pixelPic = (key: PictoKey): Pic => {
  const map = PICTOS[key];
  if (!map) throw new Error(`ValeriaPictograms: no hay dibujo para «${key}»`);
  const Componente: Pic = ({ size }) => <ValeriaPixelSprite map={map} size={size} />;
  Componente.displayName = `Pic(${key})`;
  return Componente;
};

// ----------------------------------------------------------------------------
// El registro por CLAVE. Es la puerta única: el gate de cobertura
// (check-pictogram-coverage.js) lee este bloque para comprobar que ninguna
// cápsula de contraste apunta a una clave sin dibujo.
//
// El ORDEN de estas 66 líneas es el índice que viaja por BLE en PICTO(i).
// Se añade al final; NO se reordena. (Ver ValeriaPixelArt.ts.)
// ----------------------------------------------------------------------------
const PICTOGRAMS_BY_KEY: Record<string, Pic> = {
  cepillo: pixelPic('cepillo'),
  tobogan: pixelPic('tobogan'),
  cubo: pixelPic('cubo'),
  sierra: pixelPic('sierra'),
  pelo: pixelPic('pelo'),
  puente: pixelPic('puente'),
  'numero-ocho': pixelPic('numero-ocho'),
  'numero-cero': pixelPic('numero-cero'),
  'osito-grande': pixelPic('osito-grande'),
  'osito-pequeno': pixelPic('osito-pequeno'),
  'cuchara-limpia': pixelPic('cuchara-limpia'),
  'cuchara-sucia': pixelPic('cuchara-sucia'),
  'caja-abierta': pixelPic('caja-abierta'),
  'caja-cerrada': pixelPic('caja-cerrada'),
  'vaso-frio': pixelPic('vaso-frio'),
  'vaso-caliente': pixelPic('vaso-caliente'),
  'bombilla-encendida': pixelPic('bombilla-encendida'),
  'bombilla-apagada': pixelPic('bombilla-apagada'),
  'cesta-llena': pixelPic('cesta-llena'),
  'cesta-vacia': pixelPic('cesta-vacia'),
  'coche-subiendo': pixelPic('coche-subiendo'),
  'coche-bajando': pixelPic('coche-bajando'),
  'juguete-dentro': pixelPic('juguete-dentro'),
  'juguete-fuera': pixelPic('juguete-fuera'),
  comer: pixelPic('comer'),
  dormir: pixelPic('dormir'),
  soplar: pixelPic('soplar'),
  banar: pixelPic('banar'),
  vestir: pixelPic('vestir'),
  correr: pixelPic('correr'),
  nadar: pixelPic('nadar'),
  parar: pixelPic('parar'),
  pajaro: pixelPic('pajaro'),
  jabon: pixelPic('jabon'),
  'vaso-leche': pixelPic('vaso-leche'),
  cesta: pixelPic('cesta'),
  cuchara: pixelPic('cuchara'),
  vaso: pixelPic('vaso'),
  abrazo: pixelPic('abrazo'),
  rueda: pixelPic('rueda'),
  'manos-mojadas': pixelPic('manos-mojadas'),
  pluma: pixelPic('pluma'),
  tubo: pixelPic('tubo'),
  saltar: pixelPic('saltar'),
  esponja: pixelPic('esponja'),
  lana: pixelPic('lana'),
  lata: pixelPic('lata'),
  cuerda: pixelPic('cuerda'),
  papel: pixelPic('papel'),
  mano: pixelPic('mano'),
  'mano-limpia': pixelPic('mano-limpia'),
  palo: pixelPic('palo'),
  senalar: pixelPic('senalar'),
  'frio-cara': pixelPic('frio-cara'),
  torta: pixelPic('torta'),
  'color-rojo': pixelPic('color-rojo'),
  'color-azul': pixelPic('color-azul'),
  'color-amarillo': pixelPic('color-amarillo'),
  'color-verde': pixelPic('color-verde'),
  'color-morado': pixelPic('color-morado'),
  'color-marron': pixelPic('color-marron'),
  pie: pixelPic('pie'),
  boca: pixelPic('boca'),
  ojo: pixelPic('ojo'),
  rodilla: pixelPic('rodilla'),
  codo: pixelPic('codo'),
  // Aventuras con Lúa · léxico dominicano y caras de emoción.
  mango: pixelPic('mango'),
  lechosa: pixelPic('lechosa'),
  chinola: pixelPic('chinola'),
  coco: pixelPic('coco'),
  palma: pixelPic('palma'),
  bandera: pixelPic('bandera'),
  coqui: pixelPic('coqui'),
  cometa: pixelPic('cometa'),
  'cara-feliz': pixelPic('cara-feliz'),
  'cara-triste': pixelPic('cara-triste'),
  'cara-enojada': pixelPic('cara-enojada'),
  'cara-asustada': pixelPic('cara-asustada'),
  'cara-sorprendida': pixelPic('cara-sorprendida'),
  'cara-tranquila': pixelPic('cara-tranquila'),
  // Aventuras con Lúa · sección Juegos.
  estrella: pixelPic('estrella'),
  uvas: pixelPic('uvas'),
  fresa: pixelPic('fresa'),
  sandia: pixelPic('sandia'),
  ola: pixelPic('ola'),
  concha: pixelPic('concha'),
  barco: pixelPic('barco'),
  gallina: pixelPic('gallina'),
  semilla: pixelPic('semilla'),
  brote: pixelPic('brote'),
  planta: pixelPic('planta'),
  tambora: pixelPic('tambora'),
  pandereta: pixelPic('pandereta'),
  maracas: pixelPic('maracas'),
  // Aventuras con Lúa: las fichas del banco de preguntas por edad.
  perro: pixelPic('perro'),
  gato: pixelPic('gato'),
  vaca: pixelPic('vaca'),
  pato: pixelPic('pato'),
  sapo: pixelPic('sapo'),
  elefante: pixelPic('elefante'),
  hormiga: pixelPic('hormiga'),
  pelota: pixelPic('pelota'),
  sol: pixelPic('sol'),
  luna: pixelPic('luna'),
  manzana: pixelPic('manzana'),
  platano: pixelPic('platano'),
  pan: pixelPic('pan'),
  taza: pixelPic('taza'),
  mesa: pixelPic('mesa'),
  silla: pixelPic('silla'),
  casa: pixelPic('casa'),
  arbol: pixelPic('arbol'),
  zapato: pixelPic('zapato'),
  paraguas: pixelPic('paraguas'),
  gorra: pixelPic('gorra'),
  bufanda: pixelPic('bufanda'),
};

// Las ocho heredadas de la V1, que se resolvían por palabra y por emoji.
// Apuntan al MISMO dibujo que su clave: no hay una versión por camino.
const PICTOGRAMS: Record<string, Pic> = {
  cepillo: PICTOGRAMS_BY_KEY['cepillo'],
  tobogan: PICTOGRAMS_BY_KEY['tobogan'],
  cubo: PICTOGRAMS_BY_KEY['cubo'],
  sierra: PICTOGRAMS_BY_KEY['sierra'],
  pelo: PICTOGRAMS_BY_KEY['pelo'],
  puente: PICTOGRAMS_BY_KEY['puente'],
  ocho: PICTOGRAMS_BY_KEY['numero-ocho'],
  cero: PICTOGRAMS_BY_KEY['numero-cero'],
};

const PICTOGRAMS_BY_EMOJI: Record<string, Pic> = {
  '\ud83e\udea5': PICTOGRAMS_BY_KEY['cepillo'],
  '\ud83d\udedd': PICTOGRAMS_BY_KEY['tobogan'],
  '\ud83e\udea3': PICTOGRAMS_BY_KEY['cubo'],
  '\ud83e\ude9a': PICTOGRAMS_BY_KEY['sierra'],
  '\ud83d\udc87': PICTOGRAMS_BY_KEY['pelo'],
  '\ud83c\udf09': PICTOGRAMS_BY_KEY['puente'],
  '8\ufe0f\u20e3': PICTOGRAMS_BY_KEY['numero-ocho'],
  '0\ufe0f\u20e3': PICTOGRAMS_BY_KEY['numero-cero'],
};

const normalizeWord = (w: string): string =>
  w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

export const hasPictogram = (word: string): boolean => normalizeWord(word) in PICTOGRAMS;

// ¿Existe dibujo para esta clave? Lo usa el gate de cobertura para no dejar
// pasar una cápsula de contraste cuya vuelta de comprensión sería irresoluble.
export const hasPictogramKey = (key: string): boolean => key.trim() in PICTOGRAMS_BY_KEY;

// Claves con dibujo, para la auditoría e inventario (docs/auditoria-pictogramas.md).
export const pictogramKeys = (): string[] => Object.keys(PICTOGRAMS_BY_KEY).sort();

// Visual de ficha. Orden de resolución: clave explícita → palabra → emoji →
// emoji crudo. Que una clave no tenga dibujo NO es un error: es la caída
// prevista mientras el banco propio se completa por tandas.
//
// Las dos ramas se pintan dentro de la MISMA caja cuadrada y con la misma
// altura reservada. No es cosmética: la rama de emoji era un <Text> suelto y
// heredaba dos comportamientos de texto que a un dibujo no le sirven —
//
//   · Escalaba con el tamaño de fuente del sistema (allowFontScaling va a true
//     por defecto). Con la accesibilidad al máximo, un emoji de 64 se pinta
//     cerca de 100 y se sale del marco de la ficha y de las dos tarjetas de la
//     vuelta de comprensión, que se ven cortadas. El SVG no escalaba, así que
//     la misma pantalla mezclaba fichas correctas y fichas recortadas.
//   · Se ajustaba a la caja de línea de la tipografía, más estrecha que la
//     tinta de muchos emoji, que quedaban rebanados por arriba o por abajo.
//
// Se nota sobre todo fuera del castellano: euskera y galego usan palabras
// propias que el registro por palabra no rescata, así que caen a emoji mucho
// más a menudo que el castellano.
export const FichaVisual: React.FC<{
  word: string; emoji: string; size?: number; pic?: string;
}> = ({ word, emoji, size = 58, pic }) => {
  const Pic = (pic ? PICTOGRAMS_BY_KEY[pic.trim()] : undefined)
    ?? PICTOGRAMS[normalizeWord(word)]
    ?? PICTOGRAMS_BY_EMOJI[emoji?.trim()];
  const box = Math.round(size * 1.15);
  return (
    <View style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}>
      {Pic ? (
        <Pic size={box} />
      ) : (
        <Text
          allowFontScaling={false}
          style={{ fontSize: size, lineHeight: Math.round(size * 1.3), textAlign: 'center' }}
        >
          {emoji}
        </Text>
      )}
    </View>
  );
};

export default FichaVisual;
