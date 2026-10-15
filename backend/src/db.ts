import { PrismaClient } from "@prisma/client";
export const db = new PrismaClient();
export const userSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  role: true,
  categories: true,
} as const;
export async function ensureRoles() {
  for (const role of [
    { name: "Administrator", isAdmin: true, canManageCategories: true },
    { name: "Manager", isAdmin: false, canManageCategories: true },
    { name: "Member", isAdmin: false, canManageCategories: false },
  ]) {
    await db.role.upsert({
      where: { name: role.name },
      create: role,
      update: {},
    });
  }
}
