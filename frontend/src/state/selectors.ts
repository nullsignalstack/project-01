import type { RootState } from "./store";
export const selectWorkspace = (state: RootState) => state.workspace;
export const selectWorkspaceUi = (state: RootState) => state.workspaceUi;
