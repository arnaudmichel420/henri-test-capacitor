import BaseForm from "@/components/form-base"
import { TextField } from "@/components/form-fields"
import { createTask, deleteTask, getTasks } from "@/db/queries/taskQuery"
import { Toast } from "@capacitor/toast"
import { PlusCircleIcon, TrashIcon } from "@phosphor-icons/react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@workspace/ui/components/button"
import { FieldGroup } from "@workspace/ui/components/field"
import { useEffect, useState } from "react"
import { Link } from "react-router"
import type { Subscription } from "rxjs"
import { v7 as uuidv7 } from "uuid"
import { taskCreateSchema } from "../../store/useTaskStore"
import type { Tasks } from "../../store/useTaskStore"

export default function Home() {
  // const tasks = taskStore((state) => state.tasks)
  // const setTasks = taskStore((state) => state.setTasks)
  const [tasks, setTasks] = useState<Tasks>([])
  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: taskCreateSchema,
    },
    onSubmit: async ({ value }) => {
      // setTasks([...tasks, { id: value.id, name: value.name }])
      await createTask({ name: value.name })
      await Toast.show({ text: "Tâche ajoutée avec succès" })
      form.reset()
    },
  })

  useEffect(() => {
    let subscription: Subscription
    getTasks().then((observable) => {
      subscription = observable.subscribe((tasks) => {
        console.log(tasks)
        setTasks(tasks)
      })
    })

    return () => subscription?.unsubscribe()
  }, [])

  async function removeTask(taskId: string): Promise<void> {
    await deleteTask(taskId)
    await Toast.show({ text: "Tâche supprimée avec succès" })
  }

  return (
    <div className="flex flex-col gap-4 p-2">
      <h1 className="mt-2 text-center text-xl font-medium">
        Welcome to the best todo-list ever created
      </h1>
      <BaseForm form={form}>
        <FieldGroup className="flex-row justify-between gap-2">
          <form.Field name="name">
            {(field) => <TextField field={field} label="Todo" required />}
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
                className="flex items-center justify-between gap-2 pb-2 not-last:border-b"
              >
                <Link to={"/task/" + task.id} className="w-full">
                  {task.name}
                </Link>
                <TrashIcon
                  size={24}
                  color="var(--destructive)"
                  onClick={() => removeTask(task.id)}
                />
              </div>
            ))
          : "Ajouter un élément à la todo list"}
      </div>
    </div>
  )
}
