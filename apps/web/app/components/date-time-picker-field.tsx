import { ClockIcon } from "@phosphor-icons/react"
import {
  format,
  getHours,
  getMinutes,
  getSeconds,
  isValid,
  setHours,
  setMinutes,
  setSeconds,
} from "date-fns"

import { Calendar } from "@workspace/ui/components/calendar"
import { Input } from "@workspace/ui/components/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

type DateTimePickerProps = {
  id?: string
  name?: string
  required?: boolean
  value?: Date
  onChange: (date: Date | undefined) => void
  onBlur?: () => void
  invalid?: boolean
}

function toTimeString(date?: Date) {
  if (!date || !isValid(date)) return "00:00:00"
  return [getHours(date), getMinutes(date), getSeconds(date)]
    .map((n) => String(n).padStart(2, "0"))
    .join(":")
}

function DateTimePicker({
  id,
  name,
  required,
  value,
  onChange,
  onBlur,
  invalid,
}: DateTimePickerProps) {
  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) return onChange(undefined)
    let next: Date = selected
    if (value && isValid(value)) {
      next = setHours(next, getHours(value))
      next = setMinutes(next, getMinutes(value))
      next = setSeconds(next, getSeconds(value))
    }
    onChange(next)
  }

  const handleTimeChange = (time: string) => {
    const [hours, minutes, seconds] = time.split(":").map(Number)
    let next = value && isValid(value) ? value : new Date()
    next = setHours(next, hours ?? 0)
    next = setMinutes(next, minutes ?? 0)
    next = setSeconds(next, seconds ?? 0)
    onChange(next)
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Input
            id={id}
            name={name}
            required={required}
            readOnly
            placeholder="Sélectionner une date"
            value={value && isValid(value) ? format(value, "dd/MM/yyyy HH:mm") : ""}
            onBlur={onBlur}
            aria-invalid={invalid}
          />
        }
      />
      <PopoverContent align="start">
        <Calendar
          mode="single"
          selected={value && isValid(value) ? value : undefined}
          onSelect={handleDateSelect}
          className="p-0 w-full"
        />
        <InputGroup>
          <InputGroupInput
            type="time"
            step="1"
            value={toTimeString(value)}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
          <InputGroupAddon>
            <ClockIcon className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </PopoverContent>
    </Popover>
  )
}

export { DateTimePicker }
