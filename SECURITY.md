# Política de seguridad · Valeria+

Valeria+ es una aplicación clínica de rehabilitación del lenguaje que maneja
datos de profesionales y de pacientes. La seguridad y la confidencialidad de
esos datos son prioritarias. Este documento explica cómo reportar problemas de
seguridad y qué prácticas seguimos.

## Cómo reportar una vulnerabilidad

**No abras un issue público** para vulnerabilidades de seguridad: un issue es
visible para todo el mundo y expondría el problema antes de poder corregirlo.

En su lugar:

1. Usa **GitHub Security Advisories** en la pestaña *Security → Report a
   vulnerability* de este repositorio (divulgación privada y coordinada), o
2. Escribe a **frank.alberto.betances.reinoso@gmail.com** con el asunto
   `[SECURITY] Valeria+`.

Incluye, si puedes:

- Descripción del problema y su impacto.
- Pasos para reproducirlo (prueba de concepto).
- Versión / rama afectada.

Nos comprometemos a acusar recibo en un plazo razonable y a mantenerte
informado del avance de la corrección. Agradecemos la divulgación responsable y
pedimos que no publiques los detalles hasta que exista un parche.

## Alcance

Entran dentro del alcance, entre otros:

- Cualquier vía que permita a otra app del teléfono leer los datos de pacientes
  del almacenamiento privado de Valeria+.
- Cualquier salida de datos que la app no declare: la app **no abre conexiones
  propias**, así que una petición de red saliente es de por sí un hallazgo.
- Fugas de datos clínicos por exportación, registro (`logcat`) o copia de
  seguridad del sistema.
- Que el PIN profesional pueda saltarse para llegar al panel del adulto.

## Modelo de seguridad de los datos

- **No hay backend.** Desde el 7/9/2026 la app no tiene servidor, ni cuentas, ni
  SDK de nube —Firebase se retiró entero, también del port iOS, donde enlazaba
  Analytics y Crashlytics—. Eso elimina de raíz toda la clase de fallos de
  control de acceso remoto, y a cambio traslada el modelo de amenaza al
  **dispositivo**: quien tiene el teléfono tiene los datos.
- **Superficie de red**: ninguna propia. La app no hace una sola llamada; lo
  comprueba `check-data-safety-declaration.js` en cada build. Lo único que puede
  salir es el audio del turno de habla, y solo cuando el reconocimiento lo hace
  el servicio del sistema operativo en red.
- **En reposo**: la telemetría del piloto y el registro sensorial se cifran con
  `valeriaCrypto`; el PIN profesional se guarda como resumen SHA-256. **La ficha
  del paciente todavía no se cifra** (`ValeriaFichaRegistroScreen.tsx`), y es
  deuda conocida: ver §6 de `docs/play-console-seguridad-datos.md`.
- **Secretos**: los únicos son los de firma del APK, en *GitHub Actions
  Secrets*. No hay claves de servicio que filtrar porque no hay servicio.

## Vulnerabilidades conocidas en dependencias

- ~~**`xmldom` (crítica, GHSA-crh6-fp67-6883 y relacionadas)**: entra de forma
  transitiva a través de `@react-native-voice/voice → @expo/plist`.~~
  **RESUELTA** (2026-08-03). La cadena que la traía desapareció al sustituir
  `@react-native-voice/voice` por `expo-speech-recognition` en la Fase A de
  [`docs/plan-asr-privacidad-y-motor-local.md`](docs/plan-asr-privacidad-y-motor-local.md).
  El motivo de aquella migración era de privacidad, no de seguridad; cerrar esta
  vulnerabilidad fue un efecto colateral. `npm audit` ya no reporta `xmldom`.

Para revisar el estado actual: `npm audit`.

## Versiones soportadas

Se da soporte de seguridad a la última versión publicada en la rama `main`.
