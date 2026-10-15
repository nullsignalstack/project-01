import { db, userSelect } from "../../db.js";
export function findSessionUser(userId?: string) {
  return userId
    ? db.user.findUnique({ where: { id: userId }, select: userSelect })
    : Promise.resolve(null);
}
export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof findSessionUser>>
>;
