import { ReactNode, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Fingerprint,
  FileText,
  Tag,
  Users,
  SlidersHorizontal,
  LogOut,
  HelpCircle,
  KeyRound,
  Activity,
  Building2,
  BookOpen,
  UserCog,
  Code2,
  Search as SearchIcon,
  PieChart,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useCustomer } from "@/contexts/CustomerContext";
import floowLogo from "@/assets/the-floow-logo.svg.asset.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NavItem = {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
};

const dashboardItem: NavItem = {
  to: "/admin/overview",
  icon: LayoutGrid,
  label: "Dashboard",
};

const adminChildren: NavItem[] = [
  { to: "/admin/audit", icon: Fingerprint, label: "Audit" },
  { to: "/admin/features", icon: KeyRound, label: "Features" },
  { to: "/admin/terms", icon: FileText, label: "Terms & Conditions" },
  { to: "/admin/faqs", icon: HelpCircle, label: "FAQs" },
  { to: "/admin/products", icon: Tag, label: "Products" },
  { to: "/admin/staff", icon: Users, label: "Staff" },
  { to: "/admin/configuration", icon: SlidersHorizontal, label: "Configuration" },
];

const otherTopItems: NavItem[] = [
  { to: "#", icon: Code2, label: "Developer tools", disabled: true },
  { to: "#", icon: SearchIcon, label: "Search for information", disabled: true },
  { to: "#", icon: PieChart, label: "Insights", disabled: true },
];

const clientsNavItems: NavItem[] = [
  { to: "/admin/clients", icon: Building2, label: "Clients" },
  { to: "#", icon: Activity, label: "Monitoring", disabled: true },
  { to: "#", icon: BookOpen, label: "API Docs", disabled: true },
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
  const { pathname } = useLocation();
  const { customers, selectedCustomerId, setSelectedCustomerId } = useCustomer();
  const isClientsPage = pathname === "/admin/clients";

  const isAdminChildActive = adminChildren.some((c) => pathname.startsWith(c.to));
  const isAdminHome = pathname === "/admin/home";
  const [adminOpen, setAdminOpen] = useState<boolean>(
    isAdminChildActive || isAdminHome
  );

  const initials = (user?.email ?? "??")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-6 py-3 text-sm font-medium border-l-2 ${
      isActive
        ? "bg-portal-sidebar-active border-portal-accent text-portal-accent"
        : "border-transparent text-portal-text hover:bg-portal-sidebar-active/50"
    }`;

  const disabledClass =
    "flex items-center gap-3 px-6 py-3 text-sm font-medium border-l-2 border-transparent text-portal-muted cursor-default";

  return (
    <div className="min-h-screen bg-portal-surface text-portal-text">
      {/* Top bar */}
      <header className="flex items-center justify-between bg-portal-panel border-b border-portal-border px-6 h-16">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate("/admin/clients")}
            className="flex items-center"
            title="View all clients"
          >
            <img
              src={floowLogo.url}
              alt="The Floow"
              className="h-6 w-auto"
            />
          </button>
          <Select
            value={selectedCustomerId ?? undefined}
            onValueChange={setSelectedCustomerId}
          >
            <SelectTrigger className="h-9 w-[200px] text-sm bg-portal-panel border-portal-border">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <nav className="mt-2">
            {isClientsPage ? (
              clientsNavItems.map((item) =>
                item.disabled ? (
                  <div key={item.label} className={disabledClass}>
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </div>
                ) : (
                  <NavLink key={item.to} to={item.to} className={navLinkClass}>
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                )
              )
            ) : (
              <>
                <NavLink to={dashboardItem.to} className={navLinkClass} end>
                  <dashboardItem.icon className="w-5 h-5" />
                  {dashboardItem.label}
                </NavLink>

                <button
                  type="button"
                  onClick={() => {
                    setAdminOpen(true);
                    navigate("/admin/home");
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium border-l-2 border-transparent ${
                    isAdminChildActive || isAdminHome
                      ? "text-portal-accent"
                      : "text-portal-text hover:bg-portal-sidebar-active/50"
                  }`}
                >
                  <UserCog className="w-5 h-5" />
                  <span className="flex-1 text-left">Admin</span>
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAdminOpen((o) => !o);
                    }}
                    className="p-1 -m-1 rounded hover:bg-portal-sidebar-active/50"
                  >
                    {adminOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>
                </button>
                {adminOpen && (
                  <div className="bg-portal-sidebar-active/30">
                    {adminChildren.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 pl-14 pr-6 py-2.5 text-sm font-medium border-l-2 ${
                            isActive
                              ? "bg-portal-sidebar-active border-portal-accent text-portal-accent"
                              : "border-transparent text-portal-text hover:bg-portal-sidebar-active/50"
                          }`
                        }
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}

                {otherTopItems.map((item) => (
                  <div key={item.label} className={disabledClass}>
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </div>
                ))}
              </>
            )}
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