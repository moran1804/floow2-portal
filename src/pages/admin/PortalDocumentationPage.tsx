import { Check, Minus } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { CLIENT_PREVIEW_ROLES, FLOOW_PREVIEW_ROLES, ROLE_PERMISSIONS, roleAllows, type PortalPermission, type PreviewRole } from "@/lib/rolePreview";

const PERMISSIONS = Object.keys(ROLE_PERMISSIONS).sort() as PortalPermission[];

const RoleMatrix = ({ title, roles }: { title: string; roles: readonly PreviewRole[] }) => (
  <div className="mt-6">
    <h3 className="font-semibold text-portal-navy mb-2">{title}</h3>
    <div className="overflow-auto max-h-[600px] border border-portal-border rounded-md">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-portal-surface z-10">
          <tr>
            <th className="text-left p-2 font-semibold text-portal-navy sticky left-0 bg-portal-surface min-w-[220px]">Permission</th>
            {roles.map((r) => (
              <th key={r} className="p-2 font-semibold text-portal-navy text-center min-w-[90px]">{r.replace(/^(Floow|Client) /, "")}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-portal-border">
          {PERMISSIONS.map((perm) => (
            <tr key={perm}>
              <td className="p-2 font-mono text-portal-navy sticky left-0 bg-portal-panel">{perm}</td>
              {roles.map((r) => (
                <td key={r} className="p-2 text-center">
                  {roleAllows(r, perm) ? (
                    <Check aria-label="Allowed" className="w-4 h-4 inline text-portal-navy" />
                  ) : (
                    <Minus aria-label="Not allowed" className="w-4 h-4 inline text-portal-muted/50" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

type Topic = { id: string; title: string; intro: string; items: [string, string][] };

const topics: Topic[] = [
  { id: "getting-started", title: "Getting started", intro: "How to sign in and find your way around the portal.", items: [
    ["Signing in", "Sign in with your email and password, or use Sign in with Microsoft 365. Use Forgot password to receive a reset link. New accounts are created by Floow; there is no self sign-up."],
    ["Dashboard", "After signing in you always land on the Dashboard, which summarises activity for the selected client."],
    ["Change client", "All settings, products and data belong to a client. Use the Change client button in the header to open the Clients page and pick another client."],
    ["Role preview", "The role dropdown in the header shows the portal as a chosen staff role would see it. It changes menus, pages and buttons only; it never changes real permissions. Floow Admin can see and do everything."],
    ["Profile and sign out", "Hover over or click your initials in the top right to sign out."],
    ["Notifications", "The bell beside your initials opens the inbox of release and feature updates. Unread messages show a badge, and you can compose new notifications."],
    ["Feedback", "The floating Rate your experience control at the bottom of every page lets you send a rating and comment. Please don't include personal information."],
  ]},
  { id: "clients", title: "Clients", intro: "Manage the insurers and organisations that use the portal.", items: [
    ["Client list", "Shows active clients, with an Archived tab for clients that are no longer in use."],
    ["Add client", "Create a client with a name and generated short code. New clients start with all features switched off."],
    ["Archive and restore", "Archived clients disappear from the client selector but keep their data and can be restored."],
  ]},
  { id: "admin", title: "Admin", intro: "Client-level configuration found under the Admin menu.", items: [
    ["Audit", "Search the history of changes made in the portal by date, user and action."],
    ["Features", "Switch features on or off for the selected client using the menu at the end of each row. Only Floow staff can change features."],
    ["Terms and Conditions", "Pick a product, then create versions in the editor with formatting and images. Save keeps a draft; publish immediately or schedule a date and time. One version is active per product, older versions become inactive and acceptance history is kept."],
    ["FAQs", "Manage questions and answers, grouped by product and category, which the mobile app reads to show up-to-date help."],
    ["Products", "Create and edit products, their scoring and impact detection settings, and campaign options. Product codes can't be changed once saved. One product can be marked as default."],
    ["Staff", "View portal staff and change their status."],
    ["Configuration", "Choose the transport modes available, the search style (Exact or Smart match) and whether speeds are shown in MPH or KPH across the whole portal."],
  ]},
  { id: "insurer", title: "Insurer Portal", intro: "Look up app users and their driving data.", items: [
    ["Search user data", "Exact match asks for specific details and searches when you press Search. Smart match gives one box that suggests results as you type, including partial names, emails and policy numbers."],
    ["User overview", "Shows user details, policy, device and app settings, permissions, account status, score reset history and score gauges for the overall Driver Score and each influence."],
    ["Policy overview", "Opened from the policy number. Shows the policy's average scores and each driver on the policy with their own scores."],
    ["Journeys", "A filterable table of trips with date range, score, mode, events and who set the transport tag (User or System). Use Bulk edit then Edit tags to change several journeys at once."],
    ["Journey details", "Time, mode of transport with who set it, route map, events, scores and a speed graph. You can edit the mode of transport if your role allows it."],
    ["View route", "A map zoomed to the whole journey, with colour-coded event pins and filters to show or hide each event type. Switch between map and satellite views."],
    ["Journey revisions", "See every change made to a journey and compare two revisions side by side; removed values show in red and added values in green."],
    ["Files", "Incoming and outgoing files for the user."],
    ["Terms acceptance", "Which T&Cs versions the user accepted, and when."],
    ["Impacts", "A list of detected impacts. Open one to see the crash report with location, speed and event details."],
  ]},
  { id: "insights", title: "Insights", intro: "Charts and filters summarising journeys, scores and engagement for the selected client.", items: [
    ["Filters", "Narrow results by date, product and other criteria."],
    ["Sample data", "Insights currently show labelled example data until live data is connected."],
  ]},
  { id: "developer", title: "Developer tools", intro: "Connect your own systems to Floow.", items: [
    ["Apps", "Register apps with sign-in settings (OIDC) and web addresses, then view their details."],
    ["Campaigns", "Overview of campaigns, Braze configuration (key and endpoint per client) and a list of tracking failures. Campaigns can be switched on per product."],
    ["REST API", "Create API credentials for the client and read examples of how to call the API."],
    ["Webhooks", "Subscribe a web address to events such as journeys or impacts and view the log of sent events."],
  ]},
  { id: "documentation", title: "Documentation", intro: "Reference material.", items: [
    ["Driver score", "How the Driver Score and its five influences work."],
    ["SDK documentation", "Guides for building the Floow mobile SDK into an app."],
    ["Portal documentation", "This guide."],
  ]},
  { id: "roles", title: "Roles and access", intro: "What each person can see depends on their role.", items: [
    ["Floow staff roles", "Floow Admin, plus specialist roles such as Reporter, Support Advisor, Finance and Developer, each with their own set of pages and actions."],
    ["Client staff roles", "Five client roles that see only their own client's information and the actions their role allows."],
    ["Hidden items", "If a menu item, button or link is missing, your role doesn't include it. Ask a Floow Admin if you need access."],
  ]},
];

const PortalDocumentationPage = () => (
  <AdminLayout
    title="Portal documentation"
    crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Documentation", to: "/admin/documentation" }, { label: "Portal documentation" }]}
  >
    <div className="flex gap-6 items-start">
      <nav className="hidden lg:block w-52 shrink-0 sticky top-6 bg-portal-panel border border-portal-border rounded-lg p-3 text-sm">
        {topics.map((t) => (
          <a key={t.id} href={`#${t.id}`} className="block px-2 py-1.5 text-portal-muted hover:text-portal-navy">{t.title}</a>
        ))}
      </nav>
      <div className="flex-1 space-y-6 min-w-0">
        {topics.map((t) => (
          <section key={t.id} id={t.id} className="bg-portal-panel border border-portal-border rounded-lg p-6 scroll-mt-6">
            <h2 className="text-xl font-bold text-portal-navy mb-1">{t.title}</h2>
            <p className="text-sm text-portal-muted mb-4">{t.intro}</p>
            <dl className="divide-y divide-portal-border">
              {t.items.map(([term, desc]) => (
                <div key={term} className="py-3 grid gap-1 md:grid-cols-[200px_1fr] md:gap-4">
                  <dt className="text-sm font-semibold text-portal-navy">{term}</dt>
                  <dd className="text-sm text-portal-muted">{desc}</dd>
                </div>
              ))}
            </dl>
            {t.id === "roles" && (
              <>
                <p className="text-sm text-portal-muted mt-4">A tick means the role has that permission. Permissions ending in /read let a role view an area; /write, /create, /delete and similar let it make changes.</p>
                <RoleMatrix title="Floow staff roles" roles={FLOOW_PREVIEW_ROLES} />
                <RoleMatrix title="Client staff roles" roles={CLIENT_PREVIEW_ROLES} />
              </>
            )}
          </section>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default PortalDocumentationPage;
