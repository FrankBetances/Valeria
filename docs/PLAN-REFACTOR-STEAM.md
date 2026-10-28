# Plan de refactorización · Valeria+ con STEAM como eje vertebrador

Estado: propuesta para el equipo · octubre 2026. Ubicación prevista: `docs/PLAN-REFACTOR-STEAM.md`.

Convenciones: **[hecho]** sale de los README de Valeria+, Lúa y Construye con Lúa o de `SETS.md`. **[evidencia]** sale de la documentación oficial o de los artículos citados. **[propuesta]** es diseño nuevo y reversible. **[por verificar]** depende del código real, de un ensayo o de una decisión.

---

## 0. Tesis y alertas previas

La refactorización tiene una idea central: **Valeria+ deja de organizarse por diagnóstico y pasa a organizarse por mundo STEAM**. La RA deja de ser un bloque de seis ejercicios y se convierte en un motor de eventos genérico que ejecuta el contrato de cinco eslabones de Construye con Lúa. Los bloques clínicos actuales no desaparecen: pasan a ser ejes de habilidad que se practican dentro de los mundos y perfiles de adaptación que configura el adulto.

Hay cuatro alertas que condicionan el plan antes de escribir código.

**A1 · Posicionamiento regulatorio [hecho, resuelto el 27-10-2026].** Valeria+ es una **aplicación educativa y no un dispositivo médico**. Bajo el MDR, la finalidad prevista se deduce de todo lo que el fabricante dice del producto (interfaz, ficha de tienda, web, material promocional, presentaciones a inversores), no solo de una frase de descargo. Por eso la decisión obliga a revisar textos en todo el ecosistema, no solo en el README. Las consecuencias están en la sección 7.

**A2 · ARCore no detecta dos copias de la misma imagen [evidencia].** La documentación de ARCore indica que el sistema sigue hasta 20 imágenes a la vez y que no detecta ni sigue simultáneamente varias instancias de la misma imagen. Esto rompe la regla de Construye «un código de pieza = un STL = una malla RA = un marcador»: el Set 1 tiene tres baldosas rectas lisas, tres rugosas y cuatro curvas idénticas. Con imágenes aumentadas de ARCore, solo una de cada tipo sería visible para la app. El mismo problema lo describe TARES (Ongoro *et al.*, IEEE Access 2024) con letras repetidas, que tuvo que resolver fabricando un segundo juego de letras con rasgos distintos. Consecuencia: el marcador debe ser **único por instancia**, no por código de pieza. Esto inclina la decisión D2 hacia marcadores fiduciales con identificador (familia tipo ArUco o AprilTag), que codifican cientos de identificadores distintos sin rediseñar el arte de cada pieza.

**A3 · Techo de 20 imágenes simultáneas [evidencia].** Un Set 1 completo en mesa reúne del orden de 19 marcadores (12 baldosas, 4 fichas, lomo de Lúa, dos placas). Está en el límite de ARCore antes de combinar mundos en el macro-escenario. Refuerza A2.

**A4 · Incoherencia de motor de render [por verificar].** El README de Lúa describe el pipeline de Construye con Lúa como «Blender + JSON + CustomPainter». `CustomPainter` es una API de Flutter; Valeria+ es Expo/React Native. Hay que confirmar qué aplicación renderiza los mundos y si existe una segunda base de código. Si Descubre con Lúa está en Flutter y Valeria+ en React Native, el motor de eventos debe definirse como **contrato de datos compartido** (JSON) y no como librería compartida.

---

## 1. Arquitectura objetivo: tres capas

| Capa | Qué contiene | Quién la ve |
|---|---|---|
| **Mundos** | Set 0 a Set 6 de Construye con Lúa, cada uno con sus retos, eventos, cuento y cápsula de Academy | Familia y profesional: es la puerta de entrada |
| **Ejes de habilidad** | Percepción auditiva, fonología, léxico y semántica, morfosintaxis y narración, interacción y pragmática, regulación, grafomotricidad. Son los objetivos de lenguaje que el adulto elige trabajar dentro de un mundo | Adulto, como filtro y sugerencia |
| **Perfiles de adaptación** | Hipoacusia e implante coclear, TEA, dislexia, dislalias. Ajustan parámetros (silencio, luces, metrónomo, tiempos, CAA), no abren módulos propios. Se eligen a mano: la app nunca deduce un perfil ni lo importa de una prueba clínica | Familia o profesional con PIN |

Regla de diseño [propuesta]: **STEAM vertebra, no coloniza.** Un ejercicio entra en un mundo solo si hay un fenómeno físico real que lo sostenga. Lo que no lo tiene (RAN, rotaciones b/d, la Pizarra Mágica, la Integración Sensorial Auditiva) se queda como **práctica de mesa** enlazada al mundo por vocabulario o por cuento, sin inventar un fenómeno artificial.

---

## 2. Refactorización del módulo de RA

### 2.1 De ejercicios a motor de eventos

Hoy el módulo tiene seis ejercicios (AR-1 a AR-6) definidos por gesto [hecho]. El objetivo es un motor que no sepa nada de baldosas ni de rampas: carga el manifiesto de un mundo y ejecuta su tabla de eventos. Añadir un set nuevo debe ser añadir datos, no código.

| Componente | Responsabilidad |
|---|---|
| `WorldRegistry` | Carga el manifiesto JSON de cada set: piezas, marcadores por instancia, eventos, retos, reacciones y palabras |
| `Detectors` | Un adaptador por método de `SETS.md` §0.1: A marcador, B oclusión, C mano, D cara, E objeto en movimiento, F toque del adulto. Todos emiten observaciones en magnitudes, nunca imágenes |
| `EventStabilizer` | Da por bueno un evento cuando la observación se mantiene unos 10 fotogramas (≈ 0,33 s a 30 fps) [hecho, valor a ajustar] |
| `ChallengeEvaluator` | Compara el evento con el objetivo del reto activo. Para el Set 3, compara con el lanzamiento anterior; para el Set 5, calcula masa × distancia |
| `TurnGate` | Aplica turno verbal frente a turno motor: en turno verbal bloquea animaciones, luces y vibración (D3, pendiente de B3) |
| `ReactionSequencer` | Ordena fenómeno → pausa → Lúa → palabra, y garantiza < 300 ms desde la confirmación hasta el opcode [hecho, valor a ajustar] |
| `LuaLink` | Traduce reacciones a opcodes BLE (`MOOD`, `PICTO`, `CELEBRATE`, `AWARD`, `PHASE`, `RELAX`, `LIGHT`, `HAPTIC`) y respeta la máscara de `GRANT` |
| `WordPrompter` | Voz de la tableta o frase sugerida al adulto, con vocabulario espacial por categoría y por variedad lingüística |
| `RevealLayer` | Capas visibles de RA, solo en fase de ampliación y activadas por el adulto |

Esquema de tipos [propuesta, a contrastar con el código real]:

```ts
type DetectionMethod = 'marker' | 'occlusion' | 'hand' | 'face' | 'tracked_object' | 'adult_tap';

interface Observation {          // solo magnitudes, nunca píxeles
  markerId?: number;             // identificador por instancia (A2)
  angleDeg?: number;
  velocity?: number;
  ratio?: number;                // 0,0–1,0
  tMs: number;
}

interface WorldEvent {
  id: `S${number}.${string}`;    // p. ej. 'S1.LUA_GIRA'
  method: DetectionMethod[];     // siempre incluye 'adult_tap'
  turn: 'motor' | 'verbal';
  reaction: { lua: Opcode[]; light?: LightPattern; haptic?: HapticPattern };
  word: { tts?: LocalizedText; adultHint?: LocalizedText };
}
```

El validador del manifiesto rechaza cualquier evento sin `adult_tap`, cualquier luz o vibración en turno verbal y cualquier reacción asociada a error. Así las reglas de `SETS.md` §0.5 y del contrato quedan aplicadas por máquina, no por disciplina del desarrollador.

### 2.2 Estrategia de marcadores

| Uso | Método recomendado | Motivo |
|---|---|---|
| Piezas que se repiten (baldosas, pilares, masas, fichas) | Fiducial con identificador único por instancia | A2 y A3 |
| Placas de identidad y tarjetas de modelo | Imagen aumentada de ARCore o fiducial | Son únicas y planas |
| Esferas del Set 3 | Segmentación por color | Sin superficie plana para marcador |
| Gestos de mano y cara | MediaPipe | Sin marcador |

La detección de fiduciales requiere una librería de visión nativa además de ARCore [por verificar: coste en CPU, tamaño del binario, compatibilidad con el módulo nativo actual dentro de Expo]. Esto se decide con piezas impresas reales en la fase 5 del pipeline de Construye, no antes.

Dos lecciones de la literatura que pasan a requisitos. La revisión de Tolba *et al.* (2012–2022) identifica como limitación recurrente que las manos de los niños tapan los marcadores; ya está recogido como regla en `SETS.md`, y debe comprobarse en cada STL. TARES obtuvo detección estable con la tableta fija en un trípode y la pantalla mirando hacia arriba, de modo que el niño no la sostiene; esto coincide con el principio de que el niño mira a Lúa y a sus manos. Propuesta **D7**: el **soporte fijo de la tableta** forma parte del kit, con altura y ángulo definidos por set. Matiz: TARES es una prueba de funcionamiento en laboratorio, sin niños evaluados; su «100 % de acierto» se refiere a 18 palabras en condiciones controladas y no es extrapolable a un aula.

### 2.3 Migración de AR-1 a AR-6

| Ejercicio actual | Destino | Cambio de fondo |
|---|---|---|
| AR-1 Orofacial | Set 4 (rotor, compuertas) + modo praxias separado | Retirar toda alegación sobre cierre velar o dislalias. Cámara frontal solo en modo praxias (D4) |
| AR-2 Localización | Set 3 | Pasa de gesto suelto a evento con objeto en movimiento |
| AR-3 Fijación | Set 3 | Igual que AR-2; alimenta la preparación de la Pizarra Mágica |
| AR-4 Búsqueda | Set 1 | Lúa no «aparece»: el niño la desliza hasta META |
| AR-5 Lanzamiento | Set 3 | Rápido/lento por comparación con el lanzamiento anterior |
| AR-6 Espejo Mímico | Set 5 / Set 6 | Se sustituye la imitación facial por equilibrio y florecimiento |

Durante la transición, los seis ejercicios se reimplementan como «mundos mínimos» de un solo evento sobre el motor nuevo. Así se retira el código antiguo sin dejar a las familias sin actividad.

### 2.4 Pruebas sin datos de niños

El motor se prueba con **reproducción de observaciones**: secuencias de magnitudes grabadas con piezas reales manipuladas por el equipo adulto o generadas sintéticamente. Nunca se graban sesiones con niños, ni siquiera como banco de pruebas, para no romper el principio Zero-PHI. Cada evento de cada set tiene al menos un caso positivo, uno negativo y uno con oclusión parcial.

---

## 3. Refactorización del resto de módulos

| Módulo actual | Destino en la arquitectura de tres capas | Nota |
|---|---|---|
| Integración Sensorial Auditiva | Práctica de mesa + eje de regulación; enlace al Set 2 | Mantiene muro adulto, estímulos sintetizados y «parar nunca resta». Retirar «desensibilización» y «SOR» |
| Aventuras con Lúa | Se disuelve en los mundos | Sus juegos y canciones pasan a la fase de calentamiento de cada set |
| Pares Mínimos | Eje fonología; Set 2 reto 4 + práctica de mesa | La misión física se convierte en evento real del Set 2 |
| Expansión Semántica | Eje léxico y semántica; Set 5 y Set 6 | Opuestos con masas, categorías y secuencias con el jardín |
| Audición (ACOPROS) | Eje percepción auditiva + perfil hipoacusia/IC | ACOPROS se usa como corpus de palabras y frases, nunca como protocolo de evaluación ni con normas o puntuaciones |
| Lenguaje | Ejes interacción, comprensión y expresión; Sets 1, 3 y 6 | Atención conjunta como regla transversal de mediación |
| TEA | Módulo propio + perfil de adaptación; Sets 1 y 3 | Se retiran «PRT + TCC» y «estresores» del código visible, de los textos y de la tienda |
| Dislexia | Eje fonología y lectoescritura + práctica de mesa | Segmentación silábica en Set 2; RAN y rotaciones siguen fuera de los mundos |
| Grafomotricidad | Práctica de mesa; enlaces con Set 3 y Set 6 | Pizarra Mágica sin cambios funcionales |
| Cuentos pedagógicos | Capa narrativa de cada mundo | Un microcuento por set: antes (anticipar) o después (recoger) |
| STEAM con las manos | Absorbido por los mundos | Las cinco sesiones ya están mapeadas a sets en el README |
| Academy | Una cápsula por mundo + cápsulas transversales de mediación | Incluye vocabulario espacial, qué observar y cuándo consultar con un profesional |
| PIN profesional | Configuración de perfiles | «Prescripción» pasa a «configuración profesional» |

**Corrección (27-10-2026).** Se mantienen los nombres originales de los módulos (Integración Sensorial Auditiva, Audición, TEA, Dislexia) y cada uno declara para qué familias está pensado. Nombrar la condición no convierte el producto en médico. Lo que sí lo haría es prometer un efecto sobre ella: tratar, rehabilitar, mejorar el habla. La regla, por tanto, no es «no nombrar la patología», sino «nombrarla como contexto, nunca como objetivo terapéutico». Siguen retirándose PRT, TCC, «desensibilización» y «prescripción».

Sobre los cuentos y la evidencia. Amirinejad y Rahimi (IJTE 2023) encontraron mejor autorregulación y lectoescritura en inglés cuando un grupo integró relatos digitales en un curso STEAM. El estudio tiene 33 alumnas de un colegio bilingüe de Teherán, un semestre y un cuestionario validado para mayores de 8 años. Sirve para justificar que el relato acompañe al fenómeno; no permite prometer efectos en 0–6 años ni en población con trastorno del lenguaje. Además, allí los niños **creaban** sus libros; en Valeria+ el adulto lee. Propuesta para la fase posterior: en 5–6 años, que el niño dicte al adulto el cuento de lo que ha construido y la app lo maquete con las fotos que el adulto decida, sin salir del dispositivo.

Sobre inclusión. Wade *et al.* (Educ. Sci. 2023) proponen planificar STEAM inclusivo con UDL en cuatro pasos (relación con la familia, actividades intencionales, inclusión, evaluación) y equilibrar actividades guiadas por el adulto y por el niño. Es un artículo conceptual, sin datos. Se adopta como marco: cada mundo debe ofrecer al menos una vía de representación, implicación y expresión alternativa, y el manifiesto lo declara explícitamente.

---

## 4. Fases

El orden sigue el de Construye con Lúa: **S0 + S1 → S5 → S3 → S6 → S2 → S4**.

| Fase | Entrega | Puerta para avanzar |
|---|---|---|
| R0 | Barrido de textos de la sección 7 (A1 ya decidida) y decisión A4 (motor de render) | Ningún texto visible usa el vocabulario de la columna «se retira»; A4 escrita |
| R1 | Esquema JSON del manifiesto + validador de reglas | Los eventos del Set 1 de `SETS.md` pasan el validador |
| R2 | Motor de eventos con `adult_tap` como único detector | Un Set 1 completo jugable solo con toques del adulto y reacciones reales en Lúa |
| R3 | Detector de marcadores por instancia (D2 resuelta con piezas reales) | Detección estable del Set 1 con la luz de un aula real; umbral por definir |
| R4 | Migración de AR-1 a AR-6 a mundos mínimos; retirada del código antiguo | Ninguna pantalla depende del módulo anterior |
| R5 | Reorganización de la navegación: Mundos → Ejes → Perfiles | Un adulto encuentra un reto en menos de dos minutos |
| R6 | Cuentos y cápsulas de Academy por mundo | Uno por set operativo |
| R7 | Sets 5, 3, 6, 2 y 4 en ese orden | Cada uno pasa sus puertas de Construye, incluida la clínica (B3) |

R2 antes que R3 es deliberado: con el toque del adulto como detector, el producto ya funciona y se puede pilotar el contrato de interacción sin esperar a la visión por ordenador.

---

## 5. Decisiones nuevas

| Código | Decisión | Recomendación |
|---|---|---|
| **R-A1** | Posicionamiento | **Resuelta: aplicación educativa, no dispositivo médico** |
| **R-A4** | Qué base de código renderiza los mundos | Contrato JSON compartido entre Valeria+ y Descubre con Lúa, independiente del framework |
| **D2 (revisada)** | Tipo de marcador | Fiducial único por instancia para piezas repetidas; imagen aumentada solo para piezas únicas |
| **D7** | Soporte fijo de tableta en el kit | Sí, con altura y ángulo por set |
| **D8** | Variedades lingüísticas en cuentos y palabras | Los cuentos figuran hoy como gl/es; confirmar cobertura en es-DO, eu, en-US y ca antes de anunciarla |

---

## 6. Riesgos

El mayor riesgo es de alcance: el motor de eventos, los fiduciales y la renavegación son tres proyectos. Por eso R2 entrega valor sin visión por ordenador. El segundo es la deriva de la finalidad: la decisión A1 está tomada, pero se pierde en cuanto un texto, una cápsula o una presentación vuelve a prometer rehabilitación; la sección 7 lo convierte en una revisión obligatoria. El tercero es de evidencia: ningún artículo adjunto evalúa niños de 0–6 con trastorno del lenguaje usando RA tangible; el piloto de la fase 8 de Construye debe medir comprensión del adulto, implicación e incidencias, y no prometer resultados clínicos.

## 7. Consecuencias de ser aplicación educativa

La finalidad educativa no se sostiene con el descargo del README: se sostiene con lo que el producto hace y con cómo se describe en todas partes.

**Lo que la app no hace nunca.** No calcula puntuaciones clínicas ni compara con normas por edad. No sugiere un diagnóstico ni un perfil a partir de lo que observa. No decide la progresión según el «rendimiento» del niño con fines terapéuticos. No importa resultados de VIA+ ni de ninguna prueba clínica. Esta frontera con VIA+, que sí es un dispositivo médico (SaMD Clase IIa), es la más delicada del ecosistema: si Valeria+ adaptara su contenido automáticamente a partir de un resultado de VIA+, pasaría a funcionar como accesorio o parte del dispositivo. Propuesta: separación técnica explícita. Los dos productos no comparten datos y el profesional elige el perfil de Valeria+ a mano.

**Vocabulario.** Regla para la interfaz, la Academy, la ficha de tienda, la web y el código visible:

| Se retira | Se usa |
|---|---|
| tratamiento, terapia, rehabilitación | práctica, juego, actividad, acompañamiento |
| prescripción, pautar | configuración profesional, recomendar |
| paciente | niña, niño, criatura |
| desensibilización | familiarización |
| diagnóstico, evaluación | (no aplica) |
| nombres de métodos terapéuticos (PRT, TCC) | (no aplica) |

Cada módulo **debe** indicar para qué familias está pensado (hipoacusia e implante coclear, dislalias, dislexia, TEA, sobre-reactividad auditiva). Es contexto informativo y compatible con la finalidad educativa. La fórmula recomendada es «pensado para familias de niñas y niños con…», en lugar de «para tratar…» o «mejora…».

**Fuera del repositorio [por verificar].** La categoría de Google Play «Fisioterapia y rehabilitación» contradice la decisión y debe cambiar a una categoría de educación o de familia. Con ese cambio, conviene revisar si sigue haciendo falta la cuenta de organización que exigía la categoría médica (es posible que siga siendo recomendable por otros motivos). El relato de Earlify en el que Valeria+ es el verbo «rehabilitar» también contradice la decisión. Propuesta: sustituirlo por «acompañar» o «practicar en casa» en el pitch, la web futureforkids.eu y las memorias de subvenciones (BS623D, FONDOCYT), revisando que lo ya presentado no comprometa resultados terapéuticos.

**Puerta clínica B3.** Se mantiene, pero como revisión de seguridad y de adecuación al desarrollo (luz, vibración, materiales, carga sensorial), no como validación de eficacia. El piloto mide comprensión del adulto, implicación e incidencias, nunca mejoría clínica.

## Referencias

- Google. *Augmented Images*, documentación de ARCore (límites de seguimiento).
- Ongoro C.A. *et al.* TARES: A game-based tangible augmented reality English spelling mastery system with minimal cognitive load. *IEEE Access*, 2024. doi:10.1109/ACCESS.2024.3393486
- Tolba R.M. *et al.* Mobile Augmented Reality for Learning Phonetics: A Review (2012–2022).
- Amirinejad M., Rahimi M. Integrating digital storytelling into STEAM teaching. *IJTE* 2023;6(4):720-735. doi:10.46328/ijte.551
- Wade C.B. *et al.* STEAM activities in the inclusive classroom: intentional planning and practice. *Educ. Sci.* 2023;13:1161. doi:10.3390/educsci13111161