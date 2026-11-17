#!/usr/bin/env python3
"""Valeria+ · Modelos 3D de los sets para la RA (10/11/2026; sets-v3 y Lúa V5 r3 desde el 17/11/2026).

Fuente única: `lua-construye` (piezas STL de cada set y su montaje medido,
`sets/<set>/montaje_v2.json`, con la matriz de cada pieza y los pasos) y
`lua-firmware` (muñeco Lúa V5 r3, `cad/lua-v5-r3/montaje`). De ahí salen:
  · android-native/valeria-ar/src/main/assets/sets/*.vmesh  (mallas, metros)
  · src/steam/arSetModels.generated.ts                      (pasos por set)

Uso:  python3 scripts/build-ar-set-models.py --construye ../lua-construye --firmware ../lua-firmware
No inventa geometría: cada pieza, color y posición sale de esos repositorios.
Ejes de salida (ancla de ARCore): X = x, Y = z (arriba), Z = −y, en metros.
"""
import argparse, ast, json, math, os, struct, sys
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('--construye', required=True)
ap.add_argument('--firmware', required=True)
args = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_MESH = os.path.join(ROOT, 'android-native/valeria-ar/src/main/assets/sets')
OUT_TS = os.path.join(ROOT, 'src/steam/arSetModels.generated.ts')
os.makedirs(OUT_MESH, exist_ok=True)
for _viejo in os.listdir(OUT_MESH):          # sin mallas de una generación anterior en el APK
    if _viejo.endswith('.vmesh'): os.remove(os.path.join(OUT_MESH, _viejo))
C, F = args.construye, args.firmware

def read_stl(path):
    b = open(path, 'rb').read()
    n = struct.unpack('<I', b[80:84])[0]
    assert len(b) == 84 + n * 50, f'STL no binario: {path}'
    rec = np.frombuffer(b, dtype=np.dtype([('n', '<f4', 3), ('v', '<f4', (3, 3)), ('a', '<u2')]), count=n, offset=84)
    return rec['v'].astype(np.float64)  # (n, 3, 3) mm

def cluster(tris, cell):
    """Simplificación por rejilla: quita el detalle de roscas que no se ve en RA."""
    q = np.round(tris / cell).astype(np.int64)
    keep = ~((q[:, 0] == q[:, 1]).all(1) | (q[:, 1] == q[:, 2]).all(1) | (q[:, 0] == q[:, 2]).all(1))
    return (q[keep] * cell).astype(np.float64)

def write_vmesh(name, tris_mm):
    """tris_mm en ejes del set (Z arriba). Sale en ejes del ancla, metros, con normal plana."""
    t = tris_mm / 1000.0
    g = np.stack([t[..., 0], t[..., 2], -t[..., 1]], axis=-1)
    nrm = np.cross(g[:, 1] - g[:, 0], g[:, 2] - g[:, 0])
    ln = np.linalg.norm(nrm, axis=1, keepdims=True); ok = ln[:, 0] > 1e-12
    g, nrm = g[ok], nrm[ok] / ln[ok]
    data = np.concatenate([g, np.repeat(nrm[:, None, :], 3, axis=1)], axis=2).astype('<f4')
    with open(os.path.join(OUT_MESH, name + '.vmesh'), 'wb') as f:
        f.write(b'VM01'); f.write(struct.pack('<I', len(g) * 3)); f.write(data.tobytes())
    return len(g)

def rot_xyz(deg):
    rx, ry, rz = [math.radians(a) for a in deg]
    Rx = np.array([[1, 0, 0], [0, math.cos(rx), -math.sin(rx)], [0, math.sin(rx), math.cos(rx)]])
    Ry = np.array([[math.cos(ry), 0, math.sin(ry)], [0, 1, 0], [-math.sin(ry), 0, math.cos(ry)]])
    Rz = np.array([[math.cos(rz), -math.sin(rz), 0], [math.sin(rz), math.cos(rz), 0], [0, 0, 1]])
    return Rz @ Ry @ Rx

def stl_set(carpeta, codigo):
    for p in (f'{C}/sets/{carpeta}/stl/{codigo}.stl', f'{C}/entrega/masque3d-sets-v1/{carpeta}/{codigo}.stl',
              f'{C}/entrega/masque3d-sets-v1/00-comun/{codigo}.stl'):
        if os.path.isfile(p): return p
    raise SystemExit(f'falta la pieza {carpeta}/{codigo}')

# --- Colores: los del manual -------------------------------------------------
src = open(f'{C}/agents/render_manual_sets.py', encoding='utf-8').read()
tree = ast.parse(src)
def ev(node): return eval(compile(ast.Expression(node), '', 'eval'), {'__builtins__': {}}, {})
COLORES = next(ev(n.value) for n in tree.body if isinstance(n, ast.Assign) and getattr(n.targets[0], 'id', '') == 'COLORES')

meshes = {}  # nombre -> (tris, bbox mm)

# --- Muñeco Lúa V5 r3: las mallas de montaje de lua-firmware --------------------
# Las alternativas que ocupan el mismo enchufe se quedan fuera (cascabel ↔ lazo, sombrero ↔ flor) y la tapa
# de la bahía, que va dentro del cubo.
LUA_PARTS = ['cubo_caja', 'cubo_fondo', 'pata_izq', 'pata_der', 'brazo_izq', 'brazo_der', 'ala_izq', 'ala_der',
             'cola', 'lazo', 'cabeza_bloque', 'cabeza_dorso', 'cabeza_tapa', 'oreja_izq', 'oreja_der', 'flor']
def build_lua():
    base = f'{F}/cad/lua-v5-r3'
    colores = {}
    for j in ('cad/lua-v5/cubo_v5.json', 'cad/lua-v5/cabeza_v5.json'):      # los colores de la V5 (los mismos nombres)
        if os.path.isfile(f'{F}/{j}'):
            colores.update({k: v.get('color') for k, v in json.load(open(f'{F}/{j}', encoding='utf-8'))['piezas'].items()})
    placa = json.load(open(f'{base}/cabeza_v6.json', encoding='utf-8'))['placa_v4']['carcasa_placa']
    parts, lo, hi = [], np.full(3, 1e9), np.full(3, -1e9)
    for n in LUA_PARTS:
        t = cluster(read_stl(f'{base}/montaje/{n}.stl'), 2.5)
        v = t.reshape(-1, 3); lo = np.minimum(lo, v.min(0)); hi = np.maximum(hi, v.max(0))
        ck = colores.get(n) if colores.get(n) in COLORES else 'blanco'
        parts.append({'m': 'lua_' + n, 'c': ck, 'tris': write_vmesh('lua_' + n, t)})
    # Disco oscuro del visor: la cara de Lúa (mismo cilindro que dibuja el manual).
    seg, r, zc = 32, placa['d'] / 2 - 1.0, placa['z_cabeza']
    y0, y1 = placa['y_cristal_cabeza'] - 0.8, placa['y_cristal_cabeza'] + 4.0
    tris = []
    for i in range(seg):
        a0, a1 = 2 * math.pi * i / seg, 2 * math.pi * (i + 1) / seg
        p0 = [r * math.cos(a0), y0, zc + r * math.sin(a0)]; p1 = [r * math.cos(a1), y0, zc + r * math.sin(a1)]
        q0 = [p0[0], y1, p0[2]]; q1 = [p1[0], y1, p1[2]]
        tris += [[[0, y0, zc], p0, p1], [p0, q0, q1], [p0, q1, p1]]
    parts.append({'m': 'lua_visor', 'c': 'placa', 'tris': write_vmesh('lua_visor', np.array(tris, float))})
    return parts, lo.tolist() + hi.tolist()

lua_parts, lua_bbox = build_lua()

def gl(p, c):  # punto del set (mm) -> ancla (m)
    return [round((p[0] - c[0]) / 1000, 4), round(p[2] / 1000, 4), round(-(p[1] - c[1]) / 1000, 4)]

def matriz(item):
    if 'matriz' in item: return np.array(item['matriz'], float)
    g = math.radians(item.get('rot_deg', [0, 0, 0])[2]); M = np.eye(4)
    M[:2, :2] = [[math.cos(g), -math.sin(g)], [math.sin(g), math.cos(g)]]; M[:3, 3] = item.get('pos', [0, 0, 0])
    return M

def color_de(code):
    if code == 'K-ZOCALO-G': return 'azul_claro'
    if code == 'K-ATRIL-G': return 'gris_claro'
    if code == 'K-CON-G': return 'rojo'
    if code.startswith('K-PLACA') or '-CMD-' in code or '-DEST-' in code: return 'amarillo'
    if '-RES-' in code or '-ESF-' in code or '-MAS-' in code or '-FRU-' in code or '-PRI-' in code: return 'naranja'
    if '-PIL-' in code: return 'morado'
    if any(k in code for k in ('-BASE-', '-REC-', '-CUR-', '-TEE-', '-VIA-', '-TRA-', '-TIE-')): return 'turquesa'
    if any(k in code for k in ('-COM-', '-PAR-', '-TOR-', '-HOS-', '-URG-', '-AND-')): return 'verde_claro'
    return 'verde'

def malla_girada(carpeta, code, R):
    firma = '' if np.allclose(R, np.eye(3), atol=1e-6) else '_g' + format(abs(hash(tuple(np.round(R, 4).ravel()))) % 10**8, '08d')
    key = code + firma
    if key not in meshes:
        t = read_stl(stl_set(carpeta, code))
        if firma: t = t @ R.T
        if len(t) > 2000: t = cluster(t, 2.5)   # roscas y curvas finas: en RA no se ven y pesan (rejilla de 2,5 mm)
        v = t.reshape(-1, 3)
        meshes[key] = (write_vmesh(key, t), v.min(0).tolist() + v.max(0).tolist())
    return key

PATIN_DZ = None
def patin_mesh():
    """La bandeja de Lúa (K-PATIN-G, del Set 0) en el marco de Lúa: el fondo de Lúa en z = 0."""
    global PATIN_DZ
    t = read_stl(stl_set('S0-kit-lua', 'K-PATIN-G'))
    I = json.load(open(f'{C}/lua-v5/interfaz-construye.json', encoding='utf-8'))['patin']
    PATIN_DZ = I['z_baldosa'] - I['largo_pivote']          # la punta de los pivotes, bajo el fondo de Lúa
    t = t + [0, 0, PATIN_DZ]
    write_vmesh('lua_patin', t)
    return 'lua_patin'

lua_parts.append({'m': patin_mesh(), 'c': 'gris', 'tris': 0})

CARPETAS = {'S0': 'S0-kit-lua', 'S1': 'S1-camino', 'S2': 'S2-estacion-sonido', 'S3': 'S3-laboratorio-rampas',
            'S4': 'S4-maquina-soplo', 'S5': 'S5-puente-equilibrio', 'S6': 'S6-jardin', 'S8': 'S8-policia',
            'S9': 'S9-bomberos', 'S10': 'S10-hospital', 'S11': 'S11-trenes'}
sets_out = {}
for sid, carpeta in CARPETAS.items():
    cfg = json.load(open(f'{C}/sets/{carpeta}/montaje_v2.json', encoding='utf-8'))
    items = cfg['piezas_montadas']
    inst = []
    for it in items:
        M = matriz(it)
        k = malla_girada(carpeta, it['codigo'], M[:3, :3])
        bb = meshes[k][1]
        inst.append((it['codigo'], k, M[:3, 3].tolist(), bb))
    xs = [v for (_c, _k, t, bb) in inst for v in (t[0] + bb[0], t[0] + bb[3])]
    ys = [v for (_c, _k, t, bb) in inst for v in (t[1] + bb[1], t[1] + bb[4])]
    c = [(min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2]
    x, y, rumbo, z = cfg['trayecto_lua'][0]
    lua = [{'p': gl([x, y, z], c), 'r': round(rumbo + 90.0, 1)}]
    steps, antes = [], set()
    for paso in cfg['pasos']:
        steps.append({
            'pieces': [{'m': inst[i][1], 'code': inst[i][0], 'c': color_de(inst[i][0]), 'p': gl(inst[i][2], c),
                        'placed': i in antes} for i in paso],
            'arrows': [], 'lua': lua})
        antes = set(paso)
    sets_out[sid] = {'center': [round(c[0], 1), round(c[1], 1)], 'size': [round(max(xs) - min(xs), 1), round(max(ys) - min(ys), 1)], 'steps': steps}

rgb = {k: [round(v[0], 3), round(v[1], 3), round(v[2], 3)] for k, v in COLORES.items()}
def commit(repo):
    try: return os.popen(f'git -C "{repo}" rev-parse --short HEAD').read().strip()
    except Exception: return '?'
with open(OUT_TS, 'w', encoding='utf-8') as f:
    f.write('// GENERADO por scripts/build-ar-set-models.py. No se edita a mano.\n')
    f.write(f'// Fuente: lua-construye {commit(C)} (piezas y montaje_v2.json de cada set) y lua-firmware {commit(F)} (Lúa V5 r3).\n')
    f.write('// Posiciones en metros, ejes del ancla (X derecha, Y arriba, Z hacia la tableta).\n')
    f.write('/* eslint-disable */\n')
    f.write('export const AR_SET_COLORS: Record<string, readonly [number, number, number]> = ' + json.dumps(rgb) + ' as any;\n')
    f.write('export const AR_LUA_PARTS: readonly { m: string; c: string }[] = ' + json.dumps([{'m': p['m'], 'c': p['c']} for p in lua_parts]) + ';\n')
    f.write('export const AR_LUA_BBOX_MM: readonly number[] = ' + json.dumps([round(x, 1) for x in lua_bbox]) + ';\n')
    f.write('export interface ArSetPiece { m: string; code: string; c: string; p: number[]; placed: boolean }\n')
    f.write('export interface ArSetStep { pieces: ArSetPiece[]; arrows: number[][][]; lua: { p: number[]; r: number }[] }\n')
    f.write('export const AR_SET_MODELS: Record<string, { center: number[]; size: number[]; steps: ArSetStep[] }> = ' + json.dumps(sets_out) + ';\n')

tot = sum(os.path.getsize(os.path.join(OUT_MESH, x)) for x in os.listdir(OUT_MESH))
print(f'{len(os.listdir(OUT_MESH))} mallas, {tot/1e6:.2f} MB · sets: ' + ', '.join(f'{k}({len(v["steps"])} pasos)' for k, v in sets_out.items()))
print('Lúa V5 r3 bbox mm:', [round(x, 1) for x in lua_bbox], '· triángulos:', sum(p['tris'] for p in lua_parts))
