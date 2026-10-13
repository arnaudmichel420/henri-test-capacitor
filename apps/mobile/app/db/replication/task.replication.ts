import type { RxDatabase, RxReplicationPullStreamItem } from "rxdb/plugins/core"
import { replicateRxCollection } from "rxdb/plugins/replication"
import { Subject } from "rxjs"
import type { TaskDoc } from "../queries/taskQuery"

type TaskCheckpoint = { id: string; updatedAt: number }

const DEFAULT_UPDATED_AT = "2024-01-01T00:00:00+00:00"
const DEFAULT_ID = "00000000-0000-0000-0000-000000000000"
const BATCH_SIZE = 10

export function replicateTasks(db: RxDatabase) {
  const pullStream$ = new Subject<
    RxReplicationPullStreamItem<TaskDoc, TaskCheckpoint>
  >()

  const eventSource = new EventSource(
    `${import.meta.env.VITE_MERCURE_URL}?topic=tasks`
  )
  eventSource.onmessage = (event) => {
    const eventData = JSON.parse(event.data)
    pullStream$.next({
      documents: eventData.documents,
      checkpoint: eventData.checkpoint,
    })
  }
  eventSource.onerror = () => pullStream$.next("RESYNC")

  const replicationState = replicateRxCollection<TaskDoc, TaskCheckpoint>({
    collection: db.task,
    deletedField: "deleted",
    replicationIdentifier: "my-http-replication",
    push: {
      async handler(changeRows) {
        const rawResponse = await fetch(
          `${import.meta.env.VITE_BACK_URL}/tasks/push`,
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
          `${import.meta.env.VITE_BACK_URL}/tasks/pull` +
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
    console.error("task replication error", error)
  )

  return replicationState
}
