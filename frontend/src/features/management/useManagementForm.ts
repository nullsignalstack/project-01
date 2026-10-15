import { useCallback, type FormEvent } from "react";
import type { ManagementDialogState } from "../../state/workspaceUiState";
import type { WorkspaceActions } from "../../services/workspaceService";

export function useManagementForm(
  dialog: ManagementDialogState,
  actions: WorkspaceActions,
) {
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      switch (dialog.kind) {
        case "edit-user":
          void actions.updateUser(dialog.userId, {
            roleId: String(form.get("roleId")),
            categoryIds: form.getAll("categoryIds").map(String),
          });
          break;
        case "create-category":
          void actions.createCategory({
            name: String(form.get("name")),
            description: String(form.get("description")),
          });
          break;
        case "create-role":
          void actions.createRole({
            name: String(form.get("name")),
            canManageCategories: form.has("canManageCategories"),
          });
          break;
      }
    },
    [dialog, actions],
  );
  return { handleSubmit };
}
