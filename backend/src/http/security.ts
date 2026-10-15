import type { RequestHandler } from "express";
import { env } from "../config.js";
export const protectRequests: RequestHandler = (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    (req.get("origin") !== new URL(env.APP_URL).origin ||
      !req.session.csrf ||
      req.get("x-csrf-token") !== req.session.csrf)
  )
    return res
      .status(403)
      .json({ error: "Invalid request token. Refresh and try again." });
  next();
};
