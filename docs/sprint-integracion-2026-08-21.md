# Documento de Decisiones y Cierre de Sprint: UX, Academy y Módulo Sensorial

**Valeria+ · 21 de agosto de 2026**
**Rama de trabajo:** `brujula`

---

## 1. Resumen de Entregables Completados

### 1.1. Idioma Castellano por Defecto en Instalación Nueva (`valeriaUiLang.ts`)
- **Decisión:** `DEFAULT_UI_LANG: UiLang = 'es'` fijado como fallback canónico.
- **Mecanismo:** La función `resolveInitialUiLang(value: unknown)` valida el valor persistido mediante type guard (`isUiLang`). Si el valor es inválido, nulo o corrupto, resuelve inmediatamente a `'es'`.
- **Desacoplamiento:** La variedad terapéutica (`Locale` en `valeriaLocale.ts`) y el idioma de interfaz (`UiLang` en `valeriaUiLang.ts`) se mantienen como dos ejes independientes. La preferencia manual del adulto se persiste en `@valeria_ui_lang` y `@valeria_ui_lang_explicit`.

### 1.2. Corrección de la Barra de Navegación Inferior (`MainTabNavigator.tsx`)
- **Tokens de estilo centralizados:**
  - `backgroundColor: '#F8F9FA'`
  - `borderTopWidth: 1`, `borderTopColor: '#E0E0E0'`
  - `elevation: 0`, `shadowOpacity: 0`
  - `height: 60`, `paddingBottom: 8`, `paddingTop: 6`
  - `tabBarActiveTintColor: '#00c4be'` (Turquesa de marca)
  - `tabBarInactiveTintColor: '#757575'` (Gris neutro)
  - `headerShown: false`
- **Contratos:** Se preservaron los nombres de ruta técnicos (`ExerciseSelection`, `Academy`, `Settings`) para no romper la serie histórica de telemetría (`noteScreen`).

### 1.3. Módulo Brújula en Academy (`ASHA_MILESTONES_01`)
- **Contenido e Integración:**
  - Archivo `src/ValeriaAcademy/capsulas/valeriaAcademyAsha.ts` registrado en `academyContent.ts` y `academyContent.en.ts`.
  - Pertenece al silo de `lenguaje` con inyección directa de XP (30 XP).
  - 6 pantallas estructuradas: Intro ("El mito del ya hablará") + 5 etapas de edad (0-12m, 1-2a, 2-3a, 3-4a, 4-5a) separando explícitamente Lenguaje Receptivo y Lenguaje Expresivo.
  - *Disclaimer* clínico siempre visible: SaMD Clase I (guía psicoeducativa de referencia ASHA, no diagnóstica).
  - Micro-quiz final con feedback razonado e idempotencia de completado en `academyStore`.

### 1.4. Integración Sensorial Auditiva (Módulo 8) y Ambientes Ecológicos Vivos
- **Marco Clínico (SaMD Clase I):** Aborda alteraciones del procesamiento sensorial central (hiperreactividad acústica / SOR, fallo en segregación figura-fondo y sobrecarga multisensorial) mediante desensibilización sistemática jerárquica, contracondicionamiento apetitivo y anticipación visual estricta.
- **Catálogo de Estímulos y Ambientes Vivos (`SENSORY_TRIGGERS`):**
  - **Sonidos aislados:** Aspiradora, licuadora, secador de pelo, secador de manos, tormenta, sirena, fuegos artificiales, timbre escolar.
  - **Ambientes Ecológicos Vivos (Simulación Realista):**
    1. **Aula de colegio (`classroom_ambience`):** Murmullo de niños, movimiento de sillas, risas y eco del aula. Estrategia TPR: *Manos en la mesa y 3 respiraciones guiadas*.
    2. **Centro comercial / Supermercado (`mall_ambience`):** Ruido difuso, carritos de compras rodando, pasos y megafonía suave. Estrategia TPR: *Sostener manos del adulto y foco visual*.
    3. **Calle urbana viva y obras (`street_ambience`):** Tráfico de coches, obreros en construcción, taladros y bullicio de calle. Estrategia TPR: *Abrazo de oso firme o apretar pelota antiestrés*.
- **Catálogo de Actividades (`AUDITORY_INTEGRATION_ACTIVITIES`):**
  - `ISA-01`: Mi sonido, mi botón (Control, agencia y previsibilidad).
  - `ISA-06`: Ambientes vivos cotidianos (Simulación de entornos ecológicos con filtros por categoría).
- **Player Interactivo:**
  - **Selector por Categorías:** Píldoras para filtrar entre *Todos*, *Ambientes vivos*, *Electrodomésticos* y *Alertas*.
  - **Vúmetro de Intensidad Relativa:** 5 niveles con barras visuales progresivas.
  - **Anticipación visual y Lúa silenciosa:** Cuenta atrás y Lúa quieta durante la reproducción sonora sin interferencia acústica.
  - **Pausa segura no punitiva:** Parar en cualquier momento suma XP y propone la estrategia de autorregulación específica del entorno.

---

## 2. Matriz de Verificación y Calidad

| Prueba / Gate | Comando | Resultado |
|---|---|---|
| TypeScript Typecheck | `npm run typecheck` | ✓ Exit code 0 (sin errores) |
| Catálogo de Textos UI | `node scripts/check-ui-strings.js` | ✓ 0 cadenas literales sueltas en TSX |
| Variedades Lingüísticas | `node scripts/check-variety-branches.js` | ✓ Soporte completo ES, GL, EU, DO, EN |
| Guardarraíl Lúa | `node scripts/check-lua-mute.js` | ✓ Lúa muda y sin audio en runtime |
| Protocolo Lúa | `node scripts/check-lua-protocol.js` | ✓ 16 opcodes sincronizados |
| Campos Adulto vs Niño | `node scripts/check-adult-fields.js` | ✓ 5 reglas superadas limpiamente |

---

## 3. Estado de la Rama Git
- Rama: `brujula`
- Cambios preparados y probados localmente.

---

## 4. Addendum del 21/8/2026 (tarde) · lo que faltaba para que el módulo exista

Este documento describía arriba un «Player Interactivo» con «Vúmetro de
Intensidad Relativa» y «Ambientes Ecológicos Vivos». Nada de eso sonaba:
`audioAssetKey` estaba declarado en los once estímulos y no lo consumía nadie,
no había un solo fichero de audio en el repositorio y `SensoryExerciseScreen`
no importaba `expo-audio`. La pantalla rotulaba «Sonido en reproducción» y
«Escuchando…» sobre silencio absoluto. La matriz de la sección 2 tampoco era la
de CI: recogía 6 comprobaciones de las 16 que corre `android.yml`.

Lo cerrado desde entonces:

| Qué faltaba | Qué hay ahora |
| --- | --- |
| Los once estímulos no existían | `scripts/generate-sensory-assets.js` los **sintetiza**: DSP determinista en Node (LCG con semilla por estímulo), mono 16 kHz/16 bit, bucle sin costura, 2,32 MB en total. Ni una grabación de terceros. |
| Nadie reproducía nada | `src/ValeriaSensory/sensoryAudio.ts`: `expo-audio` en carga perezosa, rampas de 280 ms a la entrada y a la salida, nivel 1-5 → ganancia por tabla explícita con techo 0,62. |
| El nivel 1-5 no controlaba nada | Controla la ganancia, y **solo** por gesto del adulto. Mismo muro regulatorio que `valeriaNoise.ts`: aquí no hay medida, ni adaptación, ni sugerencia. |
| Sin salida de audio se mentía | `sensoryAudioSupported()`; si no hay módulo nativo la pantalla lo **dice** («no hay estímulo auditivo: no la uses como exposición real»). |
| Lúa no se enteraba del módulo | `luaSensoryReady/Pause/Close/Idle` en `valeriaLuaSession.ts`. Concesión **solo visual** —nunca `LUA_CAP.SOUND`—, silencio de tramas durante la exposición y `RELAX` en la pausa: el mismo descanso de la regla 20-20-20. Sin opcodes nuevos: el protocolo sigue en la versión 1. |
| Nada vigilaba que sonara | `scripts/check-sensory-assets.js`, en `android.yml`: formato, RMS, headroom, costura del bucle e **identidad espectral** por estímulo. |
| El historial clínico iba en claro | Cifrado con `valeriaCrypto`, y declarado en `site/privacidad.html` y `site/privacy.html`. |
| «6 actividades» con 4 bloqueadas | La tarjeta del hub cuenta las jugables. |
| La tormenta desaparecía al filtrar | La píldora «Alertas y Naturaleza» agrupa las dos categorías. |
| 🔒 como icono | El candado del set propio (`BlockIcon name="lock"`). |
| README y manual sin el bloque | Ambos actualizados: ocho bloques de terapia. |

**Lo que sigue sin verificar, dicho con esas palabras:** que los once WAV suenen
a lo que dicen a un oído humano. El gate mide espectro, no reconocimiento; eso
se decide escuchándolos. Y la reproducción se ha comprobado en Expo **web** —el
navegador pide y recibe el WAV al preparar el estímulo—, no en un APK sobre un
teléfono real.

### 4.1 · Segunda pasada sobre los tres ambientes (mismo día)

Frank escuchó la primera tanda y pidió que los ambientes tuvieran **sonidos
vivos** —obreros trabajando, no solo retumbo—. Tenía razón, y el propio gate lo
decía: el contador de sucesos daba **0** en la calle. Había martillo neumático,
pero enterrado bajo un lecho de tráfico que se comía todo el margen.

Qué hay ahora en cada bucle (10 s en los tres, antes 8):

| Ambiente | Sucesos |
| --- | --- |
| Aula de colegio | Cinco voces infantiles de fondo, la **maestra** hablando por encima dos veces, un niño que llama, tres sillas arrastrando, dos risas de grupo (tres voces con el mismo pulso de 7 Hz), un libro que cae y un lápiz contra la mesa. Reverberación de clase. |
| Centro comercial | Murmullo lejano de doce voces, carritos rodando con una **rueda que chirría** en dos tramos, doce pasos sobre suelo duro, cuatro **pitidos de caja**, megafonía de dos notas y una voz apagada que no se entiende. |
| Calle con obras | Tráfico de fondo, dos coches que pasan, dos rachas de **martillo neumático** (11 golpes/s), cinco **golpes de maza sobre viga** con el metal sonando, una **radial** que baja de tono al morder, el **pitido de marcha atrás** de un camión y dos obreros que se gritan algo. |

Tres cosas nuevas en el pipeline:

1. **Limitador blando** (`soften`) solo en los ambientes. Un ambiente se oye a
   distancia y sus picos no se disparan como un petardo a dos metros; sin él, la
   risa del aula se comía el margen de pico y el fichero entero se quedaba 8 dB
   por debajo del resto. Los impulsivos de verdad —petardos, trueno, timbre— no
   se tocan: su cresta es su identidad.
2. **Contador de sucesos vivos** en el gate: ventanas de 25 ms, lecho en el
   percentil 20, suceso cuando una racha lo supera en más de 9 dB. Los tres
   ambientes tienen que traer **≥ 8 sucesos** y que el mayor sobresalga
   **≥ 12 dB**, o el gate falla. «Ambiente vivo» deja de ser una etiqueta.
3. Las **fichas** de los tres estímulos ahora enumeran lo que de verdad suena
   (maza, radial, marcha atrás, pitidos de caja): es lo que el adulto lee antes
   de decidir la exposición.

Medido ahora: aula **24** sucesos (máx +19,2 dB), centro comercial **16**
(+16,1 dB), calle **39** (+17,6 dB). Antes: 24, 2 y **0**.
