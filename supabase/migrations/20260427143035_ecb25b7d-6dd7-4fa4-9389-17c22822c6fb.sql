DROP POLICY IF EXISTS "Anyone can read published FAQs" ON public.faqs;

CREATE POLICY "Anyone can read FAQs of active products" ON public.faqs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active = true)
  );

ALTER TABLE public.faqs DROP COLUMN is_published;