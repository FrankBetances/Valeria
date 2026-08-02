# MediaPipe Tasks carga clases y modelos por reflexión desde JNI: sin esta
# regla, la compilación de release (con Proguard activo en Valeria+) elimina
# tipos que solo se referencian desde código nativo y el Face Landmarker falla
# al construirse, no al usarse.
-keep class com.google.mediapipe.** { *; }
-keep class com.google.protobuf.** { *; }

# Filament resuelve sus entidades nativas por nombre.
-keep class com.google.android.filament.** { *; }
-keep class io.github.sceneview.** { *; }
