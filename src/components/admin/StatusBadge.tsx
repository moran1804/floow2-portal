import { Database } from "@/integrations/supabase/types";

type State = Database["public"]["Enums"]["terms_state"];

const styles: Record<State, { bg: string; fg: string; label: string }> = {
  active: {
    bg: "bg-[hsl(var(--status-active-bg))]",
    fg: "text-[hsl(var(--status-active-fg))]",
    label: "Active",
  },
  inactive: {
    bg: "bg-[hsl(var(--status-inactive-bg))]",
    fg: "text-[hsl(var(--status-inactive-fg))]",
    label: "Inactive",
  },
  scheduled: {
    bg: "bg-[hsl(var(--status-scheduled-bg))]",
    fg: "text-[hsl(var(--status-scheduled-fg))]",
    label: "Scheduled",
  },
  draft: {
    bg: "bg-[hsl(var(--status-draft-bg))]",
    fg: "text-[hsl(var(--status-draft-fg))]",
    label: "Draft",
  },
  archived: {
    bg: "bg-muted",
    fg: "text-muted-foreground",
    label: "Archived",
  },
};

const StatusBadge = ({ state }: { state: State }) => {
  const s = styles[state];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold ${s.bg} ${s.fg}`}
    >
      {s.label}
    </span>
  );
};

export default StatusBadge;