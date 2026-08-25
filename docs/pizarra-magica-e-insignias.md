# Insignias de Lúa · voz de la vibrante · láminas de frase · Pizarra Mágica

Qué entró, qué NO entró y qué hay que mirar antes de dar nada por hecho. Sustituye
a la memoria técnica que venía en la raíz del repo (`README_ACTUALIZACION_LUA_VOZ_ESCRITURA.md`),
cuyo apartado de verificación daba por sincronizado un corpus de voz al que le
faltaban doce locuciones.

## 1 · Insignias

Los nueve glifos de 24×24 de [`src/ValeriaPixelArt.ts`](../src/ValeriaPixelArt.ts)
se rediseñaron para atarlos a Lúa. Tres de ellos se volvieron a dibujar después,
porque **a 30 px —el tamaño real de la hoja de premios— no se leían**:

| Glifo | Qué pasaba | Qué se hizo |
| --- | --- | --- |
| `paw` · Huella | Cuatro dedos diminutos y una almohadilla ancha con dos marcas: a 30 px se leía como una cara | Tres dedos gordos en arco sobre una almohadilla más estrecha, en crema (`q`) sobre placa oscura |
| `flame` · Cascabel | Amarillo con un hueco negro grande: un bolso, no un cascabel | Campana con anilla, ranura en cruz, labio naranja y badajo |
| `star` · Orejitas | Cuerpo en gris medio (`G`, #68707e), que es EXACTAMENTE el gris de "bloqueada" | Mismo dibujo en crema, ojos en negro; ganada y bloqueada ya no se confunden |

Los otros seis (`sunrise`, `moon`, `home`, `yarn`, `heart`, `crown`) se quedan
como los dejó el rediseño.

**Los textos.** Los nombres son los de Lúa. Las descripciones volvieron a decir
la **regla de desbloqueo**: la versión poética se comía la condición («Practica
por la mañana» ya no decía *antes de las 10*) y además no cabía —seis de las
dieciocho salían cortadas con «…» en la tarjeta—. El presupuesto es de tres
líneas de 10 px (`numberOfLines={3}` en `ValeriaAwardsSheet`), unos 55 caracteres.

**Pendiente, y no se puede cerrar desde aquí:** el firmware del periférico Lúa
**copia** estas nueve matrices (README §«Y desde el 14/8/2026 no es solo la
cara»). Con los glifos redibujados, el cristal de 240×240 sigue pintando los
antiguos hasta que se suban al repositorio del firmware. `check-lua-mascot-mirror`
no lo detecta: solo vigila `MOOD` y `ACCESSORY`.

## 2 · Voz: la vibrante múltiple

Los bancos de pares mínimos escribían el trino como grafía repetida (`¡Rrrana!`,
`perrro`, `Rrrúa!`). Ningún sintetizador —Google TTS, Apple Speech, Piper— tiene
eso en su léxico: lo deletrea o lo rompe. Se limpiaron las cuatro variedades:
castellano, galego, **dominicano** e **inglés** (las dos últimas se habían
quedado fuera del primer arreglo).

`sanitizePhonetics` en [`src/valeriaVoice.ts`](../src/valeriaVoice.ts) es la red
de seguridad en tiempo de ejecución. Dos avisos que costaron sangre:

- **`\b` no vale.** En JavaScript `\w` es `[A-Za-z0-9_]`, así que una vocal
  acentuada cuenta como frontera de palabra: `\brr` disparaba dentro de
  *Ciérrala*, *susúrrale* y *agárrate*, que perdían el trino. La clase de letra
  se escribe entera.
- **Ni alargamientos ni trinos sueltos.** «luuuna», «graaande» y «¡ooooh!» son
  consigna terapéutica —el adulto estira la vocal mientras dibuja el gesto—, y
  una «rrr» aislada («la lengua hace el motor: rrr») es el modelo que se pide
  imitar. Las dos reglas exigen una letra que no sea erre detrás, así que ninguno
  de los dos casos se toca.

La velocidad de modelado (`speakWordSlow` 0.6 · `speakPhraseSlow` 0.65 ·
`speakClinical` techo 0.9) **no se cambia**: es un parámetro clínico y subirlo
no arreglaba la vibrante.

## 3 · Láminas de la frase

[`src/ValeriaSentenceWordCards.tsx`](../src/ValeriaSentenceWordCards.tsx) parte
la frase objetivo en láminas numeradas que se encienden conforme el ASR las
reconoce (tolerancia de un fonema en palabras de más de tres letras). Va dentro
de `MicPracticeCard`, así que sale en las cinco pantallas del player que piden
micro. Con una sola palabra no se pinta.

La salida por frase corta va **después** de los hooks. Antes iba antes, y como
`MicPracticeCard` no se remonta al cambiar de objetivo, el número de hooks
variaba entre renders: pantalla roja («Rendered more hooks…») en cuanto un banco
mezclase una palabra suelta con una frase.

## 4 · La Pizarra Mágica

Trazado guiado con pauta Montessori y puntos de control numerados, para el orden
direccional que evita la inversión b/d. Tres piezas:
[`ValeriaWritingCanvas`](../src/ValeriaWritingCanvas.tsx) (SVG + `PanResponder`),
[`valeriaWritingBank`](../src/valeriaWritingBank.ts) (6 trazos: b, d, p, m, olas
y bucles) y [`ValeriaWritingExerciseScreen`](../src/ValeriaWritingExerciseScreen.tsx).
La geometría vive en [`valeriaWritingTypes`](../src/valeriaWritingTypes.ts), un
módulo puro, para que el banco pueda entrar en el corpus de voz sin arrastrar
react-native.

Entra en el hub como **Grafomotricidad**, junto a Dislexia, con la ruta `Writing`
del stack. Antes no la abría nadie: eran mil líneas que compilaban y que en la
app no existían.

Los tres elogios que locuta salen de `WRITING_PRAISE*` (en el banco, no en el
catálogo de interfaz) y están en el corpus bajo la fuente `escritura/elogio`, en
las cuatro variedades. Lo que se ve en pantalla —títulos y consignas de cada
trazo— es **solo castellano** de momento; no se pronuncia.

El botón dice «Oír la letra» y no «Oír fonema» porque lo que suena es el nombre
de la letra. Un modelo de fonema aislado necesita su propia grabación.

## 5 · Antes de dar esto por hecho

`npm run typecheck` limpio y catorce de los quince gates en verde no bastan. El
que falta es el que manda:

```bash
node scripts/check-voice-corpus-coverage.js
```

Falla mientras haya locuciones sin asset. Cambiar texto locutado obliga a
`node scripts/export-voice-corpus.js` **en el mismo commit** y a que
«Generate Voice Assets» sintetice lo nuevo; ese workflow solo arranca solo en
ramas `claude/**`. Hasta que termine y commitee los `.m4a`, esas frases suenan
con la voz del sistema y en galego y euskera se pierden Celtia e ILENIA.
