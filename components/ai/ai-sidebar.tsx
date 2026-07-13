"use client"

import * as React from "react"
import { Bot, X, FileText, Download, ArrowUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import { useAiStatusStore } from "@/hooks/use-ai-status-store"
import { useEventListener, useBroadcastEvent, useSelf, useRoom } from "@liveblocks/react/suspense"
import { AiChatFeedPayload, AiChatFeedPayloadSchema } from "@/types/tasks"
import { toast } from "sonner"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { Trash2 } from "lucide-react"

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

  const [messages, setMessages] = React.useState<AiChatFeedPayload[]>([])
  const broadcast = useBroadcastEvent()
  const self = useSelf()
  const room = useRoom()

  const [specs, setSpecs] = React.useState<any[]>([])
  const [isLoadingSpecs, setIsLoadingSpecs] = React.useState(false)
  const [selectedSpec, setSelectedSpec] = React.useState<any | null>(null)
  const [specContent, setSpecContent] = React.useState<string>("")
  const [isLoadingContent, setIsLoadingContent] = React.useState(false)

  const fetchSpecs = React.useCallback(async () => {
    if (!room.id) return
    setIsLoadingSpecs(true)
    try {
      const res = await fetch(`/api/projects/${room.id}/specs`)
      if (res.ok) {
        const data = await res.json()
        setSpecs(data)
      }
    } catch (error) {
      console.error("Failed to fetch specs", error)
    } finally {
      setIsLoadingSpecs(false)
    }
  }, [room.id])

  React.useEffect(() => {
    if (isOpen) {
      fetchSpecs()
    }
  }, [isOpen, fetchSpecs])

  const handleOpenSpec = async (spec: any) => {
    setSelectedSpec(spec)
    setSpecContent("")
    setIsLoadingContent(true)
    try {
      const res = await fetch(`/api/projects/${room.id}/specs/${spec.id}/download`)
      if (res.ok) {
        const text = await res.text()
        setSpecContent(text)
      } else {
        toast.error("Failed to load spec content")
      }
    } catch (error) {
      console.error("Failed to load spec content", error)
      toast.error("Failed to load spec content")
    } finally {
      setIsLoadingContent(false)
    }
  }

  const handleDownload = (spec: any) => {
    const url = `/api/projects/${room.id}/specs/${spec.id}/download`
    const a = document.createElement("a")
    a.href = url
    a.download = `spec-${spec.id}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const [isGeneratingSpec, setIsGeneratingSpec] = React.useState(false)
  const [specRunData, setSpecRunData] = React.useState<{ runId: string; publicToken: string } | null>(null)

  const { run: specRun } = useRealtimeRun(specRunData?.runId, {
    accessToken: specRunData?.publicToken,
    enabled: !!specRunData,
  })

  const handleGenerateSpec = async () => {
    if (!room.id) return
    setIsGeneratingSpec(true)
    try {
      const res = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          chatHistory: messages,
        })
      })
      
      if (!res.ok) throw new Error("Failed to start spec generation")
      
      const data = await res.json()
      if (data.runId && data.publicToken) {
        toast.success("Spec generation started!")
        setSpecRunData({ runId: data.runId, publicToken: data.publicToken })
      } else {
        // Fallback if publicToken wasn't returned
        setIsGeneratingSpec(false)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate spec")
      setIsGeneratingSpec(false)
    }
  }

  const [triggerRun, setTriggerRun] = React.useState<{ runId: string; publicToken: string } | null>(null)
  
  const { run } = useRealtimeRun(triggerRun?.runId, {
    accessToken: triggerRun?.publicToken,
    enabled: !!triggerRun,
  })

  useEventListener(({ event }) => {
    if (event.type === "ai-chat") {
      const parsed = AiChatFeedPayloadSchema.safeParse(event.payload)
      if (parsed.success) {
        setMessages((prev) => [...prev, parsed.data])
      }
    }
  })

  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const processedRuns = React.useRef<Set<string>>(new Set())

  React.useEffect(() => {
    if (!run || !run.id) return
    
    if (run.status === "COMPLETED" || run.status === "FAILED") {
      if (processedRuns.current.has(run.id)) return
      processedRuns.current.add(run.id)
      
      setTriggerRun(null)
      
      if (run.status === "COMPLETED") {
        const replyText = run.output?.reply || "I have updated the design based on your request. Let me know if you need any other changes!";
        const message: AiChatFeedPayload = {
          id: crypto.randomUUID(),
          senderId: "system",
          senderName: "Ghost AI",
          senderAvatar: undefined,
          content: replyText,
          timestamp: Date.now(),
          role: "assistant",
        }
        setMessages((prev) => [...prev, message])
        broadcast({ type: "ai-chat", payload: message })
      } else if (run.status === "FAILED") {
        const message: AiChatFeedPayload = {
          id: crypto.randomUUID(),
          senderId: "system",
          senderName: "Ghost AI System",
          senderAvatar: undefined,
          content: "Error: The design generation failed.",
          timestamp: Date.now(),
          role: "assistant",
        }
        setMessages((prev) => [...prev, message])
      }
    }
  }, [run?.status, run?.id, run?.output, broadcast])

  const processedSpecRuns = React.useRef<Set<string>>(new Set())

  React.useEffect(() => {
    if (!specRun || !specRun.id) return
    
    if (specRun.status === "COMPLETED" || specRun.status === "FAILED") {
      if (processedSpecRuns.current.has(specRun.id)) return
      processedSpecRuns.current.add(specRun.id)
      
      setSpecRunData(null)
      setIsGeneratingSpec(false)
      
      if (specRun.status === "COMPLETED") {
        toast.success("Spec generated successfully!")
        fetchSpecs()
      } else if (specRun.status === "FAILED") {
        toast.error("Spec generation failed")
      }
    }
  }, [specRun?.status, specRun?.id, fetchSpecs])

  const handleSendMessage = async (customInput?: string) => {
    const textToSend = typeof customInput === "string" ? customInput : input.trim()
    if (!textToSend || isGenerating || !!triggerRun || !self) return
    
    const message: AiChatFeedPayload = {
      id: crypto.randomUUID(),
      senderId: self.id,
      senderName: self.info?.name,
      senderAvatar: self.info?.avatar,
      content: textToSend,
      timestamp: Date.now(),
      role: "user",
    }
    
    const parsed = AiChatFeedPayloadSchema.safeParse(message)
    if (!parsed.success) {
      toast.error("Failed to send message: Invalid format")
      return
    }
    
    setMessages((prev) => [...prev, message])
    broadcast({ type: "ai-chat", payload: message })
    setInput("")

    try {
      const res = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          roomId: room.id,
          projectId: room.id,
        })
      })
      
      if (!res.ok) throw new Error("Failed to start design generation")
      
      const data = await res.json()
      if (data.runId && data.publicToken) {
        setTriggerRun({ runId: data.runId, publicToken: data.publicToken })
      }
    } catch (error) {
      const errorMsg: AiChatFeedPayload = {
        id: crypto.randomUUID(),
        senderId: "system",
        senderName: "Ghost AI System",
        content: `Error: ${error instanceof Error ? error.message : "Failed to connect to AI"}`,
        timestamp: Date.now(),
        role: "assistant",
      }
      setMessages((prev) => [...prev, errorMsg])
    }
  }

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
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMessages([])}
              className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
              title="Clear Chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
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
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center select-none py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20 mb-4">
                  <Bot className="h-6 w-6 text-brand" />
                </div>
                <p className="text-sm font-semibold text-copy-primary mb-2">AI Design Assistant</p>
                <p className="text-xs text-copy-muted max-w-[220px] leading-relaxed mb-6">
                  Describe your desired architecture. AI will generate nodes, edges, and technical specifications directly inside your workspace.
                </p>
                
                <div className="flex flex-col gap-2 w-full">
                  <button 
                    onClick={() => handleSendMessage("Design an e-commerce backend")}
                    className="text-xs bg-subtle text-brand hover:bg-subtle/80 px-3 py-2 rounded-full transition-colors text-left truncate"
                  >
                    Design an e-commerce backend
                  </button>
                  <button 
                    onClick={() => handleSendMessage("Create a chat app architecture")}
                    className="text-xs bg-subtle text-brand hover:bg-subtle/80 px-3 py-2 rounded-full transition-colors text-left truncate"
                  >
                    Create a chat app architecture
                  </button>
                  <button 
                    onClick={() => handleSendMessage("Build a CI/CD pipeline")}
                    className="text-xs bg-subtle text-brand hover:bg-subtle/80 px-3 py-2 rounded-full transition-colors text-left truncate"
                  >
                    Build a CI/CD pipeline
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 mt-auto pb-4">
                {messages.map((msg) => {
                  const isSelf = msg.senderId === self?.id
                  const isAi = msg.role === "assistant"
                  
                  if (isSelf) {
                    return (
                      <div key={msg.id} className="self-end max-w-[85%] flex flex-col items-end mb-2">
                        <div className="px-4 py-2.5 bg-brand text-primary-foreground rounded-3xl rounded-tr-md text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
                          {msg.content}
                        </div>
                      </div>
                    )
                  }

                  if (isAi) {
                    return (
                      <div key={msg.id} className="self-start max-w-[85%] flex gap-2 mb-2 group/ai-message">
                        <div className="flex-shrink-0 mt-auto mb-1">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1A1A] border border-white/10 shadow-sm relative overflow-hidden">
                            <Bot className="h-3.5 w-3.5 text-brand relative z-10" />
                          </div>
                        </div>
                        <div className="px-4 py-2.5 bg-[#1A1A1A] border border-white/10 text-white/90 rounded-3xl rounded-tl-md text-sm leading-relaxed whitespace-pre-wrap shadow-sm relative overflow-hidden">
                          {msg.content}
                        </div>
                      </div>
                    )
                  }

                  // Other human users
                  return (
                    <div key={msg.id} className="self-start max-w-[85%] flex gap-2 mb-2">
                      <div className="flex-shrink-0 mt-auto mb-1">
                        {msg.senderAvatar ? (
                          <img src={msg.senderAvatar} alt={msg.senderName || ""} className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-subtle" />
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[10px] text-copy-muted mb-1 ml-1">{msg.senderName || "Unknown"}</span>
                        <div className="px-4 py-2.5 bg-elevated border border-surface-border text-copy-primary rounded-3xl rounded-tl-md text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {/* AI Thinking Indicator */}
                {isGenerating && (
                  <div className="self-start max-w-[85%] flex gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex-shrink-0 mt-auto mb-1">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1A1A] border border-brand/30 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 via-transparent to-brand/20 animate-[spin_3s_linear_infinite]" />
                        <Bot className="h-3.5 w-3.5 text-brand relative z-10" />
                      </div>
                    </div>
                    <div className="relative p-[1px] rounded-3xl rounded-tl-md overflow-hidden shadow-sm">
                      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,theme(colors.brand.DEFAULT)_360deg)] animate-[spin_2s_linear_infinite]" />
                      <div className="relative px-4 py-3.5 bg-[#1A1A1A] rounded-3xl rounded-tl-md overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                        <div className="flex items-center gap-1.5 relative z-10">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="p-4 pt-2 border-t border-border shrink-0 bg-base/50 backdrop-blur-sm flex flex-col gap-2">
            {/* Status Strip */}
            {isGenerating && latestMessage && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1A] border border-brand/20 rounded-lg text-xs text-white/80 animate-in fade-in slide-in-from-bottom-1 shadow-sm">
                <Loader2 className="h-3 w-3 text-brand animate-spin" />
                <span className="truncate flex-1">{latestMessage}</span>
              </div>
            )}
            
            <div className={cn(
              "relative flex items-end gap-2 bg-elevated border rounded-xl p-2 transition-all shadow-sm",
              isGenerating ? "border-brand/30 bg-elevated/50" : "border-surface-border focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/30"
            )}>
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={isGenerating || triggerRun ? "AI is working..." : "Ask AI to build or modify..."}
                disabled={isGenerating || !!triggerRun}
                className="min-h-[40px] max-h-[160px] resize-none border-0 focus-visible:ring-0 bg-transparent text-sm p-2 py-2.5 shadow-none disabled:opacity-50"
              />
              <Button 
                onClick={() => handleSendMessage()}
                size="icon" 
                className={cn(
                  "h-8 w-8 rounded-lg shrink-0 transition-colors",
                  isGenerating || triggerRun
                    ? "bg-[#1A1A1A] text-brand border border-brand/20 hover:bg-[#1A1A1A]" 
                    : "bg-brand text-primary-foreground hover:bg-brand/90"
                )}
                disabled={!input.trim() || isGenerating || !!triggerRun}
              >
                {isGenerating || triggerRun ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-copy-muted text-center mt-1">
              <kbd className="font-sans px-1 rounded bg-subtle border border-subtle-border">Enter</kbd> to send, <kbd className="font-sans px-1 rounded bg-subtle border border-subtle-border">Shift + Enter</kbd> for new line
            </p>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="flex-1 flex flex-col overflow-y-auto p-4 m-0 data-[state=inactive]:hidden">
          <Button 
            className="w-full mb-6 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            onClick={handleGenerateSpec}
            disabled={isGeneratingSpec}
          >
            {isGeneratingSpec ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            {isGeneratingSpec ? "Generating..." : "Generate Spec"}
          </Button>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-copy-muted uppercase tracking-wider">Current Specifications</h4>
              <Button variant="ghost" size="sm" onClick={fetchSpecs} className="h-6 px-2 text-[10px]" disabled={isLoadingSpecs}>
                {isLoadingSpecs ? <Loader2 className="h-3 w-3 animate-spin" /> : "Refresh"}
              </Button>
            </div>
            
            {specs.length === 0 && !isLoadingSpecs ? (
              <p className="text-xs text-copy-muted text-center py-4">No specs generated yet.</p>
            ) : (
              specs.map((spec) => (
                <div key={spec.id} onClick={() => handleOpenSpec(spec)} className="bg-elevated border border-surface-border hover:border-brand/50 cursor-pointer rounded-xl p-4 flex flex-col gap-3 group relative overflow-hidden transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-copy-primary">
                        <FileText className="h-4 w-4 text-brand" />
                        <span className="font-medium text-sm">System Spec</span>
                      </div>
                      <span className="text-[10px] text-copy-muted">
                        {new Date(spec.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand/10 hover:text-brand" 
                      onClick={(e) => { e.stopPropagation(); handleDownload(spec); }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Spec Preview Modal */}
      <Dialog open={!!selectedSpec} onOpenChange={(open) => !open && setSelectedSpec(null)}>
        <DialogContent className="sm:max-w-[90vw] sm:w-[1200px] h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border/80 shadow-2xl">
          <div className="p-4 border-b border-border bg-subtle/50 flex flex-row items-center justify-between shrink-0">
            <div className="flex flex-col">
              <DialogTitle className="text-lg font-semibold text-copy-primary">System Specification</DialogTitle>
              {selectedSpec && (
                <p className="text-xs text-copy-muted mt-1">Generated on {new Date(selectedSpec.createdAt).toLocaleString()}</p>
              )}
            </div>
            {selectedSpec && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 mr-8"
                onClick={() => handleDownload(selectedSpec)}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            )}
          </div>
          <div className="flex-1 p-6 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/5 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/10 transition-colors">
            {isLoadingContent ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
              </div>
            ) : (
              <div className="font-sans text-sm text-copy-primary [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-6 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:mt-4 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-1 [&_pre]:bg-[#1A1A1A] [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:mb-4 [&_pre]:border [&_pre]:border-white/10 [&_code]:bg-[#1A1A1A] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:border [&_code]:border-white/10 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:border-0 [&_blockquote]:border-l-4 [&_blockquote]:border-brand/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-copy-muted [&_a]:text-brand [&_a]:underline">
                <ReactMarkdown>{specContent}</ReactMarkdown>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </aside>
    </>
  )
}
