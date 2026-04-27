import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HelpCircle,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  FolderPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import PortalPanel from "@/components/admin/PortalPanel";
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

type Category = {
  id: string;
  name: string;
  sort_order: number;
  product_id: string;
};

type Faq = {
  id: string;
  question: string;
  answer: string;
  category_id: string;
  product_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type FaqFormState = {
  id?: string;
  question: string;
  answer: string;
  category_id: string;
  sort_order: number;
};

const emptyFaq: FaqFormState = {
  question: "",
  answer: "",
  category_id: "",
  sort_order: 0,
};

const FaqsPage = () => {
  const qc = useQueryClient();
  const [productFilter, setProductFilter] = useState<string>("");
  const [faqOpen, setFaqOpen] = useState(false);
  const [faqForm, setFaqForm] = useState<FaqFormState>(emptyFaq);
  const [catOpen, setCatOpen] = useState(false);
  const [catForm, setCatForm] = useState<{ id?: string; name: string; sort_order: number }>({
    name: "",
    sort_order: 0,
  });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    if (!productFilter && products.length > 0) {
      setProductFilter(products[0].id);
    }
  }, [products, productFilter]);

  const { data: categories = [] } = useQuery({
    queryKey: ["faq_categories", productFilter],
    enabled: !!productFilter,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_categories")
        .select("id, name, sort_order, product_id")
        .eq("product_id", productFilter)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["faqs", productFilter],
    enabled: !!productFilter,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("product_id", productFilter)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Faq[];
    },
  });

  // -------- FAQ mutations --------
  const upsertFaq = useMutation({
    mutationFn: async (f: FaqFormState) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!f.category_id) throw new Error("Category is required");
      const payload = {
        question: f.question.trim(),
        answer: f.answer.trim(),
        category_id: f.category_id,
        product_id: productFilter,
        sort_order: Number(f.sort_order) || 0,
        updated_by: userId,
      };
      if (f.id) {
        const { error } = await supabase.from("faqs").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("faqs")
          .insert({ ...payload, created_by: userId } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(faqForm.id ? "FAQ updated" : "FAQ added");
      qc.invalidateQueries({ queryKey: ["faqs", productFilter] });
      setFaqOpen(false);
      setFaqForm(emptyFaq);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeFaq = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("FAQ deleted");
      qc.invalidateQueries({ queryKey: ["faqs", productFilter] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // -------- Category mutations --------
  const upsertCategory = useMutation({
    mutationFn: async (c: { id?: string; name: string; sort_order: number }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      const payload = {
        name: c.name.trim(),
        sort_order: Number(c.sort_order) || 0,
        product_id: productFilter,
        updated_by: userId,
      };
      if (!payload.name) throw new Error("Name is required");
      if (c.id) {
        const { error } = await supabase
          .from("faq_categories")
          .update(payload)
          .eq("id", c.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("faq_categories")
          .insert({ ...payload, created_by: userId } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(catForm.id ? "Category updated" : "Category added");
      qc.invalidateQueries({ queryKey: ["faq_categories", productFilter] });
      setCatOpen(false);
      setCatForm({ name: "", sort_order: 0 });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faq_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category deleted");
      qc.invalidateQueries({ queryKey: ["faq_categories", productFilter] });
    },
    onError: (e: any) =>
      toast.error(
        e.message?.includes("foreign key")
          ? "Move or delete the FAQs in this category first."
          : e.message
      ),
  });

  const openNewFaq = (categoryId?: string) => {
    setFaqForm({ ...emptyFaq, category_id: categoryId ?? categories[0]?.id ?? "" });
    setFaqOpen(true);
  };

  const openEditFaq = (f: Faq) => {
    setFaqForm({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category_id: f.category_id,
      sort_order: f.sort_order,
    });
    setFaqOpen(true);
  };

  const openNewCategory = () => {
    setCatForm({ name: "", sort_order: (categories.at(-1)?.sort_order ?? 0) + 10 });
    setCatOpen(true);
  };

  const openEditCategory = (c: Category) => {
    setCatForm({ id: c.id, name: c.name, sort_order: c.sort_order });
    setCatOpen(true);
  };

  const handleFaqSubmit = () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    if (!faqForm.category_id) {
      toast.error("Please select a category");
      return;
    }
    upsertFaq.mutate(faqForm);
  };

  const toggleCollapse = (id: string) =>
    setCollapsed((s) => ({ ...s, [id]: !s[id] }));

  return (
    <AdminLayout
      title="FAQs"
      crumbs={[
        { label: "Home", to: "/" },
        { label: "Admin" },
        { label: "FAQs" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={openNewCategory} className="gap-2">
            <FolderPlus className="w-4 h-4" />
            New category
          </Button>
          <Button
            onClick={() => openNewFaq()}
            className="gap-2"
            disabled={categories.length === 0}
          >
            <Plus className="w-4 h-4" />
            New FAQ
          </Button>
        </div>
      }
    >
      <PortalPanel icon={HelpCircle} title="Frequently asked questions">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <p className="text-sm text-portal-muted">
            FAQs are grouped into categories per product. Lower sort numbers
            appear first.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-portal-muted">Product:</span>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-portal-muted py-8 text-center">Loading…</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-portal-border rounded-md">
            <FolderPlus className="w-10 h-10 mx-auto text-portal-muted mb-3" />
            <h3 className="font-semibold text-portal-navy">No categories yet</h3>
            <p className="text-sm text-portal-muted mt-1">
              Add a category before creating FAQs.
            </p>
            <Button className="mt-4 gap-2" onClick={openNewCategory}>
              <FolderPlus className="w-4 h-4" /> New category
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {categories
              .map((c) => ({
                category: c,
                items: faqs.filter((f) => f.category_id === c.id),
              }))
              .filter(({ items }) => items.length > 0)
              .map(({ category: c, items }) => {
                const isCollapsed = !!collapsed[c.id];
                return (
                <div
                  key={c.id}
                  className="border border-portal-border rounded-md bg-portal-panel overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-portal-panel-header">
                    <button
                      className="flex items-center gap-2 text-portal-navy font-semibold"
                      onClick={() => toggleCollapse(c.id)}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      {c.name}
                      <Badge variant="secondary" className="ml-1">
                        {items.length}
                      </Badge>
                    </button>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openNewFaq(c.id)}
                        className="gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add FAQ
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditCategory(c)}>
                            <Pencil className="w-4 h-4 mr-2" /> Rename / reorder
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete category "${c.name}"? It must be empty first.`
                                )
                              )
                                removeCategory.mutate(c.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete category
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {!isCollapsed && (
                    <div>
                      {items.length === 0 ? (
                        <div className="text-center py-8 text-sm text-portal-muted">
                          No FAQs in this category yet.
                        </div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-portal-muted text-xs uppercase">
                              <th className="px-4 py-2 w-16">Order</th>
                              <th className="px-4 py-2">Question</th>
                              <th className="px-4 py-2 w-32">State</th>
                              <th className="px-4 py-2 w-16 text-right"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((f) => (
                              <tr
                                key={f.id}
                                className="border-t border-portal-border hover:bg-portal-surface/50 align-top"
                              >
                                <td className="px-4 py-3 text-portal-muted">
                                  {f.sort_order}
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => openEditFaq(f)}
                                    className="font-semibold text-portal-navy hover:text-portal-accent text-left"
                                  >
                                    {f.question}
                                  </button>
                                  <p className="text-portal-muted mt-1 line-clamp-2">
                                    {f.answer}
                                  </p>
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
                                      <DropdownMenuItem onClick={() => openEditFaq(f)}>
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
                                          if (confirm(`Delete this FAQ?`))
                                            removeFaq.mutate(f.id);
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
                      )}
                    </div>
                  )}
                </div>
                );
              })}
            {categories.length > 0 &&
              faqs.length === 0 && (
                <div className="text-center py-12 border border-dashed border-portal-border rounded-md">
                  <HelpCircle className="w-10 h-10 mx-auto text-portal-muted mb-3" />
                  <h3 className="font-semibold text-portal-navy">No FAQs yet</h3>
                  <p className="text-sm text-portal-muted mt-1">
                    Add your first question to get started. Categories appear
                    here once they contain a question.
                  </p>
                  <Button className="mt-4 gap-2" onClick={() => openNewFaq()}>
                    <Plus className="w-4 h-4" /> New FAQ
                  </Button>
                </div>
              )}
          </div>
        )}
      </PortalPanel>

      {/* FAQ dialog */}
      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{faqForm.id ? "Edit FAQ" : "New FAQ"}</DialogTitle>
            <DialogDescription>
              These are served live to the mobile app when published.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={faqForm.category_id}
                onValueChange={(v) => setFaqForm({ ...faqForm, category_id: v })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={faqForm.question}
                onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                placeholder="e.g. How do I reset my password?"
              />
            </div>
            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={faqForm.answer}
                onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                placeholder="Plain text answer shown in the app"
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="sort">Sort order</Label>
              <Input
                id="sort"
                type="number"
                value={faqForm.sort_order}
                onChange={(e) =>
                  setFaqForm({ ...faqForm, sort_order: Number(e.target.value) })
                }
              />
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
                checked={faqForm.is_published}
                onCheckedChange={(v) => setFaqForm({ ...faqForm, is_published: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFaqOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFaqSubmit} disabled={upsertFaq.isPending}>
              {upsertFaq.isPending ? "Saving…" : faqForm.id ? "Save changes" : "Add FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category dialog */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {catForm.id ? "Edit category" : "New category"}
            </DialogTitle>
            <DialogDescription>
              Categories group FAQs for this product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="e.g. Trips & driving data"
              />
            </div>
            <div>
              <Label htmlFor="cat-sort">Sort order</Label>
              <Input
                id="cat-sort"
                type="number"
                value={catForm.sort_order}
                onChange={(e) =>
                  setCatForm({ ...catForm, sort_order: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => upsertCategory.mutate(catForm)}
              disabled={upsertCategory.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default FaqsPage;
