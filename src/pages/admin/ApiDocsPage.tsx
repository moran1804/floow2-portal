import { BookOpen } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

const ApiDocsPage = () => {
  return (
    <AdminLayout
      title="API Docs"
      crumbs={[{ label: "Home", to: "/" }, { label: "API Docs" }]}
    >
      <div className="bg-portal-panel border border-portal-border rounded-lg p-8">
        <div className="flex items-center gap-3 text-portal-muted">
          <BookOpen className="w-5 h-5" />
          <p>API documentation coming soon.</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ApiDocsPage;
