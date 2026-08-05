import BaseForm from "@/components/form-base"
import { TextField } from "@/components/form-fields"
import { useForm } from "@tanstack/react-form"
import { Button } from "@workspace/ui/components/button"
import { FieldGroup } from "@workspace/ui/components/field"
import { useState } from "react"
import { PlusCircleIcon, TrashIcon } from "@phosphor-icons/react"

export default function Home() {
  const [taskList, setTaskList] = useState<string[]>([])

  const form = useForm({
    defaultValues: {
      name: "",
    },
    onSubmit: async ({ value }) => {
      if (value.name?.trim() === "")
        return alert("Vous devez renseigner une valeur")
      setTaskList((prev) => [...prev, value.name])
      form.reset()
    },
  })

  function removeTask(taskId: number): void {
    setTaskList((prev) => prev.filter((_, index) => index !== taskId))
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
        {taskList.length > 0
          ? taskList.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 not-last:border-b pb-2"
              >
                {task}
                <TrashIcon
                  size={24}
                  color="var(--destructive)"
                  onClick={() => removeTask(index)}
                />
              </div>
            ))
          : "Ajouter un élément à la todo list"}
      </div>
    </div>
  )
}
