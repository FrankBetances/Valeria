Al instalar el APK en Android, Frank verá: voces neurales sin conexión con encadenado estable y `es_MX-claude-high` para dominicano; perfiles, seguimiento, notas y copias `.valeria` cifrados con `XChaCha20-Poly1305` sin PIN maestro y vínculo QR entre aparatos (`VALERIA-VINCULO1`, `VALERIA-NOTA2`, `VALERIA-LEIDO2`, `VALERIA-PAUTA2`); adherencia real registrada en las 12 áreas y recuperación de fallos con Lúa (`ValeriaErrorBoundary`); comprobación de Play Age Signals en memoria al arrancar (`ValeriaAdultGateScreen`); grabador local `Voz de casa`, recordatorios vinculados a pauta, auditoría del banco de voz en Ajustes e informe de consulta HTML; y el manual de uso v16 regenerado en HTML, PDF y DOCX — **todo ello no visto en Android** desde esta VM Linux.

# Entrega de mejoras Valeria+ · Noviembre 2026

- **Rama:** `antigravity/mejoras-2026-11-27`
- **Workflow CI Android final (`workflow_dispatch`):** Run ID [`45986954664`](https://github.com/FrankBetances/Valeria/actions/runs/45986954664) (no consultado tras el disparo; tamaño final de APK/AAB y duración disponibles al completarse el run en GitHub Actions).
- **Workflow de síntesis de voz (`voice-assets.yml`):** Run ID `45971991756` (no consultado tras el disparo).

## 1. Estado por paquete (P1–P8)

| Paquete | Commit | Estado | Evidencia en Linux VM | No comprobado en esta VM |
| --- | --- | --- | --- | --- |
| **P1 · Voz estable** | `5d16c61` | Hecho en código | Gates P1, `typecheck`, `check-frank-errors.js`, capturas web P1 | Audio real por altavoz Android y TTS de sistema |
| **P2 · Audio pregenerado estable** | `169f166` (CI `dc9fa17`) | Parcial (dependiente de CI de voz) | `generate-voice-assets.py` + `check-voice-assets-quality.js` + `voice-assets.yml` actualizados; workflow `45971991756` lanzado | El commit automático de CI `dc9fa17` eliminó `assets/voice/gl_*.m4a` (`1288` faltantes) y dejó `1` asset en `ca`; `check-voice-assets-quality.js` reporta errores en manifiestos previos (`en`/`es`/`eu`/`gl`), por lo que no se conectó aún a `android.yml` |
| **P3 · Cifrado v2, vínculo QR, PIN sin maestro y `.valeria`** | `a37ba9d` | Hecho en código | `check-crypto.js`, `check-pro-pin.js`, `check-note-codes.js`, `typecheck`, capturas web P3 | Escáner QR con cámara física trasera Android y compartición nativa |
| **P4 · Adherencia 12 áreas, Escritura, ErrorBoundary y timers** | `57248c7` | Hecho en código | Todos los gates de código + `typecheck` + captura Playwright de `ValeriaErrorBoundary` (`72-error-boundary.png`) | Reproducción real de audio/háptica en APK Android |
| **P5 · Play Age Signals en memoria y pantalla adulta** | `b1040e0` | Hecho en código | `npx expo prebuild -p android --no-install` verificando módulo `:valeria-age-signals` en `settings.gradle`, `app/build.gradle` y `MainApplication.kt`; JUnit `AgeSignalsEvaluatorTest.kt`; `check-age-signals.js`; `check-data-safety-declaration.js` | Respuesta real del servicio Google Play Age Signals y flujo con cuenta de pruebas (*License Tester*) en dispositivo Android físico |
| **P6 · Auditoría de voz, recordatorios por pauta, PAUTA2, Voz de casa e informe HTML** | `9788b96` | Hecho en código | `check-p6.js`, `check-no-background-audio.js`, `check-ui-strings.js`, `typecheck`, capturas web `69`/`70`/`71` | Grabación con micrófono físico en Android (`Voz de casa`), notificación local Android real y compartición real del HTML desde Android |
| **P7 · Manual regenerado, capturas, cobertura y README** | `fab5de9` | Hecho en código | `docs/manual-cobertura.md`, `docs/manual-casos-de-uso.html` (v16), PDF (`5.6 MB`) y DOCX (`5.7 MB` · 46 figuras) generados; capturas web P3–P6 + check `320 px` sin desbordamiento; `typecheck` y `check-frank-errors.js` en verde | Capturas nativas pendientes de dispositivo físico Android (`ArActivity` en vivo, escáner QR con cámara, Play Age Signals y `ValeriaAdultGateScreen`, grabador de micrófono y notificación del sistema) |
| **P8 · Cierre y entrega** | Este commit | Hecho | Informe completo, gates finales y despacho `android.yml` (`45986954664`) | Compilación APK/AAB en curso remoto en CI |

## 2. Resoluciones autónomas (D1–D4 y formatos)

- **D1 (`es-DO`):** Se ha configurado la síntesis neuronal `es_MX-claude-high` para la variedad dominicana y se despachó `voice-assets.yml` (`45971991756`) en `antigravity/mejoras-2026-11-27`.
- **D2 (Qué se oye en Escritura):** Se ha mantenido el comportamiento actual (`speakWordSlow(currentExercise.phoneme)` en [`src/ValeriaWritingExerciseScreen.tsx`](../src/ValeriaWritingExerciseScreen.tsx)), sin alterar el banco de [`src/valeriaWritingBank.ts`](../src/valeriaWritingBank.ts). Listado de los 18 valores locutados hoy y propuesta para futura revisión:

| # | `phoneme` actual | Propuesta futura de locución natural |
| --- | --- | --- |
| 1 | `b` | «Letra b, de barco» (o fonema /b/ alargado) |
| 2 | `d` | «Letra d, de dado» |
| 3 | `p` | «Letra p, de pato» |
| 4 | `q` | «Letra q, de queso» |
| 5 | `m` | «Letra m, de mano» |
| 6 | `n` | «Letra n, de nube» |
| 7 | `u` | «Vocal u, de uva» |
| 8 | `a` | «Vocal a, de árbol» |
| 9 | `e` | «Vocal e, de estrella» |
| 10 | `s` | «Letra s, de sol» |
| 11 | `z` | «Letra z, de zapato» |
| 12 | `g` | «Letra g, de gato» |
| 13 | `olas` | «Traza las olas suaves» |
| 14 | `bucles` | «Traza los bucles» |
| 15 | `montañas` | «Sube y baja las montañas» |
| 16 | `puentes` | «Traza los puentes» |
| 17 | `caracol` | «Dibuja la espiral del caracol» |
| 18 | `ocho` | «Traza el ocho sin levantar el dedo» |

- **D3 (Textos legales):** Se redactaron de forma provisional los apartados de Play Age Signals (tratamiento exclusivamente en memoria) y **Voz de casa** (grabación local en primer plano cifrada y borrado al retirar el permiso) en [`site/privacidad.html`](../site/privacidad.html), [`site/privacy.html`](../site/privacy.html) y [`docs/play-console-seguridad-datos.md`](play-console-seguridad-datos.md), marcados explícitamente **`pendiente de revisión legal`**.
- **D4 (Países de distribución en Play):** No se modificó ningún archivo de código; la selección de países se mantiene en Play Console fuera del repositorio.
- **Informe HTML de consulta vs. PDF:** Implementado en [`buildConsultationReportHtml`](../src/valeriaFollowUp.ts) y [`ValeriaFollowUpScreen.tsx`](../src/ValeriaFollowUpScreen.tsx) como HTML autocontenido con escape completo y filtro de notas familiares por defecto apagado, evitando añadir `expo-print` fuera de la tabla de dependencias aprobadas (§0.3).

## 3. Verificación y puertas de CI

En la última ejecución previa al commit en esta VM (`npm ci`, `npm run typecheck`, `node scripts/check-frank-errors.js` y todos los gates de `.github/workflows/android.yml`):
- **En verde:** `npm run typecheck`, `check-frank-errors.js` (R24–R30), `check-crypto.js`, `check-pro-pin.js`, `check-note-codes.js`, `check-age-signals.js`, `check-p6.js`, `check-no-background-audio.js`, `check-data-safety-declaration.js`, `check-ui-strings.js`, `check-ui-lang-fallback.js`, `check-legal-urls.js --offline`, `check-startup-native-calls.js`, `check-speech-prosody.js`, `check-voice-chaining.js`, `check-voice-locale-sync.js`, `check-writing-bank.js`, y el resto de gates estructurales.
- **Fallos conocidos no resueltos en local por depender del banco generado en CI (`dc9fa17`):**
  1. `node scripts/check-voice-corpus-coverage.js`: faltan `1288` ficheros `assets/voice/gl_*.m4a` eliminados en `dc9fa17` y `1` fichero en `ca`.
  2. `node scripts/check-regulatory-vocabulary.js`: reporta 4 términos en `gl` (`src/AventurasLua/Catalog/gl/luaAssessmentGl.ts:238`, `src/valeriaExerciseGl.ts:204,316,386`) porque la exención de bancos pregrabados de `gl` depende de la presencia de `assets/voice/gl_*.m4a`.
  3. `node scripts/check-voice-assets-quality.js`: detecta audios previos con `normType!="linear"`, dispersión > 1.5 LU en `en`/`eu` y campos faltantes en `voice-assets-manifest.gl.json`. Por no estar en verde con los manifiestos actuales de CI, este script queda en el repo sin haberse enlazado como gate bloqueante en `.github/workflows/android.yml`.

## 4. Observaciones fuera del alcance del plan (sin tocar)

1. Regenerar en CI (`voice-assets.yml`) los bancos completos de `gl`, `ca` y alinear la normalización lineal (`paramsHash` único por idioma) antes de integrar `check-voice-assets-quality.js` en `android.yml` y fusionar a `main`.
2. Completar las capturas nativas reales en un dispositivo Android físico (visor en vivo de RA, escáner QR trasero, prompt/flujo de Play Age Signals con cuenta de pruebas, grabación con micrófono físico en **Voz de casa** y notificación del sistema vinculada a pauta).
3. Revisión legal formal de los bloques marcados **`pendiente de revisión legal`** en `site/privacidad.html`, `site/privacy.html` y actualización manual del cuestionario Data Safety y lista de países en Google Play Console.
4. `docs/capture-screenshots.js` detiene el flujo legado tras el paso 09 al haber cambiado la etiqueta accesible de los escenarios de Vocabulario; las capturas actualizadas de P3–P7 y la verificación a `320 px` se obtuvieron sobre el export web de `dist/` con recorrido directo a Ajustes, Seguimiento, Auditoría de voz y Pares Mínimos.
