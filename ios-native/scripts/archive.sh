#!/usr/bin/env bash
# =============================================================================
# Valeria+ · Archivar y exportar el port nativo iOS
#
#   ./scripts/archive.sh dev      [número-de-build]   → .ipa de desarrollo
#   ./scripts/archive.sh adhoc    [número-de-build]   → .ipa para App Distribution
#   ./scripts/archive.sh appstore [número-de-build]   → .ipa para App Store Connect
#
# CUENTA GRATUITA: solo funciona `dev`. Los otros dos modos necesitan un
# certificado de distribución y ese lo emite únicamente el Apple Developer
# Program de pago. Y para probar en tu propio iPad ni siquiera hace falta `dev`:
# con ⌘R desde Xcode se instala directamente.
#
# El número de build es opcional. Si no se pasa, se usa el CURRENT_PROJECT_VERSION
# del proyecto. App Store Connect RECHAZA una subida cuyo número de build ya
# exista para esa versión de marketing, así que en cada envío hay que subirlo:
#
#   ./scripts/archive.sh appstore 7
#
# Requisitos: macOS con Xcode y las herramientas de línea de comandos, y el Team
# ID resuelto (Config/Signing.xcconfig explica las dos vías).
#
# Este proyecto NO usa CocoaPods: las dependencias son paquetes Swift (SPM) y se
# resuelven desde el propio .xcodeproj. Por eso se compila el -project y no un
# -workspace, y no hay ningún `pod install` que ejecutar antes.
# =============================================================================
set -euo pipefail

cd "$(dirname "$0")/.."

MODO="${1:-adhoc}"
BUILD="${2:-}"

case "$MODO" in
  dev)      OPCIONES="Config/ExportOptions-Development.plist" ;;
  adhoc)    OPCIONES="Config/ExportOptions-AdHoc.plist" ;;
  appstore) OPCIONES="Config/ExportOptions-AppStore.plist" ;;
  *)
    echo "Uso: $0 [dev|adhoc|appstore] [número-de-build]" >&2
    echo "  dev      → cuenta gratuita o de pago; .ipa de desarrollo (caduca a los 7 días)" >&2
    echo "  adhoc    → solo cuenta de pago; para Firebase App Distribution" >&2
    echo "  appstore → solo cuenta de pago; para TestFlight y la tienda" >&2
    exit 2
    ;;
esac

SALIDA="build"
ARCHIVO="$SALIDA/Valeria.xcarchive"
EXPORTACION="$SALIDA/$MODO"

AJUSTES=()
[ -n "$BUILD" ] && AJUSTES+=("CURRENT_PROJECT_VERSION=$BUILD")

echo "▸ Resolviendo paquetes Swift (SPM)…"
xcodebuild -project Valeria.xcodeproj -scheme Valeria -resolvePackageDependencies

echo "▸ Archivando ($MODO)…"
rm -rf "$ARCHIVO" "$EXPORTACION"
xcodebuild archive \
  -project Valeria.xcodeproj \
  -scheme Valeria \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVO" \
  -allowProvisioningUpdates \
  "${AJUSTES[@]}"

echo "▸ Exportando el .ipa…"
if ! xcodebuild -exportArchive \
  -archivePath "$ARCHIVO" \
  -exportOptionsPlist "$OPCIONES" \
  -exportPath "$EXPORTACION" \
  -allowProvisioningUpdates; then
  echo
  if [ "$MODO" != "dev" ]; then
    echo "✗ La exportación en modo «$MODO» ha fallado." >&2
    echo "  La causa más habitual es la cuenta: adhoc y appstore necesitan un" >&2
    echo "  certificado de distribución, y ese solo lo emite el Apple Developer" >&2
    echo "  Program de pago. Con una cuenta gratuita, el modo que funciona es:" >&2
    echo "      ./scripts/archive.sh dev" >&2
  else
    echo "✗ La exportación ha fallado." >&2
    echo "  El archivo sigue en $ARCHIVO: puedes reintentar la exportación desde" >&2
    echo "  Xcode → Window → Organizer, que da mensajes de firma más concretos." >&2
  fi
  exit 1
fi

echo
echo "✓ Listo:"
find "$EXPORTACION" -name '*.ipa' -maxdepth 1
echo
echo "  El archivo queda en $ARCHIVO (también visible en Xcode → Window → Organizer)."
