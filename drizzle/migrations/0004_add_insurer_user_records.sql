CREATE TABLE public.insurer_users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 customer_id uuid NOT NULL REFERENCES public.customers(id),
 product_id uuid REFERENCES public.products(id),
 email text NOT NULL,
 first_name text NOT NULL DEFAULT '',
 last_name text NOT NULL DEFAULT '',
 display_name text NOT NULL DEFAULT '',
 policy_client_id text,
 postal_code text,
 date_of_birth date,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(customer_id, email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insurer_users TO authenticated;
GRANT ALL ON public.insurer_users TO service_role;
ALTER TABLE public.insurer_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage insurer users" ON public.insurer_users FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.validate_insurer_user_product() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN
 IF NEW.product_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.products WHERE id = NEW.product_id AND customer_id = NEW.customer_id) THEN RAISE EXCEPTION 'Product must belong to the user customer'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER insurer_user_product_scope BEFORE INSERT OR UPDATE ON public.insurer_users FOR EACH ROW EXECUTE FUNCTION public.validate_insurer_user_product();