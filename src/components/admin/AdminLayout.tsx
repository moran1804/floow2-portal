import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Fingerprint,
  FileText,
  Tag,
  Users,
  SlidersHorizontal,
  Bell,
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
  AlertCircle,
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
  Route as RouteIcon,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "@/components/admin/UserProfileMenu";
import { RoleNavLink as NavLink } from "@/components/admin/RoleAccess";
import { useRolePreview } from "@/contexts/RolePreviewContext";
import { FLOOW_PREVIEW_ROLES, CLIENT_PREVIEW_ROLES, type PreviewRole } from "@/lib/rolePreview";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  { to: "/admin/insurer/impacts", icon: AlertTriangle, label: "Impacts" },
  { to: "/admin/insurer/search", icon: SearchIcon, label: "Search User Data" },
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
  subtitle?: ReactNode;
}

const AdminLayout = ({ title, crumbs = [], actions, children, hideSidebar = false, subtitle }: AdminLayoutProps) => {
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { role, canPreview, setRole, canVisit } = useRolePreview();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isClientsPage = pathname === "/admin/clients";
  const isInsightsPage = pathname.startsWith("/admin/insights");
  const isNotificationsPage = pathname === "/admin/notifications";
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

  const isInsurerHome = pathname.startsWith("/admin/insurer");
  const isImpactReport = pathname.startsWith("/admin/insurer/impacts/");
  const isUserAccount = pathname.startsWith("/admin/insurer/users/");
  const isJourneyDetail = /^\/admin\/insurer\/users\/[^/]+\/journeys\/[^/]+/.test(pathname);
  const userAccountBase = pathname.split("/").slice(0, 5).join("/");
  const impactReportBase = pathname.split("/").slice(0, 5).join("/");
  const isUserSearchPage = pathname === "/admin/insurer/search" || pathname.startsWith("/admin/insurer/impacts") || isUserAccount;
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
    <div className={`${isNotificationsPage ? "flex h-dvh flex-col overflow-hidden" : "min-h-screen"} bg-portal-surface text-portal-text`}>
      {/* Top bar */}
      <header className={`flex shrink-0 flex-wrap items-center justify-between gap-y-2 bg-portal-panel border-b border-portal-border ${isInsightsPage || isUserSearchPage || isNotificationsPage ? "px-3 sm:px-6" : "px-6"} min-h-16 py-2 sm:h-16 sm:py-0`}>
        <div className={`flex items-center ${isInsightsPage || isUserSearchPage || isNotificationsPage ? "gap-3 sm:gap-6" : "gap-6"}`}>
          <Button
            variant="ghost"
            onClick={() => navigate(canVisit("/admin/clients") ? "/admin/clients" : "/admin/overview")}
            className="h-auto p-0 hover:bg-transparent"
            title={canVisit("/admin/clients") ? "View all clients" : "Dashboard"}
          >
            <img
              src={floowLogo.url}
              alt="The Floow"
              className="h-6 w-auto"
            />
          </Button>
          {canVisit("/admin/clients") && <Button
            variant="outline"
            onClick={() => navigate("/admin/clients")}
            className={`h-9 gap-2 border-portal-border ${isNotificationsPage || canPreview ? "hidden sm:inline-flex" : ""}`}
            title="Change client"
          >
            <Building2 className="w-4 h-4" />
            Change client
          </Button>}

        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {canPreview && <Select value={role ?? "account"} onValueChange={(value) => setRole(value === "account" ? null : value as PreviewRole)}>
            <SelectTrigger aria-label="Preview role" title="Role preview — your account permissions remain unchanged" className="h-9 w-auto min-w-[10.5rem] max-w-[18rem] gap-2 border-portal-border bg-background px-3 text-sm font-medium hover:bg-accent">
              <div className="flex min-w-0 items-center gap-2">
                <UserCog className="h-4 w-4 shrink-0" />
                <span className="truncate"><SelectValue /></span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup><SelectLabel>Role preview — permissions unchanged</SelectLabel><SelectItem value="account">My account</SelectItem></SelectGroup>
              <SelectGroup><SelectLabel>Floow staff</SelectLabel>{FLOOW_PREVIEW_ROLES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectGroup>
              <SelectGroup><SelectLabel>Client staff</SelectLabel>{CLIENT_PREVIEW_ROLES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectGroup>
            </SelectContent>
          </Select>}
          <span className="text-sm text-portal-muted hidden xl:inline">
            {user?.email}
          </span>
          <UserProfileMenu initials={initials} onSignOut={signOut} />
          <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/admin/notifications")} title="Notifications" aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}>
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-portal-navy px-1 text-[10px] font-bold text-portal-navy-foreground">{unreadCount > 99 ? "99+" : unreadCount}</span>}
          </Button>
        </div>
      </header>

      <div className={`flex ${isNotificationsPage ? "min-h-0 flex-1 overflow-hidden" : ""}`}>
        {/* Sidebar */}
        {!hideSidebar && (
        <aside className={`${isInsightsPage || isUserSearchPage ? "hidden md:block w-52 shrink-0" : isNotificationsPage ? "hidden md:block w-64 shrink-0 overflow-y-auto" : "w-64"} ${isNotificationsPage ? "min-h-0" : "min-h-[calc(100vh-4rem)]"} bg-portal-sidebar border-r border-portal-border py-4`}>
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
            ) : isJourneyDetail ? (
              <>
                <Button asChild variant="ghost" className="mb-3 w-full justify-start rounded-none px-6"><NavLink to={userAccountBase} end><ArrowLeft />User overview</NavLink></Button>
                <NavLink to={pathname.split("/").slice(0, 7).join("/")} className={navLinkClass} end><FileText className="h-5 w-5" />Journey detail</NavLink>
                <NavLink to={`${pathname.split("/").slice(0, 7).join("/")}/route`} className={navLinkClass}><RouteIcon className="h-5 w-5" />Journey route</NavLink>
                <span className="flex cursor-default items-center gap-3 px-6 py-3 text-sm text-portal-muted" title="Not connected yet"><Pencil className="h-5 w-5" />Journey revisions</span>
              </>
            ) : isUserAccount ? (
              <>
                <Button asChild variant="ghost" className="mb-3 w-full justify-start rounded-none px-6"><NavLink to="/admin/insurer/search"><ArrowLeft />Users</NavLink></Button>
                <NavLink to={userAccountBase} className={navLinkClass} end><Users className="h-5 w-5" />User overview</NavLink>
                <NavLink to={`${userAccountBase}/journeys`} className={navLinkClass}><Activity className="h-5 w-5" />Journeys</NavLink>
                <NavLink to={`${userAccountBase}/files`} className={navLinkClass}><Inbox className="h-5 w-5" />Files</NavLink>
                <NavLink to={`${userAccountBase}/terms`} className={navLinkClass}><ClipboardList className="h-5 w-5" />Terms Acceptance</NavLink>
              </>
            ) : isImpactReport ? (
              <>
                <Button asChild variant="ghost" className="mb-3 w-full justify-start rounded-none px-6"><NavLink to="/admin/insurer/impacts"><ArrowLeft />Impacts detected</NavLink></Button>
                <NavLink to={impactReportBase} className={navLinkClass} end><FileText className="h-5 w-5" />Impact detail</NavLink>
                <NavLink to={`${impactReportBase}/contributing-factors/phone-use`} className={() => navLinkClass({ isActive: pathname.includes("/contributing-factors/") })}><Activity className="h-5 w-5" />Contributing factors</NavLink>
                <NavLink to={`${impactReportBase}/timeline-events/before`} className={() => navLinkClass({ isActive: pathname.includes("/timeline-events/") })}><ClipboardList className="h-5 w-5" />Timeline of events</NavLink>
              </>
            ) : isInsurerHome ? (
              <>
                <Button asChild variant="ghost" className="mb-3 w-full justify-start rounded-none px-6"><NavLink to="/admin/overview"><ArrowLeft />Back to home</NavLink></Button>
                <NavLink to="/admin/insurer" className={navLinkClass} end><AlertCircle className="h-5 w-5" />Overview</NavLink>
                <NavLink to="/admin/insurer/impacts" className={navLinkClass}><AlertTriangle className="h-5 w-5" />Impacts</NavLink>
                <NavLink to="/admin/insurer/search" className={navLinkClass}><SearchIcon className="h-5 w-5" />Search User Data</NavLink>
              </>
            ) : isWebhooksPage ? (
              <>
                <Button asChild variant="ghost" className="mb-3 w-full justify-start rounded-none px-6"><NavLink to="/admin/developer"><ArrowLeft />Developer tools</NavLink></Button>
                <NavLink to="/admin/developer/webhooks" className={navLinkClass} end><Webhook className="h-5 w-5" />Webhooks</NavLink>
                <NavLink to="/admin/developer/webhooks/docs" className={navLinkClass}><FileText className="h-5 w-5" />Documentation</NavLink>
                <NavLink to="/admin/developer/webhooks/subscriptions" className={navLinkClass}><Inbox className="h-5 w-5" />Subscriptions</NavLink>
                <NavLink to="/admin/developer/webhooks/events" className={navLinkClass}><Mail className="h-5 w-5" />Events</NavLink>
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

                {canVisit("/admin/home") && <button
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
                </button>}
                {adminOpen && canVisit("/admin/home") && (
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

                {canVisit("/admin/developer") && <button
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
                </button>}
                {devOpen && canVisit("/admin/developer") && (
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

                {canVisit("/admin/insurer") && <button
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
                </button>}
                {insurerOpen && canVisit("/admin/insurer") && (
                  <div className="bg-portal-sidebar-active/30">
                    {insurerChildren.map((item) => (
                      item.disabled ? <div
                        key={item.label}
                        className="flex items-center gap-3 pl-14 pr-6 py-2.5 text-sm font-medium border-l-2 border-transparent text-portal-muted cursor-default"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </div> : <NavLink key={item.label} to={item.to} className="flex items-center gap-3 pl-14 pr-6 py-2.5 text-sm font-medium text-portal-text hover:bg-portal-sidebar-active/50"><item.icon className="w-4 h-4" />{item.label}</NavLink>
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
                      <span className="flex-1 text-left">{item.label}</span>
                    </NavLink>
                  )
                )}
              </>
            )}
          </nav>
        </aside>
        )}

        {/* Main */}
        <main className={`flex-1 min-w-0 ${isNotificationsPage ? "flex min-h-0 flex-col overflow-hidden" : isUserSearchPage ? "flex flex-col min-h-[calc(100vh-4rem)]" : ""}`}>
          <div className={`${isInsightsPage || isUserSearchPage ? "bg-portal-panel-header px-5 md:px-8" : isNotificationsPage ? "shrink-0 bg-portal-panel px-4 sm:px-8" : "bg-portal-panel px-8"} border-b border-portal-border ${isNotificationsPage ? "py-4 sm:pt-6 sm:pb-8" : "pt-6 pb-8"}`}>
            {crumbs.length > 0 && (
              <div className="text-sm text-portal-muted mb-3">
                {crumbs.map((c, i) => (
                  <span key={i} className={isImpactReport ? "break-words" : ""}>
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
            {subtitle && <p className="mb-2 break-all text-sm font-semibold text-portal-navy">{subtitle}</p>}
            <div className={`flex gap-4 ${isNotificationsPage ? "flex-col sm:flex-row sm:items-center sm:justify-between" : "items-center justify-between"}`}>
              <h1 className="text-4xl font-bold text-portal-navy">{title}</h1>
              {actions}
            </div>
          </div>
          <div className={isInsightsPage || isUserSearchPage ? "p-4 md:p-6" : isNotificationsPage ? "flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-8" : "p-8"}>{children}</div>
          <footer className={`px-8 text-xs text-portal-muted ${isNotificationsPage ? "shrink-0 pb-3" : "pb-8"} ${isUserSearchPage ? "mt-auto pt-8" : ""}`}>
            Copyright © {new Date().getFullYear()} The Floow Limited - All Rights Reserved
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;