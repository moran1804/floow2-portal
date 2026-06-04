import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";

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
  const [staff] = useState<StaffMember[]>(SAMPLE_STAFF);

  return (
    <AdminLayout
      title="Staff"
      crumbs={[{ label: "Home", to: "/" }, { label: "Admin" }, { label: "Staff" }]}
    >
      <section className="bg-portal-panel border border-portal-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-portal-navy">Staff members</h2>
          <Button
            variant="outline"
            className="border-portal-navy text-portal-navy hover:bg-portal-navy hover:text-portal-navy-foreground"
          >
            Invite users
            <Plus className="w-4 h-4 ml-2" />
          </Button>
        </div>

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
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {s.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-portal-sidebar-active/50 text-portal-text"
                      aria-label="Row actions"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
};

export default StaffPage;