import { Link } from "react-router-dom";
import { FileText, Inbox, Mail } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";

const tiles = [
  { icon: FileText, title: "Documentation", description: "Get information on how the webhooks work and how you can use them.", to: "/admin/developer/webhooks/docs" },
  { icon: Inbox, title: "Subscriptions", description: "Manage subscriptions to webhook events.", to: "/admin/developer/webhooks/subscriptions" },
  { icon: Mail, title: "Events", description: "List the latest events sent out via webhooks.", to: "/admin/developer/webhooks/events" },
];

const WebhooksOverviewPage = () => (
  <AdminLayout title="Webhooks" crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Developer tools", to: "/admin/developer" }, { label: "Webhooks" }]}>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tiles.map((t) => (
        <div key={t.title} className="bg-portal-panel border border-portal-border rounded-lg p-6 flex flex-col">
          <div className="w-10 h-10 rounded-md bg-portal-surface border border-portal-border flex items-center justify-center text-portal-navy mb-4"><t.icon className="w-5 h-5" /></div>
          <h2 className="text-lg font-bold text-portal-navy mb-2">{t.title}</h2>
          <p className="text-sm text-portal-muted flex-1 mb-6">{t.description}</p>
          {t.to ? <Button asChild className="w-full"><Link to={t.to}>View</Link></Button> : <Button disabled className="w-full">View</Button>}
        </div>
      ))}
    </div>
  </AdminLayout>
);
export default WebhooksOverviewPage;
