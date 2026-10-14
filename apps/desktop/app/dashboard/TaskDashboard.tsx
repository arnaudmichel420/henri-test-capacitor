import {
  CheckCircleIcon,
  ClockIcon,
  ListChecksIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
} from "recharts"
import type { TaskState } from "../api/tasks"
import { dailySeries, kpiFromCounts, statusBreakdown } from "./stats"
import { ManageSheet } from "./ManageSheet"
import { TaskTable } from "./TaskTable"
import { useTasks } from "./use-tasks"
import { cn } from "@workspace/ui/lib/utils"

const chartConfig = {
  done: { label: "Terminées", color: "var(--chart-3)" },
  progress: { label: "En cours", color: "var(--chart-2)" },
  late: { label: "En retard", color: "var(--chart-5)" },
} satisfies ChartConfig

export function TaskDashboard() {
  const [filter, setFilter] = useState<TaskState>("all")
  const {
    tasks,
    counts: apiCounts,
    toggleDone,
    remove,
    refresh,
  } = useTasks(filter)
  const counts = useMemo(() => kpiFromCounts(apiCounts), [apiCounts])
  const series = useMemo(() => dailySeries(tasks), [tasks])
  const breakdown = useMemo(() => statusBreakdown(apiCounts), [apiCounts])

  const kpis = [
    {
      label: "Total",
      value: counts.total,
      icon: ListChecksIcon,
      color: "text-foreground",
    },
    {
      label: "Terminées",
      value: counts.done,
      caption: `${counts.pctDone}%`,
      icon: CheckCircleIcon,
      color: "text-chart-3",
    },
    {
      label: "En cours",
      value: counts.progress,
      caption: `${counts.pctProgress}%`,
      icon: ClockIcon,
      color: "text-chart-2",
    },
    {
      label: "En retard",
      value: counts.late,
      caption: `${counts.pctLate}%`,
      icon: WarningCircleIcon,
      color: "text-chart-5",
    },
  ]

  const donutColors: Record<string, string> = {
    progress: "var(--chart-2)",
    done: "var(--chart-3)",
    late: "var(--chart-5)",
  }

  return (
    <div className="mx-auto flex max-w-(--breakpoint-xl) flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Henri · POC</p>
          <h1 className="font-serif text-5xl font-semibold">
            Suivi des tâches
          </h1>
        </div>
        <ManageSheet onChanged={refresh} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex flex-col gap-2 pt-6">
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className={cn(kpi.color)}>{kpi.label}</span>
                <kpi.icon className={`size-6 ${kpi.color}`} />
              </div>
              <div className="text-3xl font-semibold">{kpi.value}</div>
              {kpi.caption && (
                <p className="text-xs text-muted-foreground">
                  {kpi.caption} du total
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <Card className="flex-[2_1_520px]">
          <CardHeader>
            <CardTitle>Tâches par jour</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={series}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={({ x, y, payload }) => {
                    const isToday =
                      series[payload.index]?.date === new Date().toDateString()
                    return (
                      <text
                        x={x}
                        y={Number(y) + 12}
                        textAnchor="middle"
                        className={cn(
                          "text-xs",
                          isToday
                            ? "fill-destructive font-semibold"
                            : "fill-muted-foreground"
                        )}
                      >
                        {payload.value}
                      </text>
                    )
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="progress"
                  stackId="status"
                  fill="var(--color-progress)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="late"
                  stackId="status"
                  fill="var(--color-late)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="done"
                  stackId="status"
                  fill="var(--color-done)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="flex-[1_1_300px]">
          <CardHeader>
            <CardTitle>Répartition des statuts</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[220px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={breakdown}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={55}
                  outerRadius={85}
                >
                  {breakdown.map((entry) => (
                    <Cell key={entry.status} fill={donutColors[entry.status]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {breakdown.map((entry) => (
                <li
                  key={entry.status}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: donutColors[entry.status] }}
                    />
                    {entry.label}
                  </span>
                  <span className="text-muted-foreground">
                    {entry.count} · {entry.pct}%
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0">
        <CardHeader>
          <CardTitle>Liste des tâches</CardTitle>
          <CardDescription>
            Cochez une tâche pour la marquer comme terminée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskTable
            tasks={tasks}
            counts={apiCounts}
            filter={filter}
            onFilterChange={setFilter}
            onToggle={toggleDone}
            onDelete={remove}
          />
        </CardContent>
      </Card>
    </div>
  )
}
