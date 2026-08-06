import { CaretLeftIcon, PencilIcon } from "@phosphor-icons/react"
import { useMemo } from "react"
import { Link, useParams } from "react-router"
import { taskStore } from "../../store/useTaskStore"
import { format } from "date-fns"

export default function Task() {
  const { id } = useParams()
  const tasks = taskStore((state) => state.tasks)

  const task = useMemo(() => tasks.find((task) => task.id === id), [id, tasks])
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
          {task.date && (
            <div className="text-sm font-light">
              {format(task.date, "dd/MM/yyyy hh:mm")}
            </div>
          )}
          {task.image && (
            <img src={task.image} alt="" className="w-full object-contain" />
          )}
        </div>
      ) : (
        <div className="text-2xl">Tache introuvable</div>
      )}
    </div>
  )
}
