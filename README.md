# Valeria+

App móvil (Expo / React Native) para sesiones de terapia auditivo-verbal: registro de pacientes, test de Ling, selección y reproducción de ejercicios, y panel de resultados.

## Flujo de pantallas

```
Welcome → Credits → (PatientSelect ó FichaRegistro) → ExerciseSelection
        → LingTest → ExercisePlayer → Results
```

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
- **Manual de usuario con casos de uso y capturas de pantalla**: [`docs/manual-casos-de-uso.html`](docs/manual-casos-de-uso.html) · [PDF](docs/Valeria-Manual-Casos-de-Uso.pdf) · [Word](docs/Valeria-Manual-Casos-de-Uso.docx). Incluye 10 casos de uso paso a paso ilustrados con 16 capturas reales de la app (en `docs/screenshots/`).
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
