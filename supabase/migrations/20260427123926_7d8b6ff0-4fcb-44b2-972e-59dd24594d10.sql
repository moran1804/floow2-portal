
-- Lock down activate_due_terms (cron-only) and the trigger/role-handler helpers
REVOKE ALL ON FUNCTION public.activate_due_terms() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Only authenticated admins should call these RPCs (already enforced inside, but tighten EXECUTE)
REVOKE ALL ON FUNCTION public.publish_terms_now(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.schedule_terms(uuid, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_terms_now(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.schedule_terms(uuid, timestamptz) TO authenticated;

-- has_role is required for RLS evaluation; keep it executable but harden
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
