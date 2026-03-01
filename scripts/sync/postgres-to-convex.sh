#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL est requis}"
: "${HUB_SYNC_TOKEN:?HUB_SYNC_TOKEN est requis}"

CORE_SYNC_BASE_URL=${CORE_SYNC_BASE_URL:-${AGASA_CORE_PUBLIC_BASE_URL:-http://localhost:3000}}
BATCH_SIZE=${BATCH_SIZE:-100}

if ! command -v psql >/dev/null 2>&1; then
  echo "Erreur: psql introuvable"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Erreur: jq introuvable"
  exit 1
fi

SQL="SELECT id::text, payload::text FROM agasa_hub.hub_outbox_events WHERE status='pending' ORDER BY created_at ASC LIMIT ${BATCH_SIZE};"
ROWS=$(psql "$DATABASE_URL" -At -F $'\t' -c "$SQL")

if [ -z "$ROWS" ]; then
  echo "Aucun event PostgreSQL en attente."
  exit 0
fi

echo "Push PostgreSQL -> Convex (batch=${BATCH_SIZE})"
ENDPOINT="${CORE_SYNC_BASE_URL%/}/api/hub/sync/postgres-ingest"

while IFS=$'\t' read -r id payload; do
  [ -n "$id" ] || continue

  body=$(jq -n --argjson event "$payload" '{events: [$event]}')

  set +e
  response=$(curl -sS -X POST "$ENDPOINT" \
    -H "Authorization: Bearer ${HUB_SYNC_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$body")
  code=$?
  set -e

  if [ $code -eq 0 ] && echo "$response" | jq -e '.failureCount == 0' >/dev/null 2>&1; then
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v id="$id" <<'SQL'
UPDATE agasa_hub.hub_outbox_events
SET status='sent', sent_at=NOW(), last_error=NULL
WHERE id = (:'id')::bigint;
SQL
    echo "Event ${id} envoyé."
  else
    err="$(echo "$response" | jq -r '.error // .details // "Echec ingestion"' 2>/dev/null || echo "Echec ingestion")"
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v id="$id" -v err="$err" <<'SQL'
UPDATE agasa_hub.hub_outbox_events
SET retry_count = retry_count + 1,
    last_error = :'err',
    status = CASE WHEN retry_count + 1 >= 10 THEN 'dead_letter' ELSE 'pending' END
WHERE id = (:'id')::bigint;
SQL
    echo "Event ${id} en erreur: ${err}"
  fi
done <<< "$ROWS"

echo "Sync PostgreSQL -> Convex terminée."
