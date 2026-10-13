import BaseForm from "@/components/form-base"
import { TextField } from "@/components/form-fields"
import {
  createTask,
  getTasks,
  updateTask,
  type TaskDoc,
} from "@/db/queries/taskQuery"
import { taskCreateSchema } from "@/schemas/task.schema"
import { Toast } from "@capacitor/toast"
import { PlusCircleIcon } from "@phosphor-icons/react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { FieldGroup } from "@workspace/ui/components/field"
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
      await Toast.show({ text: "Tâche ajoutée avec succès" })
      form.reset()
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

  async function markDone(task: RxDocument<TaskDoc>): Promise<void> {
    await updateTask({
      ...task.toJSON(),
      done: true,
      doneAt: new Date().toISOString(),
    })
  }

  return (
    <div className="flex flex-col gap-4 p-2">
      <h1 className="mt-2 text-center text-xl font-medium">
       Henri - POC
      </h1>
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
      <div className="flex flex-col gap-2">
        {tasks?.length > 0
          ? tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-2 px-2 pb-2 not-last:border-b"
              >
                <Link to={"/task/" + task.id} className="w-full">
                  {task.name}
                </Link>
                <Checkbox
                  checked={task.done}
                  onCheckedChange={() => markDone(task)}
                />
              </div>
            ))
          : "Ajouter un élément à la todo list"}
      </div>
    </div>
  )
}
