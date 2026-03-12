import { describe, expect, it } from "vitest"
import { filterModelsByAuth, isFreeModel, transformModel } from "./models"

describe("transformModel", () => {
  it("maps Kilo model payload to provider model shape", () => {
    const result = transformModel(
      {
        id: "anthropic/claude-sonnet-4",
        name: "Claude Sonnet 4",
        context_length: 200000,
        max_completion_tokens: 64000,
        pricing: {
          prompt: "0.000003",
          completion: "0.000015",
          input_cache_read: "0.000001",
          input_cache_write: "0.000002",
        },
        architecture: {
          input_modalities: ["text", "image", "pdf"],
          output_modalities: ["text"],
        },
        supported_parameters: ["tools", "temperature", "reasoning"],
        opencode: {
          family: "claude",
        },
      },
      "https://api.kilo.ai/api/openrouter",
    )

    expect(result.api?.npm).toBe("@ai-sdk/openai-compatible")
    expect(result.api?.url).toBe("https://api.kilo.ai/api/openrouter")
    expect(result.capabilities?.toolcall).toBe(true)
    expect(result.capabilities?.attachment).toBe(true)
    expect(result.limit?.output).toBe(64000)
    expect(result.family).toBe("claude")
  })
})

describe("free model visibility", () => {
  it("detects free models case insensitively", () => {
    expect(isFreeModel({ id: "minimax-m2.1-free", name: "MiniMax M2.1" })).toBe(true)
    expect(isFreeModel({ id: "gpt-5", name: "GPT-5" })).toBe(false)
  })

  it("filters non-free models when logged out", () => {
    const result = filterModelsByAuth(
      [
        { id: "minimax-m2.1-free", name: "MiniMax M2.1 Free", context_length: 1 },
        { id: "gpt-5", name: "GPT-5", context_length: 1 },
      ] as any,
      undefined,
    )

    expect(result.map((item) => item.id)).toEqual(["minimax-m2.1-free"])
  })

  it("keeps full list when logged in", () => {
    const result = filterModelsByAuth(
      [
        { id: "minimax-m2.1-free", name: "MiniMax M2.1 Free", context_length: 1 },
        { id: "gpt-5", name: "GPT-5", context_length: 1 },
      ] as any,
      "token-123",
    )

    expect(result.map((item) => item.id)).toEqual(["minimax-m2.1-free", "gpt-5"])
  })
})
