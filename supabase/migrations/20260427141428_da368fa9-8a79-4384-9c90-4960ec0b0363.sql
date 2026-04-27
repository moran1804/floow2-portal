ALTER TABLE public.faqs
  ADD COLUMN product_id uuid REFERENCES public.products(id) ON DELETE RESTRICT;

UPDATE public.faqs
  SET product_id = (SELECT id FROM public.products WHERE code = 'GENERAL')
  WHERE product_id IS NULL;

ALTER TABLE public.faqs
  ALTER COLUMN product_id SET NOT NULL;

CREATE INDEX idx_faqs_product_id ON public.faqs(product_id);