import type { z } from "zod"
import type { uploadStatusSchema } from "@/schemas/upload.schema"

const STATUS_COLORS: Record<z.infer<typeof uploadStatusSchema>, string> = {
  pending: "bg-chart-2 text-background",
  uploaded: "bg-chart-3 text-foreground",
  failed: "bg-chart-5 text-background",
  deleted: "bg-foreground text-background",
}

interface UploadStatusProps {
  status: z.infer<typeof uploadStatusSchema>
}

export default function UploadStatus({ status }: UploadStatusProps) {
  return (
    <span
      className={`w-fit rounded-full px-2 py-0.5 text-sm font-medium ${STATUS_COLORS[status]}`}
    >
      {status}
    </span>
  )
}
