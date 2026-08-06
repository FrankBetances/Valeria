# Plan de Evolución UX/UI · Valeria+ v10.2 → v11

> **Origen:** feedback de testers del piloto — *«el uso se hace muy engorroso y hay
> mucho texto»*. Objetivo: **evolución, no ruptura**. Cero regresiones clínicas,
> cero cambios en el motor de audio/ASR, cero pérdida de la serie de telemetría
> del piloto.

Este documento sustituye al borrador conceptual `Plan_Rediseno_UXUI_Valeria.md`.
Mantiene su estrategia (sintetizar + pestañas + feature flag) pero la corrige
donde chocaba con el código real y la aterriza en ficheros y líneas concretas.

---

## 0. Correcciones al borrador conceptual

El borrador daba por instaladas dependencias que **no están en `package.json`**.
Antes de planificar nada, esto se corrige:

| Borrador decía | Realidad del repo | Decisión |
| --- | --- | --- |
| `react-native-reanimated` v3+ | **No instalado** | ❌ **Se descarta.** Ver §0.1 |
| `expo-haptics` | **No instalado** | ⚠️ Opcional, Sprint 4. Ver §0.2 |
| Bottom Tabs | `@react-navigation/bottom-tabs` **no instalado** | ✅ Se añade (coste nativo cero) |
| «React Navigation» genérico | Es **v6** (`^6.1.18`), no v7 | Fijar `bottom-tabs@^6` |

### 0.1 Por qué se descarta Reanimated

Añadir Reanimated a esta app **no es una dependencia más**: exige el plugin de
Babel (`babel.config.js`), toca el arranque nativo y obliga a reconstruir el dev
client y los binarios EAS. En una app que ya tiene funcionando un pipeline
nativo delicado —`expo-speech-recognition`, `expo-audio`, el host nativo de RA
(MediaPipe + Filament)— eso es exactamente el tipo de riesgo que este plan
existe para evitar.

**La animación de pulsación que pide el borrador no la necesita.** El `Animated`
de RN con `useNativeDriver: true` ejecuta `transform: scale` en el hilo de UI,
a 60 FPS, sin tocar una sola línea nativa. Es la misma sensación premium con
riesgo de regresión cero.

```tsx
// Suficiente para el feedback de presión. Cero dependencias nuevas.
const press = useRef(new Animated.Value(1)).current;
const to = (v: number) => Animated.spring(press, {
  toValue: v, useNativeDriver: true, speed: 40, bounciness: 6,
}).start();
// onPressIn={() => to(0.96)}  onPressOut={() => to(1)}
```

### 0.2 Háptica sin dependencia nativa

`expo-haptics` es un módulo nativo → rebuild del dev client. Si en Sprint 4 no
hay rebuild previsto por otro motivo, se usa `Vibration` del core de RN
(`Vibration.vibrate(10)`), que ya está disponible. Si sí lo hay, `expo-haptics`
da mejor textura en iOS. **Decisión diferida a Sprint 4** — no bloquea nada.

---

## 1. Diagnóstico medido

No «parece» cargado: está cargado. Estas son las cifras del código actual.

### 1.1 El hub hace cinco trabajos a la vez

`src/ValeriaExerciseSelectionScreen.tsx` (664 líneas) es, en un solo componente:

1. El **hub** de bloques de terapia (`view === 'hub'`)
2. La **lista prescribible** de un bloque (`view === 'list'`)
3. La configuración de **recordatorios** + selector de 4 franjas (`ValeriaExerciseSelectionScreen.tsx:315-353`)
4. La tarjeta de **calidad de voz** (`:357`)
5. El **acceso profesional** + exportación de evidencia (`:362-370`)

Más dos modales de PIN y el consentimiento TEA. Trece `useState` en un mismo
componente (`:64-87`).

### 1.2 La densidad de texto, en caracteres

Los subtítulos de las tarjetas del hub, tal como están en `src/i18n/strings.es.ts`:

| Tarjeta | `sub` | Caracteres |
| --- | --- | --- |
| Pares Mínimos | `pairsSub` | 56 |
| Expansión Semántica | `semanticSub` | 69 |
| Audición | `hearingSub` | 100 |
| Lenguaje | `languageSub` | 68 |
| TEA | `autismSub` | 110 |
| Dislexia | `dyslexiaSub` | 96 |
| Realidad Aumentada | `arSub` | 118 |
| Academy | (hardcodeado en `AcademyHubCard.tsx:40`) | 101 |
| **Total** | | **718 caracteres** |

Setecientos caracteres de prosa descriptiva **antes** de llegar a recordatorios
(`remindersOff`, 110 car. + 4 franjas con etiqueta y pista cada una), a la
tarjeta de voz y al acceso profesional. El tester no está exagerando.

### 1.3 El scroll, en píxeles

Derivado del `StyleSheet` (`ValeriaExerciseSelectionScreen.tsx:566-662`):

| Bloque | Alto aprox. |
| --- | --- |
| 7 × `blockCard` (con `blockMeta`) | ~770 px |
| `AcademyHubCard` + 2 `hubLabel` | ~160 px |
| `remindCard` con franjas desplegadas | ~300 px |
| `VoiceQualityCard` | ~120 px |
| `proAccess` + padding de `scroll` | ~140 px |
| **Total contenido** | **~1.490 px** |

Viewport útil bajo la cabecera turquesa: ~600 px. → **~2,5 pantallas de scroll**
para llegar a los ajustes. Eso es el «scroll infinito» del feedback.

### 1.4 Bug real encontrado: el botón atrás de Android

`view` es un navegador **hecho a mano** dentro de un solo screen
(`:66`). No empuja ruta, así que **no hay `BackHandler` que lo intercepte**:
estando en la lista de un bloque (`view === 'list'`), el botón físico de atrás
de Android no vuelve al hub — sale de `ExerciseSelection` entera, de vuelta a
`PatientSelect` o `FichaRegistro`. El usuario pierde el sitio.

**Este bug se cierra solo** al convertir la lista en ruta real (§2.2). Es una de
las razones de peso para hacerlo, no solo estética.

### 1.5 Y un agujero en la evidencia del piloto

`noteScreen()` (`valeriaTelemetry.ts:223`) acumula ms por **nombre de ruta**. Como
la lista de bloques no es una ruta, **todo el tiempo de prescripción se imputa
hoy a `ExerciseSelection`**: la telemetría no puede distinguir «el adulto navega
el hub» de «el adulto prescribe». Separarlas en rutas reales **mejora** la
evidencia de usabilidad del piloto, no la degrada.

---

## 2. La propuesta

### 2.1 Tres pestañas inferiores

```
┌─────────────────────────────────┐
│  ▓▓ cabecera turquesa compacta  │  ← racha + nivel en UNA fila
├─────────────────────────────────┤
│                                 │
│   ┌───────┐   ┌───────┐         │
│   │  🗣️   │   │  🧩   │         │  ← grid 2 col, SIN subtítulo
│   │ Pares │   │Expans.│         │
│   │Mínimos│   │Semánt.│         │
│   └───────┘   └───────┘         │
│   ┌───────┐   ┌───────┐         │
│   │  👂   │   │  💬   │         │
│   │Audición│  │Lenguaje│        │
│   │ 12/18 │   │  5/7  │         │  ← badge = dato, no prosa
│   └───────┘   └───────┘         │
│         · · ·                   │
├─────────────────────────────────┤
│   ⌂ Terapias  🎓 Academy  ⚙ Ajustes │
└─────────────────────────────────┘
```

| Pestaña | Contiene | De dónde sale |
| --- | --- | --- |
| **Terapias** | Grid de bloques + Academy destacada | Hub actual, depurado |
| **Academy** | `ValeriaAcademyScreen` | Ya existe, solo cambia de sitio |
| **Ajustes** | Recordatorios, calidad de voz, acceso profesional, idioma | Extraído del hub |

Mover recordatorios + voz + acceso profesional a Ajustes **elimina ~560 px** del
scroll del hub. El grid de 2 columnas convierte 7 tarjetas de ~110 px en 4 filas
de ~130 px: de 770 px a ~520 px.

**Scroll del hub: ~1.490 px → ~680 px. Reducción del 54%.**

### 2.2 Rutas nuevas (y las que NO se tocan)

```
MainTabs                              ← nuevo, createBottomTabNavigator
├── ExerciseSelection  (Terapias)     ← MISMO NOMBRE. Ver §3.2
├── Academy                           ← ya existía como ruta del stack
└── Settings                          ← nuevo screen
BlockList  { block: BlockTab }        ← nuevo: la vista `view==='list'` como ruta real
```

Todo lo demás —`ExercisePlayer`, `MinimalPairs`, `SemanticExpansion`,
`LingTest`, `ArLauncher`, `Results`, `FichaRegistro`, `PatientSelect`,
`Welcome`, `Credits`— **se queda exactamente igual**, en el stack raíz. El
player nunca debe vivir bajo una barra de pestañas: durante el ejercicio la
pantalla es del niño y no puede haber salidas laterales a un toque.

### 2.3 Qué pasa con los 718 caracteres

**No se borran. Se reubican.** Esto es una decisión regulatoria, no estética.

Varios `sub` cargan información con peso MDR: `autismSub` dice *«Estresores
siempre manuales»*; `arSub` dice *«Sin grabar nada y con el micrófono apagado»*.
Borrarlos sería una regresión de la documentación al usuario.

La reubicación reutiliza un patrón **que ya existe en el código**: `s.refCard`
(`ValeriaExerciseSelectionScreen.tsx:430-447`), la tarjeta informativa que ya
muestra `refHearing` / `refAutism` / `refDyslexia` al abrir un bloque.

```
Hub (grid)          →  icono + título + badge "12/18".   0 caracteres de prosa.
Pantalla del bloque →  refCard con el `sub` + el `ref` existente.
```

El adulto lee la descripción **justo antes de usar el bloque**, que es cuando
sirve, en lugar de leer siete descripciones seguidas de bloques que no va a
abrir. Ninguna clave de `strings.es.ts` / `strings.en.ts` se elimina → **cero
churn de i18n, cero retraducción** de los 4 idiomas.

### 2.4 Toque premium, coste cero

Sin blur, sin gradientes, sin librerías. Lo premium aquí es la contención:

- **Espaciado en escala de 4** (4/8/12/16/24) en vez de los actuales 11, 13, 15, 18 px sueltos.
- **Tipografía en 4 pesos**, no en 9 tamaños (`11`, `11.5`, `12`, `12.5`, `13.5`, `14.5`… hoy conviven todos).
- **Un solo acento por tarjeta.** Hoy `blockCard` pinta icono + badge + chevron en tres tonos del mismo acento.
- **Muelle de presión** con `Animated` nativo (§0.1).
- **Cabecera colapsable** al hacer scroll: recupera ~90 px de viewport.

---

## 3. Muro de contención: qué NO se puede romper

Esta sección es la que hace que el plan sea una evolución y no una apuesta.

### 3.1 El límite de misclicks

`ValeriaMisclickBoundary` (`AppNavigator.tsx:106`) envuelve toda la app y cuenta
como *misclick* cualquier tap corto en zona muerta. La barra de pestañas es
superficie interactiva nueva: los taps sobre ella **dejarán de contar** como
misclick.

Eso es correcto —no son errores—, pero **cambia la línea base de la métrica** a
mitad del piloto. Acción: registrar la fecha de activación del flag en el export
de evidencia para que los tramos pre/post v11 se comparen por separado, no
agregados. No requiere tocar `ValeriaMisclickBoundary`.

### 3.2 Los nombres de ruta son datos del piloto

`cur.screens` (`valeriaTelemetry.ts:88, 223`) se indexa por nombre de ruta.
**Renombrar `ExerciseSelection` a `Terapias` partiría la serie histórica en dos**
y dejaría los datos previos huérfanos.

**Regla dura: los nombres de ruta existentes no se tocan.** La pestaña se llama
`ExerciseSelection` internamente y muestra «Terapias» como etiqueta visible
(`tabBarLabel`). La ruta nueva `BlockList` sí es una clave nueva —eso es adición,
no ruptura.

Verificar además que con navegador anidado `navigationRef.getCurrentRoute()?.name`
(`AppNavigator.tsx:138`) devuelve la ruta **más interna** — que es justo lo que
queremos, pero hay que confirmarlo en QA de Sprint 2.

### 3.3 El SUS y el umbral de 4 bloques

`SUS_BLOCK_THRESHOLD = 4` (`valeriaTelemetry.ts:43`) dispara el modal vía
`markBlockCompleted()`, que llama el **player**, no el hub. El rediseño no toca
el player → **el disparo del SUS no se ve afectado**. Confirmar en QA que
`ValeriaSUSModal` (montado en `AppNavigator.tsx:111`, fuera del navegador) sigue
pintando por encima de la barra de pestañas.

### 3.4 Carga diferida del ASR y del host de RA

`AR_ON = isArAvailable()` se evalúa **una vez por arranque, fuera del componente**
(`ValeriaExerciseSelectionScreen.tsx:46`). Al mover el hub a una pestaña, ese
módulo se monta y desmonta más veces. **Debe seguir fuera del componente** en el
screen nuevo. Igual con `hydrateAcademy()` (`AcademyHubCard.tsx:20`), que es
idempotente pero se llamará más a menudo.

### 3.5 El juez clínico sigue siendo el adulto

Ningún cambio de este plan toca el flujo de evaluación. El grid no autoselecciona
bloques, no sugiere «el siguiente recomendado», no ordena por rendimiento. La app
sigue sin decidir sola. **Cualquier propuesta de «hub inteligente» queda fuera de
alcance**: sería un cambio de clase regulatoria, no de UI.

### 3.6 El consentimiento TEA no se relaja

`openTea()` (`:186-190`) exige el consentimiento antes de la primera entrada. En
el grid, la tarjeta TEA mantiene exactamente esa puerta. El consentimiento no se
mueve a Ajustes ni se convierte en un toggle.

---

## 4. Feature flag

```ts
// src/valeriaFeatureFlags.ts  (nuevo, ~10 líneas)
export const ENABLE_V11_UI = false;
```

Punto de conmutación único, en `AppNavigator.tsx:84`:

```tsx
<Stack.Screen
  name="ExerciseSelection"
  component={ENABLE_V11_UI ? MainTabNavigator : ValeriaExerciseSelectionScreen}
/>
```

Una sola línea. El flujo clásico queda intacto y alcanzable hasta el Sprint 4.

**Constante en módulo, no estado global**: el árbol de navegación no debe
reconstruirse en caliente. Cambiar de UI a mitad de sesión desmontaría el player
y perdería la sesión en curso. Se cambia el valor y se recarga.

---

## 5. Sprints

### Sprint 1 · Tokens y tarjeta del grid
*Sin tocar ninguna pantalla existente.*

- **1.1** `src/valeriaTheme.ts`: **añadir** `V.space` (escala de 4) y `V.type`
  (4 pesos, 5 tamaños). Aditivo — ni una clave existente se modifica ni se borra,
  para que las 30 pantallas actuales sigan compilando igual.
- **1.2** `src/ValeriaBlockTile.tsx` (nuevo): tarjeta cuadrada del grid.
  Icono + título + badge opcional. Muelle de presión con `Animated` nativo.
  `minHeight: 120` y área táctil ≥48 dp.
- **1.3** Pantalla de laboratorio temporal para verlo aislado en iOS y Android.
- **QA:** `npm run typecheck` limpio. La app actual, sin cambios visibles.

**Riesgo: bajo.** Nada de esto está enganchado todavía.

### Sprint 2 · Esqueleto de navegación
*El flag sigue en `false`. La app en producción no cambia.*

- **2.1** `npm i @react-navigation/bottom-tabs@^6` — JS puro sobre
  `react-native-screens`, ya instalado. **Sin rebuild nativo.**
- **2.2** `src/MainTabNavigator.tsx` (nuevo): 3 pestañas. Ruta interna
  `ExerciseSelection` conservada (§3.2).
- **2.3** `src/valeriaFeatureFlags.ts` + la línea de conmutación (§4).
- **2.4** Placeholders para las tres pestañas.
- **QA:** con el flag a mano en `true`, confirmar que `noteScreen` sigue
  recibiendo nombres de ruta correctos y que el `ValeriaSUSModal` pinta sobre la
  barra de pestañas.

**Riesgo: bajo.** Todo detrás del flag.

### Sprint 3 · Ensamblaje
*Aquí se mueve el contenido de verdad.*

- **3.1** `src/ValeriaHubV11Screen.tsx`: grid 2 columnas con `FlatList`
  (`numColumns={2}`). Reutiliza `AR_ON` fuera del componente (§3.4).
- **3.2** `src/ValeriaBlockListScreen.tsx`: la vista `view === 'list'` extraída
  **tal cual**, como ruta con param `{ block }`. Se copia la lógica de
  `:394-514` sin reescribirla — bandas de edad, `refCard`, sesión completa,
  switches y PIN incluidos. **Cierra el bug de §1.4.**
- **3.3** `src/ValeriaSettingsScreen.tsx`: recibe recordatorios (`:315-353`),
  `<VoiceQualityCard />` y acceso profesional (`:362-370`), **movidos sin
  reescribir su lógica**.
- **3.4** Reubicar los `sub` al `refCard` de cada bloque (§2.3). Solo cambia
  *dónde se renderiza* la clave i18n, no la clave.
- **3.5** *(hallazgo del Sprint 2)* El «‹ Volver» de `ValeriaAcademyScreen.tsx:74`
  llama a `navigation.goBack()`. Dentro de una pestaña eso ya no significa lo
  mismo: con `backBehavior: 'firstRoute'` devuelve a la pestaña Terapias, y si
  Academy fuera la ruta inicial burbujearía al stack y saldría de
  `ExerciseSelection` entera. Una pestaña no lleva botón «atrás»: **ocultar la
  píldora cuando el screen se monta bajo las pestañas**, sin borrarla (el stack
  clásico sigue usándola mientras el flag esté en `false`).
- **QA:** prescribir → guardar → practicar, en los 4 bloques. Verificar
  AsyncStorage: las 4 claves de prescripción escriben igual que antes.

**Riesgo: medio.** Es el sprint que mueve estado. Mitigación: mover código, no
reescribirlo. El diff debe leerse como un corta-pega, no como una versión nueva.

### Sprint 4 · Cierre clínico y lanzamiento

- **4.1** A11y: `accessibilityLabel` en cada tile del grid — obligatorio, porque
  el grid **quita texto visible** y el lector de pantalla es ahora la única vía
  para la descripción. Las claves `*A11y` ya existen en i18n: se reutilizan.
- **4.2** Verificar 48×48 dp / 44×44 pt en tiles y pestañas.
- **4.3** Telemetría: confirmar que los misclicks se siguen registrando y anotar
  la fecha de corte de la línea base (§3.1).
- **4.4** Decidir háptica: `expo-haptics` si hay rebuild, `Vibration` si no (§0.2).
- **4.5** Sesión con 3–5 testers del piloto original, **los mismos que reportaron
  el problema**. Métrica de éxito abajo.
- **4.6** Flag a `true` → tanda de validación → retirar el flag y
  `ValeriaExerciseSelectionScreen.tsx`.

**El borrado del screen antiguo es el último paso, no el primero.**

---

## 6. Criterio de éxito

No «se ve mejor». Esto:

| Métrica | Hoy | Objetivo | Cómo se mide |
| --- | --- | --- | --- |
| Scroll del hub | ~1.490 px | <750 px | Altura del `contentContainer` |
| Prosa en el hub | 718 car. | 0 | Recuento de `sub` renderizados |
| Toques hub → ejercicio | 3–4 | 2–3 | Recorrido manual |
| Toques hub → ajustes | scroll + 1 | 1 | Recorrido manual |
| Atrás de Android en lista | **roto** | correcto | QA manual |
| Tiempo en `ExerciseSelection` | línea base | ↓ | `telemetry.screens` |
| SUS | línea base | ≥ base | `ValeriaSUSModal` |

La telemetría **ya mide** casi todo esto sin instrumentación nueva. Si el SUS
baja tras activar el flag, el flag vuelve a `false` sin desplegar nada.

---

## 7. Fuera de alcance (explícito)

- Reanimated, blur, gradientes, modo oscuro.
- Rediseño del `ExercisePlayerScreen` — 1.819 líneas, pantalla del niño,
  máximo riesgo clínico. **Merece su propio plan, después de v11.**
- Cualquier recomendación automática de bloques (§3.5).
- Tocar `MinimalPairs`, `SemanticExpansion`, `ArLauncher` o `LingTest`.
- Cambios en `voice-corpus.json` o en los manifiestos de voz.

---

## 8. Resumen de ficheros

**Nuevos (6):** `valeriaFeatureFlags.ts` · `ValeriaBlockTile.tsx` ·
`MainTabNavigator.tsx` · `ValeriaHubV11Screen.tsx` ·
`ValeriaBlockListScreen.tsx` · `ValeriaSettingsScreen.tsx`

**Modificados (2):** `valeriaTheme.ts` *(solo adiciones)* ·
`AppNavigator.tsx` *(una línea)*

**Eliminado en Sprint 4.6:** `ValeriaExerciseSelectionScreen.tsx`

**Intactos:** el player, los 4 bloques de ejercicio, el motor de voz, el ASR, el
puente de RA, la telemetría, el SUS, Firebase, i18n *(ninguna clave borrada)*.

---

## 9. Dependencia nueva: una

```json
"@react-navigation/bottom-tabs": "^6.6.1"
```

JS puro sobre `react-native-screens`, ya presente. **Sin `expo prebuild`, sin
rebuild del dev client, sin tocar los binarios EAS.** Ese es el listón que este
plan se ha puesto: una dependencia, cero superficie nativa nueva.
