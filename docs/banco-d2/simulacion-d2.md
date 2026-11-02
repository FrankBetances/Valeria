# Banco D2 · simulación previa (NO es el banco)

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


## Cámara 35° hacia abajo · 640x480

| Sistema | Lado | ideal | desenfoque | poca luz | movimiento | esquina tapada |
| :--- | ---: | :---: | :---: | :---: | :---: | :---: |
| ArUco 4x4_1000 | 20 mm | 70.0 % · 22.1 px ⚠ 5 | 41.7 % · 22.1 px ⚠ 1 | 71.7 % · 22.1 px ⚠ 1 | 45.0 % · 22.1 px ⚠ 1 | 8.3 % · 22.1 px |
| ArUco 4x4_1000 | 24 mm | 83.3 % · 26.4 px | 48.3 % · 26.4 px | 80.0 % · 26.4 px | 58.3 % · 26.4 px ⚠ 1 | 3.3 % · 26.4 px |
| ArUco 4x4_1000 | 28 mm | 83.3 % · 30.6 px ⚠ 2 | 58.3 % · 30.6 px ⚠ 1 | 86.7 % · 30.6 px | 68.3 % · 30.6 px ⚠ 3 | 16.7 % · 30.6 px |
| AprilTag 36h11 | 20 mm | 56.7 % · 22.1 px | 15.0 % · 22.1 px | 55.0 % · 22.1 px | 21.7 % · 22.1 px | 0.0 % · 22.1 px |
| AprilTag 36h11 | 24 mm | 63.3 % · 26.4 px | 30.0 % · 26.4 px | 60.0 % · 26.4 px | 36.7 % · 26.4 px | 0.0 % · 26.4 px |
| AprilTag 36h11 | 28 mm | 75.0 % · 30.7 px | 36.7 % · 30.7 px | 68.3 % · 30.7 px | 50.0 % · 30.7 px | 0.0 % · 30.7 px |

## Cámara 35° hacia abajo · 1280x720

| Sistema | Lado | ideal | desenfoque | poca luz | movimiento | esquina tapada |
| :--- | ---: | :---: | :---: | :---: | :---: | :---: |
| ArUco 4x4_1000 | 20 mm | 98.3 % · 45.8 px ⚠ 1 | 78.3 % · 45.8 px ⚠ 3 | 98.3 % · 45.8 px | 98.3 % · 45.8 px | 13.3 % · 45.8 px |
| ArUco 4x4_1000 | 24 mm | 96.7 % · 54.7 px ⚠ 2 | 86.7 % · 54.7 px | 100.0 % · 54.7 px | 100.0 % · 54.7 px | 25.0 % · 54.7 px |
| ArUco 4x4_1000 | 28 mm | 98.3 % · 63.6 px ⚠ 1 | 95.0 % · 63.6 px | 100.0 % · 63.6 px | 100.0 % · 63.6 px | 33.3 % · 63.6 px ⚠ 1 |
| AprilTag 36h11 | 20 mm | 95.0 % · 45.9 px | 58.3 % · 45.9 px | 96.7 % · 45.9 px | 80.0 % · 45.9 px | 3.3 % · 45.9 px |
| AprilTag 36h11 | 24 mm | 100.0 % · 54.8 px | 70.0 % · 54.8 px | 98.3 % · 54.8 px | 95.0 % · 54.8 px | 0.0 % · 54.8 px |
| AprilTag 36h11 | 28 mm | 100.0 % · 63.7 px | 76.7 % · 63.7 px | 100.0 % · 63.7 px | 100.0 % · 63.7 px | 1.7 % · 63.7 px |

## Cámara 55° hacia abajo · 640x480

| Sistema | Lado | ideal | desenfoque | poca luz | movimiento | esquina tapada |
| :--- | ---: | :---: | :---: | :---: | :---: | :---: |
| ArUco 4x4_1000 | 20 mm | 95.0 % · 34.0 px ⚠ 3 | 86.7 % · 34.0 px ⚠ 3 | 96.7 % · 34.0 px ⚠ 2 | 98.3 % · 34.0 px ⚠ 1 | 6.7 % · 34.0 px |
| ArUco 4x4_1000 | 24 mm | 96.7 % · 40.6 px ⚠ 2 | 96.7 % · 40.6 px ⚠ 2 | 100.0 % · 40.6 px | 98.3 % · 40.6 px ⚠ 1 | 11.7 % · 40.6 px |
| ArUco 4x4_1000 | 28 mm | 96.7 % · 47.1 px ⚠ 2 | 98.3 % · 47.1 px ⚠ 1 | 100.0 % · 47.1 px | 93.3 % · 47.1 px ⚠ 4 | 25.0 % · 47.1 px |
| AprilTag 36h11 | 20 mm | 100.0 % · 34.1 px | 56.7 % · 34.1 px | 98.3 % · 34.1 px | 63.3 % · 34.1 px | 0.0 % · 34.1 px |
| AprilTag 36h11 | 24 mm | 100.0 % · 40.7 px | 76.7 % · 40.7 px | 98.3 % · 40.7 px | 91.7 % · 40.7 px | 0.0 % · 40.7 px |
| AprilTag 36h11 | 28 mm | 100.0 % · 47.2 px | 83.3 % · 47.2 px | 100.0 % · 47.2 px | 98.3 % · 47.2 px | 0.0 % · 47.2 px |

## Cámara 55° hacia abajo · 1280x720

| Sistema | Lado | ideal | desenfoque | poca luz | movimiento | esquina tapada |
| :--- | ---: | :---: | :---: | :---: | :---: | :---: |
| ArUco 4x4_1000 | 20 mm | 100.0 % · 69.2 px | 100.0 % · 69.2 px | 98.3 % · 69.2 px ⚠ 1 | 100.0 % · 69.2 px | 30.0 % · 69.2 px ⚠ 2 |
| ArUco 4x4_1000 | 24 mm | 100.0 % · 82.6 px | 100.0 % · 82.6 px | 100.0 % · 82.6 px | 100.0 % · 82.6 px | 30.0 % · 82.6 px |
| ArUco 4x4_1000 | 28 mm | 100.0 % · 95.8 px | 100.0 % · 95.8 px | 100.0 % · 95.8 px | 100.0 % · 95.8 px | 55.0 % · 95.8 px ⚠ 1 |
| AprilTag 36h11 | 20 mm | 100.0 % · 69.3 px | 100.0 % · 69.3 px | 100.0 % · 69.3 px | 100.0 % · 69.3 px | 0.0 % · 69.3 px |
| AprilTag 36h11 | 24 mm | 100.0 % · 82.7 px | 100.0 % · 82.7 px | 100.0 % · 82.7 px | 100.0 % · 82.7 px | 0.0 % · 82.7 px |
| AprilTag 36h11 | 28 mm | 100.0 % · 96.1 px | 100.0 % · 96.1 px | 100.0 % · 96.1 px | 100.0 % · 96.1 px | 0.0 % · 96.1 px |
