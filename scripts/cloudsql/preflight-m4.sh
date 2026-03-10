#!/usr/bin/env bash
set -euo pipefail

ok() {
  echo "[OK] $1"
}

warn() {
  echo "[WARN] $1"
}

fail() {
  echo "[FAIL] $1"
}

require_cmd() {
  local bin="$1"
  local label="$2"
  if command -v "$bin" >/dev/null 2>&1; then
    ok "${label}: $(command -v "$bin")"
  else
    fail "${label} introuvable (${bin})"
    return 1
  fi
}

echo "Preflight OMEGA-M4 - AGASA-Admin"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"

rc=0

require_cmd gcloud "Google Cloud CLI" || rc=1
require_cmd psql "PostgreSQL client" || rc=1
require_cmd jq "jq" || rc=1
require_cmd curl "curl" || rc=1

resolve_proxy_bin() {
  if command -v cloud-sql-proxy >/dev/null 2>&1; then
    command -v cloud-sql-proxy
    return 0
  fi

  if command -v cloud_sql_proxy >/dev/null 2>&1; then
    command -v cloud_sql_proxy
    return 0
  fi

  for candidate in \
    "/opt/homebrew/share/google-cloud-sdk/bin/cloud-sql-proxy" \
    "/usr/local/share/google-cloud-sdk/bin/cloud-sql-proxy" \
    "/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/bin/cloud-sql-proxy"; do
    if [ -x "$candidate" ]; then
      echo "$candidate"
      return 0
    fi
  done

  if command -v gcloud >/dev/null 2>&1; then
    local gcloud_bin
    gcloud_bin=$(command -v gcloud)
    local inferred
    inferred="$(cd "$(dirname "$gcloud_bin")/../share/google-cloud-sdk/bin" 2>/dev/null && pwd)/cloud-sql-proxy" || true
    if [ -n "${inferred:-}" ] && [ -x "$inferred" ]; then
      echo "$inferred"
      return 0
    fi
  fi

  return 1
}

if proxy_bin="$(resolve_proxy_bin)"; then
  ok "Cloud SQL Proxy: ${proxy_bin}"
else
  fail "Cloud SQL Proxy introuvable (cloud-sql-proxy ou cloud_sql_proxy)"
  rc=1
fi

if command -v docker >/dev/null 2>&1; then
  ok "Docker: $(command -v docker)"
else
  warn "Docker introuvable (déploiement local docker indisponible, utiliser Cloud Build)"
fi

if [ -n "${GCP_PROJECT_ID:-}" ]; then
  active_account="$(gcloud config get-value account 2>/dev/null || true)"
  if gcloud projects describe "${GCP_PROJECT_ID}" --format='value(projectId)' >/dev/null 2>&1; then
    ok "Accès projet GCP: ${GCP_PROJECT_ID} (compte: ${active_account:-inconnu})"
  else
    fail "Accès refusé ou projet introuvable: ${GCP_PROJECT_ID} (compte: ${active_account:-inconnu})"
    fail "Exécute: gcloud auth login puis gcloud config set project ${GCP_PROJECT_ID}"
    rc=1
  fi
fi

if [ "$rc" -ne 0 ]; then
  echo "Preflight KO."
  exit "$rc"
fi

echo "Preflight OK."
