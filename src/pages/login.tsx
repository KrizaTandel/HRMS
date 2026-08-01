import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Logo } from "@/components/shared/logo"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const DEMO = {
  employee: {
    email: "sarah.mitchell@nexushr.io",
    password: "employee123",
    label: "Employee",
  },
  admin: {
    email: "david.carter@nexushr.io",
    password: "admin123",
    label: "Administrator",
  },
}

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const [role, setRole] = useState<"employee" | "admin">("employee")
  const [email, setEmail] = useState(DEMO.employee.email)
  const [password, setPassword] = useState(DEMO.employee.password)
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const switchRole = (r: "employee" | "admin") => {
    setRole(r)
    setError(null)
    setEmail(DEMO[r].email)
    setPassword(DEMO[r].password)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const session = await login(email, password)
      toast.success("Welcome back!", {
        description: `Signed in as ${session.firstName} ${session.lastName}.`,
      })
      navigate(session.role === "admin" ? "/admin" : "/employee", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const roleParam = searchParams.get("role")
    if (roleParam === "admin" || roleParam === "employee") {
      switchRole(roleParam)
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1") switchRole("employee")
      if (e.key === "2") switchRole("admin")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="bg-background relative flex min-h-screen overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="bg-primary/20 pointer-events-none absolute -top-40 -left-40 size-[480px] rounded-full blur-[140px]" />
      <div className="bg-secondary/20 pointer-events-none absolute -right-32 -bottom-32 size-[420px] rounded-full blur-[140px]" />
      <div className="bg-violet-400/10 pointer-events-none absolute top-1/3 left-1/2 size-[300px] rounded-full blur-[120px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col px-6 py-8 lg:flex-row lg:items-center lg:gap-16 lg:px-14">
        <div className="hidden flex-1 lg:block">
          <Link to="/" className="mb-12 inline-block" aria-label="NexusHR home">
            <Logo />
          </Link>
          <h1 className="text-4xl leading-tight font-bold tracking-tight xl:text-5xl">
            The HR platform your
            <br />
            team will <span className="text-gradient">actually love</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-md text-[15px] leading-relaxed">
            One workspace for attendance, leave, payroll and people operations.
            NexusHR keeps your workforce connected and your HR running smoothly.
          </p>

          <div className="mt-10 grid max-w-md grid-cols-2 gap-4">
            <div className="card-lift rounded-2xl border bg-card/70 p-4 shadow-card backdrop-blur">
              <div className="bg-primary/10 text-primary mb-2 flex size-9 items-center justify-center rounded-xl">
                <CalendarCheck className="size-4.5" />
              </div>
              <p className="text-2xl font-bold">
                <AnimatedCounter value={98} />
                <span className="text-primary text-base">%</span>
              </p>
              <p className="text-muted-foreground text-xs">Attendance accuracy</p>
            </div>
            <div className="card-lift rounded-2xl border bg-card/70 p-4 shadow-card backdrop-blur">
              <div className="bg-secondary/10 text-secondary mb-2 flex size-9 items-center justify-center rounded-xl">
                <Users className="size-4.5" />
              </div>
              <p className="text-2xl font-bold">
                <AnimatedCounter value={1200} />
                <span className="text-secondary text-base">+</span>
              </p>
              <p className="text-muted-foreground text-xs">Teams onboarded</p>
            </div>
            <div className="card-lift rounded-2xl border bg-card/70 p-4 shadow-card backdrop-blur">
              <div className="bg-success/10 text-success mb-2 flex size-9 items-center justify-center rounded-xl">
                <ShieldCheck className="size-4.5" />
              </div>
              <p className="text-2xl font-bold">SOC 2</p>
              <p className="text-muted-foreground text-xs">Enterprise grade security</p>
            </div>
            <div className="card-lift rounded-2xl border bg-card/70 p-4 shadow-card backdrop-blur">
              <div className="bg-warning/10 text-warning mb-2 flex size-9 items-center justify-center rounded-xl">
                <Wallet className="size-4.5" />
              </div>
              <p className="text-2xl font-bold">99.9%</p>
              <p className="text-muted-foreground text-xs">Uptime SLA</p>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="text-warning size-4" />
            Press{" "}
            <kbd className="bg-muted rounded-md border px-1.5 py-0.5 font-semibold">1</kbd>{" "}
            for Employee demo,{" "}
            <kbd className="bg-muted rounded-md border px-1.5 py-0.5 font-semibold">2</kbd>{" "}
            for Admin demo
          </div>
        </div>

        <div className="animate-fade-in-up relative flex flex-1 items-center justify-center lg:justify-end">
          <div className="glass relative w-full max-w-[440px] rounded-2xl p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.06] via-transparent to-secondary/[0.06]" />
            <div className="relative">
              <div className="mb-8 flex items-center justify-between lg:hidden">
                <Logo />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Sign in to access your HR workspace
              </p>

              <div className="bg-muted mt-6 grid grid-cols-2 gap-1 rounded-xl p-1">
                {(["employee", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => switchRole(r)}
                    className={cn(
                      "rounded-lg py-2 text-sm font-medium transition-all duration-200",
                      role === r
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {DEMO[r].label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-primary text-xs font-medium hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pr-10 pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="animate-scale-in flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={remember}
                      onCheckedChange={(v) => setRemember(v === true)}
                    />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-muted-foreground mt-6 text-center text-xs">
                Demo credentials are pre-filled. Try the{" "}
                <span className="font-semibold text-foreground">
                  {DEMO[role].label}
                </span>{" "}
                workspace or switch roles above.
              </p>

              <p className="text-muted-foreground mt-4 border-t pt-4 text-center text-sm">
                New to the portal?{" "}
                <Link to="/register" className="text-primary font-semibold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
