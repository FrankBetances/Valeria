# Guía de contribución · Valeria+

Este documento describe cómo trabajar en el repositorio sin romper el build:
cómo actualizar dependencias en un proyecto Expo y cómo fusionar cambios con
la protección de rama (ruleset) activada.

> Contexto: Valeria+ es una app **Expo / React Native** (actualmente **SDK 54**).
> La titularidad del proyecto es del Dr. Frank Alberto Betances Reinoso
> (ver `LICENSE`). Para reportar problemas de seguridad, ver `SECURITY.md`.

---

## 1. Actualizar dependencias (IMPORTANTE)

En un proyecto Expo, los paquetes del núcleo están **atados a la versión del
SDK** y solo deben moverse **todos juntos**. Suben de versión cuando se
actualiza el SDK de Expo, no de forma individual. Esto incluye, entre otros:

- `expo` y todos los `expo-*` (`expo-audio`, `expo-notifications`,
  `expo-speech`, `expo-asset`, `expo-splash-screen`, `expo-status-bar`, …)
- `react`, `react-native`
- `react-native-*` (`react-native-screens`, `react-native-safe-area-context`,
  `react-native-svg`, …)
- `@types/react`, `typescript`

### ✅ Forma correcta

```bash
# Alinear TODAS las dependencias con el SDK de Expo instalado.
# Es el comando que hay que usar el 99 % de las veces:
npx expo install --fix

# Añadir un paquete nuevo compatible con el SDK:
npx expo install <paquete>

# Verificar coherencia de versiones y configuración:
npx expo-doctor
```

### ❌ Lo que NO se debe hacer

- **No** editar a mano las versiones de los paquetes Expo/React en `package.json`.
- **No** ejecutar `npm install <paquete>@latest` para dependencias del SDK.
- **No** fusionar PRs de Dependabot que suban paquetes Expo/React sueltos.
  (Por eso Dependabot está configurado para **no** tocar el ecosistema npm; ver
  `.github/dependabot.yml`.)

> **Por qué**: en el pasado, bumps sueltos llevaron `expo-audio` a `~57.0.2`,
> `react-native` a `0.86.0` y `typescript` a `~7.0.2` mientras el SDK seguía en
> 54, rompiendo el build por completo. Mover cada paquete por su cuenta
> desalinea el árbol de dependencias.

### Subir de versión el SDK de Expo (cuando toque)

Es un cambio mayor y deliberado, en su propia rama/PR:

```bash
npx expo install expo@^55        # (ejemplo) instala el nuevo SDK
npx expo install --fix           # realinea el resto de paquetes
npx expo-doctor                  # valida
npm run typecheck                # tsc --noEmit
```

### Comprobaciones locales antes de abrir PR

```bash
npm ci               # instalación limpia y reproducible desde el lockfile
npm run typecheck    # tsc --noEmit (debe salir sin errores)
npx expo-doctor      # sin desalineación de versiones
```

---

## 2. Flujo de ramas y commits

- La rama por defecto es **`main`** y está protegida (ver §3). **No** se hace
  push directo a `main`.
- Trabaja en una rama descriptiva, p. ej. `feat/panel-resultados` o
  `fix/audio-android`.
- Commits con mensajes claros. `package-lock.json` se versiona siempre junto a
  `package.json`.

```bash
git checkout -b fix/lo-que-sea
# … cambios …
git add -A
git commit -m "Describe el cambio en imperativo"
git push -u origin fix/lo-que-sea
```

---

## 3. Flujo de fusión con el ruleset

`main` está protegido por un **ruleset** que exige:

1. **Pull request obligatorio** — nada se fusiona sin PR.
2. **Status check `build` en verde** — el workflow *Android Build*
   (`.github/workflows/android.yml`) debe pasar antes de poder fusionar.

### Pasos

1. Abre un **PR** de tu rama hacia `main`.
2. Espera a que corra el CI. En la pestaña **Checks / Conversation** verás el
   check **`build`**:
   - 🟢 **verde** → se puede fusionar.
   - 🔴 **rojo** → arréglalo antes de fusionar (el ruleset lo bloquea).
3. Fusiona (se recomienda **Squash and merge** para dejar un historial limpio).
4. Borra la rama tras fusionar.

### Nota para el mantenedor (trabajo en solitario)

- **"Require review from Code Owners" está desactivado**, así que no hace falta
  una aprobación externa. Si en el futuro se activa, el autor no puede aprobar
  su propio PR y habría que fusionar con el **bypass de administrador**.
- El check `build` **no aparece en el selector del ruleset hasta que se ha
  ejecutado al menos una vez**. Si al configurar la protección no salía, era
  por eso: abre un PR que dispare el CI y luego ya podrás seleccionarlo.

---

## 4. Dependabot

- Configurado en `.github/dependabot.yml`.
- **npm**: desactivado a propósito (las deps se gestionan con `expo install`).
- **GitHub Actions**: solo actualizaciones *minor/patch* (los *major* se
  ignoran para no romper el CI, como ocurrió con `actions/checkout@v7`).
- Las **vulnerabilidades** reales se cubren con *Dependabot security updates*
  (Settings → Security) y se **revisan a mano** antes de fusionar; comprueba
  con `npm audit`.

---

## 5. Seguridad

- Nunca se versionan secretos. La config de Firebase se inyecta por variables
  `EXPO_PUBLIC_*` (ver `.env.example`); las claves reales viven en *GitHub
  Actions Secrets* / EAS.
- Tras cambiar `firestore.rules`, despliégalas:
  `firebase deploy --only firestore:rules`.
- Reporte de vulnerabilidades: ver `SECURITY.md`.
