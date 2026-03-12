import { z } from "zod"
import { ANONYMOUS_API_KEY, MODELS_FETCH_TIMEOUT_MS } from "../constants"
import { buildModelBaseUrl, getKiloUrlFromToken } from "../provider-config"
import type { OpenRouterModel, ProviderModel } from "../types"

const openRouterArchitectureSchema = z.object({
  input_modalities: z.array(z.string()).nullish(),
  output_modalities: z.array(z.string()).nullish(),
})

const openRouterPricingSchema = z.object({
  prompt: z.string().nullish(),
  completion: z.string().nullish(),
  input_cache_write: z.string().nullish(),
  input_cache_read: z.string().nullish(),
})

const openRouterModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  context_length: z.number(),
  max_completion_tokens: z.number().nullish(),
  pricing: openRouterPricingSchema.optional(),
  architecture: openRouterArchitectureSchema.optional(),
  top_provider: z.object({ max_completion_tokens: z.number().nullish() }).optional(),
  supported_parameters: z.array(z.string()).optional(),
  preferredIndex: z.number().optional(),
  opencode: z
    .object({
      family: z.string().optional(),
      prompt: z.string().optional(),
      variants: z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
    })
    .optional(),
})

const openRouterModelsResponseSchema = z.object({
  data: z.array(openRouterModelSchema),
})

function parseApiPrice(price: string | null | undefined): number {
  if (!price) {
    return 0
  }

  const parsed = parseFloat(price)
  return Number.isNaN(parsed) ? 0 : parsed
}

function extractFamily(modelId: string): string {
  const modelName = modelId.split("/")[1] ?? modelId

  if (modelName.includes("claude")) return "claude"
  if (modelName.includes("gpt")) return "gpt"
  if (modelName.includes("gemini")) return "gemini"
  if (modelName.includes("llama")) return "llama"
  if (modelName.includes("mistral")) return "mistral"
  return ""
}

function mapModalities(modalities: string[] | null | undefined) {
  return {
    text: modalities?.includes("text") ?? true,
    audio: modalities?.includes("audio") ?? false,
    image: modalities?.includes("image") ?? false,
    video: modalities?.includes("video") ?? false,
    pdf: modalities?.includes("pdf") ?? false,
  }
}

export function isFreeModel(model: Pick<OpenRouterModel, "id" | "name">): boolean {
  return /free/i.test(`${model.id} ${model.name}`)
}

export function filterModelsByAuth(models: OpenRouterModel[], token?: string): OpenRouterModel[] {
  if (token) {
    return models
  }

  return models.filter(isFreeModel)
}

export function transformModel(model: OpenRouterModel, baseURL: string): ProviderModel {
  const supportedParameters = model.supported_parameters ?? []
  const inputModalities = model.architecture?.input_modalities ?? []
  const outputModalities = model.architecture?.output_modalities ?? ["text"]
  const maxOutputTokens =
    model.top_provider?.max_completion_tokens ??
    model.max_completion_tokens ??
    Math.ceil(model.context_length * 0.2)

  return {
    id: model.id,
    name: model.name,
    api: {
      id: model.id,
      npm: "@ai-sdk/openai-compatible",
      url: baseURL,
    },
    status: "active",
    providerID: "kilo",
    capabilities: {
      temperature: supportedParameters.includes("temperature"),
      reasoning: supportedParameters.includes("reasoning"),
      attachment: inputModalities.includes("image") || inputModalities.includes("pdf"),
      toolcall: supportedParameters.includes("tools"),
      input: mapModalities(inputModalities),
      output: mapModalities(outputModalities),
      interleaved: false,
    },
    cost: {
      input: parseApiPrice(model.pricing?.prompt),
      output: parseApiPrice(model.pricing?.completion),
      cache: {
        read: parseApiPrice(model.pricing?.input_cache_read),
        write: parseApiPrice(model.pricing?.input_cache_write),
      },
    },
    options: model.description ? { description: model.description } : {},
    limit: {
      context: model.context_length,
      output: maxOutputTokens,
    },
    headers: {},
    family: model.opencode?.family ?? extractFamily(model.id),
    release_date: new Date().toISOString().slice(0, 10),
    variants: model.opencode?.variants ?? {},
    recommendedIndex: model.preferredIndex,
    prompt: model.opencode?.prompt,
  }
}

export async function fetchKiloModels(options: {
  token?: string
  organizationId?: string
  baseURL?: string
}): Promise<Record<string, ProviderModel>> {
  const token = options.token
  const modelBaseURL = options.baseURL
    ? getKiloUrlFromToken(options.baseURL, token)
    : buildModelBaseUrl({ organizationId: options.organizationId, token })
  const response = await fetch(`${modelBaseURL}/models`, {
    headers: {
      Authorization: `Bearer ${token || ANONYMOUS_API_KEY}`,
    },
    signal: AbortSignal.timeout(MODELS_FETCH_TIMEOUT_MS),
  }).catch(() => undefined)

  if (!response?.ok) {
    return {}
  }

  const json = await response.json()
  const parsed = openRouterModelsResponseSchema.safeParse(json)

  if (!parsed.success) {
    return {}
  }

  const models: Record<string, ProviderModel> = {}
  const filtered = filterModelsByAuth(parsed.data.data as OpenRouterModel[], token)

  for (const model of filtered) {
    if (model.architecture?.output_modalities?.includes("image")) {
      continue
    }

    models[model.id] = transformModel(model as OpenRouterModel, modelBaseURL)
  }

  return models
}
