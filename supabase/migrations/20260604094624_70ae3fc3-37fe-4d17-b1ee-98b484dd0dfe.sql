CREATE OR REPLACE FUNCTION public.activate_all_features()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'floow_staff') THEN
    RAISE EXCEPTION 'Only Floow staff can activate features';
  END IF;

  UPDATE public.features
    SET state = 'active',
        start_at = COALESCE(start_at, now()),
        end_at = NULL,
        updated_by = auth.uid()
    WHERE state = 'inactive';
END;
$$;