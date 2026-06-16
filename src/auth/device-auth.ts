import open from "open";
import {
  KILO_API_BASE,
  POLL_INTERVAL_MS,
  PROVIDER_ID,
  TOKEN_EXPIRATION_MS,
} from "../constants";
import { poll } from "./polling";
import type {
  DeviceAuthInitiateResponse,
  DeviceAuthPollResponse,
} from "../types";

async function initiateDeviceAuth(): Promise<DeviceAuthInitiateResponse> {
  const response = await fetch(`${KILO_API_BASE}/api/device-auth/codes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(
        "Too many pending authorization requests. Please try again later.",
      );
    }
    throw new Error(
      `Failed to initiate device authorization: ${response.status}`,
    );
  }

  return response.json() as Promise<DeviceAuthInitiateResponse>;
}

async function pollDeviceAuth(code: string): Promise<DeviceAuthPollResponse> {
  const response = await fetch(
    `${KILO_API_BASE}/api/device-auth/codes/${code}`,
  );

  if (response.status === 202) {
    return { status: "pending" };
  }

  if (response.status === 403) {
    return { status: "denied" };
  }

  if (response.status === 410) {
    return { status: "expired" };
  }

  if (!response.ok) {
    throw new Error(`Failed to poll device authorization: ${response.status}`);
  }

  return response.json() as Promise<DeviceAuthPollResponse>;
}

export async function authorizeWithKiloDeviceAuth() {
  const authData = await initiateDeviceAuth();
  const { code, verificationUrl, expiresIn } = authData;

  await open(verificationUrl).catch(() => undefined);

  return {
    url: verificationUrl,
    instructions: `Open ${verificationUrl} and enter code: ${code}`,
    method: "auto" as const,
    async callback() {
      const maxAttempts = Math.ceil((expiresIn * 1000) / POLL_INTERVAL_MS);

      const result = await poll<DeviceAuthPollResponse>({
        interval: POLL_INTERVAL_MS,
        maxAttempts,
        pollFn: async () => {
          const polled = await pollDeviceAuth(code);

          if (polled.status === "approved") {
            return { continue: false, data: polled };
          }

          if (polled.status === "denied") {
            return {
              continue: false,
              error: new Error("Authorization denied by user"),
            };
          }

          if (polled.status === "expired") {
            return {
              continue: false,
              error: new Error("Authorization code expired"),
            };
          }

          return { continue: true };
        },
      });

      if (!result.token) {
        return { type: "failed" as const };
      }

      return {
        type: "success" as const,
        provider: PROVIDER_ID,
        refresh: result.token,
        access: result.token,
        expires: Date.now() + TOKEN_EXPIRATION_MS,
      };
    },
  };
}
