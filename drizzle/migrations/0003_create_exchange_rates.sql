CREATE TABLE public.exchange_rates (
  date DATE PRIMARY KEY,
  usd_to_inr NUMERIC(10,2) NOT NULL,
  eur_to_inr NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.exchange_rates TO authenticated;
GRANT ALL ON public.exchange_rates TO service_role;

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read exchange rates"
ON public.exchange_rates
FOR SELECT
TO authenticated
USING (true);