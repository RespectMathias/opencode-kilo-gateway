import { describe, expect, it } from "vitest";
import {
  buildModelBaseUrl,
  getKiloUrlFromToken,
  resolveApiKey,
  resolveAuth,
} from "../src/provider-config";

describe("provider-config", () => {
  it("builds organization-scoped base urls", () => {
    expect(buildModelBaseUrl({ organizationId: "org_123" })).toBe(
      "https://api.kilo.ai/api/organizations/org_123/openrouter",
    );
    expect(
      buildModelBaseUrl({
        organizationId: "org_123",
        baseURL: "https://api.kilo.ai/api",
      }),
    ).toBe("https://api.kilo.ai/api/organizations/org_123/openrouter");
    expect(
      buildModelBaseUrl({
        organizationId: "org_123",
        baseURL: "https://api.kilo.ai/api/organizations/org_123/openrouter",
      }),
    ).toBe("https://api.kilo.ai/api/organizations/org_123/openrouter");
  });

  it("builds anonymous base urls", () => {
    expect(buildModelBaseUrl({})).toBe("https://api.kilo.ai/api/openrouter");
    expect(buildModelBaseUrl({ baseURL: "https://api.kilo.ai/api" })).toBe(
      "https://api.kilo.ai/api/openrouter",
    );
    expect(
      buildModelBaseUrl({ baseURL: "https://api.kilo.ai/api/openrouter" }),
    ).toBe("https://api.kilo.ai/api/openrouter");
    expect(buildModelBaseUrl({ baseURL: "https://custom.kilo.ai///" })).toBe(
      "https://custom.kilo.ai/api/openrouter",
    );
  });

  it("extracts base url from token prefixes", () => {
    expect(
      getKiloUrlFromToken(
        "https://api.kilo.ai/api/openrouter",
        "https://edge.kilo.ai:abc123",
      ),
    ).toBe("https://edge.kilo.ai");
    expect(
      getKiloUrlFromToken(
        "https://api.kilo.ai/api/openrouter",
        "http://edge.kilo.ai:abc123",
      ),
    ).toBe("http://edge.kilo.ai");
    expect(
      getKiloUrlFromToken(
        "https://api.kilo.ai/api/openrouter",
        "token-without-prefix",
      ),
    ).toBe("https://api.kilo.ai/api/openrouter");
    expect(
      getKiloUrlFromToken(
        "https://api.kilo.ai/api/openrouter",
        "prefix https://edge.kilo.ai:abc123",
      ),
    ).toBe("https://api.kilo.ai/api/openrouter");
    expect(
      getKiloUrlFromToken(
        "https://api.kilo.ai/api/openrouter",
        "https://edge.kilo.ai:abc123/extra",
      ),
    ).toBe("https://api.kilo.ai/api/openrouter");
  });

  it("resolves oauth auth to kilo provider options", () => {
    const result = resolveAuth(
      {
        type: "oauth",
        access: "token-123",
        refresh: "token-123",
        accountId: "org_123",
      },
      { options: {} },
    );

    expect(result).toMatchObject({
      token: "token-123",
      organizationId: "org_123",
      authType: "oauth",
      baseURL: "https://api.kilo.ai/api/organizations/org_123/openrouter",
      modelBaseURL: "https://api.kilo.ai/api/organizations/org_123/openrouter",
    });
    expect(resolveApiKey(result)).toBe("token-123");
  });

  it("resolves api auth to kilo provider options", () => {
    const result = resolveAuth(
      {
        type: "api",
        key: "api-token",
      },
      {
        options: {
          kilocodeOrganizationId: "org_configured",
          baseURL: "https://custom.kilo.ai/api/",
        },
      },
    );

    expect(result).toMatchObject({
      token: "api-token",
      organizationId: "org_configured",
      authType: "api",
      baseURL:
        "https://custom.kilo.ai/api/organizations/org_configured/openrouter",
      modelBaseURL:
        "https://custom.kilo.ai/api/organizations/org_configured/openrouter",
    });
  });

  it("ignores malformed auth payloads", () => {
    const malformedApi = resolveAuth({ type: "api", key: 123 } as never, {
      options: {},
    });
    const malformedOAuth = resolveAuth(
      { type: "oauth", access: 123, refresh: "refresh-token" } as never,
      { options: {} },
    );

    expect(malformedApi.authType).toBe("anonymous");
    expect(malformedApi.token).toBeUndefined();
    expect(malformedOAuth.authType).toBe("oauth");
    expect(malformedOAuth.token).toBeUndefined();
    expect(resolveApiKey(malformedOAuth)).toBe("anonymous");
  });

  it("resolves anonymous auth to anonymous api key", () => {
    const result = resolveAuth(undefined, {
      options: { baseURL: "https://custom.kilo.ai" },
    });

    expect(result).toMatchObject({
      token: undefined,
      organizationId: undefined,
      authType: "anonymous",
      baseURL: "https://custom.kilo.ai/api/openrouter",
      modelBaseURL: "https://custom.kilo.ai/api/openrouter",
    });
    expect(resolveApiKey(result)).toBe("anonymous");
  });
});
