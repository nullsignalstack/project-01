import type { Category } from "./models";
import { useWorkspace } from "./hooks/useWorkspace";
import { Sidebar } from "./components/Sidebar";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { PageHeading } from "./components/PageHeading";
import { WorkspaceFooter } from "./components/WorkspaceFooter";
import { ErrorAlert } from "./components/ErrorAlert";
import { LoginPage } from "./features/auth/LoginPage";
import { Overview } from "./features/overview/Overview";
import { PeopleDirectory } from "./features/directory/PeopleDirectory";
import { Categories } from "./features/categories/Categories";
import { Roles } from "./features/roles/Roles";
import { ManagementDialog } from "./features/management/ManagementDialog";

export function App() {
  const { state, ui, actions, dismissError } = useWorkspace();
  const { user: me, directory: data, error, busy } = state;
  const { tab, search, roleFilter: filter, dialog } = ui;
  if (state.status === "loading")
    return <div className="loading">Loading your workspace…</div>;
  if (!me) return <LoginPage error={error} />;

  const managers = me.role.isAdmin || me.role.canManageCategories;
  const managedUser =
    dialog?.kind === "edit-user"
      ? data.users.find((user) => user.id === dialog.userId)
      : undefined;
  function deleteCategory(category: Category) {
    if (
      window.confirm(
        `Delete “${category.name}”? People will keep their accounts and roles.`,
      )
    ) {
      void actions.deleteCategory(category.id);
    }
  }
  return (
    <div className="shell">
      <Sidebar
        me={me}
        peopleCount={data.users.length}
        activeTab={tab}
        onNavigate={ui.navigate}
        onSignOut={actions.signOut}
      />
      <div className="main-wrap">
        <WorkspaceHeader tab={tab} onSignOut={actions.signOut} />
        <main className="content">
          <PageHeading
            tab={tab}
            managers={managers}
            onCreateCategory={ui.createCategory}
          />
          <ErrorAlert message={error} onDismiss={dismissError} />
          {tab === "Overview" && (
            <Overview
              data={data}
              onViewRoles={() => ui.view("Roles")}
              onViewCategories={() => ui.view("Categories")}
            />
          )}
          {(tab === "Overview" || tab === "People") && (
            <PeopleDirectory
              people={data.users}
              roles={data.roles}
              me={me}
              tab={tab}
              search={search}
              filter={filter}
              onSearchChange={ui.setSearch}
              onRoleFilterChange={ui.setRoleFilter}
              onManageUser={ui.editUser}
            />
          )}
          {tab === "Categories" && (
            <Categories
              categories={data.categories}
              managers={managers}
              onDelete={deleteCategory}
            />
          )}
          {tab === "Roles" && (
            <Roles
              roles={data.roles}
              isAdmin={me.role.isAdmin}
              onCreateRole={ui.createRole}
            />
          )}
          <WorkspaceFooter />
        </main>
      </div>
      {dialog && (dialog.kind !== "edit-user" || managedUser) && (
        <ManagementDialog
          dialog={dialog}
          user={managedUser}
          roles={data.roles}
          categories={data.categories}
          error={error}
          busy={busy}
          onClose={ui.closeDialog}
          actions={actions}
        />
      )}
    </div>
  );
}
