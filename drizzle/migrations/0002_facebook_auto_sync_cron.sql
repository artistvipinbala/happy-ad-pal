CREATE TABLE public.app_cron_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.app_cron_config TO service_role;

ALTER TABLE public.app_cron_config ENABLE ROW LEVEL SECURITY;

-- No policies: only service_role (server code) may read this token.

CREATE INDEX IF NOT EXISTS ad_daily_data_date_idx ON public.ad_daily_data (date);
CREATE INDEX IF NOT EXISTS ad_breakdown_date_level_idx ON public.ad_breakdown (date, level);

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
