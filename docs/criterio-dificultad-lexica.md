# Criterio de dificultad léxica · categorías de vocabulario (ES-08 · DC-1 opción C)

> Documento de referencia del campo `difficulty` de `LexicalItem`.
> Verificado estructuralmente por `scripts/check-lexical-difficulty.js`.
> Origen: `docs/plan-mejoras-acopros-logopedas.json` → ES-08, DC-1.

## De dónde sale el criterio

Las logopedas de ACOPROS lo formularon con un ejemplo que define mejor la regla
que cualquier enunciado abstracto:

> «Al organizar por categorías, seguir una progresión de dificultad: en frutas
> empezar por **manzana, plátano o naranja** e introducir después **mango, piña
> o cereza**.»

Conviene mirar qué **no** ordena esa lista. *Manzana* tiene tres sílabas y
*plátano* lleva un grupo consonántico; *piña* es más corta y articulatoriamente
más simple, y sin embargo va después. Es decir: **la progresión no la marca la
dificultad de pronunciación, sino la familiaridad**.

Tiene sentido clínico. La complejidad articulatoria es el objeto de Pares
Mínimos, que trabaja el fonema y construye cada par para que el error esperable
del niño produzca la otra palabra. Las categorías léxicas trabajan otra cosa:
**ampliar el vocabulario disponible**. Ahí lo que ordena es cuánto ha oído el
niño esa palabra en su casa.

## Los tres niveles

| Nivel | Definición | Qué se pregunta al asignarlo |
| --- | --- | --- |
| **1 · lo más familiar** | Vocabulario temprano, presente en el entorno cotidiano de cualquier niño de esa variedad. | ¿Está en casa, en la mesa o en la calle todas las semanas? |
| **2 · familiar** | Conocido, pero menos frecuente o dependiente de la exposición concreta del niño. | ¿Lo reconoce, aunque no lo diga a diario? |
| **3 · menos frecuente** | Adquisición más tardía o baja frecuencia de uso. | ¿Hay que ir a buscarlo —al zoo, a un libro, a una ocasión especial? |

El nivel 1 de **Frutas** es literalmente el que puso ACOPROS (manzana, plátano,
naranja) y el nivel 3 también (piña, cereza). El resto de categorías se calibra
con esa misma lógica.

## Fuentes del criterio

El criterio se apoya en la literatura estándar sobre adquisición léxica en
español:

- **Inventarios del Desarrollo de Habilidades Comunicativas** (adaptación
  española de los MacArthur-Bates CDI), para el vocabulario típico por edad.
- **Normas subjetivas de edad de adquisición** para el español (Alonso,
  Fernandez y Díez, *Behavior Research Methods*, 2015).
- **EsPal** (Duchon, Perea, Sebastián-Gallés, Martí y Carreiras, 2013), base de
  datos de frecuencia léxica del español.

### Lo que este documento NO afirma

La asignación de nivel de cada ítem es una **primera pasada para revisión
clínica**, no el resultado de consultar esas bases palabra por palabra. Se
apoya en el criterio que fijó ACOPROS y se documenta precisamente para que
puedan corregirla ítem a ítem. Si una palabra está en el nivel equivocado, el
arreglo es cambiar un número en el dato, no rehacer nada.

## La frecuencia no se hereda entre variedades

Es el riesgo que el plan marcó explícitamente, y la fruta es el caso de libro:

| | Castellano peninsular | Español dominicano |
| --- | --- | --- |
| Fruta amarilla y curva que se come cruda | **plátano** | **guineo** |
| **plátano** | esa misma fruta | el de freír: mangú, tostones |

Aplicar la lista peninsular a `es-DO` pondría al niño dominicano a nombrar una
fruta que en su casa se llama de otra forma — exactamente el sesgo que la
[guía dialectal](./guia-dialectal-es-DO.md) corrigió. Por eso el banco es-DO
tiene su nivel 1 propio (guineo, manzana, naranja) y sube a nivel 3 dos frutas
que en la península ni aparecen: **lechosa** (papaya) y **chinola** (maracuyá).

El mismo principio en euskera y en transportes: el banco dominicano empieza por
**carro** y **guagua**, no por «coche» y «autobús».

## Qué comprueba el gate y qué no

`scripts/check-lexical-difficulty.js` verifica la **estructura**:

- **D1** · todo ítem de una categoría declara su nivel, y está entre 1 y 3;
- **D2** · los ítems están escritos en orden ascendente, porque **el orden de
  escritura es el orden de práctica**: un ítem avanzado colado entre los
  iniciales se le presenta al niño en su primera sesión;
- **D3** · toda categoría tiene al menos un ítem de nivel 1, o con el tope
  puesto en 1 se abriría vacía;
- **D4** · las tres variedades tienen el mismo número de categorías, para que
  ningún niño pierda un bloque entero sin que nadie se entere.

**No** comprueba si *manzana* es de verdad más familiar que *cereza*. Eso es
juicio clínico y va a la revisión de ACOPROS.

## El tope de nivel

El logopeda fija desde el PIN profesional el **nivel máximo** que se practica.
Con el tope en 1, la sesión solo presenta las palabras más familiares de cada
categoría — que es el criterio de aceptación literal de ES-08: *«la primera
sesión de una categoría solo presenta ítems de nivel inicial»*. La preferencia
se persiste con el resto de la prescripción.
