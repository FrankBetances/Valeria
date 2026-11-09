// Escenas de RA sobre la mesa (9/11/2026), una por set y por actividad Solo Lúa.
// La referencia es la de S1 que validó Frank: el adulto toca la mesa, la escena
// queda anclada ahí y cada evento que confirma el adulto cambia lo que se ve.
// Unidades: metros sobre el plano de la mesa, ejes del ancla (+x a la derecha
// de la tableta, +z hacia la tableta). Etapa A: confirma el adulto. Etapa B
// (la cámara reconoce las piezas por marcador) depende del banco D2.
import type { AdultText, SteamWorldId } from './types';
import type { UiLang } from '../valeriaUiLang';
import { a } from './worlds/retos';

export type SceneShapeKind = 'tile' | 'circle' | 'rings' | 'line' | 'flow' | 'arrow' | 'label';
export type SceneShapeStyle = 'piece' | 'ghost' | 'light' | 'warn';

export interface SceneShapeDef {
  readonly kind: SceneShapeKind;
  readonly style?: SceneShapeStyle;
  readonly pts: readonly (readonly [number, number])[];
  readonly w?: number;
  readonly d?: number;
  readonly r?: number;
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

/** Lúa en el centro de la mesa: las actividades Solo Lúa giran alrededor de ella. */
const luaAt = (x = 0, z = 0): SceneShapeDef[] => [circle(x, z, 0.045, 'piece', { text: T.lua })];

export const AR_SCENES: Readonly<Record<ArSceneId, readonly SceneShapeDef[]>> = {
  // S0 · El kit: zócalo, cabeza encajada y placa leída.
  S0: [
    tile(-0.07, -0.07, 0.14, 0.14, 'ghost', { text: T.zocalo }),
    circle(0, 0, 0.05, 'ghost'),
    circle(0, 0, 0.05, 'piece', { text: T.cabeza, after: 'S0.CABEZA_ENCAJADA' }),
    tile(-0.07, -0.07, 0.14, 0.14, 'light', { after: 'S0.LUA_EN_ZOCALO' }),
    tile(0.11, -0.03, 0.06, 0.06, 'ghost', { text: T.placa }),
    arrow([0.14, 0], [0.05, 0], 'light', { last: ['S0.PLACA_LEIDA'] }),
    rings(0, 0, 0.06, { after: 'S0.PLACA_LEIDA' }),
  ],
  // S1 · El camino (el set de referencia): cinco baldosas, un giro y la meta.
  S1: [
    tile(-0.03, 0.06, 0.06, 0.06, 'ghost', { text: T.inicio }),
    tile(-0.03, 0.0, 0.06, 0.06, 'ghost'),
    tile(-0.03, -0.06, 0.06, 0.06, 'ghost'),
    tile(0.03, -0.06, 0.06, 0.06, 'ghost'),
    tile(0.09, -0.06, 0.06, 0.06, 'ghost'),
    circle(0.17, -0.03, 0.035, 'ghost', { text: T.meta }),
    circle(0, 0.09, 0.025, 'light', { after: 'S1.LUA_EN_INICIO' }),
    flow([[0, 0.09], [0, -0.03]], { after: 'S1.LUA_AVANZA' }),
    arrow([0, -0.03], [0.07, -0.03], 'light', { after: 'S1.LUA_GIRA' }),
    tile(0.03, -0.06, 0.06, 0.06, 'warn', { text: T.espera, last: ['S1.CAMINO_ROTO'] }),
    flow([[0.04, -0.03], [0.15, -0.03]], { after: 'S1.LLEGA_META' }),
    rings(0.17, -0.03, 0.04, { after: 'S1.LLEGA_META' }),
  ],
  // S2 · El sonido: resonador, golpe fuerte o suave, raspado y pulso.
  S2: [
    circle(0, 0, 0.05, 'ghost', { text: T.resonador }),
    circle(0, 0, 0.05, 'piece', { after: 'S2.RESONADOR_COLOCADO' }),
    rings(0, 0, 0.07, { text: T.fuerte, last: ['S2.GOLPE_FUERTE'] }),
    rings(0, 0, 0.035, { text: T.debil, last: ['S2.GOLPE_DEBIL'] }),
    flow([[-0.12, 0.06], [-0.08, 0.02], [-0.04, 0.06], [0, 0.02], [0.04, 0.06], [0.08, 0.02], [0.12, 0.06]], { after: 'S2.RASPADO_COMPLETO' }),
    rings(0, 0, 0.05, { last: ['S2.PULSO_SEGUIDO'] }),
  ],
  // S3 · Las rampas: la esfera arriba, salida, llegada rápida o lenta, y se para.
  S3: [
    line([[-0.16, -0.12], [0.14, 0.06]], 'ghost', { text: T.rampa }),
    label(-0.02, -0.06, T.rampa),
    circle(-0.16, -0.12, 0.025, 'ghost', { text: T.esfera }),
    circle(-0.16, -0.12, 0.025, 'piece', { after: 'S3.ESFERA_ARRIBA' }),
    circle(-0.16, -0.12, 0.035, 'warn', { text: T.espera, last: ['S3.SALIDA_ANTICIPADA'] }),
    flow([[-0.16, -0.12], [0.14, 0.06]], { last: ['S3.LLEGADA_RAPIDA', 'S3.LLEGADA_LENTA'] }),
    rings(0.14, 0.06, 0.05, { last: ['S3.LLEGADA_RAPIDA'] }),
    rings(0.14, 0.06, 0.025, { last: ['S3.LLEGADA_LENTA'] }),
    circle(-0.01, -0.03, 0.03, 'warn', { last: ['S3.SE_PARA'] }),
  ],
  // S4 · El soplo: boca redonda, rotor, molinete y dos compuertas.
  S4: [
    circle(-0.1, -0.05, 0.04, 'ghost', { text: T.rotor }),
    circle(0.1, -0.05, 0.04, 'ghost', { text: T.molinete }),
    tile(-0.13, -0.17, 0.08, 0.03, 'ghost', { text: T.compuerta }),
    tile(0.05, -0.17, 0.08, 0.03, 'ghost', { text: T.pesada }),
    arrow([0, 0.1], [0, 0.02], 'light', { last: ['S4.PRAXIA_REDONDEO'] }),
    flow([[0, 0.08], [-0.1, -0.05]], { last: ['S4.ROTOR_GIRA'] }),
    rings(-0.1, -0.05, 0.045, { after: 'S4.ROTOR_GIRA' }),
    flow([[0, 0.08], [0.1, -0.05]], { last: ['S4.MOLINETE_GIRA'] }),
    rings(0.1, -0.05, 0.045, { after: 'S4.MOLINETE_GIRA' }),
    arrow([-0.09, -0.13], [-0.09, -0.2], 'light', { after: 'S4.COMPUERTA_LIGERA' }),
    tile(0.05, -0.17, 0.08, 0.03, 'warn', { last: ['S4.COMPUERTA_PESADA'] }),
  ],
  // S5 · El puente: la viga, dos platillos, la masa, hacia dónde cae y el equilibrio.
  S5: [
    line([[-0.15, 0], [0.15, 0]], 'ghost'),
    tile(-0.19, -0.03, 0.06, 0.06, 'ghost', { text: T.izq }),
    tile(0.13, -0.03, 0.06, 0.06, 'ghost', { text: T.dcha }),
    circle(-0.16, 0, 0.022, 'piece', { after: 'S5.MASA_COLOCADA' }),
    arrow([-0.16, -0.08], [-0.16, 0.06], 'warn', { last: ['S5.INCLINA_IZQ'] }),
    arrow([0.16, -0.08], [0.16, 0.06], 'warn', { last: ['S5.INCLINA_DCHA'] }),
    line([[-0.15, 0], [0.15, 0]], 'light', { text: T.equilibrio, after: 'S5.EQUILIBRIO' }),
    label(0, 0.05, T.equilibrio, { after: 'S5.EQUILIBRIO' }),
    tile(-0.15, -0.02, 0.3, 0.04, 'light', { after: 'S5.PUENTE_ESTABLE' }),
  ],
  // S6 · El jardín: sembrar, regar, brotar, la sombra, florecer y la noche.
  S6: [
    tile(-0.09, -0.06, 0.18, 0.12, 'ghost', { text: T.tierra }),
    circle(0.2, -0.15, 0.03, 'ghost', { text: T.sol }),
    circle(0, 0, 0.015, 'piece', { text: T.semilla, after: 'S6.SIEMBRA' }),
    flow([[-0.15, 0.1], [-0.02, 0.01]], { last: ['S6.RIEGO'] }),
    circle(0, 0, 0.03, 'light', { after: 'S6.BROTE' }),
    line([[0.2, -0.15], [0, 0], [-0.12, 0.09]], 'light', { last: ['S6.SOMBRA_ALINEADA'] }),
    rings(0, 0, 0.05, { after: 'S6.FLORECE' }),
    label(0, -0.1, T.noche, { last: ['S6.NOCHE'] }),
  ],
  // S8 · El paso de peatones: barrera, el peatón cruza y el turno.
  S8: [
    tile(-0.12, -0.04, 0.24, 0.08, 'ghost', { text: T.paso }),
    line([[-0.15, -0.07], [-0.02, -0.07]], 'ghost', { text: T.barrera }),
    line([[-0.15, -0.07], [0.15, -0.07]], 'warn', { last: ['S8.BARRERA_BAJA'] }),
    arrow([0, 0.06], [0, -0.06], 'light', { last: ['S8.PEATON_CRUZA'] }),
    arrow([-0.15, -0.07], [-0.15, -0.16], 'light', { last: ['S8.BARRERA_SUBE'] }),
    rings(0, 0, 0.06, { after: 'S8.TURNO_COMPLETO' }),
  ],
  // S9 · Bomberos: aviso, rampa y diana.
  S9: [
    line([[-0.15, 0.06], [0.05, -0.06]], 'ghost', { text: T.rampa }),
    circle(0.12, -0.1, 0.04, 'ghost', { text: T.diana }),
    circle(0.12, -0.1, 0.02, 'ghost'),
    rings(-0.15, 0.06, 0.04, { text: T.aviso, last: ['S9.AVISO'] }),
    flow([[-0.15, 0.06], [0.05, -0.06]], { after: 'S9.RAMPA' }),
    circle(0.12, -0.1, 0.04, 'light', { after: 'S9.DIANA' }),
    rings(0.12, -0.1, 0.05, { after: 'S9.MISION' }),
  ],
  // S10 · El hospital: llegada, camilla, latido y alta.
  S10: [
    tile(-0.05, -0.15, 0.1, 0.07, 'ghost', { text: T.hospital }),
    tile(-0.06, -0.03, 0.12, 0.06, 'ghost', { text: T.camilla }),
    arrow([0, 0.12], [0, 0.04], 'light', { last: ['S10.LLEGADA'] }),
    tile(-0.06, -0.03, 0.12, 0.06, 'light', { after: 'S10.CAMILLA' }),
    rings(0, 0, 0.03, { last: ['S10.LATIDO'] }),
    arrow([0, 0.04], [0.16, 0.1], 'light', { text: T.alta, last: ['S10.ALTA'] }),
    label(0.16, 0.13, T.alta, { after: 'S10.ALTA' }),
  ],
  // S11 · El tren: acoplar, paso seguro, en marcha y andén.
  S11: [
    line([[-0.18, 0.02], [0.18, 0.02]], 'ghost'),
    line([[-0.18, -0.02], [0.18, -0.02]], 'ghost', { text: T.via }),
    tile(0.12, -0.1, 0.08, 0.05, 'ghost', { text: T.anden }),
    tile(-0.15, -0.025, 0.05, 0.05, 'piece'),
    tile(-0.095, -0.025, 0.05, 0.05, 'piece', { after: 'S11.ACOPLADO' }),
    circle(0, 0, 0.04, 'light', { last: ['S11.PASO_SEGURO'] }),
    flow([[-0.12, 0], [0.12, 0]], { after: 'S11.EN_MARCHA' }),
    rings(0.16, -0.075, 0.04, { after: 'S11.ANDEN' }),
  ],
  // L02 · ¿Hacia dónde mira Lúa? Tres cosas alrededor.
  L02: [
    ...luaAt(),
    circle(-0.14, -0.06, 0.025, 'ghost', { text: T.cosa1 }),
    circle(0, -0.16, 0.025, 'ghost', { text: T.cosa2 }),
    circle(0.14, -0.06, 0.025, 'ghost', { text: T.cosa3 }),
    arrow([0, -0.05], [0, -0.12], 'light', { last: ['L02.GIRA'] }),
    flow([[0, -0.05], [0, -0.135]], { last: ['L02.ALINEA'] }),
    rings(0, 0, 0.05, { after: 'L02.FIN' }),
  ],
  // L03 · El antojo de Lúa: el plato, la entrega y las gracias.
  L03: [
    ...luaAt(),
    circle(0.14, 0.06, 0.035, 'ghost', { text: T.plato }),
    rings(0, 0, 0.05, { last: ['L03.ANTOJO'] }),
    flow([[0.14, 0.06], [0.04, 0.01]], { last: ['L03.ENTREGA'] }),
    circle(0.14, 0.06, 0.035, 'light', { after: 'L03.ENTREGA' }),
    rings(0, 0, 0.06, { last: ['L03.GRACIAS'] }),
  ],
  // L04 · Lúa duerme: calma y despertar.
  L04: [
    ...luaAt(),
    label(0.06, -0.07, T.zzz, { last: ['L04.DORMIDA', 'L04.CALMA'] }),
    rings(0, 0, 0.04, { last: ['L04.CALMA'] }),
    rings(0, 0, 0.07, { last: ['L04.DESPIERTA'] }),
  ],
  // L05 · La mano despacio: lenta, rápida y el rincón.
  L05: [
    ...luaAt(),
    tile(0.12, -0.16, 0.07, 0.07, 'ghost', { text: T.rincon }),
    arrow([-0.16, 0.1], [-0.06, 0.03], 'light', { last: ['L05.MANO_LENTA'] }),
    arrow([-0.16, 0.1], [-0.06, 0.03], 'warn', { last: ['L05.MANO_RAPIDA'] }),
    flow([[0.04, -0.03], [0.15, -0.12]], { last: ['L05.RINCON'] }),
    tile(0.12, -0.16, 0.07, 0.07, 'light', { after: 'L05.RINCON' }),
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
}

/** JSON que lee ValeriaArSceneActivity. Una sola fuente: esta tabla. */
export function buildArSceneSpec(id: ArSceneId, lang: UiLang, texts: ArSceneTexts, events: readonly ArSceneEventInput[]): string {
  const shapes = AR_SCENES[id].map((s) => ({
    kind: s.kind,
    style: s.style ?? 'piece',
    pts: s.pts.map((p) => [p[0], p[1]]),
    w: s.w ?? 0,
    d: s.d ?? 0,
    r: s.r ?? 0,
    text: s.text ? s.text[lang] : '',
    ...(s.after ? { after: s.after } : {}),
    ...(s.last ? { last: [...s.last] } : {}),
  }));
  return JSON.stringify({ ...texts, events, shapes });
}
