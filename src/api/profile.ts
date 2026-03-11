import { DEFAULT_FREE_MODEL, DEFAULT_MODEL, HEADER_ORGANIZATION_ID, KILO_API_BASE } from "../constants"
import type { KilocodeProfile, Organization } from "../types"

export async function fetchProfile(token: string): Promise<KilocodeProfile> {
  const response = await fetch(`${KILO_API_BASE}/api/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Invalid token")
    }
    throw new Error(`Failed to fetch profile: ${response.status}`)
  }

  const data = (await response.json()) as {
    user?: { email?: string; name?: string }
    email?: string
    name?: string
    organizations?: Organization[]
  }

  return {
    email: data.user?.email ?? data.email ?? "",
    name: data.user?.name ?? data.name,
    organizations: data.organizations,
  }
}

export async function fetchDefaultModel(token?: string, organizationId?: string): Promise<string> {
  const path = organizationId ? `/api/organizations/${organizationId}/defaults` : "/api/defaults"
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${KILO_API_BASE}${path}`, { headers }).catch(() => undefined)

  if (!response?.ok) {
    return token ? DEFAULT_MODEL : DEFAULT_FREE_MODEL
  }

  const data = (await response.json()) as {
    defaultModel?: string
    defaultFreeModel?: string
  }

  return token ? data.defaultModel || DEFAULT_MODEL : data.defaultFreeModel || DEFAULT_FREE_MODEL
}

export async function fetchOrganizations(token: string): Promise<Organization[]> {
  const profile = await fetchProfile(token)
  return profile.organizations ?? []
}

export function buildProfileHeaders(token: string, organizationId?: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(organizationId ? { [HEADER_ORGANIZATION_ID]: organizationId } : {}),
  }
}
