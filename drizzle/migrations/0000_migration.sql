CREATE TABLE public.apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  app_type text NOT NULL CHECK (app_type IN ('floow_managed','self_managed')),
  callback_urls text[] NOT NULL DEFAULT '{}',
  signout_urls text[] NOT NULL DEFAULT '{}',
  oidc_issuer_url text,
  aud_claim text,
  user_id_claim text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.apps TO authenticated;
GRANT ALL ON public.apps TO service_role;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view apps" ON public.apps FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can insert apps" ON public.apps FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update apps" ON public.apps FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete apps" ON public.apps FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER apps_updated_at BEFORE UPDATE ON public.apps FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();