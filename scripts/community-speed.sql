CREATE TABLE IF NOT EXISTS pending_speed (
  id TEXT PRIMARY KEY,
  received_at TEXT NOT NULL,
  day TEXT NOT NULL,
  client_tag TEXT NOT NULL,
  payload TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS pending_speed_day_client ON pending_speed (day, client_tag);
