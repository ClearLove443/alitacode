import fs from "fs"
import path from "path"
import os from "os"
import { Log } from "@/util/log"
import { getAlitaFiles } from "./embedded-files"

const log = Log.create({ service: "alita.setup" })

/**
 * 将嵌入的 .alita 文件夹内容写入到用户主目录的 ~/.alita 目录
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

    // 获取嵌入的 .alita 文件
    const alitaFiles = getAlitaFiles()
    if (Object.keys(alitaFiles).length > 0) {
      // 写入所有嵌入的文件到 ~/.alita 目录
      for (const [relativePath, content] of Object.entries(alitaFiles)) {
        const targetPath = path.join(alitaDir, relativePath)
        const targetDir = path.dirname(targetPath)

        // 确保父目录存在
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true })
        }

        fs.writeFileSync(targetPath, content, "utf-8")
      }

      log.info("wrote embedded .alita files", {
        fileCount: Object.keys(alitaFiles).length,
        target: alitaDir
      })
    } else {
      log.warn("no embedded .alita files found")
    }

    log.info("alita files setup completed from embedded resources")
  } catch (error) {
    log.error("failed to setup alita files", { error: error instanceof Error ? error.message : String(error) })
    throw error
  }
}
