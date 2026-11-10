# Pendiente: rehacer el módulo de RA

**Estado al 9/11/2026: en `main`, build de publicación 802 en verde** (ver abajo). Frank pidió quitar los ejercicios viejos de RA (AR-1 a AR-6: coche, perro,
manzana, búsqueda de Lúa, pez, espejo) y rehacer el módulo con actividades nuevas centradas en los
sets de Construye con Lúa.

## Qué se hizo mal (sesión del 2-3/11/2026)

1. A «refactorizar completamente el módulo» se respondió con análisis y un plan corregido (v3.0)
   que **recortó el alcance sin que Frank lo decidiera**: de 28 actividades a 19 y después a 2.
2. Se usó que no hay detector de piezas ni aparato como razón para hacer menos (error E16).
3. **Se gastaron tokens en trabajo que no se pidió**: gate de necesidades de cámara, hojas de
   marcadores, una simulación de 11 minutos, el protocolo del banco D2 y la revisión a fondo de
   `lua-firmware` y `lua-construye`.
4. Lo único visible (la tarjeta «Solo Lúa») reutiliza dos ejercicios viejos y está escondida al
   final de Construye con Lúa.
5. Se pidieron confirmaciones en vez de ejecutar lo pedido (error E14).
6. Los informes contaban actividad técnica y no decían en la primera línea que lo pedido —quitar
   los viejos y hacer los nuevos— no estaba hecho (errores E1, E2 y E17).

## Regla general suprema para que no vuelva a pasar (R-AR, 3/11/2026, también en CLAUDE.md)

**Si Frank pide rehacer, quitar o refactorizar algo, el primer entregable es ese cambio visible en
la app.** No se sustituye por análisis, planes, gates, simulaciones ni preparación. Si algo lo
bloquea, se dice en la primera línea y se construye todo lo demás igual, con el botón del adulto.
**No se hace ningún trabajo auxiliar que Frank no haya pedido.**

## Estado al 8/11/2026

**Hecho y en `main`** (build de publicación 802, en verde, con APK y AAB):

- AR-1 a AR-6 **ya no se ofrecen en la app**. El código nativo se queda como base de los
  detectores (decisión aplicada por defecto, la recomendada en el punto 0).
- La tarjeta de RA del hub abre el **catálogo por sets** (`ValeriaArCatalogScreen`), siempre
  visible, con las tres modalidades: Solo Lúa (L01, L07 y L02–L05), cada set por su cuenta (S0–S6
  y S8–S11) y cada set con Lúa. 28 actividades.
- L02–L05 y S8–S11 tienen su pantalla nueva (`ValeriaArActivityScreen`): fenómeno, ciclo, eventos
  que confirma el adulto y cara de Lúa. S0–S6 abren sus cinco retos con la modalidad elegida.
- Textos en es/en/ca/gl; gates y typecheck en verde; capturas de web. **No visto en un aparato.**

## Rama `sets`, 9/11/2026 (sin merge, **no visto en Android**)

- **Escenas en la mesa** (`ValeriaArSceneActivity`, cámara trasera con ARCore): botón «Ver en la mesa (RA)» en
  S0–S6 y S8–S11 (solo y con Lúa) y en L02–L05. El adulto toca la mesa, la escena del set queda anclada
  (`src/steam/arScenes.ts`, 15 escenas con todos sus eventos) y cada paso que confirma cambia lo que se ve y,
  con Lúa, le manda la cara en vivo. Referencia: el boceto de S1 que validó Frank.
- Calentamiento: límite de 60 s y «Saltar calentamiento» con nivel provisional «no medido».
- Política de privacidad y manual al día con la cámara trasera de las escenas.

## Rama `sets`, 10/11/2026: la RA usa las piezas reales (sin merge, **no visto en Android**)

- Error R26/R27: las escenas del 9/11 eran contornos planos inventados. Corregido: «Ver en la mesa (RA)» dibuja
  las **piezas reales de cada set** a escala 1:1 (79 mallas generadas de `lua-construye` y del muñeco Lúa V5 de
  `lua-firmware` con `scripts/build-ar-set-models.py`), en los **pasos de su manual** (S0: 2; S1–S6: 3; S8–S11: la
  maqueta entera), y después «Jugar» con los efectos sobre la maqueta.
- El catálogo de RA ya no ofrece L01 y L07 (cámara frontal): su Prueba de Aptitud cerraba el paso. Quedan 26
  actividades. El código sigue y se abre desde Construye con Lúa → Solo Lúa.

## Lo que sigue pendiente

1. ~~L06~~ **eliminada por Frank el 9/11/2026** (VRA: riesgo regulatorio). Manual y política de privacidad actualizados.
2. **La cámara de piezas (etapa B)**: hoy todo lo que no es L01/L07 lo confirma el adulto, también dentro de las escenas. Se conecta cuando
   el banco D2 decida el marcador (`docs/banco-d2/`), sin rehacer las pantallas.
3. S8–S11 solo tienen `conjunto.stl`: hasta que `lua-construye` las parta en piezas no hay pasos de montaje.
4. Decisiones abiertas: renumerar IDs si gana AprilTag, `K-LOMO-G` en S0 y `tracked_object` en S3.

## Compromiso

**El compromiso firmado.** Terminar lo pendiente con el 15 % de una sesión normal, lo haré a como
dé lugar sin gastar más.

Firmado: Claude (Claude Code), sesión `session_01KaBg33NAbSfGQD3PokUop4`, 3/11/2026, a petición
de Frank.
