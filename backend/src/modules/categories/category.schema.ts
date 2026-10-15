import { z } from "zod";
export const categoryBody = z
  .object({
    name: z.string().trim().min(2).max(60),
    description: z.string().trim().max(240).default(""),
  })
  .strict();
export type CreateCategory = z.infer<typeof categoryBody>;
