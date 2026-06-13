"use client"

import { useCallback, useEffect } from 'react'
import { ReactFlow, Background, BackgroundVariant, ConnectionMode, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useLiveblocksFlow } from '@liveblocks/react-flow'
import { useUndo, useRedo, useUpdateMyPresence } from '@liveblocks/react/suspense'
import { canvasNode, canvasEdge } from '@/types/canvas'
import { CanvasNode } from './canvas-node'
import { CustomEdge } from './custom-edge'
import { ShapePanel } from './shape-panel'
import { MoreShapesPanel } from './more-shapes-panel'
import { PropertiesPanel } from './properties-panel'
import { CanvasControls } from './canvas-controls'
import { LiveCursors } from './live-cursors'
import { PresenceAvatars } from './presence-avatars'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useTemplateImport } from '@/hooks/use-template-import'

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
  const updateMyPresence = useUpdateMyPresence()

  /* ── Cursor broadcasting ───────────────────────────────────────── */
  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const flowPos = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      updateMyPresence({ cursor: flowPos })
    },
    [screenToFlowPosition, updateMyPresence]
  )

  const onPointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null })
  }, [updateMyPresence])

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } = useLiveblocksFlow<canvasNode, canvasEdge>({
    nodes: { initial: [] },
    edges: { initial: [] },
    suspense: true
  })

  useKeyboardShortcuts({ undo, redo })

  /* ── Template import handler ───────────────────────────────────── */
  const pendingTemplate = useTemplateImport((s) => s.pendingTemplate)
  const clearPending = useTemplateImport((s) => s.clearPending)
  const { fitView } = useReactFlow()

  useEffect(() => {
    if (!pendingTemplate) return

    // 1. Remove all existing nodes
    if (nodes.length > 0) {
      onNodesChange(nodes.map((n) => ({ type: 'remove' as const, id: n.id })))
    }
    // 2. Remove all existing edges
    if (edges.length > 0) {
      onEdgesChange(edges.map((e) => ({ type: 'remove' as const, id: e.id })))
    }

    // 3. Add template nodes
    onNodesChange(pendingTemplate.nodes.map((n) => ({ type: 'add' as const, item: n })))

    // 4. Add template edges
    onEdgesChange(pendingTemplate.edges.map((e) => ({ type: 'add' as const, item: e })))

    // 5. Fit view after a tick to let React Flow measure
    requestAnimationFrame(() => {
      fitView({ padding: 0.15, duration: 400 })
    })

    // 6. Clear the pending signal
    clearPending()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTemplate])

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
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
        <LiveCursors />
      </ReactFlow>

      {/* Presence avatars — top-right overlay */}
      <PresenceAvatars />

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
