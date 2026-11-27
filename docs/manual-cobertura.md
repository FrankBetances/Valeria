# Cobertura del manual de uso (`docs/manual-casos-de-uso.html`)

Inventario completo de pantallas registradas en [`src/AppNavigator.tsx`](../src/AppNavigator.tsx), [`src/MainTabNavigator.tsx`](../src/MainTabNavigator.tsx) y modales/envoltorios globales de arranque y ajustes, mapeado al capítulo correspondiente del manual y a su captura en `docs/screenshots/`.

## Rutas de navegación (`Stack.Navigator` y `Tab.Navigator`)

| Ruta / Componente | Pantalla | Capítulo en el manual | Captura(s) |
| --- | --- | --- | --- |
| `Welcome` | `ValeriaWelcomeScreen` | Cap. 2 · Los primeros quince minutos | `01-bienvenida.png` |
| `Credits` | `ValeriaCreditsScreen` | Cap. 2 · Los primeros quince minutos | `02-creditos.png` |
| `LuaInfo` | `ValeriaLuaInfoScreen` | Cap. 1 · Lúa y Cap. 3 · Premios | `25-premios.png` (colección y ficha de Lúa) |
| `PatientSelect` | `ValeriaPatientSelectScreen` | Cap. 3 · Volver a un perfil ya registrado | `16-pacientes.png` |
| `FichaRegistro` | `ValeriaFichaScreen` | Cap. 2 · Crear el perfil del niño / Cap. 5 · Copiar o trasladar ficha | `03-ficha-registro.png`, `04-ficha-guardada.png` |
| `ExerciseSelection` → `AcademyTab` | `AcademyHubScreen` | Cap. 2 · Empezar por Academy y Cap. 3 | `27-academy-hub.png` |
| `ExerciseSelection` → `TerapiasTab` | `ValeriaHubScreen` | Cap. 2 · Primera sesión y Cap. 3 | `05-hub-bloques.png`, `lua-antojo.png`, `lua-caricia.png` |
| `ExerciseSelection` → `AjustesTab` | `ValeriaSettingsScreen` | Cap. 2, 5, 5b y 6 · Ajustes, voz, recordatorios y acceso profesional | `24-ajustes.png`, `22-voz-variedad.png` |
| `BlockList` | `ValeriaBlockListScreen` | Cap. 4 y Cap. 5 · Prescripción por bloque | `13-audicion-lista.png` |
| `LingTest` | `ValeriaLingTestScreen` | Cap. 3 · Comprobar el audífono antes de empezar | `14-ling-pregunta.png`, `15-ling-test.png` |
| `ExercisePlayer` | `ValeriaExercisePlayerScreen` | Cap. 3 · Hacer una sesión de ejercicios | `17-ejercicio.png`, `18-evaluacion-ept3.png`, `19-sesion-completada.png` |
| `MinimalPairs` | `ValeriaMinimalPairsScreen` | Cap. 4 · Pares Mínimos y Cap. 5 · Panel del Adulto | `06-pares-banco.png`, `07-pin-profesional.png`, `08-pares-juego.png`, `09-pares-veredicto.png`, `23-panel-adulto.png`, `71-voz-cuidador.png` |
| `SemanticExpansion` | `ValeriaSemanticExpansionScreen` | Cap. 4 · Expansión Semántica | `10-expansion-escenarios.png`, `11-expansion-progresion.png`, `12-expansion-juego.png` |
| `ArLauncher` | `ValeriaArLauncherScreen` | Cap. 4 · Realidad Aumentada / Acompaña a Lúa | `50-ra-catalogo.png` |
| `Academy` | `AcademyDomainScreen` | Cap. 2 y Cap. 4 · Academy | `28-academy-capsulas.png`, `29-academy-lector.png`, `30-academy-quiz.png`, `38-brujula-intro.png`, `39-brujula-etapa.png`, `60-academy-oido.png` |
| `SensoryBlockList` | `ValeriaSensoryListScreen` | Cap. 4 · Integración Sensorial | `31-sensorial-lista.png` |
| `SensoryExercise` | `ValeriaSensoryExerciseScreen` | Cap. 4 · Integración Sensorial | `32-sensorial-preparacion.png` – `37-sensorial-completada.png` |
| `Writing` | `ValeriaWritingExerciseScreen` | Cap. 4 · La Pizarra Mágica | `40-pizarra-magica.png`, `40b-pizarra-lazo.png`, `40-ancla-visual-sugerencia.png`, `41-ancla-visual-en-curso.png` |
| `Results` | `ValeriaResultsScreen` | Cap. 3 · Ver cómo va | `20-resultados.png`, `21-resultados-fonema.png` |
| `FollowUp` | `ValeriaFollowUpScreen` | Cap. 5b · Seguimiento entre consultas | `63-seguimiento-resumen.png`, `65-seguimiento-otros-centros.png`, `66-seguimiento-profesional.png`, `67-seguimiento-frecuencia-pro.png`, `68-seguimiento-pin-propio.png`, `69-seguimiento-vinculo-pauta2.png` |
| `AventurasLuaHub` | `AventurasLua/Screens/LuaHubScreen` | Cap. 2 y Cap. 4 · Aventuras con Lúa | `42-aventuras-lua-hub.png` |
| `LuaAssessmentPlayer` | `AventurasLua/Screens/LuaAssessmentScreen` | Cap. 4 · Aventuras con Lúa | `43-aventuras-lua-ficha.png`, `44-aventuras-lua-registro-adulto.png` |
| `LuaStoryViewer` | `AventurasLua/Screens/LuaStoryScreen` | Cap. 4 · Aventuras con Lúa (cuento ilustrado) | `50-aventuras-lua-cuento-ilustrado.png` |
| `LuaSongPlayer` | `AventurasLua/Screens/LuaSongScreen` | Cap. 4 · Aventuras con Lúa (canción) | `62-aventuras-cancion.png` |
| `LuaGamePlayer` | `AventurasLua/Screens/LuaGameScreen` | Cap. 4 · Aventuras con Lúa (minijuegos) | `45-aventuras-lua-memorama.png`, `47-aventuras-lua-frutas-de-mi-isla.png`, `48-aventuras-lua-palabra-secreta.png` |
| `SteamWorlds` | `ValeriaSteamWorldsScreen` | Cap. 4 · Mundos STEAM | `50-ra-catalogo.png`, `52-ra-set-sin-arcore.png` |
| `SteamWorld` | `ValeriaSteamWorldScreen` | Cap. 4 · Escenarios STEAM | `51-ra-set-mesa.png`, `54-ra-modelo-S1-paso1.png` |
| `SteamChallenge` | `ValeriaSteamChallengeScreen` | Cap. 4 · Retos STEAM | `54-ra-modelo-S1-paso3.png`, `54-ra-modelo-S3-paso3.png` |
| `SteamLuaSolo` | `ValeriaSteamLuaSoloScreen` | Cap. 4 · Acompaña a Lúa | `52-ra-set-sin-arcore.png` |
| `ArCatalog` | `ValeriaArCatalogScreen` | Cap. 4 · Realidad Aumentada | `50-ra-catalogo.png` |
| `ArActivity` | `ValeriaArActivityScreen` | Cap. 4 · Realidad Aumentada con cámara | `53-ra-lua-mesa.png` (*Pantalla nativa: captura pendiente de aparato* para la detección facial en vivo) |

## Envoltorios globales, modales y flujos exclusivos de Android

| Componente / Flujo | Capítulo en el manual | Captura / Estado |
| --- | --- | --- |
| `ValeriaAdultGateScreen` + Play Age Signals API | Cap. 7 · Verificación de edad y acceso de adulto | *Pantalla nativa: captura pendiente de aparato* (disparado solo cuando Google Play indica supervisión/aprobación en Android) |
| `ValeriaErrorBoundary` | Cap. 8 · Si algo va mal | `72-error-boundary.png` |
| `ValeriaVoiceAuditModal` | Cap. 6 · Revisar o reportar una locución | `70-auditoria-voz.png` |
| `ValeriaCaregiverVoiceCard` («Voz de la app / Voz de casa») | Cap. 4 y Cap. 6 · Grabación del cuidador en casa | `71-voz-cuidador.png` (*la grabación por micrófono en dispositivo físico se indica como captura pendiente de aparato*) |
| Escáner QR nativo (`CameraView`) para `VALERIA-VINCULO1`, `VALERIA-NOTA2` y `VALERIA-PAUTA2` | Cap. 5b · Seguimiento entre consultas | *Pantalla nativa: captura pendiente de aparato* |
| Recordatorios locales vinculados a la pauta (`expo-notifications`) | Cap. 3 · Poner recordatorios | *Notificación del sistema Android: captura pendiente de aparato* |
