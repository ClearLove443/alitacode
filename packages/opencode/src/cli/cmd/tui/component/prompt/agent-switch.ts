import { Identifier } from "@/id/id"

export async function switchAgentWithFreshSession(input: {
  sdk: {
    client: {
      session: {
        create: (args: {}) => Promise<{ data?: { id: string } }>
        prompt: (args: any) => Promise<any> | any
      }
    }
  }
  route: {
    navigate: (args: { type: "session"; sessionID: string }) => void
  }
  local: {
    agent: {
      current: () => { name: string }
    }
    model: {
      current: () => any
      variant: {
        current: () => any
      }
    }
  }
  agent: string
  initialMessage: string
  promptModelWarning: () => void
}) {
  const selectedModel = input.local.model.current()
  if (!selectedModel) {
    input.promptModelWarning()
    return
  }

  const sessionID = await input.sdk.client.session.create({}).then((x) => x.data!.id)
  input.route.navigate({
    type: "session",
    sessionID,
  })

  const variant = input.local.model.variant.current()

  input.sdk.client.session.prompt({
    sessionID,
    ...selectedModel,
    messageID: Identifier.ascending("message"),
    agent: input.local.agent.current().name,
    model: selectedModel,
    variant,
    parts: [
      {
        id: Identifier.ascending("part"),
        type: "text",
        text: input.initialMessage,
        metadata: {
          hidden: true,
          source: "agent_switch_initial",
        },
      },
    ],
  })

  setTimeout(() => {
    if (input.local.agent.current().name !== input.agent) return
    input.route.navigate({
      type: "session",
      sessionID,
    })
  }, 50)
}

export async function handleAgentSwitchCommand(input: {
  trimmed: string
  sdk: {
    client: {
      session: {
        create: (args: {}) => Promise<{ data?: { id: string } }>
        prompt: (args: any) => Promise<any> | any
      }
    }
  }
  route: {
    navigate: (args: { type: "session"; sessionID: string }) => void
  }
  local: {
    agent: {
      current: () => { name: string }
      set: (agent: string) => void
    }
    model: {
      current: () => any
      variant: {
        current: () => any
      }
    }
  }
  initialMessage: string
  promptModelWarning: () => void
  openDialog: (onSelect: (agent: string) => void | Promise<void>) => void
  clearPromptUI: () => void
  toastInfo: (message: string) => void
}): Promise<boolean> {
  if (!input.trimmed.startsWith("*")) return false
  const name = input.trimmed.slice(1).trim().split(/\s+/)[0]

  if (!name) {
    input.openDialog(async (next) => {
      const previous = input.local.agent.current().name
      input.local.agent.set(next)
      if (input.local.agent.current().name !== previous) {
        input.toastInfo(`Switched agent: ${next}`)
        await switchAgentWithFreshSession({
          sdk: input.sdk,
          route: input.route,
          local: input.local,
          agent: next,
          initialMessage: input.initialMessage,
          promptModelWarning: input.promptModelWarning,
        })
      }
    })
    input.clearPromptUI()
    return true
  }

  const previous = input.local.agent.current().name
  input.local.agent.set(name)
  if (input.local.agent.current().name !== previous) {
    input.toastInfo(`Switched agent: ${name}`)
    await switchAgentWithFreshSession({
      sdk: input.sdk,
      route: input.route,
      local: input.local,
      agent: name,
      initialMessage: input.initialMessage,
      promptModelWarning: input.promptModelWarning,
    })
  }

  input.clearPromptUI()
  return true
}
