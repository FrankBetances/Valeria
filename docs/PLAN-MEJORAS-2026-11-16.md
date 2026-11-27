# Plan de mejoras tras la revisión de código (16/11/2026), para que lo ejecute Sonnet

> **Sustituido el 27/11/2026 por [`PLAN-ANTIGRAVITY-2026-11-27.md`](PLAN-ANTIGRAVITY-2026-11-27.md)**, que incluye estas tres fases. Este fichero queda como histórico.

**Primera línea (S1):** revisión **estática**. No se han corrido typecheck ni gates porque en el entorno no
había `node_modules`. Nada de esto se ha visto en Android.

## Resumen (F6: 10 líneas)

1. P0: el PIN maestro aparece en claro en el código («1985», `src/ValeriaProPin.tsx:68`) y no hay límite de intentos.
2. P0: el cifrado de la telemetría reutiliza el keystream en cada escritura y guarda la clave junto a los datos.
3. P0: la ficha del menor (PII) se guarda **en claro** en AsyncStorage.
4. P1: no hay ErrorBoundary. Si una pantalla falla en mitad de una sesión con el niño, queda en blanco.
5. P1: hay 63 `setTimeout/setInterval` frente a 36 `clear*`. Pueden quedar temporizadores vivos al salir de una pantalla.
6. P1: 76 `any` en `src/`, varios en almacenamiento y en el puente de RA.
7. P2: ficheros de más de 1 400 líneas (`ValeriaExercisePlayerScreen.tsx`, con 2 035) y sin tests unitarios de la lógica crítica.
8. Bien: cero `@ts-ignore`, cero `console.log` y cero `catch {}` vacíos. Sin llamadas de red: los datos no salen del aparato.
9. Antes de empezar, Frank decide D1–D3 (abajo). Sin su «sí», Sonnet hace solo las fases 1 y 3.
10. Entrega: una rama, un commit por fase, gates, `workflow_dispatch` en verde, APK y la frase «no visto en Android».

## Decisiones de Frank antes de empezar

| # | Decisión | Recomendación | Coste |
| --- | --- | --- | --- |
| D1 | (F1) Añadir `expo-secure-store` (nativo) para guardar la clave en Keystore, y `@noble/ciphers` + `@noble/hashes` (JS puro, auditadas, MIT) para AES-GCM | **Sí.** Es la única forma de que el cifrado proteja algo | Build: +1–2 min (estimación, por verificar). `@noble` no añade código nativo |
| D2 | El PIN «1985» ya está en el historial de git para siempre. ¿Se cambia el PIN maestro o se pasa a un PIN por instalación que fija el profesional? | **PIN por instalación** (PBKDF2 con sal), con el maestro solo como recuperación | 1 pantalla nueva para fijar el PIN |
| D3 | ¿Se trocea `ValeriaExercisePlayerScreen.tsx` en hooks? | **No por ahora**, solo después de la fase 3 (tests) | Riesgo de regresión sin aparato |

## Reglas para Sonnet (obligatorias, sacadas de CLAUDE.md)

- Rama `sets` (o la que diga Frank). **Prohibido push hasta terminar todas las fases aprobadas** (regla 4, R5).
- Antes de cada commit: `npm ci`, los gates de `android.yml` (comando de §1b de CLAUDE.md) y `npm run typecheck`.
- Todo texto nuevo de la interfaz va en es/en/ca/gl (y eu si el fichero existe) y pasa `check:ui-strings`. Si el texto se locuta, va con `node scripts/export-voice-corpus.js` en el mismo commit.
- No se toca nada fuera de este plan (0a). La Ficha ya rompió producción el 7/9/2026: se prueba guardar, cargar y migrar antes del commit.
- Al terminar: `workflow_dispatch` sobre la rama, comprobar que se suben `android-aab` y `android-apk`, y dar el número de run. Respuesta final en ≤3 líneas, con «no visto en Android».

## Fase 1 · Seguridad del PIN (no necesita D1; D2 cambia el alcance)

1. `src/ValeriaProPin.tsx:68`: borrar el comentario `// "1985"`.
2. Bloqueo progresivo: tras 5 fallos, 30 s de espera; tras 10, 5 min. El contador se persiste en AsyncStorage para que no se resetee cerrando la app. Mensaje en los 4 idiomas.
3. Si D2 = sí: PIN por instalación con PBKDF2-SHA256 y sal aleatoria de 16 bytes, guardado como `{salt, iter, hash}`. Si no hay PIN fijado, se pide crearlo al primer desbloqueo; el maestro solo vale para restablecerlo.
4. Gate nuevo `scripts/check-pro-pin.js` (añadirlo a `android.yml`): no hay PIN en claro en `src/`, y el bloqueo existe.

**Aceptación:** `grep -rn 1985 src` no devuelve nada; el gate pasa; con 5 fallos aparece la espera.

## Fase 2 · Cifrado en reposo (necesita D1)

Problemas en `src/valeriaCrypto.ts`:
- `keystreamXor` empieza el contador en 0 con la misma clave en cada `encryptJSON`. XOR de dos versiones guardadas = XOR de los dos textos en claro (pad reutilizado).
- La clave está en `@valeria_tlm_key`, en el mismo AsyncStorage. Quien lee los datos lee también la clave.
- La semilla de la clave sale de `Math.random()`.
- No hay autenticación: un blob alterado se descifra a basura sin que se detecte.

Tareas:
1. Formato `v2:` con AES-256-GCM (`@noble/ciphers/aes` `gcm`), nonce aleatorio de 12 bytes por escritura y clave de 32 bytes aleatorios guardada con `expo-secure-store`.
2. `decryptJSON` lee `v1:` (formato actual) y lo reescribe en `v2:` la primera vez. **No se pierde ninguna sesión de telemetría.**
3. Ficha y pacientes: `ValeriaFichaRegistroScreen.tsx:73`, `ValeriaPatientSelectScreen.tsx:60-82` y `STORAGE_KEYS.registro/pacientes` (`src/valeriaTheme.ts:86`) pasan por `encryptJSON/decryptJSON`. Si se lee JSON en claro antiguo, se migra.
4. Política de privacidad (`site/`): cambiar la frase sobre el almacenamiento local, si la hay, para que diga «cifrado en el aparato». **No hace falta tocar Play Console** porque no cambia lo que se recoge.
5. Gate `scripts/check-crypto.js` (Node, sin framework): encrypt→decrypt de ida y vuelta; dos cifrados del mismo objeto dan blobs distintos; un blob alterado devuelve `null`; un `v1:` se migra.

**Aceptación:** el gate pasa; `grep -n "setItem(STORAGE_KEYS.registro" src` solo muestra llamadas con `encryptJSON`.

## Fase 3 · Robustez

1. ErrorBoundary global en `src/AppNavigator.tsx`: pantalla con Lúa (`ValeriaCatPixel`) y el botón «Volver al inicio» (texto en 4 idiomas); registra el evento en `valeriaTelemetry` (nombre de pantalla, sin PII).
2. Temporizadores: revisar cada `setTimeout/setInterval` de `src/**/*.tsx` dentro de componentes. Cada uno se limpia en el retorno de su `useEffect` o con una referencia que se limpia al desmontar. Lista resultante en el commit.
3. `any`: tipar primero `valeriaArBridge.ts`, `valeriaTelemetry.ts` y los stores (`academyStore`, `sensoryStore`, `steam/profiles`). El resto se queda como está.

**Aceptación:** typecheck en verde. En web, forzar un `throw` temporal en una pantalla muestra la pantalla de Lúa; después se quita.

## Fuera de este plan (dicho para que no se haga)

- Lo pendiente de RA (`docs/PENDIENTE-REFACTORIZACION-AR.md`, puntos 2–4) espera decisiones externas: banco D2 y piezas S8–S11.
- Cambios de diseño, de versión de Expo o de librerías distintas de las de D1.
