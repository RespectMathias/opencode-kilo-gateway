# Kilo Gateway OAuth Plugin for OpenCode

This plugin adds OAuth device login for the `kilo` provider in OpenCode.

## Warning

The OAuth in this plugin may violate Kilo's TOS or future product restrictions. Use it at your own risk.
Using the `kilo` provider doesn't violate TOS, since you did not agree to it.

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
Free models where the alpha period has not yet ended as of March 12, 2026:

| Lab      | Model                        |
| -------- | ---------------------------- |
| MiniMax  | MiniMax M2.5 (free)          |
| StepFun  | Step 3.5 Flash (free)        |
| Arcee AI | Trinity Large Preview (free) |

## With the plugin

If you want to use the models requiring sign in, add the plugin. The plugin injects the `kilo` provider config automatically:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-kilo-gateway@latest"
  ]
}
```

## Login

Run:

```bash
opencode auth login
```

Then choose:

- `Kilo Gateway`

You should get the same device flow shape as Kilo CLI:

- browser opens to Kilo device auth
- code is shown in the terminal
- OpenCode waits for authorization

Which models appear is controlled by the injected `kilo` provider and the gateway.

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

## Note

How is this different from other Kilo plugins?

- this one knows Kilo provider setup already populates models, so you do not need it for free models
- it provides a working OAuth device login
- you do not need to choose `Other`
- it is based directly on Kilo CLI gateway auth code
