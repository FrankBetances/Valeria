#!/usr/bin/env bash
# =============================================================================
# Valeria+ · Comprobación previa del port nativo iOS
#
#   ./scripts/preflight.sh            # solo comprobaciones (segundos)
#   ./scripts/preflight.sh --build    # además compila para simulador (minutos)
#
# Pensado para ejecutarlo NADA MÁS clonar el repositorio, antes de abrir Xcode.
# Responde a la única pregunta que importa en ese momento: ¿le falta algo a esta
# copia para compilar? Cada aviso dice qué hacer, no solo qué pasa.
#
# Sin CocoaPods: las dependencias son paquetes Swift y las resuelve Xcode desde
# el propio .xcodeproj. No hay `pod install` que ejecutar.
# =============================================================================
set -uo pipefail

cd "$(dirname "$0")/.."

VERDE=$'\033[0;32m'; ROJO=$'\033[0;31m'; AMBAR=$'\033[0;33m'; FIN=$'\033[0m'
fallos=0
avisos=0

ok()    { echo "${VERDE}✓${FIN} $1"; }
aviso() { echo "${AMBAR}!${FIN} $1"; avisos=$((avisos + 1)); }
error() { echo "${ROJO}✗${FIN} $1"; fallos=$((fallos + 1)); }

echo "── Entorno ──────────────────────────────────────────────"

if [ "$(uname -s)" != "Darwin" ]; then
  error "Esto no es macOS. Xcode solo existe en Mac; el resto de comprobaciones se salta."
  echo
  echo "  El proyecto React Native de la raíz sí compila desde cualquier sistema"
  echo "  con 'npx eas build -p ios' (build en la nube de Expo)."
  exit 1
fi
ok "macOS $(sw_vers -productVersion)"

if ! xcode-select -p >/dev/null 2>&1; then
  error "No hay Xcode seleccionado. Instala Xcode desde la App Store y luego:
      sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
elif ! command -v xcodebuild >/dev/null 2>&1; then
  error "Falta xcodebuild. Abre Xcode una vez para que instale los componentes."
else
  VERSION=$(xcodebuild -version | head -1 | awk '{print $2}')
  MAYOR=${VERSION%%.*}
  MENOR=$(echo "$VERSION" | cut -d. -f2); MENOR=${MENOR:-0}
  if [ "$MAYOR" -lt 15 ] || { [ "$MAYOR" -eq 15 ] && [ "$MENOR" -lt 2 ]; }; then
    error "Xcode $VERSION. El proyecto necesita 15.2 o posterior (Firebase 11 no compila con menos)."
  else
    ok "Xcode $VERSION"
  fi
fi

echo
echo "── Proyecto ─────────────────────────────────────────────"

[ -f Valeria.xcodeproj/project.pbxproj ] \
  && ok "Valeria.xcodeproj encontrado" \
  || error "No se encuentra Valeria.xcodeproj. ¿Estás dentro de ios-native/?"

# La regla de gobernanza del pbxproj, comprobada: un .swift que existe en disco
# pero no está en la fase Sources NO da error de sintaxis, da un error de
# «símbolo no encontrado» a mitad de la compilación, que despista mucho más.
shopt -s nullglob
fuentes=(Valeria/*.swift)
shopt -u nullglob
if [ ${#fuentes[@]} -eq 0 ]; then
  error "No hay ningún .swift en Valeria/. El clon parece incompleto."
else
  sueltos=0
  for f in "${fuentes[@]}"; do
    base=$(basename "$f")
    grep -q "$base in Sources" Valeria.xcodeproj/project.pbxproj 2>/dev/null \
      || { error "$base existe en disco pero NO está en la fase Sources del pbxproj"; sueltos=$((sueltos + 1)); }
  done
  [ "$sueltos" -eq 0 ] && ok "los ${#fuentes[@]} archivos .swift están registrados en el pbxproj"
fi

[ -f "Valeria/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png" ] \
  && ok "AppIcon 1024×1024 presente" \
  || aviso "AppIcon vacío: la app saldrá sin icono y App Store Connect rechazará la subida."

echo
echo "── Firma ────────────────────────────────────────────────"

if [ -f Config/Signing.local.xcconfig ]; then
  EQUIPO=$(sed -n 's/^[[:space:]]*DEVELOPMENT_TEAM[[:space:]]*=[[:space:]]*//p' Config/Signing.local.xcconfig | tr -d ' \r')
  IDENT=$(sed -n 's/^[[:space:]]*VALERIA_BUNDLE_ID[[:space:]]*=[[:space:]]*//p' Config/Signing.local.xcconfig | tr -d ' \r')
  if [ -z "$EQUIPO" ] || [ "$EQUIPO" = "ABCDE12345" ]; then
    aviso "Config/Signing.local.xcconfig existe pero el Team ID sigue siendo el de la plantilla."
  else
    ok "Team ID local configurado ($EQUIPO)"
  fi
  [ -n "$IDENT" ] && ok "bundle ID propio: $IDENT"
elif [ -n "${VALERIA_DEVELOPMENT_TEAM:-}" ]; then
  ok "Team ID en el entorno ($VALERIA_DEVELOPMENT_TEAM)"
else
  aviso "Sin Team ID. El SIMULADOR compila igual: para revisar navegación y
      estética no hace falta ninguna cuenta. Solo se necesita para instalarlo en
      un iPhone o iPad real.
      Para configurarlo:  cp Config/Signing.local.xcconfig.example Config/Signing.local.xcconfig
      (el .example explica dónde está el Team ID, también el de cuenta gratuita)."
fi

# Un identificador solo puede registrarlo un equipo. Con cuenta gratuita y el
# identificador de producción, el fallo aparece al conectar el dispositivo, no
# al compilar, y el mensaje de Xcode no dice que la salida es cambiarlo.
if command -v security >/dev/null 2>&1; then
  if security find-identity -v -p codesigning 2>/dev/null | grep -q "Apple Development"; then
    ok "hay un certificado «Apple Development» en el llavero"
    if ! security find-identity -v -p codesigning 2>/dev/null | grep -qi "Apple Distribution\|iPhone Distribution"; then
      aviso "Sin certificado de distribución: es lo normal con cuenta gratuita.
      Puedes compilar y ejecutar en tu dispositivo, pero NO exportar para
      Firebase App Distribution ni TestFlight (eso pide el programa de pago).
      Para un .ipa de desarrollo:  ./scripts/archive.sh dev
      Recuerda que la firma gratuita CADUCA A LOS 7 DÍAS: pasado ese plazo la
      app deja de abrirse en el dispositivo y hay que reinstalarla desde Xcode."
    fi
  else
    aviso "No hay ningún certificado de firma en el llavero todavía. Xcode lo crea
      solo la primera vez que añades tu Apple ID en Settings → Accounts y eliges
      el equipo en la pestaña Signing & Capabilities."
  fi
fi

echo
echo "── Firebase (opcional) ──────────────────────────────────"

if [ -f Valeria/GoogleService-Info.plist ]; then
  ok "GoogleService-Info.plist presente"
else
  aviso "Sin GoogleService-Info.plist. La app arranca igual (el arranque de Firebase
      es defensivo), pero no reporta a Analytics ni a Crashlytics. Descárgalo de la
      consola de Firebase y arrástralo al grupo Valeria en Xcode."
fi

if [ "${1:-}" = "--build" ]; then
  echo
  echo "── Compilación de prueba (simulador) ────────────────────"
  echo "  Resolviendo paquetes Swift; la primera vez tarda varios minutos…"
  if xcodebuild -project Valeria.xcodeproj -scheme Valeria \
       -destination 'generic/platform=iOS Simulator' \
       -configuration Debug build CODE_SIGNING_ALLOWED=NO >/tmp/valeria-preflight.log 2>&1; then
    ok "compila para simulador"
  else
    error "la compilación ha fallado. Últimas líneas del registro:"
    tail -25 /tmp/valeria-preflight.log | sed 's/^/      /'
    echo "      (registro completo en /tmp/valeria-preflight.log)"
  fi
fi

echo
echo "─────────────────────────────────────────────────────────"
if [ "$fallos" -gt 0 ]; then
  echo "${ROJO}$fallos problema(s) que impiden compilar${FIN}${avisos:+ · $avisos aviso(s)}"
  exit 1
fi
if [ "$avisos" -gt 0 ]; then
  echo "${AMBAR}$avisos aviso(s)${FIN} · se puede compilar y ejecutar en simulador"
else
  echo "${VERDE}Todo listo.${FIN}"
fi
echo
echo "Siguiente paso:  open Valeria.xcodeproj    (esquema Valeria, ⌘R)"
