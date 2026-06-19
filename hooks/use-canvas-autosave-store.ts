import { create } from 'zustand'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface CanvasAutosaveState {
  status: SaveStatus
  setStatus: (status: SaveStatus) => void
}

export const useCanvasAutosaveStore = create<CanvasAutosaveState>((set) => ({
  status: 'idle',
  setStatus: (status) => set({ status })
}))
