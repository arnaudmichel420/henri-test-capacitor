import type { TaskDoc } from "@/db/queries/taskQuery"
import {
  CheckCircleIcon,
  ClockCountdownIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"

export function getTaskStatus(task: Pick<TaskDoc, "done" | "scheduledAt">) {
  if (task.done)
    return {
      label: "Terminée",
      icon: CheckCircleIcon,
      bgClass: "bg-chart-3/10",
      textClass: "text-chart-3",
    }

  if (task.scheduledAt && new Date(task.scheduledAt) < new Date())
    return {
      label: "En retard",
      icon: WarningCircleIcon,
      bgClass: "bg-chart-5/10",
      textClass: "text-chart-5",
    }

  return {
    label: "En cours",
    icon: ClockCountdownIcon,
    bgClass: "bg-chart-2/10",
    textClass: "text-chart-2",
  }
}
