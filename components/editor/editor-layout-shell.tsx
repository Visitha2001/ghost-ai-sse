"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { AiSidebar } from "@/components/ai/ai-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { useProjectDialogs, Project } from "@/hooks/use-project-dialogs"
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div className="flex flex-1 pt-[4.75rem] w-full h-[calc(100vh-4.75rem)] overflow-hidden">
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
          <AiSidebar 
            isOpen={isAiSidebarOpen} 
            onClose={() => setIsAiSidebarOpen(false)} 
          />
        )}
      </div>

      {/* Global Project Management Dialogs */}
      <ProjectDialogs />
    </div>
  )
}
