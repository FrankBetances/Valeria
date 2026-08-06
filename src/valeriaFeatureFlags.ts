// ============================================================================
// Valeria+ · Interruptores de funcionalidad — Sprint 2.3
//
// Punto único de conmutación entre la interfaz clásica (v10.2) y la evolución
// v11 (grid de 2 columnas + pestañas inferiores). Mientras esta bandera esté
// en `false`, la app clínica en producción usa EXACTAMENTE el flujo de siempre:
// `ValeriaExerciseSelectionScreen` con su hub y su lista.
//
// Es una CONSTANTE DE MÓDULO, no estado global, y eso es deliberado:
// conmutarla en caliente reconstruiría el árbol de navegación entero, lo que
// desmontaría `ValeriaExercisePlayerScreen` a mitad de un ejercicio y perdería
// la sesión en curso (y su tramo de telemetría). Se cambia el valor y se
// recarga la app.
//
// Retirada (Sprint 4.6): cuando la v11 pase el QA clínico, esta bandera y el
// screen clásico se eliminan juntos. El borrado del screen antiguo es el
// ÚLTIMO paso, no el primero.
// ============================================================================

/**
 * Interfaz v11: pestañas inferiores (Terapias · Academy · Ajustes) y hub en
 * cuadrícula sin subtítulos.
 *
 * `false` por defecto: el piloto en curso sigue con la interfaz clásica hasta
 * que la validación con testers (Sprint 4.5) dé el visto bueno.
 */
// El tipo se anota como `boolean` A PROPÓSITO, en vez de dejar que TypeScript
// infiera el literal `false`. Con el literal, el compilador estrecha el
// ternario del AppNavigator y deja de comprobar a fondo la rama v11: el código
// compilaría en `false` y podría romper el día que alguien lo ponga en `true`.
// Anotado como boolean, las DOS ramas se verifican en cada `npm run typecheck`.
export const ENABLE_V11_UI: boolean = false;
