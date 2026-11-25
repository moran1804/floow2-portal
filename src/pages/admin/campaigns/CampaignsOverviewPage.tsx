import { Link } from "react-router-dom";
import { AlertTriangle, SlidersHorizontal } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";

const tiles = [
  { icon: SlidersHorizontal, title: "Configuration", description: "Configure the Braze integration.", to: "/admin/developer/campaigns/config" },
  { icon: AlertTriangle, title: "Tracking Failures", description: "View details of failed user tracking updates.", to: "/admin/developer/campaigns/tracking-failures" },
];

const CampaignsOverviewPage = () => (
  <AdminLayout title="Campaigns" crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Developer tools", to: "/admin/developer" }, { label: "Campaigns" }]}>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

export default CampaignsOverviewPage;