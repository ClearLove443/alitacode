import fs from "fs"
import path from "path"
import os from "os"
import { Log } from "@/util/log"
import { getAlitaCoreFiles, getOpencodeConfig } from "./embedded-files"

const log = Log.create({ service: "alita.setup" })

/**
 * 将嵌入的 .alita-core 和 opencode.jsonc 写入到用户主目录的 ~/.alita 目录
 * 兼容 Windows 和 Linux 系统
 */
export async function setupAlitaFiles(): Promise<void> {
  try {
    // 目标目录路径 - ~/.alita
    const alitaDir = path.join(os.homedir(), ".alita")

    // 确保 ~/.alita 目录存在
    if (!fs.existsSync(alitaDir)) {
      fs.mkdirSync(alitaDir, { recursive: true })
      log.info("created alita directory", { path: alitaDir })
    }

    // 写入嵌入的 .alita-core 文件
    const alitaCoreFiles = getAlitaCoreFiles()
    if (Object.keys(alitaCoreFiles).length > 0) {
      const alitaCoreTarget = path.join(alitaDir, ".alita-core")

      // 如果目标目录已存在，先删除
      if (fs.existsSync(alitaCoreTarget)) {
        fs.rmSync(alitaCoreTarget, { recursive: true, force: true })
      }

      // 创建目录并写入文件
      fs.mkdirSync(alitaCoreTarget, { recursive: true })

      for (const [relativePath, content] of Object.entries(alitaCoreFiles)) {
        const targetPath = path.join(alitaCoreTarget, relativePath)
        const targetDir = path.dirname(targetPath)

        // 确保父目录存在
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true })
        }

        fs.writeFileSync(targetPath, content, "utf-8")
      }

      log.info("wrote embedded .alita-core files", {
        fileCount: Object.keys(alitaCoreFiles).length,
        target: alitaCoreTarget
      })
    } else {
      log.warn("no embedded .alita-core files found")
    }

    // 写入嵌入的 opencode.jsonc 文件
    const opencodeConfigContent = getOpencodeConfig()
    if (opencodeConfigContent && opencodeConfigContent !== "{}") {
      const opencodeConfigTarget = path.join(alitaDir, "opencode.jsonc")

      // 写入文件
      fs.writeFileSync(opencodeConfigTarget, opencodeConfigContent, "utf-8")
      log.info("wrote embedded opencode.jsonc", { target: opencodeConfigTarget })
    } else {
      log.warn("no embedded opencode.jsonc content found")
    }

    // 写入嵌入的 AGENTS.md 文件
    if (alitaCoreFiles["AGENTS.md"]) {
      const agentsMdTarget = path.join(alitaDir, "AGENTS.md")

      // 写入文件
      fs.writeFileSync(agentsMdTarget, alitaCoreFiles["AGENTS.md"], "utf-8")
      log.info("wrote embedded AGENTS.md", { target: agentsMdTarget })
    } else {
      log.warn("no embedded AGENTS.md content found")
    }

    log.info("alita files setup completed from embedded resources")
  } catch (error) {
    log.error("failed to setup alita files", { error: error instanceof Error ? error.message : String(error) })
    throw error
  }
}
