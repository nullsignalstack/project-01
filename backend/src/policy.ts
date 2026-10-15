export type Permissions = { isAdmin: boolean; canManageCategories: boolean };
export function mayManageCategories(role: Permissions) {
  return role.isAdmin || role.canManageCategories;
}
export function mayChangeRole(
  actor: Permissions,
  targetIsAdmin: boolean,
  nextIsAdmin: boolean,
  adminCount: number,
) {
  return actor.isAdmin && !(targetIsAdmin && !nextIsAdmin && adminCount <= 1);
}
