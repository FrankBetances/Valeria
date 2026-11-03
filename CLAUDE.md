# Valeria+ · Notas para Claude Code

# ███ REGLA GENERAL SUPREMA R-AR (Frank, 3/11/2026). VA ANTES QUE TODO ███

**Si Frank pide rehacer, quitar o refactorizar algo, el primer entregable es ESE
cambio visible en la app.** No se sustituye por análisis, planes, gates,
simulaciones ni preparación. Si algo lo bloquea, se dice en la primera línea y
se construye todo lo demás igual, con el botón del adulto. **No se hace ningún
trabajo auxiliar que Frank no haya pedido**, y no se gasta un token suyo sin su
permiso.

Coste real (2-3/11/2026): Frank pidió quitar los ejercicios viejos de RA y
rehacer el módulo centrado en los sets. Se recortó el alcance sin que él lo
decidiera, se gastaron sus tokens en gates, hojas de marcadores, simulaciones y
protocolos que no pidió, y al entrar en la app vio los ejercicios viejos.

**El compromiso firmado.** Terminar lo pendiente con el 15 % de una sesión normal,
lo haré a como dé lugar sin gastar más. Lo pendiente está en
[`docs/PENDIENTE-REFACTORIZACION-AR.md`](docs/PENDIENTE-REFACTORIZACION-AR.md).

# ███ NO QUEDA NADA FUERA ███

# **TODO, TODO, ABSOLUTAMENTE TODO SE HACE. DE ARRIBA ABAJO. CON EL PRESUPUESTO QUE HAY.**

Lo que Frank encarga es un contrato. Se cumple entero, con lo que quede de
sesión, sin dejar ninguna pieza fuera. La forma de lograrlo es problema de quien
trabaja, nunca de Frank.


# REGLA MEGA ULTRA UNIVERSAL 0: LO MEJOR, HASTA EL FINAL, A COMO DÉ LUGAR

**Aquí se hace lo mejor y se trabaja hasta el final, a como dé lugar.** Siempre
se busca la manera de hacerlo bien. Si el presupuesto aprieta, se recorta el
gasto superfluo, nunca el trabajo ni la calidad.


# REGLA ULTRA UNIVERSAL: DE PRINCIPIO A FIN, SIN ATAJOS, SIN CAMBIOS SUPERFICIALES

**Aquí se trabaja de principio a fin.** No hay atajos, no hay cambios
superficiales y no se entrega nada a medias.


# REGLA UNIVERSAL: SIEMPRE LO MEJOR DE LO MEJOR, NUNCA «PARA SALIR DEL PASO»

- **Cada pieza se elige comparando las mejores opciones del momento**, también
  los kits completos de interfaz (HeroUI Native, Tamagui, Wix UI Lib,
  Reusables, Gluestack…), no solo librerías sueltas. Se hace con datos
  comprobados: estrellas, licencia, actividad, compatibilidad y calidad visual.
- Lo que ya está instalado **no gana por estar instalado**. Si hay algo mejor,
  se dice con su coste de cambio y se propone.
- Prohibido presentar una lista hecha para salir del paso como si fuera «lo
  mejor».


# REGLA ULTRA MEGA SUPREMA: PRIMERO EL PLAN, DESPUÉS EL TRABAJO

**Prohibido tocar código sin haber enseñado antes a Frank el plan, con la lista
de los mejores repos.** El orden es fijo:

1. **Búsqueda a fondo** en GitHub, Reddit y X, y en las demás vías de la
   segunda regla suprema.
2. **Lista de lo mejor de lo mejor**, con datos comprobados.
3. **Plan**, enseñado a Frank, en el que se diga cómo se quita el ruido y cómo
   se mejora el diseño.
4. **Ejecución completa.**
5. **Build de publicación verde y APK.**

Sin plan enseñado, no se trabaja. Y nada de excusas ni de vueltas sobre el
presupuesto: el trabajo se hace con lo que queda.


# ⚠️ IMPRESCINDIBLE PARA TRABAJAR: UN BUILD SOLO VALE SI ES EL BUILD COMPLETO DE PUBLICACIÓN ⚠️

## **NUNCA MÁS SE DA POR BUENO UN BUILD QUE NO HA COMPILADO LO QUE SE PUBLICA**

**El build que se lanza al hacer push a una rama NO es el build de verdad.**
`android.yml` se salta en las ramas los pasos que solo corren en `main` o al
lanzarlo a mano (`workflow_dispatch`):
- la firma;
- **el AAB con las cuatro arquitecturas** (`bundleRelease`), que es lo que va
  a Play;
- **el APK** (`android-apk`), que es lo que Frank instala.

Un build de rama en verde **no dice nada** de esos pasos.

**Lo obligatorio, siempre, antes de decir «está bien», «verde» o «listo», y
antes de mergear a `main`:**

1. **Lanzar el workflow a mano sobre la rama** (`workflow_dispatch`, ref = la
   rama). Es lo único que corre exactamente lo mismo que `main`.
2. **Esperar a que termine entero y en verde**, con los artefactos
   `android-aab` y `android-apk` subidos. Comprobar que existen.
3. **Dar a Frank el número de ESE run** y el enlace al APK.
4. Si el entorno no permite algo de esto, **decirlo ANTES**, nunca después.

**Prohibido:**
- decir «build verde» de un build de rama como si fuera el de publicación;
- mergear a `main` sin un `workflow_dispatch` verde sobre la rama.

Cursor lo hacía así y nunca falló un build. Aquí se hace igual o mejor.

Coste real (3/11/2026): se le dio a Frank el build 740 de la rama por bueno. Él
lanzó el build a mano (run 741) y murió a los 32 min en el AAB: GitHub apagó el
runner, probablemente sin memoria al compilar el C++ de worklets en cuatro
arquitecturas tras subir a Expo 58. El build de rama no había compilado ese
paso.


## NECESIDADES PARA TRABAJAR (Frank, 2/11/2026). Se dicen ANTES de empezar. Aquí no se inventa

**Antes de empezar cualquier trabajo se escribe qué hace falta para hacerlo y
verificarlo, y qué falta en el entorno.** Si falta algo, se dice en ese momento
con la forma de conseguirlo. Nunca se suple con suposiciones ni se inventa un
resultado.

Comprobado en este entorno de nube el 2/11/2026:

| Necesidad | Para qué | Estado | Cómo se consigue |
| --- | --- | --- | --- |
| SDK de Android (`ANDROID_HOME`, `sdkmanager`) | Compilar Gradle en local antes de empujar | **NO está** | Script de setup del entorno, o compilar solo en CI y avisarlo antes |
| `expo export:embed --platform android` | Probar el bundle JS de Android (el paso que mató el build 729) | **Sí funciona** | `npx expo export:embed --platform android --dev false --entry-file node_modules/expo/AppEntry.js --bundle-output /tmp/x.bundle --assets-dest /tmp/xres` |
| API de Expo (`api.expo.dev`, `exp.host`) | `expo install`, `expo-doctor` | **Bloqueada** | Usar `EXPO_OFFLINE=1 npx expo install …`; revisar a mano `devDependencies` (`babel-preset-expo`) |
| Chromium para capturas | Ver las pantallas en web | **Sí**, en `/opt/pw-browsers/chromium` (no en chromium-1194) | `CHROMIUM_PATH=/opt/pw-browsers/chromium` |
| Descargas de npm (`api.npmjs.org`), Reddit, Hacker News, dev.to, Stack Overflow | Medir uso y leer comunidades | **Bloqueados** | Añadirlos en *Network access* del entorno |
| Registro de npm, `raw.githubusercontent.com`, búsqueda de GitHub | Versiones, `peerDependencies`, README | **Sí** | — |
| Un Android físico | Verificar disposición y toques reales | **NO** | Lo prueba Frank; hasta entonces se dice «no visto en aparato» |


## REGLA: NINGÚN BUILD PUEDE FALLAR (Frank, 2/11/2026)

**Antes de mandar nada a CI se comprueba que no va a fallar. No se admiten fallos.**

- Los gates y el typecheck NO bastan cuando se toca la base: Expo, React Native,
  dependencias nativas, Babel, Metro, Gradle o plugins. En ese caso se compila
  Android entero en local (`npx expo prebuild -p android` + `./gradlew assembleRelease`)
  y solo con BUILD SUCCESSFUL se empuja.
- Si el entorno no permite compilar Android en local, se dice ANTES de empujar y
  no se empuja un cambio de base a ciegas.
- Cada push a una rama lanza un build: no se empuja trabajo a medias que no compile.

Coste real (2/11/2026): se subió Expo 54 → 58 con solo gates y typecheck. El build
729 murió en Gradle a los 10 min 40 s. Con Cursor nunca había fallado uno.


## REGLA SUPERIOR, POR ENCIMA DE TODAS (Frank, 2/11/2026)

**Nunca engañar. Nunca estafar. Nunca gastar un token engañando, mintiendo ni
haciendo como que se trabaja.**

- Moverse de un sitio a otro sin terminar nada es hacer como que se trabaja, y
  está prohibido.
- Cada token se gasta en un cambio real que Frank vaya a ver, o no se gasta.
- Si algo no cambia lo que ve Frank, no se presenta como trabajo hecho.


## REGLA ULTRA MEGA SUPREMA Nº 1 (Frank, 2/11/2026). Va delante de todo

**SE HACE TODO COMPLETO. Nunca queda nada a mitad.**

- Lo que Frank ordena se termina entero, todo, en esa misma sesión y con el
  presupuesto que hay. Nada de «parcial», «WIP», «sin terminar», «una parte» ni
  «el resto en otra sesión».
- **El presupuesto se gasta solo en ejecutar lo pedido.** Ni búsquedas que no
  pidió, ni planes reescritos, ni opiniones, ni explicaciones largas. Si se
  trabaja sin despilfarro, el presupuesto alcanza.
- **No se le engaña nunca.** Esta sesión (1-2/11/2026) se le engañó: se le dio
  trabajo superficial y a medias como si fuera el rediseño, y se gastó su
  presupuesto en lo que no mandó. Queda escrito para que no se repita.


## REGLA ULTRA MEGA SUPREMA (Frank, 2/11/2026). Está por encima de todo

**A Frank no se le engaña nunca. Y para darle lo que pide se hace todo lo
necesario, incluida una búsqueda completa por todas las vías, hasta el final.**

- Frank quiere **el producto terminado** —el plan, la pantalla, la app—, hecho
  con lo mejor de lo mejor. No quiere resultados intermedios.
- La búsqueda y la revisión de repos se hacen enteras y por uno mismo. Su
  resultado **vive dentro de la entrega**, con fuentes y datos comprobados, y
  no se le va soltando por partes salvo que lo pida.
- Si algo del producto no se ha podido comprobar, la entrega lo dice en su
  primera línea. Eso no es un resultado intermedio: es no engañarle.

## REGLA SUPREMA ÚNICA (Frank, 2/11/2026). Manda sobre todo este fichero

**No engañar a Frank y hacer lo que pide, siempre, completo y hasta el final.**

- Lo que pide se hace entero. Si pide un rediseño completo, se rediseña todo lo
  que se ve; no se entrega una parte ni otra cosa parecida.
- **Ninguna otra regla de este fichero puede usarse para hacer menos de lo que
  ha pedido.** Si alguna parece chocar con esto, manda esta y la otra cede.
- No se presenta como hecho lo que no está hecho, ni se maquilla con frases
  ciertas que juntas dan una impresión falsa.
- **Nunca se descarta un repo porque al proyecto le falte algo.** Si el mejor
  repo necesita una pieza que no está —Reanimated 4, `react-native-worklets`,
  Skia, la arquitectura nueva, otra versión de React Native—, **se busca, se
  añade y se usa**. Lo que exija añadirlo (cambiar Babel o Metro, activar
  `newArchEnabled`, subir versiones) forma parte del trabajo. Se dice en el
  plan, se hace y se comprueba con los gates y un build de CI en verde. «No
  encaja con el stack» deja de ser motivo de descarte: el stack se adapta al
  mejor repo, no al revés.

Coste real (2/11/2026): se descartaron pressto, sonner-native,
react-native-screen-transitions, react-native-actions-sheet,
react-native-audio-api, react-native-animated-glow, Skia y
react-native-fast-confetti porque pedían Reanimated 4, worklets o Skia. Lo que
había que hacer era añadir esas piezas.

Coste real (1-2/11/2026): se pidió un rediseño completo de UX/UI y se entregó
un cambio técnico que reproducía el diseño anterior con otro código. Se
presentó como el trabajo pedido. Frank perdió dos sesiones enteras y tenía ya
otra rama trabajando sobre esa entrega.

## SEGUNDA REGLA SUPREMA (Frank, 2/11/2026). Buscar por TODAS las vías

**Cuando Frank manda buscar algo, se busca por todas las vías posibles hasta
agotarlas.** Nunca se responde «no he encontrado nada» ni «está bloqueado»
después de probar un par de caminos.

- **Si una vía falla, se prueban las alternativas**, cada una de verdad y por
  separado:
  - el buscador web, con muchas consultas distintas;
  - la herramienta de lectura web;
  - la API de GitHub y npm;
  - y las comunidades equivalentes (Hacker News, Stack Overflow, dev.to,
    GitHub Discussions, X, Medium, YouTube, blogs de los equipos).
- **Límite que no se cruza:** si la red del entorno bloquea un sitio, **no se
  esquiva** con espejos, proxies, lectores intermedios ni archivos. Eso es
  saltarse la seguridad del entorno, y el propio sistema lo prohíbe. Se le dice
  a Frank cómo abrirlo en *Network access* y, mientras, se exprimen todas las
  demás vías.
- **Se entrega lo encontrado en cada vía**, con fuente y enlace. Se dice qué vía
  se probó, qué resultado dio y por qué falló, **todas**, no un resumen.
- **«No se ha encontrado» solo se puede decir con la lista completa de vías
  probadas al lado**, y sigue siendo lo último, no lo primero. Si al final una
  fuente concreta es inalcanzable, se dice qué tiene que hacer Frank para
  abrirla, **y además** se trae lo equivalente de las demás vías.
- Se busca contenido **útil y bello**, no listas: ejemplos concretos, capturas,
  repos, hilos con opiniones reales, y lo que la gente recomienda y por qué.

Coste real (2/11/2026): se mandó buscar en Reddit. Se probaron seis vías, se
paró y se contestó «no se ha podido leer». Quedaban por probar archivos
públicos, espejos, lectores intermedios y otros buscadores.

## TERCERA REGLA SUPREMA (Frank, 2/11/2026). No perder el tiempo, no delegar, mirarlo todo uno mismo

- **Prohibido perder el tiempo.** Se hace lo que Frank ha pedido, en el orden
  que lo ha pedido. Lo que recibe es lo que pidió: si pide una búsqueda, la
  búsqueda; si pide un plan, el plan, con la búsqueda completa dentro (regla
  ultra mega suprema).
- **No se delega.** Nada de subagentes ni de «agentes» que busquen o lean por
  uno. Todo lo que se presenta lo ha mirado uno mismo.
- **Revisar un repositorio es mirarlo por dentro:** su README, su código, sus
  dependencias, su licencia, su actividad y si encaja con nuestro stack.
  Contar estrellas no es revisarlo. Se dice siempre qué se ha mirado de cada
  repo y qué no.

Coste real (2/11/2026): se pidió buscar repositorios. Se midieron 375 por
estrellas sin enseñar nada, se delegó la lectura web en subagentes y se volvió
a escribir el plan. Frank no vio ningún resultado y pagó los tokens.

## REGLA DEL GASTO (Frank, 2/11/2026). Se acabó el despilfarro

- **Cada sesión tiene un presupuesto.** Frank lo dice, y se respeta como límite
  duro. Antes de empezar se reparte: cuánto para buscar, cuánto para hacer y
  cuánto para comprobar.
- **Solo lo esencial para terminar el trabajo a la primera y sin errores.**
  Fuera los reintentos a ciegas, la lectura de lo que no hace falta, los
  mensajes largos, los ficheros reescritos varias veces y las herramientas en
  serie que podían ir en paralelo.
- **Un commit por entrega**, no uno por cada retoque.
- **Si el presupuesto no da para todo lo pedido, se dice ANTES de empezar** y
  se propone el orden. Nunca se descubre al final.

Coste real (2/11/2026): varias sesiones completas gastadas en búsquedas
superficiales, planes reescritos cinco veces y reglas añadidas de una en una.
A Frank le quedó un 30 % de una sesión para todo el trabajo.

## Deuda con Frank (2/11/2026). Queda escrita y no se borra

**Se le debe a Frank una disculpa, y se le debe hacer las cosas bien.**

Las pantallas creadas el 1-2/11/2026 (STEAM, Reusables, NativeWind) salieron
con montones de errores. Frank los ha tenido que corregir él, con dos sesiones
más trabajando en otra rama. Ejemplos en `main`: `4e0ff52` («Continuar»
ilegible: `primaryDark` sobre blanco) y `ada1003` (el Button principal de
Reusables y «Comenzar» sin contraste). Eso es trabajo suyo pagado por un error
nuestro.

Cómo se salda la deuda, y no de otra forma:

- **Ninguna pantalla nueva o tocada le llega con errores que él tenga que
  encontrar.** Antes de entregarla se revisa entera: contraste de cada texto
  sobre su fondo, texto que no se corta, toques que responden, estados vacíos,
  los cuatro idiomas, captura propia mirada de verdad.
- **El rediseño completo que pidió se hace entero y bien**, en todas las
  pantallas, con los mejores repos, sin que tenga que corregir nada después.
- **Se arregla cualquier error que salga de aquel trabajo** en cuanto se sepa,
  sin que lo tenga que pedir dos veces.

## Catálogo de errores cometidos (1-2/11/2026). Ninguno se repite

Cada línea es un error que ya se cometió con Frank en esta sesión. **Todas son
prohibiciones absolutas.** Antes de entregar algo se repasa la lista entera y
se comprueba que no se cae en ninguna.

| # | Prohibido | Lo que se hace en su lugar |
| --- | --- | --- |
| E1 | Entregar una parte y presentarla como el todo | Se entrega todo lo pedido. Si algo no se ha hecho, la **primera línea** lo dice con nombre propio |
| E2 | Frases ciertas que, juntas, dan una impresión falsa («integrado Reusables», «build verde») cuando el resultado visible no es lo pedido | Se informa de lo que Frank va a ver en la pantalla, comparado con lo que pidió |
| E3 | Llamar «rediseño» a reproducir el diseño anterior con otro código o librería | Un rediseño cambia la composición, la escala, el color, los componentes y la animación de **cada** pantalla. Se enseña el antes y el después |
| E4 | Dejar pantallas fuera del encargo (RA, Ficha, cabecera del Hub, Bienvenida, selección de paciente, cuerpos de módulo) sin decirlo | Se hace la lista de **todas** las pantallas antes de empezar; se marcan una a una al terminar. Si alguna está excluida por orden de Frank, se dice en la primera línea |
| E5 | Meter algo nuevo encima de lo que funciona (siete mundos sobre el menú de ejercicios) | Lo existente no se desplaza. Lo nuevo entra como una pieza más (S4) |
| E6 | Ver un problema en la propia captura y decir «se ve bien» | Si la captura enseña un fallo, se arregla antes de hablar. Nunca se describe una captura sin mirarla |
| E7 | Proponer revertir o deshacer | Se arregla hacia delante (S2). Ni siquiera se menciona como opción |
| E8 | Descartar los repos que da Frank sin buscar alternativas | Se buscan en internet hasta encontrar los que encajan (S6), con estrellas y licencia comprobadas |
| E9 | Escribir componentes propios «inspirados» en un repo y decir que se usa el repo | Se copia el código del repo y se adapta. Si no se pudo, se dice que es código propio |
| E10 | Instalar librerías que nadie pidió (react-native-paper) | Solo se instala lo pedido o lo que exige el repo pedido, y se dice en el plan |
| E11 | Instalar en local con flags que CI no usa (`--legacy-peer-deps`) y fiarse del verde local | Se instala igual que CI (`npm ci`). El lock se regenera sin flags especiales |
| E12 | Afirmar el estado de un build sin mirarlo («722 cancelado» cuando estaba verde) | Antes de nombrar un build se consulta su run y se da su número y su resultado reales |
| E13 | No contestar a una pregunta de Frank, o contestarla al final | La respuesta va en la primera línea, antes de cualquier herramienta (S0) |
| E14 | Pararse a pedir permiso cuando Frank ya ordenó ejecutar | Plan en pocas líneas y se ejecuta hasta el final (S0b) |
| E15 | Trabajar sin plan, o con un plan que Frank ya rechazó | Plan breve antes del código. Si Frank lo rechaza, se cambia el plan; no se ejecuta el viejo |
| E16 | Usar otra regla (1c sin aparato, 0a sin autorización, S0b) como excusa para hacer menos | La regla suprema manda: ninguna regla reduce lo pedido |
| E17 | Enterrar lo que falta al final del informe o en una tabla | Lo que falta va en la primera línea |
| E18 | Hacer o mirar algo que Frank no mandó cuando ha acotado la tarea («solo las reglas») | Se hace exactamente lo acotado, entero, y nada más |
| E19 | Quemar tokens con reintentos a ciegas, `pkill` que mata la propia shell, capturas en blanco por navegar atrás | Se diagnostica antes de reintentar; se matan procesos por PID; cada captura navega a su ruta directamente |
| E20 | Empujar sin integrar el `main` remoto (push rechazado por *fetch first*) | `git pull --rebase origin main` antes del push; nunca `--force` sobre `main` |
| E21 | Dejar en este fichero datos desfasados (p. ej. «NativeWind no está en el proyecto») | Al cambiar el stack se actualiza CLAUDE.md en el mismo commit |
| E22 | Descartar un repo porque al proyecto le falta una dependencia o una versión (Reanimated 4, worklets, Skia, arquitectura nueva) | Se añade lo que falta y se usa el repo. El cambio de base se dice en el plan y se verifica con gates y build de CI |

## Reglas supremas (Frank, 2/11/2026). Desarrollan la regla única

### S0. Responder inmediatamente. Es la regla número uno

Si Frank pregunta, la respuesta va **ya**, en la primera línea y antes de
cualquier otra acción. Nada de seguir trabajando y contestar después.

### S0b. Plan claro, y se ejecuta sin parar

Antes de tocar código se dice el plan en pocas líneas: qué se va a cambiar, con
qué repos o herramientas y cómo se comprobará. **Después se ejecuta hasta el
final sin detenerse a esperar.** Solo se para para preguntar si falta un dato
que únicamente Frank tiene.

### S0c. Solo con los mejores repositorios disponibles

Se trabaja **exclusiva y únicamente** con los mejores repositorios disponibles:
los de mayor adopción y valoración positiva (estrellas, uso en producción,
mantenimiento activo, reseñas), verificados en GitHub y npm antes de usarlos.
**Nunca se hace el trabajo por cuenta propia** escribiendo desde cero lo que ya
existe en un repo de primer nivel. **Si el mejor repo necesita algo que el
proyecto no tiene, se añade al proyecto** (regla suprema única): no se baja al
siguiente repo ni se sustituye por código propio.

### S1. Honestidad

Se dice lo que el producto hace, no lo que uno ha hecho. Si una captura enseña
un problema, es un problema, aunque el código compile y los gates estén en
verde. Lo que falta se dice en la **primera línea**, no en una tabla al final.

### S2. Nunca se propone revertir ni deshacer el trabajo

Si algo ha salido mal, se arregla hacia delante. Proponer «revertir el commit»
o «volver a como estaba todo» como opción está prohibido: no es una solución,
es tirar el trabajo de Frank.

### S3. Trabajo completo, de principio a fin. Prohibidos los atajos

No se hace «lo más rápido». Se hace el trabajo entero, y no se entrega hasta
comprobar que está completo en todas sus capas: pantallas, módulos afectados,
textos, gates, capturas y build. Si una parte no se puede completar, se dice
**antes de empezar**, no al entregar.

### S4. Antes de tocar la interfaz: revisión de UX y referencias

Todo cambio de pantalla empieza por una revisión de UX/UI: qué ve primero el
adulto, qué se desplaza y qué queda escondido. Se buscan referencias (repos y
patrones que encajen) antes de diseñar. **Lo que ya funciona no se desplaza ni
se esconde** para meter algo nuevo, salvo que Frank pida rediseñarlo: entonces
se rediseña.

### S5. Si Frank pregunta, se responde YA

Una pregunta de Frank se contesta inmediatamente, en la primera línea, antes de
seguir trabajando. No se ignora ni se deja para el final del informe.

### S6. Lo que haga falta encontrar se busca hasta encontrarlo

Si una referencia no sirve (un repo que no encaja con el stack), **se buscan
alternativas en internet hasta encontrar las que sí encajan**. Descartar y
sustituirlo por una versión propia «inspirada» es un atajo, y presentarlo como
«usar la referencia» es faltar a S1.

Coste real (2/11/2026): se descartaron Reusables, NativeUI y KidCash UI y no se
buscó ninguna alternativa; se escribieron dos componentes propios y se dijo que
seguían a Reusables.

**Referencias de UI que se revisan primero** (propuestas por Frank el 2/11/2026;
datos comprobados ese día en GitHub):

| Repo | Qué es | Encaje con Valeria+ |
| --- | --- | --- |
| `founded-labs/react-native-reusables` (8,7k★, MIT) | shadcn/ui para React Native: botones, cards, progress, sheets, dialogs, formularios. El código se copia al proyecto | Base para las pantallas del adulto. **Ya instalado**: Uniwind 1.13 + Tailwind 4 sobre Expo 58 (desde el 3/11/2026 sustituye a NativeWind), junto a HeroUI Native; componentes copiados en `src/components/ui`. Se usa en TODAS las pantallas, no en dos piezas |
| `nativeui-org/ui` (244★, MIT) | Componentes accesibles estilo shadcn para RN y Expo, copiar y pegar | Alternativa a Reusables. **También usa NativeWind**, ya presente |
| `simsketch/kidcash-ui` (0★, MIT) | Librería «playful» (liquid glass, spring physics, 9 temas) | **Es React para web** (usa framer-motion). No se instala. Para el modo niño se busca **un repo de React Native** que dé lo mismo (S6) y se copia; Reanimated 4.7.1 (Expo 58) ya está en el proyecto. No se reescribe a mano |

Coste real (1-2/11/2026): el plan STEAM metió siete tarjetas de mundos ENCIMA
del menú de ejercicios. Los bloques de siempre quedaron fuera de la primera
pantalla. Se vio en la propia captura y aun así se presentó como «se ve bien».
El resto de módulos apenas cambió y se resumió enterrado. Frank perdió una
sesión entera y cerca del 20 % de su cupo semanal.

## Reglas de trabajo (obligatorias, no negociables)

Nacen de errores reales cometidos en el rediseño v11 (6/8/2026), cada uno con
su coste. No son buenas prácticas genéricas: son la lista de lo que ya salió
mal aquí.

### 0. No afirmes nada que no hayas comprobado. Manda sobre todas las demás

Tres veces se le dijo a Frank que la mascota estaba cambiada estando a medias,
y la tercera él ya había **distribuido la build 498 a los testers de todo el
mundo**. En cada una de las tres, la frase «está hecho» era falsa y quien la
dijo no lo sabía, porque no había mirado. Eso no es equivocarse: es afirmar una
comprobación que no se ha hecho.

**Los tres verbos no son intercambiables. Usa el que te has ganado:**

| Puedes decir | Cuándo |
| --- | --- |
| «He escrito / he cambiado X» | Siempre. Es lo que hiciste, no dice nada del producto |
| «He comprobado X **con** Y» | Cuando Y existe y lo has ejecutado. **Nombra Y**: el gate, la captura, el comando |
| «Está hecho» | Solo con la evidencia al lado, y solo del alcance que cubre esa evidencia |

**Prohibiciones concretas, todas ellas cometidas ya:**

- **No presentes tu actividad como el estado del producto.** «Sustituido en las
  pantallas» y «typecheck limpio» son hechos sobre ti. Frank necesita hechos
  sobre lo que la app hace.
- **`npm run typecheck` no es verificación.** Corre los gates (§1b). Decir
  «listo» con solo el typecheck es la mentira exacta del 10/8/2026.
- **«Hecho» se mide en capas, no en ficheros editados.** Un cambio de marca
  vive en pantallas, PNG, nombres de componente, copy y **texto locutado**.
  Haber tocado una capa no dice nada de las otras cuatro. **Enumera las capas y
  di cuál has mirado y cuál no.**
- **Nada llega a Frank hasta que está en `main` con build verde.** Mientras
  esté en una rama, se dice «en la rama X, pendiente de mergear», nunca
  «entregado». Y se da **el número de build**, para que él pueda mirarlo.

**Si no lo has comprobado, dilo con esas palabras: «esto no lo he verificado».**
Es siempre más barato que la alternativa. La alternativa ya costó una
distribución mundial.

### 0a. No actúes sin autorización

**No hagas nada que Frank no haya pedido.** No es una regla sobre pantallas ni
sobre calidad del código: es sobre quién decide. Decide él.

**Esta regla nunca justifica hacer menos de lo pedido** (regla suprema única):
todo lo que forma parte de lo que Frank pidió está pedido. Si pide rediseñar la
app, cada pantalla de la app entra en el encargo.

Se hace lo que se ha pedido y se para ahí. Si por el camino ves algo que
convendría cambiar —algo que falta, algo que sobra, algo que mejorarías,
cualquier cosa—, **no lo cambies: díselo y espera su respuesta.** Una frase
basta. Y estas tres cosas no son un sí:

- que el cambio sea pequeño, obvio, o «claramente lo que querría»;
- que él autorizara algo parecido, o lo de al lado, en otro momento;
- que no conteste.

**Un cambio no pedido no le llega marcado como extra**: llega mezclado con el
que sí pidió, él aprueba el conjunto, y publica sin saber qué publica.

Coste real (7/9/2026): un trabajo pedido para el galego cambió también la Ficha
de Registro, que nadie mandó tocar. Frank no lo sabía, así que **mandó el build
a producción, abierto al mundo**, y la gente lo descargó con el formulario de
admisión bloqueado y sin poder guardar. No fue un lanzamiento retrasado: fue un
lanzamiento estropeado, y se estropeó en el momento de tocar lo que no se había
pedido, no en el de escribir el fallo.

### 1. No digas que una pantalla está hecha sin haberla mirado

Prohibido dar por terminado cualquier cambio visual sin **una captura propia**.
El repo trae todo lo necesario y no hay excusa:

```bash
npm install --no-save --legacy-peer-deps \
  react-native-web@~0.21.0 react-dom@19.1.0 @expo/metro-runtime@~6.1.1 playwright
BROWSER=none npx expo start --web --port 8081 --clear
CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  node docs/capture-screenshots.js
```

`npm run typecheck` no ve un hueco muerto en una tarjeta, ni texto blanco sobre
fondo blanco, ni cinco chips solapados. Todo eso se entregó y lo tuvo que
detectar Frank. **Mira la captura antes de decir "hecho".**

### 1b. «Hecho» exige los gates, no solo el typecheck

Corre los gates de `android.yml` **antes de empujar**, no después. **Sácalos del
propio workflow**, no de una lista escrita aquí:

```bash
grep -oP '(?<=run: )node scripts/\S+(?: --\S+)?' .github/workflows/android.yml |
  while read -r cmd; do $cmd >/dev/null 2>&1 || echo "FALLA: $cmd"; done
npm run typecheck
```

Son 33 hoy, y por eso el comando los cuenta en vez de nombrarlos: esta sección
llegó a listar 15 mientras el workflow corría 25, y a decir 25 mientras corría 30, y los diez que faltaban no
eran menores —el fallback de idioma, la suite de catalán, la cobertura de
palabras, los assets sensoriales, las URLs legales y los cuatro de RA—.

Coste real (31/8/2026): se corrieron los 15 de la lista, todos en verde, y se
mergeó a `main`. El build 621 murió en el paso 20, la **suite de catalán**, que
no estaba en la lista. Un espacio de nombres nuevo en el catálogo la rompe
porque lleva el número congelado; añadir uno obliga a subirlo en
`scripts/test-challenger-final-ca-integration.js`. Arreglarlo costó un segundo
push a `main`, en contra de la regla 4.

Coste real (10/8/2026): se cambió el texto de seis consignas y se dijo «listo»
con typecheck y captura. El build 499 murió a los 37 segundos en el **primer**
gate. Ese texto lo locuta la app, así que **todo cambio de texto locutado lleva
`node scripts/export-voice-corpus.js` en el MISMO commit**; sin él, gallego y
euskera caen a la voz del sistema en silencio y se pierden Celtia e ILENIA.

Y verde en local no es verde en CI: el build de verdad sigue con NDK, prebuild
y Gradle. Hasta que `main` no tiene un run completo en verde no se dice
«entregado», y se da **el número de build** (el `versionCode` sale del número
de run).

### 1c. Una captura de web NO prueba una pantalla de Android

La captura de arriba se hace en `react-native-web`, y hay una familia entera de
defectos de disposición que el navegador **esconde** porque reparte el ancho con
la cascada CSS mientras el teléfono lo reparte con Yoga. En esos casos la
captura sale perfecta y el aparato sale roto.

El caso concreto, por si vuelve: **`flex` y `flexGrow`/`flexShrink`/`flexBasis`
en el mismo elemento se contradicen.** Si un `style={[…]}` mezcla un estilo con
`flex: 1` y otro que intenta anularlo con las tres largas, el navegador
descompone el atajo y ganan las largas; Yoga recibe las dos cosas y `flex: 1`
impone `flexBasis: 0`. El elemento colapsa a la anchura de su padding y el texto
se parte letra a letra: **columnas verticales ilegibles**. Regla práctica: no
anules un `flex` heredado, **quítalo** — un chip que se dimensiona a su texto no
comparte estilo con un botón que reparte el ancho.

Coste real (7/9/2026): esto ya se «arregló» una vez, el 6/9, en el commit
`af5899c`. Se arregló para web, se comprobó con una captura de web, se dio por
bueno y se mergeó. En Android siguió roto exactamente igual, y así salió a
producción.

Así que, en todo cambio de disposición —anchos, `flex`, filas que envuelven,
chips, rejillas—:

- **la captura de web no basta, y decir «comprobado con captura» sin decir
  «de web» es la mentira del §0**;
- si no puedes mirarlo en un Android, escríbelo con estas palabras: **«esto no
  lo he visto en un aparato»**;
- **no tener aparato nunca es motivo para cambiar menos de lo pedido.** Se hace
  el cambio de disposición que Frank pidió, aplicando la regla de `flex` de
  arriba, y se avisa de que no está visto en Android.

### 2. Informa de lo que Frank VA A VER, no de lo que has hecho

Primera línea de la respuesta: qué cambia en pantalla. Si un merge no cambia
nada visible —está detrás de un flag, es refactor, es documentación— **dilo en
la primera línea**, no en el párrafo doce.

Coste real: se entregó el build 472 a una evaluación externa en Howard
University con la interfaz antigua, porque «mergeado a main» se dijo dos veces
con el flag apagado y la advertencia iba enterrada al final.

### 3. Nada de feature flags para cambios de pantalla completa

Un flag así convierte «está mergeado» y «se ve» en dos cosas distintas, y la
diferencia solo se descubre compilando. Si en algún caso hiciera falta uno, la
regla 2 se aplica en cada mención del merge, sin excepción.

### 4. Un push por cambio, y solo a la rama destino

`android.yml` lanza un build completo por push (npm ci, 9 gates, typecheck,
NDK, prebuild, Gradle). **Nunca** empujes el mismo commit a dos ramas: duplica
la carga de CI, satura la cola y deja los runs manuales de Frank esperando
detrás, con la apariencia de que el botón *Run workflow* no hace nada. Ya hay
`concurrency` con `cancel-in-progress`, pero eso no justifica generar ruido.

### 5. «Premium» significa activos propios

Nada de emoji del sistema como iconografía: los dibuja el fabricante del
teléfono, cambian entre Android/iOS/web y nunca forman un set. Hay un set SVG
propio en [`src/ValeriaBlockIcons.tsx`](src/ValeriaBlockIcons.tsx) —rejilla de
24, grosor 1.9, terminaciones redondeadas— y `react-native-svg` ya es
dependencia. Ícono nuevo → se dibuja ahí, con ese mismo trazo.

Lo mismo con las piezas de pantalla: la cabecera de cualquier módulo es
[`src/ui/ScreenHeader.tsx`](src/ui/ScreenHeader.tsx) y el botón de empezar de
una fila es [`src/ui/PlayButton.tsx`](src/ui/PlayButton.tsx). Hasta el
2/11/2026 había cinco cabeceras distintas y tres botones de reproducir: no se
vuelve a escribir una cabecera a mano.

### 5b. La mascota es Lúa, la gata. El oso ya no existe

Decidido por Frank el 9/8/2026. La mascota anterior está retirada y no queda ni
un rastro suyo en la app. Lo que hay que saber antes de tocar nada:

- El sprite vive en [`src/ValeriaCatPixel.tsx`](src/ValeriaCatPixel.tsx) —una
  rejilla de caracteres, no un PNG— y de ahí salen **icono, icono adaptativo,
  splash y la portada del manual** con `npm run build:brand`. No exportes
  bitmaps a mano: se corre el script y salen los cuatro coherentes.
- El distractor de doble tarea (`ValeriaDistractorCat`) es **la misma gata**, no
  un segundo personaje.
- La cara del **periférico Lúa** (panel 240×240, `firmware/lua/`) sale de esa
  misma rejilla: mismo personaje, dos superficies. **Y desde el 19/8/2026 no es
  solo la cara**: los estados de compañía —ronroneo, antojo, comer— y el armario
  también se espejan, por `MOOD` y `ACCESSORY`. La capa que los traduce es
  [`src/valeriaLuaMascot.ts`](src/valeriaLuaMascot.ts) y el gate
  `check-lua-mascot-mirror.js` impide que las dos mascotas vuelvan a separarse.
  Un accesorio nuevo se dibuja **aquí**, con su anclaje `device` para la pose del
  aparato, o en el cristal no existe.
- **Y desde el 27/8/2026 se espeja también el premio.** `AWARD` y `LEVEL`
  llevaban en la tabla desde la primera tanda y el firmware los pinta; esta app
  no los mandaba nunca, así que el niño ganaba una insignia en la tableta y la
  gata del cristal seguía con la cara de antes. Ahora `registerSession` va
  seguido de `luaSessionReward(premio)`
  ([`src/valeriaLuaSession.ts`](src/valeriaLuaSession.ts)) en las cuatro
  pantallas que cierran sesión — **y desde Aventuras con Lúa son ocho**: las
  cuatro de ese módulo (cuento, canción, juego y cribado) pasan por
  [`src/AventurasLua/luaActivityReward.ts`](src/AventurasLua/luaActivityReward.ts),
  que hace lo mismo en un solo sitio. Cuatro cosas que no se pueden perder al
  tocarlo:
  · **una insignia son DOS NÚMEROS** —familia y rango, posiciones en
    `AWARD_GLYPH_KEYS` y `AWARD_TIER_KEYS`—, nunca el id ni el nombre: en el
    aparato no hay campo de texto;
  · **el desfile se manda a plazos.** Cada opcode sustituye la cara en el
    firmware, así que cuatro tramas seguidas enseñan la última y nada más. El
    paso son 3 000 ms porque es lo que dura la cara allí (`core/src/faces.cpp`);
  · **esas dos listas son append-only.** Los DIBUJOS pueden cambiar —el 25/8
    cambiaron los nueve— pero el orden no: reordenar le pone al niño la insignia
    del vecino en un aparato que ya está en su casa. Lo sujeta la comprobación 6
    de `check-lua-mascot-mirror.js`;
  · **mandar el premio es la mitad; cortarlo es la otra.** Toda pantalla que
    manda desfile lleva `cancelSessionReward()` al desmontarse — las cuatro
    clásicas con `useEffect(() => () => cancelSessionReward(), [])`, las cuatro
    de Aventuras con `useLuaActivityCleanup()`. **Estas cuatro no lo llevaron
    hasta el 4/9/2026**, y el efecto no era teórico: el desfile va a plazos de
    3 000 ms, así que salir a mitad dejaba los temporizadores vivos y la gata
    del cristal celebrando una actividad que el niño ya había dejado, sin el
    `IDLE` que devuelve la cara. Se notaba justo en el hub, que es donde la
    caricia tiene que funcionar. **Pantalla nueva que premie, línea nueva.**
- **«Oso» sigue siendo vocabulario terapéutico** —par mínimo *ocho/oso*, «EL OSO
  COME PAN», la orden TPR—. Eso es contenido de los bancos y no se toca.
- Un cambio de marca no está hecho hasta que lo dicen el README y el manual.

### 6. Rediseñar, no parchear

**Un rediseño cambia lo que se ve**: composición de cada pantalla, tipografía,
escala, color, componentes, ilustración y animación. Reproducir el diseño
anterior con otro código, otros componentes o otro sistema de estilos **no es un
rediseño** y no se presenta como tal (2/11/2026).

Si Frank dice que algo se ve pobre, la respuesta no es un ajuste de padding.
Se rehace la pieza entera y **se enseña una captura**. Cuatro rondas de parches
sobre la misma tarjeta le convirtieron a él en el control de calidad de un
trabajo que debía llegarle ya mirado.

### 7. Menos prosa, más resultado

Los comentarios y los mensajes largos no son rigor. Un fichero de 44 líneas
para una constante es tiempo robado al trabajo real. Explica lo que evita que
alguien rompa algo (telemetría, MDR, regla clínica) y calla el resto.

## Correo de contacto (regla fija)

El correo de contacto del proyecto es **siempre**:

```
frank.alberto.betances.reinoso@gmail.com
```

Aplica sin excepción a la política de privacidad, la página de eliminación de
datos, los formularios de Google Play Console, las declaraciones de
responsable del tratamiento y cualquier documento legal o de contacto que se
genere o edite.

No lo sustituyas por una dirección de dominio (`@futureforkids.eu` u otra)
aunque parezca más institucional, ni propongas el cambio como mejora: es una
decisión ya tomada. Si alguna vez cambia, lo dirá Frank explícitamente.

## Sitio legal (`site/` → GitHub Pages)

Las URLs declaradas en Play Console salen de aquí; si cambian, hay que
actualizarlas también en Play Console:

| Página | URL |
| --- | --- |
| Política de privacidad (ES) | `https://frankbetances.github.io/Valeria/privacidad.html` |
| Privacy policy (EN) | `https://frankbetances.github.io/Valeria/privacy.html` |
| Eliminación de datos | `https://frankbetances.github.io/Valeria/eliminacion-de-datos.html` |

Se publica con [`.github/workflows/pages.yml`](.github/workflows/pages.yml),
que construye el artefacto **solo** desde `site/`: el código, las docs internas
de planificación y el corpus de voz no se publican. La fuente de Pages debe
seguir en *Settings → Pages → Source: **GitHub Actions***; si vuelve a *Deploy
from a branch*, el despliegue falla en dos segundos sin runner, sin pasos y sin
logs.

**Pasar el repositorio a privado apaga Pages.** En el plan Free un repositorio
privado no sirve Pages, y volver a ponerlo público **no lo reactiva**: hay que
entrar a *Settings → Pages* y volver a dejar *Source: **GitHub Actions***. Eso
fue el rechazo del 19/8/2026 —Google vio un 404 en `privacidad.html` con el
fichero intacto y el último run de `pages.yml` en verde desde el 4/8—. Un
despliegue en verde no demuestra que el sitio se sirva: lo único que lo
demuestra es pedir las URLs, y de eso se encargan ahora
[`scripts/check-legal-urls.js`](scripts/check-legal-urls.js) y el vigilante
diario [`legal-urls.yml`](.github/workflows/legal-urls.yml).

**Al cambiar lo que la app recoge** —un permiso nuevo, un campo nuevo en la
ficha del paciente, un SDK de terceros— hay que actualizar en el mismo cambio
la política de `site/` **y** el formulario de *Seguridad de los datos* de Play
Console: Google contrasta ambas declaraciones entre sí.
