export const PROVIDER_ID = "kilo";
export const PROVIDER_NAME = "Kilo Gateway";
export const PROVIDER_NPM_PACKAGE = "@ai-sdk/openai-compatible";
export const DEFAULT_KILO_API_URL = "https://api.kilo.ai";
export const ENV_KILO_API_URL = "KILO_API_URL";
export const KILO_API_BASE =
  process.env[ENV_KILO_API_URL] || DEFAULT_KILO_API_URL;
export const KILO_OPENROUTER_BASE =
  KILO_API_BASE.replace(new RegExp("/+$"), "") + "/api/openrouter";
export const ANONYMOUS_API_KEY = "anonymous";
export const POLL_INTERVAL_MS = 3000;
export const TOKEN_EXPIRATION_MS = 365 * 24 * 60 * 60 * 1000;
export const DEFAULT_EDITOR_NAME = "OpenCode Kilo Gateway";
export const HEADER_ORGANIZATION_ID = "X-KILOCODE-ORGANIZATIONID";
export const HEADER_TASK_ID = "X-KILOCODE-TASKID";
export const HEADER_PROJECT_ID = "X-KILOCODE-PROJECTID";
export const HEADER_EDITOR_NAME = "X-KILOCODE-EDITORNAME";
export const HEADER_MACHINE_ID = "X-KILOCODE-MACHINEID";
export const HEADER_FEATURE = "X-KILOCODE-FEATURE";
export const ENV_EDITOR_NAME = "KILOCODE_EDITOR_NAME";
export const ENV_FEATURE = "KILOCODE_FEATURE";
