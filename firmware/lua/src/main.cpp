// ============================================================================
// Lúa · Firmware mínimo de la FASE 0
//
// No es la mascota: es el instrumento con el que se decide si la placa sirve.
// Hace exactamente cuatro cosas, y ninguna más:
//
//   1. Levanta el servidor GATT con la tabla de opcodes generada.
//   2. Pinta la cara según el opcode que llega.
//   3. Mide y publica: microsegundos de despacho y fps sostenidos.
//   4. Implementa la máquina de estados de seguridad ENTERA (concesión con
//      caducidad + latido), porque medir la latencia de un firmware que luego
//      va a llevar esa lógica encima no dice nada si la lógica no está.
//
// Criterios de la Fase 0 (protocol.json): p95 ≤ 300 ms y ≥ 20 fps sostenidos.
// Si no pasa, la placa no sirve y hay que replantear antes de tocar la app.
//
// ── El estado seguro es REPOSO ─────────────────────────────────────────────
// Arranca en REST y solo pasa a ACTIVE con un GRANT explícito. Ningún camino
// —fallo, desconexión, brown-out, reinicio— lleva a ACTIVE sin comando
// reciente. Toda concesión caduca sin latido. Es lo que hace que un mensaje
// perdido no pueda dejar a la mascota animándose en mitad de una audiometría.
//
// ── Sin micrófono, sin altavoz, sin motores ────────────────────────────────
// Este fichero no inicializa I2S, ni ADC de micrófono, ni PWM de altavoz o
// servo, y no debe hacerlo nunca. El gate check-lua-mute.js falla el build si
// aparece cualquiera de esos símbolos.
//
// Dependencias (platformio.ini): NimBLE-Arduino y Arduino_GFX.
// ============================================================================
#include <Arduino.h>
#include <Arduino_GFX_Library.h>
#include <NimBLEDevice.h>

#include "board.h"
#include "lua_protocol.h"

// --------------------------------------------------------------------- panel
static Arduino_DataBus *bus = new Arduino_ESP32SPI(
    LUA_TFT_DC, LUA_TFT_CS, LUA_TFT_SCLK, LUA_TFT_MOSI, GFX_NOT_DEFINED);
static Arduino_GFX *gfx = new Arduino_GC9A01(bus, LUA_TFT_RST, 0, true);

// ---------------------------------------------------------------- estado
static uint8_t mode = LUA_MODE_REST;
static uint32_t grantUntilMs = 0;   // 0 = sin concesión viva
static bool locked = false;         // silencio clínico
static uint8_t face = LUA_OP_IDLE;
static volatile uint32_t dispatchUs = 0;   // último despacho medido
static uint32_t frames = 0, fpsWindowMs = 0, fps = 0;

static NimBLECharacteristic *chrState = nullptr;

// Paleta de la gata, la misma que src/ValeriaCatPixel.tsx (RGB565).
#define C_BG    0x0618  // turquesa de marca
#define C_FUR   0x39C7
#define C_LINE  0x10A4
#define C_WHITE 0xFFDF
#define C_PINK  0xFD53
#define C_EYE   0x0841

// Cara mínima de la Fase 0: no es el catálogo definitivo (eso es la Fase 4),
// es una cara con la MISMA carga de dibujo para poder medir fps con sentido.
static void drawFace(uint8_t op) {
  gfx->fillScreen(C_BG);
  gfx->fillCircle(120, 128, 92, C_FUR);
  gfx->fillTriangle(48, 60, 74, 18, 96, 66, C_FUR);
  gfx->fillTriangle(192, 60, 166, 18, 144, 66, C_FUR);
  gfx->fillTriangle(56, 58, 74, 30, 88, 62, C_PINK);
  gfx->fillTriangle(184, 58, 166, 30, 152, 62, C_PINK);

  int eyeY = 118;
  int open = 18;
  switch (op) {
    case LUA_OP_PHASE:     open = 22; break;  // atenta
    case LUA_OP_VERDICT:   open = 26; break;  // celebra
    case LUA_OP_CELEBRATE: open = 28; break;
    case LUA_OP_CALL:      open = 24; break;
    default:               open = 18; break;  // reposo
  }
  gfx->fillCircle(88, eyeY, open / 2, C_EYE);
  gfx->fillCircle(152, eyeY, open / 2, C_EYE);
  gfx->fillCircle(84, eyeY - 4, 3, C_WHITE);
  gfx->fillCircle(148, eyeY - 4, 3, C_WHITE);

  gfx->fillRoundRect(96, 150, 48, 26, 12, C_WHITE);
  gfx->fillRoundRect(114, 152, 12, 8, 4, C_PINK);
  gfx->fillCircle(58, 140, 9, C_PINK);
  gfx->fillCircle(182, 140, 9, C_PINK);
  gfx->drawCircle(120, 128, 92, C_LINE);
}

static void publishState() {
  if (!chrState) return;
  uint32_t left = (grantUntilMs > millis()) ? (grantUntilMs - millis()) / 1000 : 0;
  uint8_t buf[8] = {
      mode,
      (uint8_t)(left > 255 ? 255 : left),
      face,
      (uint8_t)LUA_PROTOCOL_VERSION,
      (uint8_t)(fps > 255 ? 255 : fps),
      (uint8_t)(dispatchUs & 0xFF),
      (uint8_t)((dispatchUs >> 8) & 0xFF),
      (uint8_t)((dispatchUs >> 16) & 0xFF),
  };
  chrState->setValue(buf, sizeof(buf));
  chrState->notify();
}

// --------------------------------------------------------------- callbacks
class CtrlCb : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic *c) override {
    // Traza ALTA en la primera instrucción del callback: todo lo que venga
    // después cuenta como latencia del aparato.
    digitalWrite(LUA_TRACE_PIN, HIGH);
    uint32_t t0 = micros();

    std::string v = c->getValue();
    if (v.size() < 4 || (uint8_t)v[0] != LUA_PROTOCOL_VERSION) {
      digitalWrite(LUA_TRACE_PIN, LOW);
      return;  // versión desconocida: se ignora, nunca se adivina
    }
    uint8_t op = (uint8_t)v[1];
    uint16_t param = (uint8_t)v[2] | ((uint16_t)(uint8_t)v[3] << 8);

    switch (op) {
      case LUA_OP_GRANT:
        if (!locked) {
          uint16_t ttl = param > LUA_GRANT_MAX_S ? LUA_GRANT_MAX_S : param;
          grantUntilMs = millis() + (uint32_t)ttl * 1000;
          mode = LUA_MODE_ACTIVE;
        }
        break;
      case LUA_OP_HEARTBEAT:
        if (!locked && mode == LUA_MODE_ACTIVE) {
          grantUntilMs = millis() + (uint32_t)LUA_GRANT_MAX_S * 1000;
        }
        break;
      case LUA_OP_IDLE:
        face = LUA_OP_IDLE;
        drawFace(face);
        break;
      case LUA_OP_BENCH:
        drawFace(face);  // frame completo, para cronometrar el volcado
        break;
      default:
        // Cualquier gesto EXIGE concesión viva. Sin ella no se dibuja: es la
        // diferencia entre un aparato que se calla solo y uno que depende de
        // que llegue un mensaje.
        if (mode == LUA_MODE_ACTIVE && !locked && millis() < grantUntilMs) {
          face = op;
          drawFace(face);
        }
        break;
    }

    dispatchUs = micros() - t0;
    digitalWrite(LUA_TRACE_PIN, LOW);
    publishState();
  }
};

class SafeCb : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic *c) override {
    std::string v = c->getValue();
    if (v.empty()) return;
    if ((uint8_t)v[0] == LUA_SAFE_CLINICAL_SILENCE) {
      locked = true;
      grantUntilMs = 0;
      mode = LUA_MODE_LOCKED;
      face = LUA_OP_IDLE;
      drawFace(face);
    } else if ((uint8_t)v[0] == LUA_SAFE_UNLOCK) {
      locked = false;
      mode = LUA_MODE_REST;
    }
    publishState();
  }
};

void setup() {
  Serial.begin(115200);
  pinMode(LUA_TRACE_PIN, OUTPUT);
  digitalWrite(LUA_TRACE_PIN, LOW);
#if LUA_TFT_BL >= 0
  pinMode(LUA_TFT_BL, OUTPUT);
  digitalWrite(LUA_TFT_BL, HIGH);
#endif

  gfx->begin();
  drawFace(LUA_OP_IDLE);

  NimBLEDevice::init("Lua");
  NimBLEServer *server = NimBLEDevice::createServer();
  NimBLEService *svc = server->createService(LUA_SERVICE_UUID);

  svc->createCharacteristic(LUA_CHR_CTRL_UUID, NIMBLE_PROPERTY::WRITE_NR)
      ->setCallbacks(new CtrlCb());
  svc->createCharacteristic(LUA_CHR_SAFE_UUID, NIMBLE_PROPERTY::WRITE)
      ->setCallbacks(new SafeCb());
  chrState = svc->createCharacteristic(
      LUA_CHR_STATE_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY);

  svc->start();
  NimBLEAdvertising *adv = NimBLEDevice::getAdvertising();
  adv->addServiceUUID(LUA_SERVICE_UUID);
  adv->start();

  Serial.println("Lua fase 0 · anunciando");
}

void loop() {
  // Caducidad: sin latido, a reposo. Sucede aquí y no en el callback a
  // propósito — si el enlace muere, no llega ningún callback y es justo el
  // caso que hay que cubrir.
  if (mode == LUA_MODE_ACTIVE && millis() >= grantUntilMs) {
    mode = LUA_MODE_REST;
    face = LUA_OP_IDLE;
    drawFace(face);
    publishState();
  }

  // fps sostenidos: se repinta continuamente y se cuenta por ventana de 1 s.
  // Es la cifra que decide si el panel aguanta una animación facial.
  drawFace(face);
  frames++;
  if (millis() - fpsWindowMs >= 1000) {
    fps = frames;
    frames = 0;
    fpsWindowMs = millis();
    Serial.printf("fps=%lu despacho_us=%lu modo=%u\n",
                  (unsigned long)fps, (unsigned long)dispatchUs, mode);
  }
}
