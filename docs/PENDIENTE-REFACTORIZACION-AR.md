# Pendiente: refactorización del módulo de RA

**La refactorización del módulo de RA NO está hecha.** Este documento dice qué hay en `main` y qué
falta. Estado al 2/11/2026, `main` con el build 728 en verde. Plan de referencia:
[`PLAN-INTEGRACION-AR-LUA-CONSTRUYE.md`](PLAN-INTEGRACION-AR-LUA-CONSTRUYE.md) v3.0.

## Lo que hay en `main`

| Fase | Qué | Comprobado con | Sin comprobar |
| :- | :--- | :--- | :--- |
| 1 | Plan v3.0 contrastado con `lua-firmware` y `lua-construye` | Lectura de los tres repos | — |
| 2 | `src/steam/arNeeds.ts` + gate `check-steam-ar-needs.js`: qué pide cada reto a la cámara | Gate en rojo de cuatro formas; build 728 | — |
| 3 | «Solo Lúa»: L01 (AR-1) e «Imita a Lúa» (AR-6) desde Construye con Lúa | Gates; capturas de **web** | **No visto en un aparato**: ni que el ejercicio arranque ni que la Lúa física cambie de cara |
| 4a | Banco D2 preparado: hojas de marcadores, simulación y protocolo (`docs/banco-d2/`) | Cada hoja se relee con el detector | La simulación **no es el banco** |

Hoy los 35 retos de S0–S6 se juegan con el botón del adulto. Ninguno usa la cámara.

## Lo que falta, en orden

1. **Banco D2 con piezas impresas** (Frank). Decide ArUco o AprilTag y el tamaño. Bloquea todo lo
   que pide marcador: 34 de los 35 retos.
2. **Fase 4b · detector nativo de prueba** (OpenCV en `valeria-ar`): detección, fps junto a la cara
   y tamaño del APK, en un aparato.
3. **Fase 5 · luz y vibración de Lúa**: sincronizar `firmware/lua/protocol.json` con `lua-firmware`
   (`LIGHT` 18, `HAPTIC` 19, `CAP_LIGHT`, `CAP_HAPTIC`). Bloqueada: el firmware del cubo no existe y
   no está escrito si `LIGHT`/`HAPTIC` van a la cabeza o al cubo.
4. **Fase 6 · detector de marcador y capa de revelación** en S0–S6, con los GLB de
   `lua-construye/sets/*/ar/`.
5. **Fase 7 · detector de mano**: S2, S6 y L05.

## Lo que la refactorización completa exige y el plan v3.0 todavía no cubre

- **Migrar AR-1…AR-6 y `ValeriaArLauncherScreen` al motor declarativo** (`src/steam/engine`). Hoy
  conviven dos sistemas: el lanzador nativo y los retos de Construye con Lúa.
- **Eventos en vivo del nativo a la app.** `launchAr` solo devuelve el resultado al cerrar, así que
  Lúa no puede reaccionar a mitad de un gesto.
- **Las pantallas del módulo** (lanzador, menú de ejercicios, resultados) no se han rediseñado.

## Decisiones que esperan a Frank

- Renumerar `instanceMarkerIds` de los siete mundos si gana AprilTag (los IDs llegan a 672; 36h11
  tiene 587 códigos).
- `K-LOMO-G` (id 9) sigue en el manifiesto de S0 y ya no existe con Lúa V5.
- Los eventos de S3 aún declaran `tracked_object`, el detector que el plan descarta.
- L06 retirada por riesgo regulatorio (VRA en una app no SaMD): se reabre solo con revisión escrita.
- S8–S11: maquetas que no casan con Lúa V5, fuera hasta que se partan en piezas.
