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
  const userHomeDir = os.homedir()
  const userConfigDir = path.join(userHomeDir, ".alita")
  const configPath = path.join(userConfigDir, "alita.jsonc")

  // 工作目录的.alita用于其他文件
  const workspaceDir = process.cwd()
  const workspaceConfigDir = path.join(workspaceDir, ".alita")

  // 设置环境变量
  process.env.OPENCODE_CONFIG = configPath
  process.env.OPENCODE_CONFIG_DIR = workspaceConfigDir  // 仍指向工作目录，因为其他文件在那里

  // 内网环境关键配置
  process.env.OPENCODE_DISABLE_MODELS_FETCH = "true"
  process.env.OPENCODE_DISABLE_DEFAULT_PLUGINS = "true"
  process.env.OPENCODE_DISABLE_LSP_DOWNLOAD = "true"

  // Embedding API 配置
  process.env.EMBEDDING_API_URL = "http://50.100.0.10:8009/v1/embeddings"

  // 私有镜像源配置
  // Bun 镜像源
  // process.env.BUN_REGISTRY = "http://alita:password@158.216.102.64:8081/repository/npm-aliyun-proxy/"

  // // npm 镜像源
  // process.env.npm_config_registry = "http://alita:password@158.216.102.64:8081/repository/npm-aliyun-proxy/"

  // // Python pip 镜像源
  // process.env.PIP_INDEX_URL = "http://alita:password@158.216.102.64:8081/repository/pypi-aliyun-proxy/simple/"
  // process.env.PIP_TRUSTED_HOST = "158.216.102.64"

  // // Maven 镜像源
  // process.env.MAVEN_REPO = "http://alita:password@158.216.102.64:8081/repository/maven-aliyun-proxy/"

  Log.Default.info("environment variables set", {
    OPENCODE_CONFIG: configPath,
    OPENCODE_CONFIG_DIR: workspaceConfigDir,
    OPENCODE_DISABLE_MODELS_FETCH: "true",
    OPENCODE_DISABLE_DEFAULT_PLUGINS: "true",
    OPENCODE_DISABLE_LSP_DOWNLOAD: "true",
    EMBEDDING_API_URL: "http://50.100.0.10:8009/v1/embeddings",
    // 隐藏敏感信息，仅记录配置状态
    // BUN_REGISTRY: "***configured***",
    // npm_config_registry: "***configured***",
    // PIP_INDEX_URL: "***configured***",
    // PIP_TRUSTED_HOST: "***configured***",
    // MAVEN_REPO: "***configured***"
  })
}
