import { useState } from "react"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useData } from "@/contexts/data-context"

const DESIGNATIONS: Record<string, string[]> = {
  Engineering: ["Junior Software Engineer", "Software Engineer", "Senior Software Engineer", "QA Engineer", "DevOps Engineer"],
  Design: ["UI/UX Designer", "Senior Product Designer"],
  Product: ["Product Manager", "Senior Product Manager"],
  "Sales & Marketing": ["Sales Executive", "Marketing Specialist", "Sales Manager", "Growth Lead"],
  Finance: ["Accountant", "Financial Analyst", "Finance Manager"],
  Operations: ["Operations Associate", "Operations Manager"],
  "Human Resources": ["HR Executive", "Recruiter", "HR Manager"],
  "Customer Success": ["Support Specialist", "Customer Success Manager"],
}

export function AddEmployeeDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { addEmployee, departments, pushActivity } = useData()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: departments[0]?.name ?? "Engineering",
    designation: "",
    joiningDate: "",
    salaryBasic: "5200",
    city: "Austin",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Please provide the employee's first and last name.")
      return
    }
    if (!form.designation) {
      setError("Please select a designation.")
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      const emp = addEmployee({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || "(555) 000-0000",
        department: form.department,
        designation: form.designation,
        joiningDate: form.joiningDate || new Date().toISOString().slice(0, 10),
        city: form.city,
        salaryBasic: Number(form.salaryBasic) || 5200,
      })
      pushActivity({
        type: "onboarding",
        text: `${emp.firstName} ${emp.lastName} joined the ${emp.department} team`,
        employeeId: emp.id,
      })
      toast.success("Employee added", {
        description: `${emp.firstName} ${emp.lastName} (${emp.id}) has been onboarded.`,
      })
      setSubmitting(false)
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: departments[0]?.name ?? "Engineering",
        designation: "",
        joiningDate: "",
        salaryBasic: "5200",
        city: "Austin",
      })
      setError(null)
      onOpenChange(false)
    }, 700)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
              <UserPlus className="size-4" />
            </span>
            Add New Employee
          </DialogTitle>
          <DialogDescription>
            Onboard a new team member. Their profile will be created automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>First Name</Label>
            <Input placeholder="Jane" value={form.firstName} onChange={set("firstName")} />
          </div>
          <div className="grid gap-1.5">
            <Label>Last Name</Label>
            <Input placeholder="Doe" value={form.lastName} onChange={set("lastName")} />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Work Email</Label>
            <Input
              type="email"
              placeholder="jane.doe@nexushr.io"
              value={form.email}
              onChange={set("email")}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Phone</Label>
            <Input placeholder="(555) 000-0000" value={form.phone} onChange={set("phone")} />
          </div>
          <div className="grid gap-1.5">
            <Label>City</Label>
            <Input placeholder="Austin" value={form.city} onChange={set("city")} />
          </div>
          <div className="grid gap-1.5">
            <Label>Department</Label>
            <Select
              value={form.department}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, department: v, designation: "" }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.name} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Designation</Label>
            <Select value={form.designation} onValueChange={(v) => setForm((f) => ({ ...f, designation: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {(DESIGNATIONS[form.department] ?? []).map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Joining Date</Label>
            <Input type="date" value={form.joiningDate} onChange={set("joiningDate")} />
          </div>
          <div className="grid gap-1.5">
            <Label>Base Salary (USD)</Label>
            <Input type="number" value={form.salaryBasic} onChange={set("salaryBasic")} />
          </div>
        </div>

        {error && (
          <p className="text-destructive rounded-lg bg-destructive/10 px-3 py-2 text-xs">{error}</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="size-4" />
                Add Employee
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
