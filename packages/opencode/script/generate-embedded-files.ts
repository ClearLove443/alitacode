#!/usr/bin/env bun

import fs from "fs"
import path from "path"

// 读取 .alita-core 目录下的所有文件并生成嵌入代码
function generateEmbeddedFiles(): { files: Record<string, string>, config: string } {
  const files: Record<string, string> = {}
  let config = "{}"

  // 递归读取 .alita-core 目录
  function readDirectory(dir: string, base: string = ""): void {
    if (!fs.existsSync(dir)) return

    const items = fs.readdirSync(dir)

    for (const item of items) {
      const itemPath = path.join(dir, item)
      const relativePath = base ? path.join(base, item) : item

      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        readDirectory(itemPath, relativePath)
      } else {
        const content = fs.readFileSync(itemPath, "utf-8")
        files[relativePath] = content
      }
    }
  }

  // 读取 .alita-core
  readDirectory(".alita-core")

  // 读取 opencode.jsonc
  if (fs.existsSync("opencode.jsonc")) {
    config = fs.readFileSync("opencode.jsonc", "utf-8")
  }

  // 读取 AGENTS.md
  if (fs.existsSync("AGENTS.md")) {
    files["AGENTS.md"] = fs.readFileSync("AGENTS.md", "utf-8")
  }

  return { files, config }
}

// 生成最终的 embedded-files.ts
function generateEmbeddedFilesTS(): void {
  const { files, config } = generateEmbeddedFiles()

  const filesJSON = JSON.stringify(files, null, 2)
  const configJSON = JSON.stringify(config)

  const content = `import fs from "fs"
import path from "path"

// 嵌入的 .alita-core 文件内容
const EMBEDDED_ALITA_CORE_FILES: Record<string, string> = ${filesJSON}

// 嵌入的 opencode.jsonc 文件内容
const EMBEDDED_OPENCODE_CONFIG = ${configJSON}

/**
 * 读取嵌入的 .alita-core 文件内容
 */
export function getAlitaCoreFiles(): Record<string, string> {
  return EMBEDDED_ALITA_CORE_FILES
}

/**
 * 读取嵌入的 opencode.jsonc 文件内容
 */
export function getOpencodeConfig(): string {
  return EMBEDDED_OPENCODE_CONFIG
}
`

  fs.writeFileSync("src/util/embedded-files.ts", content, "utf-8")
  console.log("Generated embedded-files.ts")
  console.log(`Embedded ${Object.keys(files).length} files from .alita-core and AGENTS.md`)
  console.log(`Embedded opencode.jsonc: ${config !== "{}" ? "yes" : "no"}`)
  console.log(`Embedded AGENTS.md: ${files["AGENTS.md"] ? "yes" : "no"}`)
}

// 运行生成
generateEmbeddedFilesTS()
