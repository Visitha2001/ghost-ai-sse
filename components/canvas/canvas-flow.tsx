"use client"

import { useCallback } from 'react'
import { ReactFlow, MiniMap, Background, BackgroundVariant, ConnectionMode, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useLiveblocksFlow } from '@liveblocks/react-flow'
import { useUndo, useRedo } from '@liveblocks/react/suspense'
import { canvasNode, canvasEdge } from '@/types/canvas'
import { CanvasNode } from './canvas-node'
import { CustomEdge } from './custom-edge'
import { ShapePanel } from './shape-panel'
import { MoreShapesPanel } from './more-shapes-panel'
import { PropertiesPanel } from './properties-panel'
import { useEffect } from 'react'

const nodeTypes = {
  custom: CanvasNode
}

const edgeTypes = {
  custom: CustomEdge
}

export function CanvasFlow() {
  const { screenToFlowPosition } = useReactFlow()
  const undo = useUndo()
  const redo = useRedo()

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useLiveblocksFlow<canvasNode, canvasEdge>({
    nodes: { initial: [] },
    edges: { initial: [] },
    suspense: true
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const typeData = event.dataTransfer.getData('application/reactflow')
      if (!typeData) return

      const { shape, width, height, emoji } = JSON.parse(typeData)

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: canvasNode = {
        id: `${shape}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'custom',
        position,
        data: { label: '', color: 'slate', shape, emoji },
        style: { width, height }
      }

      onNodesChange([{ type: 'add', item: newNode }])
    },
    [screenToFlowPosition, onNodesChange]
  )

  return (
    <div className="h-full w-full bg-base">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'custom' }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
        <MiniMap />
      </ReactFlow>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10 transition-all duration-300 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4">
          <ShapePanel />
          <MoreShapesPanel />
          <PropertiesPanel onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} />
        </div>
      </div>
    </div>
  )
}
