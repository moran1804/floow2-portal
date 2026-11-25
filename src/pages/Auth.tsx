import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import floowLogo from "@/assets/the-floow-logo.svg.asset.json";

const MicrosoftIcon = () => (
  <svg viewBox="0 0 21 21" className="h-4 w-4" aria-hidden="true">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

const Auth = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (session) navigate("/admin/terms", { replace: true });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setInfo("If an account exists for that email, a reset link is on its way.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const signInMicrosoft = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("microsoft", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) setError(result.error.message ?? "Microsoft sign-in failed");
  };

  return (
    <div className="min-h-screen bg-portal-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-portal-panel border border-portal-border rounded-lg p-8 shadow-sm">
        <img src={floowLogo.url} alt="The Floow" className="h-8 w-auto mb-6" />
        <h1 className="text-2xl font-bold text-portal-navy mb-1">
          {mode === "login" ? "Sign in" : "Reset password"}
        </h1>
        <p className="text-sm text-portal-muted mb-6">
          {mode === "login"
            ? "Sign in to the Floow admin portal"
            : "Enter your email and we'll send you a link to reset your password."}
        </p>

        <form className="space-y-4" onSubmit={submit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode === "login" && (
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-portal-accent hover:underline"
                  onClick={() => { setMode("reset"); setError(null); setInfo(null); }}>
                  Forgot password?
                </button>
              </div>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-portal-navy">{info}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Send reset link"}
          </Button>
        </form>
        {mode === "login" && (
          <>
            <div className="flex items-center gap-3 my-5 text-xs text-portal-muted">
              <div className="h-px flex-1 bg-portal-border" /> or <div className="h-px flex-1 bg-portal-border" />
            </div>
            <Button type="button" variant="outline" className="w-full gap-2" onClick={signInMicrosoft}>
              <MicrosoftIcon /> Sign in with Microsoft 365
            </Button>
          </>
        )}
        {mode === "reset" && (
          <button type="button" className="mt-4 text-sm text-portal-accent hover:underline w-full text-center"
            onClick={() => { setMode("login"); setError(null); setInfo(null); }}>
            Back to sign in
          </button>
        )}
      </div>
    </div>
  );
};

export default Auth;
