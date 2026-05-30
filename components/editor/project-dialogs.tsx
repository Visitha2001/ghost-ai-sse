"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"
import { useProjectActions } from "@/hooks/use-project-actions"
import { formatProjectName } from "@/lib/utils"
import { ShareDialog } from "./share-dialog"

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-") // Replace spaces and non-word chars with -
    .replace(/^-+|-+$/g, "") // Remove leading and trailing hyphens
}

export function ProjectDialogs() {
  const {
    type,
    isOpen,
    project,
    loading,
    formName,
    closeDialog,
    setFormName,
  } = useProjectDialogs()

  const slugError = React.useMemo(() => {
    if (!formName) return null
    const trimmed = formName.trim()
    if (trimmed.length < 3) return "Project name must be at least 3 characters."
    if (formName.length > 48) return "Project name must be less than 48 characters."
    return null
  }, [formName])

  const { createProject, renameProject, deleteProject } = useProjectActions()

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (type === "create") {
      createProject()
    } else if (type === "rename") {
      renameProject()
    }
  }

  const slug = slugify(formName)

  return (
    <>
      <Dialog open={isOpen && type === "create"} onOpenChange={handleOpenChange}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Start a new architecture workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-name">Project Name</Label>
                <Input
                  id="create-name"
                  placeholder="e.g. My Next.js App"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  autoFocus
                  required
                />
                {slugError && (
                  <p className="text-sm text-destructive">{slugError}</p>
                )}
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p>Live URL preview:</p>
                <div className="p-2 rounded-md bg-muted font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                  https://your-domain.com/{slug || "..."}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formName.trim() || !!slugError}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen && type === "rename"} onOpenChange={handleOpenChange}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Rename Project</DialogTitle>
              <DialogDescription>
                Currently renaming &quot;{project ? formatProjectName(project.name) : ""}&quot;.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rename-name">New Project Name</Label>
                <Input
                  id="rename-name"
                  placeholder="Project Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  autoFocus
                  required
                />
                {slugError && (
                  <p className="text-sm text-destructive">{slugError}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formName.trim() || !!slugError}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen && type === "delete"} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{project ? formatProjectName(project.name) : ""}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              disabled={loading}
              onClick={deleteProject}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareDialog />
    </>
  )
}
