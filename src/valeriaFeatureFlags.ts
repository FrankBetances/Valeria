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
 * **ACTIVA** desde el visto bueno de los testers del piloto (Sprint 4.5). La
 * app arranca en `MainTabNavigator`.
 *
 * `ValeriaExerciseSelectionScreen` NO se ha borrado: sigue enganchada a la
 * rama `false` de este interruptor y es la vía de vuelta. Si la v11 diera un
 * problema en campo, volver a la interfaz clásica es cambiar `true` por
 * `false` y publicar — no hay despliegue que revertir ni datos que migrar,
 * porque las claves de AsyncStorage son las mismas en las dos interfaces.
 *
 * El borrado del screen clásico y de esta bandera (Sprint 4.6) va DESPUÉS de
 * una tanda de uso real con la v11 encendida, no a la vez que el encendido:
 * borrarlos hoy tiraría la red de seguridad justo el día que hace falta.
 */
// El tipo se anota como `boolean` A PROPÓSITO, en vez de dejar que TypeScript
// infiera el literal. Con el literal, el compilador estrecha el ternario del
// AppNavigator y deja de comprobar a fondo la otra rama: el código compilaría
// hoy y podría romper el día que alguien conmute el valor. Anotado como
// boolean, las DOS ramas se verifican en cada `npm run typecheck` — y ahora
// esa garantía protege la vía de vuelta, no la de ida.
export const ENABLE_V11_UI: boolean = true;
