import { format, subDays } from "date-fns";

// Deliberately synthetic: never use these records as client telemetry.
export function makeSampleJourneys(productIds: string[], today: Date) {
  return Array.from({ length: 385 }, (_, i) => ({
    id: i,
    productId: productIds[i % Math.max(productIds.length, 1)] ?? "sample",
    date: format(subDays(today, i % 31), "yyyy-MM-dd"),
    os: i < 219 ? "iOS" : "Android",
    user: i % 15,
    miles: 1153 / 385,
    minutes: 2772 / 385,
    score: Math.min(100, Math.max(0, i % 7 === 0 ? 17 + i % 57 : Math.round(85 + Math.sin(i * 19.73) * 7 + Math.sin(i * 7.31) * 6))),
    hour: i % 5 === 0 ? i % 24 : Math.round(12 + Math.sin(i * 7.31) * 3 + Math.sin(i * 19.73) * 2),
    processed: i < 315,
    transport: i < 348,
    finalised: i < 302,
  }));
}