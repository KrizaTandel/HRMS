import { useState } from "react"
import {
  Bell,
  Building2,
  Globe,
  KeyRound,
  Lock,
  Moon,
  Palette,
  Shield,
  Trash2,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { useTheme } from "@/hooks/use-theme"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Role } from "@/data/types"

function SettingSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card className="gap-0 p-0">
      <CardHeader className="flex-row items-center gap-3 border-b py-4">
        <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl">
          <Icon className="size-4" />
        </div>
        <div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-5 py-4">{children}</CardContent>
    </Card>
  )
}

function ToggleRow({
  label,
  description,
  defaultOn,
}: {
  label: string
  description: string
  defaultOn?: boolean
}) {
  const [on, setOn] = useState(defaultOn ?? false)
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  )
}

export function SettingsPage({ role }: { role: Role }) {
  const { user } = useAuth()
  const { getEmployee } = useData()
  const { theme, setTheme } = useTheme()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" })

  const employee = user ? getEmployee(user.id) : undefined

  const handlePassword = () => {
    if (!passwords.next || passwords.next.length < 6) {
      toast.error("Invalid password", { description: "New password must be at least 6 characters." })
      return
    }
    if (passwords.next !== passwords.confirm) {
      toast.error("Passwords don't match", { description: "Please confirm your new password." })
      return
    }
    toast.success("Password changed", { description: "You'll use the new password next time." })
    setPasswords({ current: "", next: "", confirm: "" })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences, notifications and security."
        breadcrumbs={[{ label: "General" }, { label: "Settings" }]}
      />

      <Card className="gap-0 overflow-hidden p-0">
        <div className="bg-gradient-to-r from-primary to-secondary h-20" />
        <CardContent className="px-6 pt-0 pb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar
                name={`${user?.firstName} ${user?.lastName}`}
                size="lg"
                className="-mt-8 size-20 text-2xl ring-4 ring-card shadow-lg"
              />
              <div className="pb-1">
                <p className="font-bold">{user?.firstName} {user?.lastName}</p>
                <p className="text-muted-foreground text-sm">
                  {employee?.designation} · {employee?.department}
                </p>
              </div>
            </div>
            <Badge variant={role === "admin" ? "secondary" : "info"} className="w-fit">
              {role === "admin" ? "Administrator" : "Employee"} account
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <SettingSection icon={Palette} title="Appearance" description="Customize how NexusHR looks">
          <div className="grid gap-1.5">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition-all",
                    theme === t
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:bg-muted text-muted-foreground border-transparent bg-muted/50"
                  )}
                >
                  {t === "light" ? <Moon className="size-4 rotate-0" /> : t === "dark" ? <Moon className="size-4" /> : <Globe className="size-4" />}
                  <span className="capitalize">{t}</span>
                </button>
              ))}
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Language</Label>
              <Select defaultValue="en">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="en-gb">English (UK)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Timezone</Label>
              <Select defaultValue="ct">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ct">Central Time (CT)</SelectItem>
                  <SelectItem value="et">Eastern Time (ET)</SelectItem>
                  <SelectItem value="pt">Pacific Time (PT)</SelectItem>
                  <SelectItem value="gmt">GMT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingSection>

        <SettingSection icon={Bell} title="Notifications" description="Choose what you want to be notified about">
          <div className="divide-y">
            <ToggleRow label="Email notifications" description="Important updates to your email" defaultOn />
            <ToggleRow label="Push notifications" description="Real-time alerts in the browser" defaultOn />
            <ToggleRow label="Weekly digest" description="Summary of your attendance and leaves" defaultOn />
            <ToggleRow label="Reminder for check-in" description="Nudge if you haven't clocked in" />
            <ToggleRow label="Product announcements" description="News about new features" />
          </div>
        </SettingSection>

        <SettingSection icon={Shield} title="Security" description="Change your password and review sessions">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label>Current password</Label>
              <Input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>New password</Label>
              <Input
                type="password"
                value={passwords.next}
                onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Confirm new</Label>
              <Input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat password"
              />
            </div>
          </div>
          <Button className="mt-4" onClick={handlePassword}>
            <KeyRound className="size-4" />
            Update Password
          </Button>
          <Separator className="my-4" />
          <ToggleRow label="Two-factor authentication" description="Require a code when signing in" defaultOn />
        </SettingSection>

        <div className="space-y-4">
          {role === "admin" && (
            <SettingSection icon={Building2} title="Company Settings" description="Organization-wide HR defaults">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Company name</Label>
                  <Input defaultValue="Nexus Technologies Inc." />
                </div>
                <div className="grid gap-1.5">
                  <Label>Domain</Label>
                  <Input defaultValue="nexushr.io" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Fiscal year starts</Label>
                  <Input type="month" defaultValue="2026-01" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Standard work hours</Label>
                  <Input defaultValue="40h / week" />
                </div>
              </div>
              <Button className="mt-4" variant="outline" onClick={() => toast.success("Company settings saved")}>
                Save Settings
              </Button>
            </SettingSection>
          )}

          <SettingSection icon={Lock} title="Danger Zone" description="Irreversible account actions">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Delete account</p>
                <p className="text-muted-foreground text-xs">
                  Permanently remove your account and all associated data.
                </p>
              </div>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete Account
              </Button>
            </div>
          </SettingSection>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete your account?"
        description="This action cannot be undone. All of your HR data will be permanently removed."
        confirmLabel="Delete account"
        destructive
        onConfirm={() => {
          setDeleteOpen(false)
          toast.error("Account deletion requested", {
            description: "Our team has received your request. It will be processed within 48 hours.",
          })
        }}
      />
    </div>
  )
}
