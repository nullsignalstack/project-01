# Frontend architecture

`main.tsx` mounts React. `App.tsx` composes screens and connects their props to workspace state and actions; it does not make HTTP requests.

## Redux state ownership

`state/store.ts` creates a Redux Toolkit store with `workspace` and `workspaceUi` slices. `main.tsx` supplies it through React Redux's `Provider`. Typed dispatch/selector hooks live in `state/hooks.ts`, and selectors live in `state/selectors.ts`. Redux DevTools is enabled only in development. Store state and actions remain serializable.

- The `workspace` slice owns session/directory data, loading, errors, and mutation status. `loadWorkspace` and `mutateWorkspace` are async thunks. Mutations reject duplicate submissions while pending, close the dialog after a successful write, and refresh the session and directory. Failed writes keep the dialog open. Request IDs prevent stale loads from overwriting newer data.
- The `workspaceUi` slice owns navigation, search, role filtering, and the active dialog. Sidebar navigation clears filters; overview links retain them. Edit dialogs store a user ID and derive the current user from directory data.
- `useWorkspaceData` subscribes to server state and dispatches/cancels the initial load. `useWorkspaceUi` binds typed UI actions. `useWorkspaceActions` binds domain mutation thunks and cancels its in-flight requests on unmount. `useWorkspace` composes these adapters for the existing UI.
- `createAppStore` accepts an injected workspace service through thunk middleware. Each store gets an independent API client. CSRF tokens, services, promises, and AbortControllers stay outside Redux state. Tests can inject a fake service without network calls.

## Data and components

`models.ts` holds domain types. `services/workspaceService.ts` maps typed operations to API endpoints. Each workspace owns its own API client and CSRF token; tokens are not React UI state or browser storage.

`components/` holds shared layout and presentation. `features/` contains feature-specific components, selectors, and hooks. `PeopleDirectory` receives only people and roles, uses a derived filter selector, and renders `PersonRow`. `ManagementDialog` composes entity fields and membership fields; its form hook dispatches domain actions. Inputs remain uncontrolled with `FormData` where appropriate. Avoid storing filtered lists or copies of selected users in state.

Keep domain rules in pure reducers/selectors and request mapping in the service. Keep form drafts within their form rather than adding them to the workspace reducers. Use Redux actions for shared workspace state; keep transient field drafts local. Add RTK Query only when server caching requirements justify changing the current refresh lifecycle.

## Verification

From the repository root:

```sh
npm run test -w frontend
npm run build -w frontend
npm run format:check
```

Frontend tests cover slice reducers, real Redux thunk dispatches, navigation/filter semantics, dialog transitions, session cleanup, successful and failed mutations, duplicate-submit prevention, stale and aborted loads, request cancellation, API error handling, and CSRF isolation. UI components and CSS are unchanged by the Redux migration.
