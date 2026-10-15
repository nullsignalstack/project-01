import { Plus, ShieldCheck } from "lucide-react";
import type { Role } from "../../models";
export function Roles({
  roles,
  isAdmin,
  onCreateRole,
}: {
  roles: Role[];
  isAdmin: boolean;
  onCreateRole: () => void;
}) {
  return (
    <>
      <div className="section-action">
        {isAdmin && (
          <button className="button" onClick={onCreateRole}>
            <Plus size={17} /> Create role
          </button>
        )}
      </div>
      <div className="cards">
        {roles.map((role) => (
          <section className="panel category-card" key={role.id}>
            <span className="category-icon">
              <ShieldCheck />
            </span>
            <h2>{role.name}</h2>
            <p>
              {role.isAdmin
                ? "Full workspace access, user assignments, and role management."
                : role.canManageCategories
                  ? "Create and manage workspace categories. View the people directory."
                  : "View the people directory, categories, and role distribution."}
            </p>
            <div>
              <span>{role._count?.users || 0} people</span>
              <span className="badge">
                {role.isAdmin ? "Administrator" : "Custom access"}
              </span>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
