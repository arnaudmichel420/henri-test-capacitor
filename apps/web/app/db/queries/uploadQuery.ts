import type { Task } from "@/schemas/task.schema"
import type { RxDocument } from "rxdb"
import type { Observable } from "rxjs"
import { v7 as uuidv7 } from "uuid"
import { getDatabase } from "../database"
import type { Upload } from "@/schemas/upload.schema"

export async function createUpload({
  id,
  taskId,
  s3Key,
  status,
  mimeType,
  sizeBytes,
  etag,
}: Upload) {
  const db = await getDatabase()
  return await db.upload.insert({
    id,
    taskId,
    s3Key,
    status,
    mimeType,
    sizeBytes,
    etag,
  })
}

export async function createLocalUpload(uploadId: string, path: string) {
  const db = await getDatabase()
  return await db.upload.insertLocal(uploadId, { localUri: path })
}

// export async function getTask(id: string): Promise<RxDocument<TaskDoc> | null> {
//   const db = await getDatabase()
//   return await db.task.findOne(id).exec()
// }

export async function getUploads(): Promise<Observable<RxDocument<Upload>[]>> {
  return getDatabase().then((db) => db.upload.find().$)
}

export async function getUploadByTaskId(
  taskId: string
): Promise<RxDocument<Upload> | null> {
  const db = await getDatabase()
  return db.upload.findOne({ selector: { taskId } }).exec()
}

export async function getLocalUpload(uploadId: string): Promise<string | undefined> {
  const db = await getDatabase()
  const doc = await db.upload.getLocal(uploadId)
  return doc?.get("localUri")
}

// export async function updateTask({ id, name, date }: TaskDoc) {
//   const document = await getTask(id)
//   await document?.patch({ name, date })
// }

// export async function deleteTask(id: string) {
//   const document = await getTask(id)

//   if (!document) return

//   await document?.remove()
// }
