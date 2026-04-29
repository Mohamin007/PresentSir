"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { supabase } from "@/lib/supabase"

type OrgType = "school" | "university" | "company"

interface OnboardingData {
  orgType: OrgType
  orgName: string
  orgSize: string
  role: string
}

interface OrgAwareSidebarProps {
  role?: "admin" | "teacher" | "student"
}

type SidebarUser = {
  name: string
  email: string
  avatar?: string
}

export function OrgAwareSidebar({ role }: OrgAwareSidebarProps) {
  const [orgData, setOrgData] = useState<OnboardingData | null>(null)
  const [sidebarUser, setSidebarUser] = useState<SidebarUser>()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadSidebarData = async () => {
      const stored = localStorage.getItem("presentSir_onboarding")
      if (stored) {
        try {
          setOrgData(JSON.parse(stored))
        } catch (error) {
          console.error("Failed to parse onboarding data:", error)
        }
      }

      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          setSidebarUser(undefined)
        } else {
          const { data: profile } = await supabase
            .from("users")
            .select("name")
            .eq("id", authUser.id)
            .maybeSingle()

          const profileName = typeof profile?.name === "string" ? profile.name.trim() : ""
          const fallbackName = typeof authUser.user_metadata?.name === "string" ? authUser.user_metadata.name.trim() : ""
          const emailValue = authUser.email ?? ""
          const derivedName = emailValue.includes("@") ? emailValue.split("@")[0] : "User"

          setSidebarUser({
            name: profileName || fallbackName || derivedName,
            email: emailValue,
          })
        }
      } catch (error) {
        console.error("Failed to load sidebar user:", error)
        setSidebarUser(undefined)
      } finally {
        setIsLoaded(true)
      }
    }

    void loadSidebarData()
  }, [])

  if (!isLoaded) {
    return null
  }

  return (
    <AppSidebar
      role={role}
      orgType={orgData?.orgType}
      orgName={orgData?.orgName}
      user={sidebarUser}
    />
  )
}
