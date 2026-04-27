-- 1. faq_categories table (scoped per product)
CREATE TABLE public.faq_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  UNIQUE (product_id, name)
);

ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all faq categories" ON public.faq_categories
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read faq categories of active products" ON public.faq_categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active = true)
  );
CREATE POLICY "Admins can insert faq categories" ON public.faq_categories
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update faq categories" ON public.faq_categories
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete faq categories" ON public.faq_categories
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER faq_categories_set_updated_at
  BEFORE UPDATE ON public.faq_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_faq_categories_product_id ON public.faq_categories(product_id);

-- 2. Seed standard smartphone telematics categories for every existing product
WITH seed(name, sort_order) AS (
  VALUES
    ('Getting started', 10),
    ('Trips & driving data', 20),
    ('Scoring', 30),
    ('Privacy & data', 40),
    ('Permissions & device settings', 50),
    ('Battery & performance', 60),
    ('Notifications', 70),
    ('Account & login', 80),
    ('Rewards & incentives', 90),
    ('Troubleshooting', 100)
)
INSERT INTO public.faq_categories (product_id, name, sort_order)
SELECT p.id, s.name, s.sort_order
FROM public.products p
CROSS JOIN seed s;

-- 3. Add category_id to faqs
ALTER TABLE public.faqs
  ADD COLUMN category_id uuid REFERENCES public.faq_categories(id) ON DELETE RESTRICT;

-- Migrate existing FAQs onto a "Getting started" category for their product
UPDATE public.faqs f
SET category_id = (
  SELECT c.id FROM public.faq_categories c
  WHERE c.product_id = f.product_id AND c.name = 'Getting started'
  LIMIT 1
)
WHERE f.category_id IS NULL;

ALTER TABLE public.faqs
  ALTER COLUMN category_id SET NOT NULL;

-- Drop the legacy free-text category column
ALTER TABLE public.faqs DROP COLUMN category;

CREATE INDEX idx_faqs_category_id ON public.faqs(category_id);