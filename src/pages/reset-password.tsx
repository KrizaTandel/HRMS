import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  KeyRound,
  Loader2,
  Lock,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  findPasswordReset,
  passwordChecks,
  resetPassword,
} from "@/lib/accounts"
import type { PasswordCheck } from "@/lib/accounts"
import { cn } from "@/lib/utils"

type State = "loading" | "ready" | "invalid" | "expired"

const CHECKS: { key: keyof PasswordCheck; label: string }[] = [
  { key: "length", label: "At least 12 characters" },
  { key: "upper", label: "One uppercase letter" },
  { key: "lower", label: "One lowercase letter" },
  { key: "number", label: "One number" },
  { key: "special", label: "One special character" },
  { key: "noSpace", label: "No spaces" },
]

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const email = searchParams.get("email") ?? ""
  const [state, setState] = useState<State>("loading")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      const request = findPasswordReset(token)
      if (!request) {
        setState("invalid")
        return
      }
      if (new Date(request.expiresAt).getTime() < Date.now()) {
        setState("expired")
        return
      }
      setState("ready")
    }, 700)
    return () => clearTimeout(t)
  }, [token])

  const checks = passwordChecks(password)
  const passedCount = CHECKS.filter((c) => checks[c.key]).length

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!CHECKS.every((c) => checks[c.key])) return
    if (password !== confirm) {
      toast.error("Passwords do not match", {
        description: "Please re-enter your new password.",
      })
      return
    }
    setSubmitting(true)
    const result = await resetPassword(token, password)
    setSubmitting(false)
    if (result === "success") {
      toast.success("Password updated", {
        description: "You can now sign in with your new password.",
      })
      navigate("/password-updated", { replace: true })
    } else if (result === "expired") {
      setState("expired")
    } else {
      setState("invalid")
    }
  }

  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="bg-primary/15 pointer-events-none absolute -top-40 -left-40 size-[480px] rounded-full blur-[140px]" />
      <div className="bg-secondary/15 pointer-events-none absolute -right-32 -bottom-32 size-[420px] rounded-full blur-[140px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-6 sm:px-6">
        <header>
          <Link to="/">
            <Logo />
          </Link>
        </header>

        <main className="flex flex-1 items-center py-10">
          <div className="animate-fade-in-up glass w-full rounded-2xl p-8 shadow-card sm:p-10">
            <Link
              to="/login"
              className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Login
            </Link>

            {state === "loading" && (
              <div className="flex flex-col items-center py-10 text-center">
                <Loader2 className="text-primary size-10 animate-spin" />
                <h1 className="mt-5 text-lg font-bold">Checking your link…</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Please wait while we validate the reset link.
                </p>
              </div>
            )}

            {state === "invalid" && (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-xl">
                  <X className="size-10" />
                </span>
                <h1 className="mt-6 text-2xl font-bold">Invalid reset link</h1>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                  This password reset link is invalid or has already been used. Request a new one
                  to continue.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button asChild variant="outline">
                    <Link to="/forgot-password">Request new link</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/login">Back to Login</Link>
                  </Button>
                </div>
              </div>
            )}

            {state === "expired" && (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl">
                  <AlertTriangle className="size-10" />
                </span>
                <h1 className="mt-6 text-2xl font-bold">Reset link expired</h1>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                  This reset link is no longer valid. It expired after 24 hours. Request a fresh
                  link to reset your password.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button asChild variant="outline">
                    <Link to="/forgot-password">Request new link</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/login">Back to Login</Link>
                  </Button>
                </div>
              </div>
            )}

            {state === "ready" && (
              <div>
                <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                  <KeyRound className="size-6" />
                </span>
                <h1 className="mt-5 text-2xl font-bold tracking-tight">Choose a new password</h1>
                <p className="text-muted-foreground mt-1.5 text-sm">
                  Set a new password for{" "}
                  <span className="font-semibold text-foreground">{email || "your account"}</span>.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password">New password</Label>
                    <div className="relative">
                      <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter a strong password"
                        className="pl-9 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {CHECKS.map((c) => {
                      const ok = checks[c.key]
                      return (
                        <li
                          key={c.key}
                          className={cn(
                            "flex items-center gap-1.5 text-xs",
                            ok ? "text-success" : "text-muted-foreground"
                          )}
                        >
                          {ok ? <Check className="size-3.5" /> : <span className="size-3.5" />}
                          {c.label}
                        </li>
                      )
                    })}
                  </ul>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        passedCount <= 2
                          ? "bg-destructive"
                          : passedCount <= 4
                            ? "bg-warning"
                            : "bg-success"
                      )}
                      style={{ width: `${(passedCount / CHECKS.length) * 100}%` }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm">Confirm new password</Label>
                    <div className="relative">
                      <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <Input
                        id="confirm"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        className="pl-9"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={submitting || !CHECKS.every((c) => checks[c.key])}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Updating password...
                      </>
                    ) : (
                      <>
                        Update Password
                        <KeyRound className="size-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
