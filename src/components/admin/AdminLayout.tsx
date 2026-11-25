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
  Inbox,
  Mail,
  ChevronRight,
  FileText as DocIcon,
  Smartphone,
  Send,
  Network,
  Webhook,
  AlertTriangle,
  ClipboardList,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import floowLogo from "@/assets/the-floow-logo.svg.asset.json";

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
  { to: "/admin/insights", icon: PieChart, label: "Insights" },
  { to: "/admin/documentation", icon: DocIcon, label: "Documentation" },
];

const devChildren: NavItem[] = [
  { to: "/admin/developer/apps", icon: Smartphone, label: "Apps" },
  { to: "/admin/developer/campaigns", icon: Send, label: "Campaigns" },
  { to: "/admin/developer/rest-api", icon: Network, label: "REST API" },
  { to: "/admin/developer/webhooks", icon: Webhook, label: "Webhooks" },
];

const insurerChildren: NavItem[] = [
  { to: "#", icon: AlertTriangle, label: "Impacts", disabled: true },
  { to: "#", icon: Users, label: "Users", disabled: true },
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
  hideSidebar?: boolean;
}

const AdminLayout = ({ title, crumbs = [], actions, children, hideSidebar = false }: AdminLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isClientsPage = pathname === "/admin/clients";
  const isInsightsPage = pathname.startsWith("/admin/insights");
  const isCampaignsPage = pathname.startsWith("/admin/developer/campaigns");
  const isRestApiPage = pathname.startsWith("/admin/developer/rest-api");
  const isWebhooksPage = pathname.startsWith("/admin/developer/webhooks");

  const isAdminChildActive = adminChildren.some((c) => pathname.startsWith(c.to));
  const isAdminHome = pathname === "/admin/home";
  const [adminOpen, setAdminOpen] = useState<boolean>(
    isAdminChildActive || isAdminHome
  );

  const isDevHome = pathname.startsWith("/admin/developer");
  const [devOpen, setDevOpen] = useState<boolean>(isDevHome);

  const isInsurerHome = pathname === "/admin/insurer";
  const [insurerOpen, setInsurerOpen] = useState<boolean>(isInsurerHome);

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
      <header className={`flex items-center justify-between bg-portal-panel border-b border-portal-border ${isInsightsPage ? "px-3 sm:px-6" : "px-6"} h-16`}>
        <div className={`flex items-center ${isInsightsPage ? "gap-3 sm:gap-6" : "gap-6"}`}>
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
          <Button
            variant="outline"
            onClick={() => navigate("/admin/clients")}
            className="h-9 gap-2 border-portal-border"
            title="Change client"
          >
            <Building2 className="w-4 h-4" />
            Change client
          </Button>

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
        {!hideSidebar && (
        <aside className={`${isInsightsPage ? "hidden md:block w-52 shrink-0" : "w-64"} min-h-[calc(100vh-4rem)] bg-portal-sidebar border-r border-portal-border py-4`}>
          <nav className="mt-2">
            {isCampaignsPage ? (
              <>
                <Button asChild variant="ghost" className="mb-3 w-full justify-start rounded-none px-6"><NavLink to="/admin/developer"><ArrowLeft />Developer tools</NavLink></Button>
                <NavLink to="/admin/developer/campaigns" className={navLinkClass} end><LayoutGrid className="h-5 w-5" />Overview</NavLink>
                <NavLink to="/admin/developer/campaigns/config" className={navLinkClass}><SlidersHorizontal className="h-5 w-5" />Configuration</NavLink>
                <NavLink to="/admin/developer/campaigns/tracking-failures" className={navLinkClass}><AlertTriangle className="h-5 w-5" />Tracking Failures</NavLink>
              </>
            ) : isRestApiPage ? (
              <>
                <Button asChild variant="ghost" className="mb-3 w-full justify-start rounded-none px-6"><NavLink to="/admin/developer"><ArrowLeft />Developer tools</NavLink></Button>
                <NavLink to="/admin/developer/rest-api" className={navLinkClass} end><Network className="h-5 w-5" />REST API</NavLink>
                <NavLink to="/admin/developer/rest-api/credentials" className={navLinkClass}><KeyRound className="h-5 w-5" />Credentials</NavLink>
                <NavLink to="/admin/developer/rest-api/docs" className={navLinkClass}><FileText className="h-5 w-5" />Documentation</NavLink>
              </>
            ) : isWebhooksPage ? (
              <>
                <Button asChild variant="ghost" className="mb-3 w-full justify-start rounded-none px-6"><NavLink to="/admin/developer"><ArrowLeft />Developer tools</NavLink></Button>
                <NavLink to="/admin/developer/webhooks" className={navLinkClass} end><Webhook className="h-5 w-5" />Webhooks</NavLink>
                <NavLink to="/admin/developer/webhooks/docs" className={navLinkClass}><FileText className="h-5 w-5" />Documentation</NavLink>
                <div className={disabledClass} aria-disabled="true"><Inbox className="h-5 w-5" />Subscriptions</div>
                <div className={disabledClass} aria-disabled="true"><Mail className="h-5 w-5" />Events</div>
              </>
            ) : isInsightsPage ? (
              <>
                <Button asChild variant="ghost" className="mb-3 w-full justify-start rounded-none px-6"><NavLink to="/admin/overview"><ArrowLeft />Back to home</NavLink></Button>
                <NavLink to="/admin/insights" className={navLinkClass} end><PieChart className="h-5 w-5" />Overview</NavLink>
                <div className={disabledClass} aria-disabled="true"><ClipboardList className="h-5 w-5" />Reporting</div>
                <div className={disabledClass} aria-disabled="true"><MessageSquare className="h-5 w-5" />Feedback</div>
              </>
            ) : isClientsPage ? (
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

                <button
                  type="button"
                  onClick={() => {
                    setDevOpen(true);
                    navigate("/admin/developer");
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium border-l-2 border-transparent ${
                    isDevHome ? "text-portal-accent" : "text-portal-text hover:bg-portal-sidebar-active/50"
                  }`}
                >
                  <Code2 className="w-5 h-5" />
                  <span className="flex-1 text-left">Developer tools</span>
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDevOpen((o) => !o);
                    }}
                    className="p-1 -m-1 rounded hover:bg-portal-sidebar-active/50"
                  >
                    {devOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </span>
                </button>
                {devOpen && (
                  <div className="bg-portal-sidebar-active/30">
                    {devChildren.map((item) =>
                      item.disabled ? (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 pl-14 pr-6 py-2.5 text-sm font-medium border-l-2 border-transparent text-portal-muted cursor-default"
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </div>
                      ) : (
                        <NavLink
                          key={item.label}
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
                      )
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setInsurerOpen(true);
                    navigate("/admin/insurer");
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium border-l-2 border-transparent ${
                    isInsurerHome ? "text-portal-accent" : "text-portal-text hover:bg-portal-sidebar-active/50"
                  }`}
                >
                  <SearchIcon className="w-5 h-5" />
                  <span className="flex-1 text-left">Insurer Portal</span>
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInsurerOpen((o) => !o);
                    }}
                    className="p-1 -m-1 rounded hover:bg-portal-sidebar-active/50"
                  >
                    {insurerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </span>
                </button>
                {insurerOpen && (
                  <div className="bg-portal-sidebar-active/30">
                    {insurerChildren.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 pl-14 pr-6 py-2.5 text-sm font-medium border-l-2 border-transparent text-portal-muted cursor-default"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </div>
                    ))}
                  </div>
                )}

                {otherTopItems.map((item) =>
                  item.disabled ? (
                    <div key={item.label} className={disabledClass}>
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                  ) : (
                    <NavLink key={item.label} to={item.to} className={navLinkClass}>
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </NavLink>
                  )
                )}
              </>
            )}
          </nav>
        </aside>
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className={`${isInsightsPage ? "bg-portal-panel-header px-5 md:px-8" : "bg-portal-panel px-8"} border-b border-portal-border pt-6 pb-8`}>
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
          <div className={isInsightsPage ? "p-4 md:p-6" : "p-8"}>{children}</div>
          <footer className="px-8 pb-8 text-xs text-portal-muted">
            Copyright © {new Date().getFullYear()} The Floow Limited - All Rights Reserved
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;