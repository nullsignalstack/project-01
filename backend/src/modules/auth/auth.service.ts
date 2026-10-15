import * as oidc from "openid-client";
import { env } from "../../config.js";
import type { SessionData } from "express-session";
import { provider } from "./oidc.js";
import { synchronizeIdentity } from "./identity.repository.js";

export async function beginLogin() {
  const config = await provider();
  const verifier = oidc.randomPKCECodeVerifier();
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const flow = {
    verifier,
    state,
    nonce,
    expires: Date.now() + 600_000,
  };
  const url = oidc.buildAuthorizationUrl(config, {
    redirect_uri: env.OIDC_REDIRECT_URI,
    scope: "openid email profile",
    prompt: "login",
    state,
    nonce,
    code_challenge: await oidc.calculatePKCECodeChallenge(verifier),
    code_challenge_method: "S256",
  });
  return { flow, url: url.href };
}
export async function completeLogin(
  originalUrl: string,
  flow: NonNullable<SessionData["flow"]>,
) {
  const tokens = await oidc.authorizationCodeGrant(
    await provider(),
    new URL(originalUrl, env.OIDC_REDIRECT_URI),
    {
      pkceCodeVerifier: flow.verifier,
      expectedState: flow.state,
      expectedNonce: flow.nonce,
      idTokenExpected: true,
    },
  );
  const claims = tokens.claims();
  if (
    !claims ||
    typeof claims.email !== "string" ||
    claims.email_verified !== true
  )
    throw new Error("Verified email required");
  const user = await synchronizeIdentity({
    sub: claims.sub,
    email: claims.email,
    name: claims.name,
  });
  return { user, idTokenHint: tokens.id_token };
}
export async function getLogoutUrl(idTokenHint?: string) {
  let logoutUrl: string | undefined;
  try {
    const config = await provider();
    if (config.serverMetadata().end_session_endpoint) {
      logoutUrl = oidc.buildEndSessionUrl(config, {
        client_id: env.OIDC_CLIENT_ID,
        post_logout_redirect_uri: new URL("/", env.APP_URL).href,
        ...(idTokenHint ? { id_token_hint: idTokenHint } : {}),
      }).href;
    }
  } catch {
    // Local logout must still succeed when discovery is unavailable.
  }
  return logoutUrl;
}
