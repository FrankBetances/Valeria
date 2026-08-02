# ============================================================================
# Valeria+ · Reglas de R8/Proguard del bloque de Realidad Aumentada
#
# Viajan con el módulo (consumerProguardFiles) y no en el fichero de la app: el
# módulo de RA es quien introduce MediaPipe y Filament, así que sus reglas
# deben irse con él si algún día se retira.
#
# Valeria+ compila release con `enableProguardInReleaseBuilds`, así que esto no
# es opcional: sin estas reglas el build de release falla o —peor— produce un
# APK que revienta en el teléfono de una familia y no en el de nadie más.
# ============================================================================

# --- Referencias que MediaPipe declara y no empaqueta -----------------------
# `tasks-vision` incluye el framework de MediaPipe, que referencia clases de
# protobuf generadas para dos funciones que este módulo NO usa —el perfilador
# de grafos y las plantillas de grafo—. Esas clases viven en otros artefactos
# del proyecto MediaPipe que no se distribuyen con Tasks.
#
# Desde AGP 7, R8 trata una clase ausente como ERROR y no como aviso, así que
# hay que declararlo explícitamente. No se está silenciando un problema real:
# `GraphProfiler.getCalculatorProfiles()` y `Graph.loadBinaryGraphTemplate()`
# no se invocan desde ninguna ruta de este módulo —solo se construye un
# FaceLandmarker en LIVE_STREAM—, de modo que el código que las referencia es
# inalcanzable en tiempo de ejecución.
-dontwarn com.google.mediapipe.proto.**
-dontwarn com.google.mediapipe.framework.GraphProfiler
-dontwarn com.google.mediapipe.framework.Graph

# --- Lo que NO se puede minificar -------------------------------------------
# MediaPipe Tasks resuelve clases y modelos por reflexión desde JNI: si R8 las
# renombra, el Face Landmarker falla al CONSTRUIRSE, no al usarse, y el síntoma
# es una pantalla que no arranca sin traza útil.
-keep class com.google.mediapipe.** { *; }
-keep class com.google.protobuf.** { *; }

# Filament resuelve sus entidades nativas por nombre desde C++ (Engine, Scene,
# View, TransformManager y el cargador de glTF de gltfio).
-keep class com.google.android.filament.** { *; }
-dontwarn com.google.android.filament.**
