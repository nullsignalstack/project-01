import * as oidc from "openid-client";
import { env } from "../../config.js";
let configuration: Promise<oidc.Configuration> | undefined;
export function provider() {
  return (configuration ??= oidc
    .discovery(
      new URL(env.OIDC_ISSUER),
      env.OIDC_CLIENT_ID,
      env.OIDC_CLIENT_SECRET,
      undefined,
      env.NODE_ENV === "production"
        ? undefined
        : { execute: [oidc.allowInsecureRequests] },
    )
    .catch((error) => {
      configuration = undefined;
      throw error;
    }));
}
