# Modelos 3D del bloque de Realidad Aumentada

Los tres modelos que consume la capa de recompensa (`SceneHost`). **No están en
el repositorio todavía**: este fichero es su contrato, para que quien los
produzca o los licencie sepa exactamente qué hace falta y para que el registro
de autoría no dependa de la memoria de nadie.

Mientras no existan, el módulo **funciona igual**: la escena cae a la
sobreimpresión 2D (barra de carga, anillo de progreso, dianas) y los tres
ejercicios se pueden jugar y medir de punta a punta. Es la misma degradación
elegante que usa `valeriaNoise` cuando no encuentra `expo-audio`.

## Contrato

| Fichero | Ejercicio | Animación exigida | Qué hace |
| --- | --- | --- | --- |
| `coche.glb` | AR-1 | — (traslación por código) | Avanza en Z a velocidad **proporcional** al progreso del sostén labial. Al llegar a 1.0, animación de meta |
| `perro.glb` | AR-2 | `celebrate` | Celebra **solo** ante giro correcto dentro de ventana. En ensayo trampa nunca celebra |
| `manzana.glb` | AR-3 | `spin360` | Gira 360° al confirmarse la selección (no al primer vistazo) |
| `pelota.glb`, `zapato.glb` | AR-3 | `spin360` | Distractores. Mismo estilo y tamaño aparente que la manzana |

## Requisitos técnicos

- **Formato**: glTF binario (`.glb`), una sola malla por modelo.
- **Peso**: **< 2 MB por modelo**, con compresión Draco o meshopt. El
  presupuesto de descarga del bloque entero es de **+25 MB** sobre la versión
  sin RA, y se mide como criterio de salida de la Fase 3.
- **Polígonos**: *low-poly*. El objetivo es un teléfono de gama media de hace
  tres años sosteniendo cámara + inferencia + Filament a la vez.
- **Nombres de animación**: literalmente los de la tabla. La escena los busca
  por nombre; una animación llamada `Celebrate` o `celebrar` no se encuentra.
- **Escala**: 1 unidad = 1 metro, origen en la base del modelo, mirando a +Z.
- **Sin texturas de más de 512×512**: a la distancia de trabajo no se aprecian y
  se llevan la mitad del presupuesto de descarga.

## Licencia y atribución (obligatorio antes de publicar)

Cada modelo tiene que llegar con su licencia registrada aquí **y** acreditado en
`src/ValeriaCreditsScreen.tsx`, que existe justo para eso.

| Fichero | Autoría | Licencia | Origen |
| --- | --- | --- | --- |
| `coche.glb` | *pendiente* | *pendiente* | *pendiente* |
| `perro.glb` | *pendiente* | *pendiente* | *pendiente* |
| `manzana.glb` | *pendiente* | *pendiente* | *pendiente* |
| `pelota.glb` | *pendiente* | *pendiente* | *pendiente* |
| `zapato.glb` | *pendiente* | *pendiente* | *pendiente* |

Licencias admisibles: CC0, CC-BY (con atribución en Créditos) o encargo propio.
**No** se admite nada con cláusula no comercial ni de uso restringido: la app se
distribuye en Play y el proyecto tiene ruta comercial declarada.

## Cuando llegue iOS (v2)

Hará falta una segunda exportación en **USDZ** para RealityKit, con los mismos
nombres de animación. El riesgo conocido es la divergencia entre los dos
formatos, y se mitiga con un script de verificación en `scripts/` —igual que ya
se hace con el corpus de voz—, no revisándolo a mano.
