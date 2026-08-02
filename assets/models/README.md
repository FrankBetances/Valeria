# Modelos 3D del bloque de Realidad Aumentada

Los cinco modelos que consume la capa de recompensa (`SceneHost`). **Están en el
repositorio y son de obra propia**: los genera
[`scripts/build-ar-models.js`](../../scripts/build-ar-models.js) a partir de
geometría descrita en ese fichero, sin dependencias y sin descargas.

```bash
npm run build:ar-models   # regenera los cinco .glb
npm run check:ar-models   # verifica el contrato contra el enum ArModel de Kotlin
```

## Por qué generados y no de un banco de assets

Un modelo gratuito de internet trae siempre las mismas tres dudas: qué licencia
tiene de verdad, si la conservará mañana, y si sus animaciones se llaman como el
código espera. Generándolos las tres desaparecen a la vez —autoría del proyecto,
licencia CC0, nombres de animación definidos en el mismo sitio que los invoca— y
además pesan **74 KB los cinco juntos**, frente a los 2 MB de presupuesto por
modelo.

Son modelos **de trabajo, no de ilustración**: formas limpias, colores planos y
silueta reconocible a 35 cm en una pantalla de seis pulgadas. Sirven para jugar y
para medir desde el primer día. Sustituirlos por un encargo artístico es dejar
caer un `.glb` con las **mismas animaciones** en esta carpeta y volver a correr
`npm run check:ar-models`: no se toca una línea de Kotlin.

## Contrato

| Fichero | Ejercicio | Animación exigida | Qué hace |
| --- | --- | --- | --- |
| `coche.glb` | AR-1 | `celebrate` | Avanza en Z a velocidad **proporcional** al progreso del sostén labial (traslación por código). Al llegar a 1.0, salto de meta con giro de ruedas |
| `perro.glb` | AR-2 | `celebrate` | Celebra —salto, rabo y asentimiento— **solo** ante giro correcto dentro de ventana. En ensayo trampa nunca celebra |
| `manzana.glb` | AR-3 | `spin360` | Gira 360° al **confirmarse** la selección, no al primer vistazo |
| `pelota.glb` | AR-3 | `spin360` | Distractor |
| `zapato.glb` | AR-3 | `spin360` | Distractor |

> **Los distractores giran igual que la diana a propósito.** Si solo se animara
> la respuesta correcta, el movimiento sería una pista y AR-3 dejaría de medir
> comprensión léxica para medir detección de movimiento.

La animación de premio tiene que leerse **de un vistazo y desde lejos**: un
salto y un giro completos, no un matiz. Un niño de cuatro años que no distingue
si le han premiado deja de tener refuerzo, por cuidado que esté el modelo.

## Requisitos técnicos (los verifica `check:ar-models`)

- **Formato**: glTF 2.0 binario (`.glb`). Los cinco pasan el validador oficial
  de Khronos con **cero errores y cero advertencias**.
- **Peso**: < 2 MB por modelo. Actuales: 9,7-19,5 KB.
- **Polígonos**: 120-864 triángulos por modelo, normales planas. El objetivo es
  un teléfono de gama media de hace tres años sosteniendo cámara + inferencia +
  Filament a la vez.
- **Nombres de animación**: literalmente los de la tabla. La escena los busca
  por nombre; `Celebrate` o `Armature|celebrate` no se encuentran — y ese es
  justo el fallo silencioso que `check:ar-models` está escrito para atrapar.
- **Escala**: 1 unidad = 1 metro, origen en la base del modelo, mirando a +Z.
- **Sin texturas**: color plano por material (`baseColorFactor`). A la distancia
  de trabajo no se aprecian y se llevarían la mitad del presupuesto.

## Licencia y atribución

| Fichero | Autoría | Licencia | Origen |
| --- | --- | --- | --- |
| `coche.glb` | Proyecto Valeria+ · Dr. Frank Alberto Betances Reinoso | **CC0-1.0** (dominio público) | Obra propia · `scripts/build-ar-models.js` |
| `perro.glb` | Proyecto Valeria+ · Dr. Frank Alberto Betances Reinoso | **CC0-1.0** | Obra propia · `scripts/build-ar-models.js` |
| `manzana.glb` | Proyecto Valeria+ · Dr. Frank Alberto Betances Reinoso | **CC0-1.0** | Obra propia · `scripts/build-ar-models.js` |
| `pelota.glb` | Proyecto Valeria+ · Dr. Frank Alberto Betances Reinoso | **CC0-1.0** | Obra propia · `scripts/build-ar-models.js` |
| `zapato.glb` | Proyecto Valeria+ · Dr. Frank Alberto Betances Reinoso | **CC0-1.0** | Obra propia · `scripts/build-ar-models.js` |

La autoría y la licencia viajan también dentro de cada fichero, en el campo
`asset.copyright` del glTF: separar un modelo de este README no lo deja huérfano.

**Si algún día se sustituye alguno por un asset de terceros**, hay que rellenar
su fila aquí *y* acreditarlo en `src/ValeriaCreditsScreen.tsx`, que existe para
eso. Licencias admisibles: CC0, CC-BY (con atribución en Créditos) o encargo
propio. **No** se admite nada con cláusula no comercial ni de uso restringido: la
app se distribuye en Play y el proyecto tiene ruta comercial declarada.

## El modelo de señal facial

No está aquí sino en `android-native/valeria-ar/src/main/assets/`, porque es
puramente nativo:

| Fichero | Autoría | Licencia | Origen |
| --- | --- | --- | --- |
| `face_landmarker.task` (3,6 MB) | Google · MediaPipe | **Apache-2.0** | [Catálogo de MediaPipe Tasks](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker), revisión fijada `float16/1` · `npm run fetch:ar-model` |

Se descarga con SHA-256 verificado y **desde la revisión fijada, no desde
`latest`**: un modelo que cambia bajo los pies cambia las medidas, y este módulo
produce datos destinados a publicarse. El bundle contiene el detector de caras,
el de 478 landmarks (con iris), el de los 52 blendshapes ARKit y el pipeline de
geometría facial que da la matriz 4×4 — es decir, exactamente las tres señales
que el plan necesita, todas del mismo resultado.

## Cuando llegue iOS (v2)

Hará falta una segunda exportación en **USDZ** para RealityKit, con los mismos
nombres de animación. Como los modelos se generan por script, ese camino es
añadir un exportador a `scripts/build-ar-models.js` y no volver a modelar nada;
la verificación cruzada de nombres entre formatos la hará `check:ar-models`.
