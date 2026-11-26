import { useRolePreview } from "@/contexts/RolePreviewContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_SCORE_CONFIG } from "@/lib/defaultScoreConfig";
import { CAMPAIGNS, ALWAYS_ENABLED_CAMPAIGNS } from "@/lib/campaigns";
import { useCustomer } from "@/contexts/CustomerContext";

const CODE_PREFIX = "aldostm-";

type FormState = {
  name: string;
  code: string;
  mode_of_transport_user_editable_period: string;
  scoring_enabled: boolean;
  score_config: string;
  impact_detection_enabled: boolean;
  campaigns_enabled: boolean;
  campaigns_config: Record<string, boolean>;
  campaigns_endpoint: string;
  campaigns_api_key: string;
};

const emptyForm: FormState = {
  name: "",
  code: CODE_PREFIX,
  mode_of_transport_user_editable_period: "P2D",
  scoring_enabled: false,
  score_config: "",
  impact_detection_enabled: false,
  campaigns_enabled: false,
  campaigns_config: {},
  campaigns_endpoint: "",
  campaigns_api_key: "",
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-bold text-portal-navy mb-3">{children}</h2>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md border border-portal-border bg-portal-panel p-4 sm:p-6">
    {children}
  </div>
);

const Row = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="grid grid-cols-1 gap-3 py-2 md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
    <div>
      <div className="font-semibold text-portal-navy">{label}</div>
      {hint && <div className="text-sm text-portal-muted mt-1">{hint}</div>}
    </div>
    <div>{children}</div>
  </div>
);

const ProductEditorPage = () => {
  const { allows } = useRolePreview();
  const canWrite = allows("products/write");
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "add";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { selectedCustomerId } = useCustomer();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [hasSavedApiKey, setHasSavedApiKey] = useState(false);

  const { data: product } = useQuery({
    queryKey: ["product", id],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: otherProducts = [] } = useQuery({
    queryKey: ["products", "configs", selectedCustomerId],
    enabled: !!selectedCustomerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, code, name, score_config")
        .eq("customer_id", selectedCustomerId!)
        .order("code");
      if (error) throw error;
      return data;
    },
  });

  const { data: featureStates } = useQuery({
    queryKey: ["features", "client-states", selectedCustomerId],
    enabled: !!selectedCustomerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("features")
        .select("key, state")
        .eq("customer_id", selectedCustomerId!)
        .in("key", ["scoring", "impact_detection", "campaigns"]);
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach((f: any) => (map[f.key] = f.state));
      return map;
    },
  });

  const scoringFeatureEnabled = featureStates?.scoring === "active";
  const impactFeatureEnabled = featureStates?.impact_detection === "active";
  const campaignsFeatureEnabled = featureStates?.campaigns === "active";
  const disabledMessage =
    "is not enabled at client level, contact your account manager to enable.";

  useEffect(() => {
    if (product) {
      const loadedConfig =
        ((product as any).campaigns_config as Record<string, boolean>) ?? {};
      const config: Record<string, boolean> = {};
      CAMPAIGNS.forEach((c) => {
        config[c.key] = ALWAYS_ENABLED_CAMPAIGNS.includes(c.key)
          ? true
          : !!loadedConfig[c.key];
      });
      const savedApiKey = ((product as any).campaigns_api_key as string) ?? "";
      setHasSavedApiKey(!!savedApiKey);
      setForm({
        name: product.name ?? "",
        code: product.code ?? CODE_PREFIX,
        mode_of_transport_user_editable_period:
          (product as any).mode_of_transport_user_editable_period ?? "P2D",
        scoring_enabled: (product as any).scoring_enabled ?? false,
        score_config: (product as any).score_config ?? "",
        impact_detection_enabled:
          (product as any).impact_detection_enabled ?? false,
        campaigns_enabled: (product as any).campaigns_enabled ?? false,
        campaigns_config: config,
        campaigns_endpoint: (product as any).campaigns_endpoint ?? "",
        campaigns_api_key: "",
      });
    }
  }, [product]);

  const save = useMutation({
    mutationFn: async (f: FormState) => {
      if (!f.name.trim()) throw new Error("Product name is required");
      if (!f.code.trim() || f.code.trim() === CODE_PREFIX)
        throw new Error("Product code is required");
      if (f.campaigns_enabled) {
        if (!f.campaigns_endpoint.trim())
          throw new Error("Campaigns endpoint is required");
        if (isNew && !f.campaigns_api_key.trim())
          throw new Error("Campaigns API key is required");
        if (!isNew && !hasSavedApiKey && !f.campaigns_api_key.trim())
          throw new Error("Campaigns API key is required");
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const campaignsConfig: Record<string, boolean> = {};
      CAMPAIGNS.forEach((c) => {
        campaignsConfig[c.key] = ALWAYS_ENABLED_CAMPAIGNS.includes(c.key)
          ? true
          : !!f.campaigns_config[c.key];
      });
      const payload: any = {
        name: f.name.trim(),
        code: f.code.trim().toLowerCase(),
        mode_of_transport_user_editable_period:
          f.mode_of_transport_user_editable_period.trim() || "P2D",
        scoring_enabled: f.scoring_enabled,
        score_config: f.score_config,
        impact_detection_enabled: f.impact_detection_enabled,
        campaigns_enabled: f.campaigns_enabled,
        campaigns_config: campaignsConfig,
        campaigns_endpoint: f.campaigns_endpoint.trim(),
        updated_by: userId,
      };
      if (isNew || f.campaigns_api_key.trim()) {
        payload.campaigns_api_key = f.campaigns_api_key.trim();
      }

      if (isNew) {
        if (!selectedCustomerId) throw new Error("No customer selected");
        const { error } = await supabase
          .from("products")
          .insert({ ...payload, created_by: userId, is_active: true, customer_id: selectedCustomerId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", id!);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      navigate("/admin/products");
    },
    onError: (e: Error) => setError(e.message),
  });

  const title = isNew ? "Add a product" : canWrite ? "Edit product" : "View product";

  return (
    <AdminLayout
      title={title}
      crumbs={[
        { label: "Home", to: "/" },
        { label: "Admin" },
        { label: "Products", to: "/admin/products" },
        { label: isNew ? "Add" : form.code || "Edit" },
      ]}
    >
      <div className="space-y-8">
        <fieldset disabled={!canWrite} className="min-w-0 space-y-8">
        {/* Product details */}
        <section>
          <SectionTitle>Product details</SectionTitle>
          <Card>
            <div className="divide-y divide-portal-border">
              <Row label="Product name">
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Row>
              <Row
                label="Product code"
                hint={
                  isNew
                    ? "A unique code for this product, prefixed with your client identifier. This cannot be changed once the product is created."
                    : "Product code cannot be changed once the product is created."
                }
              >
                <Input
                  value={form.code}
                  readOnly={!isNew}
                  disabled={!isNew}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toLowerCase() })
                  }
                />
              </Row>
              <Row
                label="Mode of transport user editable period"
                hint="How long after they recorded a journey should a user be allowed to amend the mode of transport."
              >
                <Select
                  value={form.mode_of_transport_user_editable_period}
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      mode_of_transport_user_editable_period: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full max-w-[260px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((days) => {
                      const value = `P${days}D`;
                      let label = `${days} day${days > 1 ? "s" : ""}`;
                      if (days % 7 === 0) {
                        const weeks = days / 7;
                        label = `${weeks} week${weeks > 1 ? "s" : ""} (${days} days)`;
                      }
                      return (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </Row>
            </div>
          </Card>
        </section>

        {/* Journey scoring */}
        <section>
          <SectionTitle>Journey scoring</SectionTitle>
          <Card>
            <div
              className={
                !scoringFeatureEnabled ? "opacity-50 pointer-events-none select-none" : ""
              }
              aria-disabled={!scoringFeatureEnabled}
            >
            <Row label="Enable scoring on this product">
              <div className="space-y-3">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={form.scoring_enabled}
                      onChange={() =>
                        setForm({ ...form, scoring_enabled: true })
                      }
                      disabled={!scoringFeatureEnabled}
                    />
                    Scoring enabled
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!form.scoring_enabled}
                      onChange={() =>
                        setForm({ ...form, scoring_enabled: false })
                      }
                      disabled={!scoringFeatureEnabled}
                    />
                    Scoring disabled
                  </label>
                </div>
                {form.scoring_enabled && (
                  <div className="flex items-start gap-2 text-sm text-portal-muted">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    <span>
                      The scoring feature also needs to be enabled in order for
                      journeys to be scored.
                    </span>
                  </div>
                )}
              </div>
            </Row>

            {form.scoring_enabled && (
              <>
                <Row
                  label="Score config"
                  hint="Configuration of how a journey should be scored."
                >
                  <Textarea
                    rows={10}
                    value={form.score_config}
                    onChange={(e) =>
                      setForm({ ...form, score_config: e.target.value })
                    }
                  />
                </Row>
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <span className="text-sm text-portal-text">Copy config from:</span>
                  <Select
                    onValueChange={(value) => {
                      if (value === "__default__") {
                        setForm({ ...form, score_config: DEFAULT_SCORE_CONFIG });
                        return;
                      }
                      const src = otherProducts.find((p) => p.id === value);
                      if (src)
                        setForm({
                          ...form,
                          score_config: (src as any).score_config ?? "",
                        });
                    }}
                  >
                    <SelectTrigger className="w-full max-w-[260px]">
                      <SelectValue placeholder="Select config to copy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__default__">Default config</SelectItem>
                      {otherProducts
                        .filter((p) => p.id !== id)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.code}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            </div>
            {!scoringFeatureEnabled && (
              <div className="mt-4 flex items-start gap-2 text-sm text-portal-text bg-portal-surface border border-portal-border rounded-md p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-portal-muted" />
                <span>Scoring {disabledMessage}</span>
              </div>
            )}
          </Card>
        </section>

        {/* Impact detection */}
        <section>
          <SectionTitle>Impact detection</SectionTitle>
          <Card>
            <div
              className={
                !impactFeatureEnabled ? "opacity-50 pointer-events-none select-none" : ""
              }
              aria-disabled={!impactFeatureEnabled}
            >
            <Row label="Enable impact detection on this product">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={form.impact_detection_enabled}
                    onChange={() =>
                      setForm({ ...form, impact_detection_enabled: true })
                    }
                    disabled={!impactFeatureEnabled}
                  />
                  Impact detection enabled
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!form.impact_detection_enabled}
                    onChange={() =>
                      setForm({ ...form, impact_detection_enabled: false })
                    }
                    disabled={!impactFeatureEnabled}
                  />
                  Impact detection disabled
                </label>
              </div>
            </Row>
            </div>
            {!impactFeatureEnabled && (
              <div className="mt-4 flex items-start gap-2 text-sm text-portal-text bg-portal-surface border border-portal-border rounded-md p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-portal-muted" />
                <span>Impact detection {disabledMessage}</span>
              </div>
            )}
          </Card>
        </section>

        {/* Campaigns */}
        <section>
          <SectionTitle>Campaigns</SectionTitle>
          <Card>
            <div
              className={
                !campaignsFeatureEnabled ? "opacity-50 pointer-events-none select-none" : ""
              }
              aria-disabled={!campaignsFeatureEnabled}
            >
              <Row label="Enable campaigns on this product">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={form.campaigns_enabled}
                      onChange={() => setForm({ ...form, campaigns_enabled: true })}
                      disabled={!campaignsFeatureEnabled}
                    />
                    Campaigns enabled
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!form.campaigns_enabled}
                      onChange={() => setForm({ ...form, campaigns_enabled: false })}
                      disabled={!campaignsFeatureEnabled}
                    />
                    Campaigns disabled
                  </label>
                </div>
              </Row>

              {form.campaigns_enabled && (
                <div className="pt-2 space-y-3">
                  <div className="border border-portal-border rounded-md p-4 space-y-4">
                    <Row
                      label="Campaigns endpoint"
                      hint="The base URL of the campaigns API for this product. Required."
                    >
                      <Input
                        type="url"
                        placeholder="https://api.example.com/campaigns"
                        value={form.campaigns_endpoint}
                        onChange={(e) =>
                          setForm({ ...form, campaigns_endpoint: e.target.value })
                        }
                      />
                    </Row>
                    <Row
                      label="Campaigns API key"
                      hint="API key used to authenticate against the campaigns endpoint. Required."
                    >
                      <Input
                        type="password"
                        autoComplete="off"
                        placeholder={hasSavedApiKey ? "••••••••" : ""}
                        value={form.campaigns_api_key}
                        onChange={(e) =>
                          setForm({ ...form, campaigns_api_key: e.target.value })
                        }
                      />
                    </Row>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-portal-muted">
                      Choose which campaigns are active for this product.
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const all: Record<string, boolean> = {};
                          CAMPAIGNS.forEach((c) => (all[c.key] = true));
                          setForm({ ...form, campaigns_config: all });
                        }}
                      >
                        Enable all
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const all: Record<string, boolean> = {};
                          CAMPAIGNS.forEach((c) => {
                            all[c.key] = ALWAYS_ENABLED_CAMPAIGNS.includes(c.key);
                          });
                          setForm({ ...form, campaigns_config: all });
                        }}
                      >
                        Disable all
                      </Button>
                    </div>
                  </div>

                  <div className="border border-portal-border rounded-md divide-y divide-portal-border">
                    {CAMPAIGNS.map((c) => {
                      const alwaysOn = ALWAYS_ENABLED_CAMPAIGNS.includes(c.key);
                      const enabled = !!form.campaigns_config[c.key];
                      return (
                        <div
                          key={c.key}
                          className="grid grid-cols-1 items-start gap-4 p-4 md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_220px]"
                        >
                          <div className="font-semibold text-portal-navy">{c.name}</div>
                          <div className="text-sm text-portal-text">{c.useCase}</div>
                          <div className="flex flex-wrap items-center gap-4 md:justify-self-end">
                            {alwaysOn ? (
                              <span className="text-sm text-portal-navy font-medium">
                                Always enabled
                              </span>
                            ) : (
                              <>
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                  <input
                                    type="radio"
                                    checked={enabled}
                                    onChange={() =>
                                      setForm({
                                        ...form,
                                        campaigns_config: {
                                          ...form.campaigns_config,
                                          [c.key]: true,
                                        },
                                      })
                                    }
                                  />
                                  Enabled
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                  <input
                                    type="radio"
                                    checked={!enabled}
                                    onChange={() =>
                                      setForm({
                                        ...form,
                                        campaigns_config: {
                                          ...form.campaigns_config,
                                          [c.key]: false,
                                        },
                                      })
                                    }
                                  />
                                  Disabled
                                </label>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {!campaignsFeatureEnabled && (
              <div className="mt-4 flex items-start gap-2 text-sm text-portal-text bg-portal-surface border border-portal-border rounded-md p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-portal-muted" />
                <span>Campaigns {disabledMessage}</span>
              </div>
            )}
          </Card>
        </section>

        </fieldset>
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </Button>
          {canWrite && <Button
            className="flex-1"
            onClick={() => {
              setError(null);
              save.mutate(form);
            }}
            disabled={save.isPending}
          >
            {isNew ? "Create product" : "Save product"}
          </Button>}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductEditorPage;
