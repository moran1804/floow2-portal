import { useContext, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_PREVIEW_ROLE, PREVIEW_ROLES, roleAllows, roleCanVisit, type PreviewRole } from "@/lib/rolePreview";
import { RolePreviewContext } from "./rolePreviewContextValue";

export function RolePreviewProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin, isFloowStaff } = useAuth();
  const [selection, setSelection] = useState<{ userId: string; role: PreviewRole } | null>(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("portal-role-preview") ?? "null");
      if (saved && typeof saved.userId === "string" && PREVIEW_ROLES.includes(saved.role)) return saved;
    } catch { /* Ignore invalid presentation preferences. */ }
    return null;
  });
  // Verified account roles only decide who can preview. The selection never changes authentication or grants.
  const canPreview = Boolean(user && isAdmin && isFloowStaff);
  const role: PreviewRole | null = canPreview
    ? selection?.userId === user?.id ? selection.role : DEFAULT_PREVIEW_ROLE
    : null;
  const setRole = (next: PreviewRole) => {
    if (!canPreview || !user) return;
    setSelection({ userId: user.id, role: next });
    // This is a presentation preference, not an account role or an authorization decision.
    try {
      sessionStorage.setItem("portal-role-preview", JSON.stringify({ userId: user.id, role: next }));
    } catch { /* Preview still works when browser storage is unavailable. */ }
  };
  return <RolePreviewContext.Provider value={{ role, canPreview, setRole, allows: (permission) => roleAllows(role, permission), canVisit: (path) => roleCanVisit(role, path) }}>{children}</RolePreviewContext.Provider>;
}

export function useRolePreview() {
  const context = useContext(RolePreviewContext);
  if (!context) throw new Error("useRolePreview must be used within RolePreviewProvider");
  return context;
}