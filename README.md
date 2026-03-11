# Kilo Gateway Provider Plugin for OpenCode

Use Kilo Gateway as a dedicated `kilo` provider inside OpenCode.

This plugin adds:

- Kilo device authorization login
- dynamic model loading from Kilo's OpenRouter-compatible `/models` API
- Kilo request headers for routed provider calls
- a dedicated provider configuration path that does not interfere with an existing `openrouter` provider

## Install

Add the plugin package to your OpenCode config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-kilo-gateway@latest"],
  "provider": {
    "kilo": {
      "name": "Kilo Gateway",
      "npm": "@ai-sdk/openai-compatible",
      "api": "https://api.kilo.ai/api/openrouter",
      "models": {
        "kilo-auto/frontier": {
          "name": "Kilo Auto Frontier",
          "limit": { "context": 262144, "output": 32768 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
        },
        "kilo-auto/small": {
          "name": "Kilo Auto Small",
          "limit": { "context": 131072, "output": 32768 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
        },
        "kilo-auto/free": {
          "name": "Kilo Auto Free",
          "limit": { "context": 256000, "output": 16384 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
        },
        "trinity-large-preview-free": {
          "name": "Trinity Large Preview Free",
          "limit": { "context": 131072, "output": 131072 },
          "modalities": { "input": ["text"], "output": ["text"] }
        },
        "glm-4.7-free": {
          "name": "GLM 4.7 Free",
          "limit": { "context": 131072, "output": 65536 },
          "modalities": { "input": ["text"], "output": ["text"] }
        },
        "minimax-m2.1-free": {
          "name": "MiniMax M2.1 Free",
          "limit": { "context": 204800, "output": 131072 },
          "modalities": { "input": ["text"], "output": ["text"] }
        },
        "kimi-k2.5-free": {
          "name": "Kimi K2.5 Free",
          "limit": { "context": 262144, "output": 262144 },
          "modalities": { "input": ["text", "image", "video"], "output": ["text"] }
        },
        "minimax-m2.1": {
          "name": "MiniMax M2.1",
          "limit": { "context": 204800, "output": 131072 },
          "modalities": { "input": ["text"], "output": ["text"] }
        },
        "kimi-k2.5": {
          "name": "Kimi K2.5",
          "limit": { "context": 262144, "output": 262144 },
          "modalities": { "input": ["text", "image", "video"], "output": ["text"] }
        },
        "claude-sonnet-4-5": {
          "name": "Claude Sonnet 4.5",
          "limit": { "context": 1000000, "output": 64000 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
        },
        "gpt-5": {
          "name": "GPT-5",
          "limit": { "context": 400000, "output": 128000 },
          "modalities": { "input": ["text", "image"], "output": ["text"] }
        }
      }
    }
  },
  "model": "kilo/kilo-auto/frontier",
  "small_model": "kilo/kilo-auto/small"
}
```

These are seed models to register the `kilo` provider with realistic Kilo options before the plugin refresh runs. After startup and after auth, the plugin fetches the live Kilo catalog from `/models` and uses that authoritative list.

## Login

Run:

```bash
opencode auth login
```

Then choose:

- `kilo`
- `Kilo Gateway (Device Authorization)`

You can also paste a token using the `Manual Kilo Token` auth method.

## Usage

Example:

```bash
opencode run "Hello" --model=kilo/kilo-auto/frontier
```

The seed config now includes:

- Kilo aliases: `kilo-auto/frontier`, `kilo-auto/small`, `kilo-auto/free`
- free catalog examples: `trinity-large-preview-free`, `glm-4.7-free`, `minimax-m2.1-free`, `kimi-k2.5-free`
- paid catalog examples: `minimax-m2.1`, `kimi-k2.5`, `claude-sonnet-4-5`, `gpt-5`

If Kilo adds or removes models, the plugin's live `/models` refresh remains the source of truth; these README entries are only the bootstrap provider registration set.

## Optional provider options

Add these under `provider.kilo.options` in `opencode.json` if needed:

```json
{
  "provider": {
    "kilo": {
      "options": {
        "baseURL": "https://api.kilo.ai",
        "kilocodeOrganizationId": "org_123"
      }
    }
  }
}
```

- `baseURL`: override the Kilo API host
- `kilocodeOrganizationId`: force a specific organization context

## Syncing with upstream Kilo

This plugin keeps a small sync helper instead of depending directly on the Kilo fork package.

```bash
npm run sync:kilo -- <tag-or-commit>
```

That script snapshots a few Kilo gateway source files into `vendor/kilo-gateway/` for comparison when upstream changes.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```
