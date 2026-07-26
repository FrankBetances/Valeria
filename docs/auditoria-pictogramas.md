# Auditoría de carga visual · pictogramas (DC-4 · ES-09)

> Generado por `node scripts/audit-pictograms.js --markdown`. **No editar a mano**:
> se regenera. La columna *Veredicto ACOPROS* es la excepción — se rellena a mano
> y se conserva copiándola al regenerar.

## Por qué existe este documento

Las logopedas de ACOPROS señalaron que «algunas imágenes resultan ambiguas (por ejemplo,
la de comer)» y propusieron pictogramas. Al resolver DC-4 se acordó auditar y corregir los
emoji ambiguos de inmediato, dejando la adopción de un banco externo pendiente de licencia.

La licencia se resolvió descartando los bancos externos: ARASAAC es CC BY-NC-SA (la cláusula
NC bloquea el uso comercial), Mulberry es CC BY-SA (el *share-alike* se contagiaría al diseño
de la app) y Sclera añade ND. Pero el argumento que decide no es la licencia: **ningún banco,
ni de pago, trae «cuchara sucia» y «cuchara limpia» como par sobre el mismo objeto**, que es
justo lo que ES-12 necesita. Se dibuja en casa, con clave propia en el dato.

## Resumen

- **114** claves visuales distintas, en **292** usos sobre los tres bancos de Expansión Semántica y los cuatro de Pares Mínimos.
- **26** con riesgo de *tofu* · **6** que ilustran un atributo · **14** a revisar con ACOPROS · **68** sin sospecha.
- **16** cápsulas de contraste muestran el MISMO emoji en sus dos vueltas: **16** ya se distinguen por pictograma propio y **0** siguen irresolubles.

## Cómo leer el motivo

| Motivo | Qué significa | Quién lo decide |
| --- | --- | --- |
| `TOFU` | Emoji de Unicode 12 o posterior: en muchos Android se pinta como cuadro vacío. | Nadie: es un fallo de renderizado, se dibuja y ya. |
| `ATRIBUTO` | La imagen ilustra el atributo contrastado, no el objeto que nombra el audio. | Nadie: lo exige ES-12. |
| `REVISAR` | Verbo o acción, donde la ambigüedad es de interpretación. | **ACOPROS.** |
| `OK` | Objeto concreto con emoji antiguo y bien soportado. | Nadie, salvo que ACOPROS discrepe. |

## Inventario

| Emoji | Motivo | Usos | Palabras | Bloques | Lenguas | Con clave | Veredicto ACOPROS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 🥄 | `TOFU` | 12 | limpio, cuchara, sucio, garbi, koilara, zikin | Escenario, Contraste | es, es-DO, eu | 6/12 | |
| 🥤 | `TOFU` | 9 | beber, frío, caliente, edan, hotz, bero | Escenario, Contraste | es, es-DO, eu | 6/9 | |
| 🧼 | `TOFU` | 6 | lavar, jabón, garbitu, xaboia | Escenario | es, es-DO, eu | 0/6 | |
| 🧸 | `TOFU` | 6 | grande, pequeño, chiquito, handia, txikia | Contraste | es, es-DO, eu | 6/6 | |
| 🥛 | `TOFU` | 4 | vaso, leche, basoa, esnea | Escenario, Progresión | es, eu | 0/4 | |
| 🧺 | `TOFU` | 4 | lleno, vacío, cesta | Contraste, Escenario, Pares | es, es-DO, gl | 2/4 | |
| 🪥 | `TOFU` | 3 | cepillo, eskuila | Escenario | es, es-DO, eu | 0/3 | |
| 🤗 | `TOFU` | 3 | abrazar, besarkatu | Escenario | es, es-DO, eu | 0/3 | |
| 🛞 | `TOFU` | 3 | rueda, goma, gurpila | Progresión | es, es-DO, eu | 0/3 | |
| 🤲 | `TOFU` | 3 | mojado, busti | Progresión | es, es-DO, eu | 0/3 | |
| 🪶 | `TOFU` | 3 | pluma, luma | Progresión | es, es-DO, eu | 0/3 | |
| 🪣 | `TOFU` | 3 | cubo | Pares | es, es-DO, gl | 0/3 | |
| 🧪 | `TOFU` | 3 | tubo | Pares | es, es-DO, gl | 0/3 | |
| 🛝 | `TOFU` | 2 | tobogán, txirristra | Escenario | es, eu | 0/2 | |
| 🤸 | `TOFU` | 2 | saltar, salto | Escenario | es, eu | 0/2 | |
| 🧽 | `TOFU` | 2 | frotar, igurtzi | Escenario | es, eu | 0/2 | |
| 🧶 | `TOFU` | 2 | lana | Pares | es, es-DO | 0/2 | |
| 🥫 | `TOFU` | 2 | lata | Pares | es, es-DO | 0/2 | |
| 🧵 | `TOFU` | 1 | cuerda | Progresión | es | 0/1 | |
| 🧻 | `TOFU` | 1 | secar | Escenario | es-DO | 0/1 | |
| 🪚 | `TOFU` | 1 | sierra | Pares | es | 0/1 | |
| 🤚 | `TOFU` | 1 | piel | Pares | es | 0/1 | |
| 🪵 | `TOFU` | 1 | palo | Pares | es | 0/1 | |
| 🫵 | `TOFU` | 1 | zu | Pares | eu | 0/1 | |
| 🥶 | `TOFU` | 1 | hotz | Pares | eu | 0/1 | |
| 🫓 | `TOFU` | 1 | talo | Pares | eu | 0/1 | |
| ⬆️ | `ATRIBUTO` | 6 | salta, subir, brinca, salto, igo | Progresión, Contraste | es, es-DO, eu | 3/6 | |
| ⬇️ | `ATRIBUTO` | 6 | cae, bajar, erortzen, jaitsi | Progresión, Contraste | es, es-DO, eu | 3/6 | |
| 📦 | `ATRIBUTO` | 6 | abrir, cerrar, ireki, itxi | Contraste | es, es-DO, eu | 6/6 | |
| 💡 | `ATRIBUTO` | 6 | encender, apagar, prender, piztu, itzali | Contraste | es, es-DO, eu | 6/6 | |
| 📥 | `ATRIBUTO` | 1 | meter | Contraste | es | 1/1 | |
| 📤 | `ATRIBUTO` | 1 | sacar | Contraste | es | 1/1 | |
| 😋 | `REVISAR` | 6 | comer, ñam ñam, jan | Escenario | es, es-DO, eu | 0/6 | |
| 😴 | `REVISAR` | 6 | dormir, duerme, lo, lo egiten | Escenario, Progresión | es, es-DO, eu | 0/6 | |
| 🐦 | `REVISAR` | 6 | pájaro, vuela, txoria, hegan | Progresión | es, es-DO, eu | 0/6 | |
| 💨 | `REVISAR` | 4 | corre, sopla, dabil | Progresión | es, es-DO, eu | 0/4 | |
| 🛀 | `REVISAR` | 3 | bañar, bainatu | Escenario | es, es-DO, eu | 0/3 | |
| 👕 | `REVISAR` | 2 | vestir, jantzi | Escenario | es, eu | 0/2 | |
| 🏃 | `REVISAR` | 2 | correr, korrika | Escenario | es, eu | 0/2 | |
| 🌿 | `REVISAR` | 2 | come, jaten | Progresión | es, eu | 0/2 | |
| 🛑 | `REVISAR` | 2 | para, gelditzen | Progresión | es, eu | 0/2 | |
| 🏊 | `REVISAR` | 2 | nada, mojado | Progresión | es-DO | 0/2 | |
| 🙋 | `REVISAR` | 1 | quiero pan | Progresión | es | 0/1 | |
| 💵 | `REVISAR` | 1 | comprar | Escenario | es-DO | 0/1 | |
| 💪 | `REVISAR` | 1 | cargar | Escenario | es-DO | 0/1 | |
| 🎵 | `REVISAR` | 1 | canta | Progresión | es-DO | 0/1 | |
| 🐈 | `OK` | 7 | gato, suave, katua, isatsa, leuna | Progresión | es, es-DO, eu | 0/7 | |
| 🐕 | `OK` | 6 | perro, peludo, txakurra, iletsua | Progresión | es, es-DO, eu | 0/6 | |
| 💧 | `OK` | 5 | agua, ura, gota | Progresión, Escenario, Pares | es, es-DO, eu | 0/5 | |
| ⚽ | `OK` | 4 | pelota, boing, pilota | Escenario | es, eu | 0/4 | |
| 💦 | `OK` | 4 | chof, mojado, txof | Escenario | es, es-DO, eu | 0/4 | |
| 🌙 | `OK` | 4 | luna, ilargia, lúa | Escenario, Pares | es, es-DO, eu, gl | 0/4 | |
| 🚗 | `OK` | 4 | coche, rápido, kotxea, azkarra | Progresión | es, eu | 0/4 | |
| 🐄 | `OK` | 4 | vaca, grande, behia, handia | Progresión | es, eu | 0/4 | |
| 🚆 | `OK` | 4 | tren, largo, trena, luzea | Progresión | es, eu | 0/4 | |
| 👄 | `OK` | 4 | boca | Pares | es, es-DO, gl | 0/4 | |
| 👢 | `OK` | 4 | bota | Pares | es, es-DO, gl | 0/4 | |
| 🛏️ | `OK` | 3 | cama, ohea | Escenario | es, es-DO, eu | 0/3 | |
| ⏰ | `OK` | 3 | rin rin | Escenario | es, es-DO, eu | 0/3 | |
| 👌 | `OK` | 3 | rico, goxo | Escenario | es, es-DO, eu | 0/3 | |
| 📖 | `OK` | 3 | cuento, ipuina | Escenario | es, es-DO, eu | 0/3 | |
| 🌑 | `OK` | 3 | oscuro, ilun | Escenario | es, es-DO, eu | 0/3 | |
| 🦉 | `OK` | 3 | uh uh, cu cu | Escenario | es, es-DO, eu | 0/3 | |
| 🐾 | `OK` | 3 | pata, hanka | Progresión | es, es-DO, eu | 0/3 | |
| ☁️ | `OK` | 3 | nube, hodeia | Progresión | es, es-DO, eu | 0/3 | |
| 🐤 | `OK` | 3 | pequeño, chiquito, txikia | Progresión | es, es-DO, eu | 0/3 | |
| 🐓 | `OK` | 3 | gallo, cresta, grande | Progresión | es-DO | 0/3 | |
| ⛲ | `OK` | 3 | fuente, fonte | Pares | es, es-DO, gl | 0/3 | |
| 🌉 | `OK` | 3 | puente, ponte | Pares | es, es-DO, gl | 0/3 | |
| 🦒 | `OK` | 2 | alto, altu | Escenario | es, eu | 0/2 | |
| 🛁 | `OK` | 2 | bañera, bainuontzia | Escenario | es, eu | 0/2 | |
| ♨️ | `OK` | 2 | caliente, bero | Escenario | es, eu | 0/2 | |
| 🐱 | `OK` | 2 | bigote | Progresión | es, es-DO | 0/2 | |
| 🚃 | `OK` | 2 | vagón, bagoia | Progresión | es, eu | 0/2 | |
| 🍞 | `OK` | 2 | pan, tostado | Progresión | es | 0/2 | |
| 🎈 | `OK` | 2 | globo, redondo | Progresión | es | 0/2 | |
| 🚌 | `OK` | 2 | guagua, llena | Progresión | es-DO | 0/2 | |
| 🐸 | `OK` | 2 | rana | Pares | es, es-DO | 0/2 | |
| 🐶 | `OK` | 2 | perro | Pares | es, es-DO | 0/2 | |
| 💇 | `OK` | 2 | pelo | Pares | es, es-DO | 0/2 | |
| 🐀 | `OK` | 2 | rata | Pares | es, es-DO | 0/2 | |
| 🏠 | `OK` | 2 | casa | Pares | es, gl | 0/2 | |
| 🏹 | `OK` | 2 | caza | Pares | es, gl | 0/2 | |
| 8️⃣ | `OK` | 2 | ocho | Pares | es, es-DO | 0/2 | |
| 🐻 | `OK` | 2 | oso | Pares | es, es-DO | 0/2 | |
| 🍵 | `OK` | 1 | taza | Progresión | es | 0/1 | |
| 🍌 | `OK` | 1 | mangú | Escenario | es-DO | 0/1 | |
| 🍚 | `OK` | 1 | arroz | Escenario | es-DO | 0/1 | |
| 🏪 | `OK` | 1 | colmado | Escenario | es-DO | 0/1 | |
| 🛍️ | `OK` | 1 | funda | Escenario | es-DO | 0/1 | |
| 🔔 | `OK` | 1 | tilín | Escenario | es-DO | 0/1 | |
| 🏖️ | `OK` | 1 | playa | Progresión | es-DO | 0/1 | |
| 🏝️ | `OK` | 1 | arena | Progresión | es-DO | 0/1 | |
| ⛰️ | `OK` | 1 | cerro | Pares | es | 0/1 | |
| 0️⃣ | `OK` | 1 | cero | Pares | es | 0/1 | |
| 🌍 | `OK` | 1 | tierra | Pares | es | 0/1 | |
| 😘 | `OK` | 1 | beso | Pares | es | 0/1 | |
| 🧀 | `OK` | 1 | queso | Pares | es | 0/1 | |
| 🦭 | `OK` | 1 | foca | Pares | es | 0/1 | |
| 🍯 | `OK` | 1 | miel | Pares | es | 0/1 | |
| 🦆 | `OK` | 1 | pato | Pares | es | 0/1 | |
| 🎒 | `OK` | 1 | saco | Pares | es-DO | 0/1 | |
| 📐 | `OK` | 1 | taco | Pares | es-DO | 0/1 | |
| 🛣️ | `OK` | 1 | rúa | Pares | gl | 0/1 | |
| 👑 | `OK` | 1 | rei | Pares | gl | 0/1 | |
| 📜 | `OK` | 1 | lei | Pares | gl | 0/1 | |
| 🙆 | `OK` | 1 | testa | Pares | gl | 0/1 | |
| 🔥 | `OK` | 1 | su | Pares | eu | 0/1 | |
| 🔊 | `OK` | 1 | hots | Pares | eu | 0/1 | |
| 🗣️ | `OK` | 1 | hitz | Pares | eu | 0/1 | |
| 😔 | `OK` | 1 | hits | Pares | eu | 0/1 | |
| 👏 | `OK` | 1 | txalo | Pares | eu | 0/1 | |
| 🃏 | `OK` | 1 | karta | Pares | eu | 0/1 | |
| 🎂 | `OK` | 1 | tarta | Pares | eu | 0/1 | |

## Cápsulas de contraste con emoji repetido

Con la regla de congruencia de ES-13 ambas vueltas muestran el mismo objeto, así que con
emoji la vuelta de comprensión enseña dos tarjetas idénticas. Lo que decide si la cápsula
funciona es tener un pictograma DISTINTO por vuelta.

### Resueltas por pictograma (16)

- `es-DO/do-cap-abrir-cerrar`
- `es-DO/do-cap-frio-caliente`
- `es-DO/do-cap-grande-chiquito`
- `es-DO/do-cap-limpio-sucio`
- `es-DO/do-cap-prender-apagar`
- `es/cap-abrir-cerrar`
- `es/cap-encender-apagar`
- `es/cap-frio-caliente`
- `es/cap-grande-pequeno`
- `es/cap-limpio-sucio`
- `es/cap-lleno-vacio`
- `eu/cap-garbi-zikin`
- `eu/cap-handi-txiki`
- `eu/cap-hotz-bero`
- `eu/cap-ireki-itxi`
- `eu/cap-piztu-itzali`

### Todavía irresolubles

Ninguna. El gate `scripts/check-pictogram-coverage.js` lo verifica en cada build.

