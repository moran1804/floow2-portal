import { describe, expect, it } from "vitest";
import { sampleJourneys } from "./userJourneys";
import { compareJourneyRevisions, sampleJourneyRevisions } from "./journeyRevisions";

describe("example journey revisions", () => {
  it("creates newest-first processing and transport revisions for the open journey", () => {
    const revisions = sampleJourneyRevisions(sampleJourneys[0]);
    expect(revisions.map((revision) => revision.modifiedBy)).toEqual([
      "journey.mode_of_transport.determined",
      "journey.preprocessed",
    ]);
    expect(revisions[0].modifiedAt.getTime()).toBeGreaterThan(revisions[1].modifiedAt.getTime());
    expect(revisions[0].data.modeOfTransport).toBe("car_driver");
    expect(revisions[0].data.modeOfTransportSource).toBe("model - mot_v110");
    expect(revisions[0].data.revisionId).toBe(32418602);
    expect(revisions[1].data.revisionId).toBe(32418601);
  });

  it("uses the displayed user tag source in a user-tagged journey revision", () => {
    const revisions = sampleJourneyRevisions(sampleJourneys[1]);
    expect(revisions[0].data.modeOfTransportSource).toBe("user");
  });

  it("highlights changed values while retaining unchanged journey fields", () => {
    const [after, before] = sampleJourneyRevisions(sampleJourneys[0]);
    const rows = compareJourneyRevisions(before, after);
    expect(rows.find((row) => row.key === "modeOfTransport")).toMatchObject({ before: "null", after: '"car_driver"', changed: true });
    expect(rows.find((row) => row.key === "startTime")?.changed).toBe(false);
    expect(rows.find((row) => row.key === "revisionId")).toMatchObject({ before: "32418601", after: "32418602", changed: true });
  });
});
