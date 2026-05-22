import Link from "next/link"
import { Lock } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AccessDenied() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-8 text-center bg-background text-foreground overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-destructive/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md bg-card/40 backdrop-blur-md border border-border p-8 rounded-3xl shadow-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20 mb-6">
          <Lock className="h-6 w-6 text-destructive" />
        </div>
        
        <h1 className="text-xl font-semibold tracking-tight mb-2">
          Access Denied
        </h1>
        
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          You do not have permission to access this project, or the project does not exist. Please check the URL or request access from the project owner.
        </p>
        
        <Link 
          href="/editor" 
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }), 
            "w-full rounded-xl flex items-center justify-center h-10 text-sm font-medium"
          )}
        >
          Return to Projects
        </Link>
      </div>
    </div>
  )
}
