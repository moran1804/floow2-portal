import { Activity } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

const MonitoringPage = () => {
  return (
    <AdminLayout
      title="Monitoring"
      crumbs={[{ label: "Home", to: "/" }, { label: "Monitoring" }]}
    >
      <div className="bg-portal-panel border border-portal-border rounded-lg p-8">
        <div className="flex items-center gap-3 text-portal-muted">
          <Activity className="w-5 h-5" />
          <p>Monitoring dashboard coming soon.</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MonitoringPage;
