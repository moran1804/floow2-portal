import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/contexts/CustomerContext";
import { formatAcceptedAt, scopeAcceptanceRows, type AcceptanceRow, type RawAcceptanceRow } from "@/lib/userTermsAcceptance";
const PAGE_SIZES = ["10", "25", "50", "100"];

function PaginationBar({
  from,
  to,
  total,
  pageSize,
  onPageSizeChange,
}: {
  from: number;
  to: number;
  total: number;
  pageSize: string;
  onPageSizeChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-3 text-sm">
      <span className="text-portal-muted">Items per page:</span>
      <Select value={pageSize} onValueChange={onPageSizeChange}>
        <SelectTrigger className="h-9 w-24" aria-label="Items per page">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZES.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-portal-muted">
        {total ? `${from} - ${to} of ${total} items` : "0 of 0 items"}
      </span>
    </div>
  );
}

export default function UserTermsAcceptanceSection({ userId }: { userId?: string }) {
  const { selectedCustomerId } = useCustomer();
  const [pageSize, setPageSize] = useState("100");
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-terms-acceptances", selectedCustomerId, userId],
    enabled: Boolean(selectedCustomerId && userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("terms_acceptances")
        .select("id, accepted_at, terms_versions(version, customer_id, products(code))")
        .eq("user_id", userId ?? "")
        .order("accepted_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as RawAcceptanceRow[];
    },
  });

  const scoped = useMemo(
    () => scopeAcceptanceRows(data ?? [], selectedCustomerId),
    [data, selectedCustomerId],
  );

  const limit = Number(pageSize);
  const total = scoped.length;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, pageCount - 1);
  const from = total ? currentPage * limit + 1 : 0;
  const to = Math.min(total, (currentPage + 1) * limit);
  const rows = useMemo<AcceptanceRow[]>(
    () => scoped.slice(currentPage * limit, currentPage * limit + limit),
    [scoped, currentPage, limit],
  );

  const handlePageSize = (value: string) => {
    setPageSize(value);
    setPage(0);
  };

  return (
    <section className="overflow-hidden rounded-md border border-portal-border bg-portal-panel shadow-sm">
      <div className="border-b border-portal-border">
        <PaginationBar from={from} to={to} total={total} pageSize={pageSize} onPageSizeChange={handlePageSize} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-portal-panel-header">
            <tr>
              <th className="w-[36%] px-6 py-3 font-semibold text-portal-muted">Product code</th>
              <th className="w-[32%] py-3 font-semibold text-portal-muted">Version</th>
              <th className="py-3 font-semibold text-portal-muted">Accepted At</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-portal-muted" role="status">
                  Loading acceptances…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-portal-muted" role="alert">
                  Unable to load acceptances for this user.
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-portal-border first:border-t-0">
                  <td className="px-6 py-4">{row.product_code}</td>
                  <td className="py-4 font-semibold text-portal-navy">{row.version}</td>
                  <td className="py-4">{formatAcceptedAt(row.accepted_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-6 text-center text-portal-muted">
                  No acceptances found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-portal-border">
        <PaginationBar from={from} to={to} total={total} pageSize={pageSize} onPageSizeChange={handlePageSize} />
      </div>
    </section>
  );
}
