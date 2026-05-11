import * as React from "react"
import { Plus, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 bg-card border-r border-border shadow-lg z-50 flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
        <h2 className="font-semibold text-lg">Projects</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar">
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
          
          <TabsContent value="my-projects" className="flex-1 overflow-auto p-4 flex flex-col">
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              No projects yet.
            </div>
          </TabsContent>
          
          <TabsContent value="shared" className="flex-1 overflow-auto p-4 flex flex-col">
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              No shared projects.
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-t border-border shrink-0">
        <Button className="w-full justify-start" variant="default">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  )
}
