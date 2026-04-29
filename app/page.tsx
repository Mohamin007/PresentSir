"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { School, GraduationCap, Building2, ArrowRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type OrgType = "school" | "university" | "company" | "events"

const orgTypes = [
  {
    id: "school" as const,
    icon: School,
    title: "🏫 School",
    description: "Teacher-managed attendance, no student devices needed",
  },
  {
    id: "university" as const,
    icon: GraduationCap,
    title: "🎓 University / College",
    description: "Smart rooms, QR check-ins, student self-service",
  },
  {
    id: "events" as const,
    icon: CalendarDays,
    title: "🎪 Events & Conferences",
    description: "Organize events, manage registrations, real-time check-ins",
  },
  {
    id: "company" as const,
    icon: Building2,
    title: "🏢 Company / Organization",
    description: "Track employee meetings, shifts and punctuality",
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [selectedOrgType, setSelectedOrgType] = useState<OrgType | null>(null)

  const handleContinue = () => {
    if (selectedOrgType) {
      localStorage.setItem("orgType", selectedOrgType)
      localStorage.removeItem("role")
      router.push("/role-select")
    }
  }

  const handleSignUp = () => {
    if (selectedOrgType) {
      localStorage.setItem("orgType", selectedOrgType)
      localStorage.removeItem("role")
      router.push("/signup")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mx-auto mb-2">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            PresentSir
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-Powered Attendance Management
          </p>
        </div>

        {/* Subheading */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            What best describes you?
          </h2>
          <p className="text-muted-foreground">
            Select your organization type to get started
          </p>
        </div>

        {/* Org Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {orgTypes.map((org) => (
            <button
              key={org.id}
              onClick={() => setSelectedOrgType(org.id)}
              className={cn(
                "relative group p-6 rounded-xl border-2 transition-all duration-200 text-left",
                selectedOrgType === org.id
                  ? "border-primary bg-primary/5 shadow-lg scale-105"
                  : "border-border hover:border-muted-foreground/40 hover:bg-muted/50 shadow-sm"
              )}
            >
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-lg leading-tight">
                  {org.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {org.description}
                </p>
              </div>

              {selectedOrgType === org.id && (
                <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <ArrowRight className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <Button
            onClick={handleContinue}
            disabled={!selectedOrgType}
            size="lg"
            className="h-12 px-8 gap-2"
          >
            Sign In
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleSignUp}
            disabled={!selectedOrgType}
            size="lg"
            variant="outline"
            className="h-12 px-8 gap-2"
          >
            Sign Up
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground">
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

