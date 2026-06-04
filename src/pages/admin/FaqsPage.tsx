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
  GripVertical,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import PortalPanel from "@/components/admin/PortalPanel";
import { useCustomer } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  const { selectedCustomerId } = useCustomer();
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
    queryKey: ["products", "all", selectedCustomerId],
    enabled: !!selectedCustomerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, code, name, is_active")
        .eq("customer_id", selectedCustomerId!)
        .order("code", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (products.length === 0) {
      if (productFilter) setProductFilter("");
      return;
    }
    const stillValid = products.some((p) => p.id === productFilter);
    if (!stillValid) {
      setProductFilter(products[0].id);
    }
  }, [products]);

  const { data: categories = [] } = useQuery({
    queryKey: ["faq_categories", selectedCustomerId, productFilter],
    enabled: !!productFilter && !!selectedCustomerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_categories")
        .select("id, name, sort_order, product_id")
        .eq("customer_id", selectedCustomerId!)
        .eq("product_id", productFilter)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["faqs", selectedCustomerId, productFilter],
    enabled: !!productFilter && !!selectedCustomerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("customer_id", selectedCustomerId!)
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
      if (!selectedCustomerId) throw new Error("No customer selected");
      const payload = {
        question: f.question.trim(),
        answer: f.answer.trim(),
        category_id: f.category_id,
        product_id: productFilter,
        customer_id: selectedCustomerId,
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
      qc.invalidateQueries({ queryKey: ["faqs", selectedCustomerId, productFilter] });
      setFaqOpen(false);
      setFaqForm(emptyFaq);
    },
    onError: () => {},
  });

  const removeFaq = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faqs", selectedCustomerId, productFilter] });
    },
    onError: () => {},
  });

  // -------- Category mutations --------
  const upsertCategory = useMutation({
    mutationFn: async (c: { id?: string; name: string; sort_order: number }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!selectedCustomerId) throw new Error("No customer selected");
      const payload = {
        name: c.name.trim(),
        sort_order: Number(c.sort_order) || 0,
        product_id: productFilter,
        customer_id: selectedCustomerId,
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
      qc.invalidateQueries({ queryKey: ["faq_categories", selectedCustomerId, productFilter] });
      setCatOpen(false);
      setCatForm({ name: "", sort_order: 0 });
    },
    onError: () => {},
  });

  const removeCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faq_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faq_categories", selectedCustomerId, productFilter] });
    },
    onError: () => {},
  });

  const reorderCategories = useMutation({
    mutationFn: async (ordered: Category[]) => {
      // Re-number with gaps of 10 so future single-row updates stay simple
      const updates = ordered.map((c, i) => ({ id: c.id, sort_order: (i + 1) * 10 }));
      // Run sequentially; small list so this is fine
      for (const u of updates) {
        const { error } = await supabase
          .from("faq_categories")
          .update({ sort_order: u.sort_order })
          .eq("id", u.id);
        if (error) throw error;
      }
    },
    onMutate: async (ordered) => {
      await qc.cancelQueries({ queryKey: ["faq_categories", selectedCustomerId, productFilter] });
      const previous = qc.getQueryData<Category[]>([
        "faq_categories",
        productFilter,
      ]);
      qc.setQueryData(
        ["faq_categories", selectedCustomerId, productFilter],
        ordered.map((c, i) => ({ ...c, sort_order: (i + 1) * 10 }))
      );
      return { previous };
    },
    onError: (_e: any, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(["faq_categories", selectedCustomerId, productFilter], ctx.previous);
      }
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: ["faq_categories", selectedCustomerId, productFilter] }),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(categories, oldIndex, newIndex);
    reorderCategories.mutate(reordered);
  };

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
      return;
    }
    if (!faqForm.category_id) {
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories
                .filter((c) => faqs.some((f) => f.category_id === c.id))
                .map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {categories
                  .map((c) => ({
                    category: c,
                    items: faqs.filter((f) => f.category_id === c.id),
                  }))
                  .filter(({ items }) => items.length > 0)
                  .map(({ category: c, items }) => (
                    <SortableCategoryCard
                      key={c.id}
                      category={c}
                      items={items}
                      isCollapsed={!!collapsed[c.id]}
                      onToggleCollapse={() => toggleCollapse(c.id)}
                      onAddFaq={() => openNewFaq(c.id)}
                      onEditCategory={() => openEditCategory(c)}
                      onDeleteCategory={() => {
                        if (
                          confirm(
                            `Delete category "${c.name}"? It must be empty first.`
                          )
                        )
                          removeCategory.mutate(c.id);
                      }}
                      onEditFaq={openEditFaq}
                      onDeleteFaq={(id) => {
                        if (confirm("Delete this FAQ?")) removeFaq.mutate(id);
                      }}
                    />
                  ))}
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
            </SortableContext>
          </DndContext>
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

// ----------------------------------------------------------------
// SortableCategoryCard — draggable category panel
// ----------------------------------------------------------------
type SortableCategoryCardProps = {
  category: Category;
  items: Faq[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddFaq: () => void;
  onEditCategory: () => void;
  onDeleteCategory: () => void;
  onEditFaq: (f: Faq) => void;
  onDeleteFaq: (id: string) => void;
};

const SortableCategoryCard = ({
  category: c,
  items,
  isCollapsed,
  onToggleCollapse,
  onAddFaq,
  onEditCategory,
  onDeleteCategory,
  onEditFaq,
  onDeleteFaq,
}: SortableCategoryCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: c.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-portal-border rounded-md bg-portal-panel overflow-hidden"
    >
      <div className="flex items-center justify-between px-2 py-3 bg-portal-panel-header">
        <div className="flex items-center gap-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="p-2 text-portal-muted hover:text-portal-navy cursor-grab active:cursor-grabbing touch-none"
            aria-label={`Drag ${c.name} to reorder`}
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <button
            className="flex items-center gap-2 text-portal-navy font-semibold min-w-0"
            onClick={onToggleCollapse}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 shrink-0" />
            )}
            <span className="truncate">{c.name}</span>
            <Badge variant="secondary" className="ml-1">
              {items.length}
            </Badge>
          </button>
        </div>
        <div className="flex items-center gap-1 pr-2">
          <Button variant="ghost" size="sm" onClick={onAddFaq} className="gap-1">
            <Plus className="w-4 h-4" /> Add FAQ
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEditCategory}>
                <Pencil className="w-4 h-4 mr-2" /> Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onDeleteCategory}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {!isCollapsed && (
        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-portal-muted text-xs uppercase">
                <th className="px-4 py-2 w-16">Order</th>
                <th className="px-4 py-2">Question</th>
                <th className="px-4 py-2 w-16 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr
                  key={f.id}
                  className="border-t border-portal-border hover:bg-portal-surface/50 align-top"
                >
                  <td className="px-4 py-3 text-portal-muted">{f.sort_order}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onEditFaq(f)}
                      className="font-semibold text-portal-navy hover:text-portal-accent text-left"
                    >
                      {f.question}
                    </button>
                    <p className="text-portal-muted mt-1 line-clamp-2">{f.answer}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditFaq(f)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDeleteFaq(f.id)}
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
    </div>
  );
};
