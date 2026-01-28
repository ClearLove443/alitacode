import { Log } from "@/util/log"
import { Installation } from "@/installation"
import { setupAlitaFiles } from "./alita-setup"
import { setupBinaryEnvironment } from "./binary-env"

/**
 * 初始化二进制运行环境
 * 包括环境变量设置和 ALITA 文件初始化
 */
export async function initializeBinaryEnvironment(): Promise<void> {
  // 仅在打包版本中执行初始化
  if (Installation.isLocal()) {
    return
  }

  try {
    // 设置环境变量
    setupBinaryEnvironment()
    
    // 初始化 ALITA 文件到用户主目录
    await setupAlitaFiles()
    
    Log.Default.info("binary environment initialized successfully")
  } catch (error) {
    Log.Default.warn("failed to initialize binary environment", {
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
