import { Link } from "react-router-dom";
import {
  Fingerprint,
  KeyRound,
  FileText,
  HelpCircle,
  Tag,
  Users,
  SlidersHorizontal,
  LucideIcon,
} from "lucide-react";
import { useRolePreview } from "@/contexts/RolePreviewContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";

type Tile = {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const tiles: Tile[] = [
  {
    to: "/admin/audit",
    icon: Fingerprint,
    title: "Audit",
    description: "Review acceptance history and user activity logs.",
  },
  {
    to: "/admin/features",
    icon: KeyRound,
    title: "Features",
    description: "Activate or deactivate product features.",
  },
  {
    to: "/admin/terms",
    icon: FileText,
    title: "Terms & Conditions",
    description: "Manage live, scheduled and draft T&Cs per product.",
  },
  {
    to: "/admin/faqs",
    icon: HelpCircle,
    title: "FAQs",
    description: "Maintain frequently asked questions for the mobile app.",
  },
  {
    to: "/admin/products",
    icon: Tag,
    title: "Products",
    description: "Define products that have their own T&Cs and FAQs.",
  },
  {
    to: "/admin/staff",
    icon: Users,
    title: "Staff",
    description: "Manage admin users and their portal access.",
  },
  {
    to: "/admin/configuration",
    icon: SlidersHorizontal,
    title: "Configuration",
    description: "Adjust portal-wide settings and preferences.",
  },
];

const AdminHomePage = () => {
  const { canVisit } = useRolePreview();
  return (
    <AdminLayout
      title="Admin"
      crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Admin" }]}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {tiles.filter((tile) => canVisit(tile.to)).map((tile) => (
          <div
            key={tile.to}
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
            <Button
              asChild
              className="w-full bg-portal-navy hover:bg-portal-navy/90 text-portal-navy-foreground"
            >
              <Link to={tile.to}>View</Link>
            </Button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminHomePage;