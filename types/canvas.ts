export interface NodeColorPair {
  name: string
  fill: string
  text: string
}

export const NODE_COLORS: NodeColorPair[] = [
  { name: 'neutral', fill: '#1F1F1F', text: '#EDEDED' },
  { name: 'blue',    fill: '#10233D', text: '#52A8FF' },
  { name: 'purple',  fill: '#2E1938', text: '#BF7AF0' },
  { name: 'orange',  fill: '#331B00', text: '#FF990A' },
  { name: 'red',     fill: '#3C1618', text: '#FF6166' },
  { name: 'pink',    fill: '#3A1726', text: '#F75F8F' },
  { name: 'green',   fill: '#0F2E18', text: '#62C073' },
  { name: 'teal',    fill: '#062822', text: '#0AC7B4' },
]

export const DEFAULT_NODE_COLOR = NODE_COLORS[0]

export type CanvasNodeData = {
  label: string
  color: string
  textColor?: string
  shape: string
  emoji?: string
  rotation?: number
}

import type { Node, Edge } from '@xyflow/react'

export type CanvasEdgeData = {
  color?: string
  thickness?: number
  style?: 'solid' | 'dashed' | 'dotted'
  arrow?: 'none' | 'forward' | 'backward' | 'both'
  path?: 'bezier' | 'straight' | 'step'
}

export type canvasNode = Node<CanvasNodeData>
export type canvasEdge = Edge<CanvasEdgeData>
