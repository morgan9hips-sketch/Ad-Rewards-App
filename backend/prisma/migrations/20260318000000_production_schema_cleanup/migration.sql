-- Drop dead tables
DROP TABLE IF EXISTS coin_conversions CASCADE;
DROP TABLE IF EXISTS conversion_details CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS admin_actions CASCADE;
DROP TABLE IF EXISTS location_revenue_pools CASCADE;
DROP TABLE IF EXISTS location_conversions CASCADE;
DROP TABLE IF EXISTS ad_impressions CASCADE;
DROP TABLE IF EXISTS expired_balances CASCADE;
DROP TABLE IF EXISTS coin_valuations CASCADE;
DROP TABLE IF EXISTS beta_debts CASCADE;
DROP TABLE IF EXISTS monetag_impressions CASCADE;
DROP TABLE IF EXISTS revenue_pools CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS adcoin_transactions CASCADE;
DROP TABLE IF EXISTS adcoin_ledger CASCADE;
DROP TABLE IF EXISTS adcoin_actions CASCADE;
DROP TABLE IF EXISTS adify_users CASCADE;

-- Add financial + geo columns to survey_history
ALTER TABLE survey_history ADD COLUMN IF NOT EXISTS country_code TEXT;
ALTER TABLE survey_history ADD COLUMN IF NOT EXISTS revenue_usd NUMERIC(12,6);
ALTER TABLE survey_history ADD COLUMN IF NOT EXISTS user_share_usd NUMERIC(12,6);
ALTER TABLE survey_history ADD COLUMN IF NOT EXISTS platform_share_usd NUMERIC(12,6);
ALTER TABLE survey_history ADD COLUMN IF NOT EXISTS split_percent INTEGER DEFAULT 60;
ALTER TABLE survey_history ADD COLUMN IF NOT EXISTS rate_to_zar_snapshot NUMERIC(18,8);
ALTER TABLE survey_history ADD COLUMN IF NOT EXISTS local_value NUMERIC(12,4);
ALTER TABLE survey_history ADD COLUMN IF NOT EXISTS currency TEXT;

-- Create offer_wall_history
CREATE TABLE IF NOT EXISTS offer_wall_history (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'cpx_research',
  trans_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status INTEGER NOT NULL,
  hash TEXT NOT NULL,
  hash_valid BOOLEAN NOT NULL DEFAULT false,
  offer_type TEXT,
  offer_name TEXT,
  source_ip TEXT,
  country_code TEXT,
  revenue_usd NUMERIC(12,6),
  user_share_usd NUMERIC(12,6),
  platform_share_usd NUMERIC(12,6),
  split_percent INTEGER DEFAULT 60,
  rate_to_zar_snapshot NUMERIC(18,8),
  local_value NUMERIC(12,4),
  currency TEXT,
  processed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  processed_at TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT offer_wall_history_trans_id_key UNIQUE (trans_id)
);
CREATE INDEX IF NOT EXISTS offer_wall_history_user_id_idx ON offer_wall_history(user_id);
CREATE INDEX IF NOT EXISTS offer_wall_history_status_idx ON offer_wall_history(status);

-- Create theoremreach_history
CREATE TABLE IF NOT EXISTS theoremreach_history (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'theoremreach',
  trans_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status INTEGER NOT NULL,
  hash_valid BOOLEAN NOT NULL DEFAULT false,
  source_ip TEXT,
  country_code TEXT,
  revenue_usd NUMERIC(12,6),
  user_share_usd NUMERIC(12,6),
  platform_share_usd NUMERIC(12,6),
  split_percent INTEGER DEFAULT 60,
  rate_to_zar_snapshot NUMERIC(18,8),
  local_value NUMERIC(12,4),
  currency TEXT,
  processed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  processed_at TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT theoremreach_history_trans_id_key UNIQUE (trans_id)
);
CREATE INDEX IF NOT EXISTS theoremreach_history_user_id_idx ON theoremreach_history(user_id);
CREATE INDEX IF NOT EXISTS theoremreach_history_status_idx ON theoremreach_history(status);

-- Create store_catalog
CREATE TABLE IF NOT EXISTS store_catalog (
  id SERIAL PRIMARY KEY,
  product_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  name TEXT NOT NULL,
  denomination_local NUMERIC(10,2) NOT NULL,
  currency_code TEXT NOT NULL,
  country_code TEXT NOT NULL,
  coins_required INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create store_orders
CREATE TABLE IF NOT EXISTS store_orders (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  catalog_id INTEGER NOT NULL REFERENCES store_catalog(id),
  product_type TEXT NOT NULL,
  coins_spent INTEGER NOT NULL,
  local_amount NUMERIC(10,2) NOT NULL,
  currency_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  fulfilment_ref TEXT,
  notes TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fulfilled_at TIMESTAMP(3)
);

-- Create task_bonus_progress
CREATE TABLE IF NOT EXISTS task_bonus_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  completions_count INTEGER NOT NULL DEFAULT 0,
  bonus_awarded BOOLEAN NOT NULL DEFAULT false,
  bonus_coins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, period_start)
);