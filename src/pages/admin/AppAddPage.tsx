import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Smartphone } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useAuth } from "@/hooks/useAuth";

type AppType = "floow_managed" | "self_managed";
const TYPES: { key: AppType; title: string; desc: string }[] = [
  { key: "floow_managed", title: "The Floow managed end user application", desc: "Users and their login credentials are managed within the Floow's systems." },
  { key: "self_managed", title: "Self managed end user application", desc: "Connect your own OIDC compatible identity provider." },
];
const isUrl = (s: string) => { try { const u = new URL(s); return u.protocol.length > 1; } catch { return false; } };

const Field = ({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-3 py-4">
    <div><p className="text-sm font-semibold text-portal-text">{label}</p>{help && <p className="text-xs text-portal-muted mt-1">{help}</p>}</div>
    <div>{children}</div>
  </div>
);

const UrlList = ({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) => (
  <div className="space-y-2">
    {values.map((v, i) => (
      <div key={i} className="flex gap-2">
        <Input aria-label={`${label} ${i + 1}`} value={v} placeholder="https://" onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))} />
        <Button type="button" variant="outline" className="border-destructive text-destructive" onClick={() => onChange(values.filter((_, j) => j !== i))}>Remove <Minus /></Button>
      </div>
    ))}
    <Button type="button" variant="outline" className="border-portal-navy text-portal-navy" onClick={() => onChange([...values, ""])}>Add <Plus /></Button>
  </div>
);

const AppAddPage = () => {
  const [params, setParams] = useSearchParams();
  const type = params.get("appType") as AppType | null;
  const [choice, setChoice] = useState<AppType>("floow_managed");
  const [name, setName] = useState("");
  const [callbacks, setCallbacks] = useState([""]);
  const [signouts, setSignouts] = useState([""]);
  const [issuer, setIssuer] = useState("");
  const [aud, setAud] = useState("");
  const [claim, setClaim] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { selectedCustomerId } = useCustomer();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const cb = callbacks.map((s) => s.trim()).filter(Boolean);
  const so = signouts.map((s) => s.trim()).filter(Boolean);
  const valid = name.trim() !== "" && (type === "floow_managed" ? cb.length > 0 && [...cb, ...so].every(isUrl) : isUrl(issuer.trim()));

  const create = async () => {
    if (!selectedCustomerId || !type) return;
    setSaving(true); setErr(null);
    const { error } = await supabase.from("apps").insert({
      customer_id: selectedCustomerId, name: name.trim(), app_type: type, created_by: user?.id,
      callback_urls: type === "floow_managed" ? cb : [], signout_urls: type === "floow_managed" ? so : [],
      oidc_issuer_url: type === "self_managed" ? issuer.trim() : null,
      aud_claim: type === "self_managed" ? aud.trim() || null : null,
      user_id_claim: type === "self_managed" ? claim.trim() || null : null,
    });
    setSaving(false);
    if (error) { setErr(error.code === "23505" ? "An app with this name already exists for this client." : error.message); return; }
    qc.invalidateQueries({ queryKey: ["apps"] });
    navigate("/admin/developer/apps");
  };

  const header = (title: string, change?: boolean) => (
    <h2 className="flex items-center gap-3 text-base font-bold text-portal-text mb-4">
      <span className="w-9 h-9 rounded-md bg-portal-accent text-primary-foreground flex items-center justify-center"><Smartphone className="w-5 h-5" /></span>
      {title}
      {change && <button type="button" className="text-xs font-semibold text-portal-muted hover:text-portal-accent" onClick={() => setParams({})}>(change)</button>}
    </h2>
  );

  return (
    <AdminLayout title="Add an App" crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Developer tools", to: "/admin/developer" }, { label: "Apps", to: "/admin/developer/apps" }, { label: "Add" }]}>
      <section className="bg-portal-panel border border-portal-border rounded-md p-6 max-w-5xl">
        {!type ? (
          <>
            {header("App Type")}
            <div className="space-y-3" role="radiogroup">
              {TYPES.map((t) => (
                <label key={t.key} className={`flex items-center gap-4 rounded-md border p-5 cursor-pointer ${choice === t.key ? "border-portal-navy" : "border-portal-border"}`}>
                  <input type="radio" name="app-type" checked={choice === t.key} onChange={() => setChoice(t.key)} className="accent-portal-accent" />
                  <span><span className="block font-bold text-sm text-portal-text">{t.title}</span><span className="text-sm text-portal-muted">{t.desc}</span></span>
                </label>
              ))}
            </div>
            <div className="flex justify-end mt-4"><Button onClick={() => setParams({ appType: choice })}>Next</Button></div>
          </>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (valid) create(); }}>
            {header(TYPES.find((t) => t.key === type)?.title ?? "", true)}
            <Field label="Application name"><Input aria-label="Application name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            {type === "floow_managed" ? (
              <>
                <Field label="Callback URLs" help="Allowed redirect URLs for the application's Oauth sign in process."><UrlList label="Callback URL" values={callbacks} onChange={setCallbacks} /></Field>
                <Field label="Allowed signout URLs" help="Allowed redirect URLs for the application's Oauth sign out process."><UrlList label="Signout URL" values={signouts} onChange={setSignouts} /></Field>
              </>
            ) : (
              <>
                <Field label="OIDC Issuer url" help="URL of the OIDC provider's JWT Issuer. Only requests with tokens that can be verified as coming from this issuer will be accepted for this app."><Input aria-label="OIDC Issuer url" value={issuer} onChange={(e) => setIssuer(e.target.value)} /></Field>
                <Field label="Expected aud claim" help="Optionally adds an extra layer of protection by only accepting tokens with a matching aud value."><Input aria-label="Expected aud claim" value={aud} onChange={(e) => setAud(e.target.value)} /></Field>
                <Field label="JWT userId claim" help="Which claim from the JWT should be treated as the unique id for this user. When not populated then the sub claim will be used."><Input aria-label="JWT userId claim" value={claim} onChange={(e) => setClaim(e.target.value)} /></Field>
              </>
            )}
            {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
            <div className="flex justify-end mt-4"><Button type="submit" disabled={!valid || saving} className="w-full md:w-96">{saving ? "Creating…" : "Create"}</Button></div>
          </form>
        )}
      </section>
    </AdminLayout>
  );
};

export default AppAddPage;