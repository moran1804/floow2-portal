DROP INDEX IF EXISTS public.one_active_terms;
CREATE UNIQUE INDEX IF NOT EXISTS terms_versions_product_title_key ON public.terms_versions (product_id, title);