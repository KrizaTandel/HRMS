import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MailOpen,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  findAccountByEmail,
  resendVerification,
  verifyAccount,
} from "@/lib/accounts"
import type { RegistrationAccount } from "@/data/types"

type PageState =
  | "processing"
  | "success"
  | "invalid"
  | "expired"
  | "pending"
  | "idle"

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const emailParam = searchParams.get("email")
  const [state, setState] = useState<PageState>("processing")
  const [account, setAccount] = useState<RegistrationAccount | null>(null)
  const [resendEmail, setResendEmail] = useState(emailParam ?? "")
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) {
      if (emailParam) {
        const acc = findAccountByEmail(emailParam)
        setAccount(acc ?? null)
        setState("pending")
      } else {
        setState("idle")
      }
      return
    }
    setState("processing")
    const t = setTimeout(() => {
      const res = verifyAccount(token)
      if (res.reason === "success") {
        setAccount(res.account ?? null)
        setState("success")
      } else {
        setAccount(findAccountByEmail(emailParam ?? "") ?? null)
        setState(res.reason)
      }
    }, 900)
    return () => clearTimeout(t)
  }, [token, emailParam])

  const verificationLink = useMemo(() => {
    if (!account) return ""
    const url = new URL(window.location.href)
    url.pathname = "/verify-email"
    url.searchParams.set("token", account.verificationToken)
    url.searchParams.set("email", account.email)
    return url.toString()
  }, [account])

  const resend = (e?: FormEvent) => {
    e?.preventDefault()
    const acc = findAccountByEmail(resendEmail)
    if (!acc) {
      toast.error("Email not found", {
        description: "No registration found for this email address.",
      })
      return
    }
    setResending(true)
    setTimeout(() => {
      const updated = resendVerification(acc.id)
      if (updated) {
        setAccount(updated)
        setState("pending")
        toast.success("Verification email sent", {
          description: `A fresh verification link was sent to ${updated.email}.`,
        })
      }
      setResending(false)
    }, 700)
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
            <AnimatePresence mode="wait">
              {state === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-10 text-center"
                >
                  <Loader2 className="text-primary size-10 animate-spin" />
                  <h1 className="mt-5 text-lg font-bold">Verifying your email…</h1>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Please wait while we confirm your link.
                  </p>
                </motion.div>
              )}

              {state === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-4 text-center"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-xl"
                  >
                    <CheckCircle2 className="size-10" />
                  </motion.span>
                  <h1 className="mt-6 text-2xl font-bold">Email verified successfully</h1>
                  <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                    {account ? (
                      <>
                        Great, <span className="font-semibold text-foreground">{account.email}</span>{" "}
                        is confirmed. Your account now awaits{" "}
                        <span className="font-semibold text-foreground">HR approval</span> — you'll
                        be able to sign in once it's approved.
                      </>
                    ) : (
                      "Your email address has been confirmed. Your account now awaits HR approval."
                    )}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                    <Clock className="size-3.5" /> Status: Pending HR Approval
                  </div>
                  <Button asChild className="mt-7 gap-2">
                    <Link to="/login">
                      Go to Login <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </motion.div>
              )}

              {(state === "invalid" || state === "expired") && (
                <motion.div
                  key={state}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-4 text-center"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-xl"
                  >
                    <XCircle className="size-10" />
                  </motion.span>
                  <h1 className="mt-6 text-2xl font-bold">
                    {state === "expired" ? "Verification link expired" : "Verification failed"}
                  </h1>
                  <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                    {state === "expired"
                      ? "This verification link is no longer valid. Request a new one to continue."
                      : "The verification link is invalid or has already been used."}
                  </p>
                  <form onSubmit={resend} className="mt-6 w-full max-w-xs space-y-3">
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="resend-email">Registered email</Label>
                      <div className="relative">
                        <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                          id="resend-email"
                          type="email"
                          className="pl-9"
                          value={resendEmail}
                          onChange={(e) => setResendEmail(e.target.value)}
                          placeholder="you@company.com"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={resending} className="w-full gap-2">
                      {resending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="size-4" />
                      )}
                      Resend Verification Email
                    </Button>
                  </form>
                  <Button asChild variant="ghost" className="mt-3 gap-2">
                    <Link to="/login">Back to login</Link>
                  </Button>
                </motion.div>
              )}

              {state === "pending" && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="py-2"
                >
                  <div className="flex flex-col items-center text-center">
                    <motion.span
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity }}
                      className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-xl"
                    >
                      <MailOpen className="size-10" />
                    </motion.span>
                    <h1 className="mt-6 text-2xl font-bold">Check your inbox</h1>
                    <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                      A verification email was sent to{" "}
                      <span className="font-semibold text-foreground">
                        {account?.email ?? emailParam}
                      </span>
                      . Your account remains inactive until your email is verified.
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                      <Clock className="size-3.5" /> Status: Pending Email Verification
                    </div>
                  </div>

                  {account && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-blue-200/70 bg-blue-50/70 dark:border-blue-500/20 dark:bg-blue-500/10">
                      <div className="flex items-center gap-2 border-b border-blue-200/60 px-4 py-3 text-sm font-bold text-blue-700 dark:border-blue-500/15 dark:text-blue-300">
                        <Mail className="size-4" /> Demo verification link
                      </div>
                      <div className="p-4">
                        <a
                          href={verificationLink}
                          className="text-primary flex items-start gap-1.5 break-all rounded-xl border border-blue-200/70 bg-white/80 px-3 py-2.5 text-[13px] font-medium hover:underline dark:border-blue-500/25 dark:bg-slate-900/40"
                        >
                          <Mail className="mt-0.5 size-4 shrink-0" />
                          <span>{verificationLink}</span>
                        </a>
                        <p className="text-muted-foreground mt-3 text-[11px]">
                          In production this arrives in your inbox. Clicking the link verifies your
                          account instantly.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Button onClick={() => resend()} disabled={!account || resending} variant="outline" className="gap-2">
                      <RefreshCw className={resending ? "size-4 animate-spin" : "size-4"} />
                      Resend Email
                    </Button>
                    <Button asChild className="gap-2">
                      <Link to="/login">
                        Go to Login <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              )}

              {state === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-4 text-center"
                >
                  <span className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-xl">
                    <AlertTriangle className="size-10" />
                  </span>
                  <h1 className="mt-6 text-2xl font-bold">Verify your email</h1>
                  <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                    Enter the email you registered with and we'll send you a fresh verification
                    link.
                  </p>
                  <form onSubmit={resend} className="mt-6 w-full max-w-xs space-y-3">
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="email-idle">Registered email</Label>
                      <div className="relative">
                        <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                          id="email-idle"
                          type="email"
                          className="pl-9"
                          value={resendEmail}
                          onChange={(e) => setResendEmail(e.target.value)}
                          placeholder="you@company.com"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={resending} className="w-full gap-2">
                      {resending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="size-4" />
                      )}
                      Send Verification Link
                    </Button>
                  </form>
                  <Button asChild variant="ghost" className="mt-3 gap-2">
                    <Link to="/register">Back to registration</Link>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-muted-foreground mt-8 flex items-center justify-center gap-1.5 text-center text-[11px]">
              <ShieldCheck className="text-secondary size-3.5" />
              Verification links are single-use and expire after 24 hours.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
