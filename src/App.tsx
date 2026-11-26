import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword";
import TermsListPage from "./pages/admin/TermsListPage.tsx";
import TermsEditorPage from "./pages/admin/TermsEditorPage.tsx";
import FaqsPage from "./pages/admin/FaqsPage.tsx";
import ProductsPage from "./pages/admin/ProductsPage.tsx";
import ProductEditorPage from "./pages/admin/ProductEditorPage.tsx";
import OverviewPage from "./pages/admin/OverviewPage.tsx";
import FeaturesPage from "./pages/admin/FeaturesPage.tsx";
import ClientsPage from "./pages/admin/ClientsPage.tsx";
import MonitoringPage from "./pages/admin/MonitoringPage.tsx";
import ApiDocsPage from "./pages/admin/ApiDocsPage.tsx";
import AuditPage from "./pages/admin/AuditPage.tsx";
import StaffPage from "./pages/admin/StaffPage.tsx";
import ConfigurationPage from "./pages/admin/ConfigurationPage.tsx";
import DeveloperToolsPage from "./pages/admin/DeveloperToolsPage.tsx";
import InsurerPortalPage from "./pages/admin/InsurerPortalPage.tsx";
import SearchUserDataPage from "./pages/admin/SearchUserDataPage.tsx";
import UserAccountPage from "./pages/admin/UserAccountPage.tsx";
import PolicyOverviewPage from "./pages/admin/PolicyOverviewPage.tsx";
import JourneyRoutePage from "./pages/admin/JourneyRoutePage.tsx";
import JourneyDetailPage from "./pages/admin/JourneyDetailPage.tsx";
import JourneyRevisionsPage from "./pages/admin/JourneyRevisionsPage.tsx";
import ImpactsPage from "./pages/admin/ImpactsPage.tsx";
import ImpactReportPage from "./pages/admin/ImpactReportPage.tsx";
import DocumentationPage from "./pages/admin/DocumentationPage.tsx";
import DriverScorePage from "./pages/admin/DriverScorePage.tsx";
import AdminHomePage from "./pages/admin/AdminHomePage.tsx";
import InsightsPage from "./pages/admin/InsightsPage.tsx";
import NotificationsPage from "./pages/admin/NotificationsPage.tsx";
import AppsPage from "./pages/admin/AppsPage.tsx";
import AppAddPage from "./pages/admin/AppAddPage.tsx";
import CampaignsOverviewPage from "./pages/admin/campaigns/CampaignsOverviewPage.tsx";
import CampaignsConfigPage from "./pages/admin/campaigns/CampaignsConfigPage.tsx";
import RestApiOverviewPage from "./pages/admin/restapi/RestApiOverviewPage.tsx";
import CredentialsPage from "./pages/admin/restapi/CredentialsPage.tsx";
import CredentialsAddPage from "./pages/admin/restapi/CredentialsAddPage.tsx";
import ApiDocumentationPage from "./pages/admin/restapi/ApiDocumentationPage.tsx";
import TrackingFailuresPage from "./pages/admin/campaigns/TrackingFailuresPage.tsx";
import WebhooksOverviewPage from "./pages/admin/webhooks/WebhooksOverviewPage.tsx";
import WebhooksDocsPage from "./pages/admin/webhooks/WebhooksDocsPage.tsx";
import SubscriptionsPage from "./pages/admin/webhooks/SubscriptionsPage.tsx";
import SubscriptionAddPage from "./pages/admin/webhooks/SubscriptionAddPage.tsx";
import WebhookEventsPage from "./pages/admin/webhooks/EventsPage.tsx";
import { AuthProvider } from "@/hooks/useAuth";
import RequireAdmin from "@/components/admin/RequireAdmin";
import RequireAuthenticated from "@/components/admin/RequireAuthenticated";
import { CustomerProvider } from "@/contexts/CustomerContext";
import { RolePreviewProvider } from "@/contexts/RolePreviewContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <RolePreviewProvider>
          <CustomerProvider>
          <Routes>
            <Route
              path="/"
              element={
                <RequireAdmin>
                  <Navigate to="/admin/overview" replace />
                </RequireAdmin>
              }
            />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin/insights" element={<RequireAdmin><InsightsPage /></RequireAdmin>} />
            <Route path="/admin/notifications" element={<RequireAuthenticated><NotificationsPage /></RequireAuthenticated>} />
            <Route path="/admin/insurer/search" element={<RequireAdmin><SearchUserDataPage /></RequireAdmin>} />
            <Route path="/admin/insurer/policies/:policyId" element={<RequireAdmin><PolicyOverviewPage /></RequireAdmin>} />
            <Route path="/admin/insurer/users/:userId" element={<RequireAdmin><UserAccountPage /></RequireAdmin>} />
            <Route path="/admin/insurer/users/:userId/journeys/:journeyId/route" element={<RequireAdmin><JourneyRoutePage /></RequireAdmin>} />
            <Route path="/admin/insurer/users/:userId/journeys/:journeyId/revisions" element={<RequireAdmin><JourneyRevisionsPage /></RequireAdmin>} />
            <Route path="/admin/insurer/users/:userId/journeys/:journeyId" element={<RequireAdmin><JourneyDetailPage /></RequireAdmin>} />
            <Route path="/admin/insurer/users/:userId/:section" element={<RequireAdmin><UserAccountPage /></RequireAdmin>} />
            <Route path="/admin/insurer/impacts" element={<RequireAdmin><ImpactsPage /></RequireAdmin>} />
            <Route path="/admin/insurer/impacts/:impactId/*" element={<RequireAdmin><ImpactReportPage /></RequireAdmin>} />
            <Route path="/admin/developer/apps" element={<RequireAdmin><AppsPage /></RequireAdmin>} />
            <Route path="/admin/developer/apps/add" element={<RequireAdmin><AppAddPage /></RequireAdmin>} />
            <Route path="/admin/developer/rest-api" element={<RequireAdmin><RestApiOverviewPage /></RequireAdmin>} />
            <Route path="/admin/developer/rest-api/credentials" element={<RequireAdmin><CredentialsPage /></RequireAdmin>} />
            <Route path="/admin/developer/rest-api/credentials/add" element={<RequireAdmin><CredentialsAddPage /></RequireAdmin>} />
            <Route path="/admin/developer/rest-api/docs" element={<RequireAdmin><ApiDocumentationPage /></RequireAdmin>} />
            <Route path="/admin/developer/webhooks" element={<RequireAdmin><WebhooksOverviewPage /></RequireAdmin>} />
            <Route path="/admin/developer/webhooks/docs" element={<RequireAdmin><WebhooksDocsPage /></RequireAdmin>} />
            <Route path="/admin/developer/webhooks/subscriptions" element={<RequireAdmin><SubscriptionsPage /></RequireAdmin>} />
            <Route path="/admin/developer/webhooks/subscriptions/add" element={<RequireAdmin><SubscriptionAddPage /></RequireAdmin>} />
            <Route path="/admin/developer/webhooks/events" element={<RequireAdmin><WebhookEventsPage /></RequireAdmin>} />
            <Route path="/admin/developer/campaigns" element={<RequireAdmin><CampaignsOverviewPage /></RequireAdmin>} />
            <Route path="/admin/developer/campaigns/config" element={<RequireAdmin><CampaignsConfigPage /></RequireAdmin>} />
            <Route path="/admin/developer/campaigns/tracking-failures" element={<RequireAdmin><TrackingFailuresPage /></RequireAdmin>} />
            <Route
              path="/admin/overview"
              element={
                <RequireAdmin>
                  <OverviewPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/terms"
              element={
                <RequireAdmin>
                  <TermsListPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/terms/new"
              element={
                <RequireAdmin>
                  <TermsEditorPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/terms/:id"
              element={
                <RequireAdmin>
                  <TermsEditorPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/faqs"
              element={
                <RequireAdmin>
                  <FaqsPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/products"
              element={
                <RequireAdmin>
                  <ProductsPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/products/add"
              element={
                <RequireAdmin>
                  <ProductEditorPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/products/:id"
              element={
                <RequireAdmin>
                  <ProductEditorPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/features"
              element={
                <RequireAdmin>
                  <FeaturesPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <RequireAdmin>
                  <AuditPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <RequireAdmin>
                  <StaffPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/configuration"
              element={
                <RequireAdmin>
                  <ConfigurationPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/developer"
              element={
                <RequireAdmin>
                  <DeveloperToolsPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/insurer"
              element={
                <RequireAdmin>
                  <InsurerPortalPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/documentation"
              element={
                <RequireAdmin>
                  <DocumentationPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/documentation/driver-score"
              element={
                <RequireAdmin>
                  <DriverScorePage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/home"
              element={
                <RequireAdmin>
                  <AdminHomePage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/clients"
              element={
                <RequireAdmin>
                  <ClientsPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/monitoring"
              element={
                <RequireAdmin>
                  <MonitoringPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/api-docs"
              element={
                <RequireAdmin>
                  <ApiDocsPage />
                </RequireAdmin>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </CustomerProvider>
          </RolePreviewProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
