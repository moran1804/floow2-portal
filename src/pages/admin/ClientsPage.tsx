import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomer } from "@/contexts/CustomerContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, ArchiveRestore, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Users } from "lucide-react";
import PortalPanel from "@/components/admin/PortalPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Client = {
  id: string;
  name: string;
  code: string;
  archived_at: string | null;
};

const ClientsPage = () => {
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { setSelectedCustomerId } = useCustomer();

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

  const addClient = useMutation({
    mutationFn: async ({ name, code }: { name: string; code: string }) => {
      const { error } = await supabase
        .from("customers")
        .insert({ name, code });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients-all"] });
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Client added");
      setAddOpen(false);
      setNewName("");
      setNewSlug("");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to add client"),
  });

  const active = clients.filter((c) => !c.archived_at);
  const archived = clients.filter((c) => c.archived_at);
  const rows = tab === "active" ? active : archived;

  return (
    <AdminLayout title="Clients" crumbs={[{ label: "Clients" }]}>
      <PortalPanel
        icon={Users}
        title="All clients"
        rightContent={
          <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={() => setAddOpen(true)}>
            <Plus className="w-3 h-3 mr-1" />
            Add client
          </Button>
        }
      >
        <div className="flex items-center justify-between pb-4">
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

        <div>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-4 py-3 text-sm font-semibold border-b border-portal-border">
            <div>Client ID</div>
            <div>Name</div>
            <div className="w-32 text-right flex items-center justify-end gap-2">
              Actions
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setAddOpen(true)}>
                <Plus className="w-3 h-3 mr-1" />
                Add client
              </Button>
            </div>
          </div>
          {rows.length === 0 ? (
            <div className="px-4 py-8 text-sm text-portal-muted text-center">
              No {tab} clients.
            </div>
          ) : (
            rows.map((c, i) => (
              <div
                key={c.id}
                onClick={() => {
                  if (!c.archived_at) {
                    setSelectedCustomerId(c.id);
                    navigate("/admin/overview");
                  }
                }}
                className={`grid grid-cols-[1fr_1fr_auto] gap-4 items-center px-4 py-4 text-sm cursor-pointer hover:bg-portal-accent/30 transition-colors ${
                  i % 2 === 0 ? "bg-portal-surface" : ""
                } ${c.archived_at ? "cursor-default hover:bg-transparent opacity-70" : ""}`}
              >
                <div className="font-mono text-xs">{c.id}</div>
                <div className="font-semibold">{c.name}</div>
                <div className="w-32 text-right">
                  {c.archived_at ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setArchived.mutate({ id: c.id, archived: false });
                      }}
                    >
                      <ArchiveRestore className="w-4 h-4 mr-1" />
                      Restore
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a client</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = newName.trim();
              const code = newSlug.trim();
              if (!name || !code) {
                toast.error("Client name and URL slug are required");
                return;
              }
              addClient.mutate({ name, code });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                placeholder="Add Client Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-slug">URL slug</Label>
              <Input
                id="client-slug"
                value={newSlug}
                onChange={(e) =>
                  setNewSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]+/g, "-")
                      .replace(/-+/g, "-")
                  )
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addClient.isPending}>
                {addClient.isPending ? "Submitting…" : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ClientsPage;