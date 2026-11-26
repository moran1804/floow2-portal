import { describe, expect, it } from "vitest";
import {
  defaultJourneyFilters,
  filterJourneys,
  formatDateRange,
  isDefaultFilters,
  sampleJourneys,
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

  it("filters tags set by User", () => {
    expect(ids({ ...defaultJourneyFilters, tagSetBy: "User" })).toEqual(["j2", "j4", "j9", "j10"]);
  });

  it("filters tags set by System", () => {
    expect(ids({ ...defaultJourneyFilters, tagSetBy: "System" })).toEqual(["j1", "j3", "j5", "j6", "j7", "j8", "j11", "j12"]);
  });

  it("combines tag source with the other filters", () => {
    expect(ids({ ...defaultJourneyFilters, tagSetBy: "User", mode: "Car" })).toEqual(["j2", "j9"]);
  });

  it("resets the tag source to include User and System", () => {
    expect(isDefaultFilters({ ...defaultJourneyFilters, tagSetBy: "User" })).toBe(false);
    expect(defaultJourneyFilters.tagSetBy).toBe("any");
    expect(filterJourneys(sampleJourneys, defaultJourneyFilters)).toHaveLength(12);
  });

  it("filters by mode of transport", () => {
    expect(ids({ ...defaultJourneyFilters, mode: "Bike" })).toEqual(["j4", "j10"]);
  });

  it("keeps journeys with driving events", () => {
    expect(ids({ ...defaultJourneyFilters, events: "with" })).toEqual(["j1", "j2", "j3", "j5", "j6", "j7", "j8", "j9", "j11", "j12"]);
  });

  it("includes both ends of the selected date range", () => {
    expect(ids({ ...defaultJourneyFilters, from: "2026-11-01", to: "2026-11-03" })).toEqual(["j1", "j2", "j3", "j4", "j5", "j6"]);
    expect(ids({ ...defaultJourneyFilters, from: "2026-10-19", to: "2026-10-28" })).toEqual(["j7", "j8", "j9"]);
  });

  it("shows one day when the range starts and ends the same day", () => {
    expect(ids({ ...defaultJourneyFilters, from: "2026-11-03", to: "2026-11-03" })).toEqual(["j1", "j2", "j3", "j4"]);
  });

  it("leaves the window open when only one end is set", () => {
    expect(ids({ ...defaultJourneyFilters, from: "2026-11-01" })).toEqual(["j1", "j2", "j3", "j4", "j5", "j6"]);
    expect(ids({ ...defaultJourneyFilters, to: "2026-10-28" })).toEqual(["j7", "j8", "j9", "j10", "j11", "j12"]);
  });

  it("sorts by score, highest first", () => {
    expect(ids({ ...defaultJourneyFilters, sort: "highest" }).slice(0, 3)).toEqual(["j7", "j5", "j12"]);
  });

  it("labels the date-range filter", () => {
    expect(formatDateRange("", "")).toBe("All dates");
    expect(formatDateRange("2026-09-03", "2026-11-25")).toBe("3 Sep 2026 – 25 Nov 2026");
    expect(formatDateRange("2026-11-03", "2026-11-03")).toBe("3 Nov 2026");
    expect(formatDateRange("2026-11-01", "")).toBe("From 1 Nov 2026");
    expect(formatDateRange("", "2026-11-25")).toBe("Until 25 Nov 2026");
  });
});
