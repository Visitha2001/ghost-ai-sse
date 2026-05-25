export type CanvasNodeData = {
  label: string
  color: string
  shape: string
  rotation?: number
}

import type { Node, Edge } from '@xyflow/react'

export type CanvasEdgeData = {
  color?: string
  thickness?: number
  style?: 'solid' | 'dashed' | 'dotted'
  arrow?: boolean
}

export type canvasNode = Node<CanvasNodeData>
export type canvasEdge = Edge<CanvasEdgeData>
