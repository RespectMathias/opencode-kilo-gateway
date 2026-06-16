import { ANONYMOUS_API_KEY, KILO_API_BASE } from "./constants";
import type { AuthDetails, ProviderInfo, ResolvedAuth } from "./types";

function isApiAuth(auth: AuthDetails): auth is { type: "api"; key: string } {
  return auth?.type === "api" && typeof auth.key === "string";
}

function isOAuthAuth(
  auth: AuthDetails,
): auth is { type: "oauth"; access?: string; accountId?: string } {
  return auth?.type === "oauth";
}

export function getKiloUrlFromToken(
  defaultUrl: string,
  token?: string,
): string {
  if (!token) {
    return defaultUrl;
  }

  const match = token.match(/^(https?:\/\/.+):[^/]+$/);
  if (match?.[1]) {
    return match[1];
  }

  return defaultUrl;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function buildModelBaseUrl(input: {
  organizationId?: string;
  token?: string;
  baseURL?: string;
}): string {
  const base = trimTrailingSlash(input.baseURL ?? KILO_API_BASE);

  const normalized = input.organizationId
    ? base.includes("/api/organizations/")
      ? base
      : base.endsWith("/api")
        ? `${base}/organizations/${input.organizationId}/openrouter`
        : `${base}/api/organizations/${input.organizationId}/openrouter`
    : base.includes("/openrouter")
      ? base
      : base.endsWith("/api")
        ? `${base}/openrouter`
        : `${base}/api/openrouter`;

  return getKiloUrlFromToken(normalized, input.token);
}

export function resolveAuth(
  auth: AuthDetails,
  provider: ProviderInfo | undefined,
): ResolvedAuth {
  const options = provider?.options ?? {};
  const configuredOrganizationId =
    typeof options["kilocodeOrganizationId"] === "string"
      ? options["kilocodeOrganizationId"]
      : undefined;
  const configuredBaseURL =
    typeof options["baseURL"] === "string" ? options["baseURL"] : undefined;
  const organizationId =
    configuredOrganizationId ??
    (isOAuthAuth(auth) ? auth.accountId : undefined);
  const oauthToken =
    isOAuthAuth(auth) && typeof auth.access === "string"
      ? auth.access
      : undefined;

  if (isApiAuth(auth)) {
    return {
      token: auth.key,
      organizationId,
      baseURL: buildModelBaseUrl({
        organizationId,
        token: auth.key,
        baseURL: configuredBaseURL,
      }),
      modelBaseURL: buildModelBaseUrl({
        organizationId,
        token: auth.key,
        baseURL: configuredBaseURL,
      }),
      authType: "api",
    };
  }

  if (isOAuthAuth(auth)) {
    return {
      token: oauthToken,
      organizationId,
      baseURL: buildModelBaseUrl({
        organizationId,
        token: oauthToken,
        baseURL: configuredBaseURL,
      }),
      modelBaseURL: buildModelBaseUrl({
        organizationId,
        token: oauthToken,
        baseURL: configuredBaseURL,
      }),
      authType: "oauth",
    };
  }

  return {
    token: undefined,
    organizationId,
    baseURL: buildModelBaseUrl({ organizationId, baseURL: configuredBaseURL }),
    modelBaseURL: buildModelBaseUrl({
      organizationId,
      baseURL: configuredBaseURL,
    }),
    authType: "anonymous",
  };
}

export function resolveApiKey(auth: ResolvedAuth): string {
  return auth.token || ANONYMOUS_API_KEY;
}
