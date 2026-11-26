import { createContext } from "react";
import type { PortalPermission, PreviewRole } from "@/lib/rolePreview";

export type RolePreviewValue = {
  role: PreviewRole | null;
  canPreview: boolean;
  setRole: (role: PreviewRole | null) => void;
  allows: (permission: PortalPermission) => boolean;
  canVisit: (path: string) => boolean;
};

// Keep context identity outside the refreshed provider/hook module.
export const RolePreviewContext = createContext<RolePreviewValue | null>(null);