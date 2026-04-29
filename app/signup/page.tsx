"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, School, GraduationCap, Building2, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

type OrgType = "school" | "university" | "company" | "events"
type RoleOption = { label: string; value: string }

const orgSizes = [
  { value: "1-50", label: "1-50 people" },
  { value: "51-200", label: "51-200 people" },
  { value: "201-1000", label: "201-1000 people" },
  { value: "1000+", label: "1000+ people" },
]

const rolesByOrgType: Record<OrgType, RoleOption[]> = {
  school: [
    { label: "Head Teacher", value: "head teacher" },
    { label: "Class Teacher", value: "class teacher" },
    { label: "Administrator", value: "administrator" },
  ],
  university: [
    { label: "Student", value: "student" },
    { label: "Teacher", value: "teacher" },
    { label: "Admin", value: "admin" },
  ],
  company: [
    { label: "CEO", value: "ceo" },
    { label: "Manager", value: "manager" },
    { label: "HR", value: "hr" },
    { label: "Administrator", value: "administrator" },
  ],
  events: [
    { label: "Organizer", value: "organizer" },
    { label: "Attendee", value: "attendee" },
  ],
}

export default function SignupPage() {
  const router = useRouter()
  const [orgType, setOrgType] = useState<OrgType | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [orgName, setOrgName] = useState("")
  const [orgSize, setOrgSize] = useState("")
  const [role, setRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState("")

  const getRedirectPath = (orgTypeValue: string, roleValue: string) => {
    const orgType = orgTypeValue.trim().toLowerCase()
    const role = roleValue.trim().toLowerCase()

    if (orgType.includes("university")) {
      if (role.includes("student")) return "/dashboard/university/student"
      if (role.includes("teacher") || role.includes("lecturer")) return "/dashboard/university/teacher"
      if (role.includes("admin") || role.includes("head of department")) return "/dashboard/university/admin"
    }

    if (orgType.includes("school") && (role.includes("teacher") || role.includes("head teacher") || role.includes("class teacher"))) {
      return "/dashboard/school/teacher"
    }

    if (orgType.includes("company")) {
      if (role.includes("employee")) return "/dashboard/company/employee"
      if (role.includes("manager") || role.includes("ceo") || role.includes("hr") || role.includes("administrator")) {
        return "/dashboard/company/manager"
      }
    }

    if (orgType.includes("events")) {
      if (role.includes("organizer")) return "/dashboard/events/organizer"
      if (role.includes("attendee")) return "/dashboard/events/attendee"
    }

    return "/dashboard/school/teacher"
  }

  const getCanonicalRole = (orgTypeValue: OrgType, roleValue: string) => {
    const role = roleValue.trim().toLowerCase()

    if (orgTypeValue === "university") {
      if (role.includes("student")) return "student"
      if (role.includes("teacher") || role.includes("lecturer")) return "teacher"
      return "admin"
    }

    if (orgTypeValue === "school") {
      return "teacher"
    }

    if (orgTypeValue === "company") {
      if (role.includes("employee")) return "employee"
      return "manager"
    }

    if (role.includes("organizer")) return "organizer"
    return "attendee"
  }

  // Get org type from localStorage on mount
  useEffect(() => {
    const storedOrgType = localStorage.getItem("orgType") as OrgType | null
    if (!storedOrgType) {
      router.push("/")
    } else {
      setOrgType(storedOrgType)
    }
    setIsInitializing(false)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgType || !name || !email || !password || !orgName || !orgSize || !role) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Sign up with Supabase
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signupError) {
        setError(signupError.message)
        setIsLoading(false)
        return
      }

      if (!data.user) {
        setError("Failed to create account")
        setIsLoading(false)
        return
      }

      // Insert user profile into users table
      const canonicalRole = getCanonicalRole(orgType, role)

      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            name,
            email,
            role: canonicalRole,
            org_type: orgType,
          },
        ])

      if (insertError) {
        setError("Failed to create user profile: " + insertError.message)
        setIsLoading(false)
        return
      }

      // Fetch user profile from users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError || !userProfile) {
        setError("User profile not found")
        setIsLoading(false)
        return
      }

      // Store onboarding data in localStorage
      localStorage.setItem("presentSir_onboarding", JSON.stringify({
        orgType: userProfile.org_type,
        orgName,
        orgSize,
        role: userProfile.role,
      }))

      localStorage.setItem("orgType", userProfile.org_type)
      localStorage.setItem("role", userProfile.role)

      const redirectPath = getRedirectPath(userProfile.org_type, userProfile.role)

      setIsLoading(false)
      router.push(redirectPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!orgType) {
    return null
  }

  const orgTypeLabel = {
    school: "School",
    university: "University",
    company: "Company",
    events: "Events & Conferences",
  }[orgType]

  const orgTypeEmoji = {
    school: "🏫",
    university: "🎓",
    company: "🏢",
    events: "🎪",
  }[orgType]

  const availableRoles = rolesByOrgType[orgType]

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="flex flex-col items-center mb-8">
          <div className="text-4xl mb-3">{orgTypeEmoji}</div>
          <h1 className="text-2xl font-bold text-foreground">PresentSir</h1>
          <p className="text-muted-foreground text-sm">
            {orgTypeLabel} • Create Account
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Create your account</h2>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-semibold text-foreground mb-3 block">Organization Details</Label>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="org-name" className="text-sm">Organization Name</Label>
                  <Input
                    id="org-name"
                    placeholder={
                      orgType === "school"
                        ? "e.g., Lincoln High School"
                        : orgType === "university"
                        ? "e.g., Stanford University"
                        : orgType === "company"
                        ? "e.g., Acme Corporation"
                        : "e.g., Tech Conference 2024"
                    }
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="h-11 bg-muted/50"
                  />
                </div>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="org-size" className="text-sm">Organization Size</Label>
                  <Select value={orgSize} onValueChange={setOrgSize}>
                    <SelectTrigger id="org-size" className="h-11 bg-muted/50">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgSizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm">Your Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role" className="h-11 bg-muted/50">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
              <div className="text-xs text-center text-muted-foreground">
                <p className="mb-2">Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in here
                  </Link>
                </p>
                <p>
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
