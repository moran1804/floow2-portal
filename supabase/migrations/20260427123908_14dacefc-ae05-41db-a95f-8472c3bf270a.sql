
-- ===== Roles =====
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-grant admin to first signup, user to everyone else
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_grant_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- ===== Terms & Conditions =====
CREATE TYPE public.terms_state AS ENUM ('draft', 'scheduled', 'active', 'inactive');

CREATE TABLE public.terms_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  effective_date DATE NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  state public.terms_state NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce single active row
CREATE UNIQUE INDEX one_active_terms ON public.terms_versions ((state)) WHERE state = 'active';

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER terms_versions_set_updated_at
BEFORE UPDATE ON public.terms_versions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.terms_versions ENABLE ROW LEVEL SECURITY;

-- Public can read active T&Cs (used by mobile app)
CREATE POLICY "Anyone can read active T&Cs"
ON public.terms_versions FOR SELECT
USING (state = 'active');

-- Admins can do everything
CREATE POLICY "Admins can view all T&Cs"
ON public.terms_versions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert T&Cs"
ON public.terms_versions FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update T&Cs"
ON public.terms_versions FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete T&Cs"
ON public.terms_versions FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ===== Publish RPCs =====
-- Atomically publish a version: deactivates current active, activates target
CREATE OR REPLACE FUNCTION public.publish_terms_now(_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can publish T&Cs';
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

CREATE OR REPLACE FUNCTION public.schedule_terms(_id UUID, _scheduled_at TIMESTAMPTZ)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can schedule T&Cs';
  END IF;
  IF _scheduled_at <= now() THEN
    RAISE EXCEPTION 'Scheduled time must be in the future';
  END IF;

  -- only one scheduled at a time: revert other scheduled rows back to draft
  UPDATE public.terms_versions
    SET state = 'draft', scheduled_at = NULL
    WHERE state = 'scheduled' AND id <> _id;

  UPDATE public.terms_versions
    SET state = 'scheduled',
        scheduled_at = _scheduled_at,
        updated_by = auth.uid()
    WHERE id = _id;
END;
$$;

-- Promotes any due scheduled rows. Run by pg_cron every minute.
CREATE OR REPLACE FUNCTION public.activate_due_terms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  due_id UUID;
BEGIN
  SELECT id INTO due_id
  FROM public.terms_versions
  WHERE state = 'scheduled' AND scheduled_at <= now()
  ORDER BY scheduled_at ASC
  LIMIT 1;

  IF due_id IS NOT NULL THEN
    UPDATE public.terms_versions SET state = 'inactive' WHERE state = 'active';
    UPDATE public.terms_versions
      SET state = 'active', published_at = now(), scheduled_at = NULL
      WHERE id = due_id;
  END IF;
END;
$$;

-- Schedule via pg_cron (runs every minute)
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('activate-due-terms', '* * * * *', $$SELECT public.activate_due_terms();$$);
