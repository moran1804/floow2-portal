import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Tag, MoreHorizontal, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import PortalPanel from "@/components/admin/PortalPanel";
import { Button } from "@/components/ui/button";
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
};

const ProductsPage = () => {
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, code, name")
        .order("code", { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });

  const total = products.length;
  const start = (page - 1) * perPage;
  const end = Math.min(start + perPage, total);
  const visible = useMemo(() => products.slice(start, end), [products, start, end]);
  const rangeLabel = total === 0 ? "0 items" : `${start + 1} - ${end} of ${total} items`;

  const Pager = () => (
    <div className="flex items-center gap-4 px-4 py-3">
      <label className="text-sm text-portal-text">Items per page:</label>
      <select
        className="text-sm border border-portal-border rounded px-2 py-1 bg-portal-panel"
        value={perPage}
        onChange={(e) => {
          setPerPage(Number(e.target.value));
          setPage(1);
        }}
      >
        {[10, 25, 50, 100].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <span className="text-sm text-portal-text">{rangeLabel}</span>
    </div>
  );

  return (
    <AdminLayout
      title="Products"
      crumbs={[
        { label: "Home", to: "/" },
        { label: "Admin" },
        { label: "Products" },
      ]}
    >
      <PortalPanel
        icon={Tag}
        title="Your products"
      >
        <div className="flex justify-end mb-4">
          <Button asChild variant="outline">
            <Link to="/admin/products/add">Add Product +</Link>
          </Button>
        </div>

        <div className="border border-portal-border rounded-md overflow-hidden">
          <Pager />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-portal-panel-header text-portal-navy">
                  <th className="px-4 py-3 font-semibold">Product code</th>
                  <th className="px-4 py-3 font-semibold">Product name</th>
                  <th className="px-4 py-3 font-semibold w-12"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-portal-muted">
                      Loading…
                    </td>
                  </tr>
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-portal-muted">
                      No products yet.
                    </td>
                  </tr>
                ) : (
                  visible.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-portal-border hover:bg-portal-surface/50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/products/${p.id}`}
                          className="text-portal-accent underline underline-offset-2"
                        >
                          {p.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-portal-text">{p.name}</td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/products/${p.id}`}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pager />
        </div>
      </PortalPanel>
    </AdminLayout>
  );
};

export default ProductsPage;
