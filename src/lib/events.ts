import type { Employee } from "@/data/types"

export interface CalendarHoliday {
  name: string
  date: string
}

export interface UpcomingBirthday {
  employee: Employee
  date: string
  age: number
}

export const HOLIDAYS: CalendarHoliday[] = [
  { name: "Independence Day", date: "2026-08-15" },
  { name: "Labor Day", date: "2026-09-07" },
  { name: "Thanksgiving", date: "2026-11-26" },
  { name: "Christmas Day", date: "2026-12-25" },
  { name: "New Year's Day", date: "2027-01-01" },
  { name: "Memorial Day", date: "2027-05-31" },
]

export function getNextHoliday(from = new Date()): CalendarHoliday | null {
  const todayKey = from.toISOString().slice(0, 10)
  return HOLIDAYS.find((h) => h.date >= todayKey) ?? null
}

export function getUpcomingBirthdays(
  employees: Employee[],
  days = 30,
  from = new Date()
): UpcomingBirthday[] {
  const fromKey = from.toISOString().slice(0, 10)
  const end = new Date(from)
  end.setDate(end.getDate() + days)
  const endKey = end.toISOString().slice(0, 10)

  return employees
    .filter((e) => e.dateOfBirth)
    .map((employee) => {
      const bday = new Date(employee.dateOfBirth + "T00:00:00")
      const upcoming = new Date(from.getFullYear(), bday.getMonth(), bday.getDate())
      if (upcoming < from) upcoming.setFullYear(upcoming.getFullYear() + 1)
      const date = upcoming.toISOString().slice(0, 10)
      return { employee, date, age: from.getFullYear() - bday.getFullYear() }
    })
    .filter((b) => b.date >= fromKey && b.date <= endKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)
}

export function daysUntil(date: string): number {
  const target = new Date(date + "T00:00:00").getTime()
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  return Math.round((target - todayStart) / 86400000)
}
