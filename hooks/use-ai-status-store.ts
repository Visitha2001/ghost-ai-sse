import { create } from "zustand"

interface AiStatusStore {
  isGenerating: boolean
  latestMessage: string | null
  setIsGenerating: (isGenerating: boolean) => void
  setLatestMessage: (message: string | null) => void
}

export const useAiStatusStore = create<AiStatusStore>((set) => ({
  isGenerating: false,
  latestMessage: null,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setLatestMessage: (latestMessage) => set({ latestMessage }),
}))
