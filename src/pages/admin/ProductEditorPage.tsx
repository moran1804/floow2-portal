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

const CODE_PREFIX = "aldostm-";

type FormState = {
  name: string;
  code: string;
  mode_of_transport_user_editable_period: string;
  scoring_enabled: boolean;
  score_config: string;
  impact_detection_enabled: boolean;
};

const emptyForm: FormState = {
  name: "",
  code: CODE_PREFIX,
  mode_of_transport_user_editable_period: "P2D",
  scoring_enabled: false,
  score_config: "",
  impact_detection_enabled: false,
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-bold text-portal-navy mb-3">{children}</h2>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-portal-panel border border-portal-border rounded-md p-6">
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
  <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-2">
    <div>
      <div className="font-semibold text-portal-navy">{label}</div>
      {hint && <div className="text-sm text-portal-muted mt-1">{hint}</div>}
    </div>
    <div>{children}</div>
  </div>
);

const ProductEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "add";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

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
    queryKey: ["products", "configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, code, name, score_config")
        .order("code");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? "",
        code: product.code ?? CODE_PREFIX,
        mode_of_transport_user_editable_period:
          (product as any).mode_of_transport_user_editable_period ?? "P2D",
        scoring_enabled: (product as any).scoring_enabled ?? false,
        score_config: (product as any).score_config ?? "",
        impact_detection_enabled:
          (product as any).impact_detection_enabled ?? false,
      });
    }
  }, [product]);

  const save = useMutation({
    mutationFn: async (f: FormState) => {
      if (!f.name.trim()) throw new Error("Product name is required");
      if (!f.code.trim() || f.code.trim() === CODE_PREFIX)
        throw new Error("Product code is required");

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const payload = {
        name: f.name.trim(),
        code: f.code.trim().toLowerCase(),
        mode_of_transport_user_editable_period:
          f.mode_of_transport_user_editable_period.trim() || "P2D",
        scoring_enabled: f.scoring_enabled,
        score_config: f.score_config,
        impact_detection_enabled: f.impact_detection_enabled,
        updated_by: userId,
      };

      if (isNew) {
        const { error } = await supabase
          .from("products")
          .insert({ ...payload, created_by: userId, is_active: true });
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

  const title = isNew ? "Add a product" : "Edit product";

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
                hint="A unique code for this product, prefixed with your client identifier."
              >
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toLowerCase() })
                  }
                />
              </Row>
              <Row
                label="Mode of transport user editable period"
                hint={
                  <>
                    How long after they recorded a journey should a user be
                    allowed to amend the mode of transport. Must be in ISO-8601
                    duration format e.g. `P2D` is two days.
                    <div className="mt-1">
                      <a className="underline text-portal-accent" href="https://en.wikipedia.org/wiki/ISO_8601#Durations" target="_blank" rel="noreferrer">More info</a>
                    </div>
                  </>
                }
              >
                <Input
                  value={form.mode_of_transport_user_editable_period}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mode_of_transport_user_editable_period: e.target.value,
                    })
                  }
                />
              </Row>
            </div>
          </Card>
        </section>

        {/* Journey scoring */}
        <section>
          <SectionTitle>Journey scoring</SectionTitle>
          <Card>
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
                <div className="flex items-center justify-end gap-3 pt-2">
                  <span className="text-sm text-portal-text">Copy config from:</span>
                  <Select
                    onValueChange={(value) => {
                      const src = otherProducts.find((p) => p.id === value);
                      if (src)
                        setForm({
                          ...form,
                          score_config: (src as any).score_config ?? "",
                        });
                    }}
                  >
                    <SelectTrigger className="w-[260px]">
                      <SelectValue placeholder="Select config to copy" />
                    </SelectTrigger>
                    <SelectContent>
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
          </Card>
        </section>

        {/* Impact detection */}
        <section>
          <SectionTitle>Impact detection</SectionTitle>
          <Card>
            <Row label="Enable impact detection on this product">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={form.impact_detection_enabled}
                    onChange={() =>
                      setForm({ ...form, impact_detection_enabled: true })
                    }
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
                  />
                  Impact detection disabled
                </label>
              </div>
            </Row>
          </Card>
        </section>

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
          <Button
            className="flex-1"
            onClick={() => {
              setError(null);
              save.mutate(form);
            }}
            disabled={save.isPending}
          >
            {isNew ? "Create product" : "Save product"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductEditorPage;
