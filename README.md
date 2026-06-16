# Kilo Gateway OAuth Plugin for OpenCode

This plugin adds OAuth device login for the `kilo` provider in OpenCode.

## Warning

The OAuth in this plugin may violate Kilo's TOS or future product restrictions. Use it at your own risk.
Using the `kilo` provider doesn't violate TOS, since you did not agree to it.

The plugin injects the `kilo` provider config automatically:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-kilo-gateway@latest"
  ]
}
```

You will be able to access the free models without signing in.

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

## Free model filtering

The plugin can detect when you are not logged in and will only show free models in that case. Kilo's OpenCode fork exposes free model metadata, but not Kilo billing/subscription tier details. Logged-in users see all Kilo models.

Free models are detected from Kilo's `isFree` catalog metadata when available, and otherwise by a `free` segment in the model id/name.

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
