CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  title TEXT NOT NULL,
  upc TEXT,
  variant TEXT,
  pack_size INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS products_upc_pack_idx ON products(upc, pack_size) WHERE upc IS NOT NULL;

CREATE TABLE IF NOT EXISTS supplier_offers (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  supplier TEXT NOT NULL,
  supplier_sku TEXT,
  unit_cost NUMERIC(12,2) NOT NULL,
  currency CHAR(3) NOT NULL,
  moq INTEGER NOT NULL DEFAULT 1,
  source_url TEXT,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS research_runs (
  id BIGSERIAL PRIMARY KEY,
  source_type TEXT NOT NULL CHECK (source_type IN ('SUPPLIER','AMAZON_KEEPA','EBAY_GAP')),
  status TEXT NOT NULL DEFAULT 'PENDING',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ebay_observations (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT REFERENCES research_runs(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  marketplace TEXT NOT NULL,
  window_days INTEGER NOT NULL CHECK (window_days IN (30,90,180,365)),
  units_sold INTEGER NOT NULL,
  revenue NUMERIC(14,2) NOT NULL,
  unique_listings INTEGER NOT NULL,
  currency CHAR(3) NOT NULL,
  raw_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(run_id, product_id, marketplace, window_days)
);

CREATE TABLE IF NOT EXISTS ebay_seller_observations (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT REFERENCES research_runs(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  marketplace TEXT NOT NULL,
  seller TEXT NOT NULL,
  units_sold INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  out_of_stock BOOLEAN NOT NULL DEFAULT false,
  listing_price NUMERIC(12,2),
  shipping_price NUMERIC(12,2),
  currency CHAR(3),
  raw_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recommendations (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT REFERENCES research_runs(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  target_marketplace TEXT NOT NULL,
  score INTEGER NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('BUY','WATCH','REJECT')),
  target_sale_price NUMERIC(12,2),
  estimated_unit_profit NUMERIC(12,2),
  margin_pct NUMERIC(8,2),
  roi_pct NUMERIC(8,2),
  trend TEXT,
  recommended_initial_qty INTEGER,
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
