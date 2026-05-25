"use client"

import { useCallback } from 'react'
import { ReactFlow, MiniMap, Background, BackgroundVariant, ConnectionMode, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useLiveblocksFlow } from '@liveblocks/react-flow'
import { canvasNode, canvasEdge } from '@/types/canvas'
import { CanvasNode } from './canvas-node'
import { CustomEdge } from './custom-edge'

const nodeTypes = {
  custom: CanvasNode
}

const edgeTypes = {
  custom: CustomEdge
}

export function CanvasFlow() {
  const { screenToFlowPosition } = useReactFlow()
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useLiveblocksFlow<canvasNode, canvasEdge>({
    nodes: { initial: [] },
    edges: { initial: [] },
    suspense: true
  })

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const typeData = event.dataTransfer.getData('application/reactflow')
      if (!typeData) return

      const { shape, width, height } = JSON.parse(typeData)

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: canvasNode = {
        id: `${shape}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'custom',
        position,
        data: { label: '', color: 'default', shape },
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
    </div>
  )
}
