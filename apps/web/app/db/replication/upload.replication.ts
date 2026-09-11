import type { RxDatabase, RxReplicationPullStreamItem } from "rxdb/plugins/core"
import { replicateRxCollection } from "rxdb/plugins/replication"
import { Subject } from "rxjs"
import type { Upload } from "@/schemas/upload.schema"

type UploadCheckpoint = { id: string; updatedAt: number }

const DEFAULT_UPDATED_AT = "2024-01-01T00:00:00+00:00"
const DEFAULT_ID = "00000000-0000-0000-0000-000000000000"
const BATCH_SIZE = 10

export function replicateUploads(db: RxDatabase) {
  const pullStream$ = new Subject<
    RxReplicationPullStreamItem<Upload, UploadCheckpoint>
  >()

  const eventSource = new EventSource(
    `${import.meta.env.VITE_MERCURE_URL}?topic=uploads`
  )
  eventSource.onmessage = (event) => {
    const eventData = JSON.parse(event.data)
    pullStream$.next({
      documents: eventData.documents,
      checkpoint: eventData.checkpoint,
    })
  }
  eventSource.onerror = () => pullStream$.next("RESYNC")

  const replicationState = replicateRxCollection<Upload, UploadCheckpoint>({
    collection: db.upload,
    deletedField: "deleted",
    replicationIdentifier: "my-upload-http-replication",
    push: {
      async handler(changeRows) {
        const rawResponse = await fetch(
          `${import.meta.env.VITE_BACK_URL}/uploads/push`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(changeRows),
          }
        )
        const { conflicts } = await rawResponse.json()
        return conflicts
      },
    },
    pull: {
      async handler(checkpointOrNull, batchSize) {
        const updatedAt = checkpointOrNull
          ? checkpointOrNull.updatedAt
          : DEFAULT_UPDATED_AT
        const id = checkpointOrNull ? checkpointOrNull.id : DEFAULT_ID
        const url =
          `${import.meta.env.VITE_BACK_URL}/uploads/pull` +
          `?updatedAt=${encodeURIComponent(updatedAt)}` +
          `&id=${id}` +
          `&limit=${batchSize}`
        const response = await fetch(url)
        const data = await response.json()

        return {
          documents: data.documents,
          checkpoint: data.checkpoint,
        }
      },
      batchSize: BATCH_SIZE,
      stream$: pullStream$.asObservable(),
    },
  })

  replicationState.error$.subscribe((error) =>
    console.error("upload replication error", error)
  )

  return replicationState
}
