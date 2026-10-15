import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config.js";
import { db } from "./db.js";
import { createAuthRouter } from "./modules/auth/auth.routes.js";
import { createApiRouter } from "./routes/api.js";
import { createSessionMiddleware } from "./http/session.js";
import { protectRequests } from "./http/security.js";
import { errorHandler } from "./http/errors.js";

export function createApp() {
  const app = express();
  if (env.NODE_ENV === "production") app.set("trust proxy", 1);
  app.use(helmet());
  app.use(express.json({ limit: "16kb" }));
  app.get("/api/health", async (_req, res) => {
    await db.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  });
  app.use(createSessionMiddleware());
  app.use(protectRequests);
  app.use(
    "/auth",
    rateLimit({ windowMs: 60_000, limit: 30 }),
    createAuthRouter(),
  );
  app.use(
    "/api",
    rateLimit({ windowMs: 60_000, limit: 200 }),
    createApiRouter(),
  );
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found." });
  });
  app.use(errorHandler);
  return app;
}
