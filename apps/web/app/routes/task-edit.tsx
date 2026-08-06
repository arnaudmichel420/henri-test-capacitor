import BaseForm from "@/components/form-base"
import {
  DateTimePickerField,
  ImagePickerField,
  TextField,
} from "@/components/form-fields"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@workspace/ui/components/button"
import { FieldGroup } from "@workspace/ui/components/field"
import { useMemo } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { z } from "zod"
import {
  taskStore,
  taskUpdateSchema,
  type Task,
} from "../../store/useTaskStore"
import { Toast } from "@capacitor/toast"

function getDefaultValues(task: Task): z.infer<typeof taskUpdateSchema> {
  return {
    name: task.name ?? "",
    image: task?.image,
    date: task?.date ?? new Date(),
  }
}

export default function TaskEdit() {
  const { id } = useParams()
  const tasks = taskStore((state) => state.tasks)
  const setTasks = taskStore((state) => state.setTasks)
  const navigate = useNavigate()

  const task = useMemo(
    () => tasks.find((task) => task.id === id) as Task,
    [id, tasks]
  )

  const form = useForm({
    defaultValues: getDefaultValues(task),
    validators: {
      onSubmit: taskUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      setTasks([
        ...tasks.filter((task) => task.id !== id),
        { id: task.id, name: value.name, image: value.image, date: value.date },
      ])
      form.reset()
      await Toast.show({ text: "Tâche modifier avec succès" })
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
              <form.Field name="date">
                {(field) => <DateTimePickerField field={field} label="Date" />}
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
