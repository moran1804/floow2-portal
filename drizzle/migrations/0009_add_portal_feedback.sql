CREATE TABLE public.portal_feedback (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 customer_id uuid REFERENCES public.customers(id),
 user_id uuid NOT NULL,
 rating text NOT NULL CHECK (rating IN ('unhappy', 'neutral', 'happy')),
 comment text NOT NULL DEFAULT '' CHECK (char_length(comment) <= 4000),
 page_path text NOT NULL CHECK (char_length(page_path) <= 1000),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.portal_feedback TO authenticated;
GRANT ALL ON public.portal_feedback TO service_role;
ALTER TABLE public.portal_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users submit their own feedback" ON public.portal_feedback FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Floow administrators review feedback" ON public.portal_feedback FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') AND public.has_role(auth.uid(), 'floow_staff'));
CREATE INDEX portal_feedback_customer_created_idx ON public.portal_feedback(customer_id, created_at DESC);