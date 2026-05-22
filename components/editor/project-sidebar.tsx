"use client"

import * as React from "react"
import { Plus, XIcon, MoreVertical, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn, formatProjectName } from "@/lib/utils"
import { useProjectDialogs, Project } from "@/hooks/use-project-dialogs"
import { useParams, useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  ownedProjects: Project[]
  sharedProjects: Project[]
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const { openDialog } = useProjectDialogs()
  const params = useParams()
  const router = useRouter()
  const activeProjectId = params?.roomId as string | undefined

  const ownedProjects = useProjectDialogs((state) => state.ownedProjects)
  const sharedProjects = useProjectDialogs((state) => state.sharedProjects)

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose])

  const renderProjectItem = (project: Project) => {
    const isActive = activeProjectId === project.id
    return (
      <div 
        key={project.id} 
        onClick={() => router.push(`/editor/${project.id}`)}
        className={cn(
          "flex items-center justify-between p-2 rounded-md transition-colors group text-sm cursor-pointer select-none",
          isActive ? "bg-muted text-foreground font-medium" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          {isActive && (
            <span className="relative flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            </span>
          )}
          <span className="truncate">{formatProjectName(project.name)}</span>
        </div>
        {project.isOwned && (
          <DropdownMenu>
            <DropdownMenuTrigger 
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 w-6 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                openDialog("rename", project)
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={(e) => {
                e.stopPropagation()
                openDialog("delete", project)
              }}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    )
  }

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
          "fixed top-[4.5rem] bottom-4 left-4 h-[calc(100vh-5.5rem)] w-64 bg-card/85 backdrop-blur-md border border-border/80 shadow-2xl z-50 flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-[calc(100%+1.5rem)] opacity-0 pointer-events-none"
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
              {ownedProjects.length > 0 ? (
                ownedProjects.map(renderProjectItem)
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  No projects yet.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="shared" className="flex-1 overflow-auto p-4 flex flex-col gap-1">
              {sharedProjects.length > 0 ? (
                sharedProjects.map(renderProjectItem)
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
