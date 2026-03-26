import type { Hooks, PluginInput } from "@opencode-ai/plugin"
import { Log } from "../util/log"
import { MemoryPlugin } from "./agent-memory/plugin"

const log = Log.create({ service: "plugin.agent-memory" })

export async function AgentMemoryPlugin(input: PluginInput): Promise<Hooks> {
  log.info("Agent Memory plugin loaded")
  return MemoryPlugin(input)
}
