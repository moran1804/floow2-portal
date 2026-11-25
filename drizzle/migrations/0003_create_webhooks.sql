CREATE TABLE public.webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  description text NOT NULL,
  url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  headers jsonb NOT NULL DEFAULT '[]'::jsonb,
  event_types text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_subscriptions TO authenticated;
GRANT ALL ON public.webhook_subscriptions TO service_role;
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage webhook subscriptions" ON public.webhook_subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER webhook_subscriptions_updated_at BEFORE UPDATE ON public.webhook_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.webhook_events TO authenticated;
GRANT ALL ON public.webhook_events TO service_role;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view webhook events" ON public.webhook_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));