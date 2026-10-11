# Plan · «Juega en casa con Lúa» (estimulación del lenguaje guiada por la familia)

Revisión del 11/10/2026 sobre el plan del 3/10. Sigue siendo un **plan**: no hay
código, y este documento no cambia nada de la app.

## Qué se quiere

Que Lúa proponga juegos con objetos de casa y que la tableta le dé al adulto,
en el momento de jugar, la pauta concreta para estimular el lenguaje: esperar,
comentar en vez de preguntar, expandir y provocar la petición. La interacción
ocurre cara a cara; la tableta solo propone y recuerda la pauta.

Se mantiene la decisión del 3/10: va dentro de Aventuras con Lúa, no como
cápsula de Academy. Academy ya tiene `ASHA_MILESTONES_01` (hitos por edad); este
módulo responde a otra pregunta («qué hago en casa») y debe reutilizar su aviso
`ASHA_DISCLAIMER_ES/EN`, no escribir uno nuevo.

**Base clínica (evidencia, no promesa de resultados):** intervención del
lenguaje implementada por los padres (Roberts y Kaiser, 2011, metaanálisis) y
lectura dialógica (Whitehurst et al., 1988). Las citas completas se fijan en el
paso 0.

## Paso 0 · Bloqueantes previos al código

Nada de los pasos siguientes se programa hasta cerrar esto.

| # | Qué | Estado |
| --- | --- | --- |
| 0.1 | **Fuente ASHA correcta.** La guía cita *What is speech? What is language?*, que es una página de definiciones. Hay que localizar la página de ASHA de la que salen las actividades y citarla con fecha de consulta. | Por verificar |
| 0.2 | **«Espera de 5 segundos».** Confirmar si la cifra está en ASHA. Si no está, citar su fuente real o escribir «espere unos segundos». | Por verificar |
| 0.3 | **Derechos de uso.** Revisar las condiciones de uso de ASHA para adaptar su contenido en una app distribuida. Si no se permite, la guía se reescribe con texto propio y ASHA queda como referencia, no como texto adaptado. | Por verificar |
| 0.4 | **Lenguaje regulatorio.** Se elimina «Cumplimiento MDR Clase I» del plan y de la guía. Redactar como orientación a familias, no como «técnicas clínicas» que aplica la familia, para no ampliar la finalidad prevista. | **Decidido** (Frank, 11/10/2026) |
| 0.5 | **Variedad del castellano.** Texto **diferenciado** para España (`es`) y República Dominicana (`es-DO`): «plátano / guineo», «zumo / jugo», «coche / carro», «grifo / llave», etc. Ver el paso 2. Término profesional: «logopeda» en `es`; en `es-DO`, el que fije Frank. Hoy, en este módulo, `es-DO` comparte texto con `es` (`luaCatalogsFor.ts`), así que esto es trabajo nuevo. | **Decidido** (Frank, 11/10/2026) |
| 0.6 | **Una misión NO registra sesión ni premio.** Lo que pasa fuera de la pantalla no se puede verificar, y `luaCompleteActivity` (`registerSession`) metería en las métricas actividad que nadie ha medido. La pantalla de misiones no llama a `luaCompleteActivity`. Ver el paso 3. | **Decidido** (Frank, 11/10/2026) |

## Paso 1 · Primera entrega (alcance mínimo)

Seis misiones y dos módulos tocados a la vez es demasiado para un producto con
testers. La primera entrega es:

1. **Una misión**: «La merienda parlanchina» (rutina diaria, materiales que hay
   en cualquier casa, tentación comunicativa fácil de explicar).
2. **La pausa dialógica en Cuentos con Lúa.**

La pausa de expectativa en canciones y las otras cinco misiones van en entregas
posteriores, una por vez.

### 1a · Misión en casa

- Catálogo `src/AventurasLua/Catalog/LuaHomePlayCatalog.ts`, con `ageBands:
  AgeBand[]` como el resto, para que el filtro por edad del hub no mienta.
- Dos tipos de texto, separados en el tipo de datos:
  - **lo que Lúa le dice al niño** → se locuta → entra en
    `enumerateLuaAdventureSpeech` (`luaVoiceLines.ts`);
  - **la pauta para el adulto** → no se locuta, igual que `modelingFeedback`
    en la evaluación. No entra en el corpus.
- Pictogramas: los de `ValeriaPixelArt.ts` (`PictoKey`), como el resto del
  módulo. Si falta alguno, se dibuja ahí. **Sin emoji** (regla 5): el plan
  anterior usaba 🏎️ 🧩 🍎 🛁 🎶 📖 como iconos de las misiones.
- `LUA_ACTIVITY_COUNT` (`src/AventurasLua/index.ts`) suma el catálogo nuevo.
- Pantalla `LuaHomePlayPlayerScreen.tsx` y tarjeta en
  `ValeriaAventurasLuaHubScreen.tsx`. Objetivos táctiles ≥ 56 dp.

### 1b · Pausa dialógica en cuentos

- Una pausa por cuento, antes del desenlace, con la pregunta abierta
  «¿Qué crees que pasará ahora?».
- **Sin opciones con respuesta correcta.** Unas opciones puntuables convierten
  el juego en un examen, que es justo lo que la guía pide evitar. Solo hay un
  botón «Seguir», que pulsa el adulto cuando han terminado de hablarlo.
- La pregunta se locuta → entra en `luaVoiceLines.ts`.
- Un campo nuevo en `LuaStory` para marcar en qué párrafo va la pausa, en el
  catálogo, no en la pantalla, para que ajustarlo sea una línea.

### 1c · Pausa de expectativa en canciones (entrega posterior)

Se deja documentada para que no se diseñe mal después:

- **La app no puede saber si el niño ha dicho la palabra.** No hay
  reconocimiento de voz en este módulo, así que la música continúa cuando lo
  decide el adulto, no por detección.
- Los versos se locutan uno a uno (`lyrics: string[]`, según `luaVoiceLines.ts`) y el
  id del corpus es el hash del texto. Cortar antes de la última palabra crea
  fragmentos de texto nuevos, con assets de voz nuevos en cada idioma. Además
  hay que comprobar que no rompe el pulso de `LuaRhythmBar`.

## Paso 2 · Idiomas

- **Interfaz** (títulos, botones, pautas para el adulto): `strings.es`, `en`,
  `gl` y `ca`. `check-ui-strings.js` y `check-ui-lang-fallback.js` lo exigen.
- **Banco de Lúa:** en este módulo tienen banco propio `es`, `es-DO` y `gl`
  (`LUA_BANK_LANGS`). Cada catálogo nuevo lleva su capa gallega en
  `Catalog/gl/`, fusionada por campo en `luaCatalogsFor.ts`, y
  `check-lua-gl-coverage.js` debe cubrirla.
- **Rama dominicana (decisión 0.5):** el catálogo nuevo y la pausa de los
  cuentos llevan capa `es-DO` propia, fusionada por campo igual que la gallega
  (solo texto; `ageBands`, `pic` e ids vienen del catálogo base). Hoy no existe
  esa capa en el módulo ni un gate que la cubra: hay que crear las dos cosas,
  para que una pieza sin traducir no salga en castellano peninsular en una
  sesión dominicana sin que nadie lo note.
- `es-DO` se locuta con la voz latina del sistema y no tiene assets
  pregenerados, así que su texto no necesita regenerar el corpus. Antes de
  darlo por hecho hay que comprobar que la voz que suena es la latina.
- Todo texto locutado nuevo lleva **`node scripts/export-voice-corpus.js` en el
  mismo commit**. Sin él, el gallego cae a la voz del sistema en silencio
  (build 499).
- Cualquier selector de variedad nuevo pasa `check-variety-branches.js`.

## Paso 3 · Sin premio ni aparato Lúa en las misiones (decisión 0.6)

- `LuaHomePlayPlayerScreen.tsx` **no** llama a `luaCompleteActivity` ni manda
  nada al cristal. Sin desfile no hace falta `useLuaActivityCleanup()`.
- La pausa dialógica (1b) va dentro de `LuaStoryViewerScreen.tsx`, que ya
  cierra sesión y ya lleva su limpieza: no se toca esa lógica.
- Si en el futuro una misión premiara, haría falta `luaCompleteActivity` con
  `useLuaActivityCleanup()` en la misma pantalla. Eso exige antes revisar esta
  decisión.

## Paso 3b · Observaciones de ACOPROS (correo recibido el 11/10/2026)

El correo revisa Integración Sensorial, Pares Mínimos y Expansión Semántica.
Ninguno de esos bloques es «Juega en casa con Lúa». Por eso se reparte en dos:
lo que este módulo debe cumplir desde el primer día (A) y lo que pertenece a
otros módulos y se registra aquí para no perderlo (B).

### A · Requisitos para las misiones y la pausa de los cuentos

| # | Observación de origen | Requisito en este plan |
| --- | --- | --- |
| A1 | ES: el audio y la grabación no deben empezar solos | Nada se locuta ni avanza sin que lo pulse el usuario: botón de reproducir en cada paso de la misión y en la pausa del cuento. |
| A2 | PM: frases largas cuando se pide una palabra | La respuesta que se modela al niño tiene la longitud que pide la consigna. Si la pauta dice «una palabra», el modelo es una palabra. Lo comprueba la revisión clínica del texto; no hay gate que lo mida. |
| A3 | PM y ES: pictogramas en vez de emoji | Ya estaba (paso 1a): solo `PictoKey` de `ValeriaPixelArt.ts`. |
| A4 | ES: no se entiende el objetivo del apartado | Cada misión declara su objetivo en una frase, visible para el adulto **antes** de empezar. Campo obligatorio en el catálogo. |
| A5 | Sensorial: poder escucharlo todo sin volver a entrar ni reconfigurar | Dentro de la misión se pasa de un paso al siguiente, y de una misión a otra, sin volver al hub ni repetir la elección de edad. |
| A6 | ES: trabajar las rutinas como secuencias ordenables (mañana, comida, higiene) | **Decide Frank.** Encaja con «La merienda parlanchina»: ordenar la rutina de la merienda con pictogramas, reutilizando el tipo `sequence` que ya tiene `LuaGamesCatalog.ts`. Amplía la primera entrega, por eso no entra sin su sí. |

### B · Fuera del alcance de este plan (otros módulos)

**Hallazgo previo:** las seis observaciones de PM y ES ya están
registradas en `docs/plan-mejoras-acopros-logopedas.json`, y cinco figuran como
hechas desde agosto. Antes de rehacer nada hay que saber **con qué build han
probado**. Si es anterior a esos cambios, el defecto ya está resuelto. Si es
posterior, el arreglo se ha perdido o no funciona en el aparato. Es el mismo
riesgo que señaló la segunda ronda («reimplementar lo ya implementado»).

| Bloque | Observación | Ítem existente | Estado registrado | Qué hace falta |
| --- | --- | --- | --- | --- |
| Pares Mínimos | Frases largas cuando se pide una palabra | PM-02 | Hecho (fase 3) | Saber en qué ejercicios lo ven: build y ejemplo concreto |
| Pares Mínimos | No se entiende el icono del sello | PM-06 | Hecho (2.ª ronda) | La explicación añadida no les basta: rediseñar el mensaje, no parchearlo |
| Pares Mínimos | Emoji → pictogramas | PM-07 | **Abierto** («45 de 70 palabras caen a emoji») | Dibujar los ~30 pictogramas que faltan, por tandas y con revisión humana |
| Expansión Semántica | Audio y grabación automáticos no se oyen; botón de reproducir | ES-03 | Hecho (fase 1) | Hay un síntoma nuevo («activado y no se oye») que **no** está en ES-03: reproducir en un aparato antes de darlo por duplicado |
| Expansión Semántica | Objetivo poco claro; rutinas como secuencias | ES-07 | Hecho (fase 3) | El objetivo que se fijó no se percibe en la pantalla. La propuesta de secuencias es contenido nuevo |
| Expansión Semántica | Pictogramas | ES-09 | Hecho (fase 3) | Saber en qué pantalla siguen viendo emoji o imágenes ambiguas |
| Integración Sensorial | Escuchar todos los sonidos del apartado sin volver a entrar y reconfigurar | — | Nuevo | Reproducción en serie dentro del bloque (`ValeriaSensory/`) |
| Integración Sensorial | Los sonidos se parecen entre sí y no suenan a lo que dicen (la aspiradora suena a moto) | — | Nuevo | Ver la nota de abajo |
| Integración Sensorial | Todos los apartados se desarrollan igual | — | Nuevo | Aclarar con ACOPROS si es un fallo o si falta explicar la progresión |

**Nota sobre los sonidos (hecho e inferencia):**

- **Hecho:** los once sonidos son **sintéticos**, no grabaciones
  (`scripts/generate-sensory-assets.js`). Se decidió así por la procedencia ante
  MDR, por la licencia y por la reproducibilidad. Además, todos se normalizan a
  la misma sonoridad (−20 dBFS RMS).
  `check-sensory-assets.js` comprueba el reparto espectral, pero el propio
  script dice que no puede comprobar si a un oído le suena a aspiradora.
- **Inferencia:** lo que describe ACOPROS es el límite conocido de esa
  síntesis, no un fichero mal subido.
- **Decisión pendiente:** sustituir los sonidos por grabaciones reales con
  licencia y procedencia documentadas (resuelve el reconocimiento y reabre la
  licencia y el expediente), o rehacer la síntesis (mantiene la procedencia,
  pero no hay garantía de que llegue a sonar realista).

Este plan **no** implementa nada de la tabla B. Su sitio es una tercera ronda en
`docs/plan-mejoras-acopros-logopedas.json`, pendiente de que Frank la autorice.

## Paso 4 · Verificación

**Comprobaciones automáticas:** todas las de `android.yml` (34 a fecha de hoy),
sacadas del propio workflow y no de una lista:

```bash
grep -oP '(?<=run: )node scripts/\S+(?: --\S+)?' .github/workflows/android.yml |
  while read -r cmd; do $cmd >/dev/null 2>&1 || echo "FALLA: $cmd"; done
npm run typecheck
```

Las que más afectan a este cambio: `check-voice-corpus-coverage`,
`check-lua-gl-coverage`, `check-lua-voice-language`, `verify-aventuras-lua`,
`check-ui-strings`, `check-ui-lang-fallback`,
`test-challenger-final-ca-integration` y `check-variety-branches`.

**Comprobación visual:**

- Captura de web de la tarjeta del hub, la misión y la pausa del cuento, con
  `docs/capture-screenshots.js`.
- **Revisión en un Android antes de mergear a `main`**: pantalla nueva y tarjeta
  nueva son cambios de disposición, y una captura de web no los prueba
  (regla 1c).
- Prueba de voz en `es` y `gl`: la consigna de la misión y la pregunta del
  cuento suenan con la voz del banco, no con la del sistema.

## Paso 5 · Documentación

- La guía `docs/guia-asha-juegos-con-lua-en-casa.md` se corrige con lo que
  salga de 0.1, 0.2, 0.3 y 0.5. Esta revisión del plan **no la toca**.
- README y manual: describir la sección nueva cuando llegue a `main`.
