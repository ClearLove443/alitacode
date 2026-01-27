import { DialogAgent } from "../dialog-agent"
import { handleAgentSwitchCommand } from "./agent-switch"

export function createAgentSwitchHandler(input: {
  sdk: any
  route: any
  local: any
  dialog: any
  toast: any
  promptModelWarning: () => void
  initialMessage: string
  getInputBox: () => any
  setStore: any
}) {
  return async (trimmed: string): Promise<boolean> =>
    handleAgentSwitchCommand({
      trimmed,
      sdk: input.sdk,
      route: input.route,
      local: input.local,
      initialMessage: input.initialMessage,
      promptModelWarning: input.promptModelWarning,
      openDialog: (onSelect) => {
        input.dialog.replace(() => <DialogAgent onSelect={onSelect} />)
      },
      clearPromptUI: () => {
        const inputBox = input.getInputBox()
        if (!inputBox) return
        inputBox.extmarks.clear()
        input.setStore("prompt", {
          input: "",
          parts: [],
        })
        input.setStore("extmarkToPartIndex", new Map())
        inputBox.clear()
      },
      toastInfo: (message) => {
        input.toast.show({
          variant: "info",
          message,
          duration: 2000,
        })
      },
    })
}
