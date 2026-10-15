import { db } from "../../db.js";
import type { CreateCategory } from "./category.schema.js";
export function createCategory(data: CreateCategory) {
  return db.category.create({ data });
}
export function deleteCategory(id: string) {
  return db.category.delete({ where: { id } });
}
