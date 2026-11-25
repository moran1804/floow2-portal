import { Link } from "react-router-dom";
import { Smartphone, Send, Network, Webhook, LucideIcon } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";

type Tile = { icon: LucideIcon; title: string; description: string; to?: string };

const tiles: Tile[] = [
  { icon: Smartphone, title: "Apps", description: "Manage access for your applications and API requests.", to: "/admin/developer/apps" },
  { icon: Send, title: "Campaigns", description: "Manage communication campaigns." },
  { icon: Network, title: "REST API", description: "Access to and documentation of the REST APIs available." },
  { icon: Webhook, title: "Webhooks", description: "Send events to external HTTP endpoints." },
];

const DeveloperToolsPage = () => (
  <AdminLayout
    title="Developer tools"
    crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Developer tools" }]}
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tiles.map((tile) => (
        <div key={tile.title} className="bg-portal-panel border border-portal-border rounded-lg p-6 flex flex-col">
          <div className="w-10 h-10 rounded-md bg-portal-surface border border-portal-border flex items-center justify-center text-portal-navy mb-4">
            <tile.icon className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-portal-navy mb-2">{tile.title}</h2>
          <p className="text-sm text-portal-muted flex-1 mb-6">{tile.description}</p>
          {tile.to ? (
            <Button asChild className="w-full"><Link to={tile.to}>View</Link></Button>
          ) : (
            <Button disabled className="w-full bg-portal-navy/60 text-portal-navy-foreground">View</Button>
          )}
        </div>
      ))}
    </div>
  </AdminLayout>
);

export default DeveloperToolsPage;
