import { mkdir, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"

const ref = process.argv[2] || "main"
const root = new URL("..", import.meta.url)
const rootPath = fileURLToPath(root)

const files = [
  {
    source: "packages/kilo-gateway/src/auth/device-auth-tui.ts",
    target: "vendor/kilo-gateway/device-auth-tui.ts",
  },
  {
    source: "packages/kilo-gateway/src/api/models.ts",
    target: "vendor/kilo-gateway/models.ts",
  },
  {
    source: "packages/kilo-gateway/src/headers.ts",
    target: "vendor/kilo-gateway/headers.ts",
  },
  {
    source: "packages/kilo-gateway/src/api/constants.ts",
    target: "vendor/kilo-gateway/constants.ts",
  },
]

for (const file of files) {
  const url = `https://raw.githubusercontent.com/Kilo-Org/kilocode/${ref}/${file.source}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  const outputPath = path.resolve(rootPath, file.target)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, await response.text(), "utf8")
  console.log(`synced ${file.source} -> ${file.target}`)
}
