"""Banco D2 · hojas imprimibles de marcadores (plan RA v3.0 §2.3, Fase 4a).

Lee scripts/d2-banco/marcadores.json (los 93 marcadores de los manifiestos S0–S6)
y genera, a escala 1:1 en A4 a 300 ppp, un PDF por sistema y tamaño:

  · ArUco DICT_4X4_1000 con los IDs reales de los manifiestos (hasta 672).
  · AprilTag 36h11 con el id compacto (0–92): ese diccionario solo tiene 587.

Tamaños 20, 24 y 28 mm (lado del cuadrado negro), para caras de 31,8 mm.
Cada página lleva una regla de 100 mm y un cuadrado de 50 mm para comprobar
que se imprimió al 100 %. Antes de escribir, cada página se vuelve a leer con
el detector: tiene que devolver exactamente los IDs impresos, o no sale.

  python3 -I scripts/d2-banco/generar_hojas.py <directorio_salida>
Necesita opencv-contrib-python-headless 4.10, numpy y pillow.
"""
import json
import sys
import unicodedata
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

DPI = 300
PX_MM = DPI / 25.4
A4 = (round(210 * PX_MM), round(297 * PX_MM))  # ancho, alto
MARGEN = round(12 * PX_MM)
TAMANOS_MM = (20, 24, 28)
SISTEMAS = {
    'aruco-4x4_1000': (cv2.aruco.DICT_4X4_1000, 'id', 'ArUco 4x4_1000 (id real)'),
    'apriltag-36h11': (cv2.aruco.DICT_APRILTAG_36h11, 'idCompacto', 'AprilTag 36h11 (id compacto)'),
}


def ascii_(texto):
    return unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode()


def mm(v):
    return round(v * PX_MM)


def regla(pagina, y):
    x0 = MARGEN
    cv2.line(pagina, (x0, y), (x0 + mm(100), y), 0, 3)
    for i in range(101):
        alto = mm(4) if i % 10 == 0 else mm(2.5) if i % 5 == 0 else mm(1.5)
        x = x0 + mm(i)
        cv2.line(pagina, (x, y), (x, y - alto), 0, 2)
        if i % 10 == 0:
            cv2.putText(pagina, str(i), (x - 10, y + mm(4)), cv2.FONT_HERSHEY_SIMPLEX, 0.9, 0, 2)
    cv2.putText(pagina, 'mm', (x0 + mm(102), y), cv2.FONT_HERSHEY_SIMPLEX, 0.9, 0, 2)
    xc = x0 + mm(120)
    cv2.rectangle(pagina, (xc, y - mm(50)), (xc + mm(50), y), 0, 3)
    cv2.putText(pagina, '50 x 50 mm', (xc + mm(8), y - mm(23)), cv2.FONT_HERSHEY_SIMPLEX, 1.0, 0, 2)


def paginas(marcadores, sistema, lado_mm):
    dict_id, campo, nombre = SISTEMAS[sistema]
    dic = cv2.aruco.getPredefinedDictionary(dict_id)
    celda_w, celda_h = lado_mm + 16, lado_mm + 14
    cols = int((210 - 24) // celda_w)
    filas = int((297 - 24 - 14 - 62) // celda_h)
    por_pagina = cols * filas
    total = (len(marcadores) + por_pagina - 1) // por_pagina
    for n in range(total):
        lote = marcadores[n * por_pagina:(n + 1) * por_pagina]
        pagina = np.full((A4[1], A4[0]), 255, np.uint8)
        cab = f'Banco D2 - {nombre} - {lado_mm} mm - pagina {n + 1}/{total} - IMPRIMIR AL 100 %, SIN AJUSTAR A LA PAGINA'
        cv2.putText(pagina, cab, (MARGEN, MARGEN + mm(3)), cv2.FONT_HERSHEY_SIMPLEX, 0.85, 0, 2)
        y_ini = MARGEN + mm(10)
        for k, m in enumerate(lote):
            c, f = k % cols, k // cols
            x = MARGEN + mm(c * celda_w)
            y = y_ini + mm(f * celda_h)
            cv2.rectangle(pagina, (x, y), (x + mm(celda_w) - 6, y + mm(celda_h) - 6), 200, 1)
            lado = mm(lado_mm)
            img = cv2.aruco.generateImageMarker(dic, int(m[campo]), lado, borderBits=1)
            mx, my = x + mm(8), y + mm(3)
            pagina[my:my + lado, mx:mx + lado] = img
            etiqueta = ascii_(f"{m['mundo']} {m['pieza']} #{m['instancia']}")
            cv2.putText(pagina, etiqueta, (x + mm(2), my + lado + mm(4)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, 0, 1)
            cv2.putText(pagina, f"id {m[campo]}", (x + mm(2), my + lado + mm(8)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, 0, 1)
        regla(pagina, A4[1] - MARGEN - mm(6))
        yield pagina, [int(m[campo]) for m in lote], dic


def verificar(pagina, esperados, dic):
    det = cv2.aruco.ArucoDetector(dic, cv2.aruco.DetectorParameters())
    _, ids, _ = det.detectMarkers(pagina)
    leidos = sorted(int(i) for i in ids.flatten()) if ids is not None else []
    return leidos == sorted(esperados), leidos


def main():
    salida = Path(sys.argv[1])
    salida.mkdir(parents=True, exist_ok=True)
    datos = json.loads((Path(__file__).parent / 'marcadores.json').read_text(encoding='utf8'))
    marcadores = datos['marcadores']
    fallos = 0
    for sistema in SISTEMAS:
        for lado in TAMANOS_MM:
            imgs = []
            for pagina, esperados, dic in paginas(marcadores, sistema, lado):
                ok, leidos = verificar(pagina, esperados, dic)
                if not ok:
                    fallos += 1
                    falta = sorted(set(esperados) - set(leidos))
                    sobra = sorted(set(leidos) - set(esperados))
                    print(f'✗ {sistema} {lado} mm: faltan {falta}, sobran {sobra}')
                imgs.append(Image.fromarray(pagina).convert('1'))
            destino = salida / f'marcadores-{sistema}-{lado}mm.pdf'
            imgs[0].save(destino, save_all=True, append_images=imgs[1:], resolution=DPI)
            print(f'{destino.name}: {len(imgs)} páginas, {destino.stat().st_size // 1024} KB')
    if fallos:
        sys.exit(1)
    print(f'✓ Todas las páginas devuelven exactamente sus {len(marcadores)} IDs al detector.')


if __name__ == '__main__':
    main()
