import { useState, useRef, useEffect } from "react"
import { Grid2X2, Triangle, Star, Cloud, Heart, Octagon, Pentagon, MessageSquare, Shield, Play, Zap, Droplet, Moon, Sun, Flame, Leaf, Box, Gem, Target, Camera } from "lucide-react"

const MORE_SHAPES = [
  { name: 'triangle', icon: Triangle, width: 100, height: 100 },
  { name: 'star', icon: Star, width: 100, height: 100 },
  { name: 'cloud', icon: Cloud, width: 120, height: 80 },
  { name: 'heart', icon: Heart, width: 100, height: 100 },
  { name: 'octagon', icon: Octagon, width: 100, height: 100 },
  { name: 'pentagon', icon: Pentagon, width: 100, height: 100 },
  { name: 'message', icon: MessageSquare, width: 120, height: 100 },
  { name: 'shield', icon: Shield, width: 100, height: 110 },
  { name: 'play', icon: Play, width: 100, height: 100 },
  { name: 'zap', icon: Zap, width: 100, height: 120 },
  { name: 'droplet', icon: Droplet, width: 100, height: 120 },
  { name: 'moon', icon: Moon, width: 100, height: 100 },
  { name: 'sun', icon: Sun, width: 100, height: 100 },
  { name: 'flame', icon: Flame, width: 100, height: 120 },
  { name: 'leaf', icon: Leaf, width: 100, height: 100 },
  { name: 'box', icon: Box, width: 100, height: 100 },
  { name: 'gem', icon: Gem, width: 100, height: 100 },
  { name: 'target', icon: Target, width: 100, height: 100 },
  { name: 'camera', icon: Camera, width: 120, height: 100 },
]

export function MoreShapesPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const onDragStart = (e: React.DragEvent, shape: typeof MORE_SHAPES[0]) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({
      shape: shape.name,
      width: shape.width,
      height: shape.height
    }))
    e.dataTransfer.effectAllowed = 'move'
    // Do NOT set isOpen(false) here, because unmounting the element during dragstart cancels the drag operation in HTML5!
  }

  const onDragEnd = () => {
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-[52px] w-[52px] items-center justify-center rounded-full shadow-2xl backdrop-blur-md border z-10 transition-colors ${
          isOpen ? 'bg-muted text-foreground' : 'bg-card/85 text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
        title="More Shapes"
      >
        <Grid2X2 className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 w-48 bg-card/95 backdrop-blur-md border shadow-2xl rounded-2xl p-3 z-50">
          <div 
            className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`
              .grid::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {MORE_SHAPES.map((shape) => {
              const Icon = shape.icon
              return (
                <button
                  key={shape.name}
                  className="flex items-center justify-center h-12 w-12 rounded-lg hover:bg-muted cursor-grab active:cursor-grabbing transition-colors text-muted-foreground hover:text-foreground"
                  draggable
                  onDragStart={(e) => onDragStart(e, shape)}
                  onDragEnd={onDragEnd}
                  title={shape.name}
                >
                  <Icon className="h-6 w-6" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
