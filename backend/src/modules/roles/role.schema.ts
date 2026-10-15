import { z } from "zod";
export const roleBody = z
  .object({
    name: z.string().trim().min(2).max(60),
    canManageCategories: z.boolean().default(false),
  })
  .strict();
export type CreateRole = z.infer<typeof roleBody>;
