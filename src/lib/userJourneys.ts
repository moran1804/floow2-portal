import { format } from "date-fns";
import { TRANSPORT_OPTIONS, type TransportMode } from "./journeyTransport";

export type Journey = {
  id: string;
  /** Local date-time, e.g. "2026-11-03T20:00". */
  startedAt: string;
  score: number | null;
  duration: string;
  miles: string;
  mode: TransportMode;
  start: string;
  end: string;
  events: number | null;
  tagSetBy: "User" | "System";
  tags: string[];
  route: [number, number][];
};

const brighouseA: [number, number][] = [[53.7065, -1.7835], [53.7052, -1.7848], [53.7038, -1.7862], [53.7010, -1.7866], [53.6985, -1.7864], [53.6972, -1.7852], [53.6978, -1.7838]];
const brighouseB: [number, number][] = [[53.6960, -1.7866], [53.6985, -1.7860], [53.7010, -1.7855], [53.7030, -1.7870], [53.7048, -1.7852], [53.7072, -1.7845]];
const brighouseC: [number, number][] = [[53.7102, -1.7901], [53.7088, -1.7885], [53.7070, -1.7872], [53.7052, -1.7866], [53.7036, -1.7878], [53.7022, -1.7892]];

/** Example journeys only — no live journey feed is connected for this user. */
export const sampleJourneys: Journey[] = [
  { id: "j1", tagSetBy: "System", startedAt: "2026-11-03T20:00", score: 75, duration: "5m 34s", miles: "1.14 miles", mode: "Car", start: "8:00 pm", end: "8:05 pm", events: 16, tags: ["Phone use", "Hard braking"], route: brighouseA },
  { id: "j2", tagSetBy: "User", startedAt: "2026-11-03T19:35", score: 77, duration: "5m 17s", miles: "1.15 miles", mode: "Car", start: "7:35 pm", end: "7:41 pm", events: 9, tags: ["Phone use"], route: brighouseB },
  { id: "j3", tagSetBy: "System", startedAt: "2026-11-03T17:38", score: 79, duration: "7m 42s", miles: "1.18 miles", mode: "Car", start: "5:38 pm", end: "5:46 pm", events: 11, tags: ["Harsh cornering"], route: brighouseA },
  { id: "j4", tagSetBy: "User", startedAt: "2026-11-03T17:25", score: null, duration: "9m 40s", miles: "0.91 miles", mode: "Bike", start: "5:25 pm", end: "5:34 pm", events: null, tags: ["Bike ride"], route: brighouseB },
  { id: "j5", tagSetBy: "System", startedAt: "2026-11-02T08:12", score: 88, duration: "12m 05s", miles: "3.42 miles", mode: "Car", start: "8:12 am", end: "8:24 am", events: 6, tags: ["Rapid acceleration"], route: brighouseC },
  { id: "j6", tagSetBy: "System", startedAt: "2026-11-01T22:40", score: 61, duration: "18m 22s", miles: "5.87 miles", mode: "Car", start: "10:40 pm", end: "10:58 pm", events: 23, tags: ["Night drive", "Hard braking", "Phone use"], route: brighouseA },
  { id: "j7", tagSetBy: "System", startedAt: "2026-10-28T07:55", score: 92, duration: "9m 12s", miles: "2.31 miles", mode: "Car", start: "7:55 am", end: "8:04 am", events: 3, tags: [], route: brighouseB },
  { id: "j8", tagSetBy: "System", startedAt: "2026-10-24T13:20", score: 54, duration: "24m 47s", miles: "6.95 miles", mode: "Car", start: "1:20 pm", end: "1:45 pm", events: 31, tags: ["Speeding", "Harsh cornering", "Rapid acceleration"], route: brighouseC },
  { id: "j9", tagSetBy: "User", startedAt: "2026-10-19T18:05", score: 71, duration: "6m 58s", miles: "1.62 miles", mode: "Car", start: "6:05 pm", end: "6:12 pm", events: 12, tags: ["Phone use", "Night drive"], route: brighouseA },
  { id: "j10", tagSetBy: "User", startedAt: "2026-10-12T09:30", score: null, duration: "15m 30s", miles: "2.88 miles", mode: "Bike", start: "9:30 am", end: "9:45 am", events: null, tags: ["Bike ride"], route: brighouseB },
  { id: "j11", tagSetBy: "System", startedAt: "2026-09-30T21:15", score: 45, duration: "31m 08s", miles: "8.74 miles", mode: "Car", start: "9:15 pm", end: "9:46 pm", events: 42, tags: ["Speeding", "Hard braking", "Handheld phone use", "Night drive"], route: brighouseC },
  { id: "j12", tagSetBy: "System", startedAt: "2026-09-21T12:45", score: 83, duration: "4m 26s", miles: "0.98 miles", mode: "Car", start: "12:45 pm", end: "12:49 pm", events: 7, tags: ["Handheld phone use"], route: brighouseA },
];

export const journeyInfluences: Record<string, [string, number][]> = {
  j1: [["Mobile use", 92], ["Smooth driving", 54], ["Speed", 93], ["Time of day", 95], ["Time on task", 98]],
  j2: [["Mobile use", 88], ["Smooth driving", 63], ["Speed", 90], ["Time of day", 95], ["Time on task", 97]],
  j3: [["Mobile use", 85], ["Smooth driving", 72], ["Speed", 88], ["Time of day", 94], ["Time on task", 96]],
  j5: [["Mobile use", 96], ["Smooth driving", 81], ["Speed", 87], ["Time of day", 93], ["Time on task", 90]],
  j6: [["Mobile use", 48], ["Smooth driving", 57], ["Speed", 74], ["Time of day", 62], ["Time on task", 68]],
  j7: [["Mobile use", 98], ["Smooth driving", 94], ["Speed", 91], ["Time of day", 97], ["Time on task", 95]],
  j8: [["Mobile use", 77], ["Smooth driving", 38], ["Speed", 41], ["Time of day", 86], ["Time on task", 52]],
  j9: [["Mobile use", 55], ["Smooth driving", 79], ["Speed", 82], ["Time of day", 70], ["Time on task", 88]],
  j11: [["Mobile use", 31], ["Smooth driving", 42], ["Speed", 36], ["Time of day", 44], ["Time on task", 58]],
  j12: [["Mobile use", 62], ["Smooth driving", 90], ["Speed", 89], ["Time of day", 92], ["Time on task", 94]],
};

export const JOURNEY_TAGS: string[] = Array.from(new Set(sampleJourneys.flatMap((j) => j.tags))).sort((a, b) => a.localeCompare(b));

export const SCORE_BANDS: Record<string, string> = {
  any: "Any score",
  good: "85 and above",
  fair: "70 – 84",
  poor: "60 – 69",
  bad: "Below 60",
  none: "Not scored",
};

export const MODES: Record<string, string> = { any: "Any mode", ...Object.fromEntries(TRANSPORT_OPTIONS.map(({ name }) => [name, name])) };

export const EVENT_STATES: Record<string, string> = { any: "Any", with: "With driving events", without: "Without driving events" };

export const TAG_SOURCES: Record<string, string> = { any: "User or System", User: "User", System: "System" };

export const SORTS: Record<string, string> = { newest: "Newest first", oldest: "Oldest first", highest: "Highest score first", lowest: "Lowest score first" };

/** from / to are inclusive day bounds in "yyyy-MM-dd" form; empty means unbounded. */
export type JourneyFilters = { from: string; to: string; score: string; mode: string; events: string; tagSetBy: string; tags: string[]; sort: string };

export const defaultJourneyFilters: JourneyFilters = { from: "", to: "", score: "any", mode: "any", events: "any", tagSetBy: "any", tags: [], sort: "newest" };

export const isDefaultFilters = (f: JourneyFilters) =>
  !f.from && !f.to && f.score === "any" && f.mode === "any" && f.events === "any" && f.tagSetBy === "any" && f.tags.length === 0 && f.sort === "newest";

export function scoreMatches(score: number | null, band: string): boolean {
  if (band === "any") return true;
  if (band === "none") return score === null;
  if (score === null) return false;
  if (band === "good") return score >= 85;
  if (band === "fair") return score >= 70 && score < 85;
  if (band === "poor") return score >= 60 && score < 70;
  if (band === "bad") return score < 60;
  return true;
}

/** Journeys matching every filter. Selected tags match any one of them. */
export function filterJourneys(journeys: Journey[], f: JourneyFilters): Journey[] {
  const from = f.from ? new Date(`${f.from}T00:00:00`).getTime() : null;
  const to = f.to ? new Date(`${f.to}T23:59:59`).getTime() : null;
  const rows = journeys.filter((j) => {
    const t = new Date(j.startedAt).getTime();
    if (from !== null && t < from) return false;
    if (to !== null && t > to) return false;
    if (f.mode !== "any" && j.mode !== f.mode) return false;
    if (f.events === "with" && !(j.events && j.events > 0)) return false;
    if (f.events === "without" && j.events && j.events > 0) return false;
    if (f.tagSetBy !== "any" && j.tagSetBy !== f.tagSetBy) return false;
    if (f.tags.length && !f.tags.some((tag) => j.tags.includes(tag))) return false;
    return scoreMatches(j.score, f.score);
  });
  const byDate = (a: Journey, b: Journey) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
  const byScore = (a: Journey, b: Journey) => (b.score ?? -1) - (a.score ?? -1);
  if (f.sort === "oldest") return [...rows].sort((a, b) => -byDate(a, b));
  if (f.sort === "highest") return [...rows].sort(byScore);
  if (f.sort === "lowest") return [...rows].sort((a, b) => -byScore(a, b));
  return [...rows].sort(byDate);
}

/** "yyyy-MM-dd" for a calendar selection. */
export const dayString = (d: Date) => format(d, "yyyy-MM-dd");

const dayLabel = (iso: string) => format(new Date(`${iso}T00:00:00`), "d MMM yyyy");

/** Text shown on the date-range filter, e.g. "3 Sep 2026 – 25 Nov 2026". */
export function formatDateRange(from: string, to: string): string {
  if (!from && !to) return "All dates";
  if (from && to) return from === to ? dayLabel(from) : `${dayLabel(from)} – ${dayLabel(to)}`;
  if (from) return `From ${dayLabel(from)}`;
  return `Until ${dayLabel(to)}`;
}

export const journeyFullDateLabel = (startedAt: string) => format(new Date(startedAt), "EEEE do MMMM yyyy");

const durationSeconds = (d: string) => {
  const h = /(\d+)h/.exec(d), m = /(\d+)m/.exec(d), s = /(\d+)s/.exec(d);
  return (h ? +h[1] * 3600 : 0) + (m ? +m[1] * 60 : 0) + (s ? +s[1] : 0);
};

/** Totals across example journeys: scored count, plus time and miles for car journeys only. */
export function journeyTotals(journeys: Journey[]) {
  const driving = journeys.filter((j) => j.mode === "Car");
  const seconds = driving.reduce((t, j) => t + durationSeconds(j.duration), 0);
  const miles = driving.reduce((t, j) => t + parseFloat(j.miles), 0);
  return { scoredJourneys: journeys.filter((j) => j.score !== null).length, drivingSeconds: seconds, drivingMiles: Math.round(miles * 100) / 100 };
}

export const formatDrivingTime = (seconds: number) => `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
