import { CalendarBlankIcon } from "@phosphor-icons/react"
import { DatetimePicker } from "@capawesome-team/capacitor-datetime-picker"
import { format, isValid } from "date-fns"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"

type DateTimePickerProps = {
  id?: string
  name?: string
  required?: boolean
  value?: Date
  onChange: (date: Date | undefined) => void
  onBlur?: () => void
  invalid?: boolean
}

function DateTimePicker({
  id,
  name,
  required,
  value: rawValue,
  onChange,
  onBlur,
  invalid,
}: DateTimePickerProps) {
  const value = rawValue ? new Date(rawValue) : undefined

  async function openPicker() {
    try {
      const { value: result } = await DatetimePicker.present({
        mode: "datetime",
        value: value && isValid(value) ? value.toISOString() : undefined,
      })
      onChange(new Date(result))
    } catch {
      // ponytail: user canceled/dismissed the native picker, nothing to do
    }
  }

  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        name={name}
        required={required}
        readOnly
        placeholder="Sélectionner une date"
        value={value && isValid(value) ? format(value, "dd/MM/yyyy HH:mm") : ""}
        onClick={openPicker}
        onBlur={onBlur}
        aria-invalid={invalid}
      />
      <InputGroupAddon>
        <CalendarBlankIcon className="text-muted-foreground" />
      </InputGroupAddon>
    </InputGroup>
  )
}

export { DateTimePicker }
