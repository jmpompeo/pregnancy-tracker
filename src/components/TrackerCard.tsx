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
  <section className="tracker-card">
    <header>
      <h2>{title}</h2>
      {description && <p className="muted">{description}</p>}
    </header>
    <div>{children}</div>
  </section>
);
