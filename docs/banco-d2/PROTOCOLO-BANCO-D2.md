# Banco D2 · qué marcador llevan las piezas

Fase 4 del [plan de integración RA v3.0](../PLAN-INTEGRACION-AR-LUA-CONSTRUYE.md) (§2.3 y §8).
D2 está abierta en `lua-construye` (`docs/SETS.md` §A): sin ella no hay RA sobre los sets, y
34 de los 35 retos piden el detector de marcador (`node scripts/check-steam-ar-needs.js`).

Este banco decide dos cosas: **qué sistema** (ArUco o AprilTag) y **qué tamaño** de marcador.
La simulación de [`simulacion-d2.md`](simulacion-d2.md) solo sirve para no imprimir lo que ya
se sabe que no va; **no decide nada**.

## 0. Lo que hay que saber antes

**Lo que dice la simulación (2/11/2026), que no es el banco** ([tabla](simulacion-d2.md)):

1. **La resolución manda.** Con la cámara a 35° y fotogramas de 640×480, ninguna combinación
   llega al 95 %: el marcador ocupa 22–31 px. Con 1280×720 sí. El detector de la Fase 4b tiene que
   leer fotogramas de al menos 1280×720, y eso hay que medirlo en fps junto a la cara.
2. **ArUco 4×4_1000 confunde un marcador con otro.** Da ids equivocados en 26 de las 60
   combinaciones simuladas (48 lecturas), y son el propio marcador leído con el id de otro (sobre el fondo solo
   no detecta nada). En la mesa sería la cámara tomando una baldosa por otra. AprilTag 36h11 no se
   equivoca en ninguna de sus 60.
3. **Una esquina tapada tumba a los dos** (AprilTag, al 0–3 %). La mano que coloca la pieza la va
   a tapar: ese momento lo cubren `EventStabilizer` (10 fotogramas) y el botón del adulto.
4. Con la cámara a 55° todo mejora: el marcador sale más grande. **El ángulo real de la cámara en
   el soporte es lo primero que hay que medir.**

Consecuencia para el banco: ArUco con un diccionario pequeño (por ejemplo `5x5_100`) se equivocaría
menos, pero **no está simulado** y también obliga a renumerar los IDs.

- **Los IDs de los manifiestos llegan al 672.** AprilTag 36h11 tiene 587 códigos, así que sus
  hojas usan un id compacto (0–92). Si gana AprilTag, hay que renumerar `instanceMarkerIds` en
  los siete mundos (cambio de contenido, con su gate). ArUco `4x4_1000` admite los IDs reales.
- **El id 9 es `K-LOMO-G`**, que ya no se imprime con Lúa V5 (cubo, decisiones 27 y 28 de
  `lua-firmware`). Su hoja sale porque el manifiesto de S0 aún lo declara. No se prueba.
- Las hojas se regeneran desde los manifiestos; no se editan a mano:

```bash
node scripts/d2-banco/exportar-marcadores.js
python3 -I scripts/d2-banco/generar_hojas.py docs/banco-d2
```

## 1. Qué imprimir

| Fichero | Sistema | Lado del cuadrado negro |
| :--- | :--- | :--- |
| `marcadores-aruco-4x4_1000-{20,24,28}mm.pdf` | ArUco 4×4, IDs reales | 20, 24, 28 mm |
| `marcadores-apriltag-36h11-{20,24,28}mm.pdf` | AprilTag 36h11, id compacto | 20, 24, 28 mm |

1. Imprimir **al 100 %, sin «ajustar a la página»**, en papel blanco mate (el brillo devuelve
   reflejos que la cámara lee como blanco).
2. Medir con regla la línea de 100 mm y el cuadrado de 50 × 50 de la página. Si se desvía más de
   1 mm, la hoja no vale: se reimprime.
3. Recortar dejando el margen blanco alrededor del cuadrado negro (la zona blanca es parte del
   marcador). Pegar en la cara de la pieza **que no tapan ni Lúa ni la mano** (`docs/SETS.md`).

## 2. Montaje

- La tableta del piloto en el soporte de los mundos de mesa: **22 cm de alto, 55°**. Anotar el
  modelo y si la cámara trasera enfoca sola.
- Tres luces: luz de día junto a ventana, luz de techo de aula, lámpara de salón por la tarde.
  Si hay luxómetro (vale el del móvil), anotar los lux.
- Las piezas de S1 (baldosas) y S5 (viga y masas): son las más pequeñas y las que más se mueven.

## 3. Qué medir

Por cada combinación **sistema × tamaño × luz**:

| Medida | Cómo | Umbral para aceptar |
| :--- | :--- | :--- |
| Tasa de detección | 10 posiciones en la zona de juego (cerca, lejos, bordes), 3 giros por posición; contar las que se leen con el id correcto | ≥ 95 % con luz de aula; ≥ 85 % con lámpara de salón |
| IDs equivocados | lecturas con un id que no está en la mesa | 0. Uno solo descalifica la combinación |
| Oclusión | una mano tapa un borde del marcador, como al colocar la pieza | se anota; el plan ya cubre este caso con `EventStabilizer` y `adult_tap` |
| fps con cara a la vez | marcador + `FaceLandmarker` corriendo juntos | ≥ 20 fps (`limits.minFps` del protocolo) |
| Tamaño del APK | antes y después de añadir la biblioteca | anotar los MB; sin umbral, lo decide Frank |

Las dos últimas filas necesitan el detector nativo (Fase 4b): hasta entonces, la detección se
mide con la app de prueba que se prepare en esa fase, no con la de Valeria+.

## 4. Cómo se decide

1. Se descartan las combinaciones con algún id equivocado.
2. De las que quedan, la **más pequeña** que pase los dos umbrales de detección: un marcador más
   pequeño cabe en más caras y deja más sitio a la pieza.
3. Si empatan, gana el que **no** obligue a un puente propio. OpenCV (`opencv/opencv`, 91 k★,
   Apache-2.0) lee los dos sistemas con el mismo detector, así que ese empate se resuelve por los
   ids equivocados (punto 1), no por el diccionario. La ventaja de ArUco 4×4_1000 de no renumerar
   no cuenta si confunde piezas, que es lo que apunta la simulación.
4. La decisión se escribe en `lua-construye` (cierra D2) y en el §2.3 del plan, con la tabla del
   banco al lado. Sin tabla, D2 sigue abierta.
