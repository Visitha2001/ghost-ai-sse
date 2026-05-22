"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Sparkles, Bot, X } from "lucide-react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { useProjectDialogs, Project } from "@/hooks/use-project-dialogs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditorLayoutShellProps {
  children: React.ReactNode;
  ownedProjects: Project[];
  sharedProjects: Project[];
}

export function EditorLayoutShell({ children, ownedProjects, sharedProjects }: EditorLayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  const [isAiSidebarOpen, setIsAiSidebarOpen] = React.useState(false)

  const params = useParams()
  const roomId = params?.roomId as string | undefined

  const setProjects = useProjectDialogs((state) => state.setProjects)
  const storeOwned = useProjectDialogs((state) => state.ownedProjects)
  const storeShared = useProjectDialogs((state) => state.sharedProjects)

  // Synchronize dynamic layout projects into the global client state store
  React.useEffect(() => {
    setProjects(ownedProjects, sharedProjects)
  }, [ownedProjects, sharedProjects, setProjects])

  // Identify if we are currently inside an active workspace room using the client-side store
  const activeProject = roomId 
    ? [...storeOwned, ...storeShared].find((p) => p.id === roomId)
    : undefined

  // Auto-open AI sidebar when entering a workspace, or keep it closed by default
  React.useEffect(() => {
    if (!activeProject) {
      setIsAiSidebarOpen(false)
    }
  }, [activeProject])

  return (
    <div className="flex h-screen w-full flex-col bg-background overflow-hidden">
      {/* Top Navigation Bar */}
      <EditorNavbar 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} 
        projectName={activeProject?.name}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen((prev) => !prev)}
        showActions={!!activeProject}
      />

      {/* Main Body Layout */}
      <div className="flex flex-1 pt-14 w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left Project Sidebar */}
        <ProjectSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
        />

        {/* Central Workspace Canvas Area */}
        <main className={cn(
          "flex-1 h-full overflow-hidden transition-all duration-300 ease-in-out relative",
          isSidebarOpen ? "md:pl-[18rem]" : "pl-0"
        )}>
          {children}
        </main>

        {/* Right Collapsible AI Architect Sidebar */}
        {activeProject && (
          <aside className={cn(
            "h-[calc(100%-2rem)] bg-card/85 backdrop-blur-md flex flex-col shrink-0 z-30 transition-all duration-300 ease-in-out rounded-2xl overflow-hidden shadow-2xl relative",
            isAiSidebarOpen 
              ? "w-80 opacity-100 translate-x-0 my-4 mr-4 border border-border/80" 
              : "w-0 opacity-0 translate-x-12 my-4 mr-0 border-0 pointer-events-none"
          )}>
            {/* AI Sidebar Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0 select-none">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-ai-text" />
                AI Architect
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsAiSidebarOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* AI Sidebar Placeholder Body */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ai/10 border border-ai/20 mb-6">
                <Bot className="h-8 w-8 text-ai-text" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-2">AI Design Assistant</p>
              <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
                Describe your desired architecture. AI will generate nodes, edges, and technical specifications directly inside your workspace.
              </p>
            </div>
          </aside>
        )}
      </div>

      {/* Global Project Management Dialogs */}
      <ProjectDialogs />
    </div>
  )
}
