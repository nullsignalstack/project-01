import { LogOut } from "lucide-react";
import type { WorkspaceTab } from "../types";
export function WorkspaceHeader({
  tab,
  onSignOut,
}: {
  tab: WorkspaceTab;
  onSignOut: () => void;
}) {
  return (
    <header>
      <span>
        Workspace <span className="slash">/</span> <strong>{tab}</strong>
      </span>
      <span className="secure">
        <span /> Secure workspace
      </span>
      <button className="mobile-signout" title="Sign out" onClick={onSignOut}>
        <LogOut size={16} /> Sign out
      </button>
    </header>
  );
}
