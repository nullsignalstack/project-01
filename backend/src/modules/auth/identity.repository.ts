import { db } from "../../db.js";
import { env } from "../../config.js";
export async function synchronizeIdentity(claims: {
  sub: string;
  email: string;
  name?: unknown;
}) {
  const subject = `${env.OIDC_ISSUER}|${claims.sub}`;
  const role = await db.role.findUniqueOrThrow({
    where: {
      name:
        claims.email.toLowerCase() === env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase()
          ? "Administrator"
          : "Member",
    },
  });
  const user = await db.user.upsert({
    where: { subject },
    create: {
      subject,
      email: claims.email,
      name: typeof claims.name === "string" ? claims.name : claims.email,
      roleId: role.id,
    },
    update: {
      email: claims.email,
      name: typeof claims.name === "string" ? claims.name : claims.email,
    },
  });
  return user;
}
