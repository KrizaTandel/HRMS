import { useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/format"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { useTheme } from "@/hooks/use-theme"

export function Navbar({
  onMenuClick,
  onNavigate,
}: {
  onMenuClick: () => void
  onNavigate: (path: string) => void
}) {
  const { user, isAdmin, logout } = useAuth()
  const { notifications, messages, markNotificationRead, markAllNotificationsRead, markMessageRead } = useData()
  const { resolvedTheme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const unreadNotifications = notifications.filter((n) => !n.read).length
  const unreadMessages = messages.filter((m) => !m.read).length

  const pageTitle = useMemo(() => {
    const seg = location.pathname.split("/").filter(Boolean)[1]
    const map: Record<string, string> = {
      dashboard: "Dashboard",
      profile: "My Profile",
      attendance: "Attendance",
      leaves: "Leave Management",
      payroll: "Payroll",
      reports: "Reports",
      employees: "Employees",
      settings: "Settings",
    }
    return map[seg ?? "dashboard"] ?? "Dashboard"
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    toast("Signed out", { description: "You have been logged out successfully." })
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      <div className="hidden sm:block">
        <p className="text-sm font-semibold">{pageTitle}</p>
        <p className="text-muted-foreground hidden text-xs md:block">
          {isAdmin ? "HR Administration Console" : "Employee Self Service"}
        </p>
      </div>

      <div className="relative ml-auto hidden max-w-xs flex-1 items-center md:flex lg:max-w-sm">
        <Search className="text-muted-foreground pointer-events-none absolute left-3 size-4" />
        <Input
          placeholder="Search employees, leave, payroll..."
          className="pl-9 pr-14"
          aria-label="Global search"
        />
        <kbd className="bg-muted text-muted-foreground pointer-events-none absolute right-3 rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="relative"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="size-[18px]" />
          ) : (
            <Moon className="size-[18px]" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="size-[18px]" />
              {unreadNotifications > 0 && (
                <span className="bg-destructive absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white shadow-sm">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[340px] p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Notifications</p>
                <p className="text-muted-foreground text-xs">
                  {unreadNotifications} unread
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={markAllNotificationsRead}
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </Button>
            </div>
            <Separator />
            <div className="max-h-[320px] overflow-y-auto">
              {notifications.slice(0, 6).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    markNotificationRead(n.id)
                    navigate(isAdmin ? "/admin/notifications" : "/employee/notifications")
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                    !n.read && "bg-primary/[0.04]"
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      n.tone === "success" && "bg-success",
                      n.tone === "info" && "bg-info",
                      n.tone === "warning" && "bg-warning",
                      n.tone === "danger" && "bg-destructive",
                      n.read && "bg-muted-foreground/30"
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">
                      {n.title}
                    </span>
                    <span className="text-muted-foreground mt-0.5 line-clamp-2 block text-xs">
                      {n.description}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-[10px]">
                      {timeAgo(n.time)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <Separator />
            <button
              type="button"
              onClick={() => navigate(isAdmin ? "/admin/notifications" : "/employee/notifications")}
              className="hover:bg-muted/60 text-primary w-full px-4 py-2.5 text-center text-xs font-semibold transition-colors"
            >
              View all notifications
            </button>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Messages">
              <MessageSquare className="size-[18px]" />
              {unreadMessages > 0 && (
                <span className="bg-secondary absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white shadow-sm">
                  {unreadMessages}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[320px] p-0">
            <div className="px-4 py-3">
              <p className="text-sm font-semibold">Messages</p>
              <p className="text-muted-foreground text-xs">{unreadMessages} unread</p>
            </div>
            <Separator />
            <div className="max-h-[320px] overflow-y-auto">
              {messages.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => markMessageRead(m.id)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60"
                >
                  <Avatar name={m.from} size="sm" className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-medium">{m.from}</span>
                      <span className="text-muted-foreground text-[10px]">
                        {timeAgo(m.time)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "text-muted-foreground mt-0.5 line-clamp-2 block text-xs",
                        !m.read && "text-foreground/90"
                      )}
                    >
                      {m.text}
                    </span>
                  </span>
                  {!m.read && <span className="bg-primary mt-2 size-1.5 shrink-0 rounded-full" />}
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full p-0.5 transition-opacity hover:opacity-80"
              aria-label="Account menu"
            >
              <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" ring />
              <ChevronDown className="text-muted-foreground hidden size-3.5 sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-3 p-3">
              <Avatar name={`${user?.firstName} ${user?.lastName}`} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {isAdmin ? "Administrator" : "Employee"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate(isAdmin ? "/admin/profile" : "/employee/profile")}>
              <User className="size-4" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate(isAdmin ? "/admin/settings" : "/employee/settings")}>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
