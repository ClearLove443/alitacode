import { useLocal } from "@tui/context/local"
import { useDialog } from "@tui/ui/dialog"
import { DialogSelect } from "@tui/ui/dialog-select"
import { createMemo } from "solid-js"

export function DialogAgent(props: { onSelect?: (agent: string) => void | Promise<void> }) {
  const local = useLocal()
  const dialog = useDialog()

  const options = createMemo(() =>
    local.agent.list().map((item) => {
      return {
        value: item.name,
        title: item.name,
        description: item.native ? "native" : item.description,
      }
    }),
  )

  return (
    <DialogSelect
      title="Select agent"
      current={local.agent.current().name}
      options={options()}
      onSelect={async (option) => {
        if (props.onSelect) {
          await props.onSelect(option.value)
          dialog.clear()
          return
        }

        local.agent.set(option.value)
        dialog.clear()
      }}
    />
  )
}
