import { MODELS_CACHE_TTL_MS } from "./constants"
import { fetchKiloModels } from "./api/models"
import type { ProviderModel } from "./types"

const cache = new Map<
  string,
  {
    models: Record<string, ProviderModel>
    expiresAt: number
  }
>()

export async function getCachedKiloModels(input: {
  token?: string
  organizationId?: string
  baseURL?: string
}) {
  const key = JSON.stringify(input)
  const current = cache.get(key)

  if (current && current.expiresAt > Date.now()) {
    return current.models
  }

  const models = await fetchKiloModels(input)
  cache.set(key, {
    models,
    expiresAt: Date.now() + MODELS_CACHE_TTL_MS,
  })
  return models
}
