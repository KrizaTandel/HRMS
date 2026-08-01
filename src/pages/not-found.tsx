import { useNavigate } from "react-router-dom"
import { ArrowLeft, Compass } from "lucide-react"

import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-6">
      <div className="animate-scale-in flex flex-col items-center text-center">
        <div className="bg-primary/10 text-primary flex size-20 items-center justify-center rounded-3xl">
          <Compass className="size-10" />
        </div>
        <p className="text-primary mt-6 text-sm font-semibold tracking-widest uppercase">
          404 Error
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="text-muted-foreground mt-3 max-w-md text-sm">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="size-4" />
            Go back
          </Button>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    </div>
  )
}
