# Backend architecture

Express 5 handles rejected async handlers through the central error middleware. The API paths, response bodies, permission rules, and session behavior are shared with the existing frontend.

- `src/app.ts` composes middleware and routers; `createApp()` does not open a listening socket.
- `src/server.ts` owns startup, default-role initialization, and shutdown.
- `src/routes/api.ts` maps API requests to validated operations and responses.
- `src/modules/` groups schemas, persistence queries, and application services by feature. Repositories own database access; the membership service owns the atomic role/category update and administrator protection.
- `src/modules/auth/` separates OAuth HTTP/session orchestration, provider operations, discovery caching, and identity persistence. ID token hints stay in the server session.
- `src/http/` owns sessions, CSRF, typed authentication/authorization middleware, and safe error responses.
- `src/policy.ts` contains pure permission rules. `src/config.ts` validates the environment; `src/db.ts` owns the Prisma client and default roles.

Keep request validation at the HTTP boundary. Add services for business rules and transactions; straightforward CRUD can use repository functions directly. Avoid duplicating authorization or Prisma error mapping in individual routes.

Run `npm run test -w backend` for policy and validation tests, and `npm run build -w backend` to generate Prisma and type-check. The opt-in `test/integration.mjs` exercises the running local Docker API with temporary records, including authentication, permissions, CSRF, membership, counts, and logout. Run it with:

```sh
docker compose exec -T -e RUN_INTEGRATION_TESTS=1 backend node --input-type=module < backend/test/integration.mjs
```

## Prisma 7

Use Node.js 22.12+ and install dependencies from the project root with `npm ci`.

`prisma.config.ts` loads the shared root `.env` for CLI commands and defines the migration connection URL. Docker supplies environment variables directly. The schema contains the PostgreSQL provider and data model. Runtime connections use `PrismaPg` in `src/db.ts` with a five-second connection timeout.

The client is generated into `src/generated/prisma` and compiled into `dist/generated/prisma`. Do not edit generated files. After schema changes run `npm run db:generate -w backend`. Validate with `npm run db:validate -w backend`; apply committed migrations with `npm run db:migrate -w backend`.

The editor uses Prisma 7 validation. Reload its window if old diagnostics remain. This upgrade preserves the data model and existing SQL migrations.
