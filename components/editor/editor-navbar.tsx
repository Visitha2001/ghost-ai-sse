import * as React from "react"
import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"
import { cn, formatProjectName } from "@/lib/utils"
import Link from "next/link"

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
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-40 flex items-center justify-between px-4">
      {/* Left side actions and breadcrumbs */}
      <div className="flex items-center gap-2.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="h-9 w-9 rounded-xl hover:bg-muted/50"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 text-muted-foreground" />
          ) : (
            <PanelLeftOpen className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
        <Link href="/editor" passHref legacyBehavior>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Go to home"
            className="h-9 w-9 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-5 w-5" />
          </Button>
        </Link>
        {projectName && (
          <>
            <span className="h-4 w-[1px] bg-border mx-1" />
            <span className="font-semibold text-sm text-foreground select-none truncate max-w-[240px]">
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
              className="rounded-xl h-9 px-3 gap-2 border-border/80 text-muted-foreground hover:text-foreground text-xs font-medium"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant={isAiSidebarOpen ? "default" : "outline"}
              size="sm"
              onClick={onToggleAiSidebar}
              className={cn(
                "rounded-xl h-9 px-3 gap-2 border-border/80 text-xs font-bold transition-all select-none",
                isAiSidebarOpen
                  ? "bg-brand text-background hover:bg-brand/90 border-transparent font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-label="Toggle AI assistant"
            >
              <Sparkles className="h-4 w-4" />
              AI Chat
            </Button>
            <span className="h-4 w-[1px] bg-border mx-1" />
          </>
        )}
        <div className="flex h-9 items-center justify-center pl-1">
          <UserButton />
        </div>
      </div>
    </header>
  )
}
