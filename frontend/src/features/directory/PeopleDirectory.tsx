import { useFilteredPeople } from "./useFilteredPeople";
import { PersonRow } from "./PersonRow";
import { Search } from "lucide-react";
import type { User, Role } from "../../models";
import type { WorkspaceTab } from "../../types";
type PeopleDirectoryProps = {
  people: User[];
  roles: Role[];
  me: User;
  tab: WorkspaceTab;
  search: string;
  filter: string;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onManageUser: (user: User) => void;
};
export function PeopleDirectory({
  people,
  roles,
  me,
  tab,
  search,
  filter,
  onSearchChange,
  onRoleFilterChange,
  onManageUser,
}: PeopleDirectoryProps) {
  const users = useFilteredPeople(people, search, filter);
  return (
    <section className="panel people-panel">
      <div className="panel-heading">
        <div>
          <h2>
            {tab === "Overview" ? "Your people" : "People directory"}{" "}
            <span className="count-chip">{people.length}</span>
          </h2>
          <p>Familiar faces. New connections. One directory.</p>
        </div>
        <span className="live-dot">Live directory</span>
      </div>
      <div className="toolbar">
        <div className="search">
          <Search size={17} />
          <input
            aria-label="Search people"
            placeholder="Search by name, email, or category…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter by role"
          value={filter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
        >
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>NAME</th>
              <th>ROLE</th>
              <th>CATEGORIES</th>
              <th>JOINED</th>
              {me.role.isAdmin && <th />}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <PersonRow
                key={user.id}
                user={user}
                me={me}
                onManageUser={onManageUser}
              />
            ))}
          </tbody>
        </table>
        {!users.length && (
          <div className="empty">No people match your search.</div>
        )}
      </div>
      <footer className="table-footer">
        Showing {users.length} of {people.length} people
        <span>Good things happen when people connect.</span>
      </footer>
    </section>
  );
}
