import * as React from "react"
import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles, Home, LayoutTemplate } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"
import { cn, formatProjectName } from "@/lib/utils"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"
import { useTemplateImport } from "@/hooks/use-template-import"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  projectName?: string
  isAiSidebarOpen?: boolean
  onToggleAiSidebar?: () => void
  showActions?: boolean
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  isAiSidebarOpen = false,
  onToggleAiSidebar,
  showActions = false,
}: EditorNavbarProps) {
  const params = useParams()
  const roomId = params?.roomId as string | undefined
  const openDialog = useProjectDialogs((state) => state.openDialog)
  const storeOwned = useProjectDialogs((state) => state.ownedProjects)
  const storeShared = useProjectDialogs((state) => state.sharedProjects)
  const requestImport = useTemplateImport((s) => s.requestImport)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false)

  const activeProject = React.useMemo(() => {
    if (!roomId) return undefined
    return [...storeOwned, ...storeShared].find((p) => p.id === roomId)
  }, [roomId, storeOwned, storeShared])

  return (
    <header className="fixed top-3 left-4 right-4 h-14 bg-card/85 backdrop-blur-md border border-border/80 shadow-2xl z-40 flex items-center justify-between px-4 rounded-2xl overflow-hidden">
      {/* Subtle top accent gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

      {/* Left side actions and breadcrumbs */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="h-9 w-9 rounded-xl hover:bg-white/[0.06] transition-colors duration-200"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 text-muted-foreground" />
          ) : (
            <PanelLeftOpen className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
        <Link
          href="/editor"
          aria-label="Go to home"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9 rounded-xl hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors duration-200")}
        >
          <Home className="h-5 w-5" />
        </Link>
        {projectName && (
          <>
            <span className="h-5 w-[1px] bg-gradient-to-b from-transparent via-border to-transparent mx-1.5" />
            <span className="font-semibold text-sm text-foreground select-none truncate max-w-[240px] tracking-tight">
              {formatProjectName(projectName)}
            </span>
          </>
        )}
      </div>

      {/* Right side controls and profile */}
      <div className="flex items-center gap-2">
        {showActions && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTemplateModalOpen(true)}
              className="rounded-xl h-9 px-3.5 gap-2 border-border/60 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.06] hover:border-border text-xs font-medium transition-all duration-200"
              aria-label="Open starter templates"
            >
              <LayoutTemplate className="h-4 w-4" />
              Templates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => activeProject && openDialog("share", activeProject)}
              className="rounded-xl h-9 px-3.5 gap-2 border-border/60 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.06] hover:border-border text-xs font-medium transition-all duration-200"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant={isAiSidebarOpen ? "default" : "outline"}
              size="sm"
              onClick={onToggleAiSidebar}
              className={cn(
                "rounded-xl h-9 px-3.5 gap-2 text-xs font-bold transition-all duration-200 select-none",
                isAiSidebarOpen
                  ? "bg-brand text-background hover:bg-brand/90 border-transparent font-semibold shadow-[0_0_12px_rgba(0,200,212,0.2)]"
                  : "border-border/60 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.06] hover:border-border"
              )}
              aria-label="Toggle AI assistant"
            >
              <Sparkles className="h-4 w-4" />
              AI Chat
            </Button>
            <span className="h-5 w-[1px] bg-gradient-to-b from-transparent via-border to-transparent mx-1" />
          </>
        )}
        <div className="flex h-9 items-center justify-center pl-1">
          <UserButton />
        </div>
      </div>

      {/* Starter Templates Modal */}
      <StarterTemplatesModal
        open={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
        onImport={requestImport}
      />
    </header>
  )
}
