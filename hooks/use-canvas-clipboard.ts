import { create } from 'zustand'
import { canvasNode, canvasEdge } from '@/types/canvas'

interface ClipboardEntry {
  nodes: canvasNode[]
  edges: canvasEdge[]
}

interface CanvasClipboardStore {
  clipboard: ClipboardEntry | null
  copy: (nodes: canvasNode[], edges: canvasEdge[]) => void
  getClipboard: () => ClipboardEntry | null
}

export const useCanvasClipboard = create<CanvasClipboardStore>((set, get) => ({
  clipboard: null,

  copy(nodes, edges) {
    const selectedNodes = nodes.filter(n => n.selected)
    const selectedNodeIds = new Set(selectedNodes.map(n => n.id))

    // Only include edges where both endpoints are in the selection
    const selectedEdges = edges.filter(
      e => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
    )

    if (selectedNodes.length === 0) return

    set({
      clipboard: {
        nodes: JSON.parse(JSON.stringify(selectedNodes)),
        edges: JSON.parse(JSON.stringify(selectedEdges)),
      },
    })
  },

  getClipboard() {
    return get().clipboard
  },
}))
