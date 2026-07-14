# Firebase en Valeria+

Backend de Valeria+ para probar la app con profesionales: **Firebase
Authentication (email/contraseña)** + **Cloud Firestore**.

- **SDK:** `firebase` (SDK JS), no `@react-native-firebase`. Funciona en
  Android, iOS y web con el mismo código, sin módulos nativos ni rebuilds.
- **Proyecto Firebase:** `valeria-b500f` (número `477839657795`).
- **App:** Android, package `health.earlify.valeria`.

## Dónde vive la config del SDK (y por qué no va en el código)

`src/firebase/firebaseConfig.ts` lee la config de **variables de entorno
`EXPO_PUBLIC_*`**; en el repositorio no hay claves escritas. Aunque la web
config de Firebase es pública por diseño (la seguridad real son las Security
Rules), el secret scanning de GitHub marca cualquier clave `AIzaSy…`
que aparezca en el código, así que la mantenemos fuera:

| Entorno | Cómo se definen |
| --- | --- |
| Desarrollo local | Copia `.env.example` a `.env` (git lo ignora) y rellena los valores |
| GitHub Actions | Secrets `EXPO_PUBLIC_FIREBASE_API_KEY` y `EXPO_PUBLIC_FIREBASE_APP_ID` en *Settings → Secrets and variables → Actions* (el `projectId` y el `messagingSenderId` van fijos en el workflow porque son públicos) |
| EAS Build | `npx eas env:create` o el panel de EAS |

Las variables son `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`,
`EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` y `EXPO_PUBLIC_FIREBASE_APP_ID`.
Expo las inyecta en el bundle JS **en tiempo de build**: si cambias `.env`,
reinicia `expo start` con `-c` para limpiar la caché.

> **Si una clave llega a filtrarse en un commit** (GitHub avisa con una alerta
> de secret scanning): GitHub conserva los commits aunque se borre la rama, así
> que trata la clave como comprometida. En
> [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials?project=valeria-b500f)
> regenera la clave (*Regenerate key*) o, como mínimo, restríngela: restricción
> de aplicación **Android** (package `health.earlify.valeria` + huella SHA-1 del
> certificado de firma) y restricción de APIs a las que usa Firebase (Identity
> Toolkit, Token Service, Firestore). Después actualiza `.env`, los secrets de
> Actions y las variables de EAS con el valor nuevo.

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

1. **Autenticar la CLI** (el proyecto por defecto, `valeria-b500f`, ya está
   en `.firebaserc`):

   ```bash
   npx -y firebase-tools@latest login
   npx -y firebase-tools@latest use valeria-b500f
   ```

2. **Registrar la app Android** (si no existe ya):

   ```bash
   npx -y firebase-tools@latest apps:create ANDROID "Valeria+ Android" \
     --package-name health.earlify.valeria --project valeria-b500f
   ```

3. **Obtener las claves del SDK y rellenar `.env`** (nunca las escribas en
   archivos versionados; ver la sección de arriba):

   ```bash
   npx -y firebase-tools@latest apps:list ANDROID --project valeria-b500f
   npx -y firebase-tools@latest apps:sdkconfig ANDROID <APP_ID> --project valeria-b500f
   cp .env.example .env   # y copia apiKey y appId a las variables EXPO_PUBLIC_*
   ```

   `projectId` y `messagingSenderId` ya vienen rellenos en `.env.example`.

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
