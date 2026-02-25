#!/bin/bash
# ==============================================================================
# AGASA-Core : Pipeline Déploiement Local -> Cloud Run 
# ==============================================================================
set -e

PROJECT_ID="agasa-gabon-2026"
REGION="europe-west1"
IMAGE="europe-west1-docker.pkg.dev/$PROJECT_ID/agasa-repo/agasa-core:latest"

echo "🚀 [START] Déploiement AGASA-Core sur infrastructure GCP ($REGION)"

echo "🔨 1. Compilation de l'image Docker (Mode Multi-Stage Standalone)..."
docker build -t $IMAGE .

echo "📤 2. Push du conteneur compilé vers l'Artifact Registry..."
docker push $IMAGE

echo "☁️  3. Déploiement du conteneur en production sur Google Cloud Run..."
gcloud run deploy agasa-core \
  --image $IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --memory 1Gi \
  --cpu 1 \
  --concurrency 80

echo "✅ [DONE] L'application est en direct sur les plateformes gouvernementales !"
