#!/usr/bin/env node
// ============================================================================
// Valeria+ · Generador de los modelos 3D del bloque de Realidad Aumentada
//
// Escribe los .glb de assets/models a partir de geometría descrita aquí: sin
// dependencias, sin binarios opacos y sin descargas. Se ejecuta con
//   npm run build:ar-models
//
// ── Por qué generar los modelos y no descargarlos ──────────────────────────
// Un asset de banco gratuito trae siempre las mismas tres dudas: qué licencia
// tiene de verdad, si la conserva mañana y si sus animaciones se llaman como el
// código espera. Generándolos, las tres desaparecen: la autoría es del
// proyecto, la licencia es CC0 y los nombres de animación salen del mismo
// fichero que los consume. Además son diminutos —unos pocos KB frente a los
// 2 MB de presupuesto por modelo—, lo que deja el techo de +25 MB de descarga
// del bloque entero prácticamente intacto.
//
// ── Qué son y qué no son ───────────────────────────────────────────────────
// Son modelos de trabajo, no ilustración final: formas limpias, colores
// planos, silueta reconocible a 35 cm en una pantalla de 6 pulgadas. Sirven
// para jugar y para medir desde el primer día. Si algún día llega un encargo
// artístico, sustituirlo es dejar caer un .glb con las MISMAS animaciones
// (`celebrate`, `spin360`) en esta carpeta: no se toca una línea de Kotlin.
//
// ── Restricción clínica que sí condiciona el diseño ────────────────────────
// El refuerzo es contingente al gesto motor, así que la animación de premio
// tiene que leerse **de un vistazo y desde lejos**: un salto y un giro
// completos, no un matiz. Un niño de 4 años que no distingue si le premiaron
// deja de tener refuerzo, por bonito que sea el modelo.
// ============================================================================
'use strict';

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'models');

// ---------------------------------------------------------------------------
// Constructor de glTF 2.0 binario
// ---------------------------------------------------------------------------
const COMPONENT = { FLOAT: 5126, USHORT: 5123 };

class GltfBuilder {
  constructor() {
    this.json = {
      asset: {
        version: '2.0',
        generator: 'Valeria+ scripts/build-ar-models.js',
        copyright: 'Valeria+ (Dr. Frank Alberto Betances Reinoso) · CC0-1.0',
      },
      scene: 0,
      scenes: [{ nodes: [] }],
      nodes: [],
      meshes: [],
      materials: [],
      accessors: [],
      bufferViews: [],
      buffers: [],
    };
    this.chunks = [];
    this.byteLength = 0;
  }

  // Los bufferViews se alinean a 4 bytes: el visor puede mapear los datos
  // directamente y algunos runtimes se niegan a cargar si no lo están.
  pushBufferView(buffer, target) {
    const padding = (4 - (this.byteLength % 4)) % 4;
    if (padding) { this.chunks.push(Buffer.alloc(padding)); this.byteLength += padding; }
    const view = { buffer: 0, byteOffset: this.byteLength, byteLength: buffer.length };
    if (target) view.target = target;
    this.chunks.push(buffer);
    this.byteLength += buffer.length;
    this.json.bufferViews.push(view);
    return this.json.bufferViews.length - 1;
  }

  addFloatAccessor(values, type, componentsPerElement, target) {
    const buffer = Buffer.alloc(values.length * 4);
    values.forEach((v, i) => buffer.writeFloatLE(v, i * 4));
    const bufferView = this.pushBufferView(buffer, target);

    const count = values.length / componentsPerElement;
    const min = new Array(componentsPerElement).fill(Infinity);
    const max = new Array(componentsPerElement).fill(-Infinity);
    for (let i = 0; i < count; i++) {
      for (let c = 0; c < componentsPerElement; c++) {
        const v = values[i * componentsPerElement + c];
        if (v < min[c]) min[c] = v;
        if (v > max[c]) max[c] = v;
      }
    }
    this.json.accessors.push({
      bufferView, componentType: COMPONENT.FLOAT, count, type, min, max,
    });
    return this.json.accessors.length - 1;
  }

  addIndexAccessor(indices) {
    const buffer = Buffer.alloc(indices.length * 2);
    indices.forEach((v, i) => buffer.writeUInt16LE(v, i * 2));
    const bufferView = this.pushBufferView(buffer, 34963 /* ELEMENT_ARRAY_BUFFER */);
    this.json.accessors.push({
      bufferView,
      componentType: COMPONENT.USHORT,
      count: indices.length,
      type: 'SCALAR',
      min: [Math.min(...indices)],
      max: [Math.max(...indices)],
    });
    return this.json.accessors.length - 1;
  }

  addMaterial(name, [r, g, b], roughness = 0.85) {
    this.json.materials.push({
      name,
      pbrMetallicRoughness: {
        baseColorFactor: [r, g, b, 1],
        metallicFactor: 0,
        roughnessFactor: roughness,
      },
    });
    return this.json.materials.length - 1;
  }

  addMesh(name, geometry, material) {
    const position = this.addFloatAccessor(geometry.positions, 'VEC3', 3, 34962 /* ARRAY_BUFFER */);
    const normal = this.addFloatAccessor(geometry.normals, 'VEC3', 3, 34962);
    const indices = this.addIndexAccessor(geometry.indices);
    this.json.meshes.push({
      name,
      primitives: [{ attributes: { POSITION: position, NORMAL: normal }, indices, material }],
    });
    return this.json.meshes.length - 1;
  }

  addNode(node) {
    this.json.nodes.push(node);
    return this.json.nodes.length - 1;
  }

  addRootNode(index) {
    this.json.scenes[0].nodes.push(index);
  }

  /**
   * Animación con muestreadores LINEAR. En glTF la interpolación lineal de
   * cuaterniones es esférica (slerp), y un salto de 180° es ambiguo: por eso
   * los giros completos se describen en pasos de 90° y no en dos claves.
   */
  addAnimation(name, channels) {
    const anim = { name, samplers: [], channels: [] };
    for (const channel of channels) {
      const componentsPerElement = channel.path === 'rotation' ? 4 : 3;
      const input = this.addFloatAccessor(channel.times, 'SCALAR', 1);
      const output = this.addFloatAccessor(
        channel.values.flat(), channel.path === 'rotation' ? 'VEC4' : 'VEC3', componentsPerElement,
      );
      anim.samplers.push({ input, output, interpolation: 'LINEAR' });
      anim.channels.push({
        sampler: anim.samplers.length - 1,
        target: { node: channel.node, path: channel.path },
      });
    }
    if (!this.json.animations) this.json.animations = [];
    this.json.animations.push(anim);
  }

  write(file) {
    const bin = Buffer.concat(this.chunks);
    const binPadded = pad(bin, 0x00);
    this.json.buffers = [{ byteLength: binPadded.length }];

    const jsonBuffer = pad(Buffer.from(JSON.stringify(this.json), 'utf8'), 0x20);

    const header = Buffer.alloc(12);
    header.write('glTF', 0, 'ascii');
    header.writeUInt32LE(2, 4);
    header.writeUInt32LE(12 + 8 + jsonBuffer.length + 8 + binPadded.length, 8);

    const jsonHeader = Buffer.alloc(8);
    jsonHeader.writeUInt32LE(jsonBuffer.length, 0);
    jsonHeader.write('JSON', 4, 'ascii');

    const binHeader = Buffer.alloc(8);
    binHeader.writeUInt32LE(binPadded.length, 0);
    binHeader.writeUInt32LE(0x004e4942, 4); // 'BIN\0'

    const glb = Buffer.concat([header, jsonHeader, jsonBuffer, binHeader, binPadded]);
    fs.writeFileSync(file, glb);
    return glb.length;
  }
}

function pad(buffer, byte) {
  const padding = (4 - (buffer.length % 4)) % 4;
  return padding ? Buffer.concat([buffer, Buffer.alloc(padding, byte)]) : buffer;
}

// ---------------------------------------------------------------------------
// Geometría primitiva. Normales planas por cara: son cuatro formas simples y
// el sombreado duro les sienta mejor que el suavizado, además de evitar
// vértices compartidos con normales promediadas.
// ---------------------------------------------------------------------------
function box(sx, sy, sz, [ox, oy, oz] = [0, 0, 0]) {
  const x = sx / 2, y = sy / 2, z = sz / 2;
  const faces = [
    { n: [0, 0, 1], v: [[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]] },
    { n: [0, 0, -1], v: [[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z]] },
    { n: [1, 0, 0], v: [[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z]] },
    { n: [-1, 0, 0], v: [[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]] },
    { n: [0, 1, 0], v: [[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z]] },
    { n: [0, -1, 0], v: [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]] },
  ];
  const positions = [], normals = [], indices = [];
  faces.forEach((face, f) => {
    face.v.forEach((v) => {
      positions.push(v[0] + ox, v[1] + oy, v[2] + oz);
      normals.push(...face.n);
    });
    const base = f * 4;
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });
  return { positions, normals, indices };
}

function sphere(radius, [ox, oy, oz] = [0, 0, 0], segments = 16, rings = 10, scale = [1, 1, 1]) {
  const positions = [], normals = [], indices = [];
  for (let r = 0; r <= rings; r++) {
    const phi = (r / rings) * Math.PI;
    for (let s = 0; s <= segments; s++) {
      const theta = (s / segments) * Math.PI * 2;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);
      positions.push(nx * radius * scale[0] + ox, ny * radius * scale[1] + oy, nz * radius * scale[2] + oz);
      normals.push(nx, ny, nz);
    }
  }
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const a = r * (segments + 1) + s;
      const b = a + segments + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  return { positions, normals, indices };
}

function cylinder(radius, height, [ox, oy, oz] = [0, 0, 0], segments = 14, axis = 'y') {
  const positions = [], normals = [], indices = [];
  const h = height / 2;
  const place = (angle, offset) => {
    const c = Math.cos(angle), s = Math.sin(angle);
    if (axis === 'x') return { p: [offset, c * radius, s * radius], n: [0, c, s] };
    if (axis === 'z') return { p: [c * radius, s * radius, offset], n: [c, s, 0] };
    return { p: [c * radius, offset, s * radius], n: [c, 0, s] };
  };
  for (let s = 0; s <= segments; s++) {
    const angle = (s / segments) * Math.PI * 2;
    for (const offset of [-h, h]) {
      const { p, n } = place(angle, offset);
      positions.push(p[0] + ox, p[1] + oy, p[2] + oz);
      normals.push(...n);
    }
  }
  for (let s = 0; s < segments; s++) {
    const a = s * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  // Tapas: un abanico por cara. Con 14 segmentos son 28 triángulos más, que a
  // esta escala no se notan y evitan ver el interior del cilindro.
  for (const [offset, normal, flip] of [[-h, -1, true], [h, 1, false]]) {
    const center = positions.length / 3;
    const { p } = place(0, offset);
    positions.push(ox + (axis === 'x' ? offset : 0), oy + (axis === 'y' ? offset : 0), oz + (axis === 'z' ? offset : 0));
    normals.push(axis === 'x' ? normal : 0, axis === 'y' ? normal : 0, axis === 'z' ? normal : 0);
    void p;
    const first = positions.length / 3;
    for (let s = 0; s <= segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      const q = place(angle, offset);
      positions.push(q.p[0] + ox, q.p[1] + oy, q.p[2] + oz);
      normals.push(axis === 'x' ? normal : 0, axis === 'y' ? normal : 0, axis === 'z' ? normal : 0);
    }
    for (let s = 0; s < segments; s++) {
      if (flip) indices.push(center, first + s + 1, first + s);
      else indices.push(center, first + s, first + s + 1);
    }
  }
  return { positions, normals, indices };
}

/** Cuaternión de una rotación de `deg` grados alrededor del eje dado. */
function quat(axis, deg) {
  const half = (deg * Math.PI) / 360;
  const s = Math.sin(half);
  return [
    axis === 'x' ? s : 0,
    axis === 'y' ? s : 0,
    axis === 'z' ? s : 0,
    Math.cos(half),
  ];
}

/** Giro completo en pasos de 90°: cinco claves, sin ambigüedad de slerp. */
function fullTurn(axis, duration) {
  const times = [0, 0.25, 0.5, 0.75, 1].map((t) => +(t * duration).toFixed(4));
  const values = [0, 90, 180, 270, 360].map((deg) => quat(axis, deg));
  return { times, values };
}

// ---------------------------------------------------------------------------
// Los cinco modelos
// ---------------------------------------------------------------------------
const PALETTE = {
  rojo: [0.85, 0.24, 0.24],
  rojoManzana: [0.83, 0.16, 0.20],
  turquesa: [0.0, 0.77, 0.75],   // color de marca de Valeria+
  azul: [0.23, 0.44, 0.83],
  crema: [0.96, 0.93, 0.86],
  marron: [0.55, 0.36, 0.20],
  marronClaro: [0.78, 0.58, 0.35],
  verde: [0.35, 0.68, 0.31],
  gris: [0.22, 0.22, 0.25],
  blanco: [0.97, 0.97, 0.97],
  amarillo: [0.98, 0.80, 0.13],
};

/**
 * AR-1 · El coche que acelera con el redondeo labial.
 *
 * La traslación en Z la hace el código, proporcional al progreso del sostén:
 * el modelo solo aporta la animación de meta (`celebrate`), que es el salto
 * con giro de ruedas del momento en que se cumple el criterio.
 */
function buildCoche() {
  const g = new GltfBuilder();
  const carroceria = g.addMaterial('carroceria', PALETTE.rojo);
  const cabina = g.addMaterial('cabina', PALETTE.turquesa, 0.4);
  const rueda = g.addMaterial('rueda', PALETTE.gris, 0.95);
  const faro = g.addMaterial('faro', PALETTE.amarillo, 0.3);

  const cuerpo = g.addNode({
    name: 'carroceria',
    mesh: g.addMesh('carroceria', box(1.6, 0.45, 0.85, [0, 0.35, 0]), carroceria),
  });
  const techo = g.addNode({
    name: 'cabina',
    mesh: g.addMesh('cabina', box(0.8, 0.38, 0.7, [-0.05, 0.76, 0]), cabina),
  });
  const luces = g.addNode({
    name: 'faros',
    mesh: g.addMesh('faros', box(0.06, 0.14, 0.55, [0.8, 0.38, 0]), faro),
  });

  // Ruedas como hijas de un nodo propio: así giran juntas en `celebrate` sin
  // arrastrar la carrocería.
  const ejes = [];
  [[0.5, 0.42], [0.5, -0.42], [-0.5, 0.42], [-0.5, -0.42]].forEach(([x, z], i) => {
    ejes.push(g.addNode({
      name: `rueda_${i}`,
      mesh: g.addMesh(`rueda_${i}`, cylinder(0.22, 0.14, [x, 0.22, z], 14, 'z'), rueda),
    }));
  });
  const ruedas = g.addNode({ name: 'ruedas', children: ejes });

  const root = g.addNode({ name: 'coche', children: [cuerpo, techo, luces, ruedas] });
  g.addRootNode(root);

  const turn = fullTurn('z', 0.6);
  g.addAnimation('celebrate', [
    {
      node: root,
      path: 'translation',
      times: [0, 0.18, 0.36, 0.54, 0.72, 0.9],
      values: [[0, 0, 0], [0, 0.42, 0], [0, 0, 0], [0, 0.26, 0], [0, 0, 0], [0, 0, 0]],
    },
    { node: ruedas, path: 'rotation', times: turn.times, values: turn.values },
  ]);

  return g;
}

/**
 * AR-2 · El perro que celebra el giro hacia el sonido.
 *
 * `celebrate` es lo único que este modelo tiene que hacer, y solo se dispara
 * ante giro correcto dentro de ventana. En ensayo trampa NUNCA se reproduce
 * —y esa ausencia también es un dato—.
 */
function buildPerro() {
  const g = new GltfBuilder();
  const pelo = g.addMaterial('pelo', PALETTE.marronClaro);
  const peloOscuro = g.addMaterial('pelo_oscuro', PALETTE.marron);
  const hocico = g.addMaterial('hocico', PALETTE.gris, 0.5);

  const cuerpo = g.addNode({
    name: 'cuerpo',
    mesh: g.addMesh('cuerpo', box(1.0, 0.5, 0.55, [0, 0.62, 0]), pelo),
  });

  const patas = [];
  [[0.32, 0.2], [0.32, -0.2], [-0.32, 0.2], [-0.32, -0.2]].forEach(([x, z], i) => {
    patas.push(g.addNode({
      name: `pata_${i}`,
      mesh: g.addMesh(`pata_${i}`, box(0.16, 0.4, 0.16, [x, 0.2, z]), peloOscuro),
    }));
  });

  const craneo = g.addNode({
    name: 'craneo',
    mesh: g.addMesh('craneo', box(0.44, 0.42, 0.42, [0, 0.16, 0]), pelo),
  });
  const morro = g.addNode({
    name: 'morro',
    mesh: g.addMesh('morro', box(0.26, 0.2, 0.24, [0.3, 0.06, 0]), hocico),
  });
  const orejas = [];
  [0.19, -0.19].forEach((z, i) => {
    orejas.push(g.addNode({
      name: `oreja_${i}`,
      mesh: g.addMesh(`oreja_${i}`, box(0.16, 0.24, 0.08, [-0.04, 0.4, z]), peloOscuro),
    }));
  });
  // La cabeza es un nodo con traslación propia para poder asentir sin mover el
  // cuerpo: el asentimiento es la parte que un niño lee como «me ha visto».
  const cabeza = g.addNode({
    name: 'cabeza',
    translation: [0.56, 0.78, 0],
    children: [craneo, morro, ...orejas],
  });

  const colaMesh = g.addNode({
    name: 'cola_seg',
    mesh: g.addMesh('cola_seg', box(0.36, 0.12, 0.12, [-0.18, 0, 0]), pelo),
  });
  const cola = g.addNode({ name: 'cola', translation: [-0.5, 0.8, 0], children: [colaMesh] });

  const root = g.addNode({ name: 'perro', children: [cuerpo, ...patas, cabeza, cola] });
  g.addRootNode(root);

  g.addAnimation('celebrate', [
    {
      node: root,
      path: 'translation',
      times: [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2],
      values: [[0, 0, 0], [0, 0.34, 0], [0, 0, 0], [0, 0.34, 0], [0, 0, 0], [0, 0.16, 0], [0, 0, 0]],
    },
    {
      // Rabo: cuatro barridos en 1,2 s. Es la señal más legible a distancia.
      node: cola,
      path: 'rotation',
      times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2],
      values: [
        quat('y', 0), quat('y', 38), quat('y', -38), quat('y', 38), quat('y', -38),
        quat('y', 38), quat('y', -38), quat('y', 20), quat('y', 0),
      ],
    },
    {
      node: cabeza,
      path: 'rotation',
      times: [0, 0.3, 0.6, 0.9, 1.2],
      values: [quat('z', 0), quat('z', -14), quat('z', 6), quat('z', -10), quat('z', 0)],
    },
  ]);

  return g;
}

/** Diana y distractores de AR-3. Todos giran igual: `spin360` al confirmarse. */
function buildManzana() {
  const g = new GltfBuilder();
  const piel = g.addMaterial('piel', PALETTE.rojoManzana, 0.45);
  const rabo = g.addMaterial('rabo', PALETTE.marron);
  const hoja = g.addMaterial('hoja', PALETTE.verde);

  const fruta = g.addNode({
    name: 'fruta',
    mesh: g.addMesh('fruta', sphere(0.42, [0, 0.44, 0], 18, 12, [1, 0.92, 1]), piel),
  });
  const tallo = g.addNode({
    name: 'tallo',
    mesh: g.addMesh('tallo', cylinder(0.035, 0.26, [0, 0.88, 0], 8, 'y'), rabo),
  });
  const hojita = g.addNode({
    name: 'hoja',
    mesh: g.addMesh('hoja', sphere(0.16, [0.14, 0.95, 0], 10, 6, [1, 0.22, 0.5]), hoja),
  });

  const root = g.addNode({ name: 'manzana', children: [fruta, tallo, hojita] });
  g.addRootNode(root);

  const turn = fullTurn('y', 1.0);
  g.addAnimation('spin360', [{ node: root, path: 'rotation', times: turn.times, values: turn.values }]);
  return g;
}

function buildPelota() {
  const g = new GltfBuilder();
  const cuero = g.addMaterial('cuero', PALETTE.blanco, 0.6);
  const franja = g.addMaterial('franja', PALETTE.azul, 0.6);

  const esfera = g.addNode({
    name: 'esfera',
    mesh: g.addMesh('esfera', sphere(0.42, [0, 0.44, 0], 18, 12), cuero),
  });
  // Una banda ecuatorial ligeramente mayor que la esfera: sin textura, es lo
  // que evita que una pelota blanca girando parezca inmóvil.
  const banda = g.addNode({
    name: 'banda',
    mesh: g.addMesh('banda', sphere(0.425, [0, 0.44, 0], 18, 12, [1, 0.28, 1]), franja),
  });

  const root = g.addNode({ name: 'pelota', children: [esfera, banda] });
  g.addRootNode(root);

  const turn = fullTurn('y', 1.0);
  g.addAnimation('spin360', [{ node: root, path: 'rotation', times: turn.times, values: turn.values }]);
  return g;
}

function buildZapato() {
  const g = new GltfBuilder();
  const suela = g.addMaterial('suela', PALETTE.crema, 0.9);
  const empeine = g.addMaterial('empeine', PALETTE.azul);
  const cordon = g.addMaterial('cordon', PALETTE.blanco, 0.7);

  const base = g.addNode({
    name: 'suela',
    mesh: g.addMesh('suela', box(0.95, 0.14, 0.38, [0, 0.07, 0]), suela),
  });
  const cuerpo = g.addNode({
    name: 'empeine',
    mesh: g.addMesh('empeine', box(0.55, 0.3, 0.34, [-0.16, 0.28, 0]), empeine),
  });
  const punta = g.addNode({
    name: 'puntera',
    mesh: g.addMesh('puntera', sphere(0.2, [0.3, 0.2, 0], 12, 8, [1.1, 0.75, 0.9]), empeine),
  });
  const lazo = g.addNode({
    name: 'cordones',
    mesh: g.addMesh('cordones', box(0.3, 0.05, 0.3, [-0.1, 0.43, 0]), cordon),
  });

  const root = g.addNode({ name: 'zapato', children: [base, cuerpo, punta, lazo] });
  g.addRootNode(root);

  const turn = fullTurn('y', 1.0);
  g.addAnimation('spin360', [{ node: root, path: 'rotation', times: turn.times, values: turn.values }]);
  return g;
}

// ---------------------------------------------------------------------------
function buildLua() {
  const g = new GltfBuilder();
  const pelaje = g.addMaterial('pelaje', [0.96, 0.95, 0.92], 0.7);
  const interiorOreja = g.addMaterial('oreja_rosa', [0.94, 0.65, 0.72], 0.6);
  const ojoTurquesa = g.addMaterial('ojo_turquesa', PALETTE.turquesa, 0.2);
  const narizRosa = g.addMaterial('nariz_rosa', [0.92, 0.42, 0.52], 0.4);
  const collarMat = g.addMaterial('collar', PALETTE.turquesa, 0.5);
  const cascabelMat = g.addMaterial('cascabel', PALETTE.amarillo, 0.3);

  // Cuerpo
  const cuerpo = g.addNode({
    name: 'cuerpo',
    mesh: g.addMesh('cuerpo', sphere(0.42, [0, 0.52, 0], 16, 10, [0.9, 1.1, 0.9]), pelaje),
  });

  // Patas
  const patas = [];
  [[0.22, 0.16], [0.22, -0.16], [-0.22, 0.16], [-0.22, -0.16]].forEach(([x, z], i) => {
    patas.push(g.addNode({
      name: `pata_${i}`,
      mesh: g.addMesh(`pata_${i}`, cylinder(0.09, 0.28, [x, 0.14, z], 10, 'y'), pelaje),
    }));
  });

  // Cabeza y elementos faciales
  const craneo = g.addNode({
    name: 'craneo',
    mesh: g.addMesh('craneo', sphere(0.36, [0, 0.18, 0], 16, 10, [1.08, 0.95, 0.98]), pelaje),
  });

  // Orejas triangulares
  const orejas = [];
  [-0.18, 0.18].forEach((x, i) => {
    orejas.push(g.addNode({
      name: `oreja_${i}`,
      mesh: g.addMesh(`oreja_${i}`, box(0.12, 0.22, 0.08, [x, 0.54, 0]), pelaje),
    }));
    orejas.push(g.addNode({
      name: `oreja_int_${i}`,
      mesh: g.addMesh(`oreja_int_${i}`, box(0.08, 0.16, 0.04, [x, 0.52, 0.03]), interiorOreja),
    }));
  });

  // Ojos turquesa de Lúa
  const ojos = [];
  [-0.13, 0.13].forEach((x, i) => {
    ojos.push(g.addNode({
      name: `ojo_${i}`,
      mesh: g.addMesh(`ojo_${i}`, sphere(0.055, [x, 0.22, 0.32], 10, 6, [1, 1.2, 0.6]), ojoTurquesa),
    }));
  });

  // Hocico y nariz
  const hocico = g.addNode({
    name: 'hocico',
    mesh: g.addMesh('hocico', sphere(0.09, [0, 0.12, 0.32], 10, 6, [1.3, 0.8, 0.8]), pelaje),
  });
  const nariz = g.addNode({
    name: 'nariz',
    mesh: g.addMesh('nariz', sphere(0.035, [0, 0.15, 0.39], 8, 5, [1.2, 0.9, 0.6]), narizRosa),
  });

  // Collar y cascabel
  const collar = g.addNode({
    name: 'collar',
    mesh: g.addMesh('collar', cylinder(0.24, 0.06, [0, -0.06, 0], 14, 'y'), collarMat),
  });
  const cascabel = g.addNode({
    name: 'cascabel',
    mesh: g.addMesh('cascabel', sphere(0.06, [0, -0.08, 0.24], 10, 6), cascabelMat),
  });

  const cabeza = g.addNode({
    name: 'cabeza',
    translation: [0, 0.82, 0.1],
    children: [craneo, ...orejas, ...ojos, hocico, nariz, collar, cascabel],
  });

  // Cola
  const colaMesh = g.addNode({
    name: 'cola_mesh',
    mesh: g.addMesh('cola_mesh', cylinder(0.045, 0.36, [0, 0.18, -0.16], 10, 'y'), pelaje),
  });
  const cola = g.addNode({ name: 'cola', translation: [0, 0.38, -0.32], children: [colaMesh] });

  const root = g.addNode({ name: 'lua', children: [cuerpo, ...patas, cabeza, cola] });
  g.addRootNode(root);

  // Animación celebrate: salto + alegría + batir de cola + giro suave
  g.addAnimation('celebrate', [
    {
      node: root,
      path: 'translation',
      times: [0, 0.18, 0.36, 0.54, 0.72, 0.9, 1.1],
      values: [[0, 0, 0], [0, 0.45, 0], [0, 0, 0], [0, 0.32, 0], [0, 0, 0], [0, 0.12, 0], [0, 0, 0]],
    },
    {
      node: cola,
      path: 'rotation',
      times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.1],
      values: [
        quat('y', 0), quat('y', 42), quat('y', -42), quat('y', 42),
        quat('y', -42), quat('y', 30), quat('y', -20), quat('y', 0),
      ],
    },
    {
      node: cabeza,
      path: 'rotation',
      times: [0, 0.25, 0.5, 0.75, 1.1],
      values: [quat('x', 0), quat('x', -12), quat('x', 8), quat('x', -6), quat('x', 0)],
    },
  ]);

  return g;
}

/**
 * AR-5 · El pez dorado que se lanza a Lúa como premio.
 */
function buildPez() {
  const g = new GltfBuilder();
  const escamas = g.addMaterial('escamas', PALETTE.amarillo, 0.35);
  const aletas = g.addMaterial('aletas', [0.98, 0.55, 0.12], 0.5);
  const ojo = g.addMaterial('ojo', PALETTE.gris, 0.2);

  // Cuerpo ovalado de pez
  const cuerpo = g.addNode({
    name: 'cuerpo_pez',
    mesh: g.addMesh('cuerpo_pez', sphere(0.38, [0, 0.38, 0], 16, 10, [1.4, 0.8, 0.5]), escamas),
  });

  // Cola
  const cola = g.addNode({
    name: 'cola_pez',
    mesh: g.addMesh('cola_pez', box(0.24, 0.32, 0.04, [-0.48, 0.38, 0]), aletas),
  });

  // Aleta dorsal
  const aletaDorsal = g.addNode({
    name: 'aleta_dorsal',
    mesh: g.addMesh('aleta_dorsal', box(0.3, 0.14, 0.04, [0.02, 0.68, 0]), aletas),
  });

  // Ojos
  const ojos = [];
  [0.18, -0.18].forEach((z, i) => {
    ojos.push(g.addNode({
      name: `ojo_pez_${i}`,
      mesh: g.addMesh(`ojo_pez_${i}`, sphere(0.04, [0.32, 0.42, z], 8, 5), ojo),
    }));
  });

  const root = g.addNode({ name: 'pez', children: [cuerpo, cola, aletaDorsal, ...ojos] });
  g.addRootNode(root);

  const turn = fullTurn('y', 0.8);
  g.addAnimation('spin360', [{ node: root, path: 'rotation', times: turn.times, values: turn.values }]);
  return g;
}

// ---------------------------------------------------------------------------
const MODELS = [
  { file: 'coche.glb', build: buildCoche, animation: 'celebrate', exercise: 'AR-1' },
  { file: 'perro.glb', build: buildPerro, animation: 'celebrate', exercise: 'AR-2' },
  { file: 'manzana.glb', build: buildManzana, animation: 'spin360', exercise: 'AR-3' },
  { file: 'pelota.glb', build: buildPelota, animation: 'spin360', exercise: 'AR-3 (distractor)' },
  { file: 'zapato.glb', build: buildZapato, animation: 'spin360', exercise: 'AR-3 (distractor)' },
  { file: 'lua.glb', build: buildLua, animation: 'celebrate', exercise: 'AR-4 / AR-6 (Lúa Mascota)' },
  { file: 'pez.glb', build: buildPez, animation: 'spin360', exercise: 'AR-5 (Premio Pez Dorado)' },
];

// Presupuesto por modelo del contrato de assets. No es decorativo: el bloque
// entero tiene un techo de +25 MB de descarga que se mide en la Fase 3.
const MAX_BYTES = 2 * 1024 * 1024;

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let total = 0;
  for (const model of MODELS) {
    const builder = model.build();
    const out = path.join(OUT_DIR, model.file);
    const bytes = builder.write(out);
    total += bytes;

    const meshes = builder.json.meshes.length;
    const triangles = builder.json.meshes.reduce((sum, mesh) => {
      const acc = builder.json.accessors[mesh.primitives[0].indices];
      return sum + acc.count / 3;
    }, 0);

    if (bytes > MAX_BYTES) {
      throw new Error(`${model.file} pesa ${bytes} B y el contrato son ${MAX_BYTES} B por modelo.`);
    }
    const names = (builder.json.animations || []).map((a) => a.name);
    if (!names.includes(model.animation)) {
      throw new Error(`${model.file} debe exponer la animación '${model.animation}' y expone [${names}].`);
    }
    console.log(
      `✓ ${model.file.padEnd(12)} ${String(bytes).padStart(7)} B · ` +
      `${String(triangles).padStart(4)} triángulos · ${meshes} mallas · animación '${names.join(', ')}' · ${model.exercise}`,
    );
  }
  console.log(`\nTotal: ${(total / 1024).toFixed(1)} KB para los ${MODELS.length} modelos.`);
}

if (require.main === module) main();

module.exports = { MODELS, OUT_DIR };
