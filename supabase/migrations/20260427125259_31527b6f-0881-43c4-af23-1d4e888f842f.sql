-- Acceptance log
CREATE TABLE public.terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terms_version_id UUID NOT NULL REFERENCES public.terms_versions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (terms_version_id, user_id)
);

CREATE INDEX idx_terms_acceptances_version ON public.terms_acceptances(terms_version_id);
CREATE INDEX idx_terms_acceptances_user ON public.terms_acceptances(user_id);

ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

-- Users can record their own acceptance
CREATE POLICY "Users can record their own acceptance"
ON public.terms_acceptances
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own acceptances
CREATE POLICY "Users can view their own acceptances"
ON public.terms_acceptances
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all acceptances"
ON public.terms_acceptances
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Aggregate stats function (safe to expose: counts only)
CREATE OR REPLACE FUNCTION public.terms_acceptance_stats(_id uuid)
RETURNS TABLE (
  total_acceptances bigint,
  acceptances_last_24h bigint,
  acceptances_last_7d bigint,
  first_accepted_at timestamptz,
  last_accepted_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    COUNT(*)::bigint AS total_acceptances,
    COUNT(*) FILTER (WHERE accepted_at >= now() - interval '24 hours')::bigint AS acceptances_last_24h,
    COUNT(*) FILTER (WHERE accepted_at >= now() - interval '7 days')::bigint AS acceptances_last_7d,
    MIN(accepted_at) AS first_accepted_at,
    MAX(accepted_at) AS last_accepted_at
  FROM public.terms_acceptances
  WHERE terms_version_id = _id;
$$;

REVOKE EXECUTE ON FUNCTION public.terms_acceptance_stats(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.terms_acceptance_stats(uuid) TO authenticated;