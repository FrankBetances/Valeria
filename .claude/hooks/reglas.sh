#!/usr/bin/env bash
# Inyecta en cada sesión y en cada mensaje de Frank el control de reglas (F10).
# Saca la tabla F1-F9 de CLAUDE.md: si cambia allí, cambia aquí sin tocar nada.
cd "$(dirname "$0")/../.." || exit 0
case "$1" in
  start)
    echo "CONTROL DE REGLAS (F10, obligatorio). Antes de hacer nada, lee la REGLA ULTRA MEGA SUPREMA DEL FRACASO de CLAUDE.md:"
    awk '/^# REGLA ULTRA MEGA SUPREMA DEL FRACASO/{p=1} p&&/^# REGLA MEGA ULTRA UNIVERSAL 0/{exit} p' CLAUDE.md
    echo "Primera respuesta de la sesión: di el presupuesto que da Frank y qué cabe en él (F2)."
    ;;
  prompt)
    echo "CONTROL F10 antes de responder: (1) ¿respondo a lo que Frank pide, en ≤3 líneas? (F9) (2) ¿cabe en su presupuesto? Si no, dilo YA (F2) (3) ¿voy a decir «hecho» de algo no visto en APK? (F3) (4) ¿cambio de base/librería sin su sí? (F1) (5) ¿me he desviado de lo pedido? Si sí, para y dilo en la primera línea."
    ;;
esac
