import type { Task } from "@/schemas/task.schema"
import type { RxDocument } from "rxdb"
import type { Observable } from "rxjs"
import { v7 as uuidv7 } from "uuid"
import { getDatabase } from "../database"

export type TaskDoc = Omit<Task, "scheduledAt" | "doneAt"> & {
  scheduledAt?: string | null
  doneAt?: string | null
}

export async function createTask({
  name,
  scheduledAt,
}: Omit<TaskDoc, "id" | "done" | "doneAt">) {
  const db = await getDatabase()
  return await db.task.insert({
    id: uuidv7(),
    name,
    scheduledAt: scheduledAt ?? null,
    done: false,
    doneAt: null,
  })
}
export async function getTask(id: string): Promise<RxDocument<TaskDoc> | null> {
  const db = await getDatabase()
  return await db.task.findOne(id).exec()
}

export async function getTask$(
  id: string,
): Promise<Observable<RxDocument<TaskDoc> | null>> {
  const db = await getDatabase()
  return db.task.findOne(id).$
}

export async function getTasks(): Promise<Observable<RxDocument<TaskDoc>[]>> {
  return getDatabase().then((db) => db.task.find().$)
}

export async function updateTask({
  id,
  name,
  scheduledAt,
  done,
  doneAt,
}: TaskDoc) {
  const document = await getTask(id)
  await document?.patch({
    name,
    scheduledAt: scheduledAt ?? null,
    done,
    doneAt: doneAt ?? null,
  })
}

export async function setTaskDone(task: RxDocument<TaskDoc>, done: boolean) {
  await updateTask({
    ...task.toJSON(),
    done,
    doneAt: done ? new Date().toISOString() : null,
  })
}

export async function deleteTask(id: string) {
  const document = await getTask(id)

  if (!document) return

  await document?.remove()
}
