CREATE TABLE public.api_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  scopes text[] NOT NULL DEFAULT '{}',
  client_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_credentials TO authenticated;
GRANT ALL ON public.api_credentials TO service_role;
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage api credentials" ON public.api_credentials FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));