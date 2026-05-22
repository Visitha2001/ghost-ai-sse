import { useRouter } from "next/navigation"
import { useProjectDialogs, Project } from "./use-project-dialogs"

export function useProjectActions() {
  const router = useRouter()
  const { 
    project, 
    formName, 
    setLoading, 
    closeDialog, 
    ownedProjects, 
    sharedProjects, 
    setProjects 
  } = useProjectDialogs()

  const createProject = async () => {
    setLoading(true)
    try {
      const suffix = Math.random().toString(36).substring(2, 6)
      const slug = formName.toLowerCase().trim().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "") || "project"
      const roomId = `${slug}-${suffix}`

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, id: roomId }),
      })
      
      const data = await res.json()
      
      // Optimistically update the client state immediately for instantaneous UI reaction
      const newProj: Project = { id: data.id, name: data.name, isOwned: true }
      setProjects([newProj, ...ownedProjects], sharedProjects)
      
      router.push(`/editor/${data.id}`)
      closeDialog()
      
      // Update Next.js server components in the background
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const renameProject = async () => {
    if (!project) return
    setLoading(true)
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName }),
      })
      
      // Optimistically update the project name in local state immediately
      const updatedOwned = ownedProjects.map((p) => 
        p.id === project.id ? { ...p, name: formName } : p
      )
      setProjects(updatedOwned, sharedProjects)
      
      router.refresh()
      closeDialog()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async () => {
    if (!project) return
    setLoading(true)
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      })
      
      // Optimistically remove the deleted project from local state immediately
      const filteredOwned = ownedProjects.filter((p) => p.id !== project.id)
      setProjects(filteredOwned, sharedProjects)
      
      if (typeof window !== "undefined" && window.location.pathname === `/editor/${project.id}`) {
        router.push("/editor")
      } else {
        router.refresh()
      }
      
      closeDialog()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return { createProject, renameProject, deleteProject }
}
