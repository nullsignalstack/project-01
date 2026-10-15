// Runs only inside the local backend container. Test records and sessions are removed.
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { PrismaClient } from "./backend/dist/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
if (
  process.env.NODE_ENV === "production" ||
  process.env.RUN_INTEGRATION_TESTS !== "1"
)
  throw new Error("Explicit local integration-test opt-in required");
const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  }),
});
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prefix = `test-${randomUUID()}`;
const sessions = [];
const userIds = [];
const categoryIds = [];
const roleIds = [];
const origin = new URL(process.env.APP_URL).origin;
async function identity(role) {
  const user = await db.user.create({
    data: {
      subject: `${prefix}-${role.id}`,
      name: "Integration Test",
      email: "test@example.invalid",
      roleId: role.id,
    },
  });
  userIds.push(user.id);
  const sid = randomUUID(),
    csrf = randomUUID();
  sessions.push(sid);
  const signature = createHmac("sha256", process.env.SESSION_SECRET)
    .update(sid)
    .digest("base64")
    .replace(/=+$/, "");
  const cookie = `people.sid=${encodeURIComponent(`s:${sid}.${signature}`)}`;
  await pool.query(
    "INSERT INTO session (sid, sess, expire) VALUES ($1, $2, $3)",
    [
      sid,
      JSON.stringify({
        cookie: {
          originalMaxAge: 3600000,
          expires: new Date(Date.now() + 3600000),
          secure: false,
          httpOnly: true,
          sameSite: "lax",
        },
        userId: user.id,
        csrf,
      }),
      new Date(Date.now() + 3600000),
    ],
  );
  return { cookie, csrf, user };
}
async function request(path, method = "GET", identity, body, csrfOverride) {
  return fetch(`http://localhost:3000${path}`, {
    method,
    redirect: "manual",
    headers: {
      origin,
      "content-type": "application/json",
      ...(identity
        ? {
            cookie: identity.cookie,
            "x-csrf-token": csrfOverride ?? identity.csrf,
          }
        : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
try {
  assert.equal((await request("/api/directory")).status, 401);
  const admin = await identity(
    await db.role.findUniqueOrThrow({ where: { name: "Administrator" } }),
  );
  const member = await identity(
    await db.role.findUniqueOrThrow({ where: { name: "Member" } }),
  );
  const manager = await identity(
    await db.role.findUniqueOrThrow({ where: { name: "Manager" } }),
  );
  assert.equal((await request("/api/me", "GET", admin)).status, 200);
  assert.equal(
    (
      await request(
        "/api/categories",
        "POST",
        admin,
        { name: prefix },
        "invalid",
      )
    ).status,
    403,
  );
  assert.equal(
    (await request("/api/categories", "POST", member, { name: prefix })).status,
    403,
  );
  assert.equal(
    (await request("/api/categories", "POST", manager, { name: "x" })).status,
    400,
  );
  const created = await request("/api/categories", "POST", manager, {
    name: prefix,
    description: "Integration verification",
  });
  assert.equal(created.status, 201);
  const category = await created.json();
  categoryIds.push(category.id);
  assert.equal(
    (await request("/api/categories", "POST", admin, { name: prefix })).status,
    409,
  );
  assert.equal(
    (await request("/api/roles", "POST", member, { name: prefix })).status,
    403,
  );
  const roleResponse = await request("/api/roles", "POST", admin, {
    name: prefix,
    canManageCategories: false,
  });
  assert.equal(roleResponse.status, 201);
  const role = await roleResponse.json();
  roleIds.push(role.id);
  const changes = { roleId: role.id, categoryIds: [category.id] };
  assert.equal(
    (await request(`/api/users/${member.user.id}`, "PATCH", manager, changes))
      .status,
    403,
  );
  assert.equal(
    (await request(`/api/users/${member.user.id}`, "PATCH", admin, changes))
      .status,
    204,
  );
  const updated = await db.user.findUniqueOrThrow({
    where: { id: member.user.id },
    include: { categories: true },
  });
  assert.equal(updated.roleId, role.id);
  assert.equal(updated.categories[0].id, category.id);
  const directory = await (
    await request("/api/directory", "GET", member)
  ).json();
  assert.equal(
    directory.categories.find((c) => c.id === category.id)._count.users,
    1,
  );
  assert.equal(
    (await request("/auth/logout/provider", "GET", member)).status,
    302,
  );
  assert.equal((await request("/api/directory", "GET", member)).status, 200);
  const logout = await request("/auth/logout", "POST", member);
  assert.equal(logout.status, 200);
  assert.equal((await logout.json()).redirectUrl, "/auth/logout/provider");
  const anonymousCookie = logout.headers.get("set-cookie").split(";")[0];
  const continuation = await request("/auth/logout/provider", "GET", {
    cookie: anonymousCookie,
  });
  assert.equal(continuation.status, 302);
  const providerLogout = new URL(continuation.headers.get("location"));
  assert.equal(
    providerLogout.searchParams.get("client_id"),
    process.env.OIDC_CLIENT_ID,
  );
  assert.equal(
    providerLogout.searchParams.get("post_logout_redirect_uri"),
    new URL("/", origin).href,
  );
  assert.equal(
    (
      await request("/auth/logout/provider", "GET", { cookie: anonymousCookie })
    ).headers.get("location"),
    "/",
  );
  assert.equal((await request("/api/directory", "GET", member)).status, 401);
  console.log(
    "PASS: authentication boundary, CSRF, member/manager/admin permissions, validation, duplicate handling, category creation, role creation, membership assignment, counts, and logout.",
  );
} finally {
  await pool.query("DELETE FROM session WHERE sid = ANY($1::text[])", [
    sessions,
  ]);
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await db.category.deleteMany({ where: { id: { in: categoryIds } } });
  await db.role.deleteMany({ where: { id: { in: roleIds } } });
  await pool.end();
  await db.$disconnect();
}
