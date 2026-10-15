import { db, userSelect } from "../../db.js";
export async function getDirectory() {
  const [users, roles, categories] = await db.$transaction([
    db.user.findMany({ select: userSelect, orderBy: { createdAt: "desc" } }),
    db.role.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: "asc" },
    }),
    db.category.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: "asc" },
    }),
  ]);
  return { users, roles, categories };
}
