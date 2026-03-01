-- AGASA Hub Sovereign DB bootstrap (PostgreSQL)
-- OMEGA-M4

CREATE SCHEMA IF NOT EXISTS agasa_hub;

CREATE TABLE IF NOT EXISTS agasa_hub.hub_sync_events (
  event_id TEXT PRIMARY KEY,
  stream TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'convex_export',
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_sync_events_stream_time
  ON agasa_hub.hub_sync_events (stream, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_hub_sync_events_ingested_at
  ON agasa_hub.hub_sync_events (ingested_at DESC);

CREATE TABLE IF NOT EXISTS agasa_hub.hub_outbox_events (
  id BIGSERIAL PRIMARY KEY,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_hub_outbox_events_status
  ON agasa_hub.hub_outbox_events (status, created_at ASC);

CREATE TABLE IF NOT EXISTS agasa_hub.sync_watermark (
  sync_name TEXT PRIMARY KEY,
  last_timestamp_ms BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO agasa_hub.sync_watermark(sync_name, last_timestamp_ms)
VALUES
  ('convex_to_postgres', 0),
  ('postgres_to_convex', 0)
ON CONFLICT (sync_name) DO NOTHING;
