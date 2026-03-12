import type { Plugin } from "@opencode-ai/plugin"
import { buildModelBaseUrl, resolveApiKey, resolveAuth } from "./provider-config"
import { authorizeWithKiloDeviceAuth } from "./auth/device-auth"
import { getCachedKiloModels } from "./model-cache"
import { buildKiloHeaders } from "./headers"
import { DEFAULT_FREE_MODEL, KILO_API_BASE, PROVIDER_ID } from "./constants"
import type { GetAuth, LoaderResult, ProviderInfo } from "./types"

let activeOrganizationId: string | undefined

function createFallbackModel(): NonNullable<ProviderInfo["models"]>[string] {
  return {
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
  }
}

function toConfigModel(model: NonNullable<ProviderInfo["models"]>[string]) {
  return {
    name: model.name,
    limit: model.limit,
    modalities: {
      input: Object.entries(model.capabilities?.input ?? {})
        .filter(([, enabled]) => enabled)
        .map(([name]) => name),
      output: Object.entries(model.capabilities?.output ?? {})
        .filter(([, enabled]) => enabled)
        .map(([name]) => name),
    },
    cost: model.cost
      ? {
          input: model.cost.input,
          output: model.cost.output,
          cache_read: model.cost.cache?.read,
          cache_write: model.cost.cache?.write,
        }
      : undefined,
    temperature: model.capabilities?.temperature,
    reasoning: model.capabilities?.reasoning,
    attachment: model.capabilities?.attachment,
    tool_call: model.capabilities?.toolcall,
    family: model.family,
    release_date: model.release_date,
    variants: model.variants,
  }
}

function mergeConfigModels(
  models: Record<string, NonNullable<ProviderInfo["models"]>[string]>,
  existing?: Record<string, Record<string, unknown>>,
) {
  return Object.fromEntries(
    Object.entries(models).map(([id, model]) => [id, { ...toConfigModel(model), ...(existing?.[id] ?? {}) }]),
  )
}

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
    [DEFAULT_FREE_MODEL]: createFallbackModel(),
  }
}

export const KiloGatewayPlugin: Plugin = async () => {
  return {
    config: async (config) => {
      const provider = (config.provider ??= {})
      const kilo = (provider[PROVIDER_ID] ??= {}) as Record<string, any>
      const options = (kilo.options ??= {}) as Record<string, unknown>
      const organizationId = typeof options.kilocodeOrganizationId === "string" ? options.kilocodeOrganizationId : undefined
      const configuredBaseURL = typeof options.baseURL === "string" ? options.baseURL : undefined
      const modelBaseURL = buildModelBaseUrl({ organizationId, baseURL: configuredBaseURL })
      const models = await getCachedKiloModels({
        organizationId,
        baseURL: modelBaseURL,
      })

      kilo.name ??= "Kilo Gateway"
      kilo.npm ??= "@ai-sdk/openai-compatible"
      kilo.api ??= `${(configuredBaseURL ?? KILO_API_BASE).replace(/\/+$/, "")}/api/openrouter`
      kilo.models = mergeConfigModels(
        Object.keys(models).length > 0
          ? models
          : {
              [DEFAULT_FREE_MODEL]: createFallbackModel(),
            },
        typeof kilo.models === "object" && kilo.models ? (kilo.models as Record<string, Record<string, unknown>>) : undefined,
      )
    },
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
