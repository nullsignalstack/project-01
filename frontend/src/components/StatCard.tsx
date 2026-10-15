import type { ReactNode } from "react";
export function Stat({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <section className="panel stat">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong>{String(value).padStart(2, "0")}</strong>
      <p>
        <span className="tiny-dot" />
        {detail}
      </p>
    </section>
  );
}
