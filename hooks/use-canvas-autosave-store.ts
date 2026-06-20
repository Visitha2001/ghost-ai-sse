import { create } from 'zustand'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface CanvasAutosaveState {
  status: SaveStatus
  setStatus: (status: SaveStatus) => void
  /** Registered by useCanvasAutosave — triggers an immediate manual save */
  triggerSave: (() => void) | null
  setTriggerSave: (fn: (() => void) | null) => void
}

export const useCanvasAutosaveStore = create<CanvasAutosaveState>((set) => ({
  status: 'idle',
  setStatus: (status) => set({ status }),
  triggerSave: null,
  setTriggerSave: (fn) => set({ triggerSave: fn }),
}))
