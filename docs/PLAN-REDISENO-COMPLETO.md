# Plan de rediseño completo de Valeria+ (v5, 2/11/2026)

**Objetivo:** que un niño de siete años sepa usar la app sin que nadie se la
explique, y que sea preciosa, viva y fácil.

**Alcance:** las 27 rutas de la app y todas sus ventanas emergentes.

**Base:** la mejor tecnología disponible hoy, Expo 58 con la arquitectura nueva,
y el mejor repo de cada pieza. Cuando a un repo le faltaba algo en el proyecto,
se añade (regla suprema).

> **Qué no está verificado todavía:**
> - Ningún paso de este plan se ha compilado.
> - Tres cosas solo se sabrán en el primer build de CI de F0:
>   - que el módulo de RA (`valeria-ar`) funciona con la arquitectura nueva;
>   - que NativeWind 4.2.7 funciona con Reanimated 4;
>   - que React Navigation 7 sustituye a la 6 sin romper nada.
> - Del uso real de cada librería en otros proyectos no hay cifra: la API de
>   descargas de npm está bloqueada en este entorno y el recuento por GitHub
>   quedó sin hacer.

---

## 1. Por qué hoy es un lío

Revisión de UX sobre las capturas de `docs/screenshots/` (4/9/2026) y el código
en `main`:

- **Jerga** que ni el niño ni la familia entienden: «Selección de Ejercicios»,
  «prescribir», «Pares Mínimos · dislalias», «Expansión Semántica».
- **Códigos internos** a la vista: «FF-1», «fonética-fonología».
- **Mucho texto:** «Paso 1 · consigna del tutor», instrucciones de dos líneas,
  avisos al pie.
- **La primera pantalla lo mete todo a la vez:** nivel, XP, pescadito, premios
  y seis bloques con contadores.
- **Niño y adulto mezclados:** las pestañas Academy, Ejercicios y Ajustes están
  siempre visibles.
- **Emoji del sistema** como imágenes, que cada fabricante dibuja distinto.
- **Casi nada se mueve.** Y hubo **texto sin contraste**, que Frank tuvo que
  arreglar (`4e0ff52`, `ada1003`).

## 2. Las reglas del niño de siete años

Cada pantalla las cumple todas. Se comprueban una a una en el §9.

1. **Una pantalla, una pregunta, un botón principal enorme**, siempre abajo y
   siempre del mismo color.
2. **Seis opciones como máximo**, sin desplazar la pantalla.
3. **Cada botón lleva dibujo y, como mucho, tres palabras.** Nunca solo texto:
   lo pide la guía de Google para niños, porque muchos aún no leen.
4. **Todo se oye.** Lúa dice en voz alta lo que el niño toca. El sonido arranca
   activado: los menores de 5 años no saben encenderlo (Google).
5. **Cada toque responde** con sonido, vibración y movimiento. Es lo que Apple
   premió en Pok Pok (ADA 2021).
6. **Nunca una X roja.** Acierte o no, hay voz, ánimo y otra oportunidad, como
   en LearnPlay. Nadie se queda atascado, asustado ni confundido, como pide
   Pok Pok.
7. **Volver es siempre la casa**: botón redondo arriba a la izquierda.
8. **Para el niño no hay jerga, códigos, porcentajes ni XP.** El progreso son
   estrellas y una Lúa contenta.
9. **El adulto vive aparte**, detrás de un candado: mantener pulsado 2 s y
   escribir el PIN.
10. **Botones del niño de 64 dp como mínimo**, y de 48 dp los del adulto. El
    proyecto MTAGIC midió que los niños aciertan peor que los adultos al tocar.
    64 dp es una decisión de diseño, no una cifra de un estudio.
11. **Contraste WCAG AA**, comprobado por un gate.
12. **Cuatro idiomas** (es, gl, ca, en), y la voz gallega y vasca intactas.
13. **Cada sesión tiene inicio y final claros**: Lúa se despide (Zingo).

## 3. Cómo se mueve el niño

**La Casa de Lúa es una escena dibujada, no una rejilla de tarjetas.** Es lo que
hizo Toca Boca en su app de construcción: personajes y objetos en lugar de
menús. Cada objeto de la casa es una puerta. Lúa camina hasta el que toca el
niño, y el objeto que toca jugar hoy brilla.

| Objeto de la casa | Puerta | Lo que hay dentro |
| --- | --- | --- |
| Radio | **Escuchar** | Sonidos del día, Juego de los sonidos (Ling), Sonidos tranquilos (Sensorial) |
| Espejo | **Hablar** | Palabras que suenan parecido (Pares), Juegos de hablar (ExercisePlayer) |
| Cofre | **Palabras** | Cosas de cada día (Semántica) |
| Pizarra | **Escribir** | Trazos y letras (Writing) |
| Librería | **Cuentos** | Aventuras con Lúa: cuento, canción y juego |
| Mesa de bloques | **Construir** | Construye con Lúa (mundos STEAM) y RA |

```
Bienvenida (Lúa saluda · «¡Empezamos!»)
 └ ¿Quién juega? (caras grandes)
    └ CASA DE LÚA (escena con 6 objetos)
       └ Actividad → Premio → Lúa se despide → Casa
Candado (2 s + PIN) → ZONA FAMILIA: Cómo va · Aprender (Academy) · Ficha · Ajustes · Créditos
```

- **Las pestañas de abajo desaparecen del modo niño.**
- **Cualquier actividad queda a dos toques de la Casa.**
- **Se mantienen las rutas y los parámetros de navegación**, para no romper los
  enlaces internos ni el periférico Lúa.

## 4. La base técnica: Expo 54 → Expo 58

Los mejores repos de hoy piden Reanimated 4 y la arquitectura nueva. **Expo 54
es la última versión que permite la arquitectura antigua**: lo dice el blog
oficial de React Native 0.82. Por eso el primer paso es subir de base.

| Pieza | Hoy | Con Expo 58 (`bundledNativeModules.json` de expo 58.0.22) |
| --- | --- | --- |
| Expo | 54.0.35 | **58.0.22** (publicado el 29/9/2026) |
| React Native | 0.81.5, arquitectura antigua | **0.88.1, arquitectura nueva obligatoria** |
| React | 19.1.0 | **19.3.0** |
| Reanimated | 3.19.5 | **4.7.1** + `react-native-worklets` **0.13.0** |
| Gesture Handler | no instalado | **~3.3.0** |
| Skia | no instalado | **2.14.0** |
| react-native-svg | 15.12.1 | **15.16.0** |
| react-native-screens | 4.16 | **~4.30.1** |
| React Navigation | 6 | **7.5.x** (native 7.5.1, native-stack y bottom-tabs 7.21.0) |
| Lottie | no instalado | **~7.5.0** |
| expo-audio, haptics, image, speech, notifications | SDK 54 | **SDK 58** |
| expo-speech-recognition | 3.1.3 | **58.0.1** |

**Lo que hay que adaptar en el propio proyecto:**
- **`valeria-ar`:** el módulo nativo de RA está escrito para la arquitectura
  antigua (`ReactPackage`, `ReactContextBaseJavaModule`). La arquitectura nueva
  trae una capa de compatibilidad para estos módulos. Si en el aparato falla, se
  convierte el módulo a Turbo Module. **Esto toca el trabajo de la sesión de
  RA** (§11, decisión 6).
- **`app.json`:** se quita `newArchEnabled: false`.
- **`android-native/README.md`:** dice que la arquitectura antigua sigue; se
  actualiza.
- **React Navigation 6 → 7:** tiene cambios de API. Se migra con su guía
  oficial.
- **Los tres config plugins** (`withValeriaAR`, `withValeriaNoBackgroundAudio`,
  `withValeriaPermissionStrings`) se prueban con el prebuild de Expo 58.

## 5. El kit: lo mejor de cada pieza

Compatibilidad comprobada con las versiones de Expo 58: leí las
`peerDependencies` de npm de cada paquete y las comparé con esas versiones.
**Revisado** dice qué miré yo mismo de cada repo.

| Para qué | Repo elegido | ★ · licencia · último cambio | Por qué es el mejor | Revisado |
| --- | --- | --- | --- | --- |
| Componentes del adulto | `founded-labs/react-native-reusables` + NativeWind 4.2.7 | 8 713 · MIT · 2026-09 | shadcn para RN; el código se copia y se re-estiliza. Ya está en `main` | Código, ya en el proyecto |
| Animación base | `software-mansion/react-native-reanimated` 4.7.1 | 11 045 · MIT · 2026-11 | El estándar. La versión 4 trae animaciones y transiciones al estilo CSS | Datos y versión de Expo 58 |
| Toque que rebota | `enzomanuelmangano/pressto` 0.8.1 | 848 · MIT · 2026-11 | Pulsables animados en el hilo de interfaz; componentes hechos y propios | README |
| Botón principal del niño | `rcaferati/react-native-awesome-button` 2.0.4 | 1 279 · MIT · 2026-08 | Botón 3D que se hunde, con progreso, temas y accesibilidad; usa el `Pressable` nativo; demo en Expo y diseño en Figma | README |
| Confeti | `AlirezaHadjar/react-native-fast-confetti` 2.0.2 | 581 · MIT · 2026-10 | El más rápido: usa el Atlas de Skia. Trae cañón, lluvia continua y explosión | README |
| Premios y personajes animados | `lottie-react-native` ~7.5.0 | 17 215 · Apache-2.0 · 2026-10 | El estándar para animaciones de diseñador | Datos |
| Brillo de lo que toca hacer | `realimposter/react-native-animated-glow` 3.2.0 | 433 · MIT · 2026-09 | Brillo animado con Skia que cambia al pulsar; trae estilos hechos | README |
| Arrastrar y soltar (unir dibujos, colocar piezas) | `entropyconquers/react-native-reanimated-dnd` 2.0.0 | 1 076 · MIT · 2026-07 | Hecho para Reanimated 4 y la arquitectura nueva; probado en Expo 55; 70 kB | README |
| Ordenar (frases, secuencias) | `MatiPl01/react-native-sortables` 1.10.1 | 981 · MIT · 2026-09 | Rejillas y listas ordenables, con vibración, para Expo | README |
| Juego de memoria | `moschan/react-native-flip-card` 3.5.7 | 389 · MIT · 2026-03 | Tarjeta que gira, sin dependencias | README |
| Pasar páginas de cuentos y «¿Quién juega?» | `dohooo/react-native-reanimated-carousel` 5.2.1 | 3 435 · MIT · 2026-11 | El sucesor de snap-carousel, hecho con Reanimated | Datos |
| Paneles del adulto | `gorhom/react-native-bottom-sheet` 5.2.14 | 9 110 · MIT · 2026-05 | El estándar de hojas inferiores | Datos |
| Avisos del adulto («Guardado») | `gunnartorfis/sonner-native` 0.27.0 | 1 361 · MIT · 2026-10 | Versión para RN de Sonner: arriba o abajo, con acción, se aparta deslizando | README |
| Transiciones entre pantallas | `eds2002/react-native-screen-transitions` 4.0.0 | 1 663 · MIT · 2026-09 | Transiciones animadas; pide React Navigation ≥ 7.3 y `react-native-teleport` (se añaden) | Datos |
| Gráfico «Cómo va» | `Abhinandan-Kushwaha/react-native-gifted-charts` 1.4.81 + `expo-linear-gradient` | 1 374 · MIT · 2026-10 | Barras y líneas animadas, efecto 3D y degradados; probado con capturas | README |
| Anillo de progreso | `bartgryszko/react-native-circular-progress` 1.4.1 | 2 246 · MIT · 2025-08 | Anillo animado con SVG | README |
| Sombras iguales en Android | `ftzi/react-native-shadow-2` 7.1.2 | 730 · MIT · 2026-10 | Arregla que la sombra salga distinta en Android, iOS y web | README |
| Vibración | `expo-haptics` SDK 58 | Expo, 53 302 · MIT | Oficial | Datos |
| Sonidos de toque y acierto | Kenney UI Audio e Interface Sounds (CC0) con `expo-audio` | — | 150 sonidos de interfaz. **La licencia de cada descarga está por mirar en kenney.nl** | Fuentes secundarias |
| Imágenes de los ejercicios | `microsoft/fluentui-emoji` | 10 189 · MIT · 2026-08 | Más de 1 500 dibujos, iguales en todos los teléfonos | Datos (decisión 4) |
| Tipografía | Fredoka (títulos) + Nunito (texto), `expo/google-fonts` | 948 · MIT | Redondas y legibles. LearnPlay usa las mismas | `package.json` de LearnPlay |
| Trazar letras | `perfect-freehand` (ya instalado), dibujado con Skia | — | El trazo sale con presión natural; Skia lo pinta fluido. Así se hizo KiDraw | Datos |

**Descartados por un motivo que no es «falta en el proyecto»:**

| Repo | Motivo comprobado |
| --- | --- |
| `victory-native` 43 | Pide Skia ≥ 2.15.1. La última publicada en npm es la 2.14.0: **esa versión no existe todavía** |
| `react-native-animateable-text` | Pide React Native ≥ 0.85.3. Con Expo 58 encaja, pero no hace falta: Reanimated 4 anima texto |
| `moti` 0.30 | Sin cambios desde marzo de 2025; Reanimated 4 y pressto lo cubren |
| `@legendapp/motion` | Usa el `Animated` antiguo; Reanimated 4 es mejor en la arquitectura nueva |
| `react-native-draggable-flatlist` | Superado por `reanimated-dnd` y `sortables`, hechos para Reanimated 4 |
| `enzomanuelmangano/demos` | Sin licencia: no se copia código |
| `gluestack-ui` | Sin licencia declarada en la API de GitHub |
| `lucide` | La regla 5 obliga al set SVG propio |

**Dos apps infantiles reales con Expo confirman el kit** (leí su `package.json`):
- **LearnPlay:** Fredoka, Nunito, Baloo 2, `expo-haptics`, `expo-speech`,
  `expo-audio`, confeti y SVG.
- **early-reader-app:** Lottie, Reanimated, Gesture Handler y degradados.

## 6. Lo que se ve en cada pantalla

| # | Ruta | Lo primero que se ve | Acción principal | Piezas |
| --- | --- | --- | --- | --- |
| 1 | Welcome | Lúa grande saludando | «¡Empezamos!» | Botón 3D, Lottie, Fredoka |
| 2 | PatientSelect → ¿Quién juega? | Caras grandes de cada niño | Tocar una cara | Carousel, pressto |
| 3 | FichaRegistro (Zona Familia) | Un dato por paso | «Siguiente» / «Guardar» | Reusables, sonner. **Prueba real de guardado** |
| 4 | ExerciseSelection → Casa de Lúa | La escena con 6 objetos, Lúa en medio y uno brillando | Tocar un objeto | Glow, pressto, haptics, sonidos |
| 5 | BlockList | Las actividades de la puerta, grandes y dibujadas | Tocar una | pressto, sombras |
| 6 | ExercisePlayer | La pregunta en grande y respuestas enormes | Responder | Fluent Emoji, dnd, confeti. Consigna del adulto plegada en «i» |
| 7 | MinimalPairs | Dos dibujos; el sonido que cambia, marcado con color y movimiento | Tocar el correcto | Reanimated, haptics (Pop2TalkNordic) |
| 8 | SemanticExpansion | Escena ilustrada | Tocar lo que pide Lúa | Fluent Emoji, dnd |
| 9 | LingTest → Juego de los sonidos | Un sonido y la cara de Lúa | «¡Lo oigo!» | Botón 3D gigante |
| 10 | Writing | Lienzo con la letra punteada | Trazar | perfect-freehand + Skia |
| 11 | SensoryBlockList | Actividades tranquilas | Tocar una | Paleta calmada |
| 12 | SensoryExercise | Una fase cada vez | Botón de la fase | Anillo de progreso |
| 13 | AventurasLuaHub | Cuento, Canción y Juego | Tocar uno | pressto |
| 14 | LuaStoryViewer | Página a pantalla completa | Deslizar | Carousel |
| 15 | LuaSongPlayer | Lúa canta y una barra de ritmo grande | Play | Reanimated |
| 16 | LuaGamePlayer | El juego, sin texto alrededor | Jugar | dnd, sortables, flip-card, confeti |
| 17 | LuaAssessmentPlayer | Una pregunta cada vez | Responder | Consigna plegada |
| 18 | SteamWorlds | Mapa con 7 islas en un camino | Tocar una isla | Glow, transiciones |
| 19 | SteamWorld | Retos como piedras con estrellas | Tocar un reto | pressto |
| 20 | SteamChallenge | El reto y Lúa explicándolo con voz | «¡Hecho!» | Confeti; `luaSessionReward` intacto |
| 21 | SteamLuaSolo | Lúa guía | Seguir a Lúa | Reanimated |
| 22 | ArLauncher | Puerta de RA | «Abrir cámara» | Decisión 1 |
| 23 | Academy (Familia) | Cápsulas de 5 minutos | Abrir una | Reusables, anillo |
| 24 | Results → Cómo va | Tres frases claras y un gráfico | Ver detalle | gifted-charts |
| 25 | Settings (Familia) | Idioma, voz, Lúa, perfil, privacidad | Tocar una fila | Bottom-sheet |
| 26 | Credits | Créditos y licencias, incluidas las de Kenney, Fluent y Lottie | Volver | Reusables |
| 27 | LuaInfo | Qué es Lúa, con dibujo | Volver | Reusables |
| + | PIN, premios, insignias, perfil | Ventanas nuevas | Una acción cada una | Bottom-sheet, Lottie, confeti |

## 7. Lúa

- El sprite pixel de `ValeriaCatPixel` sigue siendo la fuente de la app, del
  icono y del periférico (regla 5b).
- Se le añaden estados que reaccionan a todo: escucha, piensa, acierta, anima,
  se despide. Se hacen con fotogramas de la misma rejilla y Reanimated 4.
- La alternativa es Rive, que es lo que usa Duolingo para sus personajes. Rive
  obliga a rehacer a Lúa en su editor. Es la decisión 5.

## 8. Fases

**Todo va en la rama `claude/rediseno-completo`, con un push por fase.** Cada
fase cierra con:
- los gates de `android.yml` y el typecheck;
- `export-voice-corpus.js` si cambió el texto locutado;
- capturas de antes y después mirándolas;
- el número del build de CI en verde.

Merge a `main` solo al final y sin flags.

| Fase | Qué se hace | Cómo se comprueba |
| --- | --- | --- |
| **F0 · Base** | Captura «antes» de las 27 rutas. Expo 54 → 58 con `npx expo install --fix`; arquitectura nueva; Reanimated 4 y worklets; Gesture Handler 3; Skia; React Navigation 7; `valeria-ar` en la arquitectura nueva; los tres plugins | `npm ci` limpio. **Build de CI en verde antes de tocar una pantalla.** RA probada en un aparato |
| **F1 · Kit y gates** | Instalar el kit del §5; fuentes, Fluent Emoji y sonidos. Tokens nuevos. Gates de contraste AA, de jerga en el modo niño y de tamaño mínimo de toque | Los gates fallan con el diseño viejo y pasan con el nuevo |
| **F2 · Modo niño** | Bienvenida, ¿Quién juega?, Casa de Lúa y pantallas 5 a 12 | Captura de cada una y checklist del §9 |
| **F3 · Zona Familia** | Candado, PIN, Ajustes, Cómo va, Academy, Ficha, Créditos y LuaInfo | Prueba real de la Ficha: alta, edición y guardado |
| **F4 · Aventuras y Construye** | Pantallas 13 a 22, con desfile de premios y `cancelSessionReward` intactos | `check-lua-mascot-mirror.js` |
| **F5 · Movimiento y sonido** | Transiciones, rebotes, brillos, confeti, Lottie, vibración y sonidos en todas | Vídeo corto de web; «reducir movimiento» respetado |
| **F6 · Repaso** | Las 27 rutas en los 4 idiomas | Lista de defectos a cero |
| **F7 · Cierre** | README, manual, capturas nuevas y merge a `main` | Build de `main` en verde y su número |

## 9. Cómo se sabe que está bien

Por pantalla. No se da por hecha hasta tener todo:
- [ ] Se entiende sin leer: dibujo y voz.
- [ ] Un solo botón principal, abajo.
- [ ] Seis opciones o menos, sin desplazar.
- [ ] Ningún botón de más de tres palabras.
- [ ] Sin jerga, códigos, porcentajes ni XP (gate).
- [ ] Cada toque suena, vibra y se mueve.
- [ ] La casa arriba a la izquierda.
- [ ] Contraste AA (gate).
- [ ] Dos toques o menos desde la Casa.
- [ ] Sin texto cortado en ningún idioma.
- [ ] Las tres preguntas de Sago Mini: ¿invita a explorar?, ¿es intuitiva,
  bonita y divertida?, ¿es segura?

**Prueba con personas (propuesta):** 3–5 niños de 5 a 8 años con sus familias.
Se les pide sin ayuda «juega a algo de sonidos» y «vuelve a casa». Hasta que se
haga, que un niño de siete años la entienda **es una hipótesis**.

## 10. Riesgos

| Riesgo | Cobertura |
| --- | --- |
| La arquitectura nueva rompe RA, BLE o algún plugin | F0 cierra con build verde y RA probada en aparato antes de diseñar nada |
| Romper el guardado de la Ficha (ya pasó el 7/9/2026) | Prueba real de guardado en F3 |
| Voces gallega y vasca | Corpus de voz en el mismo commit que cada texto |
| La web enseña bien lo que Android rompe | Regla de `flex` del §1c. Se dice «no visto en aparato» hasta verlo |
| **Las otras ramas de Frank** se separan de una base Expo 54 → 58 | Decisión 6 |

## 11. Decisiones que solo puede tomar Frank

1. **Entrada a RA:** ¿la rediseño yo, o la lleva la sesión de RA?
2. **Pestañas de abajo:** ¿se quitan del modo niño?
3. **Las 6 puertas y sus objetos:** radio, espejo, cofre, pizarra, librería y
   mesa de bloques. ¿Valen?
4. **Fluent Emoji (MIT)** para las imágenes de los ejercicios: ¿sí?
5. **Lúa:** ¿pixel animada con Reanimated, o rehecha en Rive como hace Duolingo?
6. **Subir de Expo 54 a 58:** cambia la base sobre la que trabajan tus otras
   ramas, la de RA incluida. ¿Se hace primero en `main` y las demás ramas se
   ponen al día, o esperas a que terminen?

## 12. Cómo se buscó, por todas las vías

| Vía | Resultado |
| --- | --- |
| Directorio oficial de React Native (`react-native-community/directory`) | 2 809 librerías → 375 filtradas por animación, botón, sonido, dibujo, arrastre, gráfico, etc. → medidas una a una |
| API de GitHub | Estrellas, licencia y actividad de las 375 y de otras ~40 |
| Registro de npm | `peerDependencies` de ~60 paquetes, contrastadas con Expo 54 y con Expo 58 |
| Paquete oficial de Expo 58 | Versiones exactas que lo acompañan |
| `awesome-react-native` | Lista curada: confirma las elegidas |
| README leídos por mí | awesome-button, 3d-animated-buttons, sortables, flip-card, circular-progress, shadow-2, legend-motion, fast-confetti, pressto, reanimated-dnd, sonner-native, animated-glow, gifted-charts |
| `package.json` de apps infantiles reales | LearnPlay y early-reader-app |
| Buscador web, unas 35 consultas | Duolingo, Toca Boca, Pok Pok, Sago Mini, Google, Khan Academy Kids, GCompris, Dribbble, Behance, X, Medium, artículos científicos |
| Reddit, Hacker News, dev.to, Stack Overflow | **Bloqueados por la red del entorno.** Se abren en *Network access*: `reddit.com`, `www.reddit.com`, `old.reddit.com`, `hn.algolia.com`, `dev.to`, `stackexchange.com` |
| Descargas semanales de npm (`api.npmjs.org`) | **Bloqueada por la red del entorno** |
| Uso en proyectos públicos (búsqueda de código de GitHub) | **Sin hacer**: se interrumpió |

**Fuentes:**
- [React Native 0.82: arquitectura nueva obligatoria](https://reactnative.dev/blog/2025/10/08/react-native-0.82)
- [Google: Designing engaging apps](https://developers.google.com/building-for-kids/designing-engaging-apps)
- [Apple: premios ADA 2021 (Pok Pok)](https://www.apple.com/newsroom/2021/06/apple-announces-winners-of-the-2021-apple-design-awards/)
- [Sketch: Pok Pok](https://www.sketch.com/blog/pok-pok/)
- [Joan Ganz Cooney Center: Toca Builders](https://joanganzcooneycenter.org/2013/11/07/being-a-toca-builder-creating-construction-play-on-touchscreen-devices/)
- [Sago Mini](https://sagomini.com/about)
- [Apple Developer: Sago Mini](https://developer.apple.com/news/?id=3t6o5jec)
- [Duolingo: visemes](https://blog.duolingo.com/world-character-visemes)
- [Callstack: Lottie vs. Rive](https://www.callstack.com/blog/lottie-vs-rive-optimizing-mobile-app-animation)
- [MTAGIC](https://init.cise.ufl.edu/?p=2686)
- [Smart Speech](https://dx.doi.org/10.3390/app16020826)
- [Zingo](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9399848/)
- [Pop2TalkNordic](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12670065/)
- [LearnPlay](https://github.com/Suhasi2005/learnplay)
- [early-reader-app](https://github.com/melvinmt/early-reader-app)
- [Kenney Interface Sounds](https://opengameart.org/content/interface-sounds)
- [Lottie Simple License](https://help.lottiefiles.com/hc/en-us/articles/900002438343-Can-I-use-a-free-animation-on-Lottiefiles-for-commercial-business-use)
