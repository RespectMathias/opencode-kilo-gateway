export interface KiloModelInfo {
  id?: string;
  name?: string;
  family?: string;
  isFree?: boolean;
  [key: string]: unknown;
}

export type KiloModelMap = Record<string, KiloModelInfo>;

export interface OAuthAuthDetails {
  type: "oauth";
  refresh: string;
  access?: string;
  expires?: number;
  accountId?: string;
}

export interface ApiKeyAuthDetails {
  type: "api";
  key: string;
}

export interface WellKnownAuthDetails {
  type: "wellknown";
  key?: string;
  token?: string;
}

export interface UnknownAuthDetails {
  type: string;
  [key: string]: unknown;
}

export type AuthDetails =
  | OAuthAuthDetails
  | ApiKeyAuthDetails
  | WellKnownAuthDetails
  | UnknownAuthDetails
  | undefined;

export type GetAuth = () => Promise<AuthDetails>;

export interface ProviderInfo {
  id?: string;
  name?: string;
  env?: string[];
  npm?: string;
  api?: string;
  key?: string;
  options?: Record<string, unknown>;
  models?: KiloModelMap;
}

export interface LoaderResult {
  apiKey?: string;
  baseURL?: string;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
  [key: string]: unknown;
}

export interface DeviceAuthInitiateResponse {
  code: string;
  verificationUrl: string;
  expiresIn: number;
}

export interface DeviceAuthPollResponse {
  status: "pending" | "approved" | "denied" | "expired";
  token?: string;
  userEmail?: string;
}

export interface ResolvedAuth {
  token?: string;
  organizationId?: string;
  baseURL: string;
  modelBaseURL: string;
  authType: "oauth" | "api" | "anonymous";
}
