import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Eye, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import PortalPanel from "@/components/admin/PortalPanel";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import AcceptanceStats from "@/components/admin/AcceptanceStats";

const TermsEditorPage = () => {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [productId, setProductId] = useState<string>(
    () => searchParams.get("product") ?? ""
  );

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(id ?? null);

  const { data: existing } = useQuery({
    queryKey: ["terms_versions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("terms_versions")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, code, name, is_active")
        .order("code", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Redirect back to the list if a new version is opened without a product context
  useEffect(() => {
    if (isNew && !productId) {
      navigate("/admin/terms", { replace: true });
    }
  }, [isNew, productId, navigate]);

  const selectedProduct = products.find((p) => p.id === productId);

  useEffect(() => {
    if (existing) {
      setVersion(existing.version);
      setTitle(existing.title);
      setContentHtml(existing.content_html);
      setSavedId(existing.id);
      setProductId(existing.product_id);
    }
  }, [existing]);

  const validate = async () => {
    if (!version.trim()) return "Version is required";
    if (!title.trim()) return "Title is required";
    if (!productId) return "Product is required";

    const { data: duplicateVersion, error: duplicateVersionError } = await supabase
      .from("terms_versions")
      .select("id")
      .eq("product_id", productId)
      .eq("version", version.trim())
      .neq("id", savedId ?? "00000000-0000-0000-0000-000000000000")
      .maybeSingle();
    if (duplicateVersionError) throw duplicateVersionError;
    if (duplicateVersion) return "This product already has a T&C with that version number";

    const { data: duplicateTitle, error: duplicateTitleError } = await supabase
      .from("terms_versions")
      .select("id")
      .eq("product_id", productId)
      .eq("title", title.trim())
      .neq("id", savedId ?? "00000000-0000-0000-0000-000000000000")
      .maybeSingle();
    if (duplicateTitleError) throw duplicateTitleError;
    if (duplicateTitle) return "This product already has a T&C with that internal title";

    return null;
  };

  const saveDraft = useMutation({
    mutationFn: async () => {
      const err = await validate();
      if (err) throw new Error(err);
      const payload = {
        version: version.trim(),
        title: title.trim(),
        content_html: contentHtml,
        product_id: productId,
        updated_by: user?.id,
      };
      if (savedId) {
        const { data, error } = await supabase
          .from("terms_versions")
          .update(payload)
          .eq("id", savedId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("terms_versions")
          .insert({ ...payload, state: "draft" as const, created_by: user?.id })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (row) => {
      setSavedId(row.id);
      qc.invalidateQueries({ queryKey: ["terms_versions"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const publishNow = useMutation({
    mutationFn: async () => {
      const saved = await saveDraft.mutateAsync();
      const { error } = await supabase.rpc("publish_terms_now", { _id: saved.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Published");
      qc.invalidateQueries({ queryKey: ["terms_versions"] });
      navigate("/admin/terms");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const schedule = useMutation({
    mutationFn: async () => {
      if (!scheduleAt) throw new Error("Choose a date and time");
      const when = new Date(scheduleAt);
      if (when.getTime() <= Date.now())
        throw new Error("Scheduled time must be in the future");
      const saved = await saveDraft.mutateAsync();
      const { error } = await supabase.rpc("schedule_terms", {
        _id: saved.id,
        _scheduled_at: when.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Scheduled");
      qc.invalidateQueries({ queryKey: ["terms_versions"] });
      navigate("/admin/terms");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const isReadOnly =
    existing?.state === "active" ||
    existing?.state === "inactive" ||
    existing?.state === "archived";

  return (
    <AdminLayout
      title={isNew ? "New T&Cs version" : `Edit ${existing?.version ?? ""}`}
      crumbs={[
        { label: "Home", to: "/" },
        { label: "Admin" },
        { label: "Terms & Conditions", to: "/admin/terms" },
        { label: isNew ? "New version" : "Edit" },
      ]}
      actions={
        <Button variant="outline" onClick={() => navigate("/admin/terms")}>
          Cancel
        </Button>
      }
    >
      <div className="space-y-6 pb-28">
        {existing?.state === "active" && (
          <AcceptanceStats termsId={existing.id} version={existing.version} />
        )}
        <PortalPanel icon={FileText} title="Details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Product</Label>
              <div className="h-10 px-3 flex items-center rounded-md border border-portal-border bg-portal-surface text-sm text-portal-navy">
                {selectedProduct ? (
                  <>
                    <span className="font-mono text-xs font-bold bg-portal-panel px-2 py-1 rounded mr-2">
                      {selectedProduct.code}
                    </span>
                    {selectedProduct.name}
                  </>
                ) : (
                  <span className="text-portal-muted">—</span>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="version">Version *</Label>
              <Input
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v2.1"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="title">Internal title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Spring 2026 update"
                disabled={isReadOnly}
              />
            </div>
          </div>
        </PortalPanel>

        <PortalPanel icon={Pencil} title="Content">
          <Tabs defaultValue="edit">
            <TabsList>
              <TabsTrigger value="edit">
                <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="w-3.5 h-3.5 mr-1" /> Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-4">
              {isReadOnly ? (
                <div
                  className="prose prose-sm max-w-none p-6 border border-portal-border rounded-md bg-portal-panel"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : (
                <RichTextEditor value={contentHtml} onChange={setContentHtml} />
              )}
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <div className="flex justify-center bg-portal-surface p-6 rounded-md border border-portal-border">
                <div className="w-full max-w-[420px] bg-portal-panel border border-portal-border rounded-2xl shadow-sm p-6">
                  <div className="text-xs text-portal-muted mb-2">
                    Mobile app preview
                  </div>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: contentHtml || "<p><em>Nothing to preview yet.</em></p>" }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </PortalPanel>
      </div>

      {!isReadOnly && (
        <div className="fixed bottom-0 left-64 right-0 bg-portal-panel border-t border-portal-border px-8 py-4 flex items-center justify-end gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await saveDraft.mutateAsync();
                toast.success("Saved as draft");
                navigate("/admin/terms");
              } catch {
                /* error toast handled in mutation */
              }
            }}
            disabled={saveDraft.isPending}
          >
            Save as draft
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const err = validate();
              if (err) return toast.error(err);
              setScheduleOpen(true);
            }}
          >
            Schedule publish…
          </Button>
          <Button
            onClick={() => {
              const err = validate();
              if (err) return toast.error(err);
              setConfirmPublish(true);
            }}
          >
            Publish immediately
          </Button>
        </div>
      )}

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule publish</DialogTitle>
            <DialogDescription>
              Pick when this version should go live. The currently active T&Cs
              will be moved to inactive automatically at that moment.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="scheduleAt">Go-live date &amp; time</Label>
            <Input
              id="scheduleAt"
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                schedule.mutate();
                setScheduleOpen(false);
              }}
              disabled={schedule.isPending}
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmPublish} onOpenChange={setConfirmPublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish immediately?</AlertDialogTitle>
            <AlertDialogDescription>
              This version will become live in the mobile app right away. The
              currently active version will be moved to inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => publishNow.mutate()}>
              Publish now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default TermsEditorPage;