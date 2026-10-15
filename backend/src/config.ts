import "dotenv/config";
import { z } from "zod";
export const env = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1),
    SESSION_SECRET: z.string().min(32),
    APP_URL: z.url().default("http://localhost:5173"),
    OIDC_ISSUER: z.url(),
    OIDC_CLIENT_ID: z.string().min(1),
    OIDC_CLIENT_SECRET: z.string().min(1),
    OIDC_REDIRECT_URI: z.url().default("http://localhost:5173/auth/callback"),
    BOOTSTRAP_ADMIN_EMAIL: z.email(),
  })
  .parse(process.env);
if (
  env.NODE_ENV === "production" &&
  [env.APP_URL, env.OIDC_ISSUER, env.OIDC_REDIRECT_URI].some(
    (url) => !url.startsWith("https://"),
  )
)
  throw new Error("Production URLs must use HTTPS");
