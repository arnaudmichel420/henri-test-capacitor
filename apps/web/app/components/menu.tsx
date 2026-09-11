import { GearIcon, HouseIcon, UploadIcon } from "@phosphor-icons/react"
import { useLocation, type Location } from "react-router"
import MenuItem from "./menu-item"

export default function Menu() {
  const location = useLocation()

  function isRouteActive(route: string, location: Location) {
    const normalize = (path: string) => path.replace(/\d+$/, "")
    return normalize(location.pathname) === normalize(route)
  }

  function isParentActive(
    route: string,
    childMenu: string[],
    location: Location
  ) {
    if (isRouteActive(route, location)) return true

    return childMenu?.some((child) => {
      return isRouteActive(child, location)
    })
  }
  return (
    <nav className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-primary p-1 text-background">
      <ul className="flex gap-3">
        <MenuItem
          isActive={isParentActive("/", ["/task", "/task/edit"], location)}
          to={"/"}
          Icon={HouseIcon}
        />
        <MenuItem
          isActive={isRouteActive("/upload", location)}
          to={"/upload"}
          Icon={UploadIcon}
        />
        <MenuItem
          isActive={isRouteActive("/setting", location)}
          to={"/setting"}
          Icon={GearIcon}
        />
      </ul>
    </nav>
  )
}