import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 rounded-2xl border border-border/70 bg-white/70 p-5 shadow-soft md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold text-brand-deep">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-foreground/70">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
