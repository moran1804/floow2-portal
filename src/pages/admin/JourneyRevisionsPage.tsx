import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useExampleJourneyTags } from "@/hooks/useExampleJourneyTags";
import { compareJourneyRevisions, sampleJourneyRevisions, type RevisionComparisonRow } from "@/lib/journeyRevisions";

function ComparisonSide({ row, side, lineNumber }: { row: RevisionComparisonRow; side: "before" | "after"; lineNumber: number }) {
  const changed = row.changed;
  return (
    <div className={`flex min-w-0 gap-3 px-3 py-1.5 font-mono text-xs leading-5 ${changed ? side === "before" ? "bg-destructive/10 text-destructive" : "bg-score-good/10 text-portal-text" : "bg-background text-portal-text"}`}>
      <span className="w-6 shrink-0 select-none text-right text-portal-muted">{lineNumber}</span>
      <span className="w-3 shrink-0 select-none">{changed ? side === "before" ? "−" : "+" : ""}</span>
      <code className="min-w-0 whitespace-pre-wrap break-all">
        <span className="text-portal-navy">"{row.key}"</span>: {row[side]}
      </code>
    </div>
  );
}

export default function JourneyRevisionsPage() {
  const { userId, journeyId } = useParams();
  const { journeys } = useExampleJourneyTags(userId);
  const journey = journeys.find((item) => item.id === journeyId);
  const revisions = useMemo(() => journey ? sampleJourneyRevisions(journey) : [], [journey]);
  const [selected, setSelected] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    setSelected([]);
    setComparing(false);
  }, [journeyId]);

  const base = `/admin/insurer/users/${userId}`;
  const detail = `${base}/journeys/${journeyId}`;
  const crumbs = [
    { label: "Search", to: "/admin/insurer/search" },
    { label: "Users" },
    { label: userId ?? "User", to: base },
    { label: "Journeys", to: `${base}/journeys` },
    { label: `Journey: ${journeyId}`, to: detail },
    { label: "Journey revisions" },
  ];

  if (!journey) {
    return <AdminLayout title="Journey revisions" subtitle={`Journey ID: ${journeyId ?? ""}`} crumbs={crumbs}><p role="status">This journey was not found.</p></AdminLayout>;
  }

  const visible = revisions.slice(0, perPage);
  const selectedRevisions = revisions
    .filter((revision) => selected.includes(revision.id))
    .sort((a, b) => a.modifiedAt.getTime() - b.modifiedAt.getTime());
  const before = selectedRevisions[0];
  const after = selectedRevisions[1];
  const comparison = before && after ? compareJourneyRevisions(before, after) : [];
  const rangeLabel = revisions.length ? `1 - ${visible.length} of ${revisions.length} items` : "0 items";

  const pager = (position: "top" | "bottom") => (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
      <label htmlFor={`revision-page-size-${position}`}>Items per page:</label>
      <select
        id={`revision-page-size-${position}`}
        className="rounded border border-portal-border bg-portal-panel px-2 py-1"
        value={perPage}
        onChange={(event) => setPerPage(Number(event.target.value))}
      >
        {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
      </select>
      <span className="border-l border-portal-border pl-4">{rangeLabel}</span>
    </div>
  );

  return (
    <AdminLayout title="Journey revisions" subtitle={`Journey ID: ${journey.id}`} crumbs={crumbs}>
      <div className="mx-auto max-w-6xl space-y-5">
        <p className="text-xs text-portal-muted">Example revisions only · No live journey revision history is connected for this user.</p>

        {comparing && before && after ? (
          <section aria-labelledby="revision-comparison-title" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="revision-comparison-title" className="text-2xl font-semibold text-portal-navy">Journey revision comparison</h2>
              <Button variant="outline" onClick={() => setComparing(false)}><ArrowLeft className="mr-2 h-4 w-4" />Back to revisions</Button>
            </div>
            <div className="overflow-hidden rounded-md border border-portal-border bg-portal-panel shadow-sm">
              <div className="grid grid-cols-2 gap-px border-b border-portal-border bg-portal-border text-xs">
                <div className="bg-portal-panel-header p-4"><p className="font-semibold text-portal-navy">{before.modifiedBy}</p><p className="mt-1 text-portal-muted">{format(before.modifiedAt, "do MMMM yyyy, HH:mm:ss")}</p></div>
                <div className="bg-portal-panel-header p-4"><p className="font-semibold text-portal-navy">{after.modifiedBy}</p><p className="mt-1 text-portal-muted">{format(after.modifiedAt, "do MMMM yyyy, HH:mm:ss")}</p></div>
              </div>
              <p className="border-b border-portal-border px-4 py-2 text-xs text-portal-muted">Removed values are shown in red; added or replacement values are shown in green.</p>
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  {comparison.map((row, index) => (
                    <div key={row.key} className="grid grid-cols-2 gap-px border-b border-portal-border/60 bg-portal-border/60 last:border-b-0">
                      <ComparisonSide row={row} side="before" lineNumber={index + 3} />
                      <ComparisonSide row={row} side="after" lineNumber={index + 3} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section aria-label="Journey revision history" className="overflow-hidden rounded-md border border-portal-border bg-portal-panel shadow-sm">
            {pager("top")}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-y border-portal-border">
                    <th className="w-32 px-2 py-3">
                      <Button size="sm" disabled={selected.length !== 2} onClick={() => setComparing(true)}>Compare</Button>
                    </th>
                    <th className="px-4 py-3 font-semibold text-portal-navy">Modified by</th>
                    <th className="px-4 py-3 font-semibold text-portal-navy">Modified at</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((revision, index) => {
                    const checked = selected.includes(revision.id);
                    return (
                      <tr key={revision.id} className={`border-b border-portal-border ${index % 2 === 0 ? "bg-portal-panel-header" : "bg-portal-panel"}`}>
                        <td className="px-6 py-5">
                          <Checkbox
                            aria-label={`Select ${revision.modifiedBy} revision`}
                            checked={checked}
                            disabled={selected.length === 2 && !checked}
                            onCheckedChange={(value) => setSelected((current) => value === true ? [...current, revision.id] : current.filter((id) => id !== revision.id))}
                          />
                        </td>
                        <td className="px-4 py-5">{revision.modifiedBy}</td>
                        <td className="px-4 py-5">{format(revision.modifiedAt, "do MMMM yyyy, HH:mm:ss")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {pager("bottom")}
          </section>
        )}
        {!comparing && <p className="text-xs text-portal-muted" aria-live="polite">Select two revisions to compare their values.</p>}
      </div>
    </AdminLayout>
  );
}
