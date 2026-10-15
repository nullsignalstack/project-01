import { test } from "node:test";
import assert from "node:assert/strict";
import { mayChangeRole, mayManageCategories } from "./policy.js";
const member = { isAdmin: false, canManageCategories: false };
const admin = { isAdmin: true, canManageCategories: true };
test("members cannot manage categories or change roles", () => {
  assert.equal(mayManageCategories(member), false);
  assert.equal(mayChangeRole(member, false, false, 2), false);
});
test("managers can manage categories without administrator access", () => {
  const manager = { ...member, canManageCategories: true };
  assert.equal(mayManageCategories(manager), true);
  assert.equal(mayChangeRole(manager, false, true, 2), false);
});
test("last administrator cannot be demoted", () => {
  assert.equal(mayChangeRole(admin, true, false, 1), false);
  assert.equal(mayChangeRole(admin, true, false, 2), true);
  assert.equal(mayChangeRole(admin, true, true, 1), true);
});
