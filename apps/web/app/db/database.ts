import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite"
import { Capacitor } from "@capacitor/core"
import {
  addRxPlugin,
  createRxDatabase,
  removeRxDatabase,
  type RxDatabase,
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

type TaskCheckpoint = { id: string; updatedAt: number }

const DEFAULT_UPDATED_AT = "2024-01-01T00:00:00+00:00"
const DEFAULT_ID = "00000000-0000-0000-0000-000000000000"
const BATCH_SIZE = 10

let storageInstance: RxStorage<any, any> | null = null

function getStorage(): RxStorage<any, any> {
  if (!storageInstance) {
    const sqlite = new SQLiteConnection(CapacitorSQLite)
    const sqliteStorage = getRxStorageSQLiteTrial({
      sqliteBasics: getSQLiteBasicsCapacitor(sqlite, Capacitor),
    })
    storageInstance = wrappedValidateAjvStorage({ storage: sqliteStorage })
  }
  return storageInstance
}

async function createDatabase(): Promise<RxDatabase> {
  console.log("Capacitor.getPlatform()", Capacitor.getPlatform())
  console.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform())

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

  const db = await createRxDatabase({
    name: "mydatabase",
    storage: getStorage(),
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
  await removeRxDatabase("mydatabase", getStorage())
}
