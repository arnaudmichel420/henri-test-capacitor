import BaseForm from "@/components/form-base"
import { TextField } from "@/components/form-fields"
import {
  createTask,
  getTasks,
  setTaskDone,
  type TaskDoc,
} from "@/db/queries/taskQuery"
import { taskCreateSchema } from "@/schemas/task.schema"
import { getTaskStatus } from "@/utils/taskStatus"
import { Toast } from "@capacitor/toast"
import { PlusCircleIcon } from "@phosphor-icons/react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { FieldGroup } from "@workspace/ui/components/field"
import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useState } from "react"
import { Link } from "react-router"
import type { RxDocument } from "rxdb"
import type { Subscription } from "rxjs"

export default function Home() {
  const [tasks, setTasks] = useState<RxDocument<TaskDoc>[]>([])
  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: taskCreateSchema,
    },
    onSubmit: async ({ value }) => {
      await createTask({ name: value.name })
      form.reset()
      await Toast.show({ text: "Tâche ajoutée avec succès" })
    },
  })

  useEffect(() => {
    let subscription: Subscription
    getTasks().then((observable) => {
      subscription = observable.subscribe((tasks) => {
        setTasks(tasks)
      })
    })

    return () => subscription?.unsubscribe()
  }, [])

  return (
    <div className="flex flex-col gap-4 p-2">
      <h1 className="mt-2 text-center text-xl font-medium">Henri - POC</h1>
      <BaseForm form={form}>
        <FieldGroup className="flex-row justify-between gap-2">
          <form.Field name="name">
            {(field) => <TextField field={field} label="Tâche" required />}
          </form.Field>
          <Button type="submit" variant="ghost" className="self-end">
            <PlusCircleIcon className="size-8" color="var(--primary)" />
          </Button>
        </FieldGroup>
      </BaseForm>
      <div className="flex flex-col gap-2 pb-16">
        {tasks?.length > 0
          ? tasks.map((task) => {
              const status = getTaskStatus(task)
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded px-3 py-3",
                    status.bgClass
                  )}
                >
                  <Link to={"/task/" + task.id} className="w-full">
                    <div className="text-xl">{task.name}</div>
                    <div
                      className={cn(
                        "flex items-center gap-1 text-xs",
                        status.textClass
                      )}
                    >
                      <status.icon className="size-3.5" weight="fill" />
                      {status.label}
                    </div>
                  </Link>
                  <Checkbox
                    checked={task.done}
                    onCheckedChange={(checked) =>
                      setTaskDone(task, checked === true)
                    }
                  />
                </div>
              )
            })
          : "Ajouter un élément à la todo list"}
      </div>
    </div>
  )
}
