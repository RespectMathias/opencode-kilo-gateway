# Kilo Gateway Provider Plugin for OpenCode

Use Kilo Gateway as a dedicated `kilo` provider inside OpenCode.

This plugin adds:

- Kilo device authorization login
- Kilo request headers for routed provider calls
- auth loading for a dedicated `kilo` provider configured in OpenCode

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
  }
}
```

The provider itself is defined in your `opencode.json`. This plugin only supplies Kilo authentication and request loading for that provider.

## Login

Run:

```bash
opencode auth login
```

Then choose:

- `kilo`
- `Kilo Gateway`

## Usage

Example:

```bash
opencode run "Hello" --model=kilo/kilo-auto/frontier
```

Which models appear is controlled by OpenCode's configured `kilo` provider and whatever the gateway returns for that provider path.

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
