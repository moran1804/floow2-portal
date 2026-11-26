import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RolePreviewProvider, useRolePreview } from "./RolePreviewContext";

const auth = vi.hoisted(() => ({ user: { id: "staff-user" }, isAdmin: true, isFloowStaff: true }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => auth }));

function Controls() {
  const { role, canPreview, setRole, canVisit } = useRolePreview();
  return <>
    <output data-testid="role">{role ?? "account"}</output>
    <output data-testid="preview">{String(canPreview)}</output>
    <output data-testid="products">{String(canVisit("/admin/products"))}</output>
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
  it("only database-verified staff administrators can switch preview views", () => {
    auth.isAdmin = false;
    render(<RolePreviewProvider><Controls /></RolePreviewProvider>);
    fireEvent.click(screen.getByText("Finance"));
    expect(screen.getByTestId("preview").textContent).toBe("false");
    expect(screen.getByTestId("role").textContent).toBe("account");
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

  it("a saved preview selection never transfers to a different signed-in account", () => {
    sessionStorage.setItem("portal-role-preview", JSON.stringify({ userId: "another-user", role: "Floow Finance" }));
    render(<RolePreviewProvider><Controls /></RolePreviewProvider>);
    expect(screen.getByTestId("role").textContent).toBe("account");
    expect(screen.getByTestId("products").textContent).toBe("true");
  });
});