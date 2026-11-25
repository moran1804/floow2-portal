import { beforeEach, describe, expect, it } from "vitest";
import { readSearchMatching, searchInputType, searchMatchingKey } from "./useSearchMatching";

describe("search matching", () => {
  beforeEach(() => localStorage.clear());
  it("retains the selected client's non-exact search mode", () => {
    localStorage.setItem(searchMatchingKey("client-a"), "smart");
    expect(readSearchMatching("client-a")).toBe("smart");
    expect(readSearchMatching("client-b")).toBe("exact");
  });
  it("allows partial email and date queries in non-exact mode", () => {
    expect(searchInputType("smart", "email")).toBe("text");
    expect(searchInputType("smart", "date")).toBe("text");
    expect(searchInputType("exact", "email")).toBe("email");
  });
});