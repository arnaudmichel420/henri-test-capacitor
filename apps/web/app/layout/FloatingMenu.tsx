import Menu from "@/components/menu"
import { Outlet } from "react-router"

export default function FloatingMenu() {
  return (
    <div>
      <Outlet />
      <Menu />
    </div>
  )
}
