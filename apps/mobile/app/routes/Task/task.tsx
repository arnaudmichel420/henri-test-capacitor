import { getTask$, setTaskDone, type TaskDoc } from "@/db/queries/taskQuery"
import { getLocalUpload, getUploadByTaskId } from "@/db/queries/uploadQuery"
import { getTaskStatus } from "@/utils/taskStatus"
import { Capacitor } from "@capacitor/core"
import { CalendarBlankIcon, CaretLeftIcon, PencilIcon } from "@phosphor-icons/react"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import type { RxDocument } from "rxdb"
import type { Subscription } from "rxjs"

export default function Task() {
  const { id } = useParams()
  const [task, setTask] = useState<RxDocument<TaskDoc>>()
  const [localUpload, setLocalUpload] = useState<string>()

  useEffect(() => {
    if (!id) return
    let subscription: Subscription
    getTask$(id).then((observable) => {
      subscription = observable.subscribe((task) => {
        if (!task) return
        setTask(task)
      })
    })
    getUploadByTaskId(id).then((upload) => {
      if (!upload) return
      getLocalUpload(upload.id).then(setLocalUpload)
    })

    return () => subscription?.unsubscribe()
  }, [id])

  async function markDone(checked: boolean | "indeterminate"): Promise<void> {
    if (!task) return
    await setTaskDone(task, checked === true)
  }

  if (!task)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="size-10" />
      </div>
    )

  const status = getTaskStatus(task)

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
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <h1
              className={cn(
                "font-serif text-3xl font-bold",
                task.done && "text-muted-foreground line-through",
              )}
            >
              {task.name}
            </h1>
            <label className="flex items-center gap-2 rounded border border-input px-3 py-1.5">
              <Checkbox checked={task.done} onCheckedChange={markDone} />
              <span className="text-sm text-muted-foreground">Terminé</span>
            </label>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 rounded px-3 py-2",
              status.bgClass,
              status.textClass,
            )}
          >
            <status.icon className="size-5" weight="fill" />
            <span className="text-sm font-medium">{status.label}</span>
          </div>

          {task.scheduledAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarBlankIcon className="size-4" />
              {format(task.scheduledAt, "dd/MM/yyyy HH:mm")}
            </div>
          )}

          {localUpload && (
            <img
              src={Capacitor.convertFileSrc(localUpload)}
              alt=""
              className="w-full rounded object-contain shadow-sm"
            />
          )}
        </div>
      ) : (
        <div className="text-2xl">Tache introuvable</div>
      )}
    </div>
  )
}
