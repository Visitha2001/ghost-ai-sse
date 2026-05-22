"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"
import { 
  Copy, 
  Check, 
  Trash2, 
  User, 
  Plus, 
  Loader2, 
  ShieldAlert, 
  Mail
} from "lucide-react"

export function ShareDialog() {
  const { type, isOpen, project, closeDialog } = useProjectDialogs()

  const [collaborators, setCollaborators] = React.useState<any[]>([])
  const [owner, setOwner] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [inviting, setInviting] = React.useState(false)
  const [removingId, setRemovingId] = React.useState<string | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog()
    }
  }

  const fetchCollaborators = React.useCallback(async () => {
    if (!project?.id) return
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/projects/${project.id}/collaborators`)
      if (res.ok) {
        const data = await res.json()
        setOwner(data.owner)
        setCollaborators(data.collaborators)
      } else {
        setErrorMsg("Failed to retrieve collaborators list.")
      }
    } catch (e) {
      console.error(e)
      setErrorMsg("An unexpected error occurred loading collaborators.")
    } finally {
      setLoading(false)
    }
  }, [project?.id])

  React.useEffect(() => {
    if (isOpen && type === "share" && project?.id) {
      fetchCollaborators()
      setEmail("")
      setErrorMsg(null)
      setSuccessMsg(null)
      setCopied(false)
    }
  }, [isOpen, type, project?.id, fetchCollaborators])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !project?.id) return

    setInviting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(`/api/projects/${project.id}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      if (res.ok) {
        setSuccessMsg(`Successfully invited ${email.trim()}`)
        setEmail("")
        fetchCollaborators()
      } else {
        const text = await res.text()
        setErrorMsg(text || "Failed to invite collaborator.")
      }
    } catch (e) {
      console.error(e)
      setErrorMsg("An error occurred during invitation.")
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (collaboratorId: string, emailStr: string) => {
    if (!project?.id) return
    
    setRemovingId(collaboratorId)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(`/api/projects/${project.id}/collaborators?id=${collaboratorId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setSuccessMsg(`Removed collaborator ${emailStr}`)
        fetchCollaborators()
      } else {
        setErrorMsg("Failed to remove collaborator.")
      }
    } catch (e) {
      console.error(e)
      setErrorMsg("An error occurred removing collaborator.")
    } finally {
      setRemovingId(null)
    }
  }

  const handleCopyLink = () => {
    if (!project?.id) return
    const link = `${window.location.origin}/editor/${project.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isOwner = project?.isOwned === true

  return (
    <Dialog open={isOpen && type === "share"} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-fit p-6 gap-6 rounded-3xl bg-popover border border-border shadow-2xl backdrop-blur-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">Share Project</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Manage access for collaboration on this system architecture workspace.
          </DialogDescription>
        </DialogHeader>

        {/* Copy Link Segment */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Link</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 bg-muted/40 border border-border/80 rounded-xl px-3 py-2 text-xs font-mono text-muted-foreground select-all truncate">
              {project?.id ? `${window.location.origin}/editor/${project.id}` : "Loading URL..."}
            </div>
            <Button
              type="button"
              variant={copied ? "default" : "outline"}
              onClick={handleCopyLink}
              className={`rounded-xl h-9 px-3 gap-2 text-xs font-medium shrink-0 transition-all ${
                copied ? "bg-emerald-500 hover:bg-emerald-600 border-transparent text-white" : "border-border/80 hover:bg-muted/50"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 animate-bounce" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Invite Form (Owners Only) */}
        {isOwner ? (
          <form onSubmit={handleInvite} className="space-y-2">
            <Label htmlFor="invite-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Invite Collaborator
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="collaborator@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl h-10 pl-10 pr-4 bg-muted/30 border-border/80 focus:border-brand/40 focus:ring-1 focus:ring-brand/30 text-sm"
                />
              </div>
              <Button 
                type="submit" 
                disabled={inviting || !email.trim()}
                className="rounded-xl h-10 px-4 gap-2 bg-brand text-background hover:bg-brand/90 font-semibold text-sm transition-all"
              >
                {inviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Invite
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-brand-dim/30 border border-brand/20 text-xs text-brand leading-relaxed select-none">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <p>You are viewing this workspace as a collaborator. Inviting, removing, or modifying access is restricted to the project owner.</p>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 select-none">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 select-none">
            {successMsg}
          </div>
        )}

        {/* Collaborators List Segment */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Collaborators
          </Label>

          <div className="space-y-2 border border-border/60 rounded-2xl p-2 bg-muted/10 max-h-[220px] overflow-y-auto">
            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-xs text-muted-foreground">
                <Loader2 className="h-5 w-5 text-brand animate-spin" />
                <span>Enriching collaborator profiles...</span>
              </div>
            ) : (
              <>
                {/* Owner Row */}
                {owner && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 select-none">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full overflow-hidden border border-border/80 bg-muted flex items-center justify-center shrink-0">
                        {owner.imageUrl ? (
                          <img src={owner.imageUrl} alt={owner.name} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{owner.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{owner.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-brand font-medium">
                      Owner
                    </span>
                  </div>
                )}

                {/* Collaborators Rows */}
                {collaborators.length > 0 ? (
                  collaborators.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/30 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full overflow-hidden border border-border/80 bg-muted flex items-center justify-center shrink-0">
                          {c.imageUrl ? (
                            <img src={c.imageUrl} alt={c.name || c.email} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {c.name || c.email.split("@")[0]}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">{c.email}</p>
                        </div>
                      </div>

                      {/* Remove Button (Owners Only) */}
                      {isOwner && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={removingId === c.id}
                          onClick={() => handleRemove(c.id, c.email)}
                          className="h-7 w-7 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                          aria-label={`Remove ${c.email}`}
                        >
                          {removingId === c.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  !loading && (
                    <div className="py-6 text-center text-xs text-muted-foreground select-none">
                      No collaborators invited yet.
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
