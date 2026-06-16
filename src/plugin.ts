import type { Plugin } from "@opencode-ai/plugin";
import { resolveApiKey, resolveAuth } from "./provider-config";
import { authorizeWithKiloDeviceAuth } from "./auth/device-auth";
import { buildKiloHeaders } from "./headers";
import {
  KILO_OPENROUTER_BASE,
  PROVIDER_ID,
  PROVIDER_NAME,
  PROVIDER_NPM_PACKAGE,
} from "./constants";
import { filterFreeModels, shouldShowFreeModelsOnly } from "./models";
import type { AuthDetails, GetAuth, LoaderResult, ProviderInfo } from "./types";

let activeOrganizationId: string | undefined;

type PluginHooks = Awaited<ReturnType<Plugin>>;
type ProviderModelsHook = {
  id: string;
  models?: (
    provider: ProviderInfo,
    context: { auth?: AuthDetails },
  ) => Promise<NonNullable<ProviderInfo["models"]>>;
};
type KiloGatewayHooks = PluginHooks & {
  provider?: ProviderModelsHook;
};

type KiloGatewayPlugin = (
  input: Parameters<Plugin>[0],
) => Promise<KiloGatewayHooks>;

export const KiloGatewayPlugin: KiloGatewayPlugin = async () => {
  return {
    config: async (config) => {
      config.provider ??= {};
      config.provider[PROVIDER_ID] = {
        ...config.provider[PROVIDER_ID],
        name: config.provider[PROVIDER_ID]?.name ?? PROVIDER_NAME,
        npm: config.provider[PROVIDER_ID]?.npm ?? PROVIDER_NPM_PACKAGE,
        api: config.provider[PROVIDER_ID]?.api ?? KILO_OPENROUTER_BASE,
      };
    },
    provider: {
      id: PROVIDER_ID,
      models: async (provider, context) => {
        const models = provider.models ?? {};

        if (!shouldShowFreeModelsOnly(context.auth)) {
          return models;
        }

        return filterFreeModels(models);
      },
    },
    auth: {
      provider: PROVIDER_ID,
      loader: async (
        getAuth: GetAuth,
        provider: ProviderInfo,
      ): Promise<LoaderResult> => {
        const auth = resolveAuth(await getAuth(), provider);
        activeOrganizationId = auth.organizationId;

        return {
          apiKey: resolveApiKey(auth),
          baseURL: auth.baseURL,
          headers: buildKiloHeaders(undefined, {
            organizationId: auth.organizationId,
          }),
          fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
            const headers = new Headers(init?.headers);
            const kiloHeaders = buildKiloHeaders(undefined, {
              organizationId: activeOrganizationId,
            });

            for (const [key, value] of Object.entries(kiloHeaders)) {
              headers.set(key, value);
            }

            return fetch(input, {
              ...init,
              headers,
            });
          },
        };
      },
      methods: [
        {
          type: "oauth",
          label: "Kilo Gateway",
          authorize: authorizeWithKiloDeviceAuth,
        },
      ],
    },
  };
};

export default KiloGatewayPlugin as Plugin;
