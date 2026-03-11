import {
  DEFAULT_EDITOR_NAME,
  ENV_EDITOR_NAME,
  ENV_FEATURE,
  HEADER_EDITOR_NAME,
  HEADER_FEATURE,
  HEADER_MACHINE_ID,
  HEADER_ORGANIZATION_ID,
  HEADER_PROJECT_ID,
  HEADER_TASK_ID,
} from "./constants"

export function getEditorNameHeader(): string {
  return process.env[ENV_EDITOR_NAME] ?? DEFAULT_EDITOR_NAME
}

export function getFeatureHeader(): string | undefined {
  return process.env[ENV_FEATURE] || undefined
}

export function buildKiloHeaders(
  metadata?: { taskId?: string; projectId?: string; machineId?: string },
  options?: { organizationId?: string },
): Record<string, string> {
  const feature = getFeatureHeader()

  return {
    [HEADER_EDITOR_NAME]: getEditorNameHeader(),
    ...(feature ? { [HEADER_FEATURE]: feature } : {}),
    ...(metadata?.taskId ? { [HEADER_TASK_ID]: metadata.taskId } : {}),
    ...(metadata?.projectId ? { [HEADER_PROJECT_ID]: metadata.projectId } : {}),
    ...(metadata?.machineId ? { [HEADER_MACHINE_ID]: metadata.machineId } : {}),
    ...(options?.organizationId ? { [HEADER_ORGANIZATION_ID]: options.organizationId } : {}),
  }
}
