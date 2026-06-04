
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS campaigns_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS campaigns_config jsonb NOT NULL DEFAULT '{}'::jsonb;
