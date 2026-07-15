// ============================================================================
// Valeria+ · Codificador QR puro (modo byte, EC nivel M, versiones 1-6) — V1.0
// Sin dependencias nativas ni de red: todo el pipeline (GF(256), Reed-Solomon,
// máscaras y penalización) está en JS puro, igual que el SHA-256 de ValeriaProPin.
// Así la "salida offline pura" (QR en pantalla) funciona sin conectividad.
//
// Verificado bit a bit contra la librería de referencia `qrcode` (modo byte,
// nivel M) en versiones 1-6 y las 8 máscaras. Devuelve una matriz booleana lista
// para pintar con react-native-svg (ver ValeriaQRCode.tsx).
//
// Capacidad (bytes, nivel M): v1≈14 · v2≈26 · v3≈42 · v4≈62 · v5≈84 · v6≈106.
// El payload del QR es un RESUMEN estadístico compacto, muy por debajo de v6.
// ============================================================================

// ---- Tablas GF(256) (polinomio primitivo 0x11d) ----
const EXP = new Array<number>(512);
const LOG = new Array<number>(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();
const gmul = (a: number, b: number): number => (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]];

// Polinomio generador de Reed-Solomon (coeficientes de mayor grado primero, gen[0] = 1).
function rsGenPoly(deg: number): number[] {
  let poly = [1];
  for (let i = 0; i < deg; i++) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];                    // x · poly
      next[j + 1] ^= gmul(poly[j], EXP[i]);  // + α^i · poly
    }
    poly = next;
  }
  return poly;
}
function rsEncode(data: number[], ecCount: number): number[] {
  const gen = rsGenPoly(ecCount); // longitud ecCount+1, gen[0] = 1 (término líder, absorbido por el shift)
  const res = new Array<number>(ecCount).fill(0);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ res[0];
    res.shift(); res.push(0);
    if (factor !== 0) for (let j = 0; j < ecCount; j++) res[j] ^= gmul(gen[j + 1], factor);
  }
  return res;
}

// Estructura EC por versión a nivel M: [ecPorBloque, nBloques, datosPorBloque].
const EC_M: Record<number, [number, number, number]> = {
  1: [10, 1, 16], 2: [16, 1, 28], 3: [26, 1, 44],
  4: [18, 2, 32], 5: [24, 2, 43], 6: [16, 4, 27],
};
// Centro del único patrón de alineación (v1 no tiene).
const ALIGN: Record<number, number | null> = { 1: null, 2: 18, 3: 22, 4: 26, 5: 30, 6: 34 };

function chooseVersion(len: number): number {
  for (let v = 1; v <= 6; v++) {
    const [, blocks, dpb] = EC_M[v];
    const dataCw = blocks * dpb;
    const need = 4 + 8 + 8 * len; // modo + indicador de cuenta (8 bits en v1-9) + payload
    if (dataCw * 8 >= need) return v;
  }
  throw new Error('payload demasiado grande para QR v1-6');
}

function buildCodewords(bytes: number[], version: number): number[] {
  const [ecPerBlock, numBlocks, dataPerBlock] = EC_M[version];
  const totalData = numBlocks * dataPerBlock;
  const bits: number[] = [];
  const push = (val: number, n: number) => { for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); };
  push(0b0100, 4);        // modo byte
  push(bytes.length, 8);  // indicador de cuenta (v1-9 → 8 bits)
  for (const b of bytes) push(b, 8);
  const cap = totalData * 8;
  for (let i = 0; i < 4 && bits.length < cap; i++) bits.push(0); // terminador (hasta 4 ceros)
  while (bits.length % 8 !== 0) bits.push(0);                     // alinear a byte
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    data.push(b);
  }
  const pads = [0xec, 0x11];
  let pi = 0;
  while (data.length < totalData) { data.push(pads[pi & 1]); pi++; } // bytes de relleno
  // Dividir en bloques, calcular EC e interleave.
  const dataBlocks: number[][] = [], ecBlocks: number[][] = [];
  for (let b = 0; b < numBlocks; b++) {
    const block = data.slice(b * dataPerBlock, (b + 1) * dataPerBlock);
    dataBlocks.push(block);
    ecBlocks.push(rsEncode(block, ecPerBlock));
  }
  const out: number[] = [];
  for (let i = 0; i < dataPerBlock; i++) for (let b = 0; b < numBlocks; b++) out.push(dataBlocks[b][i]);
  for (let i = 0; i < ecPerBlock; i++) for (let b = 0; b < numBlocks; b++) out.push(ecBlocks[b][i]);
  return out;
}

type Grid = (boolean | null)[][];

function makeMatrix(version: number, codewords: number[]): { size: number; m: Grid; fn: boolean[][] } {
  const size = version * 4 + 17;
  const m: Grid = Array.from({ length: size }, () => new Array(size).fill(null));
  const fn: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const setFn = (r: number, c: number, v: boolean) => { m[r][c] = v; fn[r][c] = true; };

  const finder = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
      const rr = r0 + r, cc = c0 + c;
      if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
      const inRing = (r >= 0 && r <= 6 && (c === 0 || c === 6)) || (c >= 0 && c <= 6 && (r === 0 || r === 6));
      const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      setFn(rr, cc, inRing || inCore);
    }
  };
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0); } // timing

  const a = ALIGN[version];
  if (a != null) {
    for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) {
      const ring = Math.max(Math.abs(r), Math.abs(c));
      setFn(a + r, a + c, ring !== 1);
    }
  }

  setFn(4 * version + 9, 8, true); // módulo oscuro fijo

  // Reservar las zonas de formato (el valor se pinta después de elegir máscara).
  for (let i = 0; i <= 8; i++) { if (i !== 6) { fn[8][i] = true; fn[i][8] = true; } }
  for (let i = 0; i < 8; i++) { fn[8][size - 1 - i] = true; fn[size - 1 - i][8] = true; }

  // Colocar los bits de datos en zig-zag (dos columnas cada vez, saltando módulos función).
  let bitIdx = 0;
  const totalBits = codewords.length * 8;
  const getBit = (): number => {
    if (bitIdx >= totalBits) return 0;
    return (codewords[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1;
  };
  let dirUp = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // saltar la columna de timing
    for (let i = 0; i < size; i++) {
      const row = dirUp ? size - 1 - i : i;
      for (let c = 0; c < 2; c++) {
        const cc = col - c;
        if (fn[row][cc]) continue;
        m[row][cc] = getBit() === 1;
        bitIdx++;
      }
    }
    dirUp = !dirUp;
  }
  return { size, m, fn };
}

const MASKS: Array<(r: number, c: number) => boolean> = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function applyMask(m: Grid, fn: boolean[][], maskFn: (r: number, c: number) => boolean): boolean[][] {
  const size = m.length;
  const out: boolean[][] = m.map((row) => row.map((v) => v === true));
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (!fn[r][c] && maskFn(r, c)) out[r][c] = !out[r][c];
  }
  return out;
}

function penalty(m: boolean[][]): number {
  const size = m.length;
  let score = 0;
  const runScore = (getter: (a: number, b: number) => boolean) => {
    for (let a = 0; a < size; a++) {
      let run = 1;
      for (let b = 1; b < size; b++) {
        if (getter(a, b) === getter(a, b - 1)) { run++; if (run === 5) score += 3; else if (run > 5) score += 1; }
        else run = 1;
      }
    }
  };
  runScore((a, b) => m[a][b]);
  runScore((a, b) => m[b][a]);
  for (let r = 0; r < size - 1; r++) for (let c = 0; c < size - 1; c++) {
    const v = m[r][c];
    if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
  }
  const pat1 = [true, false, true, true, true, false, true, false, false, false, false];
  const pat2 = [false, false, false, false, true, false, true, true, true, false, true];
  const match = (arr: boolean[], i: number, pat: boolean[]) => pat.every((p, k) => arr[i + k] === p);
  for (let r = 0; r < size; r++) {
    const rowArr = m[r];
    const colArr = m.map((row) => row[r]);
    for (let c = 0; c <= size - 11; c++) {
      if (match(rowArr, c, pat1) || match(rowArr, c, pat2)) score += 40;
      if (match(colArr, c, pat1) || match(colArr, c, pat2)) score += 40;
    }
  }
  let dark = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (m[r][c]) dark++;
  const pct = (dark * 100) / (size * size);
  const prev = Math.floor(pct / 5) * 5, next = prev + 5;
  score += Math.min(Math.abs(prev - 50), Math.abs(next - 50)) / 5 * 10;
  return score;
}

// Información de formato: nivel M = 0b00 + 3 bits de máscara, BCH(15,5) y XOR 0x5412.
function formatBits(mask: number): number {
  const data = (0b00 << 3) | mask;
  let d = data << 10;
  const g = 0b10100110111;
  for (let i = 4; i >= 0; i--) if ((d >> (i + 10)) & 1) d ^= g << i;
  return (((data << 10) | d) ^ 0b101010000010010) & 0x7fff;
}

function placeFormat(m: boolean[][], mask: number): void {
  const size = m.length;
  const bits = formatBits(mask);
  for (let i = 0; i < 15; i++) {
    const mod = ((bits >> i) & 1) === 1;
    if (i < 6) m[i][8] = mod;
    else if (i < 8) m[i + 1][8] = mod;
    else m[size - 15 + i][8] = mod;
    if (i < 8) m[8][size - i - 1] = mod;
    else if (i < 9) m[8][15 - i - 1 + 1] = mod;
    else m[8][15 - i - 1] = mod;
  }
  m[size - 8][8] = true;
}

export interface QRResult { size: number; version: number; mask: number; modules: boolean[][]; }

// Codifica una cadena (UTF-8, modo byte) en una matriz booleana QR (nivel M).
export function encodeQR(text: string): QRResult {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 128) bytes.push(code);
    else if (code < 2048) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
  }
  const version = chooseVersion(bytes.length);
  const codewords = buildCodewords(bytes, version);
  const { m, fn } = makeMatrix(version, codewords);
  let best: boolean[][] | null = null, bestScore = Infinity, bestMask = 0;
  for (let mask = 0; mask < 8; mask++) {
    const masked = applyMask(m, fn, MASKS[mask]);
    placeFormat(masked, mask);
    const s = penalty(masked);
    if (s < bestScore) { bestScore = s; best = masked; bestMask = mask; }
  }
  return { size: version * 4 + 17, version, mask: bestMask, modules: best as boolean[][] };
}
