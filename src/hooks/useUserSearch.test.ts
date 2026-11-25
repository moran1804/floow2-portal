import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUserSearch } from "./useUserSearch";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));

describe("search as you type", () => {
  beforeEach(() => { vi.useFakeTimers(); rpc.mockReset(); rpc.mockResolvedValue({ data: [], error: null }); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("automatically searches partial input after a short pause and combines rapid keystrokes", async () => {
    const { rerender } = renderHook(({ query }) => useUserSearch("client-a", query, "smart", "email"), { initialProps: { query: "mi" } });
    await act(async () => { vi.advanceTimersByTime(200); });
    expect(rpc).not.toHaveBeenCalled();
    rerender({ query: "mike.m" });
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("search_insurer_users", { _customer_id: "client-a", _query: "mike.m", _mode: "smart", _field: "email" });
  });

  it("keeps exact match manual", async () => {
    const { result } = renderHook(() => useUserSearch("client-a", "mike.moran@thefloow.com", "exact", "email"));
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(rpc).not.toHaveBeenCalled();
    await act(async () => { await result.current.submit(); });
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("clears matches and ignores pending responses when input is cleared", async () => {
    let resolve: (response: unknown) => void = () => {};
    rpc.mockReturnValue(new Promise((done) => { resolve = done; }));
    const { result, rerender } = renderHook(({ query }) => useUserSearch("client-a", query, "smart", "email"), { initialProps: { query: "mike" } });
    await act(async () => { vi.advanceTimersByTime(300); });
    rerender({ query: "" });
    await act(async () => { resolve({ data: [{ id: "old" }], error: null }); });
    expect(result.current.results).toEqual([]);
    expect(result.current.submitted).toBe(false);
    expect(result.current.searching).toBe(false);
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("ignores slower superseded responses when the query or client changes", async () => {
    let resolveOld: (response: unknown) => void = () => {};
    rpc.mockReturnValueOnce(new Promise((done) => { resolveOld = done; }));
    rpc.mockResolvedValueOnce({ data: [{ id: "new" }], error: null });
    const { result, rerender } = renderHook(({ client, query }) => useUserSearch(client, query, "smart", "email"), { initialProps: { client: "client-a", query: "mi" } });
    await act(async () => { vi.advanceTimersByTime(300); });
    rerender({ client: "client-b", query: "moran" });
    await act(async () => { vi.advanceTimersByTime(300); });
    await act(async () => { resolveOld({ data: [{ id: "old" }], error: null }); });
    expect(result.current.results).toEqual([{ id: "new" }]);
    expect(rpc.mock.calls[1][1]._customer_id).toBe("client-b");
  });
});