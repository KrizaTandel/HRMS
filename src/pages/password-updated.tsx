import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"

export function PasswordUpdatedPage() {
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
            <div className="flex flex-col items-center py-4 text-center">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-xl"
              >
                <CheckCircle2 className="size-10" />
              </motion.span>
              <h1 className="mt-6 text-2xl font-bold tracking-tight">Password updated</h1>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                Your password has been changed successfully. You can now sign in with your new
                password.
              </p>

              <div className="mt-4 flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ShieldCheck className="size-3.5" /> All sessions using your old password were
                revoked
              </div>

              <Button asChild size="lg" className="mt-8 gap-2">
                <Link to="/login">
                  Go to Login <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
