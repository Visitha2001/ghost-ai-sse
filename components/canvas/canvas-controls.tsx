"use client"

import { useReactFlow } from '@xyflow/react'
import { useUndo, useRedo, useCanUndo, useCanRedo } from '@liveblocks/react/suspense'
import { ZoomIn, ZoomOut, Maximize, Undo2, Redo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  return (
    <div className="absolute top-4 sm:top-auto bottom-auto sm:bottom-10 left-4 sm:left-10 flex items-center gap-2 z-10 bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full p-2 pointer-events-auto">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => zoomOut({ duration: 200 })} className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => fitView({ duration: 200 })} className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
          <Maximize className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => zoomIn({ duration: 200 })} className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-[1px] h-6 bg-border mx-1" />

      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={undo} 
          disabled={!canUndo}
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={redo} 
          disabled={!canRedo}
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
