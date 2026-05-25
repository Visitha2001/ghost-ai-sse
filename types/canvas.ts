export type CanvasNodeData = {
  label: string
  color: string
  shape: string
}

import type { Node, Edge } from '@xyflow/react'

export type canvasNode = Node<CanvasNodeData>
export type canvasEdge = Edge
