"""Banco D2 · simulación previa de detección (plan RA v3.0 §2.3, Fase 4a).

NO ES EL BANCO. Pinta los marcadores como los vería la cámara trasera de una
tableta en el soporte de los mundos de mesa y mide cuántos lee OpenCV. Sirve
para descartar tamaños o sistemas antes de imprimir; la decisión D2 sale del
banco con piezas impresas (docs/banco-d2/PROTOCOLO-BANCO-D2.md).

Supuestos, todos por validar en el banco:
  · Altura y ángulo del soporte: los de los manifiestos (22 cm, 55°). El ángulo
    se lee como inclinación de la tableta sobre la mesa; la cámara trasera mira
    entonces 90 - 55 = 35° por debajo de la horizontal. Se prueba también 55°.
  · Campo horizontal de la cámara: 65°. Resoluciones 640x480 y 1280x720.
  · El marcador está en el plano de la mesa (se ignora la altura de la pieza).
  · Sin lente real: ni distorsión, ni enfoque automático, ni compresión.
S4 no se simula: su cámara es la frontal y mira la cara.

  python3 -I scripts/d2-banco/simular.py <directorio_salida>
"""
import csv
import json
import math
import sys
from pathlib import Path

import cv2
import numpy as np

SS = 3  # supermuestreo del render: integra el píxel como un sensor
HFOV = 65.0
RESOLUCIONES = ((640, 480), (1280, 720))
TAMANOS_MM = (20, 24, 28)
PITCHES = (35.0, 55.0)
SISTEMAS = {
    'ArUco 4x4_1000': (cv2.aruco.DICT_4X4_1000, 'id'),
    'AprilTag 36h11': (cv2.aruco.DICT_APRILTAG_36h11, 'idCompacto'),
}
CONDICIONES = ('ideal', 'desenfoque', 'poca luz', 'movimiento', 'esquina tapada')
GRID_U = (0.15, 0.32, 0.5, 0.68, 0.85)
GRID_V = (0.2, 0.4, 0.6, 0.8)
YAWS = (0.0, 30.0, 70.0)


def camara(w, h, altura_mm, pitch_deg):
    f = (w / 2) / math.tan(math.radians(HFOV / 2))
    K = np.array([[f, 0, w / 2], [0, f, h / 2], [0, 0, 1]], float)
    p = math.radians(pitch_deg)
    # Mundo: X a la derecha, Y hacia delante sobre la mesa, Z arriba. Cámara: x derecha, y abajo, z al frente.
    fwd = np.array([0, math.cos(p), -math.sin(p)])
    right = np.array([1.0, 0, 0])
    down = np.cross(fwd, right)
    R = np.stack([right, down, fwd])
    C = np.array([0, 0, altura_mm], float)
    return K, R, C


def proyectar(K, R, C, pts):
    cam = (R @ (pts - C).T)
    uv = K @ cam
    return (uv[:2] / uv[2]).T, cam[2]


def a_mesa(K, R, C, u, v):
    rayo = R.T @ np.linalg.inv(K) @ np.array([u, v, 1.0])
    if rayo[2] >= 0:
        return None
    t = -C[2] / rayo[2]
    return C + t * rayo


def textura_marcador(dic, mid, px=480):
    lado_mod = dic.markerSize + 2
    img = cv2.aruco.generateImageMarker(dic, int(mid), px, borderBits=1)
    pad = px // lado_mod  # zona blanca de un módulo, como en la hoja impresa
    return cv2.copyMakeBorder(img, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=255), pad


def render(tex, pad, K, R, C, centro, lado_mm, yaw, w, h, cond, rng):
    tot = tex.shape[0]
    lado_tot = lado_mm * tot / (tot - 2 * pad)
    a = math.radians(yaw)
    ex, ey = np.array([math.cos(a), math.sin(a), 0]), np.array([-math.sin(a), math.cos(a), 0])
    s = lado_tot / 2
    esquinas = np.array([centro - s * ex + s * ey, centro + s * ex + s * ey, centro + s * ex - s * ey, centro - s * ex - s * ey])
    uv, z = proyectar(K, R, C, esquinas)
    if (z <= 0).any():
        return None, 0
    Ks = np.diag([SS, SS, 1.0])
    dst = (uv * SS).astype(np.float32)
    x0, y0 = np.floor(dst.min(0)).astype(int) - 2
    x1, y1 = np.ceil(dst.max(0)).astype(int) + 2
    if x0 < 0 or y0 < 0 or x1 > w * SS or y1 > h * SS:
        return None, 0
    fondo = 120 + rng.normal(0, 6, (h * SS, w * SS))
    src = np.array([[0, 0], [tot, 0], [tot, tot], [0, tot]], np.float32)
    H = cv2.getPerspectiveTransform(src, (dst - np.array([x0, y0], np.float32)).astype(np.float32))
    roi_w, roi_h = x1 - x0, y1 - y0
    warp = cv2.warpPerspective(tex.astype(np.float32), H, (roi_w, roi_h), flags=cv2.INTER_LINEAR)
    mask = cv2.warpPerspective(np.ones_like(tex, np.float32), H, (roi_w, roi_h), flags=cv2.INTER_LINEAR)
    papel = 25 + warp * (230 / 255)  # papel y tinta reales: ni 0 ni 255
    fondo[y0:y1, x0:x1] = fondo[y0:y1, x0:x1] * (1 - mask) + papel * mask
    if cond == 'esquina tapada':
        # Una mano tapa la franja inferior (20 % del alto) de la silueta del marcador.
        # Con el marcador girado eso es una ESQUINA del borde negro, no el 20 % del área.
        q = (dst - [x0, y0]).astype(np.float32)
        lado_px = np.linalg.norm(q[1] - q[0])
        corte = int(0.2 * (q[:, 1].max() - q[:, 1].min()))
        ymax = int(q[:, 1].max())
        fondo[y0 + ymax - corte:y0 + ymax + 2, x0:x1] = 60 + rng.normal(0, 4, (corte + 2, roi_w))
    frame = cv2.resize(fondo, (w, h), interpolation=cv2.INTER_AREA)
    lado_px = float(np.linalg.norm(uv[1] - uv[0]) * (lado_mm / lado_tot))
    if cond == 'desenfoque':
        frame = cv2.GaussianBlur(frame, (0, 0), 1.5)
    if cond == 'movimiento':
        k = np.zeros((7, 7)); k[3, :] = 1 / 7
        frame = cv2.filter2D(frame, -1, k)
    if cond == 'poca luz':
        frame = frame * 0.35 + rng.normal(0, 8, frame.shape)
    else:
        frame = frame + rng.normal(0, 2, frame.shape)
    return np.clip(frame, 0, 255).astype(np.uint8), lado_px


def main():
    salida = Path(sys.argv[1])
    salida.mkdir(parents=True, exist_ok=True)
    datos = json.loads((Path(__file__).parent / 'marcadores.json').read_text(encoding='utf8'))
    marcadores = [m for m in datos['marcadores'] if datos['soportes'][m['mundo']]['cameraMode'] == 'rear_tabletop']
    altura = datos['soportes']['S0']['heightCm'] * 10
    rng = np.random.default_rng(20261102)
    filas = []
    for nombre, (dict_id, campo) in SISTEMAS.items():
        dic = cv2.aruco.getPredefinedDictionary(dict_id)
        det = cv2.aruco.ArucoDetector(dic, cv2.aruco.DetectorParameters())
        texturas = {}
        for pitch in PITCHES:
            for (w, h) in RESOLUCIONES:
                K, R, C = camara(w, h, altura, pitch)
                for lado in TAMANOS_MM:
                    for cond in CONDICIONES:
                        ok = mal = n = 0
                        px = []
                        k = 0
                        for gu in GRID_U:
                            for gv in GRID_V:
                                centro = a_mesa(K, R, C, gu * w, gv * h)
                                if centro is None:
                                    continue
                                for yaw in YAWS:
                                    m = marcadores[k % len(marcadores)]; k += 1
                                    mid = int(m[campo])
                                    if mid not in texturas:
                                        texturas[mid] = textura_marcador(dic, mid)
                                    tex, pad = texturas[mid]
                                    frame, lado_px = render(tex, pad, K, R, C, centro, lado, yaw, w, h, cond, rng)
                                    if frame is None:
                                        continue
                                    n += 1
                                    px.append(lado_px)
                                    _, ids, _ = det.detectMarkers(frame)
                                    leidos = [] if ids is None else [int(i) for i in ids.flatten()]
                                    ok += mid in leidos
                                    mal += sum(1 for i in leidos if i != mid)
                        filas.append({
                            'sistema': nombre, 'pitch_deg': pitch, 'resolucion': f'{w}x{h}', 'lado_mm': lado,
                            'condicion': cond, 'ensayos': n, 'detectados_pct': round(100 * ok / n, 1) if n else None,
                            'ids_equivocados': mal, 'lado_px_mediana': round(float(np.median(px)), 1) if px else None,
                            'lado_px_min': round(float(np.min(px)), 1) if px else None,
                        })
                        print(f"{nombre:15} {pitch:>4.0f}° {w}x{h} {lado} mm {cond:13} {filas[-1]['detectados_pct']:>5}% ({n}) px~{filas[-1]['lado_px_mediana']} equivocados {mal}")
    with open(salida / 'simulacion-d2.csv', 'w', newline='', encoding='utf8') as f:
        wr = csv.DictWriter(f, fieldnames=list(filas[0].keys()))
        wr.writeheader(); wr.writerows(filas)
    print(f'✓ {len(filas)} combinaciones en {salida / "simulacion-d2.csv"}')


if __name__ == '__main__':
    main()
