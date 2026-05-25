"use client"

import { ReactFlow, MiniMap, Background, BackgroundVariant, ConnectionMode } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useLiveblocksFlow } from '@liveblocks/react-flow'
import { canvasNode, canvasEdge } from '@/types/canvas'

export function CanvasFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useLiveblocksFlow<canvasNode, canvasEdge>({
    nodes: { initial: [] },
    edges: { initial: [] },
    suspense: true
  })

  return (
    <div className="h-full w-full bg-base">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
