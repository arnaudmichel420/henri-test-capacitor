import type { AnyFormApi } from "@tanstack/react-form"
import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

interface BaseFormProps {
  form: Pick<AnyFormApi, "handleSubmit" | "state">
  children: ReactNode
  className?: string
}

export default function BaseForm({ form, className, children }: BaseFormProps) {
  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={async (event) => {
        event.preventDefault()
        event.stopPropagation()
        await form.handleSubmit()
      }}
      noValidate
    >
      {children}
    </form>
  )
}
