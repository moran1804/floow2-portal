import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tag, Plus, MoreHorizontal, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import PortalPanel from "@/components/admin/PortalPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


type Product = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

type FormState = {
  id?: string;
  code: string;
  name: string;
  is_active: boolean;
};

const emptyForm: FormState = { code: "", name: "", is_active: true };

const ProductsPage = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("code", { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (f: FormState) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      const payload = {
        code: f.code.trim().toUpperCase(),
        name: f.name.trim(),
        is_active: f.is_active,
        updated_by: userId,
      };
      if (!payload.code) throw new Error("Product code is required");
      if (!payload.name) throw new Error("Product name is required");
      if (f.id) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert({ ...payload, created_by: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setOpen(false);
      setForm(emptyForm);
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => {},
  });

  const togglePublish = useMutation({
    mutationFn: async (p: Product) => {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !p.is_active })
        .eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
    onError: () => {},
  });

  const openCreate = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      code: p.code,
      name: p.name,
      is_active: p.is_active,
    });
    setOpen(true);
  };

  return (
    <AdminLayout
      title="Products"
      crumbs={[
        { label: "Home", to: "/" },
        { label: "Admin" },
        { label: "Products" },
      ]}
      actions={
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          New product
        </Button>
      }
    >
      <PortalPanel icon={Tag} title="Products">
        <p className="text-sm text-portal-muted mb-6">
          Each product can have its own active T&Cs. Codes are short identifiers
          used by the mobile app (e.g. SAVINGS, LOANS).
        </p>
        {isLoading ? (
          <div className="text-portal-muted py-8 text-center">Loading…</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-portal-border rounded-md">
            <Tag className="w-10 h-10 mx-auto text-portal-muted mb-3" />
            <h3 className="font-semibold text-portal-navy">No products yet</h3>
            <p className="text-sm text-portal-muted mt-1">
              Create your first product to get started.
            </p>
            <Button className="mt-4 gap-2" onClick={openCreate}>
              <Plus className="w-4 h-4" /> New product
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-portal-panel-header text-portal-navy">
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-portal-border hover:bg-portal-surface/50"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-portal-navy">
                      {p.code}
                    </td>
                    <td className="px-4 py-3 text-portal-text">{p.name}</td>
                    <td className="px-4 py-3">
                      {p.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
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
                          <DropdownMenuItem onClick={() => openEdit(p)}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePublish.mutate(p)}>
                            {p.is_active ? "Mark inactive" : "Mark active"}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit product" : "New product"}</DialogTitle>
            <DialogDescription>
              Codes are uppercase identifiers and must be unique.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                placeholder="SAVINGS"
              />
            </div>
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Savings account"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => upsert.mutate(form)} disabled={upsert.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ProductsPage;
