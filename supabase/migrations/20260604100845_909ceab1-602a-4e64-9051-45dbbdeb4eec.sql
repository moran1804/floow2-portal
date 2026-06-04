ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS campaigns_endpoint text,
  ADD COLUMN IF NOT EXISTS campaigns_api_key text;