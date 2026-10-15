import { sessionLoaded } from "../src/state/events";
import { createAppStore } from "../src/state/store";
import { loadWorkspace, mutateWorkspace } from "../src/state/workspaceThunks";
import type { createWorkspaceService } from "../src/services/workspaceService";
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createWorkspaceState,
  workspaceReducer,
} from "../src/state/workspaceState";
import {
  uiActions,
  initialWorkspaceUiState,
  workspaceUiReducer,
} from "../src/state/workspaceUiState";
import { filterPeople } from "../src/features/directory/filterPeople";
import { createApiClient } from "../src/api";
import type { User } from "../src/models";

const user: User = {
  id: "alex",
  name: "Alex Morgan",
  email: "alex@example.com",
  createdAt: "2026-10-15T00:00:00Z",
  role: {
    id: "member",
    name: "Member",
    isAdmin: false,
    canManageCategories: false,
  },
  categories: [{ id: "engineering", name: "Engineering", description: "" }],
};

test("sidebar navigation resets filters while overview links retain them", () => {
  const state = {
    ...initialWorkspaceUiState,
    search: "Alex",
    roleFilter: "member",
  };
  assert.deepEqual(
    workspaceUiReducer(
      state,
      uiActions.navigate({ tab: "People", resetFilters: true }),
    ),
    { ...state, tab: "People", search: "", roleFilter: "" },
  );
  assert.deepEqual(
    workspaceUiReducer(
      state,
      uiActions.navigate({ tab: "Roles", resetFilters: false }),
    ),
    { ...state, tab: "Roles" },
  );
});
test("dialog stores a user ID and closing preserves filters", () => {
  const state = { ...initialWorkspaceUiState, search: "Alex" };
  const opened = workspaceUiReducer(
    state,
    uiActions.dialogOpened({ kind: "edit-user", userId: user.id }),
  );
  assert.deepEqual(opened.dialog, { kind: "edit-user", userId: user.id });
  assert.deepEqual(workspaceUiReducer(opened, uiActions.dialogClosed()), state);
});
test("session expiration clears visible data without mutating previous state", () => {
  const state = {
    ...createWorkspaceState(),
    user,
    directory: {
      users: [user],
      roles: [user.role],
      categories: user.categories,
    },
  };
  const next = workspaceReducer(state, sessionLoaded(null));
  assert.equal(next.user, null);
  assert.deepEqual(next.directory, { users: [], roles: [], categories: [] });
  assert.equal(state.directory.users.length, 1);
});
test("directory search matches names, email and categories, together with the role filter", () => {
  for (const query of ["ALEX", "example.com", "engineering"])
    assert.deepEqual(filterPeople([user], query, "member"), [user]);
  assert.deepEqual(filterPeople([user], "engineering", "admin"), []);
  assert.deepEqual(filterPeople([user], "missing", ""), []);
});
test("API clients isolate CSRF state and forward cancellation", async () => {
  const originalFetch = globalThis.fetch;
  const requests: RequestInit[] = [];
  globalThis.fetch = async (_url, options) => {
    requests.push(options!);
    return new Response(null, { status: 204 });
  };
  try {
    const first = createApiClient(),
      second = createApiClient();
    first.setCsrf("first-session-token");
    const controller = new AbortController();
    await first.request(
      "/api/categories",
      "POST",
      { name: "Engineering" },
      controller.signal,
    );
    await second.request("/api/me");
    assert.equal(
      new Headers(requests[0].headers).get("x-csrf-token"),
      "first-session-token",
    );
    assert.equal(new Headers(requests[1].headers).get("x-csrf-token"), "");
    assert.equal(requests[0].signal, controller.signal);
    assert.equal(requests[0].credentials, "same-origin");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
test("API errors use the server message or a safe fallback", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: "Permission denied" }), {
        status: 403,
      });
    await assert.rejects(
      createApiClient().request("/api/roles"),
      /Permission denied/,
    );
    globalThis.fetch = async () => new Response("Bad gateway", { status: 502 });
    await assert.rejects(
      createApiClient().request("/api/me"),
      /Request failed. Please try again./,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

function fakeService(
  overrides: Partial<ReturnType<typeof createWorkspaceService>> = {},
): ReturnType<typeof createWorkspaceService> {
  return {
    loadSession: async () => ({ user, csrf: "test" }),
    loadDirectory: async () => ({
      users: [user],
      roles: [user.role],
      categories: user.categories,
    }),
    createCategory: async () => undefined,
    createRole: async () => undefined,
    updateUser: async () => undefined,
    deleteCategory: async () => undefined,
    signOut: async () => undefined,
    ...overrides,
  };
}
test("Redux load populates session and directory", async () => {
  const store = createAppStore(fakeService());
  await store.dispatch(loadWorkspace()).unwrap();
  assert.equal(store.getState().workspace.status, "ready");
  assert.equal(store.getState().workspace.user?.id, user.id);
  assert.equal(store.getState().workspace.directory.users.length, 1);
});
test("failed mutations preserve the dialog and surface an error", async () => {
  const store = createAppStore(
    fakeService({
      createCategory: async () => {
        throw new Error("Permission denied");
      },
    }),
  );
  store.dispatch(uiActions.dialogOpened({ kind: "create-category" }));
  await store.dispatch(
    mutateWorkspace({
      kind: "create-category",
      input: { name: "Engineering", description: "" },
    }),
  );
  assert.equal(store.getState().workspace.busy, false);
  assert.equal(store.getState().workspace.error, "Permission denied");
  assert.equal(store.getState().workspaceUi.dialog?.kind, "create-category");
});
test("successful mutation closes the dialog and refreshes directory", async () => {
  let refreshes = 0;
  const store = createAppStore(
    fakeService({
      loadDirectory: async () => {
        refreshes++;
        return { users: [user], roles: [], categories: [] };
      },
    }),
  );
  store.dispatch(uiActions.dialogOpened({ kind: "create-category" }));
  await store
    .dispatch(
      mutateWorkspace({
        kind: "create-category",
        input: { name: "Engineering", description: "" },
      }),
    )
    .unwrap();
  assert.equal(store.getState().workspaceUi.dialog, null);
  assert.equal(refreshes, 1);
  assert.equal(store.getState().workspace.busy, false);
});
test("a pending mutation prevents duplicate submissions", async () => {
  let finish!: () => void;
  let calls = 0;
  const store = createAppStore(
    fakeService({
      createRole: async () => {
        calls++;
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
      },
    }),
  );
  const operation = {
    kind: "create-role",
    input: { name: "Lead", canManageCategories: false },
  } as const;
  const first = store.dispatch(mutateWorkspace(operation));
  await store.dispatch(mutateWorkspace(operation));
  assert.equal(calls, 1);
  assert.equal(store.getState().workspace.busy, true);
  finish();
  await first;
  assert.equal(store.getState().workspace.busy, false);
});
test("aborted load cannot overwrite a subsequent successful load", async () => {
  let finish!: () => void;
  let calls = 0;
  const store = createAppStore(
    fakeService({
      loadSession: async () => {
        calls++;
        if (calls === 1) {
          await new Promise<void>((resolve) => {
            finish = resolve;
          });
          return { user: null, csrf: null };
        }
        return { user, csrf: "test" };
      },
    }),
  );
  const first = store.dispatch(loadWorkspace());
  first.abort();
  await store.dispatch(loadWorkspace()).unwrap();
  finish();
  await first;
  assert.equal(store.getState().workspace.user?.id, user.id);
  assert.equal(store.getState().workspace.error, "");
});
test("aborting a mutation clears busy state and propagates cancellation", async () => {
  let signal: AbortSignal | undefined;
  const store = createAppStore(
    fakeService({
      signOut: async (requestSignal) => {
        signal = requestSignal;
        await new Promise<void>((_resolve, reject) =>
          requestSignal?.addEventListener(
            "abort",
            () => reject(new Error("Aborted")),
            { once: true },
          ),
        );
      },
    }),
  );
  const request = store.dispatch(mutateWorkspace({ kind: "sign-out" }));
  request.abort();
  await request;
  assert.equal(signal?.aborted, true);
  assert.equal(store.getState().workspace.busy, false);
  assert.equal(store.getState().workspace.error, "");
});

test("stores isolate workspace UI and session state", async () => {
  const first = createAppStore(fakeService());
  const second = createAppStore(fakeService());
  await first.dispatch(loadWorkspace()).unwrap();
  first.dispatch(uiActions.searchChanged("Alex"));
  assert.equal(second.getState().workspace.user, null);
  assert.equal(second.getState().workspaceUi.search, "");
});

test("logout clears Redux identity and returns a provider navigation target without reloading the session", async () => {
  let sessionLoads = 0;
  const store = createAppStore(
    fakeService({
      loadSession: async () => {
        sessionLoads++;
        return { user, csrf: "test" };
      },
      signOut: async () => ({ redirectUrl: "/auth/logout/provider" }),
    }),
  );
  await store.dispatch(loadWorkspace()).unwrap();
  const target = await store
    .dispatch(mutateWorkspace({ kind: "sign-out" }))
    .unwrap();
  assert.equal(target, "/auth/logout/provider");
  assert.equal(store.getState().workspace.user, null);
  assert.deepEqual(store.getState().workspace.directory, {
    users: [],
    roles: [],
    categories: [],
  });
  assert.equal(sessionLoads, 1);
});
