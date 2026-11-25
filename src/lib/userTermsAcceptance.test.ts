import { describe, expect, it } from "vitest";
import { formatAcceptedAt, scopeAcceptanceRows } from "./userTermsAcceptance";

const row = (id: string, customer: string, version: string, code: string) => ({
  id,
  accepted_at: "2026-10-05T19:00:00.000Z",
  terms_versions: { version, customer_id: customer, products: { code } },
});

describe("terms acceptance history per client", () => {
  const rows = [
    row("a", "client-a", "V3", "PRD01"),
    row("b", "client-b", "v9.9", "OTHER"),
    row("c", "client-a", "v1.2", "PRD01"),
  ];

  it("shows only the acceptances whose T&Cs belong to the selected client", () => {
    const scoped = scopeAcceptanceRows(rows, "client-a");
    expect(scoped.map((r) => r.version)).toEqual(["V3", "v1.2"]);
    expect(scoped.map((r) => r.id)).toEqual(["a", "c"]);
    expect(scoped.every((r) => r.product_code === "PRD01")).toBe(true);
  });

  it("shows nothing when no client is selected", () => {
    expect(scopeAcceptanceRows(rows, null)).toEqual([]);
  });

  it("shows nothing for a client with no acceptances", () => {
    expect(scopeAcceptanceRows(rows, "client-c")).toEqual([]);
  });

  it("formats an accepted time like the reference portal", () => {
    const local = new Date(2026, 9, 5, 20, 0, 0).toISOString();
    expect(formatAcceptedAt(local)).toBe("5 Oct 2026 - 8.00pm");
    const morning = new Date(2026, 6, 20, 12, 51, 0).toISOString();
    expect(formatAcceptedAt(morning)).toBe("20 Jul 2026 - 12.51pm");
  });
});
