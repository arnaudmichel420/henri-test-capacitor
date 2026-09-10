import { z } from "zod"

export const uploadStatusSchema = z.enum([
  "pending",
  "uploaded",
  "failed",
  "deleted",
])

export const uploadSchema = z.object({
  id: z.uuidv7(),
  taskId: z.uuidv7(),
  s3Key: z.string(),
  status: uploadStatusSchema,
  mimeType: z.string(),
  sizeBytes: z.string(),
  etag: z.string().optional().nullable(),
})

export type Upload = z.infer<typeof uploadSchema>
export type Uploads = Upload[]
