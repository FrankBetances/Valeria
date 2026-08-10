// ============================================================================
// Lúa · Pines de la placa ESP32-2424S012 (ESP32-C3 + IPS circular GC9A01)
//
// ⚠ SIN CONFIRMAR CONTRA EL ESQUEMÁTICO. Estos valores son los que publica el
// fabricante para esta familia de placas, pero el manual que hay en el
// repositorio (docs del proyecto) NO trae la tabla de GPIO del display: solo
// dice "driver GC9A01" y describe el puerto de expansión SH1.0-4P.
//
// PASO 1 DE LA FASE 0, ANTES DE MEDIR NADA: confirmar estos seis pines contra
// el esquemático de la placa concreta que haya comprado Frank. Si el display
// no enciende, es esto y no el código. No dar por buena una medición hecha
// sobre una asignación adivinada.
// ============================================================================
#pragma once

#define LUA_TFT_SCLK 6
#define LUA_TFT_MOSI 7
#define LUA_TFT_DC   2
#define LUA_TFT_CS   10
#define LUA_TFT_RST  -1   // en varias revisiones va al RST del módulo
#define LUA_TFT_BL   3    // retroiluminación

// Pin de traza de la Fase 0. Se pone alto en cuanto el callback de BLE entra y
// bajo cuando el frame ya está volcado al panel: con un osciloscopio o un
// analizador lógico en este pin sale la latencia REAL del aparato, sin
// depender de relojes que no comparten base de tiempo.
#define LUA_TRACE_PIN 4

#define LUA_SCREEN_W 240
#define LUA_SCREEN_H 240
