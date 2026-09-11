import { getTask, type TaskDoc } from "@/db/queries/taskQuery"
import { getLocalUpload, getUploadByTaskId } from "@/db/queries/uploadQuery"
import { Capacitor } from "@capacitor/core"
import { CaretLeftIcon, PencilIcon } from "@phosphor-icons/react"
import { Spinner } from "@workspace/ui/components/spinner"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"

export default function Task() {
  const { id } = useParams()
  const [task, setTask] = useState<TaskDoc>()
  const [localUpload, setLocalUpload] = useState<string>()

  useEffect(() => {
    if (!id) return
    getTask(id).then((task) => {
      if (!task) return
      setTask(task)
    })
    getUploadByTaskId(id).then((upload) => {
      if (!upload) return
      getLocalUpload(upload.id).then(setLocalUpload)
    })
  }, [])

  if (!task)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="size-10" />
      </div>
    )

  return (
    <div>
      <div className="flex h-14 items-center justify-between bg-primary px-2">
        <Link to="/">
          <CaretLeftIcon color="var(--background)" className="size-8" />
        </Link>
        <Link to={`/task/edit/${id}`}>
          <PencilIcon color="var(--background)" className="size-8" />
        </Link>
      </div>
      {task ? (
        <div className="flex flex-col gap-2 py-2">
          <div className="text-xl">{task.name}</div>
          <div className="text-sm font-light">{task.id}</div>
          {task.date && (
            <div className="text-sm font-light">
              {format(task.date, "dd/MM/yyyy hh:mm")}
            </div>
          )}
          {localUpload && (
            <img
              src={Capacitor.convertFileSrc(localUpload)}
              alt=""
              className="w-full object-contain"
            />
          )}
        </div>
      ) : (
        <div className="text-2xl">Tache introuvable</div>
      )}
    </div>
  )
}
