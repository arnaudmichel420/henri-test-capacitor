import UploadItem from "@/components/upload-item"
import { getUploads } from "@/db/queries/uploadQuery"
import type { Uploads } from "@/schemas/upload.schema"
import { useEffect, useState } from "react"
import type { Subscription } from "rxjs"

export default function Upload() {
  const [uploads, setUploads] = useState<Uploads>([])

  useEffect(() => {
    let subscription: Subscription
    getUploads().then((observable) => {
      subscription = observable.subscribe((uploads) => {
        console.log(uploads)
        setUploads(uploads)
      })
    })

    return () => subscription?.unsubscribe()
  }, [])

  return (
    <div className="p-4 flex flex-col gap-2">
      {uploads.map((upload) => (
        <UploadItem key={upload.id} upload={upload} />
      ))}
    </div>
  )
}
