import { Square, Diamond, Circle, Hexagon, Cylinder, Pill } from "lucide-react"

const SHAPES = [
  { name: 'process', icon: Square, width: 160, height: 80 },
  { name: 'decision', icon: Diamond, width: 100, height: 100 },
  { name: 'terminator', icon: Circle, width: 100, height: 100 },
  { name: 'connector', icon: Pill, width: 140, height: 60 },
  { name: 'database', icon: Cylinder, width: 80, height: 100 },
  { name: 'preparation', icon: Hexagon, width: 100, height: 100 },
]

export function ShapePanel() {
  const onDragStart = (e: React.DragEvent, shape: typeof SHAPES[0]) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({
      shape: shape.name,
      width: shape.width,
      height: shape.height
    }))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-card/85 p-2 shadow-2xl backdrop-blur-md border z-10 h-[52px]">
      {SHAPES.map((shape) => {
        const Icon = shape.icon
        return (
          <button
            key={shape.name}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            draggable
            onDragStart={(e) => onDragStart(e, shape)}
            title={shape.name}
          >
            <Icon className="h-5 w-5" />
          </button>
        )
      })}
    </div>
  )
}
