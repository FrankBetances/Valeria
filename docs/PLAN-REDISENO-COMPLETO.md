# Plan de rediseño completo de Valeria+ (v1, 2/11/2026)

**Objetivo único:** que un niño de siete años sepa usar la app sin que nadie se
la explique, y que sea bonita, viva y fácil de entender. Si una pantalla
necesita explicarse, está mal diseñada.

**Alcance:** las 27 rutas de `AppNavigator` y `MainTabNavigator` más sus
ventanas emergentes (PIN, premios, perfiles). Se rediseña todo lo que se ve.
Nada queda fuera sin que Frank lo decida.

> Este documento es solo el plan. No se ha tocado código.

---

## 0. Qué está mal hoy (revisión de UX, regla S4)

Base de la revisión:
- las capturas de `docs/screenshots/`, tomadas el 4/9/2026;
- el código de las pantallas en `main`.

El estado exacto de `main` con los arreglos de las otras dos ramas **no lo he
capturado**: la revisión de esa versión se hace en F0.

| Problema | Dónde se ve | Por qué confunde |
| --- | --- | --- |
| Jerga técnica | Hub: «Selección de Ejercicios», «prescribir», «Pares Mínimos · dislalias», «Expansión Semántica» | Ni un niño ni una familia saben qué es |
| Códigos internos a la vista | Ejercicio: «FF-1», «Sonidos y vocales (fonética-fonología)» | Ruido sin significado para quien juega |
| Demasiado texto | Ejercicio: «Paso 1 · consigna del tutor», instrucciones de dos líneas, avisos al pie | El niño no lee; el adulto no lo lee entero |
| Todo compite en la primera pantalla | Hub: nivel y XP, pescadito, premios y seis bloques con contador, todo a la vez | No hay un primer paso claro |
| Mezcla de niño y adulto en la misma pantalla | Pestañas Academy, Ejercicios y Ajustes siempre visibles | El niño toca Ajustes o Academy y se pierde |
| Botón «Atrás» en pantallas raíz | Hub con «‹ Atrás» dentro de una pestaña | No se sabe adónde vuelve |
| Contadores sin sentido para el niño | «105 act.», «18 / 18», «7 / 7» | Números sin explicación |
| Emoji del sistema como imágenes | Araña, elefante, isla en el ejercicio | Cambian según el teléfono; incumple la regla 5 |
| Poca vida | Tarjetas estáticas; solo la celebración final se anima | No invita a tocar |
| Contraste insuficiente | «Continuar» y «Comenzar» (arreglados en `4e0ff52` y `ada1003` por Frank) | Texto que no se lee |

---

## 1. Las reglas del niño de siete años

Cada pantalla del rediseño cumple estas 12 reglas. Al final se comprueban una a
una (§7).

1. **Una pantalla, una pregunta.** «¿Quién juega?», «¿A qué jugamos?»,
   «¿Qué empieza por A?». Nunca dos.
2. **Un botón principal, enorme**, siempre en el mismo sitio (abajo, a todo lo
   ancho) y siempre del mismo color.
3. **Seis opciones como máximo** en una pantalla de elección del niño, sin
   desplazar.
4. **Cada botón lleva dibujo y una palabra.** Como mucho, tres palabras.
5. **Todo se oye.** Al tocar una opción, Lúa la dice en voz alta; el texto
   locutado pasa por `export-voice-corpus.js`.
6. **Cada toque responde**: animación, sonido y vibración corta. Nada queda
   «muerto».
7. **Volver es siempre la casa**: botón redondo arriba a la izquierda, mismo
   icono, que lleva a la Casa de Lúa.
8. **Nada de jerga, códigos, porcentajes ni XP para el niño.** El progreso se
   ve con estrellas y con la gata contenta.
9. **El adulto vive aparte**, detrás de un candado: se mantiene pulsado 2 s y
   se escribe el PIN. El niño nunca cae ahí por accidente.
10. **Botones del niño de 64 dp como mínimo**; los del adulto, de 48 dp como
    mínimo (mínimo de Material Design).
11. **Contraste WCAG AA** de 4,5:1 en texto normal y 3:1 en texto grande,
    comprobado por un gate, no a ojo.
12. **Cuatro idiomas de interfaz** (es, gl, ca, en) y la voz gallega y vasca
    sin romper.

---

## 2. Nueva forma de moverse por la app

```
Bienvenida (1 botón: «¡Empezamos!»)
   └─ ¿Quién juega?  (caras grandes de cada niño + «Añadir»)
        └─ CASA DE LÚA  (la gata en el centro + 6 puertas)
             ├─ Escuchar      → Sonidos del día · Juego de los sonidos (Ling) · Sonidos tranquilos (Sensorial)
             ├─ Hablar        → Palabras que suenan parecido (Pares) · Juegos de hablar (ExercisePlayer)
             ├─ Palabras      → Cosas de cada día (Semántica)
             ├─ Escribir      → Trazos y letras (Writing)
             ├─ Cuentos       → Aventuras con Lúa: cuento · canción · juego
             └─ Construir     → Construye con Lúa (mundos STEAM) · RA
                   └─ Actividad → Premio (estrellas + Lúa celebra) → vuelta a la Casa

Candado (mantener 2 s + PIN) → ZONA FAMILIA
   ├─ Cómo va (Resultados)
   ├─ Aprender (Academy)
   ├─ Ficha del niño (FichaRegistro)
   ├─ Ajustes (idioma, voz, perfil de adaptación STEAM, Lúa)
   └─ Créditos y privacidad
```

- **Las pestañas de abajo desaparecen del modo niño.** Academy y Ajustes pasan a
  la Zona Familia.
- **Desde la Casa, cualquier actividad está a dos toques como mucho.**
- **Rutas y parámetros de navegación se mantienen** (`{ screen: 'Academy' }`,
  etc.), pero apuntan a la nueva estructura. Así no se rompen los enlaces
  internos ni el periférico Lúa.

---

## 3. Sistema visual nuevo

| Pieza | Qué es | De dónde sale |
| --- | --- | --- |
| Tipografía de títulos | Fredoka (redondeada, amable) | `@expo-google-fonts/fredoka` 0.4.1 (repo `expo/google-fonts`). Las fuentes son OFL |
| Tipografía de texto | Nunito (muy legible) | `@expo-google-fonts/nunito` 0.4.2 |
| Escala | Títulos de niño 34–40 px; botones de niño 22 px; texto de adulto 16 px | Tokens en `tailwind.config.js` |
| Color por puerta | Seis colores vivos, uno por puerta; fondo crema cálido, no blanco puro | Tokens en `tailwind.config.js` y `global.css`; contraste comprobado por gate |
| Iconos | El set propio `ValeriaBlockIcons` (regla 5), redibujado en versión **rellena y gruesa** para el niño | Propio, por regla 5. Lucide (25,5k★) se descarta por esa regla |
| Imágenes de los ejercicios | Fuera emoji del sistema: ilustraciones SVG propias | Inventario en F2. **El volumen de dibujos está por medir** |
| Mascota | Lúa pixel art con estados vivos (parpadea, salta, ronronea, celebra) | `ValeriaCatPixel.tsx` + Moti/Reanimated. Lúa no se sustituye (regla 5b) |
| Celebraciones | Confeti, estrellas, Lúa bailando | Lottie |
| Vibración | Toque corto en aciertos y botones | `expo-haptics` |
| Paneles del adulto | Hojas que suben desde abajo | `@gorhom/bottom-sheet` |

---

## 4. Repositorios: verificados hoy en GitHub y npm

Fuentes:
- **GitHub:** API `search/repositories`; estrellas, licencia y último push consultados el 2/11/2026.
- **npm:** registro de npm; dependencias `peer` consultadas el mismo día.
- **Compatibilidad:** `expo/bundledNativeModules.json` de Expo 54.

Stack fijo: Expo 54, RN 0.81.5, Reanimated 3.19.5 y `newArchEnabled: false`.

### Se adoptan

| Repo | ★ | Licencia | Último push | Versión a usar | Para qué | Compatibilidad comprobada |
| --- | --- | --- | --- | --- | --- | --- |
| `founded-labs/react-native-reusables` | 8 713 | MIT | 2026-09-27 | ya copiado | Botones, tarjetas, diálogos, formularios de la Zona Familia | Ya en `main` (build 727) |
| `software-mansion/react-native-reanimated` | 11 045 | MIT | 2026-11-02 | 3.19.5 (instalado) | Animaciones de entrada, rebote, transiciones | Ya en `main` |
| `nandorojo/moti` | 4 551 | MIT | 2025-03-11 | 0.30.0 | Animaciones declarativas: puertas que respiran, Lúa que salta, toques que rebotan | Peer `react-native-reanimated: *`. **Aviso:** sin push desde hace 20 meses |
| `lottie-react-native/lottie-react-native` | 17 215 | Apache-2.0 | 2026-10-31 | **~7.3.1** (la de Expo 54) | Celebraciones y premios animados | La última (7.5.0) exige RN ≥ 0.84: **no se usa** |
| `gorhom/react-native-bottom-sheet` | 9 110 | MIT | 2026-05-09 | 5.2.14 | Paneles de la Zona Familia, selector de perfil | Pide Reanimated ≥ 3.16 y gesture-handler ≥ 2.16.1 |
| `software-mansion/react-native-gesture-handler` | 6 796 | MIT | 2026-11-02 | **~2.28.0** (la de Expo 54) | Arrastrar en ejercicios; lo exige bottom-sheet | **Hoy no está en `package.json`**: se añade en F0 |
| `dohooo/react-native-reanimated-carousel` | 3 435 | MIT | 2026-11-01 | **4.0.3** | «¿Quién juega?», páginas de cuentos | La 5.x exige Reanimated 4: **no se usa** |
| `expo/expo` (`expo-haptics`, `expo-image`) | 53 302 | MIT | 2026-11-02 | ~15.0.8 / ~3.0.11 | Vibración; imágenes rápidas con caché | Versiones de Expo 54 |
| `expo/google-fonts` | 948 | MIT | 2026-10-30 | Fredoka 0.4.1 + Nunito 0.4.2 | Tipografía | Sin dependencias `peer` |

### Se estudian en F2 (con poca adopción, se dice)

| Repo | ★ | Licencia | Por qué solo se estudia |
| --- | --- | --- | --- |
| `jamsch/react-native-duo-drag-drop` | 73 | MIT | Arrastrar palabras «estilo Duolingo» para ordenar frases. Encaja, pero tiene poca adopción: se prueba en un ejercicio antes de extenderlo |

### Se descartan, con motivo comprobado

| Repo | ★ | Motivo |
| --- | --- | --- |
| `@shopify/react-native-skia` 2.x y `react-native-fast-confetti` | 581 (confetti) | fast-confetti 2.x exige Reanimated 4 y Skia. Con la arquitectura antigua, Skia 2.2.12 **no está verificado**. Lottie cubre el confeti sin esta capa |
| `react-native-confetti-cannon` | 528 | Sin push desde 2023-08 |
| `oblador/react-native-animatable` | 9 927 | Sin push desde 2023-10; Moti y Reanimated lo cubren |
| `rive-app/rive-react-native` | 789 | Exige dibujar a Lúa otra vez en el editor de Rive, y la gata sale de la rejilla de `ValeriaCatPixel` (regla 5b) |
| `gluestack/gluestack-ui` | 5 343 | La API de GitHub no devuelve licencia: no se copia sin licencia clara |
| `lucide-icons/lucide` | 25 472 | La regla 5 obliga al set SVG propio |
| `simsketch/kidcash-ui` | 0 | Es React para web (framer-motion); su estilo «playful» se cubre con Moti y Lottie |

**Decisión que queda abierta (no entra en este plan):** Expo 54 ya trae
Reanimated 4.1.1. Pasar a la arquitectura nueva abriría Reanimated 4, Skia 2 y
Carousel 5. Es un cambio de base con riesgo propio; lo decide Frank aparte.

**Animaciones Lottie:** las de LottieFiles tienen licencia por fichero. Cada
animación que se use se anota con su licencia en `docs/creditos-animaciones.md`.
**Hoy no hay ninguna elegida.**

---

## 5. Pantalla por pantalla

En todas: fuentes nuevas, colores nuevos, botón de casa y voz al tocar.

| # | Ruta | Lo primero que se ve | Única acción principal | Piezas |
| --- | --- | --- | --- | --- |
| 1 | Welcome | Lúa grande saludando (animada) | «¡Empezamos!» | Moti, Lottie (saludo), Fredoka |
| 2 | PatientSelect → «¿Quién juega?» | Caras grandes de cada niño | Tocar una cara | Carousel 4, Reusables Avatar |
| 3 | FichaRegistro (Zona Familia) | Un dato por paso, con barra de pasos | «Siguiente» / «Guardar» | Reusables Input, Select y Button. **Prueba de guardado obligatoria** (coste 7/9) |
| 4 | ExerciseSelection → **Casa de Lúa** | Lúa en el centro y 6 puertas de colores | Tocar una puerta | Moti (puertas que respiran), haptics. Sin pestañas |
| 5 | BlockList | Las actividades de la puerta, como tarjetas grandes con dibujo | Tocar una | Reusables Card, Moti |
| 6 | ExercisePlayer | La pregunta en grande y las respuestas como botones enormes | Responder | Sin «FF-1» ni «Paso 1». La consigna del adulto, plegada en un «i» |
| 7 | MinimalPairs | Dos dibujos grandes; Lúa dice una palabra | Tocar el dibujo correcto | Moti (rebote al acertar), haptics |
| 8 | SemanticExpansion | Una escena ilustrada | Tocar lo que pide Lúa | Ídem |
| 9 | LingTest → «Juego de los sonidos» | Un sonido y una cara de Lúa | «¡Lo oigo!» | Botón único gigante |
| 10 | Writing | Lienzo grande con la letra punteada | Trazar | `perfect-freehand` (ya instalado), gesture-handler |
| 11 | SensoryBlockList | Actividades tranquilas, colores suaves | Tocar una | Paleta calmada |
| 12 | SensoryExercise | Una fase cada vez (preparar, anticipar, escuchar, pausa, valorar) | Botón de la fase | Barra de pasos con dibujos |
| 13 | AventurasLuaHub | Tres puertas: Cuento, Canción, Juego | Tocar una | Moti |
| 14 | LuaStoryViewer | Página del cuento a pantalla completa | Pasar página deslizando | Carousel 4 |
| 15 | LuaSongPlayer | Lúa cantando y una barra de ritmo grande | Play / pausa | `LuaRhythmBar` rediseñada, Moti |
| 16 | LuaGamePlayer | El juego, sin texto alrededor | Jugar | Haptics, Lottie al ganar |
| 17 | LuaAssessmentPlayer | Una pregunta cada vez (el adulto acompaña) | Responder | Consigna del adulto plegada |
| 18 | SteamWorlds | Mapa con 7 islas en un camino | Tocar una isla | Moti; el perfil de adaptación pasa a la Zona Familia |
| 19 | SteamWorld | Los retos de la isla como piedras del camino, con estrellas | Tocar un reto | Moti |
| 20 | SteamChallenge | El reto en grande y Lúa explicándolo con voz | «¡Hecho!» | Lottie al acertar, `luaSessionReward` intacto |
| 21 | SteamLuaSolo | Lúa sola guiando | Seguir a Lúa | Moti |
| 22 | ArLauncher | Puerta de RA con dibujo grande | «Abrir cámara» | **Ver §9, decisión 1** |
| 23 | Academy (Zona Familia) | «Aprende en 5 minutos»: cápsulas como tarjetas | Abrir una | Reusables Card, Progress |
| 24 | Results → «Cómo va» | Tres frases claras y un gráfico simple por semana | Ver detalle | Reusables. Gráfico: **librería por elegir en F3** |
| 25 | Settings (Zona Familia) | Lista corta: idioma, voz, Lúa, perfil, privacidad | Tocar una fila | Bottom-sheet por ajuste |
| 26 | Credits | Logos y textos legales | Volver | Reusables |
| 27 | LuaInfo | Qué es Lúa (periférico), con dibujo | Volver | Reusables |
| + | PIN, premios e insignias, selector de perfil | Ventanas emergentes nuevas | Una acción cada una | Bottom-sheet, Lottie para la insignia |

---

## 6. Fases de ejecución

- **Rama:** todo se hace en `claude/rediseno-completo`, un push por fase (regla 4).
- **Al final de cada fase:**
  - los gates de `android.yml` y el typecheck en verde;
  - `export-voice-corpus.js` si cambió el texto locutado;
  - capturas web de antes y después de cada pantalla tocada, **mirándolas**;
  - el número del build de CI en verde.
- **Merge a `main` solo al final y sin flags** (regla 3): Frank ve el rediseño
  entero, no a trozos.

| Fase | Qué se hace | Cómo se comprueba |
| --- | --- | --- |
| **F0 · Base** | Capturar `main` actual (las 27 rutas) como «antes». Añadir gesture-handler ~2.28, Moti 0.30, Lottie ~7.3.1, bottom-sheet 5.2.14, Carousel 4.0.3, expo-haptics, expo-image y las fuentes. Tokens nuevos de color y escala | `npm ci` limpio, sin flags (E11); build de CI en verde **antes** de tocar pantallas |
| **F1 · Gates nuevos** | Gate de contraste AA sobre los tokens. Gate de jerga en textos del modo niño: amplía `check-regulatory-vocabulary.js` a códigos como «FF-1», «XP» y «prescribir». Gate de tamaño mínimo de toque en componentes del niño | Los gates fallan con el diseño viejo y pasan con el nuevo |
| **F2 · Modo niño** | Bienvenida, ¿Quién juega?, Casa de Lúa, BlockList y pantallas 6 a 12. Iconos rellenos. Ilustraciones que sustituyen a los emoji | Captura de cada una. Checklist §7 pantalla a pantalla |
| **F3 · Zona Familia** | Candado, PIN, Ajustes, Cómo va, Academy, Ficha, Créditos y LuaInfo | **Prueba real de la Ficha:** alta, edición y guardado de un niño |
| **F4 · Aventuras y Construye** | Pantallas 13 a 21; desfile de premios y `cancelSessionReward` intactos | `check-lua-mascot-mirror.js` en verde |
| **F5 · Movimiento** | Animaciones de toque, transiciones, celebraciones Lottie y vibración en todas | Captura más vídeo corto de web. «Reducir movimiento» respetado |
| **F6 · Repaso completo** | Las 27 rutas en los 4 idiomas; textos largos (gallego y catalán) sin cortes | Capturas por idioma. Lista de defectos a cero |
| **F7 · Cierre** | README, manual y capturas nuevas en `docs/screenshots/`. Merge a `main` | Build de `main` en verde. Se da su número |

---

## 7. Cómo se sabe que está bien: el test del niño de siete años

Se comprueba por pantalla, y la pantalla no se da por hecha hasta tenerlo todo:

- [ ] Se entiende qué hacer sin leer: dibujo más voz.
- [ ] Hay un solo botón principal y está abajo.
- [ ] Hay seis opciones o menos y no hace falta desplazar.
- [ ] Ningún botón pasa de tres palabras.
- [ ] No aparecen códigos, jerga, porcentajes ni XP (gate F1).
- [ ] Cada toque responde con animación, sonido y vibración.
- [ ] El botón de casa está arriba a la izquierda y lleva a la Casa de Lúa.
- [ ] El contraste es AA (gate F1).
- [ ] Desde la Casa se llega en dos toques o menos.
- [ ] El texto no se corta en ninguno de los cuatro idiomas.

**Prueba con personas (propuesta, por organizar):** 3–5 niños de 5 a 8 años con
sus familias. A cada uno se le pide sin ayuda «juega a algo de sonidos» y
«vuelve a casa», y se cuenta cuántos lo logran. Sin esta prueba, que un niño lo
entienda es una **hipótesis**, no un hecho.

---

## 8. Riesgos y cómo se cubren

| Riesgo | Cobertura |
| --- | --- |
| Romper el guardado de la Ficha (ya pasó el 7/9/2026) | Prueba real de guardado en F3, antes del merge |
| Gallego y euskera caen a la voz del sistema | `export-voice-corpus.js` en el mismo commit que cada texto locutado |
| La web enseña bien lo que en Android se rompe (§1c) | Sin `flex` heredado anulado; en cada entrega se dice «visto en web, **no en aparato**» hasta tenerlo en un Android |
| Librerías nuevas que rompen el build | F0 cierra con build de CI verde antes de tocar ninguna pantalla |
| El periférico Lúa deja de espejar a la gata | `check-lua-mascot-mirror.js` y `luaSessionReward` intactos |
| Volumen de ilustraciones propias | Inventario en F2. Si son muchas, se dice en ese momento, no al entregar |
| Moti, sin push desde marzo de 2025 | Solo usa Reanimated por debajo; si falla, se usa Reanimated directo, que ya está |

---

## 9. Decisiones que solo puede tomar Frank

1. **Pantalla de RA:** el 1/11 dijiste que el módulo RA iba en sesión aparte, y
   la rama de RA v3.0 ya trabaja en él. El plan rediseña solo su **entrada**
   (la puerta y la pantalla de lanzamiento). ¿Correcto, o la entrada también la
   lleva la otra sesión?
2. **Pestañas de abajo:** el plan las quita del modo niño y lleva Academy y
   Ajustes a la Zona Familia. ¿De acuerdo?
3. **Nombres de las 6 puertas** (Escuchar, Hablar, Palabras, Escribir, Cuentos,
   Construir): ¿los das por buenos?
