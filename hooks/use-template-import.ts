import { create } from "zustand"
import type { CanvasTemplate } from "@/components/editor/starter-templates"

interface TemplateImportState {
  /** The template to import — set by the navbar, consumed by the canvas */
  pendingTemplate: CanvasTemplate | null
  /** Signal a template to be imported */
  requestImport: (template: CanvasTemplate) => void
  /** Clear the pending template after the canvas has consumed it */
  clearPending: () => void
}

export const useTemplateImport = create<TemplateImportState>((set) => ({
  pendingTemplate: null,
  requestImport: (template) => set({ pendingTemplate: template }),
  clearPending: () => set({ pendingTemplate: null }),
}))
