"use client"

import * as React from "react"
import { Plus, XIcon, MoreVertical, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useProjectDialogs, Project } from "@/hooks/use-project-dialogs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const MOCK_PROJECTS: Project[] = [
  { id: "1", name: "My Next.js App", isOwned: true },
  { id: "2", name: "Portfolio Website", isOwned: true },
]

const MOCK_SHARED_PROJECTS: Project[] = [
  { id: "3", name: "Client Dashboard", isOwned: false },
]

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const { openDialog } = useProjectDialogs()

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose])

  const renderProjectItem = (project: Project) => (
    <div 
      key={project.id} 
      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group text-sm cursor-pointer"
    >
      <span className="truncate">{project.name}</span>
      {project.isOwned && (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 w-6 opacity-0 group-hover:opacity-100">
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openDialog("rename", project)}>
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => openDialog("delete", project)}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 top-14 bg-background/80 backdrop-blur-sm z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 bg-card border-r border-border shadow-lg z-50 flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-lg">Projects</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar" className="md:hidden">
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="my-projects" className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="my-projects">My Projects</TabsTrigger>
                <TabsTrigger value="shared">Shared</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="my-projects" className="flex-1 overflow-auto p-4 flex flex-col gap-1">
              {MOCK_PROJECTS.length > 0 ? (
                MOCK_PROJECTS.map(renderProjectItem)
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  No projects yet.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="shared" className="flex-1 overflow-auto p-4 flex flex-col gap-1">
              {MOCK_SHARED_PROJECTS.length > 0 ? (
                MOCK_SHARED_PROJECTS.map(renderProjectItem)
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  No shared projects.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-4 border-t border-border shrink-0">
          <Button className="w-full justify-start" variant="default" onClick={() => openDialog("create")}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
