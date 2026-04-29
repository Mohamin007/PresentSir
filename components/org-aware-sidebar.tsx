"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"

type OrgType = "school" | "university" | "company"

interface OnboardingData {
  orgType: OrgType
  orgName: string
  orgSize: string
  role: string
}

interface OrgAwareSidebarProps {
  role?: "admin" | "teacher" | "student"
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function OrgAwareSidebar({ role, user }: OrgAwareSidebarProps) {
  const [orgData, setOrgData] = useState<OnboardingData | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("presentSir_onboarding")
    if (stored) {
      try {
        setOrgData(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to parse onboarding data:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return null
  }

  return (
    <AppSidebar
      role={role}
      orgType={orgData?.orgType}
      orgName={orgData?.orgName}
      user={user}
    />
  )
}
