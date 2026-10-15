# PeopleSpace

A people directory and access dashboard built with Express 5 + TypeScript, React 19 + Vite + TypeScript, PostgreSQL, and Prisma. Docker Compose runs the frontend, backend, database, and a local Keycloak identity provider.

## Run with Docker

Requires Docker Engine / Docker Desktop with Compose.

```sh
cp .env.example .env
# Edit secrets before sharing or deploying this environment.
docker compose up --build -d
```

Open http://localhost:8080 and choose **Sign in to your workspace**. Keycloak can take a minute to initialize on first startup.

Local demo accounts (development only):

| Username | Password          | Application role |
| -------- | ----------------- | ---------------- |
| admin    | Admin-local-123!  | Administrator    |
| member   | Member-local-123! | Member           |

Only users who have signed in appear in the directory. Sign in with both accounts to populate it. The administrator can create categories, assign multiple categories to users, create custom roles, and change user roles. Managers can create/delete categories; members can view the directory and dashboard. Categories are independent labels such as teams, interests, or expertise. Every user has one role and any number of categories.

Keycloak uses `http://keycloak.localhost:8081` as its issuer so the same hostname works in the browser and Docker network. Modern browsers resolve `.localhost` to loopback. If your system does not, map `127.0.0.1 keycloak.localhost` in your hosts file. The Keycloak admin console is at http://keycloak.localhost:8081, username `admin`, password from `KEYCLOAK_ADMIN_PASSWORD`.

```sh
docker compose logs -f backend
docker compose stop
```

PostgreSQL and Keycloak data persist in named volumes. Realm import only applies on the first initialization; changing imported users or client credentials later requires updating Keycloak through its admin console. The client secret in `.env` must match the client configured in Keycloak.

## Local development

Requires Node.js 22.12+ and npm. Keep the database and Keycloak running:

```sh
cp .env.example .env
docker compose up -d db keycloak
npm ci
```

For local Vite development, set `APP_URL=http://localhost:5173` and `OIDC_REDIRECT_URI=http://localhost:5173/auth/callback` in the root `.env`. The default database URL targets the exposed local PostgreSQL port. Both callback URLs are registered with the included Keycloak realm.

```sh
npm run db:migrate -w backend
npm run dev:backend
# In another terminal:
npm run dev:frontend
```

Open http://localhost:5173. Vite proxies `/api` and `/auth` to Express. If database migration is run before client generation, run `npm run build` once. Root `.env` is loaded by the backend scripts, including when invoked using npm workspaces.

## Checks

```sh
npm run build
npm test
```

The build generates Prisma Client, type-checks both applications, and creates the frontend bundle. Tests cover category permissions and protection of the last administrator. Database migrations are committed in `backend/prisma/migrations`; the API container applies them before starting. Health is available at `/api/health`.

## Authentication and deployment

Login uses OAuth 2.0 Authorization Code with PKCE and OpenID Connect for identity. `openid-client` validates the returned ID token, issuer, audience, state, nonce, and code exchange. The application requires a verified email. Accounts are keyed by issuer + subject, so matching emails do not merge identities. Tokens are not sent to the frontend or stored in local storage. Sessions live in PostgreSQL with an eight-hour cookie lifetime; sign-out ends the application session and redirects the browser to the provider’s OIDC end-session endpoint when supported. The ID-token logout hint stays in the server session until the redirect. Sign-in always requests fresh authentication.

To use Google, Auth0, Microsoft Entra ID, or another OIDC provider, configure `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, and register `OIDC_REDIRECT_URI` with that provider. Register the application root URL (including the trailing slash) as an allowed post-logout redirect URI as well. The provider must return `email` and `email_verified=true`. `BOOTSTRAP_ADMIN_EMAIL` grants the administrator role only when that verified identity is first created. Later role changes are managed in the app. Use a trusted provider and restrict which accounts can register with it.

The supplied Compose configuration and imported credentials are **for local development**. For production:

- Use a managed or hardened PostgreSQL and OIDC provider; replace all sample credentials and use a random session secret (at least 32 characters).
- Set backend `NODE_ENV=production` and HTTPS application, redirect, and issuer URLs. The backend rejects HTTP URLs in production and enables secure cookies.
- Place a trusted TLS-terminating reverse proxy in front of nginx. Configure nginx's forwarded scheme for that deployment and preserve the original HTTPS scheme through the proxy chain; the included nginx configuration targets local HTTP development.
- Do not publicly expose PostgreSQL or the API directly. Back up database volumes and manage migrations as part of release deployment.
- Session middleware creates its PostgreSQL session table on first use; provision it separately if the runtime DB account has restricted DDL permissions.

The directory is visible to all authenticated users, including emails. Only administrators may change user roles/memberships or create roles. Category managers can delete categories, which removes their memberships but preserves users. Built-in roles are protected from editing through the API. The last administrator cannot be demoted, including under concurrent requests.

## Project layout

- `backend/src/auth.ts`: provider integration and session login/logout
- `backend/src/app.ts`: protected routes, validation, CSRF checks, and error mapping
- `backend/src/policy.ts`: authorization rules
- `backend/prisma/`: data model and migrations
- `frontend/src/`: dashboard, directory, role/category management, responsive styling
- `Dockerfile`, `compose.yaml`, `docker/`: container builds, reverse proxy, local identity provider

Reference documentation: [openid-client](https://github.com/panva/openid-client), [Prisma 7](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7), [Vite](https://vite.dev/guide/).

With the local Docker stack running, after the first sign-in creates the session table, run the API integration smoke test:

```sh
docker compose exec -T -e RUN_INTEGRATION_TESTS=1 backend node --input-type=module < backend/test/integration.mjs
```

This checks authentication, CSRF, role boundaries, validation, category and role creation, membership updates, aggregate counts, and logout. It creates temporary records and removes them in a `finally` block. It refuses to run in production.

The root `deepmerge-ts` override pins Prisma CLI's merge utility to the patched 8.x line. Keep it until Prisma's dependency includes that fix; `npm audit` reports no known advisories with the committed lockfile.

Existing Keycloak installations must add `http://localhost:8080/` and `http://localhost:5173/` under the people-space client's **Valid post logout redirect URIs**. The realm import includes these for new installations but does not overwrite an existing realm. Sessions created before the logout fix may show Keycloak's logout confirmation once because they do not contain an ID-token hint.
