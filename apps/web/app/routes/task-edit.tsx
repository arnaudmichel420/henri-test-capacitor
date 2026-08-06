import BaseForm from "@/components/form-base"
import { ImagePickerField, TextField } from "@/components/form-fields"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@workspace/ui/components/button"
import { FieldGroup } from "@workspace/ui/components/field"
import { useMemo } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { taskSchema, taskStore, type Task } from "../../store/useTaskStore"

function getDefaultValues(task: Task): Task {
  return {
    name: task.name ?? "",
    image: task?.image,
  }
}

export default function TaskEdit() {
  const { id } = useParams()
  const tasks = taskStore((state) => state.tasks)
  const setTasks = taskStore((state) => state.setTasks)
  const navigate = useNavigate()

  const task = useMemo(
    () => tasks.find((_, index) => index === Number(id)) as Task,
    [id, tasks]
  )

  const form = useForm({
    defaultValues: getDefaultValues(task),
    validators: {
      onSubmit: taskSchema,
    },
    onSubmit: async ({ value }) => {
      setTasks([
        ...tasks.filter((_, index) => index !== Number(id)),
        { name: value.name, image: value.image },
      ])
      form.reset()
      navigate(`/task/${id}`)
    },
  })

  return (
    <div>
      <div className="flex h-14 items-center justify-between bg-primary px-2">
        <Link to={`/task/${id}`}>
          <CaretLeftIcon color="var(--background)" className="size-8" />
        </Link>
      </div>
      <div className="p-2">
        {task ? (
          <BaseForm form={form}>
            <FieldGroup>
              <form.Field name="name">
                {(field) => <TextField field={field} label="Nom" required />}
              </form.Field>
              <form.Field name="image">
                {(field) => <ImagePickerField field={field} label="Image" />}
              </form.Field>
            </FieldGroup>
            <Button type="submit" className="self-center">
              Modifier la tache
            </Button>
          </BaseForm>
        ) : (
          <div className="text-2xl">Tache introuvable</div>
        )}
      </div>
    </div>
  )
}
