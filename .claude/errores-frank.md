# Registro de errores señalados por Frank (mejora recursiva, 8/11/2026)

**Cada error que Frank señala entra aquí en el MISMO turno**, con la regla que
impide repetirlo y, si se puede, una comprobación automática en
`scripts/check-frank-errors.js` (corre antes de cada push, hook guard-push).
Los hooks lo hacen obligatorio: `reglas.sh prompt` lo inyecta en cada mensaje y
`guard-stop.js` no deja cerrar el turno si Frank señaló un error y este fichero
no cambió. **No se borra ninguna fila.**

| # | Fecha | Error señalado | Regla que lo impide | Comprobación automática |
| --- | --- | --- | --- | --- |
| R1 | 3/11 | La app se infantilizó y se quitó la mascota | F5: criterio aprobado antes de diseñar; Lúa no se quita | `check-frank-errors`: Lúa en el inicio (ValeriaCatInteractiveCard) |
| R2 | 3/11 | «Hecho» sin estar hecho | F3: solo con evidencia; «no visto en Android» | Hook guard-stop bloquea «hecho/listo» sin esa frase |
| R3 | 3/11 | Gasto por encima del límite | F2: presupuesto dicho antes, parar al 80 % | — (manual) |
| R4 | 8/11 | QR de exportación profesional = imagen de ruido | Probar el QR con un lector real (jsQR) antes de entregar | `check-frank-errors`: ValeriaQRCode usa react-native-qrcode-svg |
| R5 | 8/11 | Un build por cada par de pantallas | Un solo build de publicación al final de la tanda completa | — (manual) |
| R6 | 8/11 | Solo se cambió color y letra; nada funcional | F12: lo funcional primero | — (manual) |
| R7 | 8/11 | Lúa no aparecía dentro de los módulos | F12: Lúa en cada módulo | `check-frank-errors`: ScreenHeader con `mascot = true` por defecto |
| R8 | 8/11 | Sin animaciones ni gráficos nuevos | Todo rediseño trae movimiento y gráfico propio | `check-frank-errors`: ListRow y ValeriaBlockTile usan `enterAt` |
| R9 | 8/11 | No se respondió primero a sus correcciones | S0: la respuesta va en la primera línea, antes de herramientas | — (manual) |
| R10 | 8/11 | Gráficos «basura»: el anillo de avance no basta | Pendiente: gráficos nuevos de verdad (ilustración propia por bloque) | — (pendiente) |
| R11 | 8/11 | No había sistema para que un error señalado no se repitiera | F13: mejora recursiva obligatoria por hooks | Hooks errores-prompt.js + guard-stop.js; check-frank-errors.js en cada push |
