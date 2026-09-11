import { uploadStatusSchema, type Upload } from "@/schemas/upload.schema"
import type { RxChangeEvent, RxDatabase, RxDocument } from "rxdb"
import {
  getLocalUpload,
  getLocalUploads,
  updateLocalUpload,
  updateUpload,
} from "../queries/uploadQuery"
import { getDatabase } from "../database"
import { Directory, Filesystem } from "@capacitor/filesystem"
import { updateTask } from "../queries/taskQuery"

export default async function replicateFile() {
  await processExistingPendingUploads()
  const db = await getDatabase()
  db.upload.$.subscribe((changeEvent: RxChangeEvent<RxDocument<Upload>>) => {
    if (
      changeEvent.operation === "INSERT" &&
      changeEvent.documentData.status === "pending"
    ) {
      console.log(changeEvent)
        //todo pb de sync le call pour la presign url est envoyé avant que ce soit persist en bdd
      getLocalUpload(changeEvent.documentData.id).then(
        (uploadPath: string | undefined) => {
          if (!uploadPath) return
          enqueueUpload({ doc: changeEvent.documentData, uploadPath })
        }
      )
    }
  })
}

export interface UploadWithPath {
  doc: Upload
  uploadPath: string
}

async function processExistingPendingUploads() {
  const localUploads = await getLocalUploads()

  console.log(localUploads)
  for (const localUpload of localUploads) {
    enqueueUpload(localUpload)
  }
}

const inFlight = new Set()

function enqueueUpload(docWithPath: UploadWithPath) {
  const doc = docWithPath.doc
  if (inFlight.has(doc.id)) return
  inFlight.add(doc.id)
  processUpload(docWithPath).finally(() => inFlight.delete(doc.id))
}

async function processUpload(docWithPath: UploadWithPath) {
  const doc = docWithPath.doc

  const presignedUrl = await getPresignPutUrl(doc.id)
  if (!presignedUrl) return

  const file = await getFileFromPath(docWithPath)
  if (!file) return

  const response = await uploadFile(presignedUrl, docWithPath, file)
  const etag = response.headers.get("ETag")
  console.log(etag)

  //save upload
  await updateUpload(doc.id, {
    etag,
    sizeBytes: String(file.size),
    status: uploadStatusSchema.enum.uploaded,
  })

  //deplacer l'image
  const newUploadPath = await moveFileToPermanentFolder(docWithPath.uploadPath)

  //modifier le localFile
  await updateLocalUpload(doc.id, { localUri: newUploadPath })
}

async function getPresignPutUrl(id: string): Promise<string> {
  const res = await fetch(
    `${import.meta.env.VITE_BACK_URL}/uploads/${id}/upload-url`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  )
  return ((await res.json()) as { url: string }).url
}

async function uploadFile(
  presignedUrl: string,
  docWithPath: UploadWithPath,
  file: Blob
): Promise<any> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": docWithPath.doc.mimeType },
    body: file,
  })

  if (!res.ok) throw new Error("Upload failed")

  return res
}

async function getFileFromPath(docWithPath: UploadWithPath) {
  const result = await Filesystem.readFile({ path: docWithPath.uploadPath })
  const res = await fetch(
    `data:${docWithPath.doc.mimeType};base64,${result.data}`
  )
  return await res.blob()
}

async function moveFileToPermanentFolder(uploadPath: string): Promise<string> {
  try {
    await Filesystem.mkdir({
      path: "todoApp/save",
      directory: Directory.Documents,
      recursive: true,
    })
  } catch {
    // ponytail: le plugin Android renvoie "already exists" même avec recursive: true, on ignore
  }

  const newPath = `todoApp/save${uploadPath.split("todoApp/upload")[1]}`

  await Filesystem.rename({
    from: uploadPath,
    to: newPath,
    toDirectory: Directory.Documents,
  })

  const { uri } = await Filesystem.getUri({
    path: newPath,
    directory: Directory.Documents,
  })

  return uri
}
