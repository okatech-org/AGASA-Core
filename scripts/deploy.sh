#!/usr/bin/env bash
# ==============================================================================
# AGASA-Admin : Déploiement vers Cloud Run (local Docker ou Cloud Build)
# ==============================================================================
set -euo pipefail

PROJECT_ID=${PROJECT_ID:-agasa-gabon-2026}
REGION=${REGION:-europe-west1}
SERVICE_NAME=${SERVICE_NAME:-agasa-admin}
REPOSITORY=${REPOSITORY:-agasa-repo}
IMAGE_TAG=${IMAGE_TAG:-latest}
DEPLOY_MODE=${DEPLOY_MODE:-auto} # auto | local-docker | cloud-build
HUB_SYNC_SECRET_NAME=${HUB_SYNC_SECRET_NAME:-}

IMAGE="europe-west1-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}:${IMAGE_TAG}"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "Erreur: gcloud introuvable."
  exit 1
fi

echo "[1/4] Configuration projet GCP"
gcloud config set project "${PROJECT_ID}" >/dev/null

if [ "${DEPLOY_MODE}" = "auto" ]; then
  if command -v docker >/dev/null 2>&1; then
    DEPLOY_MODE="local-docker"
  else
    DEPLOY_MODE="cloud-build"
  fi
fi

if [ "${DEPLOY_MODE}" = "local-docker" ]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "Erreur: Docker requis pour DEPLOY_MODE=local-docker."
    exit 1
  fi
  echo "[2/4] Build image avec Docker local"
  docker build -t "${IMAGE}" .
  echo "[3/4] Push image vers Artifact Registry"
  docker push "${IMAGE}"
elif [ "${DEPLOY_MODE}" = "cloud-build" ]; then
  echo "[2/4] Build image avec Cloud Build (sans Docker local)"
  gcloud builds submit --tag "${IMAGE}" .
  echo "[3/4] Image publiée via Cloud Build"
else
  echo "Erreur: DEPLOY_MODE invalide (${DEPLOY_MODE}). Valeurs: auto|local-docker|cloud-build"
  exit 1
fi

echo "[4/4] Déploiement Cloud Run (${SERVICE_NAME})"
run_args=(
  --image "${IMAGE}"
  --platform managed
  --region "${REGION}"
  --allow-unauthenticated
  --min-instances 1
  --max-instances 10
  --memory 1Gi
  --cpu 1
  --concurrency 80
)

if [ -n "${CLOUD_SQL_INSTANCE_CONNECTION_NAME:-}" ]; then
  run_args+=(--add-cloudsql-instances "${CLOUD_SQL_INSTANCE_CONNECTION_NAME}")
fi

if [ -n "${HUB_SYNC_SECRET_NAME}" ]; then
  run_args+=(--update-secrets "HUB_SYNC_TOKEN=${HUB_SYNC_SECRET_NAME}:latest")
fi

if [ -n "${AGASA_ADMIN_PUBLIC_BASE_URL:-}" ]; then
  run_args+=(--update-env-vars "AGASA_ADMIN_PUBLIC_BASE_URL=${AGASA_ADMIN_PUBLIC_BASE_URL}")
fi

gcloud run deploy "${SERVICE_NAME}" "${run_args[@]}"

echo "Déploiement terminé: ${SERVICE_NAME} (${REGION})"
