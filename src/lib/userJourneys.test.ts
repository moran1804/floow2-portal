import { describe, expect, it } from "vitest";
import {
  defaultJourneyFilters,
  filterJourneys,
  journeyWindowLabel,
  sampleJourneys,
  shiftDate,
} from "./userJourneys";

const ids = (f: Parameters<typeof filterJourneys>[1]) => filterJourneys(sampleJourneys, f).map((j) => j.id);

describe("journey filters", () => {
  it("shows every example journey by default, newest first", () => {
    expect(ids(defaultJourneyFilters)).toEqual(["j1", "j2", "j3", "j4", "j5", "j6", "j7", "j8", "j9", "j10", "j11", "j12"]);
  });

  it("keeps only journeys scoring 85 or above", () => {
    expect(ids({ ...defaultJourneyFilters, score: "good" })).toEqual(["j5", "j7"]);
  });

  it("keeps only unscored journeys", () => {
    expect(ids({ ...defaultJourneyFilters, score: "none" })).toEqual(["j4", "j10"]);
  });

  it("matches the exact tag, not a longer one containing it", () => {
    expect(ids({ ...defaultJourneyFilters, tags: ["Phone use"] })).toEqual(["j1", "j2", "j6", "j9"]);
  });

  it("keeps journeys carrying any of the selected tags", () => {
    expect(ids({ ...defaultJourneyFilters, tags: ["Phone use", "Speeding"] })).toEqual(["j1", "j2", "j6", "j8", "j9", "j11"]);
  });

  it("filters by mode of transport", () => {
    expect(ids({ ...defaultJourneyFilters, mode: "Bike" })).toEqual(["j4", "j10"]);
  });

  it("keeps journeys with driving events", () => {
    expect(ids({ ...defaultJourneyFilters, events: "with" })).toEqual(["j1", "j2", "j3", "j5", "j6", "j7", "j8", "j9", "j11", "j12"]);
  });

  it("applies the date window", () => {
    expect(ids({ ...defaultJourneyFilters, from: "2026-11-01T00:00" })).toEqual(["j1", "j2", "j3", "j4", "j5", "j6"]);
    expect(ids({ ...defaultJourneyFilters, to: "2026-10-28T23:59" })).toEqual(["j7", "j8", "j9", "j10", "j11", "j12"]);
  });

  it("sorts by score, highest first", () => {
    expect(ids({ ...defaultJourneyFilters, sort: "highest" }).slice(0, 3)).toEqual(["j7", "j5", "j12"]);
  });

  it("moves the date window by whole days", () => {
    expect(shiftDate("2026-11-03T20:00", -7)).toBe("2026-10-27T20:00");
    expect(shiftDate("2026-11-01T00:00", 7)).toBe("2026-11-08T00:00");
  });

  it("describes the window being shown", () => {
    expect(journeyWindowLabel(3, { ...defaultJourneyFilters, to: "2026-11-03T20:00" })).toContain("Showing 3 journeys started before");
    expect(journeyWindowLabel(1, { ...defaultJourneyFilters, to: "2026-11-03T20:00", from: "2026-11-01T00:00" })).toContain("between");
    expect(journeyWindowLabel(2, { ...defaultJourneyFilters, to: "" })).toBe("Showing 2 journeys");
  });
});
