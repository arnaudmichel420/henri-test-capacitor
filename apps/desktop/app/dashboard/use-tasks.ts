import { useCallback, useEffect, useState } from "react";
import {
  deleteTask,
  listTasks,
  updateTask,
  type Task,
  type TaskListResponse,
  type TaskState,
} from "../api/tasks";

const EMPTY_COUNTS: TaskListResponse["counts"] = { all: 0, done: 0, late: 0, in_progress: 0 };

export function useTasks(state: TaskState = "all") {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listTasks(state, 1, 100);
      setTasks(res.items);
      setCounts(res.counts);
    } finally {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleDone = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const done = !task.done;
      await updateTask(id, {
        name: task.name,
        scheduledAt: task.scheduledAt,
        doneAt: done ? new Date().toISOString() : null,
        done,
      });
      await refresh();
    },
    [tasks, refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteTask(id);
      await refresh();
    },
    [refresh],
  );

  return { tasks, counts, loading, refresh, toggleDone, remove };
}
