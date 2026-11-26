import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Frown, Meh, Smile, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useCustomer } from "@/contexts/CustomerContext";
import { supabase } from "@/integrations/supabase/client";
import { canReviewFeedback, feedbackSchema, type FeedbackRating } from "@/lib/feedback";

const ratings = [
  { value: "unhappy", label: "Unhappy", Icon: Frown, color: "text-destructive" },
  { value: "neutral", label: "Neutral", Icon: Meh, color: "text-[hsl(var(--score-caution))]" },
  { value: "happy", label: "Happy", Icon: Smile, color: "text-[hsl(var(--score-good))]" },
] as const;

export function PortalFeedback() {
  const { user, isAdmin, isFloowStaff } = useAuth();
  const { selectedCustomerId } = useCustomer();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const canReview = canReviewFeedback(isAdmin, isFloowStaff);
  const reviews = useQuery({
    queryKey: ["portal-feedback", selectedCustomerId, user?.id],
    enabled: reviewOpen && canReview,
    queryFn: async () => {
      let query = supabase.from("portal_feedback").select("id,rating,comment,page_path,created_at").order("created_at", { ascending: false }).limit(100);
      query = selectedCustomerId ? query.eq("customer_id", selectedCustomerId) : query.is("customer_id", null);
      const { data, error: readError } = await query;
      if (readError) throw readError;
      return data;
    },
  });

  useEffect(() => {
    setOpen(false);
    setRating(null);
    setComment("");
    setSent(false);
    setError("");
  }, [pathname, selectedCustomerId]);

  if (!user) return null;

  const chooseRating = (value: FeedbackRating) => {
    setRating(value);
    setSent(false);
    setError("");
    setOpen(true);
  };
  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending || !rating) return;
    const parsed = feedbackSchema.safeParse({ rating, comment, page_path: pathname });
    if (!parsed.success) { setError("Please check your feedback and try again."); return; }
    setPending(true);
    setError("");
    try {
      const { error: saveError } = await supabase.from("portal_feedback").insert({ rating, comment: parsed.data.comment, page_path: pathname, customer_id: selectedCustomerId, user_id: user.id });
      if (saveError) throw saveError;
      setSent(true);
      setComment("");
      void reviews.refetch();
    } catch {
      setError("Your feedback could not be sent. Please try again.");
    } finally { setPending(false); }
  };

  const faces = (interactive: boolean) => ratings.map(({ value, label, Icon, color }) => (
    <Button key={value} type="button" variant="ghost" size="icon" aria-label={`Rate experience ${label.toLowerCase()}`} title={label} aria-pressed={rating === value && open} disabled={pending} onClick={() => chooseRating(value)} className={`h-8 w-8 rounded-full ${color} ${interactive && rating === value ? "bg-muted ring-1 ring-current" : ""}`}>
      <Icon className="h-4 w-4" />
    </Button>
  ));

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Popover open={open} onOpenChange={(value) => { if (!pending) setOpen(value); }}>
        <div className="flex items-center gap-1 rounded-lg border border-portal-border bg-portal-panel px-3 py-2 text-portal-text">
          <PopoverTrigger asChild><Button variant="ghost" className="h-8 px-1 text-sm font-normal" onClick={() => setSent(false)}>Rate your experience</Button></PopoverTrigger>
          {faces(false)}
        </div>
        <PopoverContent side="top" align="center" sideOffset={10} className="w-[320px] max-w-[calc(100vw-2rem)] p-4" aria-label="Share feedback">
          {sent ? <div className="space-y-3 text-center" role="status">
            <CheckCircle2 className="mx-auto h-7 w-7 text-[hsl(var(--score-good))]" />
            <p className="text-sm font-semibold">Thank you for your feedback</p>
            <p className="text-xs text-muted-foreground">Your feedback has been saved.</p>
            <Button variant="outline" className="w-full" onClick={() => { setOpen(false); setRating(null); setSent(false); }}>Close</Button>
          </div> : <form onSubmit={send} className="space-y-3">
            <div className="flex items-center justify-center gap-1 text-sm"><span className="mr-1">Rate your experience</span>{faces(true)}</div>
            <Textarea aria-label="Your feedback" autoFocus value={comment} onChange={(event) => setComment(event.target.value)} maxLength={4000} disabled={pending} placeholder="Please tell us about your experience. The more details you share, the better." className="min-h-32 resize-none text-sm" />
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">Please avoid including any personally identifiable information in your feedback.</p>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" disabled={pending} onClick={() => { setOpen(false); setRating(null); setComment(""); setError(""); }}>Cancel</Button>
              <Button type="submit" disabled={pending || !rating}>{pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send feedback</Button>
            </div>
          </form>}
        </PopoverContent>
      </Popover>
      {canReview && <Button variant="ghost" size="sm" onClick={() => setReviewOpen(true)} className="gap-2"><MessageSquare className="h-4 w-4" />View feedback</Button>}
      <Dialog open={reviewOpen && canReview} onOpenChange={setReviewOpen}>
        <DialogContent className="max-h-[80dvh] max-w-xl overflow-y-auto">
          <DialogHeader><DialogTitle>Client feedback</DialogTitle></DialogHeader>
          {reviews.isLoading ? <p className="text-sm text-muted-foreground">Loading feedback…</p> : reviews.isError ? <p role="alert" className="text-sm text-destructive">Feedback could not be loaded.</p> : !reviews.data?.length ? <p className="text-sm text-muted-foreground">No feedback received yet.</p> : <div className="divide-y divide-border">{reviews.data.map((item) => <article key={item.id} className="space-y-2 py-4">
            <div className="flex justify-between gap-3"><h3 className="text-sm font-semibold capitalize">{item.rating}</h3><time className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</time></div>
            <p className="whitespace-pre-wrap break-words text-sm">{item.comment || "Rating only"}</p>
            <p className="break-all text-xs text-muted-foreground">{item.page_path}</p>
          </article>)}</div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}