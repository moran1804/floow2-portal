import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRolePreview } from "@/contexts/RolePreviewContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ACTION_OPTIONS = [
  "createClient",
  "updateClientConfig",
  "deleteClient",
  "createProduct",
  "updateProduct",
  "deleteProduct",
  "activateFeature",
  "deactivateFeature",
  "publishTerms",
  "scheduleTerms",
  "archiveTerms",
  "createFaq",
  "updateFaq",
  "deleteFaq",
  "addStaff",
  "removeStaff",
  "updateRole",
  "login",
  "logout",
];

type AuditRow = {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  subjectType: string;
  subjectId: string;
  status: number;
};

const SAMPLE_ROWS: AuditRow[] = [
  {
    id: "1",
    timestamp: "4 Jun 2026 - 9.34am",
    action: "updateClientConfig",
    actor: "tester",
    subjectType: "client",
    subjectId: "db31aaa3-a8a2-4423-854c-5aaebc771464",
    status: 200,
  },
];

const formatDateInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AuditPage = () => {
  const { allows } = useRolePreview();
  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    d.setHours(0, 0, 0, 0);
    return formatDateInput(d);
  }, []);
  const defaultEnd = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 0, 0);
    return formatDateInput(d);
  }, []);

  const [selectedActions, setSelectedActions] = useState<string[]>([...ACTION_OPTIONS]);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actor, setActor] = useState("");
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [pageSize, setPageSize] = useState(50);
  const [rows] = useState<AuditRow[]>(SAMPLE_ROWS);

  const toggleAction = (a: string) =>
    setSelectedActions((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );

  const clearActions = () => setSelectedActions([]);

  const resetAll = () => {
    setSelectedActions([...ACTION_OPTIONS]);
    setActor("");
    setStart(defaultStart);
    setEnd(defaultEnd);
  };

  return (
    <AdminLayout
      title="Audit logs"
      crumbs={[{ label: "Home", to: "/" }, { label: "Admin" }, { label: "Audit" }]}
    >
      {/* Search panel */}
      <section className="bg-portal-panel border border-portal-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 text-portal-navy font-semibold mb-5">
          <Search className="w-4 h-4" />
          <span>Search options</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <label className="block text-sm font-semibold text-portal-navy mb-2">Actions</label>
            <button
              type="button"
              onClick={() => setActionsOpen((o) => !o)}
              className="w-full h-10 px-3 text-left text-sm bg-portal-panel border border-portal-border rounded-md flex items-center justify-between"
            >
              <span>{selectedActions.length} actions selected</span>
              <span className="text-portal-muted">▾</span>
            </button>
            {actionsOpen && (
              <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto bg-portal-panel border border-portal-border rounded-md shadow-lg">
                {ACTION_OPTIONS.map((a) => (
                  <label
                    key={a}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-portal-sidebar-active/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedActions.includes(a)}
                      onChange={() => toggleAction(a)}
                    />
                    {a}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-portal-navy mb-2">Actor</label>
            <Input
              placeholder="Any"
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-portal-navy mb-2">Start</label>
            <Input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-portal-navy mb-2">End</label>
            <Input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={clearActions}
          className="mt-3 text-sm text-portal-accent hover:underline"
        >
          Clear
        </button>

        <div className="mt-5 flex items-center gap-6">
          <Button className="bg-portal-navy hover:bg-portal-navy/90 text-portal-navy-foreground px-8">
            Search
          </Button>
          <button
            type="button"
            onClick={resetAll}
            className="text-sm text-portal-accent hover:underline"
          >
            Reset all
          </button>
        </div>
      </section>

      {/* Results */}
      <section className="bg-portal-panel border border-portal-border rounded-lg p-6">
        <div className="flex items-center gap-3 text-sm mb-4">
          <label htmlFor="pageSize" className="text-portal-text">
            Items per page:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-8 px-2 border border-portal-border rounded-md bg-portal-panel"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="ml-4 text-portal-muted">
            1 - {rows.length} of {rows.length} items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-portal-panel-header text-portal-navy text-left">
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Actor</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-portal-border align-top">
                  <td className="px-4 py-4">
                    {allows("audits/logs/read") ? <a href="#" className="text-portal-accent underline">
                      {r.timestamp}
                    </a> : <span>{r.timestamp}</span>}
                  </td>
                  <td className="px-4 py-4">{r.action}</td>
                  <td className="px-4 py-4">{r.actor}</td>
                  <td className="px-4 py-4">
                    <div>{r.subjectType}</div>
                    <div className="text-portal-muted">{r.subjectId}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-status-active-bg text-status-active-fg text-xs font-semibold">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-3 text-sm mt-4">
          <label htmlFor="pageSize2" className="text-portal-text">
            Items per page:
          </label>
          <select
            id="pageSize2"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-8 px-2 border border-portal-border rounded-md bg-portal-panel"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="ml-4 text-portal-muted">
            1 - {rows.length} of {rows.length} items
          </span>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AuditPage;