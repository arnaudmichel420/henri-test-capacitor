import BaseForm from "@/components/form-base"
import {
  DateTimePickerField,
  ImagePickerField,
  TextField,
} from "@/components/form-fields"
import {
  deleteFile,
  getTask,
  updateTask,
  type TaskDoc,
} from "@/db/queries/taskQuery"
import { Directory, Filesystem } from "@capacitor/filesystem"
import { Toast } from "@capacitor/toast"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@workspace/ui/components/button"
import { FieldGroup } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { z } from "zod"
import { taskUpdateSchema } from "../../store/useTaskStore"

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
  const [isSaving, setIsSaving] = useState<boolean>(false)

  useEffect(() => {
    if (!id) return
    getTask(id).then((task) => {
      if (!task) return
      setTask(task)
    })
  }, [])

  const defaultValues = useMemo(() => getDefaultValues(task), [task])

  const form = useForm({
    defaultValues: defaultValues,
    validators: {
      onSubmit: taskUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      if (!id) return
      setIsSaving(true)
      const parsedValue = taskUpdateSchema.parse(value)

      let path = ""
      if (parsedValue?.image) {
        path = await saveImageOnPhone(parsedValue.image)
      }

      await updateTask({
        id,
        name: parsedValue.name,
        date: parsedValue.date,
        image: path,
      })
      form.reset()
      Toast.show({ text: "Tâche modifier avec succès" })
      navigate(`/task/${id}`)
    },
  })

  async function saveImageOnPhone(path: string): Promise<string> {
    if (path.includes("/todoApp/")) return path

    try {
      await Filesystem.mkdir({
        path: "todoApp",
        directory: Directory.Documents,
        recursive: true,
      })
    } catch {
      // ponytail: le plugin Android renvoie "already exists" même avec recursive: true, on ignore
    }

    const result = await Filesystem.copy({
      from: path, // ou photo.uri selon le retour de Camera.getPhoto
      to: `todoApp/photo-${Date.now()}.jpg`,
      toDirectory: Directory.Documents,
    })

    await deleteFile(task?.image)

    return result.uri
  }

  return (
    <div>
      <div className="flex h-14 items-center justify-between bg-primary px-2">
        <Link to={`/task/${id}`}>
          <CaretLeftIcon color="var(--background)" className="size-8" />
        </Link>
      </div>
      {isSaving ? (
        <Spinner className="absolute top-1/2 left-1/2 size-10 -translate-1/2" />
      ) : (
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
                  {(field) => (
                    <DateTimePickerField field={field} label="Date" />
                  )}
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
      )}
    </div>
  )
}
