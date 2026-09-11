import { removeDatabase } from "@/db/database"
import { Button } from "@workspace/ui/components/button"

export default function Setting() {
  return (
    <div className="flex justify-center py-4">
      <Button
        onClick={() => {
          removeDatabase()
        }}
      >
        Reset database
      </Button>
    </div>
  )
}
