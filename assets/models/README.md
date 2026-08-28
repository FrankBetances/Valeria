# Modelos 3D del bloque de Realidad Aumentada

Los ocho modelos 3D que consume la capa de recompensa y ejercicios (`SceneHost`). **Están en el
repositorio y son de obra propia**: los genera
[`scripts/build-ar-models.js`](../../scripts/build-ar-models.js) a partir de
geometría descrita en ese fichero, sin dependencias y sin descargas.

```bash
npm run build:ar-models   # regenera los ocho .glb
npm run check:ar-models   # verifica el contrato contra el enum ArModel de Kotlin
```

## Por qué generados y no de un banco de assets

Un modelo gratuito de internet trae siempre las mismas tres dudas: qué licencia
tiene de verdad, si la conservará mañana, y si sus animaciones se llaman como el
código espera. Generándolos las tres desaparecen a la vez —autoría del proyecto,
licencia CC0, nombres de animación definidos en el mismo sitio que los invoca— y
además pesan **151,3 KB los ocho juntos**, frente a los 2 MB de presupuesto por
modelo.

Son modelos **de trabajo, no de ilustración**: formas limpias, colores planos y
silueta reconocible a 35 cm en una pantalla de seis pulgadas. Sirven para jugar y
para medir desde el primer día. Sustituirlos por un encargo artístico es dejar
caer un `.glb` con las **mismas animaciones** en esta carpeta y volver a correr
`npm run check:ar-models`: no se toca una línea de Kotlin.

## Contrato de Animaciones y Conducta Clínica

| Fichero | Ejercicio | Animación exigida | Qué hace en la escena |
| --- | --- | --- | --- |
| `coche.glb` | AR-1 | `celebrate` | Avanza en Z a velocidad **proporcional** al progreso del sostén labial (traslación por código). Al llegar a 1.0, salto de meta con giro de ruedas |
| `perro.glb` | AR-2 | `celebrate` | Celebra —salto, rabo y asentimiento— **solo** ante giro correcto dentro de ventana. En ensayo trampa nunca celebra |
| `manzana.glb` | AR-3 | `spin360` | Gira 360° al **confirmarse** la selección por fijación de mirada, no al primer vistazo |
| `pelota.glb` | AR-3 | `spin360` | Distractor visual para selección por fijación |
| `zapato.glb` | AR-3 | `spin360` | Distractor visual para selección por fijación |
| `lua.glb` | AR-4 / AR-6 | `celebrate` | Mascota Lúa 3D: celebra con salto, batir de cola y ladeo cefálico al ser localizada con la retícula foveal (AR-4) o ante imitación mímica simétrica (AR-6) |
| `pez.glb` | AR-5 | `spin360` | Pez dorado de premio lanzado hacia Lúa; gira 360° durante la trayectoria parabólica y la captura |

> **Los distractores giran igual que la diana a propósito.** Si solo se animara
> la respuesta correcta, el movimiento sería una pista y AR-3 dejaría de medir
> comprensión léxica para medir detección de movimiento.

La animación de premio tiene que leerse **de un vistazo y desde lejos**: un
salto y un giro completos, no un matiz. Un niño de cuatro años que no distingue
si le han premiado deja de tener refuerzo, por cuidado que esté el modelo.

## Especificación Geométrica Detallada

| Fichero | Tamaño | Triángulos | Mallas / Nodos Principales | Animaciones | Asociación Clínica |
| --- | --- | --- | --- | --- | --- |
| `coche.glb` | 15,7 KB (15.716 B) | 260 | `carroceria`, `cabina`, `faros`, `rueda_0`..`rueda_3` (bajo nodo `ruedas`), raíz: `coche` | `celebrate` (salto Z/Y + rotación en Z) | **AR-1 (Cinemática Orofacial)**: Activación proporcional por redondeo labial con histéresis cinemática. |
| `perro.glb` | 15,2 KB (15.200 B) | 120 | `cuerpo`, `pata_0`..`pata_3`, `craneo`, `morro`, `oreja_0`, `oreja_1` (bajo `cabeza`), `cola_seg` (bajo `cola`), raíz: `perro` | `celebrate` (salto + 4 barridos de rabo ±38° + asentimiento) | **AR-2 (Audiometría de Refuerzo Visual · VRA)**: Refuerzo contingente ante giro cefálico hacia estímulo sonoro lateralizado. |
| `manzana.glb` | 15,4 KB (15.436 B) | 584 | `fruta`, `tallo`, `hoja`, raíz: `manzana` | `spin360` (giro 360° en Y en 1,0 s) | **AR-3 (Selección por Fijación)**: Diana léxica evaluada por vector de mirada sostenida. |
| `pelota.glb` | 19,5 KB (19.532 B) | 864 | `esfera`, `banda` (franja ecuatorial), raíz: `pelota` | `spin360` (giro 360° en Y en 1,0 s) | **AR-3 (Distractor semántico)**: Estímulo alternativo para discriminación léxica. |
| `zapato.glb` | 9,7 KB (9.748 B) | 228 | `suela`, `empeine`, `puntera`, `cordones`, raíz: `zapato` | `spin360` (giro 360° en Y en 1,0 s) | **AR-3 (Distractor semántico)**: Estímulo alternativo para discriminación léxica. |
| `lua.glb` | 50,4 KB (50.432 B) | 1.504 | `cuerpo`, `pata_0`..`pata_3`, `craneo`, `oreja_0`..`1`, `oreja_int_0`..`1`, `ojo_0`..`1`, `hocico`, `nariz`, `collar`, `cascabel` (bajo `cabeza`), `cola_mesh` (bajo `cola`), raíz: `lua` | `celebrate` (salto 0,45m + batir de cola ±42° + ladeo cefálico) | **AR-4 (Búsqueda Espacial)** y **AR-6 (Espejo Mímico)**: Mascota interactiva Lúa (28 expresiones y opcodes). |
| `pez.glb` | 15,9 KB (15.944 B) | 504 | `cuerpo_pez`, `cola_pez`, `aleta_dorsal`, `ojo_pez_0`, `ojo_pez_1`, raíz: `pez` | `spin360` (giro 360° en Y en 0,8 s) | **AR-5 (Lanzamiento y Captura)**: Pez dorado lanzado con cinemática hacia Lúa. |

### Árbol de Jerarquía de Nodos por Modelo

1. **`coche.glb`** (Raíz: `coche`, 15.716 B, 260 triángulos, 7 mallas)
   - `carroceria` (malla PBR rojo)
   - `cabina` (malla PBR turquesa)
   - `faros` (malla PBR amarillo)
   - `ruedas` (nodo agrupador animado en `celebrate`)
     - `rueda_0`, `rueda_1`, `rueda_2`, `rueda_3` (cilindros eje Z)
   - *Animación*: `celebrate` (traslación Y en `coche` + rotación Z en `ruedas`)
   - *Asociación clínica*: AR-1 (Cinemática Orofacial).

2. **`perro.glb`** (Raíz: `perro`, 15.200 B, 120 triángulos, 10 mallas)
   - `cuerpo` (malla PBR marrón claro)
   - `pata_0`, `pata_1`, `pata_2`, `pata_3` (mallas PBR marrón oscuro)
   - `cabeza` (nodo articulado con traslación `[0.56, 0.78, 0]`)
     - `craneo`, `morro`, `oreja_0`, `oreja_1`
   - `cola` (nodo articulado con traslación `[-0.5, 0.8, 0]`)
     - `cola_seg`
   - *Animación*: `celebrate` (traslación Y en `perro` + rotación Y en `cola` + rotación Z en `cabeza`)
   - *Asociación clínica*: AR-2 (VRA · Audiometría de Refuerzo Visual).

3. **`manzana.glb`** (Raíz: `manzana`, 15.436 B, 584 triángulos, 3 mallas)
   - `fruta` (esfera deformada PBR rojo manzana)
   - `tallo` (cilindro marrón)
   - `hoja` (esfera aplastada verde)
   - *Animación*: `spin360` (rotación 360° en eje Y en 1,0 s sobre `manzana`)
   - *Asociación clínica*: AR-3 (Selección Semántica por Fijación · Diana léxica).

4. **`pelota.glb`** (Raíz: `pelota`, 19.532 B, 864 triángulos, 2 mallas)
   - `esfera` (esfera PBR blanco cuero)
   - `banda` (franja ecuatorial azul)
   - *Animación*: `spin360` (rotación 360° en eje Y en 1,0 s sobre `pelota`)
   - *Asociación clínica*: AR-3 (Distractor semántico).

5. **`zapato.glb`** (Raíz: `zapato`, 9.748 B, 228 triángulos, 4 mallas)
   - `suela` (caja PBR crema)
   - `empeine` (caja PBR azul)
   - `puntera` (esfera deformada azul)
   - `cordones` (caja blanca)
   - *Animación*: `spin360` (rotación 360° en eje Y en 1,0 s sobre `zapato`)
   - *Asociación clínica*: AR-3 (Distractor semántico).

6. **`lua.glb`** (Raíz: `lua`, 50.432 B, 1.504 triángulos, 17 mallas)
   - `cuerpo` (esfera PBR pelaje blanco crema)
   - `pata_0`, `pata_1`, `pata_2`, `pata_3` (cilindros eje Y)
   - `cabeza` (nodo articulado con traslación `[0, 0.82, 0.1]`)
     - `craneo` (esfera pelaje)
     - `oreja_0`, `oreja_1` (cajas pelaje)
     - `oreja_int_0`, `oreja_int_1` (cajas rosa interior)
     - `ojo_0`, `ojo_1` (esferas turquesa de marca)
     - `hocico` (esfera pelaje)
     - `nariz` (esfera rosa)
     - `collar` (cilindro turquesa)
     - `cascabel` (esfera dorada)
   - `cola` (nodo articulado con traslación `[0, 0.38, -0.32]`)
     - `cola_mesh` (cilindro pelaje)
   - *Animación*: `celebrate` (salto 0,45m en `lua` + batir de cola ±42° en `cola` + ladeo en `cabeza`)
   - *Asociación clínica*: AR-4 (Búsqueda Espacial "Lúa Salvaje") y AR-6 (Espejo Mímico "Buddy Lúa").

7. **`pez.glb`** (Raíz: `pez`, 15.944 B, 504 triángulos, 5 mallas)
   - `cuerpo_pez` (esfera ovalada PBR amarillo/dorado)
   - `cola_pez` (aleta trasera PBR naranja)
   - `aleta_dorsal` (aleta superior PBR naranja)
   - `ojo_pez_0`, `ojo_pez_1` (esferas PBR gris oscuro)
   - *Animación*: `spin360` (rotación 360° en eje Y en 0,8 s sobre `pez`)
   - *Asociación clínica*: AR-5 (Lanzamiento y Captura "Alimentar a Lúa" · Pez dorado).

## Requisitos técnicos (los verifica `check:ar-models`)

- **Formato**: glTF 2.0 binario (`.glb`). Los ocho pasan el validador oficial
  de Khronos con **cero errores y cero advertencias**.
- **Peso**: < 2 MB por modelo (presupuesto contractual). Actuales: 9,7 – 50,4 KB (total: 138,7 KB para los 7 modelos).
- **Polígonos**: 120 – 1.504 triángulos por modelo, normales planas. El objetivo es
  un teléfono de gama media de hace tres años sosteniendo cámara + inferencia +
  Filament a la vez a 60 FPS estables.
- **Nombres de animación**: literalmente los de la tabla (`celebrate`, `spin360`). La escena los busca
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
| `lua.glb` | Proyecto Valeria+ · Dr. Frank Alberto Betances Reinoso | **CC0-1.0** | Obra propia · `scripts/build-ar-models.js` |
| `pez.glb` | Proyecto Valeria+ · Dr. Frank Alberto Betances Reinoso | **CC0-1.0** | Obra propia · `scripts/build-ar-models.js` |

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
