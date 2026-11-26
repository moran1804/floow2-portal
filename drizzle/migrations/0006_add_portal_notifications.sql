CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('release', 'feature')),
  title text NOT NULL,
  body text NOT NULL,
  sender_name text NOT NULL DEFAULT 'The Floow',
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notifications"
ON public.notifications FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can send notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') AND created_by = auth.uid());

CREATE TABLE public.notification_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (notification_id, user_id)
);

GRANT SELECT, INSERT ON public.notification_reads TO authenticated;
GRANT ALL ON public.notification_reads TO service_role;

ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification reads"
ON public.notification_reads FOR SELECT TO authenticated
USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can mark their own notifications read"
ON public.notification_reads FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE INDEX notifications_customer_sent_idx ON public.notifications(customer_id, sent_at DESC);
CREATE INDEX notification_reads_user_idx ON public.notification_reads(user_id, notification_id);

INSERT INTO public.notifications (customer_id, category, title, body, sender_name, sent_at)
SELECT c.id, v.category, v.title, v.body, 'The Floow', v.sent_at
FROM public.customers c
CROSS JOIN (
  VALUES
    ('feature', 'New: policy-level driver scores', 'You can now open a policy to see its combined driver score and the individual scores for each driver.\n\nUse the policy overview to compare driver performance and move directly to a driver''s detailed account.', now() - interval '3 hours'),
    ('release', 'Portal release 2.8 is now available', 'This release introduces a refreshed journey table, clearer score summaries and a single date-range picker for finding journeys.\n\nThe update is available now; no action is needed from your team.', now() - interval '1 day'),
    ('feature', 'Choose how speeds and distances are displayed', 'Client Configuration now includes MPH and KPH units. Your selection updates speeds and distances throughout the portal, including journeys, impacts and insights.\n\nThe preference is saved separately for each client.', now() - interval '3 days'),
    ('release', 'Search improvements for Smart match', 'Smart match now offers matching user accounts as you type. Partial names, email addresses, policy IDs and user IDs are supported.\n\nExact match remains available when you need to search using a complete value.', now() - interval '7 days')
) AS v(category, title, body, sent_at)
WHERE c.archived_at IS NULL;