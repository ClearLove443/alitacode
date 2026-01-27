import { TextAttributes, RGBA } from "@opentui/core"
import { For, type JSX } from "solid-js"
import { useTheme, tint } from "@tui/context/theme"

// Shadow markers (rendered chars in parens):
// _ = full shadow cell (space with bg=shadow)
// ^ = letter top, shadow bottom (▀ with fg=letter, bg=shadow)
// ~ = shadow top only (▀ with fg=shadow)
const SHADOW_MARKER = /[_^~]/

const LOGO = ["", "█▀▀█ █░░░ ▀█▀ ▀▀█▀▀ █▀▀█", "█▄▄█ █░░░ ░█░ ░░█░░ █▄▄█", "▀░░▀ ▀▀▀▀ ▀▀▀ ░░▀░░ ▀░░▀"]

export function Logo() {
  const { theme } = useTheme()
  return (
    <box>
      <For each={LOGO}>
        {(line) => (
          <text fg={theme.text} attributes={TextAttributes.BOLD} selectable={false}>
            {line}
          </text>
        )}
      </For>
    </box>
  )
}
