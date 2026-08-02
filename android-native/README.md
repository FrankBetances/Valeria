# `android-native/` · Fuentes nativas de Android

Aquí viven los módulos Android escritos a mano. El directorio `android/` lo
genera `expo prebuild` y **no se versiona**, así que cualquier código Kotlin
propio tiene que vivir fuera de él y entrar en la compilación a través de un
*config plugin*.

Es el espejo de `ios-native/`, que hace lo mismo para Xcode.

| Módulo | Qué es | Cómo entra en el build |
| --- | --- | --- |
| `valeria-ar/` | Host nativo del bloque de **Realidad Aumentada**: CameraX → MediaPipe Face Landmarker → capa de recompensa → escena 3D (Filament) | [`plugins/withValeriaAR.js`](../plugins/withValeriaAR.js) |

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

## Assets

Ambos están ya en el repositorio; estos comandos existen para regenerarlos o
verificarlos, no para completar un hueco.

| Asset | Dónde | Cómo se obtiene |
| --- | --- | --- |
| **Modelos 3D** (`coche`, `perro`, `manzana`, `pelota`, `zapato`) | `assets/models/*.glb` — el plugin los copia a `src/main/assets/models/` en cada prebuild | `npm run build:ar-models` · obra propia, CC0, 74 KB los cinco |
| **Modelo de señal facial** (`face_landmarker.task`, 3,6 MB) | `valeria-ar/src/main/assets/` | `npm run fetch:ar-model` · Google, Apache-2.0, revisión fijada con SHA-256 verificado |

`npm run check:ar-models` comprueba las dos cosas y, sobre todo, que los nombres
de animación de los `.glb` siguen coincidiendo con los que invoca el enum
`ArModel` de Kotlin. Ese desajuste no rompe el build: rompe el refuerzo, en
silencio y en el teléfono de una familia.

Si faltaran los `.glb`, la escena cae a la sobreimpresión 2D y los tres
ejercicios siguen siendo jugables y medibles. Si faltara el `.task`, el
`build.gradle` del módulo falla con la instrucción delante.

## Estado

El código está escrito contra las APIs estables de `tasks-vision` 0.10.29 y
Filament 1.72.1, pero **no se ha compilado todavía contra un SDK de Android
real**: eso es lo primero de la Fase 1 del
[plan](../docs/plan-integracion-rehabilitacion-ar.md#fase-1--andamiaje-sin-ejercicios).
Los índices de landmark canónicos (33/263 cantos externos, 61/291 comisuras,
13/14 borde labial) están marcados en el código como *a verificar contra el
modelo real*, no como constantes de fe.
