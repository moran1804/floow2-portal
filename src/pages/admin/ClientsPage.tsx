import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, ArchiveRestore } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import PortalPanel from "@/components/admin/PortalPanel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Client = {
  id: string;
  name: string;
  code: string;
  archived_at: string | null;
};

const ClientsPage = () => {
  const [tab, setTab] = useState<"active" | "archived">("active");
  const qc = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, code, archived_at")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Client[];
    },
  });

  const setArchived = useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { error } = await supabase
        .from("customers")
        .update({ archived_at: archived ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["clients-all"] });
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success(vars.archived ? "Client archived" : "Client restored");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to update client"),
  });

  const active = clients.filter((c) => !c.archived_at);
  const archived = clients.filter((c) => c.archived_at);
  const rows = tab === "active" ? active : archived;

  return (
    <AdminLayout title="Clients" crumbs={[{ label: "Clients" }]}>
      <PortalPanel>
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="font-semibold">
            {isLoading ? "Loading…" : `${rows.length} results found`}
          </div>
          <div className="inline-flex rounded-md border border-portal-border overflow-hidden">
            <button
              onClick={() => setTab("active")}
              className={`px-4 py-2 text-sm ${
                tab === "active"
                  ? "bg-portal-navy text-portal-navy-foreground"
                  : "bg-portal-panel text-portal-text"
              }`}
            >
              Active ({active.length})
            </button>
            <button
              onClick={() => setTab("archived")}
              className={`px-4 py-2 text-sm border-l border-portal-border ${
                tab === "archived"
                  ? "bg-portal-navy text-portal-navy-foreground"
                  : "bg-portal-panel text-portal-text"
              }`}
            >
              Archived ({archived.length})
            </button>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-4 py-3 text-sm font-semibold border-b border-portal-border">
            <div>Client ID</div>
            <div>Name</div>
            <div className="w-32 text-right">Actions</div>
          </div>
          {rows.length === 0 ? (
            <div className="px-4 py-8 text-sm text-portal-muted text-center">
              No {tab} clients.
            </div>
          ) : (
            rows.map((c, i) => (
              <div
                key={c.id}
                className={`grid grid-cols-[1fr_1fr_auto] gap-4 items-center px-4 py-4 text-sm ${
                  i % 2 === 0 ? "bg-portal-surface" : ""
                }`}
              >
                <div className="font-mono text-xs">{c.id}</div>
                <div className="font-semibold">{c.name}</div>
                <div className="w-32 text-right">
                  {c.archived_at ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setArchived.mutate({ id: c.id, archived: false })
                      }
                    >
                      <ArchiveRestore className="w-4 h-4 mr-1" />
                      Restore
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Archive client "${c.name}"?`)) {
                          setArchived.mutate({ id: c.id, archived: true });
                        }
                      }}
                    >
                      <Archive className="w-4 h-4 mr-1" />
                      Archive
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PortalPanel>
    </AdminLayout>
  );
};

export default ClientsPage;