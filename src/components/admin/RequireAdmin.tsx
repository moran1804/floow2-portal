import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { loading, session, isAdmin } = useAuth();

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
  return <>{children}</>;
};

export default RequireAdmin;