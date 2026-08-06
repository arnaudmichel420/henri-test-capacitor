import { type RouteConfig, route, index } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("task/:id", "routes/task.tsx"),
  route("task/edit/:id", "routes/task-edit.tsx"),
] satisfies RouteConfig

// export default [
//     index("routes/home.tsx"),              // "/"
//     route("about", "routes/about.tsx"),    // "/about"
//     route("users/:id", "routes/user.tsx"), // "/users/:id" (param dynamique)

//     layout("routes/dashboard-layout.tsx", [ // wrapper commun (Outlet)
//       route("dashboard", "routes/dashboard.tsx"),
//       route("dashboard/settings", "routes/settings.tsx"),
//     ]),

//     ...prefix("admin", [                   // préfixe /admin sur tout le groupe
//       index("routes/admin/home.tsx"),
//       route("users", "routes/admin/users.tsx"),
//     ]),
//   ] satisfies RouteConfig
