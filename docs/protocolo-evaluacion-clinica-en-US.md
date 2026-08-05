# Protocolo de evaluación clínica · versión de prueba `en-US`

> **Para qué es este documento.** La revisora clínica (profesora SLP con
> licencia, *Howard University* · EN-0.3) va a instalar una versión de prueba de
> Valeria+ en Android, recorrer todas las pantallas y ejercicios, y entregar un
> informe. Este protocolo existe para que ese informe se pueda convertir en
> tareas del repositorio en vez de quedarse en prosa difícil de accionar.
>
> **Qué versión evalúa (decidido, ago 2026):** *interfaz en inglés, contenido
> terapéutico todavía en castellano*. La revisora es bilingüe, así que puede
> juzgar las dos capas a la vez: si el inglés de la interfaz suena a app
> estadounidense, y si la mecánica clínica de los ejercicios se sostiene antes
> de que exista una sola línea de contenido inglés.
>
> **Por qué en este orden.** Su criterio vale más ANTES de construir el
> contenido inglés que después. Si algo del diseño clínico no funciona para la
> práctica estadounidense, cambiarlo ahora cuesta una decisión; cambiarlo con
> diez bancos escritos cuesta reescribirlos.

---

## 1. Antes de empezar

### 1.1 Instalación (Android)

La app **no está en Google Play**. Se instala un APK de prueba firmado, generado
por el CI del proyecto (`.github/workflows/android.yml`).

1. En el teléfono o tablet Android: *Ajustes → Seguridad → Instalar apps
   desconocidas*, y permitirlo para el navegador o el gestor de archivos con el
   que se abra el fichero.
2. Descargar el APK del enlace que se le envíe e instalarlo.
3. Al primer arranque, la app pide permiso de **micrófono** (juegos de voz) y,
   si se entra al bloque de Realidad Aumentada, de **cámara**.

> ⚠️ **Aviso que hay que darle por escrito al enviarle el enlace.** Los textos
> de los diálogos de permiso del sistema **siguen en castellano** en esta
> versión: la localización de `app.json` (EN-2.5) requiere un config plugin y no
> entra en esta build. No es un fallo que deba reportar; es alcance conocido.

### 1.2 Poner la app en inglés

El selector está en la **pantalla de Créditos**, que es la segunda del
recorrido (*Get started* → Créditos). Tres opciones:

- **Automatic** — la interfaz sigue al idioma de los ejercicios.
- **Español**
- **English** ← la que debe elegir.

Conviene que pruebe también qué pasa al alternarlas: el cambio debe repintar la
app entera sin reiniciar.

### 1.3 Lo que NO debe evaluar (alcance conocido)

Reportarlo no aporta, ya está registrado como pendiente:

| Área | Estado |
| --- | --- |
| Contenido de los ejercicios (palabras, consignas, frases) | En **castellano** a propósito. El contenido inglés es la Fase 3 |
| Voz que locuta los ejercicios | Voz castellana o del sistema; la voz neuronal inglesa (Piper) es la Fase 4 |
| Diálogos de permisos del sistema | En castellano (EN-2.5) |
| Valeria Academy (formación profesional) | En castellano; fuera del alcance de esta iteración |
| Pantallas aún sin traducir | Ver §4: la migración va por tramos y no todas están en inglés todavía |

---

## 2. Qué queremos que juzgue

Cuatro preguntas, por este orden de importancia. Las tres primeras son las que
no podemos contestar sin ella.

### P1 · Validez clínica de la mecánica (lo más valioso)

Cada bloque tiene una mecánica: se locuta una consigna, el niño responde, y **el
adulto puntúa**. Queremos saber si esa mecánica es defendible en la práctica
estadounidense, con independencia del idioma del contenido.

- ¿El rol del adulto como juez final es el correcto, o hay puntos donde debería
  decidir la app?
- ¿La progresión de dificultad tiene sentido clínico?
- ¿Falta algún dato que un SLP de EE. UU. necesitaría registrar y que la ficha
  del paciente no recoge?
- ¿Hay algo que un SLP estadounidense consideraría **fuera del ámbito** de una
  app de uso doméstico?

### P2 · Diferencia dialectal vs. trastorno (EN-0.5, regla bloqueante)

Es el riesgo nº 1 del proyecto. Aunque el contenido inglés no exista aún,
queremos su criterio sobre **cómo debe comportarse el sistema** cuando el niño
habla una variedad distinta de la General American:

- Inglés afroamericano (AAE): reducción de grupos consonánticos finales, /θ/→[f]
  en posición final, pérdida de /r/ postvocálica…
- Inglés sureño y otras variedades regionales.
- Inglés con influencia del español (población bilingüe).

Pregunta concreta: **¿qué debe hacer la app cuando el niño produce un rasgo
dialectal regular?** La respuesta determina el diseño del banco inglés entero.

> **Posición de partida del proyecto (Frank, ago 2026):** se puntúa **como
> acierto**. Un rasgo regular de la variedad del niño no es un error terapéutico
> y no puede restar. Lo que pedimos a la revisora es **confirmarlo o corregirlo**,
> y resolver la consecuencia técnica que se deriva, que no es menor:
>
> Para saber que una producción es dialectal *y no un error*, caben dos vías:
>
> 1. **Declarar la variedad del niño en su ficha** y aceptar como acierto los
>    rasgos regulares de esa variedad. Más preciso, pero obliga al adulto a
>    etiquetar al niño —con lo que eso tiene de delicado— y falla con los niños
>    bidialectales, que son muchos.
> 2. **Aceptar como acierto cualquier realización dialectal conocida del
>    objetivo**, sin preguntar la variedad. Nunca penaliza a nadie, a costa de
>    dar por bueno algún caso que sí era un error articulatorio.
>
> El coste de la vía 2 se amortigua solo, porque en Valeria+ **el adulto es
> siempre el juez final**: el veredicto del micrófono es una pista, no la nota.
> Aun así, cuál de las dos vías es defendible en la práctica estadounidense es
> decisión clínica, no de producto.

### P3 · Registro y terminología del inglés de la interfaz

No basta con que sea correcto; tiene que sonar a app estadounidense. Decisiones
ya tomadas que conviene que confirme o corrija:

| Elegido | Motivo | ¿De acuerdo? |
| --- | --- | --- |
| *caregiver* en vez de *tutor* | En inglés de EE. UU. un *tutor* enseña asignaturas | |
| *child* en vez de *kid* en texto clínico | Registro profesional | |
| *patient* para la ficha | ¿O *client*, que es lo que usa buena parte de la práctica privada? | |
| *speech-language pathologist* | ¿O *speech therapist* según el contexto? | |
| «HIPAA / GDPR» en ese orden | Público estadounidense primero | |

### P4 · Usabilidad y seguridad del niño

- ¿Un adulto sin formación técnica llega a completar una sesión sin ayuda?
- ¿Hay algún punto donde el niño pueda salirse solo de la sesión o tocar algo
  que no debería?
- ¿La carga de lectura para el adulto es asumible en mitad de una sesión?

---

## 3. Recorrido guiado

Sugerencia de orden, que es el recorrido real de un usuario nuevo. Para cada
pantalla, las columnas del informe van en §5.

| # | Pantalla / bloque | Qué mirar en especial |
| --- | --- | --- |
| 1 | **Welcome** | La promesa de la app: ¿describe lo que realmente hace? |
| 2 | **Credits** + selector de idioma | Que el cambio de idioma sea evidente y repinte todo |
| 3 | **Ficha de registro** (alta de paciente) | ¿Qué campos faltan o sobran para la práctica de EE. UU.? |
| 4 | **Selección de paciente** | Gestión de varios niños en el mismo dispositivo |
| 5 | **Hub de ejercicios** | ¿Se entiende qué es cada bloque sin abrirlo? |
| 6 | **Test de Ling** | Antesala auditiva para niños con audífono/implante |
| 7 | **Pares Mínimos** | Mecánica del contraste, papel del micrófono, puntuación del adulto |
| 8 | **Expansión Semántica** | Progresión léxica y cápsulas de contraste |
| 9 | **Audición** | |
| 10 | **Lenguaje** | Morfosintaxis: aquí el inglés cambia mucho (§4.2 del plan) |
| 11 | **TEA** | |
| 12 | **Dislexia** | Ojo: pensado para ortografía transparente (español). En inglés hay que rehacerlo — su criterio aquí es muy valioso |
| 13 | **Realidad Aumentada** | Solo si el dispositivo lo soporta |
| 14 | **Panel del adulto** | Carga comunicativa y pausas |
| 15 | **Panel de resultados** | ¿Sirve para enseñárselo a una familia? ¿Y para una nota clínica? |
| 16 | **Exportación de informe** | Formato y contenido del informe que se llevaría la familia |

**Degradaciones que conviene provocar a propósito** (son parte del diseño, no
fallos): negar el permiso de micrófono, poner el dispositivo en avión, y entrar
a un bloque sin haber dado de alta ningún paciente. En los tres casos la app
debe seguir siendo usable con el adulto puntuando a mano.

---

## 4. Estado de la traducción (se actualiza en cada entrega)

La migración de la interfaz va por tramos; cada tramo es una entrega. Antes de
enviarle la build hay que actualizar esta tabla y decírselo, para que no reporte
como fallo lo que aún no ha llegado.

| Tramo | Pantallas | Estado |
| --- | --- | --- |
| 1 · Entrada | Welcome · Credits · Selección de paciente | ✅ en inglés |
| 2 · Alta y hub | Ficha de registro · Hub de ejercicios · Auth | ✅ en inglés |
| 3 · Bloques de terapia | Player · Pares Mínimos · Expansión Semántica · Test de Ling | ⏳ pendiente |
| 4 · Adulto y datos | Panel del adulto · Resultados · Exportación · modales | ⏳ pendiente |
| 5 · Sistema | Notificaciones · permisos (`app.json`) | ⏳ pendiente |

> **Regla:** no se le manda la build hasta cerrar el tramo 4. Una app medio
> traducida gasta su tiempo en reportar lo que ya sabemos y nos devuelve un
> informe peor.

---

## 5. Formato del informe

Lo que necesitamos para poder trabajar con él. Prosa libre al final, sí, pero
con esta tabla delante:

| Campo | Contenido |
| --- | --- |
| **Pantalla / bloque** | Del recorrido de §3 |
| **Observación** | Qué vio |
| **Tipo** | `clínico` · `dialectal` · `idioma/registro` · `usabilidad` · `fallo técnico` |
| **Gravedad** | `bloqueante` · `importante` · `menor` · `sugerencia` |
| **Propuesta** | Qué haría en su lugar |

La columna **Tipo** es la que más ahorra: separa lo que cambia el diseño clínico
(y por tanto el plan) de lo que es una cadena mal elegida (y se arregla en una
tarde). La columna **Gravedad** evita que tengamos que adivinar qué es
imprescindible antes de publicar.

Formato de entrega indiferente —documento, hoja de cálculo o correo—, siempre
que lleve esas columnas.

## 6. Qué hacemos con el informe

1. Cada fila se convierte en una tarea con su código `EN-x.y` en
   [`plan-integracion-ingles-en-US.md`](./plan-integracion-ingles-en-US.md).
2. Lo marcado como **dialectal** entra en
   [`guia-dialectal-en-US.md`](./guia-dialectal-en-US.md) (EN-0.5), que es regla
   bloqueante: ningún dataset inglés entra en `main` sin pasar por ahí.
3. Lo marcado como **clínico** con gravedad alta puede cambiar el alcance del
   plan; se edita el plan en la misma PR, que es la regla de la casa.
4. Se le devuelve una respuesta punto por punto: qué se aplicó, qué no y por
   qué. Sin esa vuelta, la segunda revisión llega con menos detalle.

## 7. Preguntas abiertas que conviene hacerle en esta primera vuelta

Son decisiones que están esperando su criterio y que no salen solas de un
recorrido por la app:

1. **Prosodia inglesa.** La app puede locutar una consigna entera o trocearla en
   frases con pausas. Hoy, en inglés, va sin trocear. ¿Qué ritmo sirve mejor en
   terapia infantil angloamericana?
2. **Variedad del niño en la ficha.** ¿Debería el adulto poder declarar la
   variedad de inglés del niño, como ya se hace con el español dominicano?
3. **Vocabulario de partida.** ¿Qué normas usaría para ordenar el vocabulario
   inglés por familiaridad? El plan propone SUBTLEX-US y las normas CDI.
4. **Pares mínimos.** El plan propone diez contrastes (§4.1 del plan). ¿Cuáles
   quitaría y cuáles echa en falta?
5. **Piloto.** ¿Ve viable involucrar supervisión clínica o estudiantes en
   prácticas para EN-7.3?
6. **Alcance de sus declaraciones.** ¿Está cómoda apareciendo como revisora
   clínica en los créditos de la app, y en qué términos exactos?
