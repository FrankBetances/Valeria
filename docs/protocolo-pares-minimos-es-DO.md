# Protocolo · Pares Mínimos es-DO (Quisqueya Habla) — QH-2.1

> Banco: `src/valeriaMinimalPairsEsDO.ts` · Guía dialectal:
> [guia-dialectal-es-DO.md](./guia-dialectal-es-DO.md).
> Estado: 🟡 **borrador** pendiente de validación logopédica dominicana.

## Diseño

Banco de 8 pares de contraste fonológico adaptado del castellano bajo las
reglas de la guía dialectal. Se **excluyen** los contrastes inválidos en RD
(seseo, codas líquidas) y se trabajan solo procesos fonológicos infantiles
universales. Mismo principio que el banco castellano: el error de sustitución
habitual del niño produce la otra palabra del par, de modo que el reconocedor
funciona como detector clínico — y el adulto corrige el veredicto si hace falta.

## Inventario

| Código | Par | Contraste | Proceso | Nota dialectal |
| --- | --- | --- | --- | --- |
| PM-DO-1 | rana / lana | r̄ → l | Rotacismo inicial (ataque) | Contraste estable en ataque |
| PM-DO-2 | rata / lata | r̄ → l | Rotacismo inicial | — |
| PM-DO-3 | perro / pelo | r̄ → l | Rotacismo intervocálico | Trill intervocálico estable |
| PM-DO-4 | ocho / oso | tʃ ↔ s | Despalatalización | — |
| PM-DO-5 | saco / taco | s → t | Oclusivización de fricativa | /s/ en ataque, no coda |
| PM-DO-6 | cubo / tubo | k → t | Frontalización velar inicial | Proceso universal |
| PM-DO-7 | boca / bota | k → t | Frontalización velar media | Proceso universal |
| PM-DO-8 | fuente / puente | f → p | Oclusivización de fricativa | Proceso universal |

**Excluidos respecto al banco castellano:** `casa/caza` (seseo, sin /θ/) y
`cerro/cero` / `sierra/tierra` se revisan aparte por el revisor (el segundo se
mantiene como s→t en la forma `saco/taco`, de léxico más infantil en RD).

## Voz y micrófono

- **Sin audio pregenerado**: es-DO usa la **voz del sistema** en español latino
  (es-US/es-MX) y el **ASR del sistema** con locale `es-DO` (Android) / es-MX/
  es-US (iOS). Ver `valeriaLocale.ts` (`speechLocale`, `prefersLatinVoice`).
- Consignas y misiones en **registro dominicano** (papi, colmado, guagua…).

## Pendiente de revisión (bloqueante antes del piloto)

- [ ] Validación logopédica del inventario y de los procesos objetivo por edad.
- [ ] Confirmar naturalidad del léxico infantil (saco, chichigua…) con el revisor.
- [ ] Ajustar `stt_expected_array` (aún no definidos aquí) con realizaciones
      caribeñas cuando se conecte el ASR de pares es-DO.
- [ ] Completar hasta ~10 pares si el revisor lo estima necesario.
