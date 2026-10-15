import { Router } from "express";
import { randomBytes } from "node:crypto";
import { env } from "../../config.js";
import { beginLogin, completeLogin, getLogoutUrl } from "./auth.service.js";
import {
  saveSession,
  regenerateSession,
  destroySession,
  SESSION_COOKIE_NAME,
} from "../../http/session.js";
export function createAuthRouter() {
  const auth = Router();
  auth.get("/login", async (req, res) => {
    const { flow, url } = await beginLogin();
    req.session.flow = flow;
    await saveSession(req.session);
    res.redirect(url);
  });
  auth.get("/callback", async (req, res) => {
    const flow = req.session.flow;
    delete req.session.flow;
    if (!flow || flow.expires < Date.now())
      return res.redirect(`${env.APP_URL}/?error=login`);
    try {
      const { user, idTokenHint } = await completeLogin(req.originalUrl, flow);
      await regenerateSession(req.session);
      req.session.idTokenHint = idTokenHint;
      req.session.userId = user.id;
      req.session.csrf = randomBytes(32).toString("hex");
      await saveSession(req.session);
      res.redirect(env.APP_URL);
    } catch {
      res.redirect(`${env.APP_URL}/?error=login`);
    }
  });
  auth.post("/logout", async (req, res) => {
    // Keep the ID token server-side. A short-lived, anonymous session carries
    // the provider redirect through the subsequent top-level navigation.
    const logoutUrl = await getLogoutUrl(req.session.idTokenHint);
    await regenerateSession(req.session);
    if (!logoutUrl) {
      await destroySession(req.session);
      res.clearCookie(SESSION_COOKIE_NAME);
      return res.json({ redirectUrl: "/" });
    }
    req.session.logoutUrl = logoutUrl;
    req.session.cookie.maxAge = 60_000;
    await saveSession(req.session);
    res.json({ redirectUrl: "/auth/logout/provider" });
  });
  auth.get("/logout/provider", async (req, res) => {
    const target = req.session.logoutUrl;
    if (!target) return res.redirect("/");
    await destroySession(req.session);
    res.clearCookie(SESSION_COOKIE_NAME);
    res.redirect(target);
  });
  return auth;
}
