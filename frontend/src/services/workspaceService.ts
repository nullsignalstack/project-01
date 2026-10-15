import { createApiClient } from "../api";
import type { Directory, User } from "../models";

export type CreateCategoryInput = { name: string; description: string };
export type CreateRoleInput = { name: string; canManageCategories: boolean };
export type UpdateUserInput = { roleId: string; categoryIds: string[] };
type SessionResponse = { user: User | null; csrf: string | null };

export function createWorkspaceService() {
  const { request: api, setCsrf } = createApiClient();
  return {
    async loadSession(signal?: AbortSignal) {
      const session = await api<SessionResponse>(
        "/api/me",
        "GET",
        undefined,
        signal,
      );
      setCsrf(session.csrf || "");
      return session;
    },
    loadDirectory: (signal?: AbortSignal) =>
      api<Directory>("/api/directory", "GET", undefined, signal),
    createCategory: (body: CreateCategoryInput, signal?: AbortSignal) =>
      api("/api/categories", "POST", body, signal),
    createRole: (body: CreateRoleInput, signal?: AbortSignal) =>
      api("/api/roles", "POST", body, signal),
    updateUser: (id: string, body: UpdateUserInput, signal?: AbortSignal) =>
      api(`/api/users/${id}`, "PATCH", body, signal),
    deleteCategory: (id: string, signal?: AbortSignal) =>
      api(`/api/categories/${id}`, "DELETE", undefined, signal),
    signOut: (signal?: AbortSignal) =>
      api<{ redirectUrl: string } | undefined>(
        "/auth/logout",
        "POST",
        undefined,
        signal,
      ),
  };
}

export type WorkspaceActions = {
  createCategory: (input: CreateCategoryInput) => Promise<void>;
  createRole: (input: CreateRoleInput) => Promise<void>;
  updateUser: (id: string, input: UpdateUserInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
};
