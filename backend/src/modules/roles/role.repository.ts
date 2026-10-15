import { db } from "../../db.js";
import type { CreateRole } from "./role.schema.js";
export function createRole(data: CreateRole) {
  return db.role.create({ data });
}
