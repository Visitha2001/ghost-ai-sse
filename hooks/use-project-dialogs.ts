import { create } from "zustand"

export type DialogType = "create" | "rename" | "delete" | "share" | null

export interface Project {
  id: string
  name: string
  isOwned: boolean
}

interface ProjectDialogsState {
  type: DialogType
  isOpen: boolean
  project: Project | null
  loading: boolean
  formName: string
  ownedProjects: Project[]
  sharedProjects: Project[]
  openDialog: (type: DialogType, project?: Project | null) => void
  closeDialog: () => void
  setLoading: (loading: boolean) => void
  setFormName: (name: string) => void
  setProjects: (owned: Project[], shared: Project[]) => void
}

export const useProjectDialogs = create<ProjectDialogsState>((set) => ({
  type: null,
  isOpen: false,
  project: null,
  loading: false,
  formName: "",
  ownedProjects: [],
  sharedProjects: [],
  openDialog: (type, project = null) => 
    set({ 
      type, 
      isOpen: true, 
      project, 
      formName: project?.name ? project.name.toLowerCase().replace(/\s+/g, "-") : "", 
      loading: false 
    }),
  closeDialog: () => 
    set({ 
      isOpen: false, 
      type: null, 
      project: null, 
      formName: "", 
      loading: false 
    }),
  setLoading: (loading) => set({ loading }),
  setFormName: (formName) => set({ formName }),
  setProjects: (ownedProjects, sharedProjects) => set({ ownedProjects, sharedProjects }),
}))
