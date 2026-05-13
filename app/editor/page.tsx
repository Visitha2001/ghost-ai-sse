"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"

export default function EditorPage() {
  const { openDialog } = useProjectDialogs()

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center max-w-md mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">
        Create a project or open an existing one
      </h1>
      <p className="text-muted-foreground mb-8">
        Start a new architecture workspace, or choose a project from the sidebar.
      </p>
      <Button onClick={() => openDialog("create")} size="lg">
        <Plus className="mr-2 h-5 w-5" />
        New Project
      </Button>
    </div>
  )
}
