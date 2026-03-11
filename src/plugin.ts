import type { Plugin } from "@opencode-ai/plugin"
import { authorizeWithKiloDeviceAuth } from "./auth/device-auth"
import { getCachedKiloModels } from "./model-cache"
import { buildKiloHeaders } from "./headers"
import { DEFAULT_FREE_MODEL, PROVIDER_ID } from "./constants"
import { resolveApiKey, resolveAuth } from "./provider-config"
import type { GetAuth, LoaderResult, ProviderInfo } from "./types"

let activeOrganizationId: string | undefined

function updateProviderModels(provider: ProviderInfo, models: Record<string, unknown>) {
  const next = Object.keys(models).length > 0 ? models : provider.models
  if (!next) {
    return
  }

  provider.models = next as ProviderInfo["models"]
}

function ensureFallbackModel(provider: ProviderInfo) {
  if (provider.models && Object.keys(provider.models).length > 0) {
    return
  }

  provider.models = {
    [DEFAULT_FREE_MODEL]: {
      id: DEFAULT_FREE_MODEL,
      name: "Kilo Auto Free",
      api: {
        id: DEFAULT_FREE_MODEL,
        npm: "@ai-sdk/openai-compatible",
      },
      status: "active",
      providerID: PROVIDER_ID,
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        input: { text: true, audio: false, image: true, video: false, pdf: true },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false,
      },
      cost: {
        input: 0,
        output: 0,
        cache: { read: 0, write: 0 },
      },
      options: {},
      limit: { context: 256000, output: 16384 },
      headers: {},
      family: "kilo",
      release_date: new Date().toISOString().slice(0, 10),
      variants: {},
    },
  }
}

export const KiloGatewayPlugin: Plugin = async () => {
  return {
    auth: {
      provider: PROVIDER_ID,
      loader: async (getAuth: GetAuth, provider: ProviderInfo): Promise<LoaderResult> => {
        ensureFallbackModel(provider)

        const auth = resolveAuth(await getAuth(), provider)
        activeOrganizationId = auth.organizationId

        const models = await getCachedKiloModels({
          token: auth.token,
          organizationId: auth.organizationId,
          baseURL: auth.modelBaseURL,
        })

        updateProviderModels(provider, models)

        return {
          apiKey: resolveApiKey(auth),
          baseURL: auth.baseURL,
          headers: buildKiloHeaders(undefined, { organizationId: auth.organizationId }),
          fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
            const headers = new Headers(init?.headers)
            const kiloHeaders = buildKiloHeaders(undefined, { organizationId: activeOrganizationId })

            for (const [key, value] of Object.entries(kiloHeaders)) {
              headers.set(key, value)
            }

            return fetch(input, {
              ...init,
              headers,
            })
          },
        }
      },
      methods: [
        {
          type: "oauth",
          label: "Kilo Gateway (Device Authorization)",
          authorize: authorizeWithKiloDeviceAuth,
        },
        {
          type: "api",
          label: "Manual Kilo Token",
        },
      ],
    },
  }
}

export default KiloGatewayPlugin
