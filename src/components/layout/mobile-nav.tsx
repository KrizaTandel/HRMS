import { NavLink } from "react-router-dom"
import {
  CalendarCheck,
  LayoutDashboard,
  User,
  Users,
  Wallet,
} from "lucide-react"

import { cn } from "@/lib/utils"

const ITEMS = [
  { label: "Home", to: "/employee", icon: LayoutDashboard, end: true },
  { label: "Attendance", to: "/employee/attendance", icon: CalendarCheck },
  { label: "Payroll", to: "/employee/payroll", icon: Wallet },
  { label: "Profile", to: "/employee/profile", icon: User },
]

const ADMIN_ITEMS = [
  { label: "Home", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Employees", to: "/admin/employees", icon: Users },
  { label: "Attendance", to: "/admin/attendance", icon: CalendarCheck },
  { label: "Payroll", to: "/admin/payroll", icon: Wallet },
  { label: "Profile", to: "/admin/profile", icon: User },
]

export function MobileNav({ role }: { role: "employee" | "admin" }) {
  const items = role === "admin" ? ADMIN_ITEMS : ITEMS
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/90 backdrop-blur-xl lg:hidden"
      aria-label="Mobile navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-all",
                    isActive && "bg-primary/10"
                  )}
                >
                  <item.icon className="size-[18px]" />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
