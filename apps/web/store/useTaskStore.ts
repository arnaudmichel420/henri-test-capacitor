import { z } from "zod"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export const taskCreateSchema = z.object({
  name: z.string().trim().min(1, "Vous devez renseigner une valeur"),
})

export const taskSchema = taskCreateSchema.extend({
  id: z.uuidv7(),
  image: z.string().optional(),
  date: z.date().optional(),
})

export const taskUpdateSchema = taskSchema
  .omit({ id: true })
  .transform((value) => ({ ...value, date: value?.date?.toISOString() }))

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
