import { removeDatabase } from "@/db/database"
import { cleanupTombstone, deleteDirectory, writeBlobToFolder } from "@/utils/fileUtil"
import { Button } from "@workspace/ui/components/button"

export default function Setting() {
  return (
    <div className="flex flex-col gap-8 justify-center p-4">
      <Button
        onClick={() => {
          removeDatabase()
          deleteDirectory("todoApp")
          alert("Drop success")
        }}
      >
        Reset database
      </Button>
      <Button
        onClick={() => {
          cleanupTombstone()
        }}
      >
        cleanup file
      </Button>
      <Button
        onClick={() => {
          const blob = new Blob([crypto.randomUUID()])
          writeBlobToFolder(blob, "todoApp/save", crypto.randomUUID())
        }}
      >
        add random file to save
      </Button>
    </div>
  )
}
