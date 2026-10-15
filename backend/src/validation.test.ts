import assert from "node:assert/strict";
import { test } from "node:test";
import { categoryBody } from "./modules/categories/category.schema.js";
import { roleBody } from "./modules/roles/role.schema.js";
import { membershipBody } from "./modules/users/user.schema.js";

test("category input trims names and rejects unknown fields and invalid lengths", () => {
  assert.deepEqual(categoryBody.parse({ name: " Team " }), {
    name: "Team",
    description: "",
  });
  for (const input of [
    { name: "x" },
    { name: "Team", isAdmin: true },
    { name: "Team", description: "x".repeat(241) },
  ]) {
    assert.equal(categoryBody.safeParse(input).success, false);
  }
});
test("role input cannot grant the reserved administrator permission", () => {
  assert.deepEqual(roleBody.parse({ name: "Editor" }), {
    name: "Editor",
    canManageCategories: false,
  });
  assert.equal(
    roleBody.safeParse({ name: "Editor", isAdmin: true }).success,
    false,
  );
});
test("membership input requires a role and limits category assignments", () => {
  assert.equal(
    membershipBody.safeParse({ roleId: "", categoryIds: [] }).success,
    false,
  );
  assert.equal(
    membershipBody.safeParse({
      roleId: "role",
      categoryIds: Array(101).fill("category"),
    }).success,
    false,
  );
  assert.deepEqual(membershipBody.parse({ roleId: "role", categoryIds: [] }), {
    roleId: "role",
    categoryIds: [],
  });
});

test("something is fishy", ()=> {
  assert.equal(
    true,
    false
  )
})
