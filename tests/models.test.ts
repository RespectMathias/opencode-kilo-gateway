import { describe, expect, it } from "vitest";
import {
  filterFreeModels,
  isFreeModel,
  shouldShowFreeModelsOnly,
} from "../src/models";
import type { KiloModelMap } from "../src/types";

const models: KiloModelMap = {
  "provider/paid": {
    id: "provider/paid",
    name: "Paid Model",
  },
  "provider/catalog": {
    id: "provider/catalog",
    name: "Catalog Model",
    isFree: true,
  },
  "provider/model:free": {
    id: "provider/model:free",
    name: "Free by Name",
  },
};

describe("model filtering", () => {
  it("detects free models by catalog metadata", () => {
    expect(isFreeModel("provider/catalog", models["provider/catalog"]!)).toBe(
      true,
    );
    expect(isFreeModel("provider/paid", models["provider/paid"]!)).toBe(false);
  });

  it("falls back to free keyword matching", () => {
    expect(
      isFreeModel("provider/model:free", models["provider/model:free"]!),
    ).toBe(true);
    expect(isFreeModel("provider/model", { name: "Free Model" })).toBe(true);
    expect(isFreeModel("free", { id: "provider/paid" })).toBe(true);
    expect(isFreeModel("provider/free-model", { id: "provider/paid" })).toBe(
      true,
    );
    expect(
      isFreeModel("provider/not-freeform", { id: "provider/not-freeform" }),
    ).toBe(false);
    expect(isFreeModel("provider/freeform", { id: "provider/freeform" })).toBe(
      false,
    );
    expect(isFreeModel("provider/model", { id: "provider/prefixfree" })).toBe(
      false,
    );
    expect(isFreeModel("provider/model", {})).toBe(false);
  });

  it("filters a model map to free models", () => {
    expect(Object.keys(filterFreeModels(models))).toEqual([
      "provider/catalog",
      "provider/model:free",
    ]);
  });

  it("shows free models only without usable auth", () => {
    expect(shouldShowFreeModelsOnly(undefined)).toBe(true);
    expect(
      shouldShowFreeModelsOnly({ type: "oauth", refresh: "refresh" }),
    ).toBe(true);
    expect(shouldShowFreeModelsOnly({ type: "api", key: "" })).toBe(true);
    expect(
      shouldShowFreeModelsOnly({
        type: "oauth",
        access: "",
        refresh: "refresh",
      }),
    ).toBe(true);
    expect(shouldShowFreeModelsOnly({ type: "wellknown" })).toBe(true);
    expect(shouldShowFreeModelsOnly({ type: "unknown" })).toBe(true);
    expect(shouldShowFreeModelsOnly({ type: "unknown", key: "key" })).toBe(
      true,
    );
  });

  it("keeps all models with usable auth", () => {
    expect(shouldShowFreeModelsOnly({ type: "api", key: "secret" })).toBe(
      false,
    );
    expect(
      shouldShowFreeModelsOnly({
        type: "oauth",
        access: "access",
        refresh: "refresh",
      }),
    ).toBe(false);
    expect(shouldShowFreeModelsOnly({ type: "wellknown", key: "key" })).toBe(
      false,
    );
    expect(
      shouldShowFreeModelsOnly({ type: "wellknown", token: "token" }),
    ).toBe(false);
  });
});
