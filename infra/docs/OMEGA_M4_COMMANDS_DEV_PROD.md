# AGASA-Admin OMEGA-M4 - Sequence Complete Dev/Prod

Ce document fige la sequence d'execution pour l'infra M4 (Cloud SQL + Sync Hub + Cloud Run).
Date de reference: 2026-03-01.

## Valeurs de reference

| Variable | DEV | PROD |
|---|---|---|
| `GCP_PROJECT_ID` | `agasa-gabon-2026` | `agasa-gabon-2026` |
| `GCP_REGION` | `europe-west1` | `europe-west1` |
| `CLOUD_SQL_INSTANCE_NAME` | `agasa-hub-dev` | `agasa-hub-prod` |
| `CLOUD_SQL_INSTANCE_CONNECTION_NAME` | `agasa-gabon-2026:europe-west1:agasa-hub-dev` | `agasa-gabon-2026:europe-west1:agasa-hub-prod` |
| `CLOUD_SQL_DB_NAME` | `agasa_hub` | `agasa_hub` |
| `CLOUD_SQL_APP_USER` | `agasa_app` | `agasa_app` |
| `HUB_SYNC_TOKEN` | `dev-hub-sync-token-change-me` | `hsk_<token_reel>` |
| `AGASA_CORE_PUBLIC_BASE_URL` | `http://localhost:3000` | `https://agasa-core.web.app` |

## Phase 0 - Prerequis (1 fois)

```bash
cd "/Users/okatech/okatech-projects/AGASA Digital/AGASA-Admin"
npm run m4:preflight
```

Si Docker est absent, utiliser `DEPLOY_MODE=cloud-build` en phase 6.

## Raccourcis scripts (optionnel)

```bash
# Sequence DEV guidee (phases 0->2 + commandes proxy/migrate/sync)
export CLOUD_SQL_APP_PASSWORD="<MOT_DE_PASSE_DEV>"
npm run m4:dev-sequence

# Sequence PROD guidee (setup/bootstrap/deploy, secret optionnel)
export CLOUD_SQL_APP_PASSWORD="<MOT_DE_PASSE_PROD>"
export PRIVATE_DB_IP="<PRIVATE_IP>"
export HUB_SYNC_TOKEN="hsk_<VOTRE_VRAI_TOKEN>"
npm run m4:prod-sequence
```

## Phase 1 - Initialisation GCP (1 fois)

```bash
cd "/Users/okatech/okatech-projects/AGASA Digital/AGASA-Admin"
bash scripts/setup-gcp.sh
```

Si erreur "permission denied" sur `agasa-gabon-2026`:

```bash
gcloud auth list
gcloud auth login
gcloud config set project agasa-gabon-2026
gcloud projects describe agasa-gabon-2026
```

## Phase 2 - Bootstrap Cloud SQL

### DEV

```bash
export GCP_PROJECT_ID=agasa-gabon-2026
export GCP_REGION=europe-west1
export CLOUD_SQL_INSTANCE_NAME=agasa-hub-dev
export CLOUD_SQL_DB_NAME=agasa_hub
export CLOUD_SQL_APP_USER=agasa_app
export CLOUD_SQL_APP_PASSWORD="<MOT_DE_PASSE_DEV>"
bash scripts/cloudsql/bootstrap-hub.sh
```

### PROD

```bash
export GCP_PROJECT_ID=agasa-gabon-2026
export GCP_REGION=europe-west1
export CLOUD_SQL_INSTANCE_NAME=agasa-hub-prod
export CLOUD_SQL_DB_NAME=agasa_hub
export CLOUD_SQL_APP_USER=agasa_app
export CLOUD_SQL_APP_PASSWORD="<MOT_DE_PASSE_PROD>"
bash scripts/cloudsql/bootstrap-hub.sh
```

## Phase 3 - Cloud SQL Proxy (connexion locale)

### DEV

```bash
export CLOUD_SQL_INSTANCE_CONNECTION_NAME=agasa-gabon-2026:europe-west1:agasa-hub-dev
export CLOUD_SQL_PROXY_PORT=5432
bash scripts/cloudsql/start-proxy.sh
```

### PROD (debug uniquement)

```bash
export CLOUD_SQL_INSTANCE_CONNECTION_NAME=agasa-gabon-2026:europe-west1:agasa-hub-prod
export CLOUD_SQL_PROXY_PORT=5432
bash scripts/cloudsql/start-proxy.sh
```

## Phase 4 - Migrations SQL

### DEV

```bash
export DATABASE_URL="postgresql://agasa_app:<MOT_DE_PASSE_DEV>@127.0.0.1:5432/agasa_hub?sslmode=disable"
bash scripts/cloudsql/apply-migrations.sh
```

### PROD

```bash
export DATABASE_URL="postgresql://agasa_app:<MOT_DE_PASSE_PROD>@127.0.0.1:5432/agasa_hub?sslmode=disable"
bash scripts/cloudsql/apply-migrations.sh
```

## Phase 5 - Synchronisation Hub (Convex <-> PostgreSQL)

### DEV

```bash
export DATABASE_URL="postgresql://agasa_app:<MOT_DE_PASSE_DEV>@127.0.0.1:5432/agasa_hub?sslmode=disable"
export HUB_SYNC_TOKEN="dev-hub-sync-token-change-me"
export AGASA_CORE_PUBLIC_BASE_URL="http://localhost:3000"
bash scripts/sync/convex-to-postgres.sh
bash scripts/sync/postgres-to-convex.sh
# ou:
bash scripts/sync/run-bidirectional.sh
```

### PROD

```bash
export DATABASE_URL="postgresql://agasa_app:<MOT_DE_PASSE_PROD>@<PRIVATE_IP>:5432/agasa_hub?sslmode=require"
export HUB_SYNC_TOKEN="hsk_<VOTRE_VRAI_TOKEN>"
export AGASA_CORE_PUBLIC_BASE_URL="https://agasa-core.web.app"
bash scripts/sync/run-bidirectional.sh
```

## Phase 6 - Deploiement Cloud Run

### Option A (Docker local installe)

```bash
cd "/Users/okatech/okatech-projects/AGASA Digital/AGASA-Admin"
export PROJECT_ID=agasa-gabon-2026
export REGION=europe-west1
export SERVICE_NAME=agasa-core
export DEPLOY_MODE=local-docker
export CLOUD_SQL_INSTANCE_CONNECTION_NAME=agasa-gabon-2026:europe-west1:agasa-hub-prod
export AGASA_CORE_PUBLIC_BASE_URL=https://agasa-core.web.app
export HUB_SYNC_SECRET_NAME=HUB_SYNC_TOKEN
bash scripts/deploy.sh
```

### Option B (sans Docker local, recommande en CI/CD)

```bash
cd "/Users/okatech/okatech-projects/AGASA Digital/AGASA-Admin"
export PROJECT_ID=agasa-gabon-2026
export REGION=europe-west1
export SERVICE_NAME=agasa-core
export DEPLOY_MODE=cloud-build
export CLOUD_SQL_INSTANCE_CONNECTION_NAME=agasa-gabon-2026:europe-west1:agasa-hub-prod
export AGASA_CORE_PUBLIC_BASE_URL=https://agasa-core.web.app
export HUB_SYNC_SECRET_NAME=HUB_SYNC_TOKEN
bash scripts/deploy.sh
```

## Phase 7 - Generer et injecter le token prod

```bash
TOKEN=$(openssl rand -hex 32 | sed 's/^/hsk_/')
printf "%s" "$TOKEN" | gcloud secrets create HUB_SYNC_TOKEN \
  --project=agasa-gabon-2026 \
  --replication-policy=automatic \
  --data-file=-

gcloud run services update agasa-core \
  --project=agasa-gabon-2026 \
  --region=europe-west1 \
  --update-secrets=HUB_SYNC_TOKEN=HUB_SYNC_TOKEN:latest
```

Si le secret existe deja:

```bash
printf "%s" "$TOKEN" | gcloud secrets versions add HUB_SYNC_TOKEN \
  --project=agasa-gabon-2026 \
  --data-file=-
```

## Smoke test API Hub Sync

```bash
curl -i \
  -H "Authorization: Bearer ${HUB_SYNC_TOKEN}" \
  "https://agasa-core.web.app/api/hub/sync/convex-export?since=0&limit=5"
```

## CI/CD Cloud Build (rappel)

Le pipeline [cloudbuild.yaml](/Users/okatech/okatech-projects/AGASA%20Digital/AGASA-Admin/cloudbuild.yaml) est aligne M4:
- attache Cloud SQL (`--add-cloudsql-instances`)
- injecte `HUB_SYNC_TOKEN` depuis Secret Manager (`--update-secrets`)
- renseigne `AGASA_CORE_PUBLIC_BASE_URL` sur Cloud Run
