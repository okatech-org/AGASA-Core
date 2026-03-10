#!/bin/bash
# ==============================================================================
# AGASA-Admin : Script de préparation initial du Hub GCP
# ==============================================================================
set -e

PROJECT_ID="agasa-gabon-2026"
REGION="europe-west1"
REPO_NAME="agasa-repo"

echo "🔧 1. Configuration de gcloud pour le projet: $PROJECT_ID"
gcloud config set project $PROJECT_ID
gcloud config set run/region $REGION

echo "🔌 2. Activation des APIs Google Cloud souveraines..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com

echo "📦 3. Création du registre Docker (Artifact Registry)..."
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION > /dev/null 2>&1; then
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="Registre ultra-sécurisé pour les images AGASA-Admin"
    echo "✅ Registre AR fondé."
else
    echo "ℹ️ Le registre AR existe déjà."
fi

echo "🔐 4. Configuration de l'authentification Docker..."
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet

echo "🎉 Pre-requis Cloud Run installés avec succès ! Exécutez ./scripts/deploy.sh pour déployer."
