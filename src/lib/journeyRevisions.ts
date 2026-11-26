import type { Journey } from "./userJourneys";

export type JourneyRevisionData = {
  startTime: number;
  timezone: string;
  productCode: string;
  modeOfTransport: string | null;
  modeOfTransportSource: string | null;
  modeOfTransportCanAmendUntil: string | null;
  lastModifiedBy: string;
  lastModifiedDate: string;
  revisionId: number;
};

export type JourneyRevision = {
  id: string;
  modifiedBy: string;
  modifiedAt: Date;
  data: JourneyRevisionData;
};

export type RevisionComparisonRow = {
  key: keyof JourneyRevisionData;
  before: string;
  after: string;
  changed: boolean;
};

const transportValues: Record<Journey["mode"], string> = {
  Car: "car_driver",
  Passenger: "car_passenger",
  Train: "train",
  Plane: "plane",
  Tram: "tram",
  Bus: "bus",
  Bike: "bicycle",
  Boat: "boat",
  Foot: "walking",
  Other: "other",
  Excluded: "excluded",
};

/** Presentation-only revisions derived from the selected example journey. */
export function sampleJourneyRevisions(journey: Journey): JourneyRevision[] {
  const startedAt = new Date(journey.startedAt).getTime();
  const journeyNumber = Number(journey.id.replace(/\D/g, "")) || 0;
  const firstRevisionId = 32418600 + journeyNumber * 2 - 1;
  const preprocessedAt = new Date(startedAt + 10 * 60 * 1000 + 10 * 1000);
  const determinedAt = new Date(startedAt + 10 * 60 * 1000 + 12 * 1000);
  const shared = {
    startTime: startedAt,
    timezone: "Europe/London",
    productCode: "PRD01",
  };

  return [
    {
      id: `${journey.id}-mode-of-transport-determined`,
      modifiedBy: "journey.mode_of_transport.determined",
      modifiedAt: determinedAt,
      data: {
        ...shared,
        modeOfTransport: transportValues[journey.mode],
        modeOfTransportSource: journey.tagSetBy === "User" ? "user" : "model - mot_v110",
        modeOfTransportCanAmendUntil: new Date(startedAt + 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000 + 12 * 1000).toISOString(),
        lastModifiedBy: "journey.mode_of_transport.determined",
        lastModifiedDate: determinedAt.toISOString(),
        revisionId: firstRevisionId + 1,
      },
    },
    {
      id: `${journey.id}-preprocessed`,
      modifiedBy: "journey.preprocessed",
      modifiedAt: preprocessedAt,
      data: {
        ...shared,
        modeOfTransport: null,
        modeOfTransportSource: null,
        modeOfTransportCanAmendUntil: null,
        lastModifiedBy: "journey.preprocessed",
        lastModifiedDate: preprocessedAt.toISOString(),
        revisionId: firstRevisionId,
      },
    },
  ];
}

const displayValue = (value: string | number | null) => value === null ? "null" : typeof value === "string" ? `"${value}"` : String(value);

export function compareJourneyRevisions(before: JourneyRevision, after: JourneyRevision): RevisionComparisonRow[] {
  return (Object.keys(before.data) as (keyof JourneyRevisionData)[]).map((key) => ({
    key,
    before: displayValue(before.data[key]),
    after: displayValue(after.data[key]),
    changed: before.data[key] !== after.data[key],
  }));
}
