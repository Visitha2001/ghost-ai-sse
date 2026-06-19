import { useEffect, useRef, useCallback } from 'react'
import { useNodes, useEdges, type Node, type Edge } from '@xyflow/react'
import { useCanvasAutosaveStore } from './use-canvas-autosave-store'

export function useCanvasAutosave(roomId: string) {
  const nodes = useNodes()
  const edges = useEdges()
  
  const setStatus = useCanvasAutosaveStore((state) => state.setStatus)
  
  const initialLoadRef = useRef(true)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const saveCanvas = useCallback(async (currentNodes: Node[], currentEdges: Edge[]) => {
    try {
      setStatus('saving')
      const response = await fetch(`/api/projects/${roomId}/canvas`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nodes: currentNodes, edges: currentEdges })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save canvas')
      }
      
      setStatus('saved')
    } catch (error) {
      console.error('Autosave error:', error)
      setStatus('error')
    }
  }, [roomId, setStatus])

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false
      return
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    setStatus('saving') // Optional: to indicate typing

    saveTimeoutRef.current = setTimeout(() => {
      saveCanvas(nodes, edges)
    }, 2000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [nodes, edges, saveCanvas, setStatus])
}
