import {
  Users,
  Shapes,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import type { Directory } from "../../models";
import { Stat } from "../../components/StatCard";
export function Overview({
  data,
  onViewRoles,
  onViewCategories,
}: {
  data: Directory;
  onViewRoles: () => void;
  onViewCategories: () => void;
}) {
  return (
    <>
      <section className="stats">
        <Stat
          icon={<Users />}
          label="Total people"
          value={data.users.length}
          detail="People in your workspace"
        />
        <Stat
          icon={<Shapes />}
          label="Categories"
          value={data.categories.length}
          detail="Connections with a purpose"
        />
        <Stat
          icon={<ShieldCheck />}
          label="Workspace roles"
          value={data.roles.length}
          detail="A place for every responsibility"
        />
      </section>
      <div className="overview-grid">
        <section className="panel role-panel">
          <div className="panel-heading">
            <div>
              <h2>People by role</h2>
              <p>The right access for every person.</p>
            </div>
            <button className="text-button" onClick={onViewRoles}>
              View roles <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="role-bars">
            {data.roles.map((role, i) => (
              <div className="role-row" key={role.id}>
                <span className={`role-symbol color-${i % 3}`}>
                  <ShieldCheck size={18} />
                </span>
                <div className="bar-content">
                  <div>
                    <strong>{role.name}</strong>
                    <span>{role._count?.users || 0} people</span>
                  </div>
                  <div className="bar">
                    <span
                      className={`fill color-${i % 3}`}
                      style={{
                        width: `${data.users.length ? ((role._count?.users || 0) / data.users.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="spotlight">
          <span className="spotlight-icon">
            <Shapes size={27} />
          </span>
          <span className="eyebrow">BETTER TOGETHER</span>
          <h2>
            Make room for
            <br />
            meaningful connections.
          </h2>
          <p>
            Group people by team, interest, or expertise. Your workspace, your
            categories.
          </p>
          <button onClick={onViewCategories}>
            Explore categories <ArrowRight size={17} />
          </button>
          <span className="decor decor-one" />
          <span className="decor decor-two" />
        </section>
      </div>
    </>
  );
}
