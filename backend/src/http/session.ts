import session from "express-session";
import connectPg from "connect-pg-simple";
import { env } from "../config.js";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    csrf?: string;
    idTokenHint?: string;
    logoutUrl?: string;
    flow?: { verifier: string; state: string; nonce: string; expires: number };
  }
}
export const SESSION_COOKIE_NAME = "people.sid";
export function createSessionMiddleware() {
  const PgStore = connectPg(session);
  return session({
    name: SESSION_COOKIE_NAME,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PgStore({
      conString: env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 3600_000,
    },
  });
}
export function saveSession(session: session.Session): Promise<void> {
  return new Promise((resolve, reject) =>
    session.save((error) => (error ? reject(error) : resolve())),
  );
}
export function regenerateSession(session: session.Session): Promise<void> {
  return new Promise((resolve, reject) =>
    session.regenerate((error) => (error ? reject(error) : resolve())),
  );
}
export function destroySession(session: session.Session): Promise<void> {
  return new Promise((resolve, reject) =>
    session.destroy((error) => (error ? reject(error) : resolve())),
  );
}
