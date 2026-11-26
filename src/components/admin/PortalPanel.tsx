import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface PortalPanelProps {
  icon?: LucideIcon;
  title: string;
  rightContent?: ReactNode;
  children: ReactNode;
}

const PortalPanel = ({ icon: Icon, title, rightContent, children }: PortalPanelProps) => {
  return (
    <section className="bg-portal-panel border border-portal-border rounded-lg overflow-hidden">
      <header className="flex flex-wrap items-center gap-3 border-b border-portal-border bg-portal-panel-header px-4 py-4 sm:px-6">
        {Icon && (
          <div className="w-8 h-8 rounded-md bg-portal-panel border border-portal-border flex items-center justify-center text-portal-navy">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <h2 className="text-lg font-bold text-portal-navy">{title}</h2>
        {rightContent && <div className="w-full sm:ml-auto sm:w-auto">{rightContent}</div>}
      </header>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
};

export default PortalPanel;