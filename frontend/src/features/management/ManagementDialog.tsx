import { X, ArrowRight } from "lucide-react";
import type { User, Role, Category } from "../../models";
import type { ManagementDialogState } from "../../state/workspaceUiState";
import type { WorkspaceActions } from "../../services/workspaceService";
import { useManagementForm } from "./useManagementForm";
import { UserMembershipFields } from "./UserMembershipFields";
import { CreateEntityFields } from "./CreateEntityFields";
type ManagementDialogProps = {
  dialog: ManagementDialogState;
  user?: User;
  roles: Role[];
  categories: Category[];
  error: string;
  busy: boolean;
  onClose: () => void;
  actions: WorkspaceActions;
};
export function ManagementDialog({
  dialog,
  user,
  roles,
  categories,
  error,
  busy,
  onClose,
  actions,
}: ManagementDialogProps) {
  const { handleSubmit } = useManagementForm(dialog, actions);
  return (
    <div className="modal-backdrop">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button className="close" onClick={onClose} aria-label="Close">
          <X />
        </button>
        <h2 id="modal-title">
          {dialog.kind === "edit-user"
            ? `Manage ${user?.name ?? ""}`
            : `Create ${dialog.kind === "create-category" ? "category" : "role"}`}
        </h2>
        <p>
          {dialog.kind === "edit-user"
            ? "Set their role and category memberships."
            : "Give your workspace a little more structure."}
        </p>
        <form onSubmit={handleSubmit}>
          {dialog.kind === "edit-user" && user ? (
            <UserMembershipFields
              user={user}
              roles={roles}
              categories={categories}
            />
          ) : dialog.kind !== "edit-user" ? (
            <CreateEntityFields kind={dialog.kind} />
          ) : null}
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
            <ArrowRight size={16} />
          </button>
        </form>
      </section>
    </div>
  );
}
