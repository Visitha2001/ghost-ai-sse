"use client"

import { useOthers } from "@liveblocks/react/suspense"
import { useReactFlow } from "@xyflow/react"

export function LiveCursors() {
  const others = useOthers()
  const { flowToScreenPosition } = useReactFlow()

  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        if (!presence.cursor) return null

        // Convert flow coordinates to screen coordinates relative to the viewport
        const screenPos = flowToScreenPosition({
          x: presence.cursor.x,
          y: presence.cursor.y,
        })

        return (
          <Cursor
            key={connectionId}
            x={screenPos.x}
            y={screenPos.y}
            name={info.name}
            color={info.color}
          />
        )
      })}
    </>
  )
}

/* ── Single cursor with pointer + name badge ────────────────────── */

function Cursor({
  x,
  y,
  name,
  color,
}: {
  x: number
  y: number
  name: string
  color: string
}) {
  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-50"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      {/* SVG pointer arrow */}
      <svg
        width="18"
        height="24"
        viewBox="0 0 18 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        <path
          d="M2.717 2.222A.99.99 0 0 0 1 3.028v18.944a.99.99 0 0 0 1.683.707l4.89-4.89h6.399a.99.99 0 0 0 .707-1.683L2.717 2.222Z"
          fill={color}
        />
        <path
          d="M2.717 2.222A.99.99 0 0 0 1 3.028v18.944a.99.99 0 0 0 1.683.707l4.89-4.89h6.399a.99.99 0 0 0 .707-1.683L2.717 2.222Z"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="1"
        />
      </svg>

      {/* Name badge */}
      <div
        className="absolute left-4 top-5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold text-black shadow-lg"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  )
}
