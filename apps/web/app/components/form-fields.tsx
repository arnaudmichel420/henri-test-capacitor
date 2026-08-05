import type { AnyFieldApi } from "@tanstack/react-form"

import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Switch } from "@workspace/ui/components/switch"
import { Textarea } from "@workspace/ui/components/textarea"

function fieldErrors(field: AnyFieldApi) {
  if (!field.state.meta.isTouched) return undefined
  return field.state.meta.errors.map((error) =>
    typeof error === "string" ? { message: error } : error
  )
}

function RequiredMark({ required }: { required?: boolean }) {
  if (!required) return null
  return <span className="text-destructive">*</span>
}

type TextFieldProps = Omit<
  React.ComponentProps<typeof Input>,
  "id" | "name" | "value" | "onChange" | "onBlur"
> & {
  field: AnyFieldApi
  label: string
  required?: boolean
}

function TextField({ field, label, required, ...props }: TextFieldProps) {
  const errors = fieldErrors(field)
  return (
    <Field data-invalid={!!errors?.length || undefined}>
      <FieldLabel htmlFor={field.name}>
        {label}
        <RequiredMark required={required} />
      </FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        required={required}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={!!errors?.length}
        {...props}
      />
      <FieldError errors={errors} />
    </Field>
  )
}

type TextareaFieldProps = Omit<
  React.ComponentProps<typeof Textarea>,
  "id" | "name" | "value" | "onChange" | "onBlur"
> & {
  field: AnyFieldApi
  label: string
  required?: boolean
}

function TextareaField({
  field,
  label,
  required,
  ...props
}: TextareaFieldProps) {
  const errors = fieldErrors(field)
  return (
    <Field data-invalid={!!errors?.length || undefined}>
      <FieldLabel htmlFor={field.name}>
        {label}
        <RequiredMark required={required} />
      </FieldLabel>
      <Textarea
        id={field.name}
        name={field.name}
        required={required}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={!!errors?.length}
        {...props}
      />
      <FieldError errors={errors} />
    </Field>
  )
}

type CheckboxFieldProps = Omit<
  React.ComponentProps<typeof Checkbox>,
  "id" | "name" | "checked" | "onCheckedChange" | "onBlur"
> & {
  field: AnyFieldApi
  label: string
  required?: boolean
}

function CheckboxField({
  field,
  label,
  required,
  ...props
}: CheckboxFieldProps) {
  const errors = fieldErrors(field)
  return (
    <Field orientation="horizontal" data-invalid={!!errors?.length || undefined}>
      <Checkbox
        id={field.name}
        name={field.name}
        required={required}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
        onBlur={field.handleBlur}
        aria-invalid={!!errors?.length}
        {...props}
      />
      <FieldLabel htmlFor={field.name}>
        {label}
        <RequiredMark required={required} />
      </FieldLabel>
      <FieldError errors={errors} />
    </Field>
  )
}

type SwitchFieldProps = Omit<
  React.ComponentProps<typeof Switch>,
  "id" | "name" | "checked" | "onCheckedChange" | "onBlur"
> & {
  field: AnyFieldApi
  label: string
  required?: boolean
}

function SwitchField({ field, label, required, ...props }: SwitchFieldProps) {
  const errors = fieldErrors(field)
  return (
    <Field orientation="horizontal" data-invalid={!!errors?.length || undefined}>
      <Switch
        id={field.name}
        name={field.name}
        required={required}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
        onBlur={field.handleBlur}
        aria-invalid={!!errors?.length}
        {...props}
      />
      <FieldLabel htmlFor={field.name}>
        {label}
        <RequiredMark required={required} />
      </FieldLabel>
      <FieldError errors={errors} />
    </Field>
  )
}

export { TextField, TextareaField, CheckboxField, SwitchField }
