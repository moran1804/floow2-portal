import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, TrendingUp, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import PortalPanel from "./PortalPanel";

interface AcceptanceStatsProps {
  termsId: string;
  version: string;
}

interface StatRow {
  total_acceptances: number;
  acceptances_last_24h: number;
  acceptances_last_7d: number;
  first_accepted_at: string | null;
  last_accepted_at: string | null;
}

const Stat = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  hint?: string;
}) => (
  <div className="flex items-start gap-3 p-4 rounded-md bg-portal-surface border border-portal-border">
    <div className="w-9 h-9 rounded-md bg-portal-panel border border-portal-border flex items-center justify-center text-portal-accent shrink-0">
      <Icon className="w-4 h-4" />
    </div>
    <div className="min-w-0">
      <div className="text-xs uppercase tracking-wide text-portal-muted font-semibold">
        {label}
      </div>
      <div className="text-2xl font-bold text-portal-navy leading-tight mt-0.5">
        {value}
      </div>
      {hint && (
        <div className="text-xs text-portal-muted mt-1 truncate">{hint}</div>
      )}
    </div>
  </div>
);

const AcceptanceStats = ({ termsId, version }: AcceptanceStatsProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["terms_acceptance_stats", termsId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("terms_acceptance_stats", {
        _id: termsId,
      });
      if (error) throw error;
      const row = (Array.isArray(data) ? data[0] : data) as StatRow | null;
      return row;
    },
  });

  return (
    <PortalPanel icon={CheckCircle2} title={`Acceptance stats — ${version}`}>
      <p className="text-sm text-portal-muted mb-4">
        Live counts of users who have accepted the active T&Cs in the mobile app.
      </p>
      {isLoading ? (
        <div className="text-portal-muted py-4 text-sm">Loading stats…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat
            icon={Users}
            label="Total acceptances"
            value={data?.total_acceptances ?? 0}
          />
          <Stat
            icon={TrendingUp}
            label="Last 24 hours"
            value={data?.acceptances_last_24h ?? 0}
          />
          <Stat
            icon={TrendingUp}
            label="Last 7 days"
            value={data?.acceptances_last_7d ?? 0}
          />
          <Stat
            icon={Clock}
            label="Most recent"
            value={
              data?.last_accepted_at
                ? formatDistanceToNow(new Date(data.last_accepted_at), {
                    addSuffix: true,
                  })
                : "—"
            }
            hint={
              data?.first_accepted_at
                ? `First: ${formatDistanceToNow(new Date(data.first_accepted_at), { addSuffix: true })}`
                : undefined
            }
          />
        </div>
      )}
    </PortalPanel>
  );
};

export default AcceptanceStats;