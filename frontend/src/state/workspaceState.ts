import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Directory, User } from "../models";
import { sessionLoaded } from "./events";
import { loadWorkspace, mutateWorkspace } from "./workspaceThunks";

export type WorkspaceState = {
  status: "loading" | "ready";
  user: User | null;
  directory: Directory;
  error: string;
  busy: boolean;
  loadRequestId: string | null;
};
export function createWorkspaceState(error = ""): WorkspaceState {
  return {
    status: "loading",
    user: null,
    directory: { users: [], roles: [], categories: [] },
    error,
    busy: false,
    loadRequestId: null,
  };
}
const workspaceSlice = createSlice({
  name: "workspace",
  initialState: createWorkspaceState(),
  reducers: {
    errorChanged(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(sessionLoaded, (state, action) => {
        state.user = action.payload;
        if (!action.payload)
          state.directory = { users: [], roles: [], categories: [] };
      })
      .addCase(loadWorkspace.pending, (state, action) => {
        state.loadRequestId = action.meta.requestId;
      })
      .addCase(loadWorkspace.fulfilled, (state, action) => {
        if (state.loadRequestId !== action.meta.requestId) return;
        if (action.payload) state.directory = action.payload;
        state.status = "ready";
        state.loadRequestId = null;
      })
      .addCase(loadWorkspace.rejected, (state, action) => {
        if (state.loadRequestId !== action.meta.requestId) return;
        state.loadRequestId = null;
        if (!action.meta.aborted) {
          state.status = "ready";
          state.error = action.payload || "Request failed. Please try again.";
        }
      })
      .addCase(mutateWorkspace.pending, (state) => {
        state.busy = true;
        state.error = "";
      })
      .addCase(mutateWorkspace.fulfilled, (state) => {
        state.busy = false;
      })
      .addCase(mutateWorkspace.rejected, (state, action) => {
        state.busy = false;
        if (!action.meta.aborted)
          state.error = action.payload || "Request failed. Please try again.";
      }),
});
export const { errorChanged } = workspaceSlice.actions;
export const workspaceReducer = workspaceSlice.reducer;
