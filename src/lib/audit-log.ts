import { useEffect, useState } from "react"

export interface AuditEntry {
  id: string
  actor: string
  action: string
  detail: string
  timestamp: string
}

const STORAGE_KEY = "nexushr-audit"

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600000).toISOString()
}

function seedAuditLog(): AuditEntry[] {
  return [
    {
      id: "AUD-SEED-3",
      actor: "David Carter",
      action: "Rejected registration",
      detail: "Maya Patel (E-221) rejected — employee ID belongs to another department.",
      timestamp: isoHoursAgo(30),
    },
    {
      id: "AUD-SEED-2",
      actor: "David Carter",
      action: "Approved registration",
      detail: "Liam Foster (E-220) approved for portal access.",
      timestamp: isoHoursAgo(52),
    },
    {
      id: "AUD-SEED-1",
      actor: "System",
      action: "Registration created",
      detail: "New account opened for sam.nguyen@nexushr.io.",
      timestamp: isoHoursAgo(72),
    },
  ]
}

export function loadAuditLog(): AuditEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuditEntry[]) : seedAuditLog()
  } catch {
    return seedAuditLog()
  }
}

export function saveAuditLog(entries: AuditEntry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  window.dispatchEvent(new Event("nexushr:audit"))
}

export function addAuditEntry(input: Omit<AuditEntry, "id" | "timestamp">): AuditEntry {
  const entry: AuditEntry = {
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...input,
  }
  const log = loadAuditLog()
  saveAuditLog([entry, ...log].slice(0, 100))
  return entry
}

export function useAuditLog() {
  const [log, setLog] = useState<AuditEntry[]>(() => loadAuditLog())

  useEffect(() => {
    const refresh = () => setLog(loadAuditLog())
    window.addEventListener("nexushr:audit", refresh)
    return () => window.removeEventListener("nexushr:audit", refresh)
  }, [])

  return log
}
