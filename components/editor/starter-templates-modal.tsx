"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NODE_COLORS, DEFAULT_NODE_COLOR } from "@/types/canvas"
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates"
import { ArrowRight } from "lucide-react"

/* ── lightweight SVG preview ─────────────────────────────────────── */

function resolveColor(colorName: string) {
  return NODE_COLORS.find((c) => c.name === colorName) || DEFAULT_NODE_COLOR
}

/** Minimal shape path renderers for the preview thumbnail */
function previewShape(
  shape: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke: string
) {
  const cx = x + w / 2
  const cy = y + h / 2

  switch (shape) {
    case "decision":
      return (
        <polygon
          key={`s-${x}-${y}`}
          points={`${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
        />
      )
    case "terminator":
      return (
        <ellipse
          key={`s-${x}-${y}`}
          cx={cx}
          cy={cy}
          rx={w / 2}
          ry={h / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
        />
      )
    case "connector":
      return (
        <rect
          key={`s-${x}-${y}`}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={h / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
        />
      )
    case "database":
      return (
        <g key={`s-${x}-${y}`}>
          <path
            d={`M ${x} ${y + h * 0.2} C ${x} ${y}, ${x + w} ${y}, ${x + w} ${y + h * 0.2} L ${x + w} ${y + h * 0.8} C ${x + w} ${y + h}, ${x} ${y + h}, ${x} ${y + h * 0.8} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={1.5}
          />
          <ellipse
            cx={cx}
            cy={y + h * 0.2}
            rx={w / 2}
            ry={h * 0.2}
            fill="transparent"
            stroke={stroke}
            strokeWidth={1.5}
          />
        </g>
      )
    case "preparation":
      return (
        <polygon
          key={`s-${x}-${y}`}
          points={`${cx},${y} ${x + w},${y + h * 0.25} ${x + w},${y + h * 0.75} ${cx},${y + h} ${x},${y + h * 0.75} ${x},${y + h * 0.25}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
        />
      )
    default:
      // process / rectangle
      return (
        <rect
          key={`s-${x}-${y}`}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={4}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
        />
      )
  }
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const PADDING = 24

  // Calculate bounding box
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  for (const n of template.nodes) {
    const w = (n.style?.width as number) ?? 160
    const h = (n.style?.height as number) ?? 80
    minX = Math.min(minX, n.position.x)
    minY = Math.min(minY, n.position.y)
    maxX = Math.max(maxX, n.position.x + w)
    maxY = Math.max(maxY, n.position.y + h)
  }

  const contentW = maxX - minX
  const contentH = maxY - minY
  const vbX = minX - PADDING
  const vbY = minY - PADDING
  const vbW = contentW + PADDING * 2
  const vbH = contentH + PADDING * 2

  // Pre-index node centers for edges
  const centers = new Map<string, { x: number; y: number }>()
  for (const n of template.nodes) {
    const w = (n.style?.width as number) ?? 160
    const h = (n.style?.height as number) ?? 80
    centers.set(n.id, {
      x: n.position.x + w / 2,
      y: n.position.y + h / 2,
    })
  }

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Edges */}
      {template.edges.map((e) => {
        const from = centers.get(e.source)
        const to = centers.get(e.target)
        if (!from || !to) return null
        return (
          <line
            key={e.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#3a3a42"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        )
      })}

      {/* Nodes */}
      {template.nodes.map((n) => {
        const w = (n.style?.width as number) ?? 160
        const h = (n.style?.height as number) ?? 80
        const pair = resolveColor(n.data.color)
        return (
          <g key={n.id}>
            {previewShape(
              n.data.shape,
              n.position.x,
              n.position.y,
              w,
              h,
              pair.fill,
              pair.text
            )}
            <text
              x={n.position.x + w / 2}
              y={n.position.y + h / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={pair.text}
              fontSize={14}
              fontFamily="var(--font-geist-sans), system-ui, sans-serif"
              fontWeight={500}
            >
              {n.data.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ── modal ────────────────────────────────────────────────────────── */

interface StarterTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (template: CanvasTemplate) => void
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  const handleSelect = React.useCallback(
    (template: CanvasTemplate) => {
      onImport(template)
      onOpenChange(false)
    },
    [onImport, onOpenChange]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-5xl max-h-[85vh] flex flex-col rounded-3xl bg-card/95 backdrop-blur-xl border-border/60 shadow-2xl p-0 overflow-hidden"
        showCloseButton
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Starter Templates
          </DialogTitle>
          <DialogDescription>
            Choose a system design template to bootstrap your canvas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {CANVAS_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="group relative rounded-2xl border border-border/60 bg-white/[0.02] hover:bg-white/[0.05] hover:border-border transition-all duration-200 overflow-hidden"
              >
                {/* Preview area */}
                <div className="h-44 w-full bg-base/60 border-b border-border/40 p-2">
                  <TemplatePreview template={template} />
                </div>

                {/* Card body */}
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">
                      {template.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSelect(template)}
                    className="shrink-0 rounded-xl h-9 px-4 gap-2 bg-brand/10 text-brand hover:bg-brand/20 border border-brand/20 hover:border-brand/40 text-xs font-medium transition-all duration-200"
                  >
                    Use Template
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
