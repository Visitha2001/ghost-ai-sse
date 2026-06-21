import { create } from 'zustand'

interface EdgeLabelEditStore {
  editingEdgeId: string | null
  setEditingEdgeId: (id: string | null) => void
}

export const useEdgeLabelEdit = create<EdgeLabelEditStore>((set) => ({
  editingEdgeId: null,
  setEditingEdgeId: (id) => set({ editingEdgeId: id }),
}))
