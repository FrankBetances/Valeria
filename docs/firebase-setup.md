# Firebase en Valeria+

Backend de Valeria+ para probar la app con profesionales: **Firebase
Authentication (email/contraseña)** + **Cloud Firestore**.

- **SDK:** `firebase` (SDK JS), no `@react-native-firebase`. Funciona en
  Android, iOS y web con el mismo código, sin módulos nativos ni rebuilds.
- **Proyecto Firebase:** número `665213943480`.
- **App:** Android, package `health.earlify.valeria`.

## Qué ya está en el código

| Pieza | Archivo |
| --- | --- |
| Config del SDK (claves públicas) | `src/firebase/firebaseConfig.ts` |
| Inicialización App + Auth + Firestore | `src/firebase/firebaseApp.ts` |
| Contexto de sesión `useAuth()` / `<AuthProvider>` | `src/firebase/AuthContext.tsx` |
| Mensajes de error en español | `src/firebase/authErrors.ts` |
| Servicio de datos (pacientes/sesiones) | `src/firebase/firestoreService.ts` |
| Pantalla de acceso profesional | `src/ValeriaAuthScreen.tsx` |
| Reglas de seguridad | `firestore.rules` |
| Índices | `firestore.indexes.json` |
| Config CLI | `firebase.json`, `.firebaserc` |

`<AuthProvider>` ya envuelve la app en `src/AppNavigator.tsx`, así que
`useAuth()` está disponible en cualquier pantalla. La integración es **aditiva**:
no cambia el flujo local con AsyncStorage que ya funciona.

## Pasos pendientes (requieren la Firebase CLI autenticada)

Estos pasos tocan tu proyecto en la nube y necesitan que la CLI tenga permisos.
Ejecútalos en tu máquina (tienen navegador) o dame un token/cuenta de servicio
para hacerlos yo desde este entorno.

1. **Autenticar la CLI e identificar el projectId** (el número `665213943480`
   tiene un `projectId` en texto asociado):

   ```bash
   npx -y firebase-tools@latest login
   npx -y firebase-tools@latest projects:list          # localiza el projectId del nº 665213943480
   npx -y firebase-tools@latest use <PROJECT_ID>        # rellena .firebaserc
   ```

2. **Registrar la app Android** (si no existe ya):

   ```bash
   npx -y firebase-tools@latest apps:create ANDROID "Valeria+ Android" \
     --package-name health.earlify.valeria --project <PROJECT_ID>
   ```

3. **Obtener las claves del SDK y rellenar `src/firebase/firebaseConfig.ts`:**

   ```bash
   npx -y firebase-tools@latest apps:list ANDROID --project <PROJECT_ID>
   npx -y firebase-tools@latest apps:sdkconfig ANDROID <APP_ID> --project <PROJECT_ID>
   ```

   Copia `apiKey`, `appId`, `projectId` y `storageBucket` a
   `firebaseConfig`. `messagingSenderId` ya es `665213943480`.

4. **Habilitar el proveedor email/contraseña** y desplegar reglas:

   ```bash
   npx -y firebase-tools@latest deploy --only auth
   npx -y firebase-tools@latest deploy --only firestore
   ```

   El `deploy --only firestore` **crea la base de datos Firestore** (edición
   Standard, base por defecto) y publica `firestore.rules` + los índices.

## Probar en local sin tocar producción (emuladores)

```bash
npx -y firebase-tools@latest emulators:start --only auth,firestore
```

## Reglas de seguridad — nota importante

He preparado unas **Security Rules prototipo** en `firestore.rules` para
mantener seguros los datos en Firestore. Están diseñadas para que **cada
profesional autenticado solo pueda leer y escribir SUS propios datos**
(perfil, pacientes y sesiones cuelgan de `professionals/{uid}` y se comprueba
`request.auth.uid`). Aun así, **debes revisarlas y verificarlas** antes de
compartir la app de forma amplia. Si quieres, te ayudo a endurecerlas
(validación de campos por documento, formatos, límites de tamaño, etc.).
