"use client"

import * as React from "react"
import { useEventListener, useOthers, useMyPresence } from "@liveblocks/react/suspense"
import { useAiStatusStore } from "@/hooks/use-ai-status-store"
import { AiStatusFeedPayloadSchema } from "@/types/tasks"

export function AiStatusSync() {
  const others = useOthers()
  const [myPresence] = useMyPresence()
  const setLatestMessage = useAiStatusStore((state) => state.setLatestMessage)
  const setIsGenerating = useAiStatusStore((state) => state.setIsGenerating)

  const isGenerating = myPresence.thinking || others.some((other) => other.presence.thinking) || false

  React.useEffect(() => {
    setIsGenerating(isGenerating)
  }, [isGenerating, setIsGenerating])

  useEventListener(({ event }) => {
    if (event.type === "ai-status-feed") {
      const parsed = AiStatusFeedPayloadSchema.safeParse(event.payload)
      if (parsed.success) {
        setLatestMessage(parsed.data.text || null)
      }
    }
  })

  // Clear message when done
  React.useEffect(() => {
    if (!isGenerating) {
      setLatestMessage(null)
    }
  }, [isGenerating, setLatestMessage])

  return null
}
