// Gate de las URLs legales: comprueba que las páginas que Play Console tiene
// declaradas se sirven de verdad.
//
// Existe por el rechazo del 19/8/2026. Google respondió «URL provided
// https://frankbetances.github.io/Valeria/privacidad.html does not link to a
// valid privacy policy page, HTTP server is returning 404: Not Found» con el
// fichero intacto en `site/` y el último despliegue de `pages.yml` en verde.
//
// No se había roto nada del contenido: se había APAGADO el sitio. El repositorio
// se preparó para pasar a privado (commit c3f6cd9) y en el plan Free de GitHub
// un repositorio privado deja Pages sin publicar. Volver a ponerlo público NO lo
// reactiva: `has_pages` se queda en false y las tres URLs devuelven 404 para
// siempre, en silencio, porque el último run de Pages sigue verde en el historial.
//
// Esa es la trampa que este gate rompe: un despliegue correcto no demuestra que
// el sitio esté vivo. Lo único que lo demuestra es pedir las URLs.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const BASE = 'https://frankbetances.github.io/Valeria/';

// Las tres URLs declaradas en Play Console. Si cambian aquí, hay que cambiarlas
// también en Play Console: Google contrasta lo declarado con lo que sirve.
const PAGINAS = [
  { fichero: 'privacidad.html',          rotulo: 'Política de privacidad (ES)', marca: 'Política de Privacidad' },
  { fichero: 'privacy.html',             rotulo: 'Privacy policy (EN)',         marca: 'Privacy Policy' },
  { fichero: 'eliminacion-de-datos.html', rotulo: 'Eliminación de datos',       marca: 'Eliminación de datos' },
];

const offline = process.argv.includes('--offline');
const fail = [];

// 1 · Mitad local. Un fichero renombrado o borrado se caza aquí, antes de
// desplegar, sin tocar la red.
for (const { fichero, rotulo, marca } of PAGINAS) {
  const abs = path.join(SITE, fichero);
  if (!fs.existsSync(abs)) {
    fail.push(`site/${fichero} no existe, y ${BASE}${fichero} está declarada en Play Console (${rotulo}).`);
    continue;
  }
  const html = fs.readFileSync(abs, 'utf8');
  if (!html.includes(marca)) {
    fail.push(`site/${fichero} ya no contiene «${marca}»: Google valida que la página sea lo que dice ser.`);
  }
  if (!/frank\.alberto\.betances\.reinoso@gmail\.com/.test(html)) {
    fail.push(`site/${fichero} no lleva el correo de contacto del proyecto.`);
  }
}

// 2 · Mitad de red. Es la que detecta el sitio apagado.
const comprobarRed = async () => {
  const caidas = [];
  for (const { fichero, rotulo } of PAGINAS) {
    const url = `${BASE}${fichero}`;
    let res;
    try {
      res = await fetch(url, { redirect: 'follow' });
    } catch (e) {
      fail.push(`${rotulo}: no se pudo pedir ${url} (${e.message}).`);
      continue;
    }
    if (res.status === 404) {
      caidas.push(rotulo);
      fail.push(`${rotulo}: ${url} devuelve 404. Es la URL declarada en Play Console.`);
      continue;
    }
    if (!res.ok) {
      fail.push(`${rotulo}: ${url} devuelve HTTP ${res.status}.`);
      continue;
    }
    const html = await res.text();
    const { marca } = PAGINAS.find((p) => p.fichero === fichero);
    if (!html.includes(marca)) {
      fail.push(`${rotulo}: ${url} responde 200 pero no contiene «${marca}»; puede estar sirviendo otra cosa.`);
    }
  }

  // Las tres a la vez no es coincidencia: es Pages sin publicar.
  if (caidas.length === PAGINAS.length) {
    fail.push(
      'Las TRES páginas caen a la vez: el sitio de Pages está sin publicar, no es un fichero perdido.\n' +
      '   Se arregla en Settings -> Pages -> Build and deployment -> Source: "GitHub Actions",\n' +
      '   y despues relanzando "Deploy Legal Site (GitHub Pages)" desde la pestaña Actions.\n' +
      '   No se puede automatizar: el GITHUB_TOKEN no puede dar de alta el sitio de Pages.'
    );
  }
};

const salir = () => {
  if (fail.length) {
    console.error('FALLA check-legal-urls:\n' + fail.map((f) => ` - ${f}`).join('\n'));
    process.exit(1);
  }
  console.log(`check-legal-urls OK · ${PAGINAS.length} páginas${offline ? ' (solo comprobación local)' : ' vivas'}.`);
};

if (offline) {
  salir();
} else {
  comprobarRed().then(salir);
}
