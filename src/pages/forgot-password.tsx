import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordReset } from "@/lib/accounts"

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [demoLink, setDemoLink] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    setTimeout(() => {
      const request = requestPasswordReset(email)
      if (!request) {
        setError("No account found with this email address.")
        setSubmitting(false)
        return
      }
      const base = `${window.location.origin}${window.location.pathname}`
      setDemoLink(`${base}#/reset-password?token=${request.token}&email=${encodeURIComponent(request.email)}`)
      setSent(true)
      setSubmitting(false)
    }, 800)
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

            {sent ? (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-xl">
                  <CheckCircle2 className="size-10" />
                </span>
                <h1 className="mt-6 text-2xl font-bold">Check your inbox</h1>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                  If an account exists for{" "}
                  <span className="font-semibold text-foreground">{email.trim()}</span>, a password
                  reset link has been sent. The link expires in 24 hours.
                </p>

                {demoLink && (
                  <div className="mt-6 w-full overflow-hidden rounded-2xl border border-blue-200/70 bg-blue-50/70 dark:border-blue-500/20 dark:bg-blue-500/10">
                    <div className="flex items-center gap-2 border-b border-blue-200/60 px-4 py-3 text-sm font-bold text-blue-700 dark:border-blue-500/15 dark:text-blue-300">
                      <Mail className="size-4" /> Demo reset link
                    </div>
                    <div className="p-4">
                      <a
                        href={demoLink}
                        className="text-primary flex items-start gap-1.5 break-all rounded-xl border border-blue-200/70 bg-white/80 px-3 py-2.5 text-[13px] font-medium hover:underline dark:border-blue-500/25 dark:bg-slate-900/40"
                      >
                        <KeyRound className="mt-0.5 size-4 shrink-0" />
                        <span>{demoLink}</span>
                      </a>
                      <p className="text-muted-foreground mt-3 text-[11px]">
                        In production this arrives in your inbox. Clicking the link opens the reset
                        password page.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                  <Button variant="outline" className="gap-2" onClick={() => setSent(false)}>
                    Try another email
                  </Button>
                  <Button asChild className="gap-2">
                    <Link to="/login">
                      Back to Login <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                  <KeyRound className="size-6" />
                </span>
                <h1 className="mt-5 text-2xl font-bold tracking-tight">Forgot your password?</h1>
                <p className="text-muted-foreground mt-1.5 text-sm">
                  Enter your registered email and we'll send you a link to reset your password.
                </p>

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

                  {error && (
                    <div className="animate-scale-in rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Sending link...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-muted-foreground mt-6 text-center text-xs">
                  Remembered it?{" "}
                  <Link to="/login" className="text-primary font-semibold hover:underline">
                    Back to Login
                  </Link>
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
