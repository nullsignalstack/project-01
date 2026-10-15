import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WorkspaceTab } from "../types";
import { mutationCommitted } from "./events";
export type ManagementDialogState =
  | { kind: "create-category" }
  | { kind: "create-role" }
  | { kind: "edit-user"; userId: string };
export type WorkspaceUiState = {
  tab: WorkspaceTab;
  search: string;
  roleFilter: string;
  dialog: ManagementDialogState | null;
};
export const initialWorkspaceUiState: WorkspaceUiState = {
  tab: "Overview",
  search: "",
  roleFilter: "",
  dialog: null,
};
const workspaceUiSlice = createSlice({
  name: "workspaceUi",
  initialState: initialWorkspaceUiState,
  reducers: {
    navigate(
      state,
      { payload }: PayloadAction<{ tab: WorkspaceTab; resetFilters: boolean }>,
    ) {
      state.tab = payload.tab;
      if (payload.resetFilters) {
        state.search = "";
        state.roleFilter = "";
      }
    },
    searchChanged(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    roleFilterChanged(state, action: PayloadAction<string>) {
      state.roleFilter = action.payload;
    },
    dialogOpened(state, action: PayloadAction<ManagementDialogState>) {
      state.dialog = action.payload;
    },
    dialogClosed(state) {
      state.dialog = null;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(mutationCommitted, (state) => {
      state.dialog = null;
    }),
});
export const uiActions = workspaceUiSlice.actions;
export const workspaceUiReducer = workspaceUiSlice.reducer;
