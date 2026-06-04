import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  LayoutGrid,
  Fingerprint,
  FileText,
  Tag,
  Users,
  SlidersHorizontal,
  CircleUser,
  LogOut,
  HelpCircle,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/admin/overview", icon: LayoutGrid, label: "Overview" },
  { to: "/admin/audit", icon: Fingerprint, label: "Audit" },
  { to: "/admin/features", icon: KeyRound, label: "Features" },
  { to: "/admin/terms", icon: FileText, label: "Terms & Conditions" },
  { to: "/admin/faqs", icon: HelpCircle, label: "FAQs" },
  { to: "/admin/products", icon: Tag, label: "Products" },
  { to: "/admin/staff", icon: Users, label: "Staff" },
  { to: "/admin/configuration", icon: SlidersHorizontal, label: "Configuration" },
];

type Crumb = { label: string; to?: string };

interface AdminLayoutProps {
  title: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  children: ReactNode;
}

const AdminLayout = ({ title, crumbs = [], actions, children }: AdminLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.email ?? "??")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-portal-surface text-portal-text">
      {/* Top bar */}
      <header className="flex items-center justify-between bg-portal-panel border-b border-portal-border px-6 h-16">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-semibold text-portal-navy">
            <div className="w-7 h-7 rounded-full bg-portal-navy flex items-center justify-center">
              <CircleUser className="w-4 h-4 text-portal-navy-foreground" />
            </div>
            <span>The Portal</span>
          </div>
          <select
            className="text-sm border border-portal-border rounded px-3 py-1.5 bg-portal-panel"
            defaultValue="mobileAndroid"
          >
            <option>mobileAndroid</option>
            <option>mobileiOS</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-portal-muted hidden sm:inline">
            {user?.email}
          </span>
          <div className="w-9 h-9 rounded-full bg-portal-navy text-portal-navy-foreground flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-4rem)] bg-portal-sidebar border-r border-portal-border py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm px-6 py-3 text-portal-text hover:text-portal-accent w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>
          <nav className="mt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-sm font-medium border-l-2 ${
                    isActive
                      ? "bg-portal-sidebar-active border-portal-accent text-portal-accent"
                      : "border-transparent text-portal-text hover:bg-portal-sidebar-active/50"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="bg-portal-panel border-b border-portal-border px-8 pt-6 pb-8">
            {crumbs.length > 0 && (
              <div className="text-sm text-portal-muted mb-3">
                {crumbs.map((c, i) => (
                  <span key={i}>
                    {c.to ? (
                      <NavLink to={c.to} className="hover:text-portal-accent">
                        {c.label}
                      </NavLink>
                    ) : (
                      <span className="font-semibold text-portal-text">{c.label}</span>
                    )}
                    {i < crumbs.length - 1 && <span className="mx-2">{">"}</span>}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-4xl font-bold text-portal-navy">{title}</h1>
              {actions}
            </div>
          </div>
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;