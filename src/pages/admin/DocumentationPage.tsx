import { Link } from "react-router-dom";
import { Award, Code2, LucideIcon } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";

type Tile = {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  to?: string;
};

const tiles: Tile[] = [
  {
    icon: Award,
    title: "Driver score",
    description: "How scores are calculated for journeys processed by the Floow.",
    to: "/admin/documentation/driver-score",
  },
  {
    icon: Code2,
    title: "SDK documentation",
    description: "Integration guides and reference for the Floow mobile SDKs.",
    href: "https://docs.stg.eu-01.thefloow.io/",
  },
];

const DocumentationPage = () => (
  <AdminLayout
    title="Documentation"
    crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Documentation" }]}
  >
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.title}
          className="bg-portal-panel border border-portal-border rounded-lg p-6 flex flex-col"
        >
          <div className="w-10 h-10 rounded-md bg-portal-surface border border-portal-border flex items-center justify-center text-portal-navy mb-4">
            <tile.icon className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-portal-navy mb-2">{tile.title}</h2>
          <p className="text-sm text-portal-muted flex-1 mb-6">{tile.description}</p>
          {tile.to ? (
            <Button asChild className="w-full bg-portal-navy hover:bg-portal-navy/90 text-portal-navy-foreground">
              <Link to={tile.to}>View</Link>
            </Button>
          ) : tile.href ? (
            <Button
              asChild
              className="w-full bg-portal-navy hover:bg-portal-navy/90 text-portal-navy-foreground"
            >
              <a href={tile.href} target="_blank" rel="noopener noreferrer">
                View
              </a>
            </Button>
          ) : (
            <Button disabled className="w-full bg-portal-navy/60 text-portal-navy-foreground">
              View
            </Button>
          )}
        </div>
      ))}
    </div>
  </AdminLayout>
);

export default DocumentationPage;
