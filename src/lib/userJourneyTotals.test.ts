import { describe, expect, it } from "vitest";
import { formatDrivingTime, journeyTotals, sampleJourneys } from "./userJourneys";

describe("journeyTotals", () => {
  it("counts only scored journeys", () => {
    expect(journeyTotals(sampleJourneys).scoredJourneys).toBe(10);
  });
  it("sums driving distance from car journeys only", () => {
    expect(journeyTotals(sampleJourneys).drivingMiles).toBe(33.36);
  });
  it("sums driving time from car journeys only", () => {
    expect(formatDrivingTime(journeyTotals(sampleJourneys).drivingSeconds)).toBe("2h 5m");
  });
});
