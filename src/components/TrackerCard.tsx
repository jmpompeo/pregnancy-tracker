import type { PropsWithChildren } from "react";

interface TrackerCardProps {
  title: string;
  description?: string;
}

/**
 * <summary>Reusable shell so each tracker section feels consistent.</summary>
 */
export const TrackerCard = ({
  title,
  description,
  children,
}: PropsWithChildren<TrackerCardProps>) => (
  <section className="space-y-4 rounded-2xl border border-white/15 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur">
    <header className="space-y-1">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {description && <p className="text-sm text-slate-200/80">{description}</p>}
    </header>
    <div className="space-y-4">{children}</div>
  </section>
);
