"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { supabase } from "../../lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [orgType, setOrgType] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState("")

  const normalize = (value: string) => value.trim().toLowerCase()

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

  useEffect(() => {
    const storedOrgType = localStorage.getItem("orgType")
    const storedRole = localStorage.getItem("role")

    if (!storedOrgType || !storedRole) {
      router.push("/")
      return
    }

    setOrgType(storedOrgType)
    setSelectedRole(storedRole)
    setIsInitializing(false)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please enter email and password")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      if (!data.user) {
        setError("Failed to sign in")
        setIsLoading(false)
        return
      }

      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profileError || !userProfile) {
        setError("User profile not found")
        setIsLoading(false)
        return
      }

      const profileOrgType = normalize(String(userProfile.org_type ?? ""))
      const profileRole = normalize(String(userProfile.role ?? ""))
      const currentOrgType = normalize(orgType ?? "")
      const currentRole = normalize(selectedRole ?? "")

      const orgMatches = profileOrgType.includes(currentOrgType) || currentOrgType.includes(profileOrgType)
      const roleMatches = profileRole.includes(currentRole) || currentRole.includes(profileRole)

      if (!orgMatches || !roleMatches) {
        await supabase.auth.signOut()
        setError("No user found")
        setIsLoading(false)
        return
      }

      localStorage.setItem("orgType", userProfile.org_type)
      localStorage.setItem("role", userProfile.role)

      router.push(getRedirectPath(userProfile.org_type, userProfile.role))

      setIsLoading(false)
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <Link href="/role-select">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mx-auto mb-2">
            <span className="text-primary-foreground text-xl font-bold">P</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">PresentSir</h1>
          <p className="text-muted-foreground text-sm">Sign in to continue</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Sign In</h2>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
