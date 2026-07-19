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

- Saltarse las reglas de acceso de Cloud Firestore (`firestore.rules`) para leer
  o escribir datos de otro profesional o paciente.
- Fugas de credenciales o de datos clínicos.
- Fallos de autenticación (Firebase Auth email/contraseña).
- Cualquier vía que permita acceso no autorizado a datos de pacientes.

## Modelo de seguridad de los datos

- **Control de acceso**: toda la información vive bajo
  `professionals/{uid}/…` y las reglas de Firestore aplican un modelo
  *deny-by-default*: cada profesional autenticado accede **únicamente** a sus
  propios documentos, y el campo `uid` (dueño) es inmutable. Cualquier ruta no
  declarada está denegada.
- **Autenticación**: Firebase Auth con email/contraseña.
- **Secretos**: no se versiona ninguna credencial. La configuración de Firebase
  se inyecta desde variables de entorno `EXPO_PUBLIC_*` (ver `.env.example`) y
  las claves de firma / tokens viven en *GitHub Actions Secrets*. La web/app
  config de Firebase es pública por diseño; la seguridad real la imponen las
  Security Rules.

> **Recordatorio**: tras cualquier cambio en `firestore.rules`, despliégalas
> con `firebase deploy --only firestore:rules`. Las reglas del repositorio solo
> protegen si están efectivamente publicadas en el proyecto.

## Vulnerabilidades conocidas en dependencias

- **`xmldom` (crítica, GHSA-crh6-fp67-6883 y relacionadas)**: entra de forma
  transitiva a través de `@react-native-voice/voice → @expo/plist`. Es una
  dependencia de **tiempo de build** (parseo de archivos `.plist` en el
  prebuild nativo), no de ejecución en el dispositivo del usuario final. La
  corrección (`npm audit fix --force`) degrada `@react-native-voice/voice` a
  una versión con cambios de ruptura, por lo que se pospone hasta poder
  validar el reconocimiento de voz. Riesgo aceptado y bajo seguimiento.

Para revisar el estado actual: `npm audit`.

## Versiones soportadas

Se da soporte de seguridad a la última versión publicada en la rama `main`.
