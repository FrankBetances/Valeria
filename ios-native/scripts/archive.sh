#!/usr/bin/env bash
# =============================================================================
# Valeria+ · Archivar y exportar el port nativo iOS
#
#   ./scripts/archive.sh adhoc    [número-de-build]   → .ipa para App Distribution
#   ./scripts/archive.sh appstore [número-de-build]   → .ipa para App Store Connect
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
  adhoc)    OPCIONES="Config/ExportOptions-AdHoc.plist" ;;
  appstore) OPCIONES="Config/ExportOptions-AppStore.plist" ;;
  *)
    echo "Uso: $0 [adhoc|appstore] [número-de-build]" >&2
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
xcodebuild -exportArchive \
  -archivePath "$ARCHIVO" \
  -exportOptionsPlist "$OPCIONES" \
  -exportPath "$EXPORTACION" \
  -allowProvisioningUpdates

echo
echo "✓ Listo:"
find "$EXPORTACION" -name '*.ipa' -maxdepth 1
echo
echo "  El archivo queda en $ARCHIVO (también visible en Xcode → Window → Organizer)."
