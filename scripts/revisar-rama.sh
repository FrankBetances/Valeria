#!/usr/bin/env bash
# Revisión de una rama de otro agente leída directamente de GitHub (R36): Frank no
# copia ni pega registros. Uso: scripts/revisar-rama.sh antigravity/mejoras-2026-11-27
# Saca, en pocas líneas: commits nuevos, ficheros tocados (sin los generados),
# runs de CI de la rama y los gates corridos sobre la rama en un worktree limpio.
set -uo pipefail
RAMA="${1:?rama}"; BASE="${2:-origin/main}"
git fetch -q origin "$RAMA" main || exit 1
echo "== commits =="; git log --format='%h %ad %s' --date=format:'%d/%m %H:%M' "$BASE..FETCH_HEAD" | head -20
echo "== ficheros (sin generados) =="
git diff --stat "$BASE" FETCH_HEAD -- . ':!assets/voice' ':!voice-assets-manifest.*.json' ':!src/valeriaVoiceAssets.ts' ':!voice-corpus.json' | tail -25
echo "== audios tocados: $(git diff --name-only "$BASE" FETCH_HEAD -- assets/voice | wc -l) =="
echo "== CI de la rama =="; gh run list --branch "$RAMA" --limit 5 --json databaseId,workflowName,status,conclusion --jq '.[]|"\(.databaseId) \(.workflowName) \(.status) \(.conclusion)"' 2>/dev/null
WT="$(mktemp -d)"; git worktree add -q --detach "$WT" FETCH_HEAD && (
  cd "$WT" && npm ci --ignore-scripts --no-audit --no-fund >/dev/null 2>&1
  echo "== gates =="
  grep -oP '(?<=run: )node scripts/\S+(?: --\S+)?' .github/workflows/android.yml | while read -r c; do $c >/dev/null 2>&1 || echo "FALLA: $c"; done
  npx tsc --noEmit >/dev/null 2>&1 && echo "typecheck OK" || echo "FALLA: typecheck"
  node scripts/check-frank-errors.js 2>&1 | grep -E "✖|❌" || echo "check-frank-errors OK")
git worktree remove --force "$WT" 2>/dev/null
