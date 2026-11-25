import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && session && isAdmin) navigate("/admin/overview", { replace: true });
  }, [loading, session, isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-portal-surface flex items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-portal-navy text-portal-navy-foreground flex items-center justify-center mb-6">
          <FileText className="w-6 h-6" />
        </div>
        <h1 className="text-4xl font-bold text-portal-navy mb-3">
          Mobile App Admin Portal
        </h1>
        <p className="text-portal-muted mb-8">
          Manage Terms &amp; Conditions for your mobile app — keep one version
          live, schedule future updates, and reference older versions.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link to={session ? "/admin/overview" : "/auth"}>
              {session ? "Open admin" : "Sign in"} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
