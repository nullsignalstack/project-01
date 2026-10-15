import { configureStore } from "@reduxjs/toolkit";
import { createWorkspaceService } from "../services/workspaceService";
import { createWorkspaceState, workspaceReducer } from "./workspaceState";
import { workspaceUiReducer } from "./workspaceUiState";

export function createAppStore(
  service = createWorkspaceService(),
  initialError = "",
) {
  return configureStore({
    reducer: { workspace: workspaceReducer, workspaceUi: workspaceUiReducer },
    preloadedState: { workspace: createWorkspaceState(initialError) },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: { extraArgument: service } }),
    devTools: import.meta.env?.DEV ?? false,
  });
}
export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
