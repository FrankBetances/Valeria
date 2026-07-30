#!/usr/bin/env bash
# =============================================================================
# Valeria+ · Averiguar el Team ID y dejar la firma local configurada
#
#   ./scripts/team-id.sh           # muestra los equipos que encuentra
#   ./scripts/team-id.sh --write   # además escribe Config/Signing.local.xcconfig
#
# El Team ID NO es el correo del Apple ID: es un código de 10 caracteres que
# Apple asigna a la cuenta (por ejemplo A1B2C3D4E5). Con cuenta gratuita no
# aparece en developer.apple.com —esa web es del programa de pago—, así que hay
# que leerlo del Mac: sale del campo OU del certificado de firma, que es la
# fuente fiable, con los perfiles de aprovisionamiento como respaldo.
#
# Requisito: haber añadido el Apple ID en Xcode (Settings → Accounts) y haber
# dejado que cree el certificado de desarrollo. Antes de eso no hay nada que
# leer, y el script lo dice en vez de fallar sin explicación.
# =============================================================================
set -uo pipefail

cd "$(dirname "$0")/.."

VERDE=$'\033[0;32m'; ROJO=$'\033[0;31m'; AMBAR=$'\033[0;33m'; FIN=$'\033[0m'
ESCRIBIR=0
[ "${1:-}" = "--write" ] && ESCRIBIR=1

if [ "$(uname -s)" != "Darwin" ]; then
  echo "${ROJO}✗${FIN} Esto solo funciona en el Mac donde tengas el Apple ID en Xcode." >&2
  exit 1
fi

# --- 1. Del certificado de firma: el campo OU del subject es el Team ID ------
equipos=""
if command -v openssl >/dev/null 2>&1; then
  for nombre in "Apple Development" "iPhone Developer" "Apple Distribution" "iPhone Distribution"; do
    pem=$(security find-certificate -a -p -c "$nombre" 2>/dev/null) || continue
    [ -z "$pem" ] && continue
    # find-certificate concatena los PEM; se acumulan líneas hasta cerrar cada
    # bloque y se procesa de uno en uno.
    bloque=""
    while IFS= read -r linea; do
      bloque="${bloque}${linea}"$'\n'
      case "$linea" in
        *"END CERTIFICATE"*)
          sujeto=$(printf '%s' "$bloque" | openssl x509 -noout -subject -nameopt RFC2253 2>/dev/null)
          bloque=""
          [ -z "$sujeto" ] && continue
          id=$(printf '%s' "$sujeto" | sed -n 's/.*OU=\([A-Z0-9]\{10\}\).*/\1/p')
          cn=$(printf '%s' "$sujeto" | sed -n 's/.*CN=\([^,]*\).*/\1/p')
          [ -n "$id" ] && equipos="${equipos}${id}|${cn}"$'\n'
          ;;
      esac
    done <<EOF
$pem
EOF
  done
fi

# --- 2. Respaldo: los perfiles de aprovisionamiento ya descargados -----------
perfiles="$HOME/Library/Developer/Xcode/UserData/Provisioning Profiles"
if [ -d "$perfiles" ]; then
  for p in "$perfiles"/*.mobileprovision; do
    [ -e "$p" ] || continue
    id=$(security cms -D -i "$p" 2>/dev/null \
      | plutil -extract TeamIdentifier.0 raw -o - - 2>/dev/null)
    nom=$(security cms -D -i "$p" 2>/dev/null \
      | plutil -extract TeamName raw -o - - 2>/dev/null)
    [ -n "${id:-}" ] && equipos="${equipos}${id}|${nom:-(perfil de aprovisionamiento)}"$'\n'
  done
fi

unicos=$(printf '%s' "$equipos" | grep -v '^$' | sort -u)

if [ -z "$unicos" ]; then
  echo "${AMBAR}!${FIN} No encuentro ningún Team ID en este Mac."
  echo
  echo "  Xcode lo crea al añadir la cuenta:"
  echo "    1. Xcode → Settings (⌘,) → Accounts → + → Apple ID"
  echo "    2. Inicia sesión; aparecerá una fila «(Personal Team)» con el Team ID"
  echo "       en su propia columna."
  echo "    3. Abre Valeria.xcodeproj, pestaña Signing & Capabilities, elige ese"
  echo "       equipo una vez para que genere el certificado."
  echo "    4. Vuelve a ejecutar este script."
  exit 1
fi

echo "Equipos encontrados:"
echo
printf '%s\n' "$unicos" | while IFS='|' read -r id nombre; do
  printf '  %s%s%s   %s\n' "$VERDE" "$id" "$FIN" "$nombre"
done
echo

cuantos=$(printf '%s\n' "$unicos" | wc -l | tr -d ' ')
ELEGIDO=$(printf '%s\n' "$unicos" | head -1 | cut -d'|' -f1)

if [ "$cuantos" -gt 1 ]; then
  echo "${AMBAR}!${FIN} Hay más de un equipo. Si tienes cuenta personal y de organización,"
  echo "  elige a mano cuál quieres y escríbelo tú en Config/Signing.local.xcconfig."
  echo "  El script no adivina por ti: firmar con el equipo equivocado da errores"
  echo "  de identificador que cuesta relacionar con esto."
  [ "$ESCRIBIR" -eq 1 ] && exit 1
fi

if [ "$ESCRIBIR" -eq 1 ]; then
  DESTINO="Config/Signing.local.xcconfig"
  if [ -f "$DESTINO" ]; then
    echo "${AMBAR}!${FIN} $DESTINO ya existe; no lo sobrescribo. Contenido actual:"
    sed 's/^/      /' "$DESTINO"
    exit 0
  fi
  {
    echo "// Firma local de este Mac. Generado por scripts/team-id.sh."
    echo "// No se versiona (está en .gitignore)."
    echo
    echo "DEVELOPMENT_TEAM = $ELEGIDO"
    echo
    echo "// Descomenta con un nombre propio SOLO si Xcode dice que"
    echo "// «health.earlify.valeria» no está disponible para tu equipo."
    echo "// VALERIA_BUNDLE_ID = health.earlify.valeria.pruebas"
  } > "$DESTINO"
  echo "${VERDE}✓${FIN} Escrito $DESTINO con DEVELOPMENT_TEAM = $ELEGIDO"
  echo
  echo "Siguiente paso:  ./scripts/preflight.sh && open Valeria.xcodeproj"
else
  echo "Para dejarlo configurado:  ./scripts/team-id.sh --write"
fi
