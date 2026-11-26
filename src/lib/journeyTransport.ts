import { Bike, Bus, Car, CircleHelp, CircleMinus, Footprints, PersonStanding, Plane, Ship, TrainFront, TramFront } from "lucide-react";

export const TRANSPORT_OPTIONS = [
  { name: "Car", icon: Car }, { name: "Passenger", icon: PersonStanding },
  { name: "Train", icon: TrainFront }, { name: "Plane", icon: Plane },
  { name: "Tram", icon: TramFront }, { name: "Bus", icon: Bus },
  { name: "Bike", icon: Bike }, { name: "Boat", icon: Ship },
  { name: "Foot", icon: Footprints }, { name: "Other", icon: CircleHelp },
  { name: "Excluded", icon: CircleMinus },
] as const;
export type TransportMode = typeof TRANSPORT_OPTIONS[number]["name"];
export type JourneyTagEdits = Record<string, { mode: TransportMode; tagSetBy: "User" }>;

export function editJourneyTags(current: JourneyTagEdits, ids: string[], mode: TransportMode): JourneyTagEdits {
  const next = { ...current };
  for (const id of ids) next[id] = { mode, tagSetBy: "User" };
  return next;
}