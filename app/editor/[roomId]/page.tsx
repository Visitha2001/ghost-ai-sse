import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { checkProjectAccess } from "@/lib/project-access"
import { AccessDenied } from "@/components/editor/access-denied"
import { CanvasWrapper } from "@/components/canvas/canvas-wrapper"

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
    <div className="relative w-full h-full min-h-[calc(100vh-3.5rem)] bg-base overflow-hidden select-none">
      <CanvasWrapper roomId={roomId} />
    </div>
  )
}
