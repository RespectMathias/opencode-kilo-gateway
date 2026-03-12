import type { Plugin } from "@opencode-ai/plugin"
import { resolveApiKey, resolveAuth } from "./provider-config"
import { authorizeWithKiloDeviceAuth } from "./auth/device-auth"
import { buildKiloHeaders } from "./headers"
import { PROVIDER_ID } from "./constants"
import type { GetAuth, LoaderResult, ProviderInfo } from "./types"

let activeOrganizationId: string | undefined

export const KiloGatewayPlugin: Plugin = async () => {
  return {
    auth: {
      provider: PROVIDER_ID,
      loader: async (getAuth: GetAuth, provider: ProviderInfo): Promise<LoaderResult> => {
        const auth = resolveAuth(await getAuth(), provider)
        activeOrganizationId = auth.organizationId

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
          label: "Kilo Gateway",
          authorize: authorizeWithKiloDeviceAuth,
        },
      ],
    },
  }
}

export default KiloGatewayPlugin
