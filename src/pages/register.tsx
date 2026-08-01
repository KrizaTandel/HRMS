import { useMemo, useRef, useState } from "react"
import type { ChangeEvent, FormEvent, ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Camera,
  Check,
  Eye,
  EyeOff,
  FileCheck,
  Info,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  COUNTRY_CODES,
  DEPARTMENTS,
  DESIGNATIONS,
  registerAccount,
  validateEmail,
  validateEmployeeId,
  validatePassword,
  validatePhone,
  passwordChecks,
  passwordStrength,
  type RegistrationInput,
} from "@/lib/accounts"
import { cn } from "@/lib/utils"

const DRAFT_KEY = "nexushr-register-draft"

interface FormState {
  photo: string | null
  firstName: string
  lastName: string
  email: string
  phoneCode: string
  phone: string
  employeeId: string
  department: string
  designation: string
  role: "employee" | "admin"
  password: string
  confirmPassword: string
  agree: boolean
}

const DEFAULT_STATE: FormState = {
  photo: null,
  firstName: "",
  lastName: "",
  email: "",
  phoneCode: "+1",
  phone: "",
  employeeId: "",
  department: "",
  designation: "",
  role: "employee",
  password: "",
  confirmPassword: "",
  agree: false,
}

const STEPS = [
  { key: "personal", title: "Personal", icon: User },
  { key: "employment", title: "Employment", icon: Briefcase },
  { key: "security", title: "Security", icon: ShieldCheck },
  { key: "review", title: "Review", icon: FileCheck },
]

function loadDraft(): FormState | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<FormState>
    return { ...DEFAULT_STATE, ...parsed }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Profile photo upload
// ---------------------------------------------------------------------------

function PhotoUpload({
  value,
  onChange,
}: {
  value: string | null
  onChange: (dataUrl: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (file?: File) => {
    setError(null)
    if (!file) return
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG or PNG images are allowed.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 256
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          onChange(reader.result as string)
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        onChange(canvas.toDataURL("image/jpeg", 0.85))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
            {value ? (
              <img src={value} alt="Profile preview" className="size-full object-cover" />
            ) : (
              <User className="size-8 text-slate-400" />
            )}
          </div>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove photo"
              className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition hover:bg-rose-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="size-4" />
            {value ? "Change photo" : "Upload photo"}
          </Button>
          <p className="text-muted-foreground mt-1.5 text-[11px]">JPG or PNG · max 5 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0])}
          />
        </div>
      </div>
      {error && (
        <p className="text-destructive mt-2 flex items-center gap-1.5 text-xs">
          <Info className="size-3.5" /> {error}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Password strength
// ---------------------------------------------------------------------------

function PasswordStrength({ value }: { value: string }) {
  const score = passwordStrength(value)
  const checks = passwordChecks(value)
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"]
  const color =
    score <= 1
      ? "bg-rose-500"
      : score === 2
        ? "bg-amber-500"
        : score === 3
          ? "bg-lime-500"
          : "bg-emerald-500"

  const items: { key: keyof typeof checks; label: string }[] = [
    { key: "length", label: "At least 12 characters" },
    { key: "upper", label: "One uppercase letter" },
    { key: "lower", label: "One lowercase letter" },
    { key: "number", label: "One number" },
    { key: "special", label: "One special character" },
    { key: "noSpace", label: "No spaces" },
  ]

  return (
    <div className="space-y-2.5">
      <div>
        <div className="flex items-center justify-between">
          <Progress value={value ? (score / 5) * 100 : 0} className="h-1.5 flex-1" indicatorClassName={color} />
          <span className="text-muted-foreground ml-3 w-16 text-right text-xs font-semibold">
            {value ? labels[score] : "—"}
          </span>
        </div>
      </div>
      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {items.map((item) => {
          const ok = checks[item.key]
          return (
            <li
              key={item.key}
              className={cn(
                "flex items-center gap-1.5 text-[11px]",
                ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-3.5 items-center justify-center rounded-full",
                  ok ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-slate-100 dark:bg-slate-800"
                )}
              >
                {ok && <Check className="size-2.5" />}
              </span>
              {item.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Reusable form bits
// ---------------------------------------------------------------------------

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-destructive mt-1.5 text-xs">{message}</p>
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm font-semibold">{label}</Label>
      {children}
      <FieldError message={error} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Registration page
// ---------------------------------------------------------------------------

export function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(() => loadDraft() ?? DEFAULT_STATE)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const designationOptions = useMemo(
    () => (form.department ? DESIGNATIONS[form.department] ?? [] : []),
    [form.department]
  )

  const saveDraft = (withToast = true) => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    if (withToast) toast.success("Draft saved", { description: "Your progress is stored on this device." })
  }

  const validateStep = (index: number): boolean => {
    const next: Record<string, string> = {}
    if (index === 0) {
      if (!form.firstName.trim()) next.firstName = "First name is required."
      if (!form.lastName.trim()) next.lastName = "Last name is required."
      const emailErr = validateEmail(form.email)
      if (emailErr) next.email = emailErr
      const phoneErr = validatePhone(`${form.phoneCode}${form.phone}`)
      if (phoneErr) next.phone = phoneErr
    }
    if (index === 1) {
      const idErr = validateEmployeeId(form.employeeId)
      if (idErr) next.employeeId = idErr
      if (!form.department) next.department = "Select a department."
      if (!form.designation) next.designation = "Select a designation."
      if (form.role === "admin") {
        next.role = "HR/Admin accounts cannot be self-registered."
      }
    }
    if (index === 2) {
      const pwErr = validatePassword(form.password)
      if (pwErr) next.password = pwErr
      else if (form.confirmPassword !== form.password)
        next.confirmPassword = "Passwords do not match."
      if (!form.agree) next.agree = "Please accept the terms to continue."
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const next = () => {
    if (!validateStep(step)) return
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const back = () => {
    setErrors({})
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    for (let i = 0; i <= 2; i++) {
      if (!validateStep(i)) {
        setStep(i)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }
    }
    setSubmitting(true)
    try {
      const input: RegistrationInput = {
        employeeId: form.employeeId,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: `${form.phoneCode} ${form.phone.trim()}`,
        department: form.department,
        designation: form.designation,
        role: form.role,
        password: form.password,
        photo: form.photo,
      }
      const account = await registerAccount(input)
      window.localStorage.removeItem(DRAFT_KEY)
      navigate(`/register/success?id=${encodeURIComponent(account.id)}`, { replace: true })
    } catch (err) {
      toast.error("Registration failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const designationsLocked = !form.department

  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="bg-primary/15 pointer-events-none absolute -top-40 -left-40 size-[480px] rounded-full blur-[140px]" />
      <div className="bg-secondary/15 pointer-events-none absolute -right-32 -bottom-32 size-[420px] rounded-full blur-[140px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
        <header className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <Link to="/login" className="text-primary hover:underline text-sm font-medium">
            Already have an account? Sign in
          </Link>
        </header>

        <main className="mt-8 flex-1">
          <div className="animate-fade-in-up glass rounded-2xl p-6 shadow-card sm:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create your account</h1>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Join the Vertex Industries HRMS portal. Registration takes less than two minutes.
              </p>
            </div>

            {/* Stepper */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {STEPS.map((s, i) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1.5",
                      i < step ? "cursor-pointer" : "cursor-default"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                        i < step
                          ? "border-primary bg-primary text-primary-foreground"
                          : i === step
                            ? "border-primary text-primary"
                            : "border-slate-200 text-slate-400 dark:border-slate-700"
                      )}
                    >
                      {i < step ? <Check className="size-4.5" /> : <s.icon className="size-4.5" />}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        i <= step ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {s.title}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {step === 0 && (
                    <div className="space-y-5">
                      <PhotoUpload value={form.photo} onChange={(d) => set("photo", d)} />

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="First name" error={errors.firstName}>
                          <Input
                            value={form.firstName}
                            onChange={(e) => set("firstName", e.target.value)}
                            placeholder="Jane"
                            autoComplete="given-name"
                          />
                        </Field>
                        <Field label="Last name" error={errors.lastName}>
                          <Input
                            value={form.lastName}
                            onChange={(e) => set("lastName", e.target.value)}
                            placeholder="Cooper"
                            autoComplete="family-name"
                          />
                        </Field>
                      </div>

                      <Field label="Official email address" error={errors.email}>
                        <div className="relative">
                          <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                          <Input
                            type="email"
                            className="pl-9"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            placeholder="jane@company.com"
                            autoComplete="email"
                          />
                        </div>
                        <p className="text-muted-foreground text-[11px]">
                          Company email is preferred. It will be verified before activation.
                        </p>
                      </Field>

                      <Field label="Mobile number" error={errors.phone}>
                        <div className="flex gap-2">
                          <Select
                            value={form.phoneCode}
                            onValueChange={(v) => set("phoneCode", v)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRY_CODES.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                  {c.code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="relative flex-1">
                            <Phone className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                              className="pl-9"
                              value={form.phone}
                              onChange={(e) => set("phone", e.target.value)}
                              placeholder="555 010 2030"
                              inputMode="tel"
                              autoComplete="tel"
                            />
                          </div>
                        </div>
                      </Field>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-5">
                      <Field
                        label="Employee ID"
                        error={errors.employeeId}
                      >
                        <Input
                          value={form.employeeId}
                          onChange={(e) => set("employeeId", e.target.value.toUpperCase())}
                          placeholder="e.g. VX1042"
                          maxLength={15}
                        />
                        <p className="text-muted-foreground mt-1 text-[11px]">
                          5–15 alphanumeric characters. This must match your official ID.
                        </p>
                      </Field>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Department" error={errors.department}>
                          <Select
                            value={form.department}
                            onValueChange={(v) => {
                              set("department", v)
                              set("designation", "")
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {DEPARTMENTS.map((d) => (
                                <SelectItem key={d} value={d}>
                                  {d}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field label="Designation" error={errors.designation}>
                          <Select
                            value={form.designation}
                            onValueChange={(v) => set("designation", v)}
                            disabled={designationsLocked}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={designationsLocked ? "Select department first" : "Select designation"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {designationOptions.map((d) => (
                                <SelectItem key={d} value={d}>
                                  {d}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>

                      <Field label="Role" error={errors.role}>
                        <Select value={form.role} onValueChange={(v) => set("role", v as FormState["role"])}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="admin">HR Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.role === "admin" && (
                          <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                            <span>
                              HR/Admin accounts cannot be self-registered. They can only be created
                              by a System Administrator. Please register as an Employee instead.
                            </span>
                          </div>
                        )}
                      </Field>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <Field label="Password" error={errors.password}>
                        <div className="relative">
                          <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="pr-10 pl-9"
                            value={form.password}
                            onChange={(e) => {
                              set("password", e.target.value)
                              setErrors((prev) => ({ ...prev, password: undefined }))
                            }}
                            placeholder="Create a strong password"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                        <div className="mt-3">
                          <PasswordStrength value={form.password} />
                        </div>
                      </Field>

                      <Field label="Confirm password" error={errors.confirmPassword}>
                        <div className="relative">
                          <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="pl-9"
                            value={form.confirmPassword}
                            onChange={(e) => {
                              set("confirmPassword", e.target.value)
                              setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                            }}
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                          />
                        </div>
                      </Field>

                      <div className="space-y-1.5 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={form.agree}
                            onCheckedChange={(v) => set("agree", v === true)}
                            id="terms"
                          />
                          <Label htmlFor="terms" className="text-sm font-medium">
                            I agree to the portal terms, data usage and company policy.
                          </Label>
                        </div>
                        {errors.agree && <p className="text-destructive text-xs">{errors.agree}</p>}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-4">
                        {form.photo ? (
                          <img
                            src={form.photo}
                            alt="Profile preview"
                            className="size-16 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <span className="bg-muted flex size-16 items-center justify-center rounded-full">
                            <User className="size-7 text-slate-400" />
                          </span>
                        )}
                        <div>
                          <p className="text-lg font-bold">
                            {form.firstName} {form.lastName}
                          </p>
                          <p className="text-muted-foreground text-sm">{form.email}</p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          { label: "Employee ID", value: form.employeeId },
                          { label: "Mobile", value: `${form.phoneCode} ${form.phone}` },
                          { label: "Department", value: form.department || "—" },
                          { label: "Designation", value: form.designation || "—" },
                          { label: "Role", value: form.role === "admin" ? "HR Admin" : "Employee" },
                          { label: "Password", value: "•".repeat(Math.min(form.password.length, 12) || 8) },
                        ].map((row) => (
                          <div
                            key={row.label}
                            className="rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/40"
                          >
                            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                              {row.label}
                            </p>
                            <p className="text-foreground mt-0.5 truncate text-sm font-semibold">
                              {row.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-start gap-2 rounded-xl border border-blue-200/60 bg-blue-50 px-3.5 py-3 text-xs text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                        <Info className="mt-0.5 size-4 shrink-0" />
                        <span>
                          After submitting, you'll verify your email address. Your account becomes
                          active only after HR approval — then you can sign in to the portal.
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Footer actions */}
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={back}
                  disabled={step === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="size-4" /> Back
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => saveDraft(true)}
                  className="gap-2"
                >
                  <Save className="size-4" /> Save Draft
                </Button>

                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={next} className="gap-2">
                    Next <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitting} className="gap-2">
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Creating…
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" /> Create Account
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
