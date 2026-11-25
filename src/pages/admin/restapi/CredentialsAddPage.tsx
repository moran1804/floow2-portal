import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Network } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/contexts/CustomerContext";
import { SCOPE_GROUPS } from "./scopes";

const CredentialsAddPage = () => {
  const { selectedCustomerId } = useCustomer();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const toggle = (keys: string[], on: boolean) => setSel((s) => { const n = new Set(s); keys.forEach((k) => (on ? n.add(k) : n.delete(k))); return n; });
  const canCreate = name.trim() && sel.size > 0 && !saving;
  const create = async () => {
    setSaving(true); setErr("");
    const { error } = await supabase.from("api_credentials").insert({ customer_id: selectedCustomerId!, name: name.trim(), scopes: [...sel] });
    setSaving(false);
    if (error) return setErr(error.code === "23505" ? "Credentials with this name already exist." : error.message);
    navigate("/admin/developer/rest-api/credentials");
  };
  return (
    <AdminLayout title="Add credentials" crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Developer tools", to: "/admin/developer" }, { label: "REST API", to: "/admin/developer/rest-api" }, { label: "Credentials", to: "/admin/developer/rest-api/credentials" }, { label: "Add" }]}>
      <div className="max-w-6xl bg-portal-panel border border-portal-border rounded-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-10 h-10 rounded bg-portal-accent text-primary-foreground flex items-center justify-center"><Network className="w-5 h-5" /></span>
          <h2 className="text-lg font-bold">Create API access credentials</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 items-center mb-8">
          <label htmlFor="cred-name" className="text-sm font-semibold">Name</label>
          <Input id="cred-name" className="md:col-span-2" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <h3 className="text-lg font-bold">OAuth Scopes</h3>
        <p className="text-sm mb-4">Select the OAuth scopes that will be requested using these credentials.</p>
        {SCOPE_GROUPS.map((g) => {
          const keys = g.scopes.map((s) => s.key);
          const all = keys.every((k) => sel.has(k));
          return (
            <div key={g.group} className="mb-4">
              <label className="flex items-center gap-3 px-4 py-3 font-bold text-lg">
                <input type="checkbox" checked={all} onChange={(e) => toggle(keys, e.target.checked)} />{g.group}
              </label>
              <div className="bg-portal-surface rounded grid md:grid-cols-2 gap-x-6 gap-y-3 px-4 py-4">
                {g.scopes.map((s) => (
                  <label key={s.key} className="flex items-center gap-3">
                    <input type="checkbox" checked={sel.has(s.key)} onChange={(e) => toggle([s.key], e.target.checked)} />
                    <span><span className="block font-semibold">{s.key}</span><span className="text-sm">{s.desc}</span></span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
        {err && <p role="alert" className="text-destructive text-sm mt-4">{err}</p>}
        <div className="flex justify-end mt-8"><Button className="w-full md:w-96" disabled={!canCreate} onClick={create}>{saving ? "Creating…" : "Create"}</Button></div>
      </div>
    </AdminLayout>
  );
};
export default CredentialsAddPage;
