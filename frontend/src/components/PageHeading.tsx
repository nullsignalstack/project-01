import { Plus } from "lucide-react";
import type { WorkspaceTab } from "../types";
export function PageHeading({
  tab,
  managers,
  onCreateCategory,
}: {
  tab: WorkspaceTab;
  managers: boolean;
  onCreateCategory: () => void;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">WORKSPACE DIRECTORY</div>
        <h1>{tab === "Overview" ? "Every person. A clearer picture." : tab}</h1>
        <p>
          {tab === "Overview"
            ? "A shared space for your people, roles, and everything that connects them."
            : `Organize and explore your workspace ${tab.toLowerCase()}.`}
        </p>
      </div>
      {managers && (
        <button className="button" onClick={onCreateCategory}>
          <Plus size={17} /> Create category
        </button>
      )}
    </div>
  );
}
