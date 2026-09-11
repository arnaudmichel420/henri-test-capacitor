import type { Upload, Uploads } from "@/schemas/upload.schema"
import type { RxDocument } from "rxdb"
import type { Observable } from "rxjs"
import { getDatabase } from "../database"
import type { UploadWithPath } from "../replication/file.replication"

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

export async function createLocalUpload(
  uploadId: string,
  data: Record<string, string>
) {
  const db = await getDatabase()
  return await db.upload.insertLocal(uploadId, data)
}

export async function updateLocalUpload(
  uploadId: string,
  data: Record<string, string>
) {
  const db = await getDatabase()
  return await db.upload.upsertLocal(uploadId, data)
}

export async function getUploads(): Promise<Observable<RxDocument<Upload>[]>> {
  return getDatabase().then((db) => db.upload.find().$)
}

export async function getUploadByTaskId(
  taskId: string
): Promise<RxDocument<Upload> | null> {
  const db = await getDatabase()
  return db.upload.findOne({ selector: { taskId } }).exec()
}

export async function getLocalUpload(
  uploadId: string
): Promise<string | undefined> {
  const db = await getDatabase()
  const doc = await db.upload.getLocal(uploadId)
  const uploadFile = await doc?.get("uploadPath")

  return uploadFile ? uploadFile : doc?.get("localUri")
}

export async function getLocalUploads(): Promise<UploadWithPath[]> {
  const db = await getDatabase()
  const pendingDocs: Uploads = await db.upload
    .find({ selector: { status: "pending" } })
    .exec()

  const withLocalData = await Promise.all(
    pendingDocs.map(async (doc: Upload) => {
      const localDoc = await db.upload.getLocal(doc.id)
      return {
        doc,
        uploadPath: localDoc?.get("uploadPath") ?? null,
      }
    })
  )

  return withLocalData.filter((item) => item.uploadPath !== null)
}

export async function getUpload(
  id: string
): Promise<RxDocument<Upload> | null> {
  const db = await getDatabase()
  return db.upload.findOne(id).exec()
}

export async function updateUpload(
  id: string,
  data: Partial<Omit<Upload, "id">>
) {
  const document = await getUpload(id)
  await document?.patch(data)
}

// export async function deleteTask(id: string) {
//   const document = await getTask(id)

//   if (!document) return

//   await document?.remove()
// }
