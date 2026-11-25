import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import UserScoreTile from "@/components/admin/UserScoreTile";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/contexts/CustomerContext";
import { averageScores, sampleDriverScores } from "@/lib/sampleScores";

function DetailRows({ rows }: { rows: [string, string][] }) {
  return <dl className="space-y-4 text-xs">{rows.map(([l, v]) => <div key={l} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3"><dt className="text-portal-muted">{l}</dt><dd className="break-words text-right font-semibold">{v}</dd></div>)}</dl>;
}

export default function PolicyOverviewPage() {
  const { policyId = "" } = useParams();
  const { selectedCustomerId, selectedCustomer } = useCustomer();
  const { data: drivers = [], isLoading, error } = useQuery({
    queryKey: ["policy-drivers", selectedCustomerId, policyId],
    enabled: Boolean(selectedCustomerId && policyId),
    queryFn: async () => {
      const { data, error } = await supabase.from("insurer_users").select("*, products(code)")
        .eq("customer_id", selectedCustomerId ?? "").eq("policy_client_id", policyId).order("first_name");
      if (error) throw error;
      return data;
    },
  });
  const scored = drivers.map((d) => ({ d, s: sampleDriverScores(d.id) }));
  const policy = averageScores(scored.map((x) => x.s));
  const products = [...new Set(drivers.map((d) => d.products?.code).filter(Boolean))].join(", ") || "Not assigned";

  return <AdminLayout title="Policy overview" subtitle={`Policy Client ID: ${policyId}`} crumbs={[{ label: "Search", to: "/admin/insurer/search" }, { label: selectedCustomer?.name ?? "Client" }, { label: policyId }]}>
    <div className="mx-auto max-w-6xl space-y-7">
      {isLoading ? <p role="status">Loading policy…</p> : error ? <p role="alert">Unable to load this policy. Please try again.</p> : !drivers.length ? <p role="status">No drivers were found on this policy in the selected client.</p> : <>
        <section><h2 className="mb-4 text-2xl font-semibold text-portal-navy">Policy Details</h2>
          <div className="grid gap-5 rounded-md border border-portal-border bg-portal-panel p-5 sm:grid-cols-2">
            <DetailRows rows={[["Policy Client ID", policyId], ["Product code", products]]} />
            <div className="sm:border-l sm:border-portal-border sm:pl-5"><DetailRows rows={[["Drivers on policy", String(drivers.length)], ["Postal code", drivers[0].postal_code ?? "—"]]} /></div>
          </div>
        </section>
        {policy && <section><h2 className="mb-4 text-2xl font-semibold text-portal-navy">Policy Scores</h2>
          <p className="mb-4 text-xs text-portal-muted">Example scores only · Policy score is the average of its drivers. No live scoring data is connected.</p>
          <div className="grid gap-2 bg-portal-panel p-4 sm:p-5 xl:grid-cols-[190px_minmax(0,1fr)]">
            <div className="flex items-center justify-center bg-score-surface p-5"><div className="w-full max-w-[160px]"><UserScoreTile name="Policy score" score={policy.overall} overall /></div></div>
            <div className="min-w-0 bg-score-surface p-4 sm:p-6"><h3 className="mb-5 mt-2 text-xl font-semibold">Policy Score Influences</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{policy.influences.map((i) => <UserScoreTile key={i.name} {...i} />)}</div></div>
          </div>
        </section>}
        <section><h2 className="mb-4 text-2xl font-semibold text-portal-navy">Drivers</h2>
          <div className="space-y-4">{scored.map(({ d, s }) => <article key={d.id} className="rounded-md border border-portal-border bg-portal-panel p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div><h3 className="text-lg font-semibold text-portal-navy">{d.display_name}</h3><p className="text-xs text-portal-muted">{d.email}</p></div>
              <Button asChild size="sm"><Link to={`/admin/insurer/users/${d.id}`}>View driver<ChevronRight /></Link></Button>
            </div>
            <div className="grid gap-2 xl:grid-cols-[160px_minmax(0,1fr)]">
              <div className="flex items-center justify-center bg-score-surface p-4"><div className="w-full max-w-[130px]"><UserScoreTile name="Driver score" score={s.overall} overall /></div></div>
              <div className="grid grid-cols-2 gap-3 bg-score-surface p-4 sm:grid-cols-3 lg:grid-cols-5">{s.influences.map((i) => <UserScoreTile key={i.name} {...i} />)}</div>
            </div>
          </article>)}</div>
        </section>
      </>}
    </div>
  </AdminLayout>;
}
