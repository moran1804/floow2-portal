DROP POLICY "Admins can view notifications" ON public.notifications;
DROP POLICY "Admins can send notifications" ON public.notifications;
DROP POLICY "Users can view their own notification reads" ON public.notification_reads;
DROP POLICY "Users can mark their own notifications read" ON public.notification_reads;

CREATE POLICY "Signed-in users can view notifications"
ON public.notifications FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Signed-in users can send notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view their own notification reads"
ON public.notification_reads FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can mark their own notifications read"
ON public.notification_reads FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());