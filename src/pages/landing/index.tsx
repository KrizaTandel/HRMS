import { useEffect, useState } from "react"
import { AnimatePresence } from "framer-motion"

import { LandingNavbar } from "@/components/landing/navbar"
import { LandingHero } from "@/components/landing/hero"
import { AboutSection, ServicesSection } from "@/components/landing/about"
import { DepartmentsSection } from "@/components/landing/departments"
import { ModulesSection } from "@/components/landing/modules"
import { ResourcesSection } from "@/components/landing/resources"
import { AnnouncementsSection } from "@/components/landing/announcements"
import { WorkflowSection } from "@/components/landing/workflow"
import { SecuritySection } from "@/components/landing/security"
import { ContactSection } from "@/components/landing/contact"
import { LandingFooter } from "@/components/landing/footer"
import {
  BackToTopButton,
  ChatWidget,
  CommandHint,
  CommandPalette,
  CookieBanner,
  CustomCursor,
  LandingLoadingScreen,
  MobileBottomNav,
} from "@/components/landing/extras"

export function LandingPage() {
  const [loading, setLoading] = useState(true)
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCmdOpen((o) => !o)
      }
      if (e.key === "Escape") setCmdOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    const handler = () => setCmdOpen(true)
    window.addEventListener("nexushr:cmd", handler)
    return () => window.removeEventListener("nexushr:cmd", handler)
  }, [])

  return (
    <div className="bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-200/70 selection:text-blue-950 dark:bg-[#0B1220] dark:text-white dark:selection:bg-blue-500/40 dark:selection:text-white">
      <AnimatePresence>{loading && <LandingLoadingScreen />}</AnimatePresence>

      <CustomCursor />
      <LandingNavbar />

      <main>
        <LandingHero />
        <AboutSection />
        <DepartmentsSection />
        <ServicesSection />
        <ModulesSection />
        <ResourcesSection />
        <AnnouncementsSection />
        <WorkflowSection />
        <SecuritySection />
        <ContactSection />
      </main>

      <LandingFooter />

      <CommandHint />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <CookieBanner />
      <ChatWidget />
      <BackToTopButton />
      <MobileBottomNav />
      <div className="h-16 lg:hidden" />
    </div>
  )
}
