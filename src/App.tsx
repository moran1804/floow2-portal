import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import TermsListPage from "./pages/admin/TermsListPage.tsx";
import TermsEditorPage from "./pages/admin/TermsEditorPage.tsx";
import FaqsPage from "./pages/admin/FaqsPage.tsx";
import { AuthProvider } from "@/hooks/useAuth";
import RequireAdmin from "@/components/admin/RequireAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
