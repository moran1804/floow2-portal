
-- 1. customers table
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view customers"
  ON public.customers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin or floow_staff can insert customers"
  ON public.customers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'floow_staff'));

CREATE POLICY "Admin or floow_staff can update customers"
  ON public.customers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'floow_staff'));

CREATE POLICY "Admin or floow_staff can delete customers"
  ON public.customers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'floow_staff'));

CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE UNIQUE INDEX customers_single_default_idx
  ON public.customers ((1)) WHERE is_default;

-- 2. Seed
INSERT INTO public.customers (name, code, is_default) VALUES
  ('mobileAndroid', 'mobileAndroid', true),
  ('mobileiOS', 'mobileiOS', false);

-- 3. set_default_customer RPC
CREATE OR REPLACE FUNCTION public.set_default_customer(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'floow_staff')) THEN
    RAISE EXCEPTION 'Not authorised to set default customer';
  END IF;

  UPDATE public.customers SET is_default = false WHERE is_default = true AND id <> _id;
  UPDATE public.customers SET is_default = true, updated_by = auth.uid() WHERE id = _id;
END;
$$;

-- 4. Add customer_id to scoped tables, backfill to default, make NOT NULL
DO $$
DECLARE default_customer uuid;
BEGIN
  SELECT id INTO default_customer FROM public.customers WHERE is_default LIMIT 1;

  ALTER TABLE public.products ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE;
  UPDATE public.products SET customer_id = default_customer;
  ALTER TABLE public.products ALTER COLUMN customer_id SET NOT NULL;
  CREATE INDEX products_customer_id_idx ON public.products(customer_id);

  ALTER TABLE public.features ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE;
  UPDATE public.features SET customer_id = default_customer;
  ALTER TABLE public.features ALTER COLUMN customer_id SET NOT NULL;
  CREATE INDEX features_customer_id_idx ON public.features(customer_id);

  ALTER TABLE public.terms_versions ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE;
  UPDATE public.terms_versions SET customer_id = default_customer;
  ALTER TABLE public.terms_versions ALTER COLUMN customer_id SET NOT NULL;
  CREATE INDEX terms_versions_customer_id_idx ON public.terms_versions(customer_id);

  ALTER TABLE public.faqs ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE;
  UPDATE public.faqs SET customer_id = default_customer;
  ALTER TABLE public.faqs ALTER COLUMN customer_id SET NOT NULL;
  CREATE INDEX faqs_customer_id_idx ON public.faqs(customer_id);

  ALTER TABLE public.faq_categories ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE;
  UPDATE public.faq_categories SET customer_id = default_customer;
  ALTER TABLE public.faq_categories ALTER COLUMN customer_id SET NOT NULL;
  CREATE INDEX faq_categories_customer_id_idx ON public.faq_categories(customer_id);
END $$;
