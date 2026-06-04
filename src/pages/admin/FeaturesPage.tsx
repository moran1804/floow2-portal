import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, CalendarCheck2, Info } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Feature = {
  id: string;
  key: string;
  name: string;
  category: string;
  description: string | null;
  state: "active" | "inactive";
  start_at: string | null;
  end_at: string | null;
  sort_order: number;
  updated_by: string | null;
};

const CATEGORY_ORDER = ["Journeys", "Scoring", "Floow campaigns", "Other"];

const formatDate = (iso: string | null) => {
  if (!iso) return "--";
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d
    .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    .toLowerCase();
  return `${date} - ${time}`;
};

const initialsFromEmail = (email?: string | null) =>
  (email ?? "??").split("@")[0].slice(0, 2).toUpperCase();

const FeaturesPage = () => {
  const { user, isFloowStaff } = useAuth();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("features")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) {
      console.error(error.message);
    } else {
      setFeatures((data ?? []) as Feature[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, Feature[]>();
    for (const f of features) {
      if (!map.has(f.category)) map.set(f.category, []);
      map.get(f.category)!.push(f);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({
      category: c,
      items: map.get(c)!,
    }));
  }, [features]);

  const toggle = async (f: Feature, next: "active" | "inactive") => {
    if (!isFloowStaff) {
      return;
    }
    const rpc = next === "active" ? "activate_feature" : "deactivate_feature";
    const { error } = await supabase.rpc(rpc, { _id: f.id });
    if (error) {
      console.error(error.message);
      return;
    }
    load();
  };

  return (
    <AdminLayout
      title="Features"
      crumbs={[{ label: "Home", to: "/" }, { label: "Admin" }, { label: "Features" }]}
    >
      <h2 className="text-2xl font-bold text-portal-navy mb-6">Features overview</h2>

      <div className="bg-portal-panel border border-portal-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-portal-border bg-portal-surface">
          <div className="w-9 h-9 rounded-md bg-portal-panel border border-portal-border flex items-center justify-center text-portal-navy">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-portal-navy">Feature subscriptions</h3>
        </div>

        {loading ? (
          <div className="p-8 text-portal-muted">Loading…</div>
        ) : (
          <div className="p-6 space-y-6">
            {grouped.map(({ category, items }) => (
              <section
                key={category}
                className="border border-portal-border rounded-lg overflow-hidden"
              >
                <header className="px-6 py-4">
                  <h4 className="text-base font-bold text-portal-text">{category}</h4>
                  <p className="text-sm text-portal-muted">
                    Select the features you&rsquo;d like to include in this configuration.
                  </p>
                </header>
                <table className="w-full text-sm">
                  <thead className="bg-portal-surface">
                    <tr className="text-left text-portal-muted">
                      <th className="px-6 py-3 font-semibold">Feature</th>
                      <th className="px-6 py-3 font-semibold">Start</th>
                      <th className="px-6 py-3 font-semibold">End</th>
                      <th className="px-6 py-3 font-semibold">Last edit</th>
                      <th className="px-6 py-3 font-semibold">State</th>
                      <th className="px-6 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((f) => (
                      <tr
                        key={f.id}
                        className="border-t border-portal-border hover:bg-portal-surface/40"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-portal-navy">{f.name}</span>
                            {f.description && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-3.5 h-3.5 text-portal-muted" />
                                  </TooltipTrigger>
                                  <TooltipContent>{f.description}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-portal-text">
                          {f.start_at ? formatDate(f.start_at) : "--"}
                        </td>
                        <td className="px-6 py-4 text-portal-text">
                          {f.end_at ? (
                            <span className="inline-flex items-center gap-2">
                              {formatDate(f.end_at)}
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
                                Ended
                              </span>
                            </span>
                          ) : f.start_at ? (
                            "Never"
                          ) : (
                            "--"
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-8 h-8 rounded-full bg-portal-navy text-portal-navy-foreground flex items-center justify-center text-xs font-semibold">
                            {initialsFromEmail(user?.email)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {f.state === "active" ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active-fg))]">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[hsl(var(--status-inactive-bg))] text-[hsl(var(--status-inactive-fg))]">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-portal-muted hover:bg-portal-surface disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!isFloowStaff}
                              title={
                                isFloowStaff
                                  ? "Actions"
                                  : "Only Floow staff can change features"
                              }
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {f.state === "inactive" ? (
                                <DropdownMenuItem onClick={() => toggle(f, "active")}>
                                  Activate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => toggle(f, "inactive")}>
                                  Deactivate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}
          </div>
        )}
      </div>

      {!isFloowStaff && (
        <p className="text-sm text-portal-muted mt-4">
          You can view features, but only Floow staff can activate or deactivate them.
        </p>
      )}
    </AdminLayout>
  );
};

export default FeaturesPage;