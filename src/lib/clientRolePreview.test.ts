import { describe, expect, it } from "vitest";
import { CLIENT_PREVIEW_ROLES, roleAllows, roleCanVisit, type PortalPermission } from "./rolePreview";

// Independent expectation fixture: verbatim policy rows supplied by the user.
const matrix = `Policy	Client Account Manager	Client Team Manager	Client Developer	Client Claims Advisor	Client Customer Service Advisor
audits/logs/read	✗	✗	✗	✗	✗
audits/read	✓	✓	✓	✗	✗
auth/list	✗	✗	✗	✗	✗
braze/configuration/read	✗	✗	✗	✗	✗
braze/configuration/write	✗	✗	✗	✗	✗
braze/requests/read	✗	✗	✗	✗	✗
braze/requests/replay	✗	✗	✗	✗	✗
feature_subscriptions/read	✓	✗	✓	✗	✗
feature_subscriptions/write	✗	✗	✗	✗	✗
feedback/read	✓	✗	✗	✗	✗
feedback/write	✗	✗	✗	✗	✗
floow_clients/apps/create	✓	✗	✓	✗	✗
floow_clients/apps/delete	✗	✗	✗	✗	✗
floow_clients/apps/read	✓	✗	✓	✗	✗
floow_clients/config/read	✓	✗	✓	✗	✓
floow_clients/config/write	✓	✗	✗	✗	✗
floow_clients/create	✗	✗	✗	✗	✗
floow_clients/delete	✗	✗	✗	✗	✗
floow_clients/list	✗	✗	✗	✗	✗
floow_clients/modes_of_transport/read	✓	✓	✗	✓	✓
floow_clients/read	✓	✓	✓	✓	✓
floow_clients/staff/read	✓	✓	✓	✗	✗
floow_clients/staff/write	✓	✗	✗	✗	✗
impacts/case_status/write	✓	✗	✗	✓	✗
impacts/create	✗	✗	✗	✗	✗
impacts/read	✓	✓	✓	✓	✗
impacts/update	✗	✗	✗	✗	✗
journeys/events/read	✗	✗	✗	✗	✗
journeys/insights/read	✓	✓	✓	✗	✗
journeys/list	✓	✓	✗	✓	✓
journeys/mode_of_transport/write	✓	✓	✗	✓	✓
journeys/read	✓	✓	✗	✓	✓
journeys/revisions/read	✓	✓	✗	✓	✓
journeys/upload	✗	✗	✗	✗	✗
policies/read	✓	✓	✓	✓	✓
policies/write	✗	✗	✗	✗	✗
product_features/read	✓	✗	✓	✗	✗
products/read	✓	✗	✓	✗	✓
products/terms/read	✓	✗	✓	✗	✓
products/terms/write	✓	✗	✗	✗	✗
products/terms_acceptance/read	✓	✗	✓	✗	✓
products/terms_acceptance/write	✗	✗	✗	✗	✗
products/write	✓	✗	✗	✗	✗
reports/delivery/read	✓	✗	✓	✗	✗
reports/delivery/retry	✓	✗	✗	✗	✗
reports/delivery/write	✓	✗	✓	✗	✗
reports/read	✓	✗	✓	✗	✗
reports/write	✓	✗	✗	✗	✗
scores/read	✓	✓	✗	✓	✓
users/files/read	✗	✗	✗	✗	✗
users/files/write	✗	✗	✗	✗	✗
users/personalisation/write	✗	✗	✗	✗	✗
users/read	✓	✓	✓	✓	✓
users/usage_reset/delete	✓	✗	✗	✗	✗
users/usage_reset/read	✓	✗	✓	✗	✓
users/usage_reset/write	✓	✗	✗	✗	✗
users/write	✓	✗	✗	✗	✗
webhooks/read	✓	✗	✓	✗	✗
webhooks/write	✓	✗	✓	✗	✗`;

describe("Client staff role matrix", () => {
  const [header, ...rows] = matrix.split("\n").map((line) => line.split("\t"));
  it("includes all five supplied client roles", () => {
    expect([...CLIENT_PREVIEW_ROLES]).toEqual(header.slice(1));
  });
  for (const [permission, ...grants] of rows) {
    it(permission, () => {
      CLIENT_PREVIEW_ROLES.forEach((role, i) => {
        expect(roleAllows(role, permission as PortalPermission)).toBe(grants[i] === "✓");
      });
    });
  }
  it("no client role can list other clients, read files, or access campaigns", () => {
    for (const role of CLIENT_PREVIEW_ROLES) {
      expect(roleCanVisit(role, "/admin/clients")).toBe(false);
      expect(roleCanVisit(role, "/admin/developer/campaigns/config")).toBe(false);
      expect(roleCanVisit(role, "/admin/insurer/users/mike/files")).toBe(false);
      expect(roleCanVisit(role, "/admin/notifications")).toBe(true);
      expect(roleCanVisit(role, "/admin/insurer/policies/POL-100245")).toBe(true);
    }
  });
  it("developers can create apps and webhooks, but not open journeys", () => {
    expect(roleCanVisit("Client Developer", "/admin/developer/apps/add")).toBe(true);
    expect(roleCanVisit("Client Developer", "/admin/developer/webhooks/subscriptions/add")).toBe(true);
    expect(roleCanVisit("Client Developer", "/admin/insurer/users/mike/journeys/j1")).toBe(false);
  });
  it("account managers alone can create client terms and products", () => {
    for (const role of CLIENT_PREVIEW_ROLES) {
      expect(roleCanVisit(role, "/admin/terms/new")).toBe(role === "Client Account Manager");
      expect(roleCanVisit(role, "/admin/products/add")).toBe(role === "Client Account Manager");
    }
  });
});
