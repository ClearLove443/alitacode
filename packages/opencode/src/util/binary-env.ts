import { Log } from "@/util/log"
import { Installation } from "@/installation"

/**
 * 设置二进制运行时的环境变量
 * 仅在非开发环境（打包版本）中设置必要的环境变量
 */
export function setupBinaryEnvironment(): void {
  // 仅在打包版本中设置环境变量
  if (Installation.isLocal()) {
    return
  }

  const os = require("os")
  const path = require("path")
  
  // 设置配置文件路径（兼容 Windows 和 Linux）
  const homeDir = os.homedir()
  const configPath = path.join(homeDir, ".alita", "opencode.jsonc")
  process.env.OPENCODE_CONFIG = configPath
  
  // 禁用模型获取
  process.env.OPENCODE_DISABLE_MODELS_FETCH = "true"
  
  Log.Default.info("environment variables set", {
    OPENCODE_CONFIG: configPath,
    OPENCODE_DISABLE_MODELS_FETCH: "true"
  })
}
