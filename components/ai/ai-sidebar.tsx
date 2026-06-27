"use client"

import * as React from "react"
import { Bot, X, FileText, Download, ArrowUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useAiStatusStore } from "@/hooks/use-ai-status-store"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [input, setInput] = React.useState("")
  const [width, setWidth] = React.useState(320)
  const [isDragging, setIsDragging] = React.useState(false)
  
  const isGenerating = useAiStatusStore((state) => state.isGenerating)
  const latestMessage = useAiStatusStore((state) => state.latestMessage)

  React.useEffect(() => {
    if (!isDragging) {
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      return
    }

    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    const handleMouseMove = (e: MouseEvent) => {
      // 16px is the right margin (sm:mr-4)
      const newWidth = window.innerWidth - e.clientX - 16
      if (newWidth > 280 && newWidth < 800) {
        setWidth(newWidth)
      }
    }

    const handleMouseUp = () => setIsDragging(false)

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isDragging])

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 top-[4.75rem] bg-background/80 backdrop-blur-sm z-40 sm:hidden" 
          onClick={onClose}
        />
      )}
      <aside
        style={{ "--ai-sidebar-width": `${width}px` } as React.CSSProperties}
        className={cn(
          "fixed sm:relative top-[5.75rem] sm:top-auto bottom-4 sm:bottom-auto right-4 sm:right-auto h-[calc(100vh-6.75rem)] sm:h-[calc(100%-2rem)] bg-card/85 backdrop-blur-md flex flex-col shrink-0 z-50 sm:z-30 transition-all duration-300 ease-in-out rounded-2xl overflow-hidden shadow-2xl group/sidebar",
          isOpen
            ? "w-[85vw] sm:w-[var(--ai-sidebar-width)] opacity-100 translate-x-0 sm:my-4 sm:mr-4 border border-border/80"
            : "w-[85vw] sm:w-0 opacity-0 translate-x-[calc(100%+1.5rem)] sm:translate-x-12 sm:my-4 sm:mr-0 border-0 pointer-events-none"
        )}
      >
        {/* Resize Handle */}
        {isOpen && (
          <div 
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-50 transition-colors hidden sm:block",
              isDragging ? "bg-brand/80" : "hover:bg-brand/50 group-hover/sidebar:bg-border/50 bg-transparent"
            )}
            onMouseDown={() => setIsDragging(true)}
          />
        )}
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0 select-none">
        <div className="flex items-center gap-3">
          <Bot className={cn("h-5 w-5 text-brand", isGenerating && "animate-pulse")} />
          <div className="flex flex-col">
            <h3 className="font-semibold text-sm text-copy-primary leading-tight flex items-center gap-2">
              AI Workspace
              {isGenerating && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                </span>
              )}
            </h3>
            <p className="text-[10px] text-copy-muted leading-tight max-w-[180px] truncate">
              {isGenerating ? (latestMessage || "AI is generating...") : "Collaborate with Ghost AI"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="architect" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-3 pb-2 border-b border-border shrink-0">
          <TabsList className="w-full grid grid-cols-2 bg-subtle p-1 rounded-lg">
            <TabsTrigger 
              value="architect" 
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-primary-foreground text-copy-muted rounded-md transition-all"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger 
              value="specs" 
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-primary-foreground text-copy-muted rounded-md transition-all"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        {/* AI Architect Tab */}
        <TabsContent value="architect" className="flex-1 flex flex-col overflow-hidden m-0 data-[state=inactive]:hidden">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center text-center select-none py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20 mb-4">
                <Bot className="h-6 w-6 text-brand" />
              </div>
              <p className="text-sm font-semibold text-copy-primary mb-2">AI Design Assistant</p>
              <p className="text-xs text-copy-muted max-w-[220px] leading-relaxed mb-6">
                Describe your desired architecture. AI will generate nodes, edges, and technical specifications directly inside your workspace.
              </p>
              
              <div className="flex flex-col gap-2 w-full">
                <button className="text-xs bg-subtle text-brand hover:bg-subtle/80 px-3 py-2 rounded-full transition-colors text-left truncate">
                  Design an e-commerce backend
                </button>
                <button className="text-xs bg-subtle text-brand hover:bg-subtle/80 px-3 py-2 rounded-full transition-colors text-left truncate">
                  Create a chat app architecture
                </button>
                <button className="text-xs bg-subtle text-brand hover:bg-subtle/80 px-3 py-2 rounded-full transition-colors text-left truncate">
                  Build a CI/CD pipeline
                </button>
              </div>
            </div>
            
            {/* Example user/assistant messages (hidden by default, documented here as per spec) */}
            <div className="hidden flex-col gap-4 mt-auto">
              <div className="self-end max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-dim border-brand/50 border-2 text-copy-primary p-3 text-sm">
                Can you build a chat app architecture?
              </div>
              <div className="self-start max-w-[85%] rounded-2xl rounded-tl-sm bg-elevated border border-surface-border text-brand p-3 text-sm">
                Sure, I&apos;m setting up the canvas now with a React frontend, Node backend, and Redis cache.
              </div>
            </div>
          </div>

          <div className="p-4 pt-2 border-t border-border shrink-0 bg-base/50 backdrop-blur-sm">
            <div className="relative flex items-end gap-2 bg-elevated border border-surface-border rounded-xl p-2 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/50 transition-all">
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !isGenerating) setInput("");
                  }
                }}
                placeholder={isGenerating ? "AI is working..." : "Ask AI to build or modify..."}
                disabled={isGenerating}
                className="min-h-[72px] max-h-[160px] resize-none border-0 focus-visible:ring-0 bg-transparent text-sm p-2 shadow-none disabled:opacity-50"
              />
              <Button 
                size="icon" 
                className="h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                disabled={!input.trim() || isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-copy-muted text-center mt-2">
              <kbd className="font-sans px-1 rounded bg-subtle border border-subtle-border">Enter</kbd> to send, <kbd className="font-sans px-1 rounded bg-subtle border border-subtle-border">Shift + Enter</kbd> for new line
            </p>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="flex-1 flex flex-col overflow-y-auto p-4 m-0 data-[state=inactive]:hidden">
          <Button className="w-full mb-6 bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
            <FileText className="h-4 w-4 mr-2" />
            Generate Spec
          </Button>

          <div className="space-y-4">
            <h4 className="text-xs font-medium text-copy-muted uppercase tracking-wider">Current Specifications</h4>
            
            <div className="bg-elevated border border-surface-border rounded-xl p-4 flex flex-col gap-3 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand/50"></div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-copy-primary">
                  <FileText className="h-4 w-4 text-brand" />
                  <span className="font-medium text-sm">System Architecture</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md opacity-50 cursor-not-allowed" disabled>
                  <Download className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-copy-muted line-clamp-3">
                Overview of the microservices layout, including the API Gateway, Authentication Service, and main database clusters. Outlines the primary communication protocols and scaling strategies.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
    </>
  )
}
