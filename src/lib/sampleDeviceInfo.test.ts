import { describe, it, expect } from "vitest";
import { isCompatible } from "./sampleDeviceInfo";
describe("phone compatibility", () => {
  it("flags iOS 14 as not compatible", () => expect(isCompatible("iOS 14.8")).toBe(false));
  it("accepts Android 13", () => expect(isCompatible("Android 13")).toBe(true));
});
