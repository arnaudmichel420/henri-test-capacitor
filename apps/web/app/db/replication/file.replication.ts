import {
  downloadFile,
  getPresignGetUrl,
  getPresignPutUrl,
  uploadFile,
} from "@/api/s3Api"
import { uploadStatusSchema, type Upload } from "@/schemas/upload.schema"
import {
  deleteFile,
  getFileFromPath,
  moveFileToPermanentFolder,
  writeBlobToFolder,
} from "@/utils/fileUtil"
import type { RxDocumentData } from "rxdb"
import type { RxReplicationState } from "rxdb/plugins/replication"
import {
  createLocalUpload,
  deleteLocalDocFromUpload,
  getDeletedUpload,
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
  await processExistingDeletedUpload()

  replicationState.received$.subscribe((doc: RxDocumentData<Upload>) => {
    console.log(doc);
    
    if (doc.status === "pending") {
      getLocalUpload(doc.id).then((path: string | undefined) => {
        if (!path) return
        enqueueUpload({ doc, path })
      })
    } else if (doc.status === "uploaded" && !doc._deleted) {
      enqueueDownload(doc)
    } else if (doc._deleted) {
      getLocalUpload(doc.id).then((path: string | undefined) => {
        if (!path) return
        enqueueDeleted({ doc, path })
      })
    }
  })
}

export interface UploadWithPath {
  doc: Upload
  path: string
}

async function processExistingPendingUploads() {
  const toUploadUploads = await getLocalUploads()

  console.log(toUploadUploads)
  for (const toUploadUpload of toUploadUploads) {
    enqueueUpload(toUploadUpload)
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

  const file = await getFileFromPath(docWithPath)
  if (!file) return

  const response = await uploadFile(presignedUrl, docWithPath, file)
  const etag = response.headers.get("ETag")

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
  const toDownloadUploads = await getUploadWithoutLocal()

  console.log(toDownloadUploads)
  for (const toDownloadUpload of toDownloadUploads) {
    enqueueDownload(toDownloadUpload)
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

const deletedInFlight = new Set()

async function processExistingDeletedUpload() {
  const toDeleteUploads = await getDeletedUpload()

  console.log(toDeleteUploads)
  for (const toDeleteUpload of toDeleteUploads) {
    enqueueDeleted(toDeleteUpload)
  }
}

function enqueueDeleted(docWithPath: UploadWithPath) {
  const doc = docWithPath.doc
  if (deletedInFlight.has(doc.id)) return
  deletedInFlight.add(doc.id)
  processDeleted(docWithPath).finally(() =>
    deletedInFlight.delete(docWithPath.doc.id)
  )
}

async function processDeleted(docWithPath: UploadWithPath) {
  //delete file
  await deleteFile(docWithPath.path)

  //delete local docs
  await deleteLocalDocFromUpload(docWithPath.doc.id)
}
