CREATE TABLE public.braze_configs (
  customer_id uuid PRIMARY KEY REFERENCES public.customers(id) ON DELETE CASCADE,
  api_key text NOT NULL DEFAULT '',
  rest_endpoint text NOT NULL DEFAULT '',
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.braze_configs TO authenticated;
GRANT ALL ON public.braze_configs TO service_role;
ALTER TABLE public.braze_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage braze configs" ON public.braze_configs FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER braze_configs_updated_at BEFORE UPDATE ON public.braze_configs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.tracking_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  failed_at timestamptz NOT NULL DEFAULT now(),
  update_type text NOT NULL,
  status_code integer,
  error text
);
CREATE INDEX tracking_failures_customer_failed_idx ON public.tracking_failures (customer_id, failed_at DESC);
GRANT SELECT ON public.tracking_failures TO authenticated;
GRANT ALL ON public.tracking_failures TO service_role;
ALTER TABLE public.tracking_failures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view tracking failures" ON public.tracking_failures FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));