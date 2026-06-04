import { Link } from "react-router-dom";
import {
  Fingerprint,
  FileText,
  HelpCircle,
  Tag,
  Users,
  SlidersHorizontal,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const tiles = [
  {
    to: "/admin/audit",
    icon: Fingerprint,
    title: "Audit",
    description: "Review acceptance history and user activity logs.",
    cta: "View",
  },
  {
    to: "/admin/terms",
    icon: FileText,
    title: "Terms & Conditions",
    description: "Manage live, scheduled and draft T&Cs per product.",
    cta: "View",
  },
  {
    to: "/admin/faqs",
    icon: HelpCircle,
    title: "FAQs",
    description: "Maintain frequently asked questions for the mobile app.",
    cta: "View",
  },
  {
    to: "/admin/products",
    icon: Tag,
    title: "Products",
    description: "Define products that have their own T&Cs and FAQs.",
    cta: "View",
  },
  {
    to: "/admin/staff",
    icon: Users,
    title: "Staff",
    description: "Manage admin users and their portal access.",
    cta: "View",
  },
  {
    to: "/admin/configuration",
    icon: SlidersHorizontal,
    title: "Configuration",
    description: "Adjust portal-wide settings and preferences.",
    cta: "View",
  },
];

const OverviewPage = () => {
  const { user } = useAuth();

  return (
    <AdminLayout
      title={`Welcome back, ${user?.email ?? ""}`}
      crumbs={[{ label: "Home", to: "/" }, { label: "Overview" }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tiles.map((tile) => (
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
            <Button asChild className="w-full">
              <Link to={tile.to}>{tile.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default OverviewPage;