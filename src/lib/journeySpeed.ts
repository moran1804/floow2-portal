import type { Journey } from "./userJourneys";

/** Illustrative speeds, not GPS measurements. Times follow the example journey's duration. */
export function exampleJourneySpeed(journey: Journey): { time: number; mph: number }[] {
  const duration = /^(\d+)m\s*(\d+)s$/.exec(journey.duration);
  if (!duration) return [];
  const seconds = Number(duration[1]) * 60 + Number(duration[2]);
  const start = new Date(journey.startedAt).getTime();
  const seed = Array.from(journey.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const peak = journey.mode === "Bike" ? 14 : 40 + seed % 13;
  return Array.from({ length: 181 }, (_, i) => {
    const progress = i / 180;
    const pulse = Math.max(0, Math.sin(progress * Math.PI * (5 + seed % 3) - 0.2));
    const jitter = 0.88 + 0.12 * Math.sin(i * 1.9 + seed);
    const mph = i === 0 || i === 180 ? 0 : Math.round(peak * pulse * jitter * 10) / 10;
    return { time: start + Math.round(progress * seconds) * 1000, mph };
  });
}