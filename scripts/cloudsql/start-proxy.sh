#!/usr/bin/env bash
set -euo pipefail

: "${CLOUD_SQL_INSTANCE_CONNECTION_NAME:?CLOUD_SQL_INSTANCE_CONNECTION_NAME est requis}"

CLOUD_SQL_PROXY_BIN=${CLOUD_SQL_PROXY_BIN:-}
CLOUD_SQL_PROXY_PORT=${CLOUD_SQL_PROXY_PORT:-5432}

resolve_proxy_bin() {
  if [ -n "${CLOUD_SQL_PROXY_BIN:-}" ] && command -v "${CLOUD_SQL_PROXY_BIN}" >/dev/null 2>&1; then
    echo "${CLOUD_SQL_PROXY_BIN}"
    return 0
  fi

  if command -v cloud-sql-proxy >/dev/null 2>&1; then
    echo "cloud-sql-proxy"
    return 0
  fi

  if command -v cloud_sql_proxy >/dev/null 2>&1; then
    echo "cloud_sql_proxy"
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

CLOUD_SQL_PROXY_BIN="$(resolve_proxy_bin || true)"
if [ -z "$CLOUD_SQL_PROXY_BIN" ]; then
  echo "Erreur: proxy Cloud SQL introuvable."
  echo "Installe cloud-sql-proxy: https://cloud.google.com/sql/docs/postgres/sql-proxy"
  echo "Ou définis CLOUD_SQL_PROXY_BIN avec un binaire valide."
  exit 1
fi

echo "Démarrage Cloud SQL Proxy sur 127.0.0.1:${CLOUD_SQL_PROXY_PORT}"
exec "$CLOUD_SQL_PROXY_BIN" \
  "${CLOUD_SQL_INSTANCE_CONNECTION_NAME}" \
  --address 127.0.0.1 \
  --port "${CLOUD_SQL_PROXY_PORT}"
