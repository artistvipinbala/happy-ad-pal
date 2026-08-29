ALTER TABLE public.monthly_overrides ALTER COLUMN total_sales_count DROP NOT NULL;
ALTER TABLE public.monthly_overrides ALTER COLUMN total_revenue DROP NOT NULL;
ALTER TABLE public.monthly_overrides ALTER COLUMN ad_spend DROP NOT NULL;
ALTER TABLE public.monthly_overrides ALTER COLUMN total_expenses DROP NOT NULL;
ALTER TABLE public.expense_categories ADD COLUMN IF NOT EXISTS description TEXT;