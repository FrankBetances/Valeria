# Valeria+

App móvil (Expo / React Native) para sesiones de terapia auditivo-verbal: registro de pacientes, test de Ling, selección y reproducción de ejercicios, y panel de resultados.

## Flujo de pantallas

```
Welcome → Credits → (PatientSelect ó FichaRegistro) → ExerciseSelection
        → LingTest → ExercisePlayer → Results
                   ↘ MinimalPairs (Pares Mínimos)
                   ↘ SemanticExpansion (Expansión Semántica)
```

## Novedades V6

- **Motor de voz más humano**: la selección prioriza voces neuronales/enhanced (Google neural/WaveNet, iOS Enhanced/Siri) y penaliza los motores metálicos heredados (eloquence, compact, eSpeak, Pico). Añade reintentos con espera creciente cuando el catálogo de Android aún no está listo, prosodia natural (troceo por frases con pausas de respiración, entonación en exclamaciones/preguntas y micro-variación de tono) y bancos de frases rotativas (elogio, casi, no oído, juntos) para no repetir siempre la misma muletilla.
- **Ejercicios con rondas variadas**: cada mini-juego de Audición y Lenguaje rota hasta 3 contenidos distintos (vocales, palabra articulada, vocal faltante, intruso, adivinanzas, plurales, frases S-V-O y emociones) con el botón "🔄 Otra ronda", en vez del ítem fijo que se memorizaba tras jugarlo una vez. Flujo numerado **PASO 1→4** (consigna → juego → movimiento → evaluación), feedback hablado al acertar/fallar y cabecera con el nombre real del paciente.
- **Sesión completa**: botón "🎯 Sesión completa" por pestaña que encadena todos los ejercicios prescritos del bloque en una sola sesión (pasando por el Test de Ling si la ficha indica audífono/implante), en lugar de practicar de uno en uno.
- **Fase de turno visible**: nuevo `TurnPhaseStrip` (Escucha → Repite → Veredicto → Misión) en Pares Mínimos y Expansión Semántica, consignas rotativas y cápsulas de contraste con **dos vueltas evaluadas** (objetivo + opuesta). Más contenido: 5 escenarios, 7 progresiones y 6 cápsulas en Expansión Semántica.
- **Fichas sin imágenes rotas**: pictogramas SVG de alto contraste (`src/ValeriaPictograms.tsx`) para las palabras cuyos emojis Unicode 13/14 se ven como cuadros vacíos en muchos Android (sierra, cubo, cepillo, tobogán) o resultan de bajo contraste (pelo, puente, ocho, cero), con fallback a emoji.
- **Marca con oso pardo animado**: la mascota `BearMark` estrena variante `brown` (rubor y brillo en los ojos) como predeterminada; la bienvenida añade entrada elástica, flotación, salto de alegría y halo pulsante, y los créditos entran escalonados. Iconos y splash regenerados con el oso pardo.
- **Build firmado en CI**: el workflow de GitHub Actions (`.github/workflows/android.yml`) compila en cada push/fusión a `main` el APK y el **AAB firmados** (cuando están configurados los secrets de keystore), derivando el `versionCode` del número de run.

## Novedades V5

- **Expo SDK 54 / React Native 0.81**: todas las librerías actualizadas (incluido `expo-speech` 14, el motor de voz).
- **Voz más natural**: el TTS ya no usa la voz de fábrica; al arrancar busca entre las voces españolas instaladas y elige la de mayor calidad ("enhanced"/neuronal), priorizando las que funcionan sin conexión.
- **PIN profesional en todos los bloques**: Pares Mínimos y Expansión Semántica también tienen prescripción del logopeda (componente compartido `src/ValeriaProPin.tsx`); el Modo Familia solo puede practicar lo prescrito.
- **Instalación más ligera**: ProGuard + shrinkResources en los builds de release y perfil EAS `apk` que empaqueta solo las arquitecturas ARM reales (sin librerías de emulador).

## Novedades V4

- **PIN profesional corregido**: la validación SHA-256 ahora funciona también en Hermes (Android), donde no existe `crypto.subtle`. PIN de demostración: `1985`.
- **Fichas ilustradas**: los ejercicios muestran imágenes emoji grandes y coloridas; **toca cualquier imagen para ampliarla** a pantalla completa.
- **Escala EPT-3**: valoración unificada de tres niveles (1★ / 2★ / 3★) en todos los ejercicios.
- **Juego con movimiento**: cada ejercicio incluye una "versión en movimiento" y entre ejercicios aparecen **pausas activas** (saltos de rana, paso robot, equilibrio de flamenco…).
- **Recordatorios diarios**: notificaciones locales en la pantalla de bloqueo, máximo 4 al día (9:00, 13:00, 17:00 y 20:00), activables desde la pantalla de prescripción (`expo-notifications`).
- **Gamificación estilo Duolingo**: XP, racha diaria 🔥, niveles con nombre (Osezno → Oso Legendario) e insignias desbloqueables, visibles al terminar la sesión y en el panel de resultados.

## Documentación

- **Protocolo de pares mínimos para dislalias fonológicas** (rotacismo, sigmatismo, frontalización velar…): [`docs/protocolo-pares-minimos.md`](docs/protocolo-pares-minimos.md). 10 pares accionables con flujo TTS→STT, lógica de feedback por rama y misiones físicas padre-hijo. **Implementado en la app**: pantalla "Pares Mínimos · Dislalias" (`src/ValeriaMinimalPairsScreen.tsx` + banco de pares en `src/valeriaMinimalPairs.ts`), accesible desde la selección de terapias. Incluye sello doble anti-pasividad (multi-touch padre+niño), rotación de roles, cápsulas TPR, veredicto corregible por el padre y modo juez manual cuando no hay reconocimiento de voz (Expo Go / web).
- **Protocolo de expansión semántica / progresión léxica** (rehabilitación léxica offline para intervención temprana): [`docs/protocolo-expansion-semantica.md`](docs/protocolo-expansion-semantica.md). Une imagen (`visual_prompt`), voz (`tts_string`), reconocimiento con aproximaciones de la edad (`stt_expected_array`) y acción física del adulto (`parent_tpr_action`). **Implementado en la app**: pantalla "Expansión Semántica · Progresión Léxica" (`src/ValeriaSemanticExpansionScreen.tsx` + dataset en `src/valeriaSemanticExpansion.ts`), con tres bloques: **3 escenarios diarios** (mañana, comida, parque), **5 progresiones** que suben de onomatopeya a adjetivo, y **4 cápsulas de contraste** (grande/pequeño, limpio/sucio, abrir/cerrar, subir/bajar).
- **Manual de usuario con casos de uso y capturas de pantalla** (v5): [`docs/manual-casos-de-uso.html`](docs/manual-casos-de-uso.html) · [PDF](docs/Valeria-Manual-Casos-de-Uso.pdf) · [Word](docs/Valeria-Manual-Casos-de-Uso.docx). Incluye 12 casos de uso paso a paso —con los nuevos bloques de **Pares Mínimos** y **Expansión Semántica**, el hub de 4 bloques y la gráfica de sustitución por fonema— ilustrados con 21 capturas reales de la app (en `docs/screenshots/`).
- La versión Word se regenera con `python3 docs/build-docx.py` (requiere `python-docx`).
- Las capturas se regeneran automáticamente con `docs/capture-screenshots.js` (Playwright sobre `expo start --web`).

## Desarrollo

```bash
npm install
npm start        # expo start
npm run android  # expo start --android
npm run ios      # expo start --ios
npm run web      # expo start --web
npm run typecheck
```

## Builds (EAS)

```bash
npx eas build -p android --profile apk         # APK para instalar directo: solo ARM, ProGuard + shrinkResources
npx eas build -p android --profile production  # App Bundle (.aab) para Google Play: descarga mínima por dispositivo
```

El perfil `apk` limita las arquitecturas a `armeabi-v7a` y `arm64-v8a` (los móviles reales), eliminando las librerías x86 de emulador del binario. Para publicar en Google Play usa siempre el App Bundle: Play genera un APK optimizado por dispositivo y la descarga es bastante menor.

### Build automático (GitHub Actions)

El workflow [`.github/workflows/android.yml`](.github/workflows/android.yml) compila la app en cada push/fusión a `main` (y en ramas `claude/**`). Con los secrets de firma configurados (`ANDROID_RELEASE_KEYSTORE_BASE64`, `ANDROID_RELEASE_STORE_PASSWORD`, `ANDROID_RELEASE_KEY_ALIAS`, `ANDROID_RELEASE_KEY_PASSWORD`) genera el APK y el AAB **firmados**; sin secrets solo compila el APK. El `versionCode` se deriva del número de run para no repetirse entre builds.
