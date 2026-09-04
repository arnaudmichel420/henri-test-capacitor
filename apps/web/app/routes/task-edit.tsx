import BaseForm from "@/components/form-base"
import {
  DateTimePickerField,
  ImagePickerField,
  TextField,
} from "@/components/form-fields"
import { getTask, updateTask, type TaskDoc } from "@/db/queries/taskQuery"
import { Toast } from "@capacitor/toast"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@workspace/ui/components/button"
import { FieldGroup } from "@workspace/ui/components/field"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { z } from "zod"
import { taskUpdateSchema, type Task } from "../../store/useTaskStore"

function getDefaultValues(
  task: TaskDoc | undefined
): z.input<typeof taskUpdateSchema> {
  return {
    name: task?.name ?? "",
    image: task?.image,
    date: task?.date ? new Date(task.date) : undefined,
  }
}

export default function TaskEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState<TaskDoc>()

  useEffect(() => {
    if (!id) return
    getTask(id).then((task) => setTask(task))
  }, [])

  const defaultValues = useMemo(() => getDefaultValues(task), [task])

  const form = useForm({
    defaultValues: defaultValues,
    validators: {
      onSubmit: taskUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      if (!id) return
      const parsedValue = taskUpdateSchema.parse(value)

      await updateTask({
        id,
        name: parsedValue.name,
        date: parsedValue.date,
        image: parsedValue.image,
      })
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
              {/* <form.Field name="position">
                {(field) => (
                  <PositionPickerField field={field} label="Position" />
                )}
              </form.Field> */}
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
