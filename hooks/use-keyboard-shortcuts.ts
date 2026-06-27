import { useEffect, useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { canvasNode, canvasEdge } from '@/types/canvas'
import { useCanvasClipboard } from './use-canvas-clipboard'

import { OnNodesChange, OnEdgesChange } from '@xyflow/react'

interface UseKeyboardShortcutsProps {
  undo: () => void
  redo: () => void
  onNodesChange: OnNodesChange<canvasNode>
  onEdgesChange: OnEdgesChange<canvasEdge>
}

const PASTE_OFFSET = 24 // px offset for pasted items

export function useKeyboardShortcuts({
  undo,
  redo,
  onNodesChange,
  onEdgesChange,
}: UseKeyboardShortcutsProps) {
  const { zoomIn, zoomOut, getNodes, getEdges } = useReactFlow()
  const copy = useCanvasClipboard(s => s.copy)
  const getClipboard = useCanvasClipboard(s => s.getClipboard)

  const handleCopy = useCallback(() => {
    const nodes = getNodes() as canvasNode[]
    const edges = getEdges() as canvasEdge[]
    copy(nodes, edges)

    // Deselect all copied items
    const selectedNodes = nodes.filter(n => n.selected)
    const selectedEdges = edges.filter(e => e.selected)
    
    if (selectedNodes.length > 0) {
      onNodesChange(selectedNodes.map(n => ({ type: 'select', id: n.id, selected: false })))
    }
    if (selectedEdges.length > 0) {
      onEdgesChange(selectedEdges.map(e => ({ type: 'select', id: e.id, selected: false })))
    }
  }, [getNodes, getEdges, copy, onNodesChange, onEdgesChange])

  const handlePaste = useCallback(() => {
    const clipboard = getClipboard()
    if (!clipboard || clipboard.nodes.length === 0) return

    const now = Date.now()
    // Build a map from old ID → new ID for edge remapping
    const idMap = new Map<string, string>()

    const newNodes: canvasNode[] = clipboard.nodes.map((n, i) => {
      const newId = `paste-${now}-${i}`
      idMap.set(n.id, newId)
      return {
        ...n,
        id: newId,
        position: {
          x: n.position.x + PASTE_OFFSET,
          y: n.position.y + PASTE_OFFSET,
        },
        selected: true,
      }
    })

    const newEdges: canvasEdge[] = clipboard.edges.map((e, i) => ({
      ...e,
      id: `paste-edge-${now}-${i}`,
      source: idMap.get(e.source) ?? e.source,
      target: idMap.get(e.target) ?? e.target,
      selected: true,
    }))

    onNodesChange(newNodes.map(item => ({ type: 'add' as const, item })))
    onEdgesChange(newEdges.map(item => ({ type: 'add' as const, item })))
  }, [getClipboard, onNodesChange, onEdgesChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return
      }

      const mod = e.ctrlKey || e.metaKey

      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        e.shiftKey ? redo() : undo()
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      } else if (mod && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        handleCopy()
      } else if (mod && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        handlePaste()
      } else if (e.key === '=' || e.key === '+') {
        zoomIn({ duration: 200 })
      } else if (e.key === '-') {
        zoomOut({ duration: 200 })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, zoomIn, zoomOut, handleCopy, handlePaste])
}
