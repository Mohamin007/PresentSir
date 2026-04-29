"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, BookOpen, Briefcase, CalendarDays, GraduationCap, ShieldCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type OrgType = "school" | "university" | "company" | "events"
type Role = string

interface RoleConfig {
  id: Role
  label: string
  icon: React.ReactNode
  description: string
}

const rolesByOrgType: Record<OrgType, RoleConfig[]> = {
  school: [
    { id: "teacher", label: "Teacher", icon: <BookOpen className="h-5 w-5" />, description: "Manage attendance and sessions" },
  ],
  university: [
    { id: "student", label: "Student", icon: <GraduationCap className="h-5 w-5" />, description: "Check into classes" },
    { id: "teacher", label: "Teacher", icon: <BookOpen className="h-5 w-5" />, description: "Manage sessions" },
    { id: "admin", label: "Admin", icon: <ShieldCheck className="h-5 w-5" />, description: "Department head" },
  ],
  company: [
    { id: "manager", label: "Manager", icon: <Briefcase className="h-5 w-5" />, description: "Track team attendance" },
    { id: "employee", label: "Employee", icon: <Users className="h-5 w-5" />, description: "Check in to meetings" },
  ],
  events: [
    { id: "organizer", label: "Organizer", icon: <CalendarDays className="h-5 w-5" />, description: "Create and manage events" },
    { id: "attendee", label: "Attendee", icon: <Users className="h-5 w-5" />, description: "Discover and register for events" },
  ],
}

export default function RoleSelectPage() {
  const router = useRouter()
  const [orgType, setOrgType] = useState<OrgType | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  useEffect(() => {
    const storedOrgType = localStorage.getItem("orgType") as OrgType | null

    if (!storedOrgType) {
      router.push("/")
      return
    }

    setOrgType(storedOrgType)
    setSelectedRole(null)
    localStorage.removeItem("role")
  }, [router])

  const handleContinue = () => {
    if (!selectedRole) return

    localStorage.setItem("role", selectedRole)
    router.push("/login")
  }

  const handleBack = () => {
    setSelectedRole(null)
    router.push("/")
  }

  if (!orgType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const availableRoles = rolesByOrgType[orgType]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="text-sm text-muted-foreground capitalize">{orgType}</div>
        </div>

        <div className="text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mx-auto mb-2">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">PresentSir</h1>
          <p className="text-muted-foreground text-lg">Select your role</p>
        </div>

        <div className="grid gap-4">
          {availableRoles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={cn(
                "relative group p-6 rounded-xl border-2 transition-all duration-200 text-left",
                selectedRole === role.id
                  ? "border-primary bg-primary/5 shadow-lg scale-[1.01]"
                  : "border-border hover:border-muted-foreground/40 hover:bg-muted/50 shadow-sm"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 text-muted-foreground">{role.icon}</div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground text-lg leading-tight">{role.label}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>

              {selectedRole === role.id && (
                <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <ArrowRight className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole}
            size="lg"
            className="h-12 px-8 gap-2"
          >
            Continue
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
