import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, Mail, MailOpen, RefreshCw, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { findAccountById, resendVerification } from "@/lib/accounts"
import { useAuth } from "@/contexts/auth-context"

export function RegisterSuccessPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const id = searchParams.get("id") ?? ""
  const [account, setAccount] = useState(() => findAccountById(id))

  const verificationLink = useMemo(() => {
    if (!account) return ""
    const url = new URL(window.location.href)
    url.pathname = "/verify-email"
    url.searchParams.set("token", account.verificationToken)
    url.searchParams.set("email", account.email)
    return url.toString()
  }, [account])

  const resend = () => {
    if (!account) return
    const updated = resendVerification(account.id)
    if (updated) {
      setAccount(updated)
      toast.success("Verification email sent", {
        description: `A fresh verification link was sent to ${updated.email}.`,
      })
    }
  }

  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="bg-primary/15 pointer-events-none absolute -top-40 -left-40 size-[480px] rounded-full blur-[140px]" />
      <div className="bg-secondary/15 pointer-events-none absolute -right-32 -bottom-32 size-[420px] rounded-full blur-[140px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 py-6 sm:px-6">
        <header>
          <Link to="/">
            <Logo />
          </Link>
        </header>

        <main className="flex flex-1 items-center py-10">
          <div className="animate-fade-in-up glass w-full rounded-2xl p-8 shadow-card sm:p-10">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                className="relative"
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
                <span className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-xl">
                  <CheckCircle2 className="size-10" />
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
              >
                <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
                  Registration completed successfully
                </h1>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {user ? (
                    <>
                      Welcome aboard! Your account for{" "}
                      <span className="font-semibold text-foreground">
                        {account ? `${account.firstName} ${account.lastName}` : "your profile"}
                      </span>{" "}
                      is ready.
                    </>
                  ) : (
                    <>
                      Your account has been created. Please{" "}
                      <span className="font-semibold text-foreground">verify your email</span> and
                      wait for <span className="font-semibold text-foreground">HR approval</span> to
                      activate access.
                    </>
                  )}
                </p>
              </motion.div>
            </div>

            {account && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8 overflow-hidden rounded-2xl border border-blue-200/70 bg-blue-50/70 dark:border-blue-500/20 dark:bg-blue-500/10"
              >
                <div className="flex items-center justify-between gap-2 border-b border-blue-200/60 px-4 py-3 dark:border-blue-500/15">
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
                    <MailOpen className="size-4" /> Demo verification email
                  </div>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                    SENT · {account.email}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-muted-foreground text-[13px] leading-relaxed">
                    In production this email is delivered to{" "}
                    <span className="font-semibold text-foreground">{account.email}</span>. For this
                    demo, open the verification link below to simulate clicking it:
                  </p>
                  <a
                    href={verificationLink}
                    className="text-primary mt-3 flex items-start gap-1.5 break-all rounded-xl border border-blue-200/70 bg-white/80 px-3 py-2.5 text-[13px] font-medium hover:underline dark:border-blue-500/25 dark:bg-slate-900/40"
                  >
                    <Mail className="mt-0.5 size-4 shrink-0" />
                    <span>{verificationLink}</span>
                  </a>
                  <p className="text-muted-foreground mt-3 text-[11px]">
                    The link expires in 24 hours. Don't close this window before verifying.
                  </p>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-8 grid gap-3 sm:grid-cols-2"
            >
              <Button onClick={resend} variant="outline" className="gap-2">
                <RefreshCw className="size-4" /> Resend Verification Email
              </Button>
              <Button asChild className="gap-2">
                <Link to="/login">
                  Go to Login <ArrowRight className="size-4" />
                </Link>
              </Button>
            </motion.div>

            <p className="text-muted-foreground mt-6 flex items-center justify-center gap-1.5 text-center text-[11px]">
              <ShieldCheck className="text-secondary size-3.5" />
              Your password is stored securely and never shared. Access activates after email
              verification and HR approval.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
