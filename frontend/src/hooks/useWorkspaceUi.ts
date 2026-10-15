import { useCallback } from "react";
import type { WorkspaceTab } from "../types";
import type { User } from "../models";
import { uiActions } from "../state/workspaceUiState";

import { useAppDispatch, useAppSelector } from "../state/hooks";
import { selectWorkspaceUi } from "../state/selectors";

export function useWorkspaceUi() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectWorkspaceUi);
  const navigate = useCallback(
    (tab: WorkspaceTab) =>
      dispatch(uiActions.navigate({ tab, resetFilters: true })),
    [dispatch],
  );
  const view = useCallback(
    (tab: WorkspaceTab) =>
      dispatch(uiActions.navigate({ tab, resetFilters: false })),
    [dispatch],
  );
  const setSearch = useCallback(
    (search: string) => dispatch(uiActions.searchChanged(search)),
    [dispatch],
  );
  const setRoleFilter = useCallback(
    (roleFilter: string) => dispatch(uiActions.roleFilterChanged(roleFilter)),
    [dispatch],
  );
  const createCategory = useCallback(
    () => dispatch(uiActions.dialogOpened({ kind: "create-category" })),
    [dispatch],
  );
  const createRole = useCallback(
    () => dispatch(uiActions.dialogOpened({ kind: "create-role" })),
    [dispatch],
  );
  const editUser = useCallback(
    (user: User) =>
      dispatch(uiActions.dialogOpened({ kind: "edit-user", userId: user.id })),
    [dispatch],
  );
  const closeDialog = useCallback(
    () => dispatch(uiActions.dialogClosed()),
    [dispatch],
  );
  return {
    ...state,
    navigate,
    view,
    setSearch,
    setRoleFilter,
    createCategory,
    createRole,
    editUser,
    closeDialog,
  };
}
