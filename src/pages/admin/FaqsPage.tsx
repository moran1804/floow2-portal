import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HelpCircle, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import PortalPanel from "@/components/admin/PortalPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type FormState = {
  id?: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: boolean;
};

const emptyForm: FormState = {
  question: "",
  answer: "",
  category: "",
  sort_order: 0,
  is_published: true,
};

const FaqsPage = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Faq[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (f: FormState) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      const payload = {
        question: f.question.trim(),
        answer: f.answer.trim(),
        category: f.category.trim() || null,
        sort_order: Number(f.sort_order) || 0,
        is_published: f.is_published,
        updated_by: userId,
      };
      if (f.id) {
        const { error } = await supabase
          .from("faqs")
          .update(payload)
          .eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("faqs")
          .insert({ ...payload, created_by: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(form.id ? "FAQ updated" : "FAQ added");
      qc.invalidateQueries({ queryKey: ["faqs"] });
      setOpen(false);
      setForm(emptyForm);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from("faqs")
        .update({ is_published })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faqs"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("FAQ deleted");
      qc.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openNew = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (f: Faq) => {
    setForm({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category ?? "",
      sort_order: f.sort_order,
      is_published: f.is_published,
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    upsert.mutate(form);
  };

  return (
    <AdminLayout
      title="FAQs"
      crumbs={[
        { label: "Home", to: "/" },
        { label: "Admin" },
        { label: "FAQs" },
      ]}
      actions={
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          New FAQ
        </Button>
      }
    >
      <PortalPanel icon={HelpCircle} title="Frequently asked questions">
        <p className="text-sm text-portal-muted mb-6">
          Published FAQs are served to the mobile app via the public API. Drag
          ordering is via the sort number — lower numbers appear first.
        </p>

        {isLoading ? (
          <div className="text-portal-muted py-8 text-center">Loading…</div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-portal-border rounded-md">
            <HelpCircle className="w-10 h-10 mx-auto text-portal-muted mb-3" />
            <h3 className="font-semibold text-portal-navy">No FAQs yet</h3>
            <p className="text-sm text-portal-muted mt-1">
              Add your first question and answer to get started.
            </p>
            <Button className="mt-4 gap-2" onClick={openNew}>
              <Plus className="w-4 h-4" /> New FAQ
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-portal-panel-header text-portal-navy">
                  <th className="px-4 py-3 font-semibold w-16">Order</th>
                  <th className="px-4 py-3 font-semibold">Question</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">State</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((f) => (
                  <tr
                    key={f.id}
                    className="border-t border-portal-border hover:bg-portal-surface/50 align-top"
                  >
                    <td className="px-4 py-3 text-portal-muted">{f.sort_order}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEdit(f)}
                        className="font-semibold text-portal-navy hover:text-portal-accent text-left"
                      >
                        {f.question}
                      </button>
                      <p className="text-portal-muted mt-1 line-clamp-2">
                        {f.answer}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-portal-muted">
                      {f.category ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {f.is_published ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Hidden</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(f)}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              togglePublish.mutate({
                                id: f.id,
                                is_published: !f.is_published,
                              })
                            }
                          >
                            {f.is_published ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm(`Delete this FAQ?`)) remove.mutate(f.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit FAQ" : "New FAQ"}</DialogTitle>
            <DialogDescription>
              These are served live to the mobile app when published.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="e.g. How do I reset my password?"
              />
            </div>
            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="Plain text answer shown in the app"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category (optional)</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Account"
                />
              </div>
              <div>
                <Label htmlFor="sort">Sort order</Label>
                <Input
                  id="sort"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({ ...form, sort_order: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-portal-border p-3">
              <div>
                <Label htmlFor="published" className="font-semibold">
                  Published
                </Label>
                <p className="text-xs text-portal-muted">
                  When off, this FAQ is hidden from the mobile app.
                </p>
              </div>
              <Switch
                id="published"
                checked={form.is_published}
                onCheckedChange={(v) => setForm({ ...form, is_published: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={upsert.isPending}>
              {upsert.isPending ? "Saving…" : form.id ? "Save changes" : "Add FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default FaqsPage;