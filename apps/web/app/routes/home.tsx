import BaseForm from "@/components/form-base"
import { TextField } from "@/components/form-fields"
import { Toast } from "@capacitor/toast"
import { PlusCircleIcon, TrashIcon } from "@phosphor-icons/react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@workspace/ui/components/button"
import { FieldGroup } from "@workspace/ui/components/field"
import { Link } from "react-router"
import { v7 as uuidv7 } from "uuid"
import { taskCreateSchema, taskStore } from "../../store/useTaskStore"
export default function Home() {
  const tasks = taskStore((state) => state.tasks)
  const setTasks = taskStore((state) => state.setTasks)

  const form = useForm({
    defaultValues: {
      id: uuidv7(),
      name: "",
    },
    validators: {
      onSubmit: taskCreateSchema,
    },
    onSubmit: async ({ value }) => {
      setTasks([...tasks, { id: value.id, name: value.name }])
      await Toast.show({ text: "Tâche ajoutée avec succès" })
      form.reset()
    },
  })

  async function removeTask(taskId: string): Promise<void> {
    setTasks(tasks.filter((task) => task.id !== taskId))
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
        {tasks.length > 0
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
