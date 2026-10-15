import type { RequestHandler, Response } from "express";
import {
  findSessionUser,
  type SessionUser,
} from "../modules/users/user.repository.js";
import { mayManageCategories } from "../policy.js";
import { HttpError } from "./errors.js";

declare global {
  namespace Express {
    interface Locals {
      user: SessionUser;
    }
  }
}
export function currentUser(res: Response): SessionUser {
  return res.locals.user;
}
export const requireUser: RequestHandler = async (req, res, next) => {
  const user = await findSessionUser(req.session.userId);
  if (!user) throw new HttpError(401, "Please sign in.");
  res.locals.user = user;
  next();
};
export const requireAdministrator: RequestHandler = (_req, res, next) => {
  if (!currentUser(res).role.isAdmin)
    throw new HttpError(403, "Administrator permission required.");
  next();
};
export const requireCategoryManager: RequestHandler = (_req, res, next) => {
  if (!mayManageCategories(currentUser(res).role))
    throw new HttpError(403, "Category management permission required.");
  next();
};
