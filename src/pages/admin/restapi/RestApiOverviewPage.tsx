import { Link } from "react-router-dom";
import { FileText, KeyRound } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";

const tiles = [
  { icon: KeyRound, title: "Credentials", description: "Manage credentials for accessing our REST API.", to: "/admin/developer/rest-api/credentials" },
  { icon: FileText, title: "Documentation", description: "Documentation of the APIs available.", to: "/admin/developer/rest-api/docs" },
];

const RestApiOverviewPage = () => (
  <AdminLayout title="REST API" crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Developer tools", to: "/admin/developer" }, { label: "REST API" }]}>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.title} className="bg-portal-panel border border-portal-border rounded-lg p-6 flex flex-col">
          <div className="w-10 h-10 rounded-md bg-portal-surface border border-portal-border flex items-center justify-center text-portal-navy mb-4"><t.icon className="w-5 h-5" /></div>
          <h2 className="text-lg font-bold text-portal-navy mb-2">{t.title}</h2>
          <p className="text-sm text-portal-muted flex-1 mb-6">{t.description}</p>
          <Button asChild className="w-full"><Link to={t.to}>View</Link></Button>
        </div>
      ))}
    </div>
  </AdminLayout>
);
export default RestApiOverviewPage;
