import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { selectWorkspace } from "../state/selectors";
import { errorChanged } from "../state/workspaceState";
import { loadWorkspace } from "../state/workspaceThunks";
export function useWorkspaceData() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectWorkspace);
  useEffect(() => {
    const request = dispatch(loadWorkspace());
    return () => request.abort();
  }, [dispatch]);
  const dismissError = useCallback(() => {
    dispatch(errorChanged(""));
  }, [dispatch]);
  return { state, dismissError };
}
