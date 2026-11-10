// Escenas de RA sobre la mesa, una por set y por actividad Solo Lúa (10/11/2026).
// Modelo: los sets de RA de LEGO. Cámara trasera; el adulto toca la mesa y
// aparecen las PIEZAS REALES del set a escala 1:1 (arSetModels.generated.ts, de
// lua-construye), paso a paso como en su manual. Después se juega: los efectos
// de aquí (luz, ondas, flechas) van sobre la maqueta y cada evento lo confirma
// el adulto. Etapa B (la cámara reconoce las piezas) depende del banco D2.
// Unidades: metros, ejes del ancla (+x derecha, +y arriba, +z hacia la tableta).
import type { AdultText, SteamWorldId } from './types';
import type { UiLang } from '../valeriaUiLang';
import { a } from './worlds/retos';
import { AR_LUA_PARTS, AR_SET_COLORS, AR_SET_MODELS } from './arSetModels.generated';

export type SceneShapeKind = 'tile' | 'circle' | 'rings' | 'line' | 'flow' | 'arrow' | 'label';
export type SceneShapeStyle = 'piece' | 'ghost' | 'light' | 'warn';

export interface SceneShapeDef {
  readonly kind: SceneShapeKind;
  readonly style?: SceneShapeStyle;
  readonly pts: readonly (readonly [number, number])[];
  readonly w?: number;
  readonly d?: number;
  readonly r?: number;
  /** Altura sobre la mesa, en metros. */
  readonly y?: number;
  /** Texto fijo, en los cuatro idiomas. */
  readonly text?: AdultText;
  /** Visible al confirmar ese evento. */
  readonly after?: string;
  /** Visible solo mientras el último evento confirmado es uno de estos. */
  readonly last?: readonly string[];
}

export type ArSceneId = SteamWorldId | 'S8' | 'S9' | 'S10' | 'S11' | 'L02' | 'L03' | 'L04' | 'L05';

const T = {
  inicio: a(['INICIO', 'START', 'INICI', 'INICIO']),
  meta: a(['META', 'GOAL', 'META', 'META']),
  zocalo: a(['Zócalo', 'Base', 'Sòcol', 'Zócalo']),
  cabeza: a(['Cabeza de Lúa', 'Lúa’s head', 'Cap de la Lúa', 'Cabeza de Lúa']),
  placa: a(['Placa', 'Board', 'Placa', 'Placa']),
  resonador: a(['Resonador', 'Resonator', 'Ressonador', 'Resoador']),
  fuerte: a(['FUERTE', 'LOUD', 'FORT', 'FORTE']),
  debil: a(['suave', 'soft', 'suau', 'suave']),
  rampa: a(['Rampa', 'Ramp', 'Rampa', 'Rampla']),
  esfera: a(['Esfera', 'Ball', 'Esfera', 'Esfera']),
  espera: a(['¡Espera!', 'Wait!', 'Espera!', 'Agarda!']),
  rotor: a(['Rotor', 'Rotor', 'Rotor', 'Rotor']),
  molinete: a(['Molinete', 'Pinwheel', 'Molinet', 'Muíño']),
  compuerta: a(['Compuerta', 'Gate', 'Comporta', 'Comporta']),
  pesada: a(['Pesada', 'Heavy', 'Pesada', 'Pesada']),
  izq: a(['Izquierda', 'Left', 'Esquerra', 'Esquerda']),
  dcha: a(['Derecha', 'Right', 'Dreta', 'Dereita']),
  equilibrio: a(['Equilibrio', 'Balance', 'Equilibri', 'Equilibrio']),
  tierra: a(['Tierra', 'Soil', 'Terra', 'Terra']),
  semilla: a(['Semilla', 'Seed', 'Llavor', 'Semente']),
  sol: a(['Sol', 'Sun', 'Sol', 'Sol']),
  noche: a(['Noche', 'Night', 'Nit', 'Noite']),
  barrera: a(['Barrera', 'Barrier', 'Barrera', 'Barreira']),
  paso: a(['Paso de peatones', 'Crossing', 'Pas de vianants', 'Paso de peóns']),
  aviso: a(['¡Aviso!', 'Alert!', 'Avís!', 'Aviso!']),
  diana: a(['Diana', 'Target', 'Diana', 'Diana']),
  hospital: a(['Hospital', 'Hospital', 'Hospital', 'Hospital']),
  camilla: a(['Camilla', 'Stretcher', 'Llitera', 'Padiola']),
  alta: a(['¡Alta!', 'Discharged!', 'Alta!', 'Alta!']),
  via: a(['Vía', 'Track', 'Via', 'Vía']),
  anden: a(['Andén', 'Platform', 'Andana', 'Plataforma']),
  lua: a(['Lúa', 'Lúa', 'Lúa', 'Lúa']),
  cosa1: a(['1', '1', '1', '1']),
  cosa2: a(['2', '2', '2', '2']),
  cosa3: a(['3', '3', '3', '3']),
  plato: a(['Plato', 'Bowl', 'Plat', 'Prato']),
  zzz: a(['z z z', 'z z z', 'z z z', 'z z z']),
  rincon: a(['Rincón', 'Corner', 'Racó', 'Recuncho']),
};

const tile = (x: number, z: number, w: number, d: number, style: SceneShapeStyle, extra: Partial<SceneShapeDef> = {}): SceneShapeDef =>
  ({ kind: 'tile', style, pts: [[x, z]], w, d, ...extra });
const circle = (x: number, z: number, r: number, style: SceneShapeStyle, extra: Partial<SceneShapeDef> = {}): SceneShapeDef =>
  ({ kind: 'circle', style, pts: [[x, z]], r, ...extra });
const rings = (x: number, z: number, r: number, extra: Partial<SceneShapeDef> = {}): SceneShapeDef =>
  ({ kind: 'rings', style: 'light', pts: [[x, z]], r, ...extra });
const flow = (pts: readonly (readonly [number, number])[], extra: Partial<SceneShapeDef> = {}): SceneShapeDef =>
  ({ kind: 'flow', style: 'light', pts, ...extra });
const line = (pts: readonly (readonly [number, number])[], style: SceneShapeStyle, extra: Partial<SceneShapeDef> = {}): SceneShapeDef =>
  ({ kind: 'line', style, pts, ...extra });
const arrow = (from: readonly [number, number], to: readonly [number, number], style: SceneShapeStyle, extra: Partial<SceneShapeDef> = {}): SceneShapeDef =>
  ({ kind: 'arrow', style, pts: [from, to], ...extra });
const label = (x: number, z: number, text: AdultText, extra: Partial<SceneShapeDef> = {}): SceneShapeDef =>
  ({ kind: 'label', pts: [[x, z]], text, ...extra });

// Los efectos van SOBRE las piezas reales. Las coordenadas salen de las posiciones
// del manual de cada set (arSetModels.generated.ts): metros, mismo ancla.
const Y = 0.025; // justo encima de una baldosa (19,2 mm)

export const AR_SCENES: Readonly<Record<ArSceneId, readonly SceneShapeDef[]>> = {
  // S0 · El kit: Lúa sobre su baldosa, con la torre de pilares al lado.
  S0: [
    rings(-0.053, 0.033, 0.05, { y: 0.19, last: ['S0.CABEZA_ENCAJADA'] }),
    label(-0.053, 0.033, T.cabeza, { y: 0.23, after: 'S0.CABEZA_ENCAJADA' }),
    tile(-0.117, -0.031, 0.137, 0.127, 'light', { y: Y, after: 'S0.LUA_EN_ZOCALO' }),
    arrow([0.095, 0.034], [0.02, 0.034], 'light', { y: 0.06, last: ['S0.PLACA_LEIDA'] }),
    rings(-0.053, 0.033, 0.09, { y: Y, after: 'S0.PLACA_LEIDA' }),
  ],
  // S1 · El camino: zócalo de inicio, tres baldosas y la curva. El carril va por z = 0,101.
  S1: [
    label(-0.254, 0.19, T.inicio, { y: Y }),
    label(0.19, 0.19, T.meta, { y: Y }),
    circle(-0.254, 0.101, 0.03, 'light', { y: 0.045, after: 'S1.LUA_EN_INICIO' }),
    flow([[-0.254, 0.101], [-0.127, 0.101], [0.0, 0.101]], { y: Y, after: 'S1.LUA_AVANZA' }),
    arrow([0.06, 0.101], [0.15, 0.101], 'light', { y: Y, after: 'S1.LUA_GIRA' }),
    rings(0.127, 0.101, 0.03, { y: Y, last: ['S1.LUA_GIRA'] }),
    tile(-0.064, 0.038, 0.127, 0.127, 'warn', { y: Y, text: T.espera, last: ['S1.CAMINO_ROTO'] }),
    flow([[0.0, 0.101], [0.19, 0.101]], { y: Y, after: 'S1.LLEGA_META' }),
    rings(0.19, 0.101, 0.045, { y: Y, after: 'S1.LLEGA_META' }),
  ],
  // S2 · El sonido: los dos raspadores delante, la baqueta, y Lúa escuchando detrás.
  S2: [
    tile(-0.206, 0.096, 0.136, 0.043, 'light', { y: 0.03, after: 'S2.RESONADOR_COLOCADO' }),
    rings(-0.14, 0.117, 0.07, { y: 0.03, text: T.fuerte, last: ['S2.GOLPE_FUERTE'] }),
    rings(-0.14, 0.117, 0.03, { y: 0.03, text: T.debil, last: ['S2.GOLPE_DEBIL'] }),
    flow([[-0.038, 0.117], [0.095, 0.117]], { y: 0.03, after: 'S2.RASPADO_COMPLETO' }),
    rings(-0.033, -0.01, 0.1, { y: Y, last: ['S2.PULSO_SEGUIDO'] }),
  ],
  // S3 · Las rampas: bisagra y rampa, tramo de fricción, receptor rojo y Lúa al final.
  S3: [
    circle(-0.24, 0.036, 0.03, 'light', { y: 0.09, after: 'S3.ESFERA_ARRIBA' }),
    circle(-0.24, 0.036, 0.04, 'warn', { y: 0.09, text: T.espera, last: ['S3.SALIDA_ANTICIPADA'] }),
    flow([[-0.24, 0.036], [-0.08, 0.036], [0.07, 0.036]], { y: 0.04, last: ['S3.LLEGADA_RAPIDA', 'S3.LLEGADA_LENTA'] }),
    rings(0.07, 0.036, 0.06, { y: 0.03, last: ['S3.LLEGADA_RAPIDA'] }),
    rings(0.07, 0.036, 0.025, { y: 0.03, last: ['S3.LLEGADA_LENTA'] }),
    circle(-0.08, 0.036, 0.035, 'warn', { y: 0.03, last: ['S3.SE_PARA'] }),
  ],
  // S4 · El soplo: el canal con su compuerta, el molinete y Lúa enfrente.
  S4: [
    arrow([-0.26, 0.042], [-0.19, 0.042], 'light', { y: 0.04, last: ['S4.PRAXIA_REDONDEO'] }),
    flow([[-0.18, 0.042], [-0.02, 0.042]], { y: 0.04, last: ['S4.ROTOR_GIRA', 'S4.MOLINETE_GIRA', 'S4.COMPUERTA_LIGERA'] }),
    rings(-0.06, 0.042, 0.03, { y: 0.05, after: 'S4.ROTOR_GIRA' }),
    rings(0.045, 0.042, 0.055, { y: 0.06, after: 'S4.MOLINETE_GIRA' }),
    tile(-0.098, 0.016, 0.076, 0.052, 'light', { y: 0.06, last: ['S4.COMPUERTA_LIGERA'] }),
    tile(-0.098, 0.016, 0.076, 0.052, 'warn', { y: 0.06, text: T.pesada, last: ['S4.COMPUERTA_PESADA'] }),
  ],
  // S5 · El puente: la viga sobre dos torres de pilares, las masas y Lúa a la derecha.
  S5: [
    circle(-0.142, 0.052, 0.03, 'light', { y: 0.1, after: 'S5.MASA_COLOCADA' }),
    circle(-0.142, 0.052, 0.045, 'warn', { y: 0.1, text: T.izq, last: ['S5.INCLINA_IZQ'] }),
    circle(-0.024, 0.052, 0.045, 'warn', { y: 0.1, text: T.dcha, last: ['S5.INCLINA_DCHA'] }),
    line([[-0.178, 0.052], [0.01, 0.052]], 'light', { y: 0.1, after: 'S5.EQUILIBRIO' }),
    label(-0.084, 0.052, T.equilibrio, { y: 0.14, after: 'S5.EQUILIBRIO' }),
    tile(-0.178, 0.03, 0.188, 0.044, 'light', { y: 0.1, after: 'S5.PUENTE_ESTABLE' }),
  ],
  // S6 · El jardín: la tierra con la planta, los prismas de luz, la silueta y Lúa.
  S6: [
    circle(-0.12, 0.01, 0.018, 'light', { y: 0.03, after: 'S6.SIEMBRA' }),
    flow([[-0.2, 0.1], [-0.12, 0.01]], { y: 0.06, last: ['S6.RIEGO'] }),
    circle(-0.12, 0.01, 0.035, 'light', { y: 0.06, after: 'S6.BROTE' }),
    line([[-0.07, 0.0], [-0.12, 0.01], [-0.1, 0.055]], 'light', { y: 0.07, last: ['S6.SOMBRA_ALINEADA'] }),
    rings(-0.12, 0.01, 0.05, { y: 0.1, after: 'S6.FLORECE' }),
    label(-0.085, -0.06, T.noche, { y: 0.1, last: ['S6.NOCHE'] }),
  ],
  // S8–S11 · Las maquetas de oficios (base de 318 × 191 mm, centrada en el ancla).
  S8: [
    line([[-0.15, -0.02], [0.15, -0.02]], 'warn', { y: 0.03, text: T.barrera, last: ['S8.BARRERA_BAJA'] }),
    arrow([0, 0.08], [0, -0.06], 'light', { y: 0.02, last: ['S8.PEATON_CRUZA'] }),
    arrow([-0.15, -0.02], [-0.15, -0.09], 'light', { y: 0.03, last: ['S8.BARRERA_SUBE'] }),
    rings(0, 0, 0.07, { y: 0.02, after: 'S8.TURNO_COMPLETO' }),
  ],
  S9: [
    rings(-0.12, 0.05, 0.04, { y: 0.03, text: T.aviso, last: ['S9.AVISO'] }),
    flow([[-0.12, 0.05], [0.05, -0.04]], { y: 0.03, after: 'S9.RAMPA' }),
    circle(0.11, -0.06, 0.04, 'light', { y: 0.05, after: 'S9.DIANA' }),
    rings(0.11, -0.06, 0.05, { y: 0.05, after: 'S9.MISION' }),
  ],
  S10: [
    arrow([0, 0.14], [0, 0.06], 'light', { y: 0.02, last: ['S10.LLEGADA'] }),
    tile(0.01, 0.02, 0.13, 0.07, 'light', { y: 0.03, after: 'S10.CAMILLA' }),
    rings(0.075, 0.055, 0.03, { y: 0.05, last: ['S10.LATIDO'] }),
    arrow([0.0, 0.06], [0.2, 0.12], 'light', { y: 0.02, last: ['S10.ALTA'] }),
    label(0.2, 0.15, T.alta, { y: 0.02, after: 'S10.ALTA' }),
  ],
  S11: [
    tile(-0.14, -0.205, 0.1, 0.07, 'light', { y: 0.03, after: 'S11.ACOPLADO' }),
    circle(0.0, -0.17, 0.05, 'light', { y: 0.03, last: ['S11.PASO_SEGURO'] }),
    flow([[-0.17, -0.17], [0.1, -0.17]], { y: 0.04, after: 'S11.EN_MARCHA' }),
    rings(0.18, -0.165, 0.05, { y: 0.03, after: 'S11.ANDEN' }),
  ],
  // L02–L05 · Solo Lúa: el muñeco en el centro, mirando a la tableta.
  L02: [
    circle(-0.18, -0.06, 0.03, 'ghost', { text: T.cosa1 }),
    circle(0, -0.2, 0.03, 'ghost', { text: T.cosa2 }),
    circle(0.18, -0.06, 0.03, 'ghost', { text: T.cosa3 }),
    arrow([0.06, 0.12], [-0.06, 0.12], 'light', { last: ['L02.GIRA'] }),
    flow([[0, -0.09], [0, -0.17]], { last: ['L02.ALINEA'] }),
    rings(0, 0, 0.11, { after: 'L02.FIN' }),
  ],
  L03: [
    circle(0.18, 0.08, 0.04, 'ghost', { text: T.plato }),
    rings(0, 0, 0.1, { last: ['L03.ANTOJO'] }),
    flow([[0.18, 0.08], [0.05, 0.08]], { y: 0.05, last: ['L03.ENTREGA'] }),
    circle(0.18, 0.08, 0.04, 'light', { after: 'L03.ENTREGA' }),
    rings(0, 0, 0.12, { last: ['L03.GRACIAS'] }),
  ],
  L04: [
    label(0.1, -0.05, T.zzz, { y: 0.22, last: ['L04.DORMIDA', 'L04.CALMA'] }),
    rings(0, 0, 0.09, { last: ['L04.CALMA'] }),
    rings(0, 0, 0.12, { last: ['L04.DESPIERTA'] }),
  ],
  L05: [
    tile(0.13, -0.22, 0.08, 0.08, 'ghost', { text: T.rincon }),
    arrow([-0.24, 0.14], [-0.1, 0.06], 'light', { y: 0.1, last: ['L05.MANO_LENTA'] }),
    arrow([-0.24, 0.14], [-0.1, 0.06], 'warn', { y: 0.1, last: ['L05.MANO_RAPIDA'] }),
    flow([[0.06, -0.06], [0.16, -0.17]], { last: ['L05.RINCON'] }),
    tile(0.13, -0.22, 0.08, 0.08, 'light', { after: 'L05.RINCON' }),
  ],
};

export interface ArSceneEventInput {
  readonly id: string;
  readonly label: string;
  readonly prompt: string;
  /** Nombre de la cara de Lúa, vacío si la modalidad no lleva Lúa. */
  readonly face: string;
}

export interface ArSceneTexts {
  readonly title: string;
  readonly placeHint: string;
  readonly searchHint: string;
  readonly closeLabel: string;
  readonly replaceLabel: string;
  readonly luaPrefix: string;
  readonly playLabel: string;
  readonly hideLabel: string;
  readonly showLabel: string;
  /** Rótulo del botón de cada paso de montaje («Paso 1»…). */
  readonly stepLabel: (n: number) => string;
  /** Indicación de un paso: recibe los códigos de las piezas nuevas. */
  readonly stepHint: (n: number, total: number, pieces: string) => string;
  /** Indicación de las actividades Solo Lúa (un único paso: poner a Lúa). */
  readonly luaHint: string;
}

const rgbOf = (c: string) => AR_SET_COLORS[c] ?? AR_SET_COLORS.blanco;
const LUA_PARTS = AR_LUA_PARTS.map((p) => ({ m: p.m, rgb: rgbOf(p.c) }));

/** Pasos de montaje del set con sus piezas reales; Solo Lúa: el muñeco en el centro. */
function buildModel(id: ArSceneId, texts: ArSceneTexts) {
  const set = AR_SET_MODELS[id];
  if (!set) {
    return {
      luaParts: LUA_PARTS,
      steps: [{ label: texts.stepLabel(1), hint: texts.luaHint, pieces: [], arrows: [], lua: [{ p: [0, 0, 0], r: 0 }] }],
    };
  }
  return {
    luaParts: LUA_PARTS,
    steps: set.steps.map((st, i) => ({
      label: texts.stepLabel(i + 1),
      hint: texts.stepHint(i + 1, set.steps.length, [...new Set(st.pieces.filter((pc) => !pc.placed).map((pc) => pc.code))].join(' · ')),
      pieces: st.pieces.map((pc) => ({ m: pc.m, rgb: rgbOf(pc.c), p: pc.p, placed: pc.placed })),
      arrows: st.arrows,
      lua: st.lua,
    })),
  };
}

/** JSON que lee ValeriaArSceneActivity. Una sola fuente: esta tabla y los modelos generados. */
export function buildArSceneSpec(id: ArSceneId, lang: UiLang, texts: ArSceneTexts, events: readonly ArSceneEventInput[]): string {
  const shapes = AR_SCENES[id].map((s) => ({
    kind: s.kind,
    style: s.style ?? 'piece',
    pts: s.pts.map((p) => [p[0], p[1]]),
    w: s.w ?? 0,
    d: s.d ?? 0,
    r: s.r ?? 0,
    y: s.y ?? 0,
    text: s.text ? s.text[lang] : '',
    ...(s.after ? { after: s.after } : {}),
    ...(s.last ? { last: [...s.last] } : {}),
  }));
  const { stepLabel, stepHint, luaHint, ...plain } = texts;
  return JSON.stringify({ ...plain, events, shapes, model: buildModel(id, texts) });
}
