import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  highlight?: string;
  trend?: string;
}

export function StatsCard({ title, value, description, icon, highlight, trend }: StatsCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
          {highlight ? <p className="text-xs text-muted-foreground">{highlight}</p> : null}
        </div>
        {icon ? <div className="rounded-full bg-primary/10 p-3 text-primary">{icon}</div> : null}
      </div>
      {description ? <p className="mt-4 text-sm text-muted-foreground">{description}</p> : null}
      {trend ? <p className="mt-1 text-xs font-medium text-emerald-500">{trend}</p> : null}
    </div>
  );
}
