import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite"
import { Capacitor } from "@capacitor/core"
import {
  addRxPlugin,
  createRxDatabase,
  type RxDatabase,
} from "rxdb/plugins/core"
import {
  getRxStorageSQLiteTrial,
  getSQLiteBasicsCapacitor,
} from "rxdb/plugins/storage-sqlite"
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv"
import { taskSchema } from "./schemas/task.schema"
import { RxDBMigrationSchemaPlugin } from "rxdb/plugins/migration-schema"

async function createDatabase(): Promise<RxDatabase> {
  console.log("Capacitor.getPlatform()", Capacitor.getPlatform())
  console.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform())

  const sqlite = new SQLiteConnection(CapacitorSQLite)

  const sqliteStorage = getRxStorageSQLiteTrial({
    sqliteBasics: getSQLiteBasicsCapacitor(sqlite, Capacitor),
  })

  const storage = wrappedValidateAjvStorage({ storage: sqliteStorage })

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
    storage: storage,
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
      },
    },
  })

  return db
}

let dbPromise: null | Promise<any> = null

export function getDatabase() {
  if (!dbPromise) dbPromise = createDatabase()
  return dbPromise
}
