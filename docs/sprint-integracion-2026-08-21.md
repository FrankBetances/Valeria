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

### 1.4. Integración Sensorial Auditiva (Módulo 8)
- **Marco Clínico (SaMD Clase I):** Aborda alteraciones del procesamiento sensorial central (hiperreactividad acústica / SOR, fallo en segregación figura-fondo y sobrecarga multisensorial) mediante desensibilización sistemática jerárquica, contracondicionamiento apetitivo y anticipación visual estricta.
- **Catálogo de Estímulos (`SENSORY_TRIGGERS`):** 8 disparadores cotidianos (`vacuum`, `blender`, `hairdryer`, `hand_dryer`, `thunder`, `siren`, `fireworks`, `school_bell`) con pictogramas 24×24, claves de audio y estrategias TPR de calma motora en 5 variedades lingüísticas (es, gl, eu, es-DO, en-US).
- **Catálogo de Actividades (`AUDITORY_INTEGRATION_ACTIVITIES`):** 6 actividades planificadas (`ISA-01` a `ISA-06`).
- **Player Piloto (`ISA-01` "Mi sonido, mi botón"):**
  - **Muro de control adulto:** Selección obligatoria de intensidad relativa (niveles 1 a 5, sin dB no calibrados), duración dosificada (micro 3s, corta 7s, media 15s), agencia y criterio de parada.
  - **Anticipación visual:** Cuenta atrás (3.. 2.. 1..) que neutraliza errores de predicción (`HIPPEA`).
  - **Lúa quieta y silenciosa:** Durante la reproducción sonora, Lúa se mantiene estática y muda (`SENSORY_EXPOSURE`), evitando estímulos competitivos.
  - **Pausa segura y no punitiva:** Pausar o parar en cualquier momento no resta XP ni se cataloga como fallo.
  - **Silo propio de progreso:** Persistencia cifrada en reposo (`@valeria_sensory`, `@valeria_sensory_sessions`) en `sensoryStore.ts` con llamada diferida (`InteractionManager`).
  - **Tarjeta en el Hub:** 8ª tarjeta de la cuadrícula en `ValeriaHubV11Screen.tsx` con acento turquesa suave y rutas en `AppNavigator.tsx`.

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
