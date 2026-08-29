CREATE TABLE public.product_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  gst_rate_percent NUMERIC NOT NULL DEFAULT 18,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_config TO authenticated;
GRANT ALL ON public.product_config TO service_role;
ALTER TABLE public.product_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated full access" ON public.product_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_categories TO authenticated;
GRANT ALL ON public.expense_categories TO service_role;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated full access" ON public.expense_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated full access" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.sales_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity INTEGER NOT NULL DEFAULT 0,
  gpay_quantity INTEGER NOT NULL DEFAULT 0,
  usd_quantity INTEGER NOT NULL DEFAULT 0,
  eur_quantity INTEGER NOT NULL DEFAULT 0,
  usd_rate NUMERIC NOT NULL DEFAULT 0,
  eur_rate NUMERIC NOT NULL DEFAULT 0,
  usd_amount_inr NUMERIC NOT NULL DEFAULT 0,
  eur_amount_inr NUMERIC NOT NULL DEFAULT 0,
  amount_per_sale NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  gst_collected NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_entries TO authenticated;
GRANT ALL ON public.sales_entries TO service_role;
ALTER TABLE public.sales_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated full access" ON public.sales_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.ad_daily_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ad_spend NUMERIC NOT NULL DEFAULT 0,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  ctr NUMERIC NOT NULL DEFAULT 0,
  cpl NUMERIC NOT NULL DEFAULT 0,
  cpr NUMERIC NOT NULL DEFAULT 0,
  cpc NUMERIC NOT NULL DEFAULT 0,
  three_second_views BIGINT NOT NULL DEFAULT 0,
  fifty_percent_views BIGINT NOT NULL DEFAULT 0,
  ninety_five_percent_views BIGINT NOT NULL DEFAULT 0,
  frequency NUMERIC NOT NULL DEFAULT 0,
  reach BIGINT NOT NULL DEFAULT 0,
  conversions BIGINT NOT NULL DEFAULT 0,
  is_manual_override BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_daily_data TO authenticated;
GRANT ALL ON public.ad_daily_data TO service_role;
ALTER TABLE public.ad_daily_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated full access" ON public.ad_daily_data FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.ad_breakdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  level TEXT NOT NULL,
  campaign_id TEXT,
  campaign_name TEXT,
  adset_id TEXT,
  adset_name TEXT,
  ad_id TEXT,
  ad_name TEXT,
  spend NUMERIC NOT NULL DEFAULT 0,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  ctr NUMERIC NOT NULL DEFAULT 0,
  cpc NUMERIC NOT NULL DEFAULT 0,
  cpr NUMERIC NOT NULL DEFAULT 0,
  reach BIGINT NOT NULL DEFAULT 0,
  frequency NUMERIC NOT NULL DEFAULT 0,
  conversions BIGINT NOT NULL DEFAULT 0,
  three_second_views BIGINT NOT NULL DEFAULT 0,
  fifty_percent_views BIGINT NOT NULL DEFAULT 0,
  ninety_five_percent_views BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ad_breakdown_date_level_idx ON public.ad_breakdown (date, level);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_breakdown TO authenticated;
GRANT ALL ON public.ad_breakdown TO service_role;
ALTER TABLE public.ad_breakdown ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated full access" ON public.ad_breakdown FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.monthly_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL UNIQUE,
  total_sales_count NUMERIC NOT NULL DEFAULT 0,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  ad_spend NUMERIC NOT NULL DEFAULT 0,
  total_expenses NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_overrides TO authenticated;
GRANT ALL ON public.monthly_overrides TO service_role;
ALTER TABLE public.monthly_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated full access" ON public.monthly_overrides FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.ad_daily_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_entries;