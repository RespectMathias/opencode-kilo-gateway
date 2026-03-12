# Kilo Gateway OAuth Plugin for OpenCode

This plugin adds OAuth device login for the `kilo` provider in OpenCode.

Keep it simple:

- if you only want Kilo free models, you do not need this plugin
- if you want Kilo account-backed models, use this plugin for OAuth login
- the `kilo` provider itself still belongs in `opencode.json`

## Warning

The `kilo` provider configuration itself is just normal provider usage.

The OAuth flow in this plugin may violate Kilo's terms of service or future product restrictions. Use it at your own risk.

## Without the plugin

If you only want free models, configure the provider and stop there:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "kilo": {
      "name": "Kilo Gateway",
      "npm": "@ai-sdk/openai-compatible",
      "api": "https://api.kilo.ai/api/openrouter"
    }
  }
}
```

## With the plugin

Add the plugin and keep the same provider config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "file:///C:/Users/User/.config/opencode/node_modules/opencode-kilo-gateway/dist/index.js"
  ],
  "provider": {
    "kilo": {
      "name": "Kilo Gateway",
      "npm": "@ai-sdk/openai-compatible",
      "api": "https://api.kilo.ai/api/openrouter"
    }
  }
}
```

This plugin only adds OAuth login and Kilo request loading for that provider.

## Login

Run:

```bash
opencode auth login
```

Then choose:

- `Kilo Gateway`
- `Kilo Gateway`

You should get the same device flow shape as Kilo CLI:

- browser opens to Kilo device auth
- code is shown in the terminal
- OpenCode waits for authorization

## Usage

```bash
opencode run "Hello" --model=kilo/kilo-auto/frontier
```

Which models appear is controlled by the configured `kilo` provider and the gateway.

## Optional provider options

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

- `baseURL` overrides the Kilo API host
- `kilocodeOrganizationId` forces an organization context

## Dev

Build the plugin locally:

```bash
npm install
npm run build
```

Install it into your OpenCode config directory:

```bash
cd C:\Users\User\.config\opencode
npm install "C:\Users\User\source\repos\plugin\opencode-kilo-gateway"
```

Then point `opencode.json` at the built file:

```json
{
  "plugin": [
    "file:///C:/Users/User/.config/opencode/node_modules/opencode-kilo-gateway/dist/index.js"
  ]
}
```

When you change the plugin locally, rebuild it before testing:

```bash
npm run build
```

## Syncing with upstream Kilo

This package keeps a small sync helper instead of depending directly on the Kilo fork package.

```bash
npm run sync:kilo -- <tag-or-commit>
```

## Note

How is this different from other Kilo plugins?

- this one knows Kilo provider setup already populates models
- you do not need it for free models
- it provides a working OAuth device login flow
- you do not need to choose `Other`
- it is based directly on Kilo CLI gateway auth code
