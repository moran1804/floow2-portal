ALTER TABLE public.features DROP CONSTRAINT features_key_key;
ALTER TABLE public.features ADD CONSTRAINT features_customer_id_key_key UNIQUE (customer_id, key);