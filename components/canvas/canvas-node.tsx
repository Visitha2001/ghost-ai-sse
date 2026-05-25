import { Handle, Position, NodeProps, NodeResizer, NodeToolbar, useReactFlow } from '@xyflow/react'
import { canvasNode } from '@/types/canvas'
import { Trash2, RotateCw } from 'lucide-react'
import { useCallback, useState } from 'react'

const COLORS = [
  { name: 'default', value: 'hsl(var(--brand))' },
  { name: 'slate', value: '#64748b' },
  { name: 'red', value: '#ef4444' },
  { name: 'orange', value: '#f97316' },
  { name: 'amber', value: '#f59e0b' },
  { name: 'green', value: '#22c55e' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'purple', value: '#a855f7' },
  { name: 'pink', value: '#ec4899' },
]

function ShapeRenderer({ shape, color }: { shape: string, color: string }) {
  // Try to use CSS variables if it's our brand color, else use hex
  const isDefault = color === 'hsl(var(--brand))'
  const fillStyle = isDefault ? 'hsl(var(--brand) / 0.15)' : `${color}26` // ~15% opacity hex (26)
  
  switch (shape) {
    case 'diamond':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <polygon points="50,0 100,50 50,100 0,50" fill={fillStyle} stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      )
    case 'circle':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <circle cx="50" cy="50" r="49" fill={fillStyle} stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      )
    case 'pill':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <rect x="0" y="0" width="100" height="100" rx="50" ry="50" fill={fillStyle} stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      )
    case 'cylinder':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <path d="M 0 20 C 0 0, 100 0, 100 20 L 100 80 C 100 100, 0 100, 0 80 Z" fill={fillStyle} stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <ellipse cx="50" cy="20" rx="50" ry="20" fill="transparent" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      )
    case 'hexagon':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill={fillStyle} stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      )
    case 'rectangle':
    default:
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <rect x="0" y="0" width="100" height="100" rx="6" fill={fillStyle} stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      )
  }
}

export function CanvasNode({ id, data, selected }: NodeProps<canvasNode>) {
  const { deleteElements, updateNodeData } = useReactFlow()
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(data.label || '')

  const onDelete = useCallback(() => {
    deleteElements({ nodes: [{ id }] })
  }, [id, deleteElements])

  const onRotate = useCallback(() => {
    const currentRot = data.rotation || 0
    updateNodeData(id, { rotation: (currentRot + 90) % 360 })
  }, [id, data.rotation, updateNodeData])

  const onColorChange = useCallback((colorName: string) => {
    updateNodeData(id, { color: colorName })
  }, [id, updateNodeData])

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
    setEditText(data.label || '')
  }, [data.label])

  const handleBlurOrEnter = useCallback(() => {
    setIsEditing(false)
    if (editText !== data.label) {
      updateNodeData(id, { label: editText })
    }
  }, [id, editText, data.label, updateNodeData])

  const rotation = data.rotation || 0
  const activeColorValue = COLORS.find(c => c.name === data.color)?.value || COLORS[0].value

  return (
    <>
      <NodeResizer 
        color="hsl(var(--brand))" 
        isVisible={selected} 
        minWidth={40} 
        minHeight={40} 
        handleStyle={{ width: 12, height: 12, borderRadius: 2 }}
      />
      
      <NodeToolbar 
        isVisible={selected && !isEditing} 
        position={Position.Top} 
        className="flex items-center gap-1 bg-card/95 backdrop-blur-md p-1.5 rounded-lg border shadow-xl mb-2"
      >
        <div className="flex items-center gap-1.5 pr-3 border-r mr-1">
          {COLORS.map(c => (
            <button
              key={c.name}
              className={`w-5 h-5 rounded-full border border-border flex-shrink-0 transition-transform hover:scale-110 ${data.color === c.name || (!data.color && c.name === 'default') ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}
              style={{ backgroundColor: c.value }}
              onClick={() => onColorChange(c.name)}
              title={c.name}
            />
          ))}
        </div>
        <button 
          onClick={onRotate} 
          className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
          title="Rotate 90°"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button 
          onClick={onDelete} 
          className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors"
          title="Delete Shape"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </NodeToolbar>

      <div 
        className="relative w-full h-full flex items-center justify-center transition-transform duration-200"
        style={{ transform: `rotate(${rotation}deg)` }}
        onDoubleClick={handleDoubleClick}
      >
        <ShapeRenderer shape={data.shape} color={activeColorValue} />
        <div className="z-10 text-center break-words w-full px-2">
          {isEditing ? (
             <input 
               autoFocus
               value={editText}
               onChange={e => setEditText(e.target.value)}
               onBlur={handleBlurOrEnter}
               onKeyDown={e => {
                 if (e.key === 'Enter') {
                   e.preventDefault()
                   handleBlurOrEnter()
                 }
               }}
               className="nodrag w-full text-center bg-transparent border-none focus:ring-0 text-foreground font-medium text-sm outline-none"
             />
          ) : (
            <div className="select-none pointer-events-none text-foreground font-medium text-sm">
              {data.label || (data.shape === 'rectangle' ? '' : data.shape)}
            </div>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Top} id="top" className="!bg-brand !w-5 !h-5 !border-2 !border-background transition-opacity" style={{ opacity: selected ? 1 : 0.3 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-brand !w-5 !h-5 !border-2 !border-background transition-opacity" style={{ opacity: selected ? 1 : 0.3 }} />
      <Handle type="source" position={Position.Right} id="right" className="!bg-brand !w-5 !h-5 !border-2 !border-background transition-opacity" style={{ opacity: selected ? 1 : 0.3 }} />
      <Handle type="target" position={Position.Left} id="left" className="!bg-brand !w-5 !h-5 !border-2 !border-background transition-opacity" style={{ opacity: selected ? 1 : 0.3 }} />
    </>
  )
}
