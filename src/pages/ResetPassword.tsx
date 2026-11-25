import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import floowLogo from "@/assets/the-floow-logo.svg.asset.json";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError("Passwords don't match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    navigate("/admin/overview", { replace: true });
  };

  return (
    <div className="min-h-screen bg-portal-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-portal-panel border border-portal-border rounded-lg p-8 shadow-sm">
        <img src={floowLogo.url} alt="The Floow" className="h-8 w-auto mb-6" />
        <h1 className="text-2xl font-bold text-portal-navy mb-6">Set a new password</h1>
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <Label htmlFor="pw">New password</Label>
            <Input id="pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pw2">Confirm password</Label>
            <Input id="pw2" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Please wait…" : "Update password"}</Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
