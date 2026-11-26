import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RolePreviewProvider, useRolePreview } from "./RolePreviewContext";
import { RolePreviewContext } from "./rolePreviewContextValue";

const auth = vi.hoisted(() => ({ user: { id: "staff-user" }, isAdmin: true, isFloowStaff: true }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => auth }));

function Controls() {
  const { role, canPreview, setRole, canVisit } = useRolePreview();
  return <>
    <output data-testid="role">{role ?? "none"}</output>
    <output data-testid="preview">{String(canPreview)}</output>
    <output data-testid="products">{String(canVisit("/admin/products"))}</output>
    <output data-testid="terms">{String(canVisit("/admin/terms"))}</output>
    <button onClick={() => setRole("Floow Finance")}>Finance</button>
  </>;
}

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  auth.user = { id: "staff-user" };
  auth.isAdmin = true;
  auth.isFloowStaff = true;
});

describe("safe role previews", () => {
  it("keeps mounted providers connected to consumers after the role module refreshes", async () => {
    // Model HMR: the provider/hook module reloads, its unchanged dependency does not.
    vi.resetModules();
    vi.doMock("./rolePreviewContextValue", () => ({ RolePreviewContext }));
    try {
      const refreshed = await import("./RolePreviewContext");
      function RefreshedControls() {
        const { role, setRole, canVisit } = refreshed.useRolePreview();
        return <>
          <output data-testid="refreshed-role">{role ?? "none"}</output>
          <output data-testid="refreshed-products">{String(canVisit("/admin/products"))}</output>
          <button onClick={() => setRole("Floow Finance")}>Refreshed finance</button>
        </>;
      }
      render(<RolePreviewProvider><RefreshedControls /></RolePreviewProvider>);
      expect(screen.getByTestId("refreshed-role").textContent).toBe("Floow Admin");
      fireEvent.click(screen.getByText("Refreshed finance"));
      expect(screen.getByTestId("refreshed-role").textContent).toBe("Floow Finance");
      expect(screen.getByTestId("refreshed-products").textContent).toBe("false");
    } finally {
      vi.doUnmock("./rolePreviewContextValue");
    }
  });

  it("staff administrators open on the Floow Admin view without choosing a role", () => {
    render(<RolePreviewProvider><Controls /></RolePreviewProvider>);
    expect(screen.getByTestId("role").textContent).toBe("Floow Admin");
    expect(screen.getByTestId("products").textContent).toBe("true");
    expect(screen.getByTestId("terms").textContent).toBe("false");
  });

  it("only database-verified staff administrators can switch preview views", () => {
    auth.isAdmin = false;
    render(<RolePreviewProvider><Controls /></RolePreviewProvider>);
    fireEvent.click(screen.getByText("Finance"));
    expect(screen.getByTestId("preview").textContent).toBe("false");
    expect(screen.getByTestId("role").textContent).toBe("none");
  });

  it("switching presentation never changes the authenticated account grants", () => {
    render(<RolePreviewProvider><Controls /></RolePreviewProvider>);
    fireEvent.click(screen.getByText("Finance"));
    expect(screen.getByTestId("role").textContent).toBe("Floow Finance");
    expect(screen.getByTestId("products").textContent).toBe("false");
    expect(auth.user.id).toBe("staff-user");
    expect(auth.isAdmin).toBe(true);
    expect(auth.isFloowStaff).toBe(true);
  });

  it("a saved preview selection is restored for the same signed-in account", () => {
    sessionStorage.setItem("portal-role-preview", JSON.stringify({ userId: "staff-user", role: "Floow Finance" }));
    render(<RolePreviewProvider><Controls /></RolePreviewProvider>);
    expect(screen.getByTestId("role").textContent).toBe("Floow Finance");
  });

  it("a saved preview selection never transfers to a different signed-in account", () => {
    sessionStorage.setItem("portal-role-preview", JSON.stringify({ userId: "another-user", role: "Floow Finance" }));
    render(<RolePreviewProvider><Controls /></RolePreviewProvider>);
    expect(screen.getByTestId("role").textContent).toBe("Floow Admin");
    expect(screen.getByTestId("products").textContent).toBe("true");
  });
});
