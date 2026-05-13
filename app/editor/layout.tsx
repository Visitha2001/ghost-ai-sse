"use client"

import * as React from "react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"

export default function EditorLayout({ children }: { children: React.ReactNode }) {
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
      />
      <main className="flex-1 pt-14 w-full h-full overflow-auto">
        {children}
      </main>
      <ProjectDialogs />
    </div>
  )
}
