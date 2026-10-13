import { getUploadsStatic } from "@/db/queries/uploadQuery"
import type { UploadWithPath } from "@/db/replication/file.replication"
import { Directory, Filesystem, type FileInfo } from "@capacitor/filesystem"
import { getTime, subDays } from "date-fns"

export async function deleteFile(path?: string | null) {
  if (!path) return

  try {
    await Filesystem.deleteFile({
      path: path,
    })
  } catch (error) {
    console.error(error)
  }
}

async function ensureFolder(path: string) {
  try {
    await Filesystem.mkdir({
      path,
      directory: Directory.Documents,
      recursive: true,
    })
  } catch {
    // ponytail: le plugin Android renvoie "already exists" même avec recursive: true, on ignore
  }
}

export async function copyFileToFolder(
  path: string,
  folder: string,
  uploadId: string
): Promise<string> {
  await ensureFolder(folder)

  const result = await Filesystem.copy({
    from: path,
    to: `${folder}/${uploadId}.jpg`,
    toDirectory: Directory.Documents,
  })

  return result.uri
}

export async function moveFileToPermanentFolder(path: string): Promise<string> {
  await ensureFolder("todoApp/save")

  const newPath = `todoApp/save${path.split("todoApp/upload")[1]}`

  await Filesystem.rename({
    from: path,
    to: newPath,
    toDirectory: Directory.Documents,
  })

  const { uri } = await Filesystem.getUri({
    path: newPath,
    directory: Directory.Documents,
  })

  return uri
}

export async function getFileFromPath(docWithPath: UploadWithPath) {
  const result = await Filesystem.readFile({ path: docWithPath.path })
  const res = await fetch(
    `data:${docWithPath.doc.mimeType};base64,${result.data}`
  )
  return await res.blob()
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(",")[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function writeBlobToFolder(
  blob: Blob,
  folder: string,
  uploadId: string
): Promise<string> {
  await ensureFolder(folder)

  const base64 = await blobToBase64(blob)
  const path = `${folder}/${uploadId}.jpg`

  await Filesystem.writeFile({
    path,
    data: base64,
    directory: Directory.Documents,
  })

  const { uri } = await Filesystem.getUri({
    path,
    directory: Directory.Documents,
  })
  return uri
}

export async function deleteDirectory(directory: string) {
  await Filesystem.rmdir({
    path: directory,
    directory: Directory.Documents,
    recursive: true,
  })
}

async function safeReaddir(path: string) {
  try {
    return await Filesystem.readdir({ path, directory: Directory.Documents })
  } catch {
    return { files: [] }
  }
}

export async function cleanupTombstone() {
  const save = await safeReaddir("todoApp/save")
  const upload = await safeReaddir("todoApp/upload")
  const uploads = await getUploadsStatic()
  const weekOldDate = getTime(subDays(new Date(), 7))

  const uploadId = new Set(uploads?.map((u) => u.id))
  const saveTomb = save.files?.filter(
    (file: FileInfo) =>
      !uploadId.has(file.name.split(".jpg")[0]) && file.mtime < weekOldDate
  )
  const uploadTomb = upload.files?.filter(
    (file: FileInfo) =>
      !uploadId.has(file.name.split(".jpg")[0]) && file.mtime < weekOldDate
  )

  await Promise.all(
    [...(saveTomb ?? []), ...(uploadTomb ?? [])].map((file) =>
      deleteFile(file.uri)
    )
  )
}
