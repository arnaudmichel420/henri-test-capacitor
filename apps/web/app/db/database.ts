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
import { RxDBCleanupPlugin } from "rxdb/plugins/cleanup"
import { secondsInHour, secondsInWeek } from "date-fns/constants"
import { uploadSchema } from "./schemas/upload.schema"
import { replicateTasks } from "./replication/task.replication"
import { replicateUploads } from "./replication/upload.replication"
import replicateFile from "./replication/file.replication"

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
        3: function (oldDoc) {
          delete oldDoc.image
          return oldDoc
        },
      },
    },
    upload: {
      schema: uploadSchema,
      localDocuments: true,
    },
  })

  replicateTasks(db)
  replicateUploads(db)
  replicateFile()

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
