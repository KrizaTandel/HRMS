import { useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { navFor } from "@/config/navigation"
import type { Role } from "@/data/types"

export function DashboardLayout({ role }: { role: Role }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="bg-background min-h-screen">
      <Sidebar
        sections={navFor(role)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          collapsed ? "lg:pl-[76px]" : "lg:pl-64"
        )}
      >
        <Navbar
          onMenuClick={() => setMobileOpen(true)}
          onNavigate={(path) => navigate(path)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px] pb-16 lg:pb-0">
            <Outlet />
          </div>
        </main>
        <footer className="px-6 pb-20 pt-2 lg:pb-4">
          <p className="text-muted-foreground mx-auto max-w-[1440px] text-center text-[11px]">
            © {new Date().getFullYear()} NexusHR · Enterprise Human Resource Management
            System
          </p>
        </footer>
      </div>
      <MobileNav role={role} />
    </div>
  )
}
