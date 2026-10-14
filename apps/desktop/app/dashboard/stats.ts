import type { Task, TaskListResponse } from "../api/tasks";

export type Status = "done" | "late" | "progress";

export function statusOf(task: Task, now = Date.now()): Status {
  if (task.done) return "done";
  if (task.scheduledAt && new Date(task.scheduledAt).getTime() < now) return "late";
  return "progress";
}

export function kpiFromCounts(counts: TaskListResponse["counts"]) {
  const pct = (n: number) => (counts.all === 0 ? 0 : Math.round((n / counts.all) * 100));
  return {
    total: counts.all,
    done: counts.done,
    late: counts.late,
    progress: counts.in_progress,
    pctDone: pct(counts.done),
    pctLate: pct(counts.late),
    pctProgress: pct(counts.in_progress),
  };
}

const DAY_LABELS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

/** Stacked counts per day for the next 7 rolling days (today included, oldest first). */
export function dailySeries(tasks: Task[], now = Date.now()) {
  const days: { label: string; date: string; done: number; progress: number; late: number }[] = [];
  for (let i = -4; i <= 6; i++) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    days.push({ label: `${DAY_LABELS[d.getDay()]} ${d.getDate()}`, date: d.toDateString(), done: 0, progress: 0, late: 0 });
  }
  for (const task of tasks) {
    if (!task.scheduledAt) continue;
    const d = new Date(task.scheduledAt);
    const day = days.find((x) => x.date === d.toDateString());
    if (!day) continue;
    const status = statusOf(task, now);
    if (status === "done") day.done++;
    else if (status === "late") day.late++;
    else day.progress++;
  }
  return days;
}

export function statusBreakdown(counts: TaskListResponse["counts"]) {
  const k = kpiFromCounts(counts);
  return [
    { status: "progress" as const, label: "En cours", count: k.progress, pct: k.pctProgress },
    { status: "done" as const, label: "Terminées", count: k.done, pct: k.pctDone },
    { status: "late" as const, label: "En retard", count: k.late, pct: k.pctLate },
  ];
}
