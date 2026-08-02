import { useEffect, useState } from "react"
import { AnimatePresence } from "framer-motion"

import { LandingNavbar } from "@/components/landing/navbar"
import { LandingHero } from "@/components/landing/hero"
import { AboutSection, ServicesSection } from "@/components/landing/about"
import { DepartmentsSection } from "@/components/landing/departments"
import { ResourcesSection } from "@/components/landing/resources"
import { ContactSection } from "@/components/landing/contact"
import { LandingFooter } from "@/components/landing/footer"
import {
  BackToTopButton,
  CookieBanner,
  CustomCursor,
  LandingLoadingScreen,
  MobileBottomNav,
} from "@/components/landing/extras"

export function LandingPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-200/70 selection:text-blue-950 dark:bg-[#0B1220] dark:text-white dark:selection:bg-blue-500/40 dark:selection:text-white">
      <AnimatePresence>{loading && <LandingLoadingScreen />}</AnimatePresence>

      <CustomCursor />
      <LandingNavbar />

      <main>
        <LandingHero />
        <AboutSection />
        <ServicesSection />
        <DepartmentsSection />
        <ResourcesSection />
        <ContactSection />
      </main>

      <LandingFooter />

      <CookieBanner />
      <BackToTopButton />
      <MobileBottomNav />
      <div className="h-16 lg:hidden" />
    </div>
  )
}
