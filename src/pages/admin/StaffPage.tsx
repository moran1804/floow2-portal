import { useRolePreview } from "@/contexts/RolePreviewContext";
import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type StaffMember = {
  id: string;
  email: string;
  role: string;
  enabled: boolean;
};

const SAMPLE_STAFF: StaffMember[] = [
  {
    id: "1",
    email: "bartosz.debski@thefloow.com",
    role: "ACCOUNT_MANAGER",
    enabled: true,
  },
];

const StaffPage = () => {
  const { allows } = useRolePreview();
  const canWrite = allows("floow_clients/staff/write");
  const [staff, setStaff] = useState<StaffMember[]>(SAMPLE_STAFF);
  const [notice, setNotice] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<StaffMember | null>(null);

  const setEnabled = (id: string, enabled: boolean) =>
    setStaff((list) => list.map((s) => (s.id === id ? { ...s, enabled } : s)));

  return (
    <AdminLayout
      title="Staff"
      crumbs={[{ label: "Home", to: "/" }, { label: "Admin" }, { label: "Staff" }]}
    >
      <section className="bg-portal-panel border border-portal-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-portal-navy">Staff members</h2>
          {canWrite && <Button
            variant="outline"
            className="border-portal-navy text-portal-navy hover:bg-portal-navy hover:text-portal-navy-foreground"
          >
            Invite users
            <Plus className="w-4 h-4 ml-2" />
          </Button>}
        </div>

        {notice && (
          <p role="status" className="mb-4 rounded border border-portal-border bg-portal-panel-header px-4 py-2 text-sm text-portal-navy">
            {notice}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-portal-panel-header text-portal-navy text-left">
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Roles</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-t border-portal-border">
                  <td className="px-4 py-4 text-portal-accent">{s.email}</td>
                  <td className="px-4 py-4">{s.role}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                        s.enabled
                          ? "bg-status-active-bg text-status-active-fg"
                          : "bg-status-inactive-bg text-status-inactive-fg"
                      }`}
                    >
                      {s.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {canWrite && <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-portal-sidebar-active/50 text-portal-text"
                          aria-label="Row actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={!s.enabled}
                          onSelect={() => setNotice(`Welcome email resent to ${s.email}.`)}
                        >
                          Resend welcome email
                        </DropdownMenuItem>
                        {s.enabled ? (
                          <DropdownMenuItem
                            onSelect={() => {
                              setEnabled(s.id, false);
                              setNotice(`${s.email} has been disabled.`);
                            }}
                          >
                            Disable user
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onSelect={() => {
                              setEnabled(s.id, true);
                              setNotice(`${s.email} has been enabled.`);
                            }}
                          >
                            Enable user
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setToDelete(s)}
                        >
                          Remove user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>}
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr className="border-t border-portal-border">
                  <td colSpan={4} className="px-4 py-6 text-center text-portal-muted">No staff members.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove user?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.email} will be permanently removed. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!toDelete) return;
                setStaff((list) => list.filter((x) => x.id !== toDelete.id));
                setNotice(`${toDelete.email} has been removed.`);
                setToDelete(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default StaffPage;