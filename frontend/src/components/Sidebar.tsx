import {
  Layers,
  LayoutDashboard,
  Users,
  Shapes,
  ShieldCheck,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import type { User } from "../models";
import type { WorkspaceTab } from "../types";
const navigationItems: { label: WorkspaceTab; icon: LucideIcon }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "People", icon: Users },
  { label: "Categories", icon: Shapes },
  { label: "Roles", icon: ShieldCheck },
];
type SidebarProps = {
  me: User;
  peopleCount: number;
  activeTab: WorkspaceTab;
  onNavigate: (tab: WorkspaceTab) => void;
  onSignOut: () => void;
};
export function Sidebar({
  me,
  peopleCount,
  activeTab,
  onNavigate,
  onSignOut,
}: SidebarProps) {
  return (
    <aside>
      <div className="brand">
        <span className="brand-icon">
          <Layers size={20} />
        </span>
        PeopleSpace<span className="brand-dot">.</span>
      </div>
      <div className="workspace">
        <span className="workspace-avatar">P</span>
        <div>
          My workspace<small>People & access</small>
        </div>
        <span className="workspace-check">⌄</span>
      </div>
      <p className="nav-label">WORKSPACE</p>
      <nav>
        {navigationItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={activeTab === label ? "active" : ""}
            onClick={() => onNavigate(label)}
          >
            <Icon size={19} />
            {label}
            {label === "People" && (
              <span className="nav-count">{peopleCount}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="aside-note">
        <ShieldCheck size={22} />
        <strong>Access, with intention.</strong>
        <p>Give everyone the right place in your workspace.</p>
      </div>
      <div className="profile">
        <span className="avatar">{me.name.slice(0, 1)}</span>
        <div>
          <strong>{me.name}</strong>
          <small>{me.role.name}</small>
        </div>
        <button title="Sign out" onClick={onSignOut}>
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
