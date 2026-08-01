import * as React from "react"

import { cn } from "@/lib/utils"
import { initials } from "@/lib/format"

const AVATAR_GRADIENTS = [
  "from-blue-500 to-cyan-400",
  "from-violet-500 to-fuchsia-400",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-400",
  "from-rose-500 to-pink-400",
  "from-indigo-500 to-blue-400",
  "from-cyan-500 to-sky-400",
  "from-teal-500 to-emerald-400",
]

export function avatarGradient(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]
}

export interface AvatarProps extends React.ComponentProps<"div"> {
  name: string
  image?: string | null
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  ring?: boolean
}

const SIZE_MAP = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
}

function Avatar({ name, image, size = "md", ring = false, className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white select-none",
        SIZE_MAP[size],
        image
          ? ""
          : `bg-gradient-to-br ${avatarGradient(name)}`,
        ring && "ring-2 ring-white shadow-md dark:ring-slate-800",
        className
      )}
      {...props}
    >
      {image ? (
        <img src={image} alt={name} className="size-full object-cover" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  )
}

export { Avatar }
