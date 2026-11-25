import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/contexts/CustomerContext";
import { WEBHOOK_EVENT_TYPES } from "./eventTypes";

const crumbs = [{ label: "Home", to: "/admin/overview" }, { label: "Developer tools", to: "/admin/developer" }, { label: "Webhooks", to: "/admin/developer/webhooks" }, { label: "Add" }];

const SubscriptionAddPage = () => {
  const { selectedCustomerId } = useCustomer();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [active, setActive] = useState(true);
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setErr(null);
    if (!description.trim()) return setErr("Enter a description.");
    try { const u = new URL(url); if (u.protocol !== "https:" && u.protocol !== "http:") throw 0; } catch { return setErr("Enter a valid URL, e.g. https://example.com/webhooks."); }
    if (headers.some((h) => !h.key.trim())) return setErr("Every header needs a key.");
    if (!types.length) return setErr("Select at least one event type.");
    setSaving(true);
    const { error } = await supabase.from("webhook_subscriptions").insert({ customer_id: selectedCustomerId!, description: description.trim(), url: url.trim(), is_active: active, headers, event_types: types });
    setSaving(false);
    if (error) return setErr(error.message);
    navigate("/admin/developer/webhooks/subscriptions");
  };

  const row = "grid md:grid-cols-[1fr_2fr] gap-4 items-start";
  return (
    <AdminLayout title="Webhooks" crumbs={crumbs}>
      <div className="max-w-6xl">
        <h2 className="text-3xl font-bold text-portal-navy mb-4">Create subscription</h2>
        <div className="bg-portal-panel border border-portal-border rounded-md p-6 space-y-6">
          <div className={row}><label htmlFor="wh-desc" className="text-sm font-semibold pt-2">Description</label><Input id="wh-desc" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className={row}><label htmlFor="wh-url" className="text-sm font-semibold pt-2">URL</label><Input id="wh-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" /></div>
          <div className={row}><span className="text-sm font-semibold">Enabled</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-1"><input type="radio" checked={active} onChange={() => setActive(true)} />Active</label>
              <label className="flex items-center gap-1"><input type="radio" checked={!active} onChange={() => setActive(false)} />Inactive</label>
            </div>
          </div>
          <div className={row}><span className="text-sm font-semibold">Headers</span>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_1fr_2rem] gap-2"><span>Key</span><span>Value</span></div>
              {headers.map((h, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_2rem] gap-2">
                  <Input aria-label="Header key" value={h.key} onChange={(e) => setHeaders(headers.map((x, j) => j === i ? { ...x, key: e.target.value } : x))} />
                  <Input aria-label="Header value" value={h.value} onChange={(e) => setHeaders(headers.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
                  <button type="button" aria-label="Remove header" onClick={() => setHeaders(headers.filter((_, j) => j !== i))}><X className="w-4 h-4" /></button>
                </div>
              ))}
              <Button type="button" variant="outline" className="border-portal-navy text-portal-navy" onClick={() => setHeaders([...headers, { key: "", value: "" }])}>Add +</Button>
            </div>
          </div>
          <div className={row}><span className="text-sm font-semibold flex items-center gap-2">Event Types <Info className="w-4 h-4" aria-label="The events this webhook will receive" /></span>
            <div className="space-y-1">
              {WEBHOOK_EVENT_TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2"><input type="checkbox" checked={types.includes(t)} onChange={(e) => setTypes(e.target.checked ? [...types, t] : types.filter((x) => x !== t))} />{t}</label>
              ))}
            </div>
          </div>
          {err && <p role="alert" className="text-destructive text-sm">{err}</p>}
          <div className="flex justify-end"><Button onClick={submit} disabled={saving}>Create subscription</Button></div>
        </div>
      </div>
    </AdminLayout>
  );
};
export default SubscriptionAddPage;
