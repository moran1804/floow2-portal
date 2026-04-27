-- 1. Products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read active products" ON public.products
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Seed a GENERAL product so any existing T&Cs can be migrated
INSERT INTO public.products (code, name) VALUES ('GENERAL', 'General');

-- 3. Add product_id to terms_versions
ALTER TABLE public.terms_versions
  ADD COLUMN product_id uuid REFERENCES public.products(id) ON DELETE RESTRICT;

UPDATE public.terms_versions
  SET product_id = (SELECT id FROM public.products WHERE code = 'GENERAL')
  WHERE product_id IS NULL;

ALTER TABLE public.terms_versions
  ALTER COLUMN product_id SET NOT NULL;

CREATE INDEX idx_terms_versions_product_id ON public.terms_versions(product_id);

-- 4. Enforce only one active T&Cs per product
CREATE UNIQUE INDEX idx_terms_versions_one_active_per_product
  ON public.terms_versions(product_id)
  WHERE state = 'active';

-- 5. Update publish_terms_now to scope inactivation to the same product
CREATE OR REPLACE FUNCTION public.publish_terms_now(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_state public.terms_state;
  v_product_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can publish T&Cs';
  END IF;

  SELECT state, product_id INTO current_state, v_product_id
    FROM public.terms_versions WHERE id = _id;

  IF current_state IS NULL THEN
    RAISE EXCEPTION 'Terms version not found';
  END IF;

  IF current_state = 'inactive' THEN
    RAISE EXCEPTION 'Inactive T&Cs versions cannot be republished. Create a new version instead.';
  END IF;

  IF current_state = 'archived' THEN
    RAISE EXCEPTION 'Archived T&Cs versions cannot be republished. Create a new version instead.';
  END IF;

  IF current_state = 'active' THEN
    RETURN;
  END IF;

  UPDATE public.terms_versions
    SET state = 'inactive'
    WHERE state = 'active'
      AND product_id = v_product_id
      AND id <> _id;

  UPDATE public.terms_versions
    SET state = 'active',
        published_at = now(),
        scheduled_at = NULL,
        updated_by = auth.uid()
    WHERE id = _id;
END;
$$;

-- 6. Update activate_due_terms to scope per product
CREATE OR REPLACE FUNCTION public.activate_due_terms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  due RECORD;
BEGIN
  FOR due IN
    SELECT id, product_id
    FROM public.terms_versions
    WHERE state = 'scheduled' AND scheduled_at <= now()
    ORDER BY scheduled_at ASC
  LOOP
    UPDATE public.terms_versions
      SET state = 'inactive'
      WHERE state = 'active' AND product_id = due.product_id;

    UPDATE public.terms_versions
      SET state = 'active', published_at = now(), scheduled_at = NULL
      WHERE id = due.id;
  END LOOP;
END;
$$;