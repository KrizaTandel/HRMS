import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, ShieldX } from "lucide-react"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"

export function ForbiddenPage() {
  const navigate = useNavigate()
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
          <div className="animate-scale-in flex w-full flex-col items-center text-center">
            <span className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-xl">
              <ShieldX className="size-10" />
            </span>
            <p className="text-primary mt-6 text-sm font-semibold tracking-widest uppercase">
              403 · Forbidden
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Access denied
            </h1>
            <p className="text-muted-foreground mt-3 max-w-md text-sm">
              You don't have permission to access this page. Your account role doesn't match the
              required access level.
            </p>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="size-4" />
                Go back
              </Button>
              <Button asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
