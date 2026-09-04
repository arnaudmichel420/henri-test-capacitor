import { v7 as uuidv7 } from "uuid"
import { getDatabase } from "../database"
import type { Task } from "../../../store/useTaskStore"
import type { RxDocument } from "rxdb"
import type { Observable } from "rxjs"
import { Directory, Filesystem } from "@capacitor/filesystem"
import { Capacitor } from "@capacitor/core"

export type TaskDoc = Omit<Task, "date"> & { date?: string }

export async function createTask({ name, image, date }: Omit<TaskDoc, "id">) {
  const db = await getDatabase()
  return await db.task.insert({
    id: uuidv7(),
    name,
    image,
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

export async function updateTask({ id, name, image, date }: TaskDoc) {
  const document = await getTask(id)
  await document?.patch({ name, image, date })
}

export async function deleteTask(id: string) {
  const document = await getTask(id)

  if (!document) return

  await deleteFile(document?.image)
  await document?.remove()
}

export async function deleteFile(path: string | undefined) {
  if (!path) return

  try {
    await Filesystem.deleteFile({
      path: path,
    })
  } catch (error) {}
}
