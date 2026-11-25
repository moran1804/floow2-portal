export type SpeedUnit = "mph" | "kph";
export const KM_PER_MILE = 1.609344;
export const unitsKey = (customerId: string) => `portal.units.${customerId}`;
export function readUnits(customerId: string | null): SpeedUnit {
  if (!customerId) return "mph";
  return localStorage.getItem(unitsKey(customerId)) === "kph" ? "kph" : "mph";
}
/** Convert a speed stored in mph to the chosen unit, rounded. */
export const convertSpeed = (mph: number, unit: SpeedUnit) => Math.round(unit === "kph" ? mph * KM_PER_MILE : mph);
export const formatSpeed = (mph: number, unit: SpeedUnit) => `${convertSpeed(mph, unit)} ${unit === "kph" ? "km/h" : "mph"}`;
/** Format a distance stored in miles (number or text like "1.14 miles"). */
export function formatDistance(miles: number | string, unit: SpeedUnit, decimals = 2) {
  const n = typeof miles === "number" ? miles : parseFloat(miles);
  if (Number.isNaN(n)) return String(miles);
  if (unit === "kph") return `${(n * KM_PER_MILE).toFixed(decimals)} km`;
  return `${n.toFixed(decimals)} ${n === 1 ? "mile" : "miles"}`;
}
