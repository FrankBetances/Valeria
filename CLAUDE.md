# Valeria+ · Notas para Claude Code

## Reglas de trabajo (obligatorias, no negociables)

Nacen de errores reales cometidos en el rediseño v11 (6/8/2026), cada uno con
su coste. No son buenas prácticas genéricas: son la lista de lo que ya salió
mal aquí.

### 0. No afirmes nada que no hayas comprobado. Manda sobre todas las demás

Tres veces se le dijo a Frank que la mascota estaba cambiada estando a medias,
y la tercera él ya había **distribuido la build 498 a los testers de todo el
mundo**. En cada una de las tres, la frase «está hecho» era falsa y quien la
dijo no lo sabía, porque no había mirado. Eso no es equivocarse: es afirmar una
comprobación que no se ha hecho.

**Los tres verbos no son intercambiables. Usa el que te has ganado:**

| Puedes decir | Cuándo |
| --- | --- |
| «He escrito / he cambiado X» | Siempre. Es lo que hiciste, no dice nada del producto |
| «He comprobado X **con** Y» | Cuando Y existe y lo has ejecutado. **Nombra Y**: el gate, la captura, el comando |
| «Está hecho» | Solo con la evidencia al lado, y solo del alcance que cubre esa evidencia |

**Prohibiciones concretas, todas ellas cometidas ya:**

- **No presentes tu actividad como el estado del producto.** «Sustituido en las
  pantallas» y «typecheck limpio» son hechos sobre ti. Frank necesita hechos
  sobre lo que la app hace.
- **`npm run typecheck` no es verificación.** Corre los gates (§1b). Decir
  «listo» con solo el typecheck es la mentira exacta del 10/8/2026.
- **«Hecho» se mide en capas, no en ficheros editados.** Un cambio de marca
  vive en pantallas, PNG, nombres de componente, copy y **texto locutado**.
  Haber tocado una capa no dice nada de las otras cuatro. **Enumera las capas y
  di cuál has mirado y cuál no.**
- **Nada llega a Frank hasta que está en `main` con build verde.** Mientras
  esté en una rama, se dice «en la rama X, pendiente de mergear», nunca
  «entregado». Y se da **el número de build**, para que él pueda mirarlo.

**Si no lo has comprobado, dilo con esas palabras: «esto no lo he verificado».**
Es siempre más barato que la alternativa. La alternativa ya costó una
distribución mundial.

### 1. No digas que una pantalla está hecha sin haberla mirado

Prohibido dar por terminado cualquier cambio visual sin **una captura propia**.
El repo trae todo lo necesario y no hay excusa:

```bash
npm install --no-save --legacy-peer-deps \
  react-native-web@~0.21.0 react-dom@19.1.0 @expo/metro-runtime@~6.1.1 playwright
BROWSER=none npx expo start --web --port 8081 --clear
CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  node docs/capture-screenshots.js
```

`npm run typecheck` no ve un hueco muerto en una tarjeta, ni texto blanco sobre
fondo blanco, ni cinco chips solapados. Todo eso se entregó y lo tuvo que
detectar Frank. **Mira la captura antes de decir "hecho".**

### 1b. «Hecho» exige los gates, no solo el typecheck

Corre los gates de `android.yml` **antes de empujar**, no después:

```bash
for s in check-voice-corpus-coverage check-content-rules check-reminder-slots \
         check-pictogram-coverage check-lexical-difficulty check-sign-figures \
         check-speech-prosody check-asr-capture-guard check-asr-listen-options \
         check-lua-mute check-brand-consistency check-ui-strings check-adult-fields \
         check-variety-branches check-lua-mascot-mirror; do node scripts/$s.js || echo "FALLA $s"; done
node scripts/build-lua-protocol.js --check
```

Coste real (10/8/2026): se cambió el texto de seis consignas y se dijo «listo»
con typecheck y captura. El build 499 murió a los 37 segundos en el **primer**
gate. Ese texto lo locuta la app, así que **todo cambio de texto locutado lleva
`node scripts/export-voice-corpus.js` en el MISMO commit**; sin él, gallego y
euskera caen a la voz del sistema en silencio y se pierden Celtia e ILENIA.

### 2. Informa de lo que Frank VA A VER, no de lo que has hecho

Primera línea de la respuesta: qué cambia en pantalla. Si un merge no cambia
nada visible —está detrás de un flag, es refactor, es documentación— **dilo en
la primera línea**, no en el párrafo doce.

Coste real: se entregó el build 472 a una evaluación externa en Howard
University con la interfaz antigua, porque «mergeado a main» se dijo dos veces
con el flag apagado y la advertencia iba enterrada al final.

### 3. Nada de feature flags para cambios de pantalla completa

Un flag así convierte «está mergeado» y «se ve» en dos cosas distintas, y la
diferencia solo se descubre compilando. Si en algún caso hiciera falta uno, la
regla 2 se aplica en cada mención del merge, sin excepción.

### 4. Un push por cambio, y solo a la rama destino

`android.yml` lanza un build completo por push (npm ci, 9 gates, typecheck,
NDK, prebuild, Gradle). **Nunca** empujes el mismo commit a dos ramas: duplica
la carga de CI, satura la cola y deja los runs manuales de Frank esperando
detrás, con la apariencia de que el botón *Run workflow* no hace nada. Ya hay
`concurrency` con `cancel-in-progress`, pero eso no justifica generar ruido.

### 5. «Premium» significa activos propios

Nada de emoji del sistema como iconografía: los dibuja el fabricante del
teléfono, cambian entre Android/iOS/web y nunca forman un set. Hay un set SVG
propio en [`src/ValeriaBlockIcons.tsx`](src/ValeriaBlockIcons.tsx) —rejilla de
24, grosor 1.9, terminaciones redondeadas— y `react-native-svg` ya es
dependencia. Ícono nuevo → se dibuja ahí, con ese mismo trazo.

### 5b. La mascota es Lúa, la gata. El oso ya no existe

Decidido por Frank el 9/8/2026. La mascota anterior está retirada y no queda ni
un rastro suyo en la app. Lo que hay que saber antes de tocar nada:

- El sprite vive en [`src/ValeriaCatPixel.tsx`](src/ValeriaCatPixel.tsx) —una
  rejilla de caracteres, no un PNG— y de ahí salen **icono, icono adaptativo,
  splash y la portada del manual** con `npm run build:brand`. No exportes
  bitmaps a mano: se corre el script y salen los cuatro coherentes.
- El distractor de doble tarea (`ValeriaDistractorCat`) es **la misma gata**, no
  un segundo personaje.
- La cara del **periférico Lúa** (panel 240×240, `firmware/lua/`) sale de esa
  misma rejilla: mismo personaje, dos superficies. **Y desde el 19/8/2026 no es
  solo la cara**: los estados de compañía —ronroneo, antojo, comer— y el armario
  también se espejan, por `MOOD` y `ACCESSORY`. La capa que los traduce es
  [`src/valeriaLuaMascot.ts`](src/valeriaLuaMascot.ts) y el gate
  `check-lua-mascot-mirror.js` impide que las dos mascotas vuelvan a separarse.
  Un accesorio nuevo se dibuja **aquí**, con su anclaje `device` para la pose del
  aparato, o en el cristal no existe.
- **Y desde el 27/8/2026 se espeja también el premio.** `AWARD` y `LEVEL`
  llevaban en la tabla desde la primera tanda y el firmware los pinta; esta app
  no los mandaba nunca, así que el niño ganaba una insignia en la tableta y la
  gata del cristal seguía con la cara de antes. Ahora `registerSession` va
  seguido de `luaSessionReward(premio)`
  ([`src/valeriaLuaSession.ts`](src/valeriaLuaSession.ts)) en las cuatro
  pantallas que cierran sesión. Tres cosas que no se pueden perder al tocarlo:
  · **una insignia son DOS NÚMEROS** —familia y rango, posiciones en
    `AWARD_GLYPH_KEYS` y `AWARD_TIER_KEYS`—, nunca el id ni el nombre: en el
    aparato no hay campo de texto;
  · **el desfile se manda a plazos.** Cada opcode sustituye la cara en el
    firmware, así que cuatro tramas seguidas enseñan la última y nada más. El
    paso son 3 000 ms porque es lo que dura la cara allí (`core/src/faces.cpp`);
  · **esas dos listas son append-only.** Los DIBUJOS pueden cambiar —el 25/8
    cambiaron los nueve— pero el orden no: reordenar le pone al niño la insignia
    del vecino en un aparato que ya está en su casa. Lo sujeta la comprobación 6
    de `check-lua-mascot-mirror.js`.
- **«Oso» sigue siendo vocabulario terapéutico** —par mínimo *ocho/oso*, «EL OSO
  COME PAN», la orden TPR—. Eso es contenido de los bancos y no se toca.
- Un cambio de marca no está hecho hasta que lo dicen el README y el manual.

### 6. Rediseñar, no parchear

Si Frank dice que algo se ve pobre, la respuesta no es un ajuste de padding.
Se rehace la pieza entera y **se enseña una captura**. Cuatro rondas de parches
sobre la misma tarjeta le convirtieron a él en el control de calidad de un
trabajo que debía llegarle ya mirado.

### 7. Menos prosa, más resultado

Los comentarios y los mensajes largos no son rigor. Un fichero de 44 líneas
para una constante es tiempo robado al trabajo real. Explica lo que evita que
alguien rompa algo (telemetría, MDR, regla clínica) y calla el resto.

## Correo de contacto (regla fija)

El correo de contacto del proyecto es **siempre**:

```
frank.alberto.betances.reinoso@gmail.com
```

Aplica sin excepción a la política de privacidad, la página de eliminación de
datos, los formularios de Google Play Console, las declaraciones de
responsable del tratamiento y cualquier documento legal o de contacto que se
genere o edite.

No lo sustituyas por una dirección de dominio (`@futureforkids.eu` u otra)
aunque parezca más institucional, ni propongas el cambio como mejora: es una
decisión ya tomada. Si alguna vez cambia, lo dirá Frank explícitamente.

## Sitio legal (`site/` → GitHub Pages)

Las URLs declaradas en Play Console salen de aquí; si cambian, hay que
actualizarlas también en Play Console:

| Página | URL |
| --- | --- |
| Política de privacidad (ES) | `https://frankbetances.github.io/Valeria/privacidad.html` |
| Privacy policy (EN) | `https://frankbetances.github.io/Valeria/privacy.html` |
| Eliminación de datos | `https://frankbetances.github.io/Valeria/eliminacion-de-datos.html` |

Se publica con [`.github/workflows/pages.yml`](.github/workflows/pages.yml),
que construye el artefacto **solo** desde `site/`: el código, las docs internas
de planificación y el corpus de voz no se publican. La fuente de Pages debe
seguir en *Settings → Pages → Source: **GitHub Actions***; si vuelve a *Deploy
from a branch*, el despliegue falla en dos segundos sin runner, sin pasos y sin
logs.

**Pasar el repositorio a privado apaga Pages.** En el plan Free un repositorio
privado no sirve Pages, y volver a ponerlo público **no lo reactiva**: hay que
entrar a *Settings → Pages* y volver a dejar *Source: **GitHub Actions***. Eso
fue el rechazo del 19/8/2026 —Google vio un 404 en `privacidad.html` con el
fichero intacto y el último run de `pages.yml` en verde desde el 4/8—. Un
despliegue en verde no demuestra que el sitio se sirva: lo único que lo
demuestra es pedir las URLs, y de eso se encargan ahora
[`scripts/check-legal-urls.js`](scripts/check-legal-urls.js) y el vigilante
diario [`legal-urls.yml`](.github/workflows/legal-urls.yml).

**Al cambiar lo que la app recoge** —un permiso nuevo, un campo nuevo en la
ficha del paciente, un SDK de terceros— hay que actualizar en el mismo cambio
la política de `site/` **y** el formulario de *Seguridad de los datos* de Play
Console: Google contrasta ambas declaraciones entre sí.
