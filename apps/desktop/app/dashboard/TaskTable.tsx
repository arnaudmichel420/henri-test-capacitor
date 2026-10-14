import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import type { Task, TaskListResponse, TaskState } from "../api/tasks";
import { DeleteTaskDialog } from "./DeleteTaskDialog";
import { statusOf, type Status } from "./stats";

const STATUS_BADGE: Record<Status, { label: string; className: string }> = {
  progress: { label: "En cours", className: "bg-chart-2/15 text-chart-2" },
  done: { label: "Terminée", className: "bg-chart-3/15 text-chart-3" },
  late: { label: "En retard", className: "bg-chart-5/15 text-chart-5" },
};

export function TaskTable({
  tasks,
  counts,
  filter,
  onFilterChange,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  counts: TaskListResponse["counts"];
  filter: TaskState;
  onFilterChange: (filter: TaskState) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Tabs value={filter} onValueChange={(v) => onFilterChange(v as TaskState)} className="self-end -translate-y-full">
        <TabsList>
          <TabsTrigger value="all">Toutes {counts.all}</TabsTrigger>
          <TabsTrigger value="in_progress">En cours {counts.in_progress}</TabsTrigger>
          <TabsTrigger value="late">En retard {counts.late}</TabsTrigger>
          <TabsTrigger value="done">Terminées {counts.done}</TabsTrigger>
        </TabsList>
      </Tabs>

      {tasks.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Aucune tâche pour ce filtre.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Nom</TableHead>
              <TableHead>Prévu pour</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const status = statusOf(task);
              const badge = STATUS_BADGE[status];
              return (
                <TableRow key={task.id}>
                  <TableCell>
                    <Checkbox
                      checked={task.done}
                      onCheckedChange={() => onToggle(task.id)}
                      aria-label={task.done ? "Marquer non terminée" : "Marquer terminée"}
                    />
                  </TableCell>
                  <TableCell
                    className={task.done ? "text-muted-foreground line-through" : undefined}
                  >
                    {task.name}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {task.scheduledAt
                      ? new Date(task.scheduledAt).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={badge.className}>
                      {badge.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DeleteTaskDialog
                      taskName={task.name}
                      onConfirm={() => onDelete(task.id)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
