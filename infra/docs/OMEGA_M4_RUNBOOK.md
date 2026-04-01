# OMEGA-M4 Runbook — AGASA-Admin (Cloud SQL Hub)

Pour une sequence pre-remplie DEV/PROD (agasa-gabon-2026), voir:
`infra/docs/OMEGA_M4_COMMANDS_DEV_PROD.md`

## 1. Variables requises

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `CLOUD_SQL_INSTANCE_NAME`
- `CLOUD_SQL_DB_NAME`
- `CLOUD_SQL_APP_USER`
- `CLOUD_SQL_APP_PASSWORD`
- `CLOUD_SQL_INSTANCE_CONNECTION_NAME`
- `DATABASE_URL`
- `HUB_SYNC_TOKEN`
- `AGASA_CORE_PUBLIC_BASE_URL`

Preflight recommande:

```bash
npm run m4:preflight
```

Exemple `DATABASE_URL`:

```bash
postgresql://agasa_app:<password>@127.0.0.1:5432/agasa_hub?sslmode=disable
```

## 2. Provisionnement Cloud SQL

```bash
cd AGASA-Admin
export GCP_PROJECT_ID=agasa-gabon-2026
export GCP_REGION=europe-west1
export CLOUD_SQL_INSTANCE_NAME=agasa-hub-prod
export CLOUD_SQL_DB_NAME=agasa_hub
export CLOUD_SQL_APP_USER=agasa_app
export CLOUD_SQL_APP_PASSWORD='<mot_de_passe_fort>'

./scripts/cloudsql/bootstrap-hub.sh
```

## 3. Démarrer le proxy Cloud SQL

```bash
export CLOUD_SQL_INSTANCE_CONNECTION_NAME='agasa-gabon-2026:europe-west1:agasa-hub-prod'
export CLOUD_SQL_PROXY_PORT=5432
./scripts/cloudsql/start-proxy.sh
```

## 4. Appliquer les migrations PostgreSQL

```bash
export DATABASE_URL='postgresql://agasa_app:<pwd>@127.0.0.1:5432/agasa_hub?sslmode=disable'
./scripts/cloudsql/apply-migrations.sh
```

## 5. Synchronisation bidirectionnelle

### Convex -> PostgreSQL

```bash
export HUB_SYNC_TOKEN='<token_hub_sync>'
export AGASA_CORE_PUBLIC_BASE_URL='http://localhost:3000'
./scripts/sync/convex-to-postgres.sh
```

### PostgreSQL -> Convex

```bash
./scripts/sync/postgres-to-convex.sh
```

### Les deux

```bash
./scripts/sync/run-bidirectional.sh
```

## 6. API Hub exposées

- `GET /api/hub/sync/convex-export?since=<ms>&limit=<n>`
- `POST /api/hub/sync/postgres-ingest`

Auth obligatoire:

```http
Authorization: Bearer <HUB_SYNC_TOKEN>
```

## 7. Payload POST `/api/hub/sync/postgres-ingest`

```json
{
  "events": [
    {
      "eventId": "pg-evt-123",
      "sourceSystem": "postgres_hub",
      "occurredAt": 1760000000000,
      "typeMessage": "core_validation_update",
      "payload": {"reference": "AGR-2026-00001", "status": "validated"},
      "applyToFlux": true,
      "fluxCode": "F1",
      "sourceApp": "AGASA-Admin",
      "destinationApp": "AGASA-Pro"
    }
  ]
}
```
