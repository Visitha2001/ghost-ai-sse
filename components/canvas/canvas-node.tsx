import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from '@xyflow/react'
import { canvasNode, NODE_COLORS, DEFAULT_NODE_COLOR } from '@/types/canvas'
import { Triangle, Star, Cloud, Heart, Octagon, Pentagon, MessageSquare, Shield, Play, Zap, Droplet, Moon, Sun, Flame, Leaf, Box, Gem, Target, Camera } from 'lucide-react'


import { useCallback, useState } from 'react'

/** Resolve node fill + text colors from the color name */
function resolveColors(colorName: string | undefined) {
  const pair = NODE_COLORS.find(c => c.name === colorName) || DEFAULT_NODE_COLOR
  return { fill: pair.fill, text: pair.text }
}

function ShapeRenderer({ shape, fill, stroke }: { shape: string, fill: string, stroke: string }) {
  // Use fill color for shape background and stroke color for shape outline
  const fillOpacity = `${fill}` // The fill IS the background
  
  switch (shape) {
    case 'decision':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <polygon points="50,0 100,50 50,100 0,50" fill={fillOpacity} stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      )
    case 'terminator':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <circle cx="50" cy="50" r="49" fill={fillOpacity} stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      )
    case 'connector':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <rect x="0" y="0" width="100" height="100" rx="50" ry="50" fill={fillOpacity} stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      )
    case 'database':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <path d="M 0 20 C 0 0, 100 0, 100 20 L 100 80 C 100 100, 0 100, 0 80 Z" fill={fillOpacity} stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <ellipse cx="50" cy="20" rx="50" ry="20" fill="transparent" stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      )
    case 'preparation':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill={fillOpacity} stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      )
    case 'triangle':
      return <Triangle className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'star':
      return <Star className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'cloud':
      return <Cloud className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'heart':
      return <Heart className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'octagon':
      return <Octagon className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'pentagon':
      return <Pentagon className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'message':
      return <MessageSquare className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'shield':
      return <Shield className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'play':
      return <Play className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'zap':
      return <Zap className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'droplet':
      return <Droplet className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'moon':
      return <Moon className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'sun':
      return <Sun className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'flame':
      return <Flame className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'leaf':
      return <Leaf className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'box':
      return <Box className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'gem':
      return <Gem className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'target':
      return <Target className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'camera':
      return <Camera className="w-full h-full absolute inset-0 [&_*]:[vector-effect:non-scaling-stroke]" fill={fillOpacity} stroke={stroke} strokeWidth={2} />
    case 'emoji':
      return null
    case 'process':
    default:
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <rect x="0" y="0" width="100" height="100" rx="6" fill={fillOpacity} stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      )
  }
}

export function CanvasNode({ id, data, selected }: NodeProps<canvasNode>) {
  const { updateNodeData } = useReactFlow()
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(data.label || '')

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
  const { fill, text } = resolveColors(data.color)

  return (
    <>
      <NodeResizer 
        color={text} 
        isVisible={selected} 
        minWidth={40} 
        minHeight={40} 
        handleStyle={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'transparent',
          border: 'none',
          boxShadow: `inset 0 0 0 4px ${text}`,
          backgroundClip: 'content-box',
          padding: 3,
        }}
      />



      {selected && rotation !== 0 && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card text-card-foreground text-xs px-2 py-1 rounded shadow-lg border whitespace-nowrap z-50">
          {rotation}°
        </div>
      )}

      <div className="relative w-full h-full" style={{ containerType: 'size' }}>
        <div 
          className="absolute top-1/2 left-1/2 flex items-center justify-center transition-all duration-200"
          style={{ 
            width: (rotation % 180 !== 0) ? '100cqh' : '100cqw',
            height: (rotation % 180 !== 0) ? '100cqw' : '100cqh',
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`
          }}
          onDoubleClick={handleDoubleClick}
        >
          <ShapeRenderer shape={data.shape} fill={fill} stroke={text} />
        {data.shape === 'emoji' && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="w-full h-full absolute inset-0 pointer-events-none select-none drop-shadow-md">
            <text x="50" y="54" dominantBaseline="middle" textAnchor="middle" fontSize="80">{data.emoji}</text>
          </svg>
        )}
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
               className="nodrag w-full text-center bg-transparent border-none focus:ring-0 font-medium text-sm outline-none"
               style={{ color: text }}
             />
          ) : (
            <div
              className="select-none pointer-events-none font-medium text-sm"
              style={{ color: text }}
            >
              {data.label || (data.shape === 'process' ? '' : data.shape)}
            </div>
          )}
        </div>
        </div>
      </div>

      <Handle type="target" position={Position.Top} id="top" className="!w-0 !h-0 !min-w-0 !min-h-0 !border-0 bg-transparent">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full transition-opacity ${selected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-background" style={{ backgroundColor: text }} />
        </div>
      </Handle>
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-0 !h-0 !min-w-0 !min-h-0 !border-0 bg-transparent">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full transition-opacity ${selected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-background" style={{ backgroundColor: text }} />
        </div>
      </Handle>
      <Handle type="source" position={Position.Right} id="right" className="!w-0 !h-0 !min-w-0 !min-h-0 !border-0 bg-transparent">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full transition-opacity ${selected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-background" style={{ backgroundColor: text }} />
        </div>
      </Handle>
      <Handle type="target" position={Position.Left} id="left" className="!w-0 !h-0 !min-w-0 !min-h-0 !border-0 bg-transparent">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full transition-opacity ${selected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-background" style={{ backgroundColor: text }} />
        </div>
      </Handle>
    </>
  )
}
