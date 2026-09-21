import type { UploadWithPath } from "@/db/replication/file.replication"

export async function getPresignPutUrl(id: string): Promise<string> {
  const res = await fetch(
    `${import.meta.env.VITE_BACK_URL}/uploads/${id}/upload-url`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  )
  return ((await res.json()) as { url: string }).url
}

export async function getPresignGetUrl(id: string): Promise<string> {
  const res = await fetch(
    `${import.meta.env.VITE_BACK_URL}/uploads/${id}/download-url`,
    { method: "GET" }
  )
  return ((await res.json()) as { url: string }).url
}

export async function uploadFile(
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

export async function downloadFile(presignedUrl: string): Promise<Blob> {
  const res = await fetch(presignedUrl, {
    method: "GET",
  })

  if (!res.ok) throw new Error("Download failed")

  return res.blob()
}
