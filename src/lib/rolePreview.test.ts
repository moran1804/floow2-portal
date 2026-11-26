import { describe, it, expect } from "vitest";
import { PREVIEW_ROLES, ROLE_PERMISSIONS, roleAllows, roleCanVisit, type PortalPermission } from "./rolePreview";
// Expected permissions transcribed from the user-supplied role matrix, independent of implementation.
const expected = {
  "audits/logs/read": [
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "audits/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "auth/list": [
    "Floow Platform Support"
  ],
  "braze/configuration/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "braze/configuration/write": [
    "Floow Admin",
    "Floow Support Advisor"
  ],
  "braze/requests/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "braze/requests/replay": [
    "Floow Admin",
    "Floow Support Advisor"
  ],
  "feature_subscriptions/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "feature_subscriptions/write": [
    "Floow Admin",
    "Floow Support Advisor"
  ],
  "feedback/read": [
    "Floow Reporter",
    "Floow Support Advisor"
  ],
  "feedback/write": [],
  "floow_clients/apps/create": [
    "Floow Admin",
    "Floow Mobile Support",
    "Floow Support Advisor"
  ],
  "floow_clients/apps/delete": [
    "Floow Admin",
    "Floow Mobile Support"
  ],
  "floow_clients/apps/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "floow_clients/config/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "floow_clients/config/write": [
    "Floow Admin",
    "Floow Support Advisor"
  ],
  "floow_clients/create": [
    "Floow Admin",
    "Floow Support Advisor"
  ],
  "floow_clients/delete": [
    "Floow Admin"
  ],
  "floow_clients/list": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Finance",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "floow_clients/modes_of_transport/read": [
    "Floow Admin",
    "Floow Support Advisor"
  ],
  "floow_clients/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Finance",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "floow_clients/staff/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "floow_clients/staff/write": [
    "Floow Admin",
    "Floow Support Advisor"
  ],
  "impacts/case_status/write": [],
  "impacts/create": [],
  "impacts/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "impacts/update": [],
  "journeys/events/read": [
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "journeys/insights/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Finance",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "journeys/list": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "journeys/mode_of_transport/write": [
    "Floow Admin",
    "Floow Support Advisor"
  ],
  "journeys/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "journeys/revisions/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "journeys/upload": [],
  "policies/read": [
    "Floow Reporter",
    "Floow Support Advisor"
  ],
  "policies/write": [],
  "product_features/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "products/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "products/terms/read": [
    "Floow Reporter",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "products/terms/write": [
    "Floow Support Advisor"
  ],
  "products/terms_acceptance/read": [
    "Floow Reporter",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "products/terms_acceptance/write": [],
  "products/write": [
    "Floow Admin",
    "Floow Support Advisor"
  ],
  "reports/delivery/read": [
    "Floow Reporter",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "reports/delivery/retry": [
    "Floow Reporter",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "reports/delivery/write": [
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "reports/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Support Advisor"
  ],
  "reports/write": [
    "Floow Admin",
    "Floow Support Advisor"
  ],
  "scores/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "users/files/read": [
    "Floow Admin",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "users/files/write": [
    "Floow Admin",
    "Floow Mobile Support"
  ],
  "users/personalisation/write": [],
  "users/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Mobile Support",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "users/usage_reset/delete": [
    "Floow Support Advisor"
  ],
  "users/usage_reset/read": [
    "Floow Admin",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "users/usage_reset/write": [
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "users/write": [
    "Floow Support Advisor"
  ],
  "webhooks/read": [
    "Floow Admin",
    "Floow Reporter",
    "Floow Support Advisor",
    "Floow Platform Support"
  ],
  "webhooks/write": [
    "Floow Admin"
  ]
} as const;
describe("Floow staff role matrix", () => {
  for (const [permission, allowed] of Object.entries(expected)) {
    it(permission, () => {
      for (const role of PREVIEW_ROLES) {
        expect(roleAllows(role, permission as PortalPermission)).toBe(allowed.includes(role as never));
      }
    });
  }
  it("includes exactly the supplied policy rows", () => {
    expect(Object.keys(ROLE_PERMISSIONS).sort()).toEqual(Object.keys(expected).sort());
  });
});
describe("role-preview pages", () => {
  it("finance has insights and clients but no admin or insurer tools", () => {
    expect(roleCanVisit("Floow Finance", "/admin/insights")).toBe(true);
    expect(roleCanVisit("Floow Finance", "/admin/clients")).toBe(true);
    expect(roleCanVisit("Floow Finance", "/admin/home")).toBe(false);
    expect(roleCanVisit("Floow Finance", "/admin/insurer/search")).toBe(false);
  });
  it("reporter can read terms but cannot create them or read user files", () => {
    expect(roleCanVisit("Floow Reporter", "/admin/terms")).toBe(true);
    expect(roleCanVisit("Floow Reporter", "/admin/terms/new")).toBe(false);
    expect(roleCanVisit("Floow Reporter", "/admin/insurer/users/mike/files")).toBe(false);
    expect(roleCanVisit("Floow Reporter", "/admin/insurer/users/mike/terms")).toBe(true);
  });
  it("support advisor alone can create terms, while admin cannot read them", () => {
    expect(roleCanVisit("Floow Support Advisor", "/admin/terms/new")).toBe(true);
    expect(roleCanVisit("Floow Admin", "/admin/terms")).toBe(false);
  });
  it("mobile support sees journeys and apps but not impacts or insights", () => {
    expect(roleCanVisit("Floow Mobile Support", "/admin/insurer/users/mike/journeys/j1/route")).toBe(true);
    expect(roleCanVisit("Floow Mobile Support", "/admin/developer/apps/add")).toBe(true);
    expect(roleCanVisit("Floow Mobile Support", "/admin/insurer/impacts")).toBe(false);
    expect(roleCanVisit("Floow Mobile Support", "/admin/insights")).toBe(false);
  });
  it("all roles keep their inbox and hide unlisted pages", () => {
    for (const role of PREVIEW_ROLES) {
      expect(roleCanVisit(role, "/admin/notifications")).toBe(true);
      expect(roleCanVisit(role, "/admin/faqs")).toBe(false);
      expect(roleCanVisit(role, "/admin/documentation")).toBe(false);
      expect(roleCanVisit(role, "/admin/developer/rest-api/credentials")).toBe(false);
      expect(roleCanVisit(role, "/admin/developer/webhooks/subscriptions/add")).toBe(role === "Floow Admin");
    }
  });
  it("returning to the account view does not restrict existing pages", () => {
    expect(roleCanVisit(null, "/admin/faqs")).toBe(true);
  });
});
