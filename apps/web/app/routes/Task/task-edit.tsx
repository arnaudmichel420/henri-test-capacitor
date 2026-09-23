import BaseForm from "@/components/form-base"
import {
  DateTimePickerField,
  ImagePickerField,
  TextField,
} from "@/components/form-fields"
import { getTask, updateTask, type TaskDoc } from "@/db/queries/taskQuery"
import {
  createLocalUpload,
  createUpload,
  deleteUploadsByTask,
  getLocalUpload,
  getUploadByTaskId,
} from "@/db/queries/uploadQuery"
import { taskUpdateSchema } from "@/schemas/task.schema"
import { uploadStatusSchema } from "@/schemas/upload.schema"
import { copyFileToFolder } from "@/utils/fileUtil"
import { Toast } from "@capacitor/toast"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@workspace/ui/components/button"
import { FieldGroup } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { v7 as uuidv7 } from "uuid"
import { z } from "zod"

function getDefaultValues(
  task: TaskDoc | undefined,
  image: string | undefined
): z.input<typeof taskUpdateSchema> & { image?: string } {
  return {
    name: task?.name ?? "",
    image,
    date: task?.date ? new Date(task.date) : undefined,
  }
}

export default function TaskEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState<TaskDoc>()
  const [image, setImage] = useState<string>()
  const [isSaving, setIsSaving] = useState<boolean>(false)

  useEffect(() => {
    if (!id) return
    getTask(id).then((task) => {
      if (!task) return
      setTask(task)
    })
    getUploadByTaskId(id).then(async (upload) => {
      if (!upload) return
      setImage(await getLocalUpload(upload.id))
    })
  }, [])

  const defaultValues = useMemo(
    () => getDefaultValues(task, image),
    [task, image]
  )

  const form = useForm({
    defaultValues: defaultValues,
    validators: {
      onSubmit: taskUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      if (!id) return
      setIsSaving(true)
      const parsedValue = taskUpdateSchema.parse(value)

      await updateTask({
        id,
        name: parsedValue.name,
        date: parsedValue.date,
      })

      if (value?.image && value.image !== image) {
        const uploadId = uuidv7()
        const path = await copyFileToFolder(
          value.image,
          "todoApp/upload",
          uploadId
        )

        if (image) {
          await deleteUploadsByTask(id)
        }

        await handleUpload(path, id, uploadId)
      }

      form.reset()
      Toast.show({ text: "Tâche modifier avec succès" })
      navigate(`/task/${id}`)
    },
  })

  async function handleUpload(path: string, taskId: string, uploadId: string) {
    await createLocalUpload(uploadId, { uploadPath: path })
    await createUpload({
      id: uploadId,
      taskId,
      s3Key: `uploads/${taskId}/${uploadId}.jpeg`,
      status: uploadStatusSchema.enum.pending,
      mimeType: "image/jpeg",
    })
  }

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
            <Button disabled={isSaving} type="submit" className="self-center">
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
