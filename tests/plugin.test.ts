import { afterEach, describe, expect, it, vi } from "vitest";
import { KiloGatewayPlugin } from "../src/plugin";
import { authorizeWithKiloDeviceAuth } from "../src/auth/device-auth";

const models = {
  paid: { id: "paid", name: "Paid" },
  free: { id: "catalog", name: "Catalog", isFree: true },
};

describe("KiloGatewayPlugin", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("injects the kilo provider config", async () => {
    const plugin = await KiloGatewayPlugin({} as never);
    const config = {};

    await plugin.config?.(config);

    expect(config).toEqual({
      provider: {
        kilo: {
          name: "Kilo Gateway",
          npm: "@ai-sdk/openai-compatible",
          api: "https://api.kilo.ai/api/openrouter",
        },
      },
    });
  });

  it("preserves explicit kilo provider overrides", async () => {
    const plugin = await KiloGatewayPlugin({} as never);
    const config = {
      provider: {
        kilo: {
          name: "Custom Kilo",
          npm: "custom-package",
          api: "https://example.com/openrouter",
          options: { timeout: 1000 },
        },
      },
    };

    await plugin.config?.(config);

    expect(config.provider.kilo).toEqual({
      name: "Custom Kilo",
      npm: "custom-package",
      api: "https://example.com/openrouter",
      options: { timeout: 1000 },
    });
  });

  it("registers kilo provider model filtering", async () => {
    const plugin = await KiloGatewayPlugin({} as never);

    expect(plugin.provider?.id).toBe("kilo");
    await expect(
      plugin.provider?.models?.(
        { id: "kilo", name: "Kilo Gateway", env: [], models },
        {},
      ),
    ).resolves.toEqual({ free: models.free });
    await expect(
      plugin.provider?.models?.(
        { id: "kilo", name: "Kilo Gateway", env: [], models },
        { auth: { type: "api", key: "secret" } },
      ),
    ).resolves.toEqual(models);
  });

  it("registers kilo oauth auth", async () => {
    const plugin = await KiloGatewayPlugin({} as never);

    expect(plugin.auth?.provider).toBe("kilo");
    expect(plugin.auth?.methods).toEqual([
      {
        type: "oauth",
        label: "Kilo Gateway",
        authorize: authorizeWithKiloDeviceAuth,
      },
    ]);
  });

  it("loads oauth auth into provider options and request headers", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response("ok"),
    );
    vi.stubGlobal("fetch", fetchMock);

    const plugin = await KiloGatewayPlugin({} as never);
    const result = await plugin.auth?.loader?.(
      async () => ({
        type: "oauth",
        access: "access-token",
        refresh: "refresh-token",
        expires: 123,
        accountId: "org_123",
      }),
      { id: "kilo", name: "Kilo Gateway", env: [], models: {} },
    );

    expect(result?.apiKey).toBe("access-token");
    expect(result?.baseURL).toBe(
      "https://api.kilo.ai/api/organizations/org_123/openrouter",
    );
    expect(result?.headers).toMatchObject({
      "X-KILOCODE-EDITORNAME": "OpenCode Kilo Gateway",
      "X-KILOCODE-ORGANIZATIONID": "org_123",
    });

    await result?.fetch?.("https://example.com", {
      headers: { Existing: "value" },
    });
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = new Headers(init?.headers);

    expect(headers.get("Existing")).toBe("value");
    expect(headers.get("X-KILOCODE-EDITORNAME")).toBe("OpenCode Kilo Gateway");
    expect(headers.get("X-KILOCODE-ORGANIZATIONID")).toBe("org_123");

    await result?.fetch?.("https://example.com");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
