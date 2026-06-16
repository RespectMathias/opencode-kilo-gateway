import type { AuthDetails, KiloModelInfo, KiloModelMap } from "./types";

const FREE_MODEL_SEPARATORS = [" ", "/", ":", "_", "-"];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function hasUsableAuth(auth: AuthDetails): boolean {
  if (!auth) {
    return false;
  }

  if (auth.type === "api") {
    return isNonEmptyString(auth.key);
  }

  if (auth.type === "oauth") {
    return isNonEmptyString(auth.access);
  }

  if (auth.type === "wellknown") {
    return isNonEmptyString(auth.key) || isNonEmptyString(auth.token);
  }

  return false;
}

export function shouldShowFreeModelsOnly(auth: AuthDetails): boolean {
  return !hasUsableAuth(auth);
}

export function isFreeModel(modelID: string, model: KiloModelInfo): boolean {
  if (model.isFree === true) {
    return true;
  }

  return [modelID, model.id, model.name, model.family]
    .filter(isNonEmptyString)
    .some((value) => {
      const segments = FREE_MODEL_SEPARATORS.reduce(
        (parts, separator) => parts.flatMap((part) => part.split(separator)),
        [value.toLowerCase()],
      );
      return segments.includes("free");
    });
}

export function filterFreeModels(models: KiloModelMap): KiloModelMap {
  return Object.fromEntries(
    Object.entries(models).filter(([modelID, model]) =>
      isFreeModel(modelID, model),
    ),
  );
}
