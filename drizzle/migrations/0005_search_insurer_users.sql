CREATE OR REPLACE FUNCTION public.search_insurer_users(_customer_id uuid, _query text, _mode text, _field text)
RETURNS SETOF public.insurer_users LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
 SELECT u.* FROM public.insurer_users u
 WHERE u.customer_id = _customer_id AND length(trim(_query)) > 0 AND (
 (_mode = 'smart' AND (
 strpos(lower(u.email), lower(trim(_query))) > 0 OR
 strpos(lower(concat_ws(' ', u.first_name, u.last_name)), lower(trim(_query))) > 0 OR
 strpos(lower(coalesce(u.policy_client_id, '')), lower(trim(_query))) > 0 OR
 strpos(lower(coalesce(u.postal_code, '')), lower(trim(_query))) > 0 OR
 strpos(coalesce(u.date_of_birth::text, ''), trim(_query)) > 0
 )) OR
 (_mode = 'exact' AND lower(CASE _field WHEN 'email' THEN u.email WHEN 'policy-client-id' THEN u.policy_client_id WHEN 'postal-code' THEN u.postal_code WHEN 'date-of-birth' THEN u.date_of_birth::text ELSE NULL END) = lower(trim(_query)))
 ) ORDER BY u.last_name, u.first_name LIMIT 100;
$$;
REVOKE ALL ON FUNCTION public.search_insurer_users(uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_insurer_users(uuid, text, text, text) TO authenticated, service_role;