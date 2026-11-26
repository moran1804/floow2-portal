import { z } from "zod";

export const feedbackSchema = z.object({
  rating: z.enum(["unhappy", "neutral", "happy"]),
  comment: z.string().trim().max(4000),
  page_path: z.string().startsWith("/").max(1000),
});
export type FeedbackRating = z.infer<typeof feedbackSchema>["rating"];
export const canReviewFeedback = (isAdmin: boolean, isFloowStaff: boolean) => isAdmin && isFloowStaff;