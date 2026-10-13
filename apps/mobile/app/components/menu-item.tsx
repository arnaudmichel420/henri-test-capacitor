import { type Icon as PhosphorIcon } from "@phosphor-icons/react"
import { cn } from "@workspace/ui/lib/utils"
import { useState } from "react"
import { Link } from "react-router"

interface MenuItemProps {
  isActive: boolean
  Icon: PhosphorIcon
  to: string
}

export default function MenuItem({ isActive, to, Icon }: MenuItemProps) {
  const [isPressed, setIsPressed] = useState<boolean>(false)

  function animate() {
    setIsPressed(true)
    setTimeout(() => {
      setIsPressed(false)
    }, 300)
  }
  return (
    <li
      className={cn(
        isActive && "rounded-full bg-background text-primary",
        "p-3 transition-[scale] duration-300 ease-in-out active:scale-110",
        isPressed && "scale-110"
      )}
    >
      <Link to={to} onClick={animate}>
        <Icon weight="fill" className="size-8" />
      </Link>
    </li>
  )
}
