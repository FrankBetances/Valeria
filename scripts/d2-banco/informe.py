"""Banco D2 · tabla de la simulación en Markdown, a partir de simulacion-d2.csv.

  python3 -I scripts/d2-banco/informe.py docs/banco-d2
"""
import csv
import sys
from pathlib import Path

CABECERA = """# Banco D2 · simulación previa (NO es el banco)

Generado por `scripts/d2-banco/simular.py` y `scripts/d2-banco/informe.py` a partir de
`simulacion-d2.csv`. **Es una simulación**: marcadores pintados sobre un plano con una cámara
ideal. No hay lente real, ni enfoque automático, ni compresión, ni papel con reflejos. Sirve para
no imprimir lo que ya se ve que no llega; la decisión D2 sale del banco
([`PROTOCOLO-BANCO-D2.md`](PROTOCOLO-BANCO-D2.md)).

Supuestos, todos por validar: soporte de 22 cm (S0, S1, S2, S3, S5, S6); campo horizontal de
65°; cámara trasera 35° por debajo de la horizontal (lectura de los 55° del manifiesto) y,
como contraste, 55°; marcador en el plano de la mesa. Detector `cv2.aruco.ArucoDetector`
de OpenCV 4.10 con parámetros por omisión, para los dos sistemas. 60 ensayos por casilla:
20 posiciones repartidas por la imagen × 3 giros. S4 no se simula: su cámara es la frontal.

Cada casilla es **% detectado con el id correcto** · lado mediano del marcador en píxeles.
Una casilla con ids equivocados lleva ⚠ y el número: es el **propio marcador leído con el id de
otro** (comprobado: sobre el fondo solo, 200 fotogramas, ninguno de los dos sistemas detecta nada).
«Esquina tapada» es la franja inferior del 20 % del alto de la silueta: con el marcador girado,
una esquina del borde negro, no el 20 % de su área.
"""


def main():
    carpeta = Path(sys.argv[1])
    filas = list(csv.DictReader(open(carpeta / 'simulacion-d2.csv', encoding='utf8')))
    condiciones = list(dict.fromkeys(f['condicion'] for f in filas))
    salida = [CABECERA]
    for pitch in dict.fromkeys(f['pitch_deg'] for f in filas):
        for res in dict.fromkeys(f['resolucion'] for f in filas):
            salida.append(f'\n## Cámara {float(pitch):.0f}° hacia abajo · {res}\n')
            salida.append('| Sistema | Lado | ' + ' | '.join(condiciones) + ' |')
            salida.append('| :--- | ---: | ' + ' | '.join(':---:' for _ in condiciones) + ' |')
            grupo = [f for f in filas if f['pitch_deg'] == pitch and f['resolucion'] == res]
            for sistema in dict.fromkeys(f['sistema'] for f in grupo):
                for lado in dict.fromkeys(f['lado_mm'] for f in grupo):
                    celdas = []
                    for c in condiciones:
                        f = next(x for x in grupo if x['sistema'] == sistema and x['lado_mm'] == lado and x['condicion'] == c)
                        txt = f"{f['detectados_pct']} % · {f['lado_px_mediana']} px"
                        if int(f['ids_equivocados']):
                            txt += f" ⚠ {f['ids_equivocados']}"
                        celdas.append(txt)
                    salida.append(f'| {sistema} | {lado} mm | ' + ' | '.join(celdas) + ' |')
    (carpeta / 'simulacion-d2.md').write_text('\n'.join(salida) + '\n', encoding='utf8')
    print(f"✓ {carpeta / 'simulacion-d2.md'}")


if __name__ == '__main__':
    main()
