import { FlaskIcon, SidebarSimpleIcon } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { useState } from "react"
import { toast } from "sonner"
import { createTask, loadFixtures } from "../api/tasks"

export function ManageSheet({ onChanged }: { onChanged: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [runningFixtures, setRunningFixtures] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Le nom est requis.")
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await createTask({
        name: trimmed,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      })
      setName("")
      setScheduledAt("")
      onChanged()
      toast.success("Tâche ajoutée")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleFixtures() {
    setRunningFixtures(true)
    try {
      const res = await loadFixtures()
      onChanged()
      toast.success(`${res.tasks_created} tâches générées`)
    } finally {
      setRunningFixtures(false)
      setOpen(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <SidebarSimpleIcon size={32} />
          Gestion
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">Gestion</SheetTitle>
          <SheetDescription>
            Ajouter une tâche ou générer des données de test.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
          <h3 className="text-sm font-medium">Ajouter une tâche</h3>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="task-name">Nom</FieldLabel>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <FieldError errors={error ? [{ message: error }] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="task-date">Prévu pour</FieldLabel>
            <Input
              id="task-date"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={submitting}>
            Ajouter
          </Button>
        </form>

        <div className="flex flex-col gap-2 border-t px-4 pt-4">
          <h3 className="text-sm font-medium">Données de test</h3>
          <Button
            variant="outline"
            className="h-auto justify-start gap-3 py-3 text-left"
            onClick={handleFixtures}
            disabled={runningFixtures}
          >
            <FlaskIcon className="size-5 shrink-0" />
            <span className="flex flex-col">
              <span className="font-medium">Lancer les fixtures</span>
              <FieldDescription className="text-wrap">
                Réinitialise la base et génère 20 tâches de démonstration.
              </FieldDescription>
            </span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
