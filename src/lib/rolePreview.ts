// Presentation-only role previews. Never use this matrix to grant backend access.
import { CLIENT_PREVIEW_ROLES, CLIENT_ROLE_PERMISSIONS } from "./clientRolePermissions";
export { CLIENT_PREVIEW_ROLES } from "./clientRolePermissions";
export const FLOOW_PREVIEW_ROLES = ["Floow Admin", "Floow Reporter", "Floow Finance", "Floow Mobile Support", "Floow Support Advisor", "Floow Platform Support"] as const;
export const PREVIEW_ROLES = [...FLOOW_PREVIEW_ROLES, ...CLIENT_PREVIEW_ROLES] as const;
export type PreviewRole = (typeof PREVIEW_ROLES)[number];
// Staff administrators always see a role view; this is the one shown until they choose another.
export const DEFAULT_PREVIEW_ROLE: PreviewRole = "Floow Admin";
export const ROLE_PERMISSIONS = {
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
    "Floow Admin",
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
export type PortalPermission = keyof typeof ROLE_PERMISSIONS;
export function roleAllows(role: PreviewRole | null, permission: PortalPermission): boolean {
  return role === null || role === "Floow Admin" || (ROLE_PERMISSIONS[permission] as readonly string[]).includes(role) || (CLIENT_ROLE_PERMISSIONS[permission] as readonly string[]).includes(role);
}

const adminPages = ["/admin/audit", "/admin/features", "/admin/terms", "/admin/products", "/admin/staff", "/admin/configuration"];
const developerPages = ["/admin/developer/apps", "/admin/developer/campaigns", "/admin/developer/webhooks"];
const insurerPages = ["/admin/insurer/search", "/admin/insurer/impacts"];

// Routes without a policy in the supplied matrix are intentionally unavailable in previews.
export function roleCanVisit(role: PreviewRole | null, path: string): boolean {
  if (role === null || role === "Floow Admin") return true;
  const pathname = path.split(/[?#]/)[0];
  const allows = (permission: PortalPermission) => roleAllows(role, permission);
  if (["/", "/admin/overview", "/admin/notifications"].includes(pathname)) return true;
  if (pathname === "/admin/home") return adminPages.some((page) => roleCanVisit(role, page));
  if (pathname === "/admin/developer") return developerPages.some((page) => roleCanVisit(role, page));
  if (pathname === "/admin/insurer") return insurerPages.some((page) => roleCanVisit(role, page));
  if (pathname === "/admin/clients") return allows("floow_clients/list");
  if (pathname.startsWith("/admin/insights")) return allows("journeys/insights/read");
  if (pathname.startsWith("/admin/audit")) return allows("audits/read");
  if (pathname.startsWith("/admin/features")) return allows("feature_subscriptions/read");
  if (pathname.startsWith("/admin/staff")) return allows("floow_clients/staff/read");
  if (pathname.startsWith("/admin/configuration")) return allows("floow_clients/config/read") || allows("floow_clients/modes_of_transport/read");
  if (pathname === "/admin/terms/new") return allows("products/terms/read") && allows("products/terms/write");
  if (pathname.startsWith("/admin/terms")) return allows("products/terms/read");
  if (pathname === "/admin/products/add") return allows("products/read") && allows("products/write");
  if (pathname.startsWith("/admin/products")) return allows("products/read");
  if (pathname === "/admin/developer/apps/add") return allows("floow_clients/apps/read") && allows("floow_clients/apps/create");
  if (pathname.startsWith("/admin/developer/apps")) return allows("floow_clients/apps/read");
  if (pathname.endsWith("/webhooks/subscriptions/add")) return allows("webhooks/read") && allows("webhooks/write");
  if (pathname.startsWith("/admin/developer/webhooks")) return allows("webhooks/read");
  if (pathname.endsWith("/campaigns/tracking-failures")) return allows("braze/requests/read");
  if (pathname.startsWith("/admin/developer/campaigns")) return allows("braze/configuration/read");
  if (pathname.startsWith("/admin/insurer/search")) return allows("users/read");
  if (pathname.startsWith("/admin/insurer/policies/")) return allows("policies/read");
  if (pathname.startsWith("/admin/insurer/impacts")) return allows("impacts/read");
  if (pathname.startsWith("/admin/insurer/users/")) {
    if (!allows("users/read")) return false;
    if (/\/journeys\/[^/]+\/revisions$/.test(pathname)) return allows("journeys/revisions/read");
    if (/\/journeys\/[^/]+\/route$/.test(pathname)) return allows("journeys/read");
    if (/\/journeys\/[^/]+$/.test(pathname)) return allows("journeys/read");
    if (pathname.endsWith("/journeys")) return allows("journeys/list");
    if (pathname.endsWith("/files")) return allows("users/files/read");
    if (pathname.endsWith("/terms")) return allows("products/terms_acceptance/read");
    return /^\/admin\/insurer\/users\/[^/]+$/.test(pathname);
  }
  return false;
}
