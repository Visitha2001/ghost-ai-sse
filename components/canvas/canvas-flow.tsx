"use client"

import { useCallback } from 'react'
import { ReactFlow, Background, BackgroundVariant, ConnectionMode, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useLiveblocksFlow } from '@liveblocks/react-flow'
import { useUndo, useRedo } from '@liveblocks/react/suspense'
import { canvasNode, canvasEdge } from '@/types/canvas'
import { CanvasNode } from './canvas-node'
import { CustomEdge } from './custom-edge'
import { ShapePanel } from './shape-panel'
import { MoreShapesPanel } from './more-shapes-panel'
import { PropertiesPanel } from './properties-panel'
import { CanvasControls } from './canvas-controls'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

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

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } = useLiveblocksFlow<canvasNode, canvasEdge>({
    nodes: { initial: [] },
    edges: { initial: [] },
    suspense: true
  })

  useKeyboardShortcuts({ undo, redo })

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
        data: { label: '', color: 'neutral', shape, emoji },
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
        onDelete={onDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'custom' }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
      </ReactFlow>

      <CanvasControls />

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10 transition-all duration-300 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4">
          <ShapePanel />
          <MoreShapesPanel />
          <PropertiesPanel onDelete={onDelete} />
        </div>
      </div>
    </div>
  )
}
