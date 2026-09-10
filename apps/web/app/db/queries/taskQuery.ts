import type { Task } from "@/schemas/task.schema"
import type { RxDocument } from "rxdb"
import type { Observable } from "rxjs"
import { v7 as uuidv7 } from "uuid"
import { getDatabase } from "../database"

export type TaskDoc = Omit<Task, "date"> & { date?: string }

export async function createTask({ name, date }: Omit<TaskDoc, "id">) {
  const db = await getDatabase()
  return await db.task.insert({
    id: uuidv7(),
    name,
    date,
  })
}
export async function getTask(id: string): Promise<RxDocument<TaskDoc> | null> {
  const db = await getDatabase()
  return await db.task.findOne(id).exec()
}

export async function getTasks(): Promise<Observable<RxDocument<TaskDoc>[]>> {
  return getDatabase().then((db) => db.task.find().$)
}

export async function updateTask({ id, name, date }: TaskDoc) {
  const document = await getTask(id)
  await document?.patch({ name, date })
}

export async function deleteTask(id: string) {
  const document = await getTask(id)

  if (!document) return

  await document?.remove()
}
