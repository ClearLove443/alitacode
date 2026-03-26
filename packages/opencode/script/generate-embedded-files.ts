#!/usr/bin/env bun

import fs from "fs"
import path from "path"

// 读取 .alita 目录下的所有文件并生成嵌入代码
function generateEmbeddedFiles(): { files: Record<string, string> } {
  const files: Record<string, string> = {}

  // 递归读取 .alita 目录
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

  // 读取 .alita
  readDirectory(".alita")

  return { files }
}

// 生成最终的 embedded-files.ts
function generateEmbeddedFilesTS(): void {
  const { files } = generateEmbeddedFiles()

  const filesJSON = JSON.stringify(files, null, 2)

  const content = `import fs from "fs"
import path from "path"

// 嵌入的 .alita 文件内容
const EMBEDDED_ALITA_FILES: Record<string, string> = ${filesJSON}

/**
 * 读取嵌入的 .alita 文件内容
 */
export function getAlitaFiles(): Record<string, string> {
  return EMBEDDED_ALITA_FILES
}
`

  fs.writeFileSync("src/util/embedded-files.ts", content, "utf-8")
  console.log("Generated embedded-files.ts")
  console.log(`Embedded ${Object.keys(files).length} files from .alita`)
}

// 运行生成
generateEmbeddedFilesTS()
