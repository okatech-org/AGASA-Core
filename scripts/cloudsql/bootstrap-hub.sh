#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?GCP_PROJECT_ID est requis}"
: "${GCP_REGION:?GCP_REGION est requis}"
: "${CLOUD_SQL_INSTANCE_NAME:?CLOUD_SQL_INSTANCE_NAME est requis}"
: "${CLOUD_SQL_DB_NAME:?CLOUD_SQL_DB_NAME est requis}"
: "${CLOUD_SQL_APP_USER:?CLOUD_SQL_APP_USER est requis}"
: "${CLOUD_SQL_APP_PASSWORD:?CLOUD_SQL_APP_PASSWORD est requis}"

INSTANCE_TIER=${CLOUD_SQL_INSTANCE_TIER:-db-custom-1-3840}
DATABASE_VERSION=${CLOUD_SQL_DATABASE_VERSION:-POSTGRES_16}


echo "[1/5] Sélection du projet gcloud"
gcloud config set project "$GCP_PROJECT_ID" >/dev/null

echo "[2/5] Activation APIs Cloud SQL"
gcloud services enable sqladmin.googleapis.com servicemanagement.googleapis.com >/dev/null

echo "[3/5] Vérification instance Cloud SQL"
if ! gcloud sql instances describe "$CLOUD_SQL_INSTANCE_NAME" >/dev/null 2>&1; then
  gcloud sql instances create "$CLOUD_SQL_INSTANCE_NAME" \
    --database-version="$DATABASE_VERSION" \
    --cpu=1 \
    --memory=3840MB \
    --region="$GCP_REGION" \
    --availability-type=REGIONAL \
    --storage-type=SSD \
    --storage-size=20GB \
    --backup-start-time=02:00 \
    --enable-point-in-time-recovery
else
  echo "Instance déjà existante: $CLOUD_SQL_INSTANCE_NAME"
fi

echo "[4/5] Création base + utilisateur applicatif"
if ! gcloud sql databases describe "$CLOUD_SQL_DB_NAME" --instance="$CLOUD_SQL_INSTANCE_NAME" >/dev/null 2>&1; then
  gcloud sql databases create "$CLOUD_SQL_DB_NAME" --instance="$CLOUD_SQL_INSTANCE_NAME"
fi

if ! gcloud sql users describe "$CLOUD_SQL_APP_USER" --instance="$CLOUD_SQL_INSTANCE_NAME" >/dev/null 2>&1; then
  gcloud sql users create "$CLOUD_SQL_APP_USER" --instance="$CLOUD_SQL_INSTANCE_NAME" --password="$CLOUD_SQL_APP_PASSWORD"
else
  gcloud sql users set-password "$CLOUD_SQL_APP_USER" --instance="$CLOUD_SQL_INSTANCE_NAME" --password="$CLOUD_SQL_APP_PASSWORD"
fi

echo "[5/5] Résumé connexion"
CONN_NAME=$(gcloud sql instances describe "$CLOUD_SQL_INSTANCE_NAME" --format='value(connectionName)')
PUBLIC_IP=$(gcloud sql instances describe "$CLOUD_SQL_INSTANCE_NAME" --format='value(ipAddresses[0].ipAddress)')

echo "INSTANCE_CONNECTION_NAME=$CONN_NAME"
echo "PUBLIC_IP=$PUBLIC_IP"
echo "DB=$CLOUD_SQL_DB_NAME"
echo "USER=$CLOUD_SQL_APP_USER"
