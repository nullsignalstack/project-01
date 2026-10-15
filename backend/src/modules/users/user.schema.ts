import { z } from "zod";
export const membershipBody = z
  .object({
    roleId: z.string().min(1),
    categoryIds: z.array(z.string().min(1)).max(100),
  })
  .strict();
export type MembershipChanges = z.infer<typeof membershipBody>;
