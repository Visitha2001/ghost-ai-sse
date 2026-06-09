import { useNodes, useEdges, useReactFlow } from '@xyflow/react'
import { RotateCw, ArrowRight, Minus, MoreHorizontal, ArrowLeft, ArrowLeftRight, Trash2, Spline, CornerDownRight } from 'lucide-react'
import { canvasNode, canvasEdge, NODE_COLORS } from '@/types/canvas'

const EDGE_COLORS = [
  { name: 'slate', value: '#64748b' },
  { name: 'red', value: '#ef4444' },
  { name: 'orange', value: '#f97316' },
  { name: 'amber', value: '#f59e0b' },
  { name: 'green', value: '#22c55e' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'purple', value: '#a855f7' },
  { name: 'pink', value: '#ec4899' },
]



export function PropertiesPanel({
  onDelete
}: {
  onDelete?: (params: { nodes: canvasNode[]; edges: canvasEdge[] }) => void
}) {
  const { updateNodeData, updateEdgeData, updateNode } = useReactFlow()
  const nodes = useNodes<canvasNode>()
  const edges = useEdges<canvasEdge>()

  const selectedNodes = nodes.filter(n => n.selected)
  const selectedEdges = edges.filter(e => e.selected)

  if (selectedNodes.length === 1 && selectedEdges.length === 0) {
    const node = selectedNodes[0]

    return (
      <div className="flex items-center gap-1 bg-background/40 p-2 shadow-2xl backdrop-blur-xl border border-white/10 rounded-full h-[52px]">
        <div className="flex items-center gap-1.5 px-2 border-r mr-1">
          {NODE_COLORS.map(c => (
            <button
              key={c.name}
              className={`w-5 h-5 rounded-full flex-shrink-0 transition-transform hover:scale-110 ${node.data.color === c.name || (!node.data.color && c.name === 'neutral') ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}
              style={{
                backgroundColor: c.fill,
                border: `2px solid ${c.text}`,
              }}
              onClick={() => updateNodeData(node.id, { color: c.name, textColor: c.text })}
              title={c.name}
            />
          ))}
        </div>
        <button
          onClick={() => {
            const newRot = ((node.data.rotation || 0) + 90) % 360
            const currentW = node.style?.width || node.measured?.width || 100
            const currentH = node.style?.height || node.measured?.height || 100
            
            updateNode(node.id, (n) => ({
              ...n,
              style: {
                ...n.style,
                width: currentH,
                height: currentW
              },
              data: {
                ...n.data,
                rotation: newRot
              }
            }))
          }}
          className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
          title="Rotate 90°"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          onClick={() => onDelete?.({ nodes: [node], edges: [] })}
          className="p-2 hover:bg-destructive/10 text-destructive rounded-full transition-colors"
          title="Delete Shape"
        >
          <Trash2 className="w-5 h-5" />
        </button>

      </div>
    )
  }

  if (selectedEdges.length === 1 && selectedNodes.length === 0) {
    const edge = selectedEdges[0]
    const thickness = edge.data?.thickness || 2
    const edgeStyle = edge.data?.style || 'solid'
    const arrowConfig = edge.data?.arrow || 'none'

    return (
      <div className="flex items-center gap-1 bg-background/40 p-2 shadow-2xl backdrop-blur-xl border border-white/10 rounded-full h-[52px]">
        <div className="flex items-center gap-1.5 px-2 border-r mr-1">
          {EDGE_COLORS.map(c => (
            <button
              key={c.name}
              className={`w-5 h-5 rounded-full border border-border flex-shrink-0 transition-transform hover:scale-110 ${edge.data?.color === c.name || (!edge.data?.color && c.name === 'default') ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}
              style={{ backgroundColor: c.value }}
              onClick={() => updateEdgeData(edge.id, { color: c.name })}
              title={c.name}
            />
          ))}
        </div>

        {/* Thickness */}
        <div className="flex items-center gap-1 pr-2 border-r mr-1">
          <button onClick={() => updateEdgeData(edge.id, { thickness: 2 })} className={`p-2 rounded-full hover:bg-muted ${thickness === 2 ? 'bg-muted' : ''}`}><div className="w-4 h-0.5 bg-foreground" /></button>
          <button onClick={() => updateEdgeData(edge.id, { thickness: 4 })} className={`p-2 rounded-full hover:bg-muted ${thickness === 4 ? 'bg-muted' : ''}`}><div className="w-4 h-1 bg-foreground" /></button>
          <button onClick={() => updateEdgeData(edge.id, { thickness: 6 })} className={`p-2 rounded-full hover:bg-muted ${thickness === 6 ? 'bg-muted' : ''}`}><div className="w-4 h-1.5 bg-foreground" /></button>
        </div>

        {/* Line Style */}
        <div className="flex items-center gap-1 pr-2 border-r mr-1 text-foreground">
          <button onClick={() => updateEdgeData(edge.id, { style: 'solid' })} className={`p-2 rounded-full hover:bg-muted ${edgeStyle === 'solid' ? 'bg-muted' : ''}`} title="Solid"><Minus className="w-5 h-5" /></button>
          <button onClick={() => updateEdgeData(edge.id, { style: 'dashed' })} className={`p-2 rounded-full hover:bg-muted ${edgeStyle === 'dashed' ? 'bg-muted' : ''}`} title="Dashed"><div className="w-5 border-b-2 border-dashed border-current h-2 mb-2" /></button>
          <button onClick={() => updateEdgeData(edge.id, { style: 'dotted' })} className={`p-2 rounded-full hover:bg-muted ${edgeStyle === 'dotted' ? 'bg-muted' : ''}`} title="Dotted"><MoreHorizontal className="w-5 h-5" /></button>
        </div>

        {/* Arrow Config */}
        <div className="flex items-center gap-1 mr-1 text-foreground">
          <button onClick={() => updateEdgeData(edge.id, { arrow: 'none' })} className={`p-2 rounded-full hover:bg-muted ${arrowConfig === 'none' ? 'bg-brand/20 text-brand' : ''}`} title="No Arrow"><Minus className="w-5 h-5" /></button>
          <button onClick={() => updateEdgeData(edge.id, { arrow: 'forward' })} className={`p-2 rounded-full hover:bg-muted ${arrowConfig === 'forward' ? 'bg-brand/20 text-brand' : ''}`} title="Forward Arrow"><ArrowRight className="w-5 h-5" /></button>
          <button onClick={() => updateEdgeData(edge.id, { arrow: 'backward' })} className={`p-2 rounded-full hover:bg-muted ${arrowConfig === 'backward' ? 'bg-brand/20 text-brand' : ''}`} title="Backward Arrow"><ArrowLeft className="w-5 h-5" /></button>
          <button onClick={() => updateEdgeData(edge.id, { arrow: 'both' })} className={`p-2 rounded-full hover:bg-muted ${arrowConfig === 'both' ? 'bg-brand/20 text-brand' : ''}`} title="Both Arrows"><ArrowLeftRight className="w-5 h-5" /></button>
        </div>
        
        <div className="w-px h-6 bg-border mx-1" />
        <button
          onClick={() => onDelete?.({ nodes: [], edges: [edge] })}
          className="p-2 hover:bg-destructive/10 text-destructive rounded-full transition-colors"
          title="Delete Connection"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return null
}
