"use client"

import { NodeToolbar, Position, useReactFlow } from '@xyflow/react'
import { NODE_COLORS } from '@/types/canvas'
import { useCallback } from 'react'

interface NodeColorToolbarProps {
  nodeId: string
  currentColor: string
  isVisible: boolean
}

export function NodeColorToolbar({ nodeId, currentColor, isVisible }: NodeColorToolbarProps) {
  const { updateNodeData } = useReactFlow()

  const handleColorSelect = useCallback(
    (e: React.MouseEvent, colorName: string, textColor: string) => {
      // Prevent node drag and canvas pan
      e.stopPropagation()
      e.preventDefault()
      updateNodeData(nodeId, { color: colorName, textColor })
    },
    [nodeId, updateNodeData]
  )

  if (!isVisible) return null

  return (
    <NodeToolbar
      nodeId={nodeId}
      isVisible={isVisible}
      position={Position.Top}
      offset={12}
      align="center"
    >
      {/* Wrapper stops drag/pan from propagating */}
      <div
        className="nodrag nopan flex items-center gap-1.5 px-2.5 py-2 bg-background/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {NODE_COLORS.map((c) => {
          const isActive = currentColor === c.name || (!currentColor && c.name === 'neutral')
          return (
            <button
              key={c.name}
              className={`
                nodrag nopan
                relative w-6 h-6 rounded-full flex-shrink-0
                transition-all duration-150 ease-out
                border-2
                ${isActive
                  ? 'border-white/60 scale-110'
                  : 'border-transparent hover:scale-110'
                }
              `}
              style={{
                backgroundColor: c.fill,
                boxShadow: isActive
                  ? `0 0 8px 2px ${c.text}40`
                  : undefined,
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => handleColorSelect(e, c.name, c.text)}
              title={c.name}
            >
              {/* Inner text-color dot indicator */}
              <span
                className="absolute inset-[5px] rounded-full"
                style={{ backgroundColor: c.text }}
              />
              {/* Hover glow effect */}
              <span
                className={`
                  absolute -inset-0.5 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-150 pointer-events-none
                `}
                style={{
                  boxShadow: `0 0 6px 1px ${c.text}50`,
                }}
              />
            </button>
          )
        })}
      </div>
    </NodeToolbar>
  )
}
