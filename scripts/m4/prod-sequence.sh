#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

: "${CLOUD_SQL_APP_PASSWORD:?CLOUD_SQL_APP_PASSWORD est requis}"
: "${PRIVATE_DB_IP:?PRIVATE_DB_IP est requis}"

export PROJECT_ID="${PROJECT_ID:-agasa-gabon-2026}"
export GCP_PROJECT_ID="${GCP_PROJECT_ID:-${PROJECT_ID}}"
export REGION="${REGION:-europe-west1}"
export GCP_REGION="${GCP_REGION:-${REGION}}"
export SERVICE_NAME="${SERVICE_NAME:-agasa-core}"
export REPOSITORY="${REPOSITORY:-agasa-repo}"

export CLOUD_SQL_INSTANCE_NAME="${CLOUD_SQL_INSTANCE_NAME:-agasa-hub-prod}"
export CLOUD_SQL_INSTANCE_CONNECTION_NAME="${CLOUD_SQL_INSTANCE_CONNECTION_NAME:-agasa-gabon-2026:europe-west1:agasa-hub-prod}"
export CLOUD_SQL_DB_NAME="${CLOUD_SQL_DB_NAME:-agasa_hub}"
export CLOUD_SQL_APP_USER="${CLOUD_SQL_APP_USER:-agasa_app}"
export HUB_SYNC_TOKEN="${HUB_SYNC_TOKEN:-}"
export HUB_SYNC_SECRET_NAME="${HUB_SYNC_SECRET_NAME:-HUB_SYNC_TOKEN}"
export AGASA_CORE_PUBLIC_BASE_URL="${AGASA_CORE_PUBLIC_BASE_URL:-https://agasa-core.web.app}"
export DATABASE_URL="${DATABASE_URL:-postgresql://${CLOUD_SQL_APP_USER}:${CLOUD_SQL_APP_PASSWORD}@${PRIVATE_DB_IP}:5432/${CLOUD_SQL_DB_NAME}?sslmode=require}"
export DEPLOY_MODE="${DEPLOY_MODE:-cloud-build}"

echo "[PROD] Phase 0 - preflight"
bash scripts/cloudsql/preflight-m4.sh

echo "[PROD] Phase 1 - setup GCP"
bash scripts/setup-gcp.sh

echo "[PROD] Phase 2 - bootstrap Cloud SQL"
bash scripts/cloudsql/bootstrap-hub.sh

if [ -n "${HUB_SYNC_TOKEN}" ]; then
  echo "[PROD] Phase 7 - upsert secret HUB_SYNC_TOKEN"
  if gcloud secrets describe "${HUB_SYNC_SECRET_NAME}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
    printf "%s" "${HUB_SYNC_TOKEN}" | gcloud secrets versions add "${HUB_SYNC_SECRET_NAME}" \
      --project="${PROJECT_ID}" \
      --data-file=-
  else
    printf "%s" "${HUB_SYNC_TOKEN}" | gcloud secrets create "${HUB_SYNC_SECRET_NAME}" \
      --project="${PROJECT_ID}" \
      --replication-policy=automatic \
      --data-file=-
  fi
fi

echo "[PROD] Phase 6 - deploy Cloud Run"
bash scripts/deploy.sh

echo
echo "[PROD] Prochaines commandes recommandees:"
echo "  export DATABASE_URL='${DATABASE_URL}'"
echo "  bash scripts/sync/run-bidirectional.sh"
echo "  curl -i -H \"Authorization: Bearer \${HUB_SYNC_TOKEN}\" \"${AGASA_CORE_PUBLIC_BASE_URL}/api/hub/sync/convex-export?since=0&limit=5\""
