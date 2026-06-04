
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS mode_of_transport_user_editable_period text NOT NULL DEFAULT 'P2D',
  ADD COLUMN IF NOT EXISTS scoring_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS score_config text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS impact_detection_enabled boolean NOT NULL DEFAULT false;
