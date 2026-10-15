import { db } from "../../db.js";
import { mayChangeRole } from "../../policy.js";
import { HttpError } from "../../http/errors.js";
import type { MembershipChanges } from "./user.schema.js";
export async function updateMembership(
  actorId: string,
  targetId: string,
  data: MembershipChanges,
) {
  // Serialize role changes so concurrent requests cannot remove the last administrator.
  await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(741923)`;
    const target = await tx.user.findUniqueOrThrow({
      where: { id: targetId },
      include: { role: true },
    });
    const nextRole = await tx.role.findUniqueOrThrow({
      where: { id: data.roleId },
    });
    const actor = await tx.user.findUniqueOrThrow({
      where: { id: actorId },
      include: { role: true },
    });
    const admins = await tx.user.count({ where: { role: { isAdmin: true } } });
    if (
      !mayChangeRole(actor.role, target.role.isAdmin, nextRole.isAdmin, admins)
    )
      throw new HttpError(
        409,
        "Keep at least one administrator. Your permission may also have changed.",
      );
    await tx.user.update({
      where: { id: target.id },
      data: {
        roleId: nextRole.id,
        categories: {
          set: [...new Set(data.categoryIds)].map((id) => ({ id })),
        },
      },
    });
  });
}
