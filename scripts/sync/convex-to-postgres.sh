#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL est requis}"
: "${HUB_SYNC_TOKEN:?HUB_SYNC_TOKEN est requis}"

CORE_SYNC_BASE_URL=${CORE_SYNC_BASE_URL:-${AGASA_ADMIN_PUBLIC_BASE_URL:-http://localhost:3000}}
SYNC_LIMIT=${SYNC_LIMIT:-500}
WATERMARK_NAME=${WATERMARK_NAME:-convex_to_postgres}

if ! command -v psql >/dev/null 2>&1; then
  echo "Erreur: psql introuvable"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Erreur: jq introuvable"
  exit 1
fi

SINCE_TS=${SINCE_TS:-$(psql "$DATABASE_URL" -At -c "SELECT COALESCE(last_timestamp_ms, 0) FROM agasa_hub.sync_watermark WHERE sync_name='${WATERMARK_NAME}';")}
SINCE_TS=${SINCE_TS:-0}

URL="${CORE_SYNC_BASE_URL%/}/api/hub/sync/convex-export?since=${SINCE_TS}&limit=${SYNC_LIMIT}"
echo "Export Convex -> PostgreSQL depuis ${SINCE_TS}"

RESPONSE=$(curl -fsS -H "Authorization: Bearer ${HUB_SYNC_TOKEN}" "$URL")
EVENT_COUNT=$(echo "$RESPONSE" | jq '.events | length')
NEXT_SINCE=$(echo "$RESPONSE" | jq -r '.nextSince')

if [ "$EVENT_COUNT" -eq 0 ]; then
  echo "Aucun event à synchroniser."
  exit 0
fi

echo "Events reçus: $EVENT_COUNT"

echo "$RESPONSE" | jq -c '.events[]' | while IFS= read -r event; do
  event_id=$(echo "$event" | jq -r '.id')
  stream=$(echo "$event" | jq -r '.stream')
  ts=$(echo "$event" | jq -r '.timestamp')
  payload=$(echo "$event" | jq -c '.data')

  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
    -v event_id="$event_id" \
    -v stream="$stream" \
    -v ts="$ts" \
    -v payload="$payload" <<'SQL'
INSERT INTO agasa_hub.hub_sync_events(event_id, stream, occurred_at, payload, source)
VALUES (
  :'event_id',
  :'stream',
  to_timestamp((:'ts')::double precision / 1000.0),
  :'payload'::jsonb,
  'convex_export'
)
ON CONFLICT (event_id)
DO UPDATE SET
  stream = EXCLUDED.stream,
  occurred_at = EXCLUDED.occurred_at,
  payload = EXCLUDED.payload,
  ingested_at = NOW();
SQL

done

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v watermark="$WATERMARK_NAME" -v next_since="$NEXT_SINCE" <<'SQL'
INSERT INTO agasa_hub.sync_watermark(sync_name, last_timestamp_ms, updated_at)
VALUES (:'watermark', :'next_since', NOW())
ON CONFLICT (sync_name)
DO UPDATE SET
  last_timestamp_ms = EXCLUDED.last_timestamp_ms,
  updated_at = NOW();
SQL

echo "Sync Convex -> PostgreSQL terminée. nextSince=${NEXT_SINCE}"
