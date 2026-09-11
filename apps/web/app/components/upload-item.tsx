import UploadStatus from "@/components/upload-status"
import { getLocalUpload } from "@/db/queries/uploadQuery"
import type { Upload } from "@/schemas/upload.schema"
import { Capacitor } from "@capacitor/core"
import { useEffect, useState } from "react"

interface UploadItemProps {
  upload: Upload
}
export default function UploadItem({ upload }: UploadItemProps) {
  const [localUpload, setLocalUpload] = useState<string>()

  useEffect(() => {
    getLocalUpload(upload.id).then((localUpload) => {
      setLocalUpload(localUpload)
      console.log(upload.id + ": " + localUpload)
    })
  }, [upload.id])

  return (
    <div className="flex gap-4">
      <div className="flex w-3/4 flex-col gap-1 text-xs">
        <UploadStatus status={upload.status} />
        <span>{upload.id}</span>
        <span>{upload.s3Key}</span>
        <span>{upload.mimeType}</span>
        <span>{upload?.sizeBytes}</span>
        <span>{upload?.etag}</span>
      </div>
      <div className="flex w-1/4">
        {localUpload && (
          <img
            className="h-32 w-full object-contain"
            src={Capacitor.convertFileSrc(localUpload)}
            alt=""
          />
        )}
      </div>
    </div>
  )
}
