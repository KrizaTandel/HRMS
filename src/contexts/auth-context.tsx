import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { allEmployees } from "@/data/mockData"
import type { Role, SessionUser } from "@/data/types"
import { findAccountByEmail, hashPassword } from "@/lib/accounts"

const STORAGE_KEY = "nexushr-user"

interface AuthContextValue {
  user: SessionUser | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<SessionUser>
  loginAs: (role: Role) => SessionUser
  logout: () => void
  updateUser: (patch: Partial<SessionUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toSessionUser(employee: {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
}): SessionUser {
  return {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    role: employee.role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as SessionUser) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else window.localStorage.removeItem(STORAGE_KEY)
  }, [user])

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 900))
    const normalized = email.trim().toLowerCase()

    const demo = allEmployees.find((e) => e.email.toLowerCase() === normalized)
    if (demo) {
      if (!password || password.length < 4) {
        throw new Error("Password must be at least 4 characters.")
      }
      const session = toSessionUser(demo)
      setUser(session)
      return session
    }

    const account = findAccountByEmail(normalized)
    if (!account) {
      throw new Error("No account found with this email address.")
    }

    switch (account.status) {
      case "pending-verification":
        throw new Error("Please verify your email before logging in.")
      case "pending-approval":
        throw new Error("Your account is awaiting HR approval.")
      case "rejected":
        throw new Error("Your registration has been rejected. Please contact HR.")
      case "suspended":
        throw new Error("Your account has been suspended. Please contact HR.")
      case "inactive":
        throw new Error("Your account is inactive. Please contact HR.")
    }

    const passwordHash = await hashPassword(password)
    if (passwordHash !== account.passwordHash) {
      throw new Error("Incorrect password. Please try again.")
    }

    const emp = account.employee
    if (!emp) {
      throw new Error("Your account is not fully activated yet. Please contact HR.")
    }

    const session: SessionUser = {
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      role: emp.role,
    }
    setUser(session)
    return session
  }, [])

  const loginAs = useCallback((role: Role) => {
    const match = allEmployees.find((e) => e.role === role)
    const session = toSessionUser(match ?? allEmployees[0])
    setUser(session)
    return session
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const updateUser = useCallback((patch: Partial<SessionUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAdmin: user?.role === "admin",
      login,
      loginAs,
      logout,
      updateUser,
    }),
    [user, login, loginAs, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
