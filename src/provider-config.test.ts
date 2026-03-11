import { describe, expect, it } from "vitest"
import { buildModelBaseUrl, getKiloUrlFromToken, resolveApiKey, resolveAuth } from "./provider-config"

describe("provider-config", () => {
  it("builds organization-scoped base urls", () => {
    expect(buildModelBaseUrl({ organizationId: "org_123" })).toBe(
      "https://api.kilo.ai/api/organizations/org_123/openrouter",
    )
  })

  it("extracts base url from token prefixes", () => {
    expect(getKiloUrlFromToken("https://api.kilo.ai/api/openrouter", "https://edge.kilo.ai:abc123")).toBe(
      "https://edge.kilo.ai",
    )
  })

  it("resolves oauth auth to kilo provider options", () => {
    const result = resolveAuth(
      {
        type: "oauth",
        access: "token-123",
        refresh: "token-123",
        accountId: "org_123",
      },
      { options: {} },
    )

    expect(result.organizationId).toBe("org_123")
    expect(resolveApiKey(result)).toBe("token-123")
    expect(result.baseURL).toContain("/api/organizations/org_123/openrouter")
  })
})
