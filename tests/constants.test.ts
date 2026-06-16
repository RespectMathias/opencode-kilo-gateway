import { afterEach, describe, expect, it, vi } from "vitest";

describe("constants", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("exports default provider constants", async () => {
    const constants = await import("../src/constants");

    expect(constants.PROVIDER_ID).toBe("kilo");
    expect(constants.PROVIDER_NAME).toBe("Kilo Gateway");
    expect(constants.PROVIDER_NPM_PACKAGE).toBe("@ai-sdk/openai-compatible");
    expect(constants.DEFAULT_KILO_API_URL).toBe("https://api.kilo.ai");
    expect(constants.ENV_KILO_API_URL).toBe("KILO_API_URL");
    expect(constants.KILO_OPENROUTER_BASE).toBe(
      "https://api.kilo.ai/api/openrouter",
    );
    expect(constants.TOKEN_EXPIRATION_MS).toBe(365 * 24 * 60 * 60 * 1000);
  });

  it("builds openrouter base from KILO_API_URL", async () => {
    vi.stubEnv("KILO_API_URL", "https://edge.kilo.ai///");
    vi.resetModules();

    const constants = await import("../src/constants");

    expect(constants.KILO_API_BASE).toBe("https://edge.kilo.ai///");
    expect(constants.KILO_OPENROUTER_BASE).toBe(
      "https://edge.kilo.ai/api/openrouter",
    );
  });
});
