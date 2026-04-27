CREATE OR REPLACE FUNCTION public.archive_terms(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_state public.terms_state;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can archive T&Cs';
  END IF;

  SELECT state INTO current_state FROM public.terms_versions WHERE id = _id;

  IF current_state IS NULL THEN
    RAISE EXCEPTION 'Terms version not found';
  END IF;

  IF current_state = 'active' THEN
    RAISE EXCEPTION 'Active T&Cs cannot be archived. Publish a new version first.';
  END IF;

  IF current_state = 'archived' THEN
    RETURN;
  END IF;

  UPDATE public.terms_versions
    SET state = 'archived',
        scheduled_at = NULL,
        updated_by = auth.uid()
    WHERE id = _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.publish_terms_now(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_state public.terms_state;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can publish T&Cs';
  END IF;

  SELECT state INTO current_state FROM public.terms_versions WHERE id = _id;

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
    WHERE state = 'active' AND id <> _id;

  UPDATE public.terms_versions
    SET state = 'active',
        published_at = now(),
        scheduled_at = NULL,
        updated_by = auth.uid()
    WHERE id = _id;
END;
$$;