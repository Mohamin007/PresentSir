"use client"

import { useEffect, useState } from "react"

type OrgType = "school" | "university" | "company"

export interface OnboardingData {
  orgType: OrgType
  orgName: string
  orgSize: string
  role: string
}

export function useOrganization() {
  const [orgData, setOrgData] = useState<OnboardingData | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("presentSir_onboarding")
    if (stored) {
      try {
        setOrgData(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to parse organization data:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  return {
    orgData,
    isLoaded,
    orgType: orgData?.orgType,
    orgName: orgData?.orgName,
    role: orgData?.role,
  }
}
