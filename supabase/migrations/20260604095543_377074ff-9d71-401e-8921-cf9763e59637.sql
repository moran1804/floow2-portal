
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS products_only_one_default
  ON public.products ((is_default)) WHERE is_default = true;

CREATE OR REPLACE FUNCTION public.set_default_product(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'floow_staff')) THEN
    RAISE EXCEPTION 'Not authorised to set default product';
  END IF;

  UPDATE public.products SET is_default = false WHERE is_default = true AND id <> _id;
  UPDATE public.products SET is_default = true, updated_by = auth.uid() WHERE id = _id;
END;
$$;
