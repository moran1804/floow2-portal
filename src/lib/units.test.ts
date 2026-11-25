import { describe, it, expect } from "vitest";
import { formatSpeed, formatDistance } from "./units";
describe("units", () => {
  it("converts 30 mph to 48 km/h", () => expect(formatSpeed(30, "kph")).toBe("48 km/h"));
  it("keeps mph unchanged", () => expect(formatSpeed(30, "mph")).toBe("30 mph"));
  it("converts 1.14 miles to km", () => expect(formatDistance("1.14 miles", "kph")).toBe("1.83 km"));
});
