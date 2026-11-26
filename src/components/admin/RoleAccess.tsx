import { type ReactNode } from "react";
import { NavLink, type NavLinkProps } from "react-router-dom";
import { useRolePreview } from "@/contexts/RolePreviewContext";
import type { PortalPermission } from "@/lib/rolePreview";

export function PermissionGate({ permission, children }: { permission: PortalPermission; children: ReactNode }) {
  const { allows } = useRolePreview();
  return allows(permission) ? <>{children}</> : null;
}

export function RoleNavLink(props: NavLinkProps) {
  const { canVisit } = useRolePreview();
  const path = typeof props.to === "string" ? props.to : props.to.pathname ?? "";
  return canVisit(path) ? <NavLink {...props} /> : null;
}