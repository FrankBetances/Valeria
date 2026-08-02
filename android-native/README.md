# `android-native/` · Fuentes nativas de Android

Aquí viven los módulos Android escritos a mano. El directorio `android/` lo
genera `expo prebuild` y **no se versiona**, así que cualquier código Kotlin
propio tiene que vivir fuera de él y entrar en la compilación a través de un
*config plugin*.

Es el espejo de `ios-native/`, que hace lo mismo para Xcode.

| Módulo | Qué es | Cómo entra en el build |
| --- | --- | --- |
| `valeria-ar/` | Host nativo del bloque de **Realidad Aumentada**: CameraX → MediaPipe Face Landmarker → capa de recompensa → escena 3D (SceneView/Filament) | [`plugins/withValeriaAR.js`](../plugins/withValeriaAR.js) |

## Cómo lo monta el plugin

`withValeriaAR` hace cinco cosas en cada `expo prebuild`:

1. **Copia** `android-native/valeria-ar` a `android/valeria-ar`.
2. **Incluye** el módulo en `android/settings.gradle` (`include ':valeria-ar'`).
3. **Añade** la dependencia `implementation project(':valeria-ar')` al
   `build.gradle` de la app.
4. **Registra** `ValeriaArPackage()` en `MainApplication.kt`.
5. **Declara** el permiso `android.permission.CAMERA` y el `uses-feature`
   opcional de cámara frontal en el manifiesto, y sube `minSdkVersion` a 24 si
   estuviera por debajo.

Nada de esto toca los seis bloques en producción ni la Arquitectura Antigua:
`newArchEnabled` sigue en `false`.

## Cómo trabajar con él

```bash
npx expo prebuild -p android     # regenera android/ y vuelve a copiar el módulo
npm run android                  # compila e instala en el teléfono conectado
```

Al editar Kotlin hay que **volver a lanzar el prebuild** (o editar
`android/valeria-ar` y copiar los cambios de vuelta a mano antes de commitear:
lo que se versiona es `android-native/`, no `android/`).

## Lo que este árbol NO trae

- **Los modelos 3D** (`coche.glb`, `perro.glb`, `manzana.glb` y distractores).
  Su contrato —nombres de animación, presupuesto de polígonos y licencia— está
  en [`assets/models/README.md`](../assets/models/README.md). Sin ellos la
  escena arranca igual, con formas primitivas: el ejercicio se puede probar
  antes de que exista un solo GLB.
- **El modelo `.task` de MediaPipe** (`face_landmarker.task`, ~3,5 MB). Se
  descarga del catálogo de Google y se coloca en
  `android-native/valeria-ar/src/main/assets/`. No se versiona porque es un
  binario de terceros con su propia licencia; el `build.gradle` del módulo
  falla con un mensaje claro si falta.

## Estado

El código está escrito contra las APIs estables de `tasks-vision` y
`sceneview` 4.25.0, pero **no se ha compilado todavía contra un SDK de Android
real**: eso es lo primero de la Fase 1 del
[plan](../docs/plan-integracion-rehabilitacion-ar.md#fase-1--andamiaje-sin-ejercicios).
Los índices de landmark canónicos (33/263 cantos externos, 61/291 comisuras,
13/14 borde labial) están marcados en el código como *a verificar contra el
modelo real*, no como constantes de fe.
