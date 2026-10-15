import { useEffect, useMemo, useRef } from "react";
import type {
  CreateCategoryInput,
  CreateRoleInput,
  UpdateUserInput,
  WorkspaceActions,
} from "../services/workspaceService";
import { useAppDispatch } from "../state/hooks";
import {
  mutateWorkspace,
  type WorkspaceMutation,
} from "../state/workspaceThunks";

export function useWorkspaceActions(): WorkspaceActions {
  const dispatch = useAppDispatch();
  const pending = useRef(new Set<{ abort: () => void }>());
  useEffect(() => {
    const requests = pending.current;
    return () => {
      for (const request of requests) request.abort();
      requests.clear();
    };
  }, []);
  return useMemo(() => {
    async function execute(operation: WorkspaceMutation) {
      const request = dispatch(mutateWorkspace(operation));
      pending.current.add(request);
      try {
        const result = await request;
        if (mutateWorkspace.fulfilled.match(result) && result.payload) {
          window.location.assign(result.payload);
        }
      } finally {
        pending.current.delete(request);
      }
    }
    return {
      createCategory: (input: CreateCategoryInput) =>
        execute({ kind: "create-category", input }),
      createRole: (input: CreateRoleInput) =>
        execute({ kind: "create-role", input }),
      updateUser: (id: string, input: UpdateUserInput) =>
        execute({ kind: "update-user", id, input }),
      deleteCategory: (id: string) => execute({ kind: "delete-category", id }),
      signOut: () => execute({ kind: "sign-out" }),
    };
  }, [dispatch]);
}
