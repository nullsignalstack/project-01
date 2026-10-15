import { ArrowUpRight } from "lucide-react";
import type { User } from "../../models";
export function PersonRow({
  user,
  me,
  onManageUser,
}: {
  user: User;
  me: User;
  onManageUser: (user: User) => void;
}) {
  return (
    <tr>
      <td>
        <div className="person">
          <span className="avatar">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </span>
          <div>
            <strong>
              {user.name}{" "}
              {user.id === me.id && <small className="you">you</small>}
            </strong>
            <small>{user.email}</small>
          </div>
        </div>
      </td>
      <td>
        <span
          className={`badge ${user.role.isAdmin ? "admin" : user.role.canManageCategories ? "manager" : ""}`}
        >
          <span />
          {user.role.name}
        </span>
      </td>
      <td>
        <div className="tags">
          {user.categories.length ? (
            user.categories.map((c) => <span key={c.id}>{c.name}</span>)
          ) : (
            <span className="muted">No categories yet</span>
          )}
        </div>
      </td>
      <td className="date">
        {new Date(user.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>
      {me.role.isAdmin && (
        <td>
          <button className="text-button" onClick={() => onManageUser(user)}>
            Manage <ArrowUpRight size={14} />
          </button>
        </td>
      )}
    </tr>
  );
}
