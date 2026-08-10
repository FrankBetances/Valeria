# Valeria+ · Notas para Claude Code

## Reglas de trabajo (obligatorias, no negociables)

Nacen de errores reales cometidos en el rediseño v11 (6/8/2026), cada uno con
su coste. No son buenas prácticas genéricas: son la lista de lo que ya salió
mal aquí.

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

Decidido por Frank el 9/8/2026. `BearMark` está retirado: en la app no queda ni
un oso de marca. Lo que hay que saber antes de tocar nada:

- El sprite vive en [`src/ValeriaCatPixel.tsx`](src/ValeriaCatPixel.tsx) —una
  rejilla de caracteres, no un PNG— y de ahí salen **icono, icono adaptativo,
  splash y la portada del manual** con `npm run build:brand`. No exportes
  bitmaps a mano: se corre el script y salen los cuatro coherentes.
- El distractor de doble tarea (`ValeriaDistractorCat`) es **la misma gata**, no
  un segundo personaje.
- La cara del **periférico Lúa** (panel 240×240, `firmware/lua/`) sale de esa
  misma rejilla: mismo personaje, dos superficies.
- **«Oso» sigue siendo vocabulario terapéutico** —par mínimo *ocho/oso*, «EL OSO
  COME PAN», la orden TPR—. Eso es contenido de los bancos y no se toca.
- Un cambio de marca no está hecho hasta que lo dicen el README y el manual. El
  icono de la **ficha de Play Console** se sube a mano y no viaja en el APK: si
  cambia la marca, hay que decirlo en la respuesta, no dejarlo en el commit.

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

**Al cambiar lo que la app recoge** —un permiso nuevo, un campo nuevo en la
ficha del paciente, un SDK de terceros— hay que actualizar en el mismo cambio
la política de `site/` **y** el formulario de *Seguridad de los datos* de Play
Console: Google contrasta ambas declaraciones entre sí.
