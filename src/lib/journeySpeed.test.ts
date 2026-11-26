import { describe, expect, it } from "vitest";
import { exampleJourneySpeed } from "./journeySpeed";
import { sampleJourneys } from "./userJourneys";

describe("example journey speed graphs", () => {
  it("provides a speed series for every example journey within its own time window", () => {
    for (const journey of sampleJourneys) {
      const points = exampleJourneySpeed(journey);
      const duration = /^(\d+)m\s*(\d+)s$/.exec(journey.duration);
      expect(duration).not.toBeNull();
      if (!duration) continue;
      const start = new Date(journey.startedAt).getTime();
      const end = start + (Number(duration[1]) * 60 + Number(duration[2])) * 1000;
      expect(points).toHaveLength(181);
      expect(points[0]).toEqual({ time: start, mph: 0 });
      expect(points[180]).toEqual({ time: end, mph: 0 });
      expect(points.every((point, i) => point.mph >= 0 && point.time >= start && point.time <= end && (i === 0 || point.time >= points[i - 1].time))).toBe(true);
      expect(points.some((point) => point.mph > 0)).toBe(true);
    }
  });
  it("keeps each journey profile stable and distinct", () => {
    expect(exampleJourneySpeed(sampleJourneys[0])).toEqual(exampleJourneySpeed(sampleJourneys[0]));
    expect(exampleJourneySpeed(sampleJourneys[0]).map((p) => p.mph)).not.toEqual(exampleJourneySpeed(sampleJourneys[1]).map((p) => p.mph));
  });
});