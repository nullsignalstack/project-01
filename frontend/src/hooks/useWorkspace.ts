import { useWorkspaceData } from "./useWorkspaceData";
import { useWorkspaceUi } from "./useWorkspaceUi";
import { useWorkspaceActions } from "./useWorkspaceActions";

/** Composition boundary: joins server state, UI state, and domain actions. */
export function useWorkspace() {
  const { state, dismissError } = useWorkspaceData();
  const ui = useWorkspaceUi();
  const actions = useWorkspaceActions();
  return { state, ui, actions, dismissError };
}
