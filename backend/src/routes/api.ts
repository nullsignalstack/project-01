import { Router } from "express";
import {
  currentUser,
  requireUser,
  requireAdministrator,
  requireCategoryManager,
} from "../http/authorization.js";
import { findSessionUser } from "../modules/users/user.repository.js";
import { getDirectory } from "../modules/directory/directory.repository.js";
import { categoryBody } from "../modules/categories/category.schema.js";
import {
  createCategory,
  deleteCategory,
} from "../modules/categories/category.repository.js";
import { roleBody } from "../modules/roles/role.schema.js";
import { createRole } from "../modules/roles/role.repository.js";
import { membershipBody } from "../modules/users/user.schema.js";
import { updateMembership } from "../modules/users/membership.service.js";

export function createApiRouter() {
  const router = Router();
  router.get("/me", async (req, res) => {
    const user = await findSessionUser(req.session.userId);
    res.json({ user, csrf: user ? req.session.csrf : null });
  });
  router.use(requireUser);
  router.get("/directory", async (_req, res) => {
    res.json(await getDirectory());
  });
  router.post("/categories", requireCategoryManager, async (req, res) => {
    res.status(201).json(await createCategory(categoryBody.parse(req.body)));
  });
  router.delete("/categories/:id", requireCategoryManager, async (req, res) => {
    await deleteCategory(String(req.params.id));
    res.sendStatus(204);
  });
  router.post("/roles", requireAdministrator, async (req, res) => {
    res.status(201).json(await createRole(roleBody.parse(req.body)));
  });
  router.patch("/users/:id", requireAdministrator, async (req, res) => {
    await updateMembership(
      currentUser(res).id,
      String(req.params.id),
      membershipBody.parse(req.body),
    );
    res.sendStatus(204);
  });
  return router;
}
