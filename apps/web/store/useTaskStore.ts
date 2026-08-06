import type { MediaResult } from "@capacitor/camera"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { z } from "zod"

export const taskCreateSchema = z.object({
  id: z.uuidv7(),
  name: z.string().trim().min(1, "Vous devez renseigner une valeur"),
})

export const taskUpdateSchema = taskCreateSchema.omit({ id: true }).extend({
  image: z.string().optional(),
  date: z.date().optional(),
})

export const taskSchema = taskCreateSchema.extend({
  image: z.string().optional(),
  date: z.date().optional(),
})

export type Task = z.infer<typeof taskSchema>
export type Tasks = Task[]

interface TaskState {
  tasks: Tasks
  setTasks: (tasks: Tasks) => void
  clearTasks: () => void
}

export const taskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],

      setTasks: (tasks) => set({ tasks }),
      clearTasks: () => set({ tasks: [] }),
    }),
    { name: "capacitor", version: 1 }
  )
)
