import { z } from "zod"

export const taskCreateSchema = z.object({
  name: z.string().trim().min(1, "Vous devez renseigner une valeur"),
})

export const taskSchema = taskCreateSchema.extend({
  id: z.uuidv7(),
  date: z.date().optional(),
})

export const taskUpdateSchema = taskSchema
  .omit({ id: true })
  .transform((value) => ({ ...value, date: value?.date?.toISOString() }))

export type Task = z.infer<typeof taskSchema>
export type Tasks = Task[]
