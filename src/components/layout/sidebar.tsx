import { NavLink, useNavigate } from "react-router-dom"
import { ChevronsLeft, LogOut, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Logo } from "@/components/shared/logo"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { NavSection } from "@/config/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import { usePendingApprovalCount } from "@/lib/accounts"

interface SidebarProps {
  sections: NavSection[]
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({
  sections,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { user, logout } = useAuth()
  const { getEmployee } = useData()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const pendingApprovals = usePendingApprovalCount()
  const employee = user ? getEmployee(user.id) : undefined

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center px-5", collapsed && !mobileOpen ? "justify-center px-3" : "")}>
        {collapsed && !mobileOpen ? <LogoMarkOnly /> : <Logo dark />}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {sections.map((section, idx) => (
          <div key={section.title ?? idx}>
            {section.title && !(collapsed && !mobileOpen) && (
              <p className="text-sidebar-foreground/50 mb-2 px-3 text-[10px] font-semibold tracking-[0.14em] uppercase">
                {section.title}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onCloseMobile}
                    title={collapsed && !mobileOpen ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200",
                        collapsed && !mobileOpen && "justify-center px-2",
                        isActive
                          ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25"
                          : "text-sidebar-foreground hover:bg-white/[0.06] hover:text-white"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn("size-[18px] shrink-0 transition-transform", !isActive && "group-hover:scale-110")} />
                        {!(collapsed && !mobileOpen) && <span>{item.label}</span>}
                        {item.badgeKey === "approvals" &&
                          pendingApprovals > 0 &&
                          !(collapsed && !mobileOpen) && (
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                              {pendingApprovals}
                            </span>
                          )}
                        {isActive && !(collapsed && !mobileOpen) && (
                          <span className="absolute right-2.5 size-1.5 rounded-full bg-white/80" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={cn("border-t border-sidebar-border p-3", collapsed && !mobileOpen && "text-center")}>
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.05]",
            collapsed && !mobileOpen && "justify-center"
          )}
        >
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" className="shrink-0" />
          {!(collapsed && !mobileOpen) && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {employee?.designation ?? "Team member"}
              </p>
            </div>
          )}
          {!(collapsed && !mobileOpen) && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              className="text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Logout"
            >
              <LogOut className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-white shadow-2xl shadow-slate-950/30 transition-all duration-300",
          isDesktop
            ? cn("hidden lg:flex", collapsed ? "lg:w-[76px]" : "lg:w-64")
            : cn(
                "w-64 max-w-[85vw] lg:hidden",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              )
        )}
      >
        {sidebarContent}
      </aside>

      {isDesktop && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="fixed bottom-24 left-0 z-50 hidden h-7 w-7 items-center justify-center rounded-r-lg border border-l-0 border-sidebar-border bg-sidebar text-slate-400 transition-all hover:text-white lg:flex"
          style={{ left: collapsed ? 76 : 256 }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeft className={cn("size-3.5 transition-transform", collapsed && "rotate-180")} />
        </button>
      )}

      {mobileOpen && (
        <button
          type="button"
          onClick={onCloseMobile}
          className="fixed top-4 left-[260px] z-50 rounded-full bg-white/10 p-2 text-white backdrop-blur lg:hidden"
          aria-label="Close menu"
        >
          <X className="size-5" />
        </button>
      )}
    </>
  )
}

function LogoMarkOnly() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-8">
      <defs>
        <linearGradient id="sideg" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#sideg)" />
      <path d="M24 12 L34 20 V28 H32 V22 L24 16 L16 22 V28 H14 V20 Z" fill="#fff" />
      <rect x="14" y="28" width="20" height="3" rx="1.5" fill="#fff" />
      <rect x="22.5" y="31" width="3" height="6" rx="1.5" fill="#fff" />
    </svg>
  )
}
