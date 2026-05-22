import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { checkProjectAccess } from "@/lib/project-access"
import { AccessDenied } from "@/components/editor/access-denied"
import { MousePointerSquareDashed } from "lucide-react"
import { formatProjectName } from "@/lib/utils"

interface EditorRoomPageProps {
  params: Promise<{ roomId: string }>
}

export default async function EditorRoomPage({ params }: EditorRoomPageProps) {
  const { userId } = await auth()
  
  // Intercept and redirect unauthenticated requests immediately
  if (!userId) {
    redirect("/sign-in")
  }

  const { roomId } = await params
  
  // Secure server-side access control
  const { hasAccess, project } = await checkProjectAccess(roomId)
  
  if (!hasAccess || !project) {
    return <AccessDenied />
  }

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-3.5rem)] bg-base overflow-hidden flex items-center justify-center select-none">
      {/* Dynamic Grid Pattern Canvas Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, white 1px, transparent 0),
            radial-gradient(circle at 1px 1px, white 1px, transparent 0)
          `,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />
      
      {/* Decorative Brand Accent Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />

      {/* Premium Centered Active Canvas Workspace Box */}
      <div className="relative z-10 flex flex-col items-center justify-center p-8 max-w-sm text-center bg-card/30 backdrop-blur-md rounded-3xl border border-border/80 shadow-2xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20 mb-6 animate-pulse">
          <MousePointerSquareDashed className="h-6 w-6 text-brand" />
        </div>
        
        <h2 className="text-lg font-semibold tracking-tight text-foreground mb-2">
          {formatProjectName(project.name)}
        </h2>
        
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          Interactive collaborative canvas is loading. Collaborators can join in real-time. Use the AI panel to generate structures.
        </p>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40 border border-border/50 text-[10px] font-mono text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
          Active Room: {roomId.slice(0, 8)}...
        </div>
      </div>
    </div>
  )
}
