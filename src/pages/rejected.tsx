import { useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { ArrowRight, ShieldAlert } from "lucide-react"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { findAccountByEmail } from "@/lib/accounts"

export function RejectedPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const account = useMemo(() => (email ? findAccountByEmail(email) : undefined), [email])

  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="bg-primary/15 pointer-events-none absolute -top-40 -left-40 size-[480px] rounded-full blur-[140px]" />
      <div className="bg-destructive/15 pointer-events-none absolute -right-32 -bottom-32 size-[420px] rounded-full blur-[140px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-6 sm:px-6">
        <header>
          <Link to="/">
            <Logo />
          </Link>
        </header>

        <main className="flex flex-1 items-center py-10">
          <div className="animate-scale-in flex w-full flex-col items-center text-center">
            <span className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-xl">
              <ShieldAlert className="size-10" />
            </span>
            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Registration not approved
            </h1>
            <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
              Unfortunately, your registration could not be approved by HR. You won't be able to
              sign in to the portal.
            </p>

            {account?.rejectionReason && (
              <div className="mt-5 w-full max-w-sm rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-left">
                <p className="text-xs font-semibold tracking-wider uppercase text-destructive">
                  Reason provided by HR
                </p>
                <p className="text-foreground mt-1.5 text-sm leading-relaxed">
                  {account.rejectionReason}
                </p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button asChild variant="outline">
                <Link to="/">Back to Home</Link>
              </Button>
              <Button asChild className="gap-2">
                <Link to="/#contact">
                  Contact HR <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
