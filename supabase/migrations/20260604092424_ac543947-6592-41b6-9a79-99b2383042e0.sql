-- Features table
CREATE TABLE IF NOT EXISTS public.features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  state text NOT NULL DEFAULT 'inactive' CHECK (state IN ('active','inactive')),
  start_at timestamptz,
  end_at timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.features TO authenticated;
GRANT ALL ON public.features TO service_role;

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- Any authenticated admin or floow_staff can read
CREATE POLICY "Admins and Floow staff can view features"
  ON public.features FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'floow_staff')
  );

-- Only floow_staff can modify
CREATE POLICY "Floow staff can update features"
  ON public.features FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'floow_staff'))
  WITH CHECK (public.has_role(auth.uid(), 'floow_staff'));

CREATE POLICY "Floow staff can insert features"
  ON public.features FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'floow_staff'));

CREATE POLICY "Floow staff can delete features"
  ON public.features FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'floow_staff'));

CREATE TRIGGER features_set_updated_at
  BEFORE UPDATE ON public.features
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Activate / deactivate RPCs
CREATE OR REPLACE FUNCTION public.activate_feature(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    WHERE id = _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.deactivate_feature(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'floow_staff') THEN
    RAISE EXCEPTION 'Only Floow staff can deactivate features';
  END IF;

  UPDATE public.features
    SET state = 'inactive',
        end_at = now(),
        updated_by = auth.uid()
    WHERE id = _id;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_feature(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.deactivate_feature(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activate_feature(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deactivate_feature(uuid) TO authenticated;

-- Seed default features
INSERT INTO public.features (key, name, category, description, state, start_at, sort_order) VALUES
  ('journey_recording','Journey recording','Journeys','Record raw journey data from the device.','active', now(), 10),
  ('journey_preprocessing','Journey preprocessing','Journeys','Clean and prepare recorded journeys.','active', now(), 20),
  ('impact_detection','Impact detection','Journeys','Detect impacts during a journey.','inactive', now(), 30),
  ('map_matching','Map matching','Journeys','Match GPS traces to the road network.','active', now(), 40),
  ('mode_of_transport_detection','Mode of transport detection','Journeys','Detect car, train, walking, etc.','active', now(), 50),
  ('journey_events_longitudinal','Journey events longitudinal','Journeys','Acceleration / braking events.','active', now(), 60),
  ('journey_events_lateral','Journey events lateral','Journeys','Cornering events.','active', now(), 70),
  ('journey_events_mobile_use','Journey events mobile use','Journeys','Detect phone use while driving.','active', now(), 80),
  ('scoring','Scoring','Scoring','Driver scoring engine.','active', now(), 10),
  ('campaigns','Campaigns','Floow campaigns','Run engagement campaigns.','inactive', NULL, 10),
  ('impact_alerts','Impact alerts','Floow campaigns','Send alerts when an impact is detected.','inactive', NULL, 20),
  ('connected_vehicle_data','Connected vehicle data','Other','Ingest data from connected vehicles.','inactive', NULL, 10)
ON CONFLICT (key) DO NOTHING;
