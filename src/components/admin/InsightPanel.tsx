import { ReactNode } from "react";
import { Info, LucideIcon } from "lucide-react";

export default function InsightPanel({ title, icon: Icon, help, children, className = "" }: {
  title: string; icon: LucideIcon; help?: string; children: ReactNode; className?: string;
}) {
  return <section className={`rounded-md border border-portal-border/60 bg-portal-panel p-5 ${className}`}>
    <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-portal-text">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-portal-accent text-primary-foreground"><Icon className="h-5 w-5" /></span>
      {title}{help && <span title={help} aria-label={help}><Info className="h-3.5 w-3.5 text-portal-navy" /></span>}
    </h2>
    {children}
  </section>;
}