#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

: "${CLOUD_SQL_APP_PASSWORD:?CLOUD_SQL_APP_PASSWORD est requis}"

export GCP_PROJECT_ID="${GCP_PROJECT_ID:-agasa-gabon-2026}"
export GCP_REGION="${GCP_REGION:-europe-west1}"
export CLOUD_SQL_INSTANCE_NAME="${CLOUD_SQL_INSTANCE_NAME:-agasa-hub-dev}"
export CLOUD_SQL_INSTANCE_CONNECTION_NAME="${CLOUD_SQL_INSTANCE_CONNECTION_NAME:-agasa-gabon-2026:europe-west1:agasa-hub-dev}"
export CLOUD_SQL_DB_NAME="${CLOUD_SQL_DB_NAME:-agasa_hub}"
export CLOUD_SQL_APP_USER="${CLOUD_SQL_APP_USER:-agasa_app}"
export HUB_SYNC_TOKEN="${HUB_SYNC_TOKEN:-dev-hub-sync-token-change-me}"
export AGASA_CORE_PUBLIC_BASE_URL="${AGASA_CORE_PUBLIC_BASE_URL:-http://localhost:3000}"
export CLOUD_SQL_PROXY_PORT="${CLOUD_SQL_PROXY_PORT:-5432}"
export DATABASE_URL="${DATABASE_URL:-postgresql://${CLOUD_SQL_APP_USER}:${CLOUD_SQL_APP_PASSWORD}@127.0.0.1:${CLOUD_SQL_PROXY_PORT}/${CLOUD_SQL_DB_NAME}?sslmode=disable}"

echo "[DEV] Phase 0 - preflight"
bash scripts/cloudsql/preflight-m4.sh

echo "[DEV] Phase 1 - setup GCP"
bash scripts/setup-gcp.sh

echo "[DEV] Phase 2 - bootstrap Cloud SQL"
bash scripts/cloudsql/bootstrap-hub.sh

echo
echo "[DEV] Lance maintenant le proxy dans un terminal dedie:"
echo "  export CLOUD_SQL_INSTANCE_CONNECTION_NAME='${CLOUD_SQL_INSTANCE_CONNECTION_NAME}'"
echo "  export CLOUD_SQL_PROXY_PORT='${CLOUD_SQL_PROXY_PORT}'"
echo "  bash scripts/cloudsql/start-proxy.sh"
echo
echo "[DEV] Une fois proxy actif, execute:"
echo "  export DATABASE_URL='${DATABASE_URL}'"
echo "  bash scripts/cloudsql/apply-migrations.sh"
echo "  bash scripts/sync/run-bidirectional.sh"
