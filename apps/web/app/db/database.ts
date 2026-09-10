import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite"
import { Capacitor } from "@capacitor/core"
import {
  addRxPlugin,
  createRxDatabase,
  removeRxDatabase,
  type RxDatabase,
  type RxReplicationPullStreamItem,
  type RxStorage,
} from "rxdb/plugins/core"
import {
  getRxStorageSQLiteTrial,
  getSQLiteBasicsCapacitor,
} from "rxdb/plugins/storage-sqlite"
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv"
import { taskSchema } from "./schemas/task.schema"
import { RxDBMigrationSchemaPlugin } from "rxdb/plugins/migration-schema"
import { replicateRxCollection } from "rxdb/plugins/replication"
import type { TaskDoc } from "./queries/taskQuery"
import { Subject } from "rxjs"
import { RxDBCleanupPlugin } from "rxdb/plugins/cleanup"
import { secondsInHour, secondsInWeek } from "date-fns/constants"

type TaskCheckpoint = { id: string; updatedAt: number }

const DEFAULT_UPDATED_AT = "2024-01-01T00:00:00+00:00"
const DEFAULT_ID = "00000000-0000-0000-0000-000000000000"
const BATCH_SIZE = 10
const DB_NAME = "mydatabase"
const SQLITE_CONNECTION_NAME = "_trial_" + DB_NAME

const sqlite = new SQLiteConnection(CapacitorSQLite)

let storageInstance: RxStorage<any, any> | null = null

function getStorage(): RxStorage<any, any> {
  if (!storageInstance) {
    const sqliteStorage = getRxStorageSQLiteTrial({
      sqliteBasics: getSQLiteBasicsCapacitor(sqlite, Capacitor),
    })
    storageInstance = wrappedValidateAjvStorage({ storage: sqliteStorage })
  }
  return storageInstance
}

async function createDatabase(): Promise<RxDatabase> {
  //Ferme des connexions résiduelles hot-reload ou revenir sur l'app mise en arrière-plan
  await sqlite.closeConnection(SQLITE_CONNECTION_NAME, false).catch(() => {})

  if (import.meta.env.DEV) {
    /**
     * The dev-mode plugin adds many checks and validations.
     * Never use it in production because it slows down the database.
     * @link https://rxdb.info/dev-mode.html
     */
    const { RxDBDevModePlugin } = await import("rxdb/plugins/dev-mode")
    addRxPlugin(RxDBDevModePlugin)
  }

  addRxPlugin(RxDBMigrationSchemaPlugin)
  addRxPlugin(RxDBCleanupPlugin)

  const db = await createRxDatabase({
    name: DB_NAME,
    storage: getStorage(),
    cleanupPolicy: {
      minimumDeletedTime: 1000 * secondsInWeek, // purge après 7 jours
      minimumCollectionAge: 1000 * 60,
      runEach: 1000 * secondsInHour, // vérifie toutes les heures
    },
  })

  await db.addCollections({
    task: {
      schema: taskSchema,
      migrationStrategies: {
        // 1 means, this transforms data from version 0 to version 1
        1: function (oldDoc) {
          delete oldDoc.position
          return oldDoc
        },
        2: function (oldDoc) {
          delete oldDoc.position
          return oldDoc
        },
      },
    },
  })

  const myPullStream$ = new Subject<
    RxReplicationPullStreamItem<TaskDoc, TaskCheckpoint>
  >()
  const eventSource = new EventSource(
    `${import.meta.env.VITE_MERCURE_URL}?topic=tasks`,
    {
      // withCredentials: true,
    }
  )
  eventSource.onmessage = (event) => {
    const eventData = JSON.parse(event.data)
    myPullStream$.next({
      documents: eventData.documents,
      checkpoint: eventData.checkpoint,
    })
  }

  eventSource.onerror = () => myPullStream$.next("RESYNC")

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
        console.log(data)

        return {
          documents: data.documents,
          checkpoint: data.checkpoint,
        }
      },
      batchSize: BATCH_SIZE,
      stream$: myPullStream$.asObservable(),
    },
  })

  replicationState.error$.subscribe((error) =>
    console.error("replication error", error)
  )

  return db
}

// ponytail: kept on globalThis so Vite HMR reloading this module doesn't spawn
// a second db/replication instance on top of the still-open native connection
const globalForDb = globalThis as unknown as { dbPromise?: Promise<any> }

export function getDatabase() {
  if (!globalForDb.dbPromise) globalForDb.dbPromise = createDatabase()
  return globalForDb.dbPromise
}

export async function removeDatabase() {
  await removeRxDatabase(DB_NAME, getStorage())
}
