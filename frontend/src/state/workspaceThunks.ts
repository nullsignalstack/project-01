import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Directory } from "../models";
import type {
  createWorkspaceService,
  CreateCategoryInput,
  CreateRoleInput,
  UpdateUserInput,
} from "../services/workspaceService";
import type { WorkspaceState } from "./workspaceState";
import { sessionLoaded, mutationCommitted } from "./events";

type ThunkConfig = {
  state: { workspace: WorkspaceState };
  extra: ReturnType<typeof createWorkspaceService>;
  rejectValue: string;
};
const message = (error: unknown) =>
  error instanceof Error ? error.message : "Request failed. Please try again.";
export const loadWorkspace = createAsyncThunk<
  Directory | null,
  void,
  ThunkConfig
>(
  "workspace/load",
  async (
    _,
    { extra, signal, dispatch, getState, requestId, rejectWithValue },
  ) => {
    try {
      const session = await extra.loadSession(signal);
      if (signal.aborted || getState().workspace.loadRequestId !== requestId)
        return null;
      dispatch(sessionLoaded(session.user));
      return session.user ? await extra.loadDirectory(signal) : null;
    } catch (error) {
      return rejectWithValue(message(error));
    }
  },
);
export type WorkspaceMutation =
  | { kind: "create-category"; input: CreateCategoryInput }
  | { kind: "create-role"; input: CreateRoleInput }
  | { kind: "update-user"; id: string; input: UpdateUserInput }
  | { kind: "delete-category"; id: string }
  | { kind: "sign-out" };
export const mutateWorkspace = createAsyncThunk<
  string | undefined,
  WorkspaceMutation,
  ThunkConfig
>(
  "workspace/mutate",
  async (operation, { extra, signal, dispatch, rejectWithValue }) => {
    try {
      let redirectUrl: string | undefined;
      switch (operation.kind) {
        case "create-category":
          await extra.createCategory(operation.input, signal);
          break;
        case "create-role":
          await extra.createRole(operation.input, signal);
          break;
        case "update-user":
          await extra.updateUser(operation.id, operation.input, signal);
          break;
        case "delete-category":
          await extra.deleteCategory(operation.id, signal);
          break;
        case "sign-out":
          redirectUrl = (await extra.signOut(signal))?.redirectUrl;
          break;
      }
      if (signal.aborted) return;
      if (operation.kind === "sign-out") {
        dispatch(sessionLoaded(null));
        dispatch(mutationCommitted());
        return redirectUrl;
      }
      dispatch(mutationCommitted());
      await dispatch(loadWorkspace(undefined, { signal })).unwrap();
      return redirectUrl;
    } catch (error) {
      return rejectWithValue(message(error));
    }
  },
  { condition: (_, { getState }) => !getState().workspace.busy },
);
