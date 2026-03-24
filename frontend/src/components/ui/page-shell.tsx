import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

interface SurfaceProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <section className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8", className)}>
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-col gap-4 rounded-2xl border border-border/70 bg-card px-5 py-5 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:px-6",
        className
      )}
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p> : null}
      </div>
      {action ? <div className="sm:self-center">{action}</div> : null}
    </header>
  );
}

export function Surface({ children, className }: SurfaceProps) {
  return (
    <div className={cn("rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6", className)}>
      {children}
    </div>
  );
}
