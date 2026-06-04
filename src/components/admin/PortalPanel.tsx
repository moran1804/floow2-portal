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
      <header className="bg-portal-panel-header px-6 py-4 flex items-center gap-3 border-b border-portal-border">
        {Icon && (
          <div className="w-8 h-8 rounded-md bg-portal-panel border border-portal-border flex items-center justify-center text-portal-navy">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <h2 className="text-lg font-bold text-portal-navy">{title}</h2>
        {rightContent && <div className="ml-auto">{rightContent}</div>}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
};

export default PortalPanel;