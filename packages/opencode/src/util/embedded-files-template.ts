import fs from "fs"
import path from "path"

// 嵌入的 .alita-core 文件内容
const EMBEDDED_ALITA_CORE_FILES: Record<string, string> = {}

// 嵌入的 opencode.jsonc 文件内容
const EMBEDDED_OPENCODE_CONFIG = "{}"

/**
 * 读取嵌入的 .alita-core 文件内容
 */
export function getAlitaCoreFiles(): Record<string, string> {
  // 在构建时，这些内容会被实际的文件内容替换
  return EMBEDDED_ALITA_CORE_FILES
}

/**
 * 读取嵌入的 opencode.jsonc 文件内容
 */
export function getOpencodeConfig(): string {
  // 在构建时，这个内容会被实际的文件内容替换
  return EMBEDDED_OPENCODE_CONFIG
}
