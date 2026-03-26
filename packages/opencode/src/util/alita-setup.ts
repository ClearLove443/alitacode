import fs from "fs"
import path from "path"
import os from "os"
import { Log } from "@/util/log"
import { getAlitaFiles } from "./embedded-files"

const log = Log.create({ service: "alita.setup" })

/**
 * 删除用户主目录中的 opencode.jsonc 文件（如果存在）
 */
function deleteOldOpencodeConfig(): void {
  const userHomeDir = os.homedir()
  const oldConfigPath = path.join(userHomeDir, ".alita", "opencode.jsonc")

  if (fs.existsSync(oldConfigPath)) {
    try {
      fs.unlinkSync(oldConfigPath)
      log.info("deleted old opencode.jsonc from user directory", { path: oldConfigPath })
    } catch (error) {
      log.error("failed to delete old opencode.jsonc", {
        path: oldConfigPath,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  } else {
    log.debug("old opencode.jsonc not found, no deletion needed", { path: oldConfigPath })
  }
}

/**
 * 将嵌入的 .alita 文件夹内容分离存储：
 * - alita.jsonc 写入用户主目录的 .alita 目录
 * - 其他文件写入当前工作目录的 .alita 目录
 * 兼容 Windows 和 Linux 系统
 */
export async function setupAlitaFiles(): Promise<void> {
  try {
    // 首先删除旧的 opencode.jsonc 文件
    deleteOldOpencodeConfig()

    // 用户主目录的 .alita 目录（用于配置文件）
    const userAlitaDir = path.join(os.homedir(), ".alita")

    // 当前工作目录的 .alita 目录（用于其他文件）
    const workspaceAlitaDir = path.join(process.cwd(), ".alita")

    // 确保用户主目录的 .alita 目录存在
    if (!fs.existsSync(userAlitaDir)) {
      fs.mkdirSync(userAlitaDir, { recursive: true })
      log.info("created user alita directory", { path: userAlitaDir })
    }

    // 确保当前工作目录的 .alita 目录存在
    if (!fs.existsSync(workspaceAlitaDir)) {
      fs.mkdirSync(workspaceAlitaDir, { recursive: true })
      log.info("created workspace alita directory", { path: workspaceAlitaDir })
    }

    // 获取嵌入的 .alita 文件
    const alitaFiles = getAlitaFiles()
    if (Object.keys(alitaFiles).length > 0) {
      // 写入所有嵌入的文件到对应目录
      for (const [relativePath, content] of Object.entries(alitaFiles)) {
        // alita.jsonc 写入用户主目录
        if (relativePath === "alita.jsonc") {
          const targetPath = path.join(userAlitaDir, relativePath)

          // 如果已存在，则跳过（避免覆盖现有配置）
          if (fs.existsSync(targetPath)) {
            log.debug("skipping existing alita.jsonc to preserve current config")
            continue
          }

          fs.writeFileSync(targetPath, content, "utf-8")
          log.info("wrote alita.jsonc to user directory", { path: targetPath })
        }
        // 其他文件写入当前工作目录
        else {
          const targetPath = path.join(workspaceAlitaDir, relativePath)
          const targetDir = path.dirname(targetPath)

          // 确保父目录存在
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true })
          }

          fs.writeFileSync(targetPath, content, "utf-8")
        }
      }

      log.info("wrote embedded .alita files", {
        configFileCount: 1,
        otherFileCount: Object.keys(alitaFiles).length - 1,
        userConfigDir: userAlitaDir,
        workspaceDir: workspaceAlitaDir
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
