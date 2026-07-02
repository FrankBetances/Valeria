# Valeria+

App móvil (Expo / React Native) para sesiones de terapia auditivo-verbal: registro de pacientes, test de Ling, selección y reproducción de ejercicios, y panel de resultados.

## Flujo de pantallas

```
Welcome → Credits → (PatientSelect ó FichaRegistro) → ExerciseSelection
        → LingTest → ExercisePlayer → Results
```

## Novedades V4

- **PIN profesional corregido**: la validación SHA-256 ahora funciona también en Hermes (Android), donde no existe `crypto.subtle`. PIN de demostración: `1985`.
- **Fichas ilustradas**: los ejercicios muestran imágenes emoji grandes y coloridas; **toca cualquier imagen para ampliarla** a pantalla completa.
- **Escala EPT-3**: valoración unificada de tres niveles (1★ / 2★ / 3★) en todos los ejercicios.
- **Juego con movimiento**: cada ejercicio incluye una "versión en movimiento" y entre ejercicios aparecen **pausas activas** (saltos de rana, paso robot, equilibrio de flamenco…).
- **Recordatorios horarios**: notificaciones locales en la pantalla de bloqueo cada hora (9:00–20:00), activables desde la pantalla de prescripción (`expo-notifications`).
- **Gamificación estilo Duolingo**: XP, racha diaria 🔥, niveles con nombre (Osezno → Oso Legendario) e insignias desbloqueables, visibles al terminar la sesión y en el panel de resultados.

## Desarrollo

```bash
npm install
npm start        # expo start
npm run android  # expo start --android
npm run ios      # expo start --ios
npm run web      # expo start --web
npm run typecheck
```
