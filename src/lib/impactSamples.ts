// Demo-only records. These never represent or modify customer telemetry.
export const sampleImpacts = [
  { id: "sample-1", date: "2025-10-19T11:05:04", speed: 35, likelihood: 3, archived: false },
  { id: "sample-2", date: "2025-10-13T04:50:28", speed: 41, likelihood: 3, archived: false },
  { id: "sample-3", date: "2025-11-03T21:18:43", speed: 43, likelihood: 3, archived: false },
  { id: "sample-4", date: "2025-11-13T13:01:12", speed: 37, likelihood: 3, archived: false },
  { id: "sample-5", date: "2025-11-19T11:54:18", speed: 40, likelihood: 3, archived: false },
  { id: "sample-6", date: "2025-10-10T09:30:00", speed: 28, likelihood: 2, archived: true },
];
export type SampleImpact = typeof sampleImpacts[number];
export const likelihoodLabels: Record<number, string> = { 1: "Possible", 2: "Likely", 3: "Very Likely" };

export type SampleJourney = { id: string; score: number; offset: number; duration: string; miles: string; start: string; end: string; events: number; impact?: boolean };
export const beforeJourneys: SampleJourney[] = [
  { id: "impact-journey", score: 84, offset: 0, duration: "2m 33s", miles: "0.1", start: "11:04:46 am", end: "11:07:19 am", events: 0, impact: true },
  { id: "before-2", score: 81, offset: 0, duration: "8m 14s", miles: "3.2", start: "07:51:29 am", end: "07:59:44 am", events: 0 },
  { id: "before-3", score: 75, offset: -1, duration: "6m 4s", miles: "3.0", start: "02:31:59 pm", end: "02:38:03 pm", events: 1 },
];
export const afterJourneys: SampleJourney[] = [
  { id: "after-1", score: 87, offset: 1, duration: "7m 7s", miles: "3.3", start: "07:51:22 am", end: "07:58:29 am", events: 0 },
  { id: "after-2", score: 91, offset: 0, duration: "7m 26s", miles: "3.1", start: "04:49:31 pm", end: "04:56:58 pm", events: 0 },
  { id: "after-3", score: 79, offset: 0, duration: "11m 50s", miles: "6.6", start: "03:12:54 pm", end: "03:24:44 pm", events: 6 },
];