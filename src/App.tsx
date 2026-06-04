import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
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
import { AuthProvider } from "@/hooks/useAuth";
import RequireAdmin from "@/components/admin/RequireAdmin";
import { CustomerProvider } from "@/contexts/CustomerContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CustomerProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
