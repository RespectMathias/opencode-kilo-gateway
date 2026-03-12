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
      "api": "https://api.kilo.ai/api/openrouter"
    }
  },
  "model": "kilo/kilo-auto/free"
}
```

You do not need a static `models` block. The plugin registers the `kilo` provider during config init, fetches the live Kilo catalog from `/models`, and keeps the model list dynamic.

Visibility rules:

- logged out: only models containing `free` are shown
- logged in: the full Kilo model catalog is shown

If the live fetch fails during startup, the plugin falls back to `kilo-auto/free` so the provider still loads.

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
opencode run "Hello" --model=kilo/kilo-auto/free
```

After login, you can switch to paid or auto-routed models such as `kilo/kilo-auto/frontier` or any other live model returned by the gateway.

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
