import { useRolePreview } from "@/contexts/RolePreviewContext";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/contexts/CustomerContext";
import { useAuth } from "@/hooks/useAuth";
import { CAMPAIGNS, ALWAYS_ENABLED_CAMPAIGNS } from "@/lib/campaigns";

const isUrl = (s: string) => { try { return new URL(s).protocol === "https:"; } catch { return false; } };

const CampaignsConfigPage = () => {
  const { allows } = useRolePreview();
  const canWrite = allows("braze/configuration/write");
  const { selectedCustomerId } = useCustomer();
  const { user } = useAuth();
  const qc = useQueryClient();

  // ---- API configuration (per client) ----
  const { data: braze } = useQuery({
    queryKey: ["braze-config", selectedCustomerId], enabled: !!selectedCustomerId,
    queryFn: async () => {
      const { data, error } = await supabase.from("braze_configs").select("api_key, rest_endpoint").eq("customer_id", selectedCustomerId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [apiMsg, setApiMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => { setApiKey(braze?.api_key ?? ""); setEndpoint(braze?.rest_endpoint ?? ""); setApiMsg(null); }, [braze]);
  const apiDirty = apiKey !== (braze?.api_key ?? "") || endpoint !== (braze?.rest_endpoint ?? "");
  const apiValid = apiKey.trim() !== "" && isUrl(endpoint.trim());

  const saveApi = async () => {
    const { error } = await supabase.from("braze_configs").upsert({ customer_id: selectedCustomerId!, api_key: apiKey.trim(), rest_endpoint: endpoint.trim(), updated_by: user?.id });
    setApiMsg(error ? { ok: false, text: error.message } : { ok: true, text: "API configuration saved." });
    if (!error) qc.invalidateQueries({ queryKey: ["braze-config"] });
  };

  // ---- Campaigns (per product) ----
  const { data: products = [] } = useQuery({
    queryKey: ["campaign-products", selectedCustomerId], enabled: !!selectedCustomerId,
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, code, name, campaigns_enabled, campaigns_config").eq("customer_id", selectedCustomerId!).order("code");
      if (error) throw error;
      return data;
    },
  });
  const { data: featureOn } = useQuery({
    queryKey: ["features", "campaigns", selectedCustomerId], enabled: !!selectedCustomerId,
    queryFn: async () => {
      const { data } = await supabase.from("features").select("state").eq("customer_id", selectedCustomerId!).eq("key", "campaigns").maybeSingle();
      return data?.state === "active";
    },
  });
  const [productId, setProductId] = useState("");
  useEffect(() => { if (products.length && !products.some((p) => p.id === productId)) setProductId(products[0].id); }, [products, productId]);
  const product = products.find((p) => p.id === productId);
  const [enabled, setEnabled] = useState(false);
  const [config, setConfig] = useState<Record<string, boolean>>({});
  const [campMsg, setCampMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const savedConfig = (product?.campaigns_config as Record<string, boolean>) ?? {};
  useEffect(() => {
    if (!product) return;
    setEnabled(product.campaigns_enabled);
    setConfig(Object.fromEntries(CAMPAIGNS.map((c) => [c.key, ALWAYS_ENABLED_CAMPAIGNS.includes(c.key) || !!savedConfig[c.key]])));
    setCampMsg(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);
  const campDirty = !!product && (enabled !== product.campaigns_enabled || CAMPAIGNS.some((c) => !ALWAYS_ENABLED_CAMPAIGNS.includes(c.key) && config[c.key] !== !!savedConfig[c.key]));
  const setAll = (v: boolean) => setConfig(Object.fromEntries(CAMPAIGNS.map((c) => [c.key, ALWAYS_ENABLED_CAMPAIGNS.includes(c.key) || v])));

  const saveCampaigns = async () => {
    if (!product) return;
    if (enabled && !braze?.api_key) { setCampMsg({ ok: false, text: "Save the API configuration before enabling campaigns." }); return; }
    const { error } = await supabase.from("products").update({ campaigns_enabled: enabled, campaigns_config: config, updated_by: user?.id }).eq("id", product.id);
    setCampMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Campaigns saved." });
    if (!error) qc.invalidateQueries({ queryKey: ["campaign-products"] });
  };

  const Msg = ({ m }: { m: { ok: boolean; text: string } | null }) => m && <p role={m.ok ? "status" : "alert"} className={`text-sm ${m.ok ? "text-portal-accent" : "text-destructive"}`}>{m.text}</p>;

  return (
    <AdminLayout title="Braze Configuration" crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Developer tools", to: "/admin/developer" }, { label: "Campaigns", to: "/admin/developer/campaigns" }, { label: "Configuration" }]}>
      <div className="max-w-5xl">
        <h2 className="text-2xl font-bold text-portal-navy mb-4">API configuration</h2>
        <section className="bg-portal-panel border border-portal-border rounded-md p-6 space-y-5">
          <div className="grid md:grid-cols-[1fr_2fr] gap-3 items-center">
            <label htmlFor="braze-key" className="text-sm font-semibold">API Key</label>
            <div className="flex items-center gap-2">
              <Input readOnly={!canWrite} id="braze-key" type={showKey ? "text" : "password"} value={apiKey} onChange={(e) => setApiKey(e.target.value)} autoComplete="off" />
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowKey(!showKey)} aria-label={showKey ? "Hide API key" : "Show API key"}>{showKey ? <EyeOff /> : <Eye />}</Button>
            </div>
          </div>
          <div className="grid md:grid-cols-[1fr_2fr] gap-3 items-center">
            <label htmlFor="braze-endpoint" className="text-sm font-semibold">REST Endpoint</label>
            <Input readOnly={!canWrite} id="braze-endpoint" value={endpoint} placeholder="https://rest.fra-02.braze.eu" onChange={(e) => setEndpoint(e.target.value)} className="md:mr-12 md:w-auto" />
          </div>
        </section>
        <div className="flex items-center justify-end gap-4 mt-4"><Msg m={apiMsg} />{canWrite && <Button disabled={!apiDirty || !apiValid} onClick={saveApi}>Save changes</Button>}</div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-10 mb-4">
          <h2 className="text-2xl font-bold text-portal-navy">Campaigns</h2>
          {products.length > 0 && (
            <label className="flex items-center gap-2 text-sm font-semibold">Product code
              <select value={productId} onChange={(e) => setProductId(e.target.value)} className="h-10 border border-portal-border rounded-md px-3 bg-portal-panel font-normal">
                {products.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}
              </select>
            </label>
          )}
        </div>
        {products.length === 0 ? (
          <p className="bg-portal-panel border border-portal-border rounded-md p-6 text-portal-muted">Add a product first to configure its campaigns.</p>
        ) : (
          <section className={`bg-portal-panel border border-portal-border rounded-md p-6 ${featureOn === false ? "opacity-60" : ""}`}>
            {featureOn === false && <p className="mb-4 text-sm text-portal-muted">Campaigns is not enabled at client level, contact your account manager to enable.</p>}
            <fieldset disabled={featureOn === false || !canWrite}>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="font-semibold">Enable campaigns on this product</span>
                <label className="flex items-center gap-1.5"><input type="radio" name="camp-on" checked={enabled} onChange={() => setEnabled(true)} className="accent-portal-accent" />Campaigns enabled</label>
                <label className="flex items-center gap-1.5"><input type="radio" name="camp-on" checked={!enabled} onChange={() => setEnabled(false)} className="accent-portal-accent" />Campaigns disabled</label>
              </div>
              {enabled && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-6 mb-3">
                    <p className="text-sm">Choose which campaigns are active for this product.</p>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" className="border-portal-navy text-portal-navy" onClick={() => setAll(true)}>Enable all</Button>
                      <Button type="button" size="sm" variant="outline" className="border-portal-navy text-portal-navy" onClick={() => setAll(false)}>Disable all</Button>
                    </div>
                  </div>
                  <div className="border border-portal-border rounded-md divide-y divide-portal-border">
                    {CAMPAIGNS.map((c) => {
                      const always = ALWAYS_ENABLED_CAMPAIGNS.includes(c.key);
                      return (
                        <div key={c.key} className="grid md:grid-cols-[1fr_2fr_auto] gap-3 p-3 text-sm">
                          <span className="font-bold">{c.name}</span>
                          <span className="text-portal-muted">{c.useCase}</span>
                          {always ? <span className="md:text-right">Always enabled</span> : (
                            <span className="flex gap-3">
                              <label className="flex items-center gap-1.5"><input type="radio" name={`c-${c.key}`} checked={!!config[c.key]} onChange={() => setConfig({ ...config, [c.key]: true })} className="accent-portal-accent" />Enabled</label>
                              <label className="flex items-center gap-1.5"><input type="radio" name={`c-${c.key}`} checked={!config[c.key]} onChange={() => setConfig({ ...config, [c.key]: false })} className="accent-portal-accent" />Disabled</label>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </fieldset>
          </section>
        )}
        {products.length > 0 && <div className="flex items-center justify-end gap-4 mt-4"><Msg m={campMsg} />{canWrite && <Button disabled={!campDirty || featureOn === false} onClick={saveCampaigns}>Save changes</Button>}</div>}
      </div>
    </AdminLayout>
  );
};

export default CampaignsConfigPage;