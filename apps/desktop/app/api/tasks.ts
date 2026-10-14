const BASE_URL = import.meta.env.VITE_BACK_URL as string;

export type Task = {
  id: string;
  name: string;
  scheduledAt: string | null;
  doneAt: string | null;
  done: boolean;
};

export type TaskListResponse = {
  items: Task[];
  page: number;
  perPage: number;
  total: number;
  counts: { all: number; done: number; late: number; in_progress: number };
};

export type TaskState = "all" | "in_progress" | "late" | "done";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`${init?.method ?? "GET"} ${path} failed: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function listTasks(
  state: TaskState = "all",
  page = 1,
  perPage = 100,
) {
  const params = new URLSearchParams({ state, page: String(page), perPage: String(perPage) });
  return request<TaskListResponse>(`/tasks?${params}`);
}

export function createTask(input: { name: string; scheduledAt: string | null }) {
  return request<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify({ name: input.name, scheduledAt: input.scheduledAt, done: false }),
  });
}

export function updateTask(id: string, patch: Pick<Task, "name" | "scheduledAt" | "doneAt" | "done">) {
  return request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(patch) });
}

export function deleteTask(id: string) {
  return request<void>(`/tasks/${id}`, { method: "DELETE" });
}

export function loadFixtures() {
  return request<{ tasks_created: number }>("/fixtures/load", { method: "POST" });
}
