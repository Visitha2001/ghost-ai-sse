"use client"

import * as React from "react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { Project } from "@/hooks/use-project-dialogs"

interface EditorLayoutShellProps {
  children: React.ReactNode;
  ownedProjects: Project[];
  sharedProjects: Project[];
}

export function EditorLayoutShell({ children, ownedProjects, sharedProjects }: EditorLayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <EditorNavbar 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} 
      />
      <ProjectSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
      />
      <main className="flex-1 pt-14 w-full h-full overflow-auto">
        {children}
      </main>
      <ProjectDialogs />
    </div>
  )
}
