import { describe, expect, it } from "vitest";
import { feedbackSchema } from "./feedback";

describe("feedback", () => {
  it("accepts all three ratings and optional comments", () => {
    for (const rating of ["unhappy", "neutral", "happy"]) {
      expect(feedbackSchema.parse({ rating, comment: "", page_path: "/admin/overview" }).rating).toBe(rating);
    }
    expect(feedbackSchema.safeParse({ rating: "unknown", comment: "", page_path: "/" }).success).toBe(false);
  });
});