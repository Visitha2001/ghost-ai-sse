import { useEffect, useRef, useCallback } from 'react'
import { useNodes, useEdges, type Node, type Edge } from '@xyflow/react'
import { toast } from 'sonner'
import { useCanvasAutosaveStore } from './use-canvas-autosave-store'

export function useCanvasAutosave(roomId: string) {
  const nodes = useNodes()
  const edges = useEdges()

  const setStatus = useCanvasAutosaveStore((state) => state.setStatus)
  const setTriggerSave = useCanvasAutosaveStore((state) => state.setTriggerSave)

  const initialLoadRef = useRef(true)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const savedResetRef = useRef<NodeJS.Timeout | null>(null)
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)

  // Keep refs in sync so triggerSave always uses the latest data
  nodesRef.current = nodes
  edgesRef.current = edges

  const saveCanvas = useCallback(
    async (currentNodes: Node[], currentEdges: Edge[], showToast = false) => {
      // Cancel any pending autosave debounce if doing a manual save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
      // Cancel any pending "saved → idle" reset
      if (savedResetRef.current) {
        clearTimeout(savedResetRef.current)
        savedResetRef.current = null
      }

      try {
        setStatus('saving')
        const response = await fetch(`/api/projects/${roomId}/canvas`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodes: currentNodes, edges: currentEdges }),
        })

        if (!response.ok) {
          throw new Error('Failed to save canvas')
        }

        setStatus('saved')

        if (showToast) {
          toast.success('Canvas saved', {
            description: 'All changes have been saved.',
            duration: 2500,
          })
        }

        // Auto-reset "saved" badge back to idle after 3 seconds
        savedResetRef.current = setTimeout(() => {
          setStatus('idle')
        }, 3000)
      } catch (error) {
        console.error('Autosave error:', error)
        setStatus('error')
        if (showToast) {
          toast.error('Save failed', {
            description: 'Could not save your canvas. Please try again.',
            duration: 4000,
          })
        }
      }
    },
    [roomId, setStatus]
  )

  // Register the manual save trigger into the store.
  // NOTE: pass the fn directly — NOT wrapped in an extra () =>
  // because setTriggerSave does set({ triggerSave: fn }) (object form),
  // so a double-arrow would store the outer fn and never invoke the inner one.
  useEffect(() => {
    const fn = () => saveCanvas(nodesRef.current, edgesRef.current, true)
    setTriggerSave(fn)
    return () => setTriggerSave(null)
  }, [saveCanvas, setTriggerSave])

  // Autosave on canvas changes (debounced 2 s, no toast)
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false
      return
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    setStatus('saving')

    saveTimeoutRef.current = setTimeout(() => {
      saveCanvas(nodesRef.current, edgesRef.current, false)
    }, 2000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [nodes, edges, saveCanvas, setStatus])
}
