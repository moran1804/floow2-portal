import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileText, Plus, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import PortalPanel from "@/components/admin/PortalPanel";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useState } from "react";
import AcceptanceStats from "@/components/admin/AcceptanceStats";

const TermsListPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["terms_versions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("terms_versions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const publishNow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("publish_terms_now", { _id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Published");
      qc.invalidateQueries({ queryKey: ["terms_versions"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const cancelSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("terms_versions")
        .update({ state: "draft", scheduled_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Schedule cancelled");
      qc.invalidateQueries({ queryKey: ["terms_versions"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("terms_versions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["terms_versions"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const [confirmPublishId, setConfirmPublishId] = useState<string | null>(null);

  const activeVersion = rows.find((r) => r.state === "active");

  return (
    <AdminLayout
      title="Terms & Conditions"
      crumbs={[
        { label: "Home", to: "/" },
        { label: "Admin" },
        { label: "Terms & Conditions" },
      ]}
      actions={
        <Button onClick={() => navigate("/admin/terms/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          New version
        </Button>
      }
    >
      {activeVersion && (
        <div className="mb-6">
          <AcceptanceStats
            termsId={activeVersion.id}
            version={activeVersion.version}
          />
        </div>
      )}
      <PortalPanel icon={FileText} title="T&Cs versions">
        <p className="text-sm text-portal-muted mb-6">
          Only one version can be active at any time. Older versions remain
          available for reference.
        </p>
        {isLoading ? (
          <div className="text-portal-muted py-8 text-center">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-portal-border rounded-md">
            <FileText className="w-10 h-10 mx-auto text-portal-muted mb-3" />
            <h3 className="font-semibold text-portal-navy">No T&Cs yet</h3>
            <p className="text-sm text-portal-muted mt-1">
              Create your first version to get started.
            </p>
            <Button
              className="mt-4 gap-2"
              onClick={() => navigate("/admin/terms/new")}
            >
              <Plus className="w-4 h-4" /> New version
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-portal-panel-header text-portal-navy">
                  <th className="px-4 py-3 font-semibold">Version</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Scheduled / Live since</th>
                  <th className="px-4 py-3 font-semibold">State</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-portal-border hover:bg-portal-surface/50"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/admin/terms/${r.id}`)}
                        className="font-bold text-portal-navy hover:text-portal-accent"
                      >
                        {r.version}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-portal-text">{r.title}</td>
                    <td className="px-4 py-3 text-portal-muted">
                      {r.state === "scheduled" && r.scheduled_at
                        ? format(new Date(r.scheduled_at), "d MMM yyyy, HH:mm")
                        : r.published_at
                        ? format(new Date(r.published_at), "d MMM yyyy, HH:mm")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge state={r.state} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/terms/${r.id}`)}>
                            {r.state === "draft" || r.state === "scheduled" ? "Edit" : "View"}
                          </DropdownMenuItem>
                          {(r.state === "draft" || r.state === "scheduled") && (
                            <DropdownMenuItem
                              onClick={() => setConfirmPublishId(r.id)}
                            >
                              Publish now
                            </DropdownMenuItem>
                          )}
                          {r.state === "scheduled" && (
                            <DropdownMenuItem onClick={() => cancelSchedule.mutate(r.id)}>
                              Cancel schedule
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {r.state !== "active" && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                if (confirm(`Delete ${r.version}?`)) remove.mutate(r.id);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PortalPanel>

      <AlertDialog
        open={!!confirmPublishId}
        onOpenChange={(o) => !o && setConfirmPublishId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish immediately?</AlertDialogTitle>
            <AlertDialogDescription>
              This version will become the live T&Cs for the mobile app and the
              currently active version will be moved to inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmPublishId) publishNow.mutate(confirmPublishId);
                setConfirmPublishId(null);
              }}
            >
              Publish now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default TermsListPage;