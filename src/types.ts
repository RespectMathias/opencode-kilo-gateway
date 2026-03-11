import type { PluginInput } from "@opencode-ai/plugin"

export interface OAuthAuthDetails {
  type: "oauth"
  refresh: string
  access?: string
  expires?: number
  accountId?: string
}

export interface ApiKeyAuthDetails {
  type: "api"
  key: string
}

export interface UnknownAuthDetails {
  type: string
  [key: string]: unknown
}

export type AuthDetails = OAuthAuthDetails | ApiKeyAuthDetails | UnknownAuthDetails | undefined

export type GetAuth = () => Promise<AuthDetails>

export interface ProviderModel {
  id?: string
  name?: string
  api?: {
    id?: string
    npm?: string
    url?: string
  }
  cost?: {
    input?: number
    output?: number
    cache?: {
      read?: number
      write?: number
    }
  }
  options?: Record<string, unknown>
  limit?: {
    context?: number
    output?: number
  }
  capabilities?: {
    temperature?: boolean
    reasoning?: boolean
    attachment?: boolean
    toolcall?: boolean
    input?: Record<string, boolean>
    output?: Record<string, boolean>
    interleaved?: boolean
  }
  headers?: Record<string, string>
  family?: string
  release_date?: string
  variants?: Record<string, Record<string, unknown>>
  [key: string]: unknown
}

export interface ProviderInfo {
  id?: string
  name?: string
  env?: string[]
  npm?: string
  api?: string
  key?: string
  options?: Record<string, unknown>
  models?: Record<string, ProviderModel>
}

export interface LoaderResult {
  apiKey?: string
  baseURL?: string
  headers?: Record<string, string>
  fetch?: typeof fetch
  [key: string]: unknown
}

export type PluginClient = PluginInput["client"]

export interface DeviceAuthInitiateResponse {
  code: string
  verificationUrl: string
  expiresIn: number
}

export interface DeviceAuthPollResponse {
  status: "pending" | "approved" | "denied" | "expired"
  token?: string
  userEmail?: string
}

export interface Organization {
  id: string
  name: string
  role?: string
}

export interface KilocodeProfile {
  email: string
  name?: string
  organizations?: Organization[]
}

export interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length: number
  max_completion_tokens?: number | null
  pricing?: {
    prompt?: string | null
    completion?: string | null
    input_cache_write?: string | null
    input_cache_read?: string | null
  }
  architecture?: {
    input_modalities?: string[] | null
    output_modalities?: string[] | null
  }
  top_provider?: {
    max_completion_tokens?: number | null
  }
  supported_parameters?: string[]
  preferredIndex?: number
  opencode?: {
    family?: string
    prompt?: string
    variants?: Record<string, Record<string, unknown>>
  }
}

export interface ResolvedAuth {
  token?: string
  organizationId?: string
  baseURL: string
  modelBaseURL: string
  authType: "oauth" | "api" | "anonymous"
}
