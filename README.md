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
        "kilo-auto/free": {
          "name": "Kilo Auto Free",
          "limit": { "context": 256000, "output": 16384 },
          "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
        }
      }
    }
  },
  "model": "kilo/kilo-auto/free"
}
```

The seed model exists only to register the `kilo` provider. After login, the plugin refreshes the real Kilo model catalog and uses that list.

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
