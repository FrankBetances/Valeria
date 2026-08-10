# Lúa · Fase 0 · banco de pruebas

Decide **si la placa sirve**, antes de escribir firmware de producto y antes de
tocar una línea de Valeria+. Si no pasa, todo lo demás del plan cambia.

Criterios, y no son negociables a ojo:

| | Criterio | De dónde sale |
| :--- | :--- | :--- |
| Latencia | **p95 ≤ 300 ms** del veredicto al primer fotograma | §4 del plan |
| Fluidez | **≥ 20 fps** sostenidos repintando la cara | §12, Fase 0 |
| Seguridad | vuelve a reposo **sin latido**, 100 de 100 | §5 |

---

## Paso 1 · Confirmar los pines (antes de medir nada)

`include/board.h` lleva la asignación que publica el fabricante para esta
familia de placas, **sin confirmar contra el esquemático**. El manual que hay
en el repositorio no trae la tabla de GPIO del display.

Si el panel no enciende, es esto y no el código. **Una medición hecha sobre una
asignación adivinada no vale**: anótalos, corrígelos y solo entonces sigue.

## Paso 2 · Flashear

```bash
cd firmware/lua
pio run -t upload -t monitor
```

Por el monitor serie sale una línea por segundo:

```
fps=NN despacho_us=NNNN modo=N
```

`fps` es la cifra del criterio de fluidez. `despacho_us` es lo que tarda el
aparato desde que entra el callback de BLE hasta que el frame está volcado —
**no** incluye la radio.

## Paso 3 · Medir la latencia

Dos formas. Hazlas las dos: miden cosas distintas y si no coinciden, algo pasa.

**a) Extremo a extremo, con el navegador.** Es la que da la cifra del criterio.

```bash
npx serve docs        # Web Bluetooth exige contexto seguro; localhost lo es
```

Abre `http://localhost:3000/lua-bench.html` en Chrome de escritorio o de
Android (Safari no trae Web Bluetooth), conecta y pulsa **Medir 100 envíos**.
Da p50, p95, peor caso y el veredicto. El botón *Copiar informe* deja el
resultado listo para pegar en el plan.

**b) En el propio aparato, con el pin de traza.** `LUA_TRACE_PIN` se pone alto
al entrar el callback y bajo cuando el frame ya está volcado. Con un
analizador lógico ahí sale la latencia del aparato sin depender de dos relojes
que no comparten base de tiempo.

La diferencia entre (a) y (b) **es la radio más la pila BLE del móvil**. Si (a)
se pasa de 300 ms y (b) sale en decenas de microsegundos, el problema no es la
placa: es el intervalo de conexión que negocia el teléfono, y hay palanca
(`requestConnectionPriority(HIGH)` en Android).

## Paso 4 · Probar la caducidad

Botón **Probar caducidad** del banco: concede 3 s, manda una celebración y no
envía latido. La cara tiene que volver a neutra **sola**. Repítelo cortando el
Bluetooth a lo bruto (apagar la radio del móvil) y comprueba lo mismo.

Es el paso que más importa de la Fase 0 y el que menos parece: si el aparato se
queda animándose cuando el enlace muere, el diseño de seguridad de §5 no está
implementado, por mucho que la latencia salga preciosa.

## Paso 5 · Autonomía y consumo

Con la celda que se vaya a usar: tiempo hasta apagado repintando de continuo, y
consumo en reposo con el panel apagado. Sin esta cifra no se puede decidir el
tamaño de batería ni si el Modo Vínculo es viable.

---

## Qué anotar

Pega esto en `docs/plan-integracion-lua.md` §15, con fecha:

```
Placa:                          (modelo exacto y revisión)
Pines confirmados:              sí / no · correcciones
Latencia p50 / p95 / peor:      __ / __ / __ ms
Despacho en el aparato:         __ ms
fps sostenidos:                 __
Vuelve a reposo sin latido:     __ de __ intentos
Autonomía repintando:           __ min
Consumo en reposo:              __ mA
VEREDICTO:                      pasa / no pasa
```

## Lo que este firmware NO hace, y no debe hacer

No inicializa audio, ni micrófono, ni servos. `scripts/check-lua-mute.js` falla
el build si aparecen. La placa elegida no lleva códec, pero la e-Paper del
banco sí: el día que alguien reutilice este firmware allí, ese gate es lo único
que avisa.
