import { describe, it, expect } from "vitest";
import { averageScores } from "./sampleScores";
describe("policy score", () => {
  it("averages driver influences", () => {
    const a = { overall: 0, influences: [80, 80, 80, 80, 80].map((score) => ({ name: "x", score })) };
    const b = { overall: 0, influences: [60, 60, 60, 60, 60].map((score) => ({ name: "x", score })) };
    expect(averageScores([a, b])?.overall).toBe(70);
  });
});
