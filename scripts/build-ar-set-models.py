#!/usr/bin/env python3
"""Valeria+ · Modelos 3D de los sets para la RA (10/11/2026).

Fuente única: `lua-construye` (piezas STL de cada set y las composiciones de los
pasos del manual, en agents/render_manual_sets.py) y `lua-firmware` (muñeco Lúa
V5). De ahí salen:
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

# --- Composiciones de los pasos del manual (S0–S6) ---------------------------
def compositions():
    out = {}
    for fn in tree.body:
        if not (isinstance(fn, ast.FunctionDef) and fn.name.startswith('render_s')): continue
        comps, cur = [], None
        for st in fn.body:
            for c in [n for n in ast.walk(st) if isinstance(n, ast.Call) and isinstance(n.func, ast.Name)]:
                kw = {k.arg: k.value for k in c.keywords}
                if c.func.id == 'escena':
                    cur = {'pieces': [], 'arrows': [], 'lua': [], 'name': None}; comps.append(cur)
                elif cur is None: continue
                elif c.func.id == 'cargar_stl':
                    a0 = c.args[0]
                    cur['pieces'].append({
                        'dir': ev(a0.args[0]), 'code': ev(a0.args[1]), 'color': ev(c.args[1]),
                        'pos': list(ev(kw['pos'])) if 'pos' in kw else [0, 0, 0],
                        'rot': list(ev(kw['rot_deg'])) if 'rot_deg' in kw else [0, 0, 0],
                        'norm': ev(kw['normalizar_min']) if 'normalizar_min' in kw else False})
                elif c.func.id == 'flecha':
                    cur['arrows'].append([list(ev(c.args[0])), list(ev(c.args[1]))])
                elif c.func.id == 'lua_v5_muneco':
                    cur['lua'].append({'pos': list(ev(kw['pos'])), 'rot': ev(kw['rot_z_deg']) if 'rot_z_deg' in kw else 0.0})
                elif c.func.id == 'foto':
                    cur['name'] = ev(c.args[3])
        out[fn.name[7:].upper()] = [c for c in comps if c['name'] and 'paso' in c['name']]
    return out

meshes = {}  # nombre -> (tris, bbox mm)
def piece_mesh(p):
    key = p['code'] + ('' if not any(p['rot']) else '_r' + '_'.join(str(int(a)) for a in p['rot']))
    if key not in meshes:
        t = read_stl(stl_set(p['dir'], p['code']))
        if any(p['rot']): t = t @ rot_xyz(p['rot']).T
        if len(t) > 4000: t = cluster(t, 1.0)   # roscas finas: en RA no se ven y pesan
        if p['norm']: t = t - t.reshape(-1, 3).min(0)
        v = t.reshape(-1, 3)
        meshes[key] = (write_vmesh(key, t), v.min(0).tolist() + v.max(0).tolist())
    return key

# --- Muñeco Lúa V5: piezas de impresión devueltas a su sitio de montaje ------
LUA_PARTS = ['cubo_caja', 'cubo_fondo', 'pata_izq', 'pata_der', 'brazo_izq', 'brazo_der', 'ala_izq', 'ala_der',
             'cola', 'lazo', 'cabeza_bloque', 'cabeza_tapa', 'oreja_izq', 'oreja_der', 'flor']
def build_lua():
    base = f'{F}/cad/lua-v5'
    defs = {}
    for j in ('cubo_v5.json', 'cabeza_v5.json'):
        defs.update(json.load(open(f'{base}/{j}', encoding='utf-8'))['piezas'])
    parts, lo, hi = [], np.full(3, 1e9), np.full(3, -1e9)
    for n in LUA_PARTS:
        d = defs[n]
        Minv = np.linalg.inv(np.array(d['M_impresion'], float))
        t = read_stl(f'{base}/{d["imprimir"]}')
        t = t @ Minv[:3, :3].T + Minv[:3, 3]
        t[..., 2] += 4.0                      # la base del muñeco apoya en z = −4
        t = cluster(t, 1.5)
        v = t.reshape(-1, 3); lo = np.minimum(lo, v.min(0)); hi = np.maximum(hi, v.max(0))
        ck = d['color'] if d['color'] in COLORES else 'blanco'
        parts.append({'m': 'lua_' + n, 'c': ck, 'tris': write_vmesh('lua_' + n, t)})
    # Disco oscuro del visor: la cara de Lúa (mismo cilindro que dibuja el manual).
    seg, r, y0, y1, zc = 32, 24.0, -38.0, -30.0, 125.0
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

sets_out = {}
for sid, comps in compositions().items():
    # Centro del set: caja del último paso (el montaje completo), piezas y Lúa.
    lo, hi = np.full(2, 1e9), np.full(2, -1e9)
    for comp in comps:
        for p in comp['pieces']:
            k = piece_mesh(p); bb = meshes[k][1]
            lo = np.minimum(lo, [p['pos'][0] + bb[0], p['pos'][1] + bb[1]])
            hi = np.maximum(hi, [p['pos'][0] + bb[3], p['pos'][1] + bb[4]])
    c = ((lo + hi) / 2).tolist()
    steps = []
    for comp in comps:
        steps.append({
            'pieces': [{'m': piece_mesh(p), 'code': p['code'], 'c': p['color'], 'p': gl(p['pos'], c),
                        'placed': p['color'] in ('gris', 'gris_claro')} for p in comp['pieces']],
            'arrows': [[gl(a, c), gl(b, c)] for a, b in comp['arrows']],
            'lua': [{'p': gl(l['pos'], c), 'r': l['rot']} for l in comp['lua']],
        })
    sets_out[sid] = {'center': [round(c[0], 1), round(c[1], 1)], 'size': [round(hi[0] - lo[0], 1), round(hi[1] - lo[1], 1)], 'steps': steps}

# --- S8–S11: la maqueta entera (conjunto.stl), una sola malla ----------------
for sid, carpeta in (('S8', 'S8-policia'), ('S9', 'S9-bomberos'), ('S10', 'S10-hospital'), ('S11', 'S11-trenes')):
    t = read_stl(f'{C}/sets/{carpeta}/stl/conjunto.stl')
    v = t.reshape(-1, 3); lo, hi = v.min(0), v.max(0)
    c = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2]
    t = t - [c[0], c[1], lo[2]]
    write_vmesh(sid + '_conjunto', t)
    sets_out[sid] = {'center': [round(c[0], 1), round(c[1], 1)], 'size': [round(hi[0] - lo[0], 1), round(hi[1] - lo[1], 1)],
                     'steps': [{'pieces': [{'m': sid + '_conjunto', 'code': 'conjunto', 'c': 'arena', 'p': [0, 0, 0], 'placed': False}], 'arrows': [], 'lua': []}]}

rgb = {k: [round(v[0], 3), round(v[1], 3), round(v[2], 3)] for k, v in COLORES.items()}
def commit(repo):
    try: return os.popen(f'git -C "{repo}" rev-parse --short HEAD').read().strip()
    except Exception: return '?'
with open(OUT_TS, 'w', encoding='utf-8') as f:
    f.write('// GENERADO por scripts/build-ar-set-models.py. No se edita a mano.\n')
    f.write(f'// Fuente: lua-construye {commit(C)} (piezas y pasos del manual) y lua-firmware {commit(F)} (Lúa V5).\n')
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
print('Lúa V5 bbox mm:', [round(x, 1) for x in lua_bbox], '· triángulos:', sum(p['tris'] for p in lua_parts))
