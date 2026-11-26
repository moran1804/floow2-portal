import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRolePreview } from "@/contexts/RolePreviewContext";

const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { loading, session, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const { canVisit } = useRolePreview();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-portal-muted">
        Loading…
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-2xl font-bold text-portal-navy">Admin access required</h1>
        <p className="text-portal-muted">
          Your account doesn&rsquo;t have permission to manage Terms &amp; Conditions.
        </p>
      </div>
    );
  }
  if (!canVisit(pathname)) return <Navigate to="/admin/overview" replace />;
  return <>{children}</>;
};

export default RequireAdmin;