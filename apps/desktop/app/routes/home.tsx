import type { Route } from "./+types/home";
import { TaskDashboard } from "../dashboard/TaskDashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Henri · Panel de gestion" },
    { name: "description", content: "Suivi des tâches Henri" },
  ];
}

export default function Home() {
  return <TaskDashboard />;
}
