import { describe, expect, it } from "vitest";
import { editJourneyTags, type JourneyTagEdits } from "./journeyTransport";

describe("bulk journey transport tags", () => {
  it("changes only selected journeys to the chosen transport tag", () => {
    const current: JourneyTagEdits = { j3: { mode: "Bike", tagSetBy: "User" } };
    expect(editJourneyTags(current, ["j1", "j2"], "Train")).toEqual({
      j1: { mode: "Train", tagSetBy: "User" }, j2: { mode: "Train", tagSetBy: "User" },
      j3: { mode: "Bike", tagSetBy: "User" },
    });
    expect(current).toEqual({ j3: { mode: "Bike", tagSetBy: "User" } });
  });
  it("does not change any tags without a selection", () => {
    expect(editJourneyTags({}, [], "Excluded")).toEqual({});
  });
});