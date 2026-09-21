import {
  downloadFile,
  getPresignGetUrl,
  getPresignPutUrl,
  uploadFile,
} from "@/api/s3Api"
import { uploadStatusSchema, type Upload } from "@/schemas/upload.schema"
import {
  copyFileToFolder,
  getFileFromPath,
  moveFileToPermanentFolder,
  writeBlobToFolder,
} from "@/utils/fileUtil"
import type { RxDocumentData } from "rxdb"
import type { RxReplicationState } from "rxdb/plugins/replication"
import {
  createLocalUpload,
  getLocalUpload,
  getLocalUploads,
  getUploadWithoutLocal,
  updateLocalUpload,
  updateUpload,
} from "../queries/uploadQuery"
import type { UploadCheckpoint } from "./upload.replication"

export default async function replicateFile(
  replicationState: RxReplicationState<Upload, UploadCheckpoint>
) {
  await processExistingPendingUploads()
  await processExistingUploadedWithoutLocalFile()

  replicationState.received$.subscribe((doc: RxDocumentData<Upload>) => {
    if (doc.status === "pending") {
      console.log(doc)
      getLocalUpload(doc.id).then((path: string | undefined) => {
        if (!path) return
        enqueueUpload({ doc, path })
      })
    } else if (doc.status === "uploaded") {
      processDownload(doc)
    }
  })
}

export interface UploadWithPath {
  doc: Upload
  path: string
}

async function processExistingPendingUploads() {
  const localUploads = await getLocalUploads()

  console.log(localUploads)
  for (const localUpload of localUploads) {
    enqueueUpload(localUpload)
  }
}

const uploadsInFlight = new Set()

function enqueueUpload(docWithPath: UploadWithPath) {
  const doc = docWithPath.doc
  if (uploadsInFlight.has(doc.id)) return
  uploadsInFlight.add(doc.id)
  processUpload(docWithPath).finally(() => uploadsInFlight.delete(doc.id))
}

async function processUpload(docWithPath: UploadWithPath) {
  const doc = docWithPath.doc

  const presignedUrl = await getPresignPutUrl(doc.id)
  if (!presignedUrl) return
console.log(presignedUrl + " presi");

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
  const newUploadPath = await moveFileToPermanentFolder(docWithPath.path)

  //modifier le localFile
  await updateLocalUpload(doc.id, { localUri: newUploadPath })
}

const downloadsInFlight = new Set()

async function processExistingUploadedWithoutLocalFile() {
  const localUploads = await getUploadWithoutLocal()

  console.log(localUploads)
  for (const localUpload of localUploads) {
    enqueueDownload(localUpload)
  }
}

function enqueueDownload(doc: Upload) {
  if (downloadsInFlight.has(doc.id)) return
  downloadsInFlight.add(doc.id)
  processDownload(doc).finally(() => downloadsInFlight.delete(doc.id))
}

async function processDownload(doc: Upload) {
  const presignedUrl = await getPresignGetUrl(doc.id)
  if (!presignedUrl) return

  const file = await downloadFile(presignedUrl)
  if (!file) return

  //mettre le fichier
  const localPath = await writeBlobToFolder(file, "todoApp/save")

  //creer un local upload
  await createLocalUpload(doc.id, { localUri: localPath })
}
