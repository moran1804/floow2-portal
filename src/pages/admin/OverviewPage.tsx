import { Link } from "react-router-dom";
import { UserCog, Code2, Search, PieChart, LucideIcon } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";

type Tile = {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  enabled: boolean;
};

const tiles: Tile[] = [
  {
    to: "/admin/home",
    icon: UserCog,
    title: "Admin",
    description: "Manage your company information, users and permissions.",
    cta: "View",
    enabled: true,
  },
  {
    to: "#",
    icon: Code2,
    title: "Developer tools",
    description: "View developer logs and configure Apps, API keys and Webhook events.",
    cta: "View",
    enabled: false,
  },
  {
    to: "#",
    icon: Search,
    title: "Search for information",
    description: "Look for policies, vehicles, drivers, journeys and impact information.",
    cta: "Search",
    enabled: false,
  },
  {
    to: "#",
    icon: PieChart,
    title: "Insights",
    description: "Analyse the performance of your product and policies.",
    cta: "View",
    enabled: false,
  },
];

const OverviewPage = () => {
  return (
    <AdminLayout
      title="Welcome back"
      crumbs={[{ label: "Home" }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiles.map((tile) => (
          <div
            key={tile.title}
            className="bg-portal-panel border border-portal-border rounded-lg p-6 flex flex-col"
          >
            <div className="w-10 h-10 rounded-md bg-portal-surface border border-portal-border flex items-center justify-center text-portal-navy mb-4">
              <tile.icon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-portal-navy mb-2">
              {tile.title}
            </h2>
            <p className="text-sm text-portal-muted flex-1 mb-6">
              {tile.description}
            </p>
            {tile.enabled ? (
              <Button asChild className="w-full bg-portal-navy hover:bg-portal-navy/90 text-portal-navy-foreground">
                <Link to={tile.to}>{tile.cta}</Link>
              </Button>
            ) : (
              <Button disabled className="w-full bg-portal-navy/60 text-portal-navy-foreground">
                {tile.cta}
              </Button>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default OverviewPage;