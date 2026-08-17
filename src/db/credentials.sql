CREATE TABLE IF NOT EXISTS app_credentials (
  key TEXT PRIMARY KEY,
  ciphertext TEXT NOT NULL,
  iv TEXT NOT NULL,
  tag TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Secrets are encrypted by the application before reaching PostgreSQL.
-- APP_ENCRYPTION_KEY itself must remain an environment/deployment secret and is never stored in this table.
