import { useRouter } from "next/navigation"
import { useProjectDialogs } from "./use-project-dialogs"

export function useProjectActions() {
  const router = useRouter()
  const { project, formName, setLoading, closeDialog } = useProjectDialogs()

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
      
      router.push(`/editor/${data.id}`)
      closeDialog()
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
