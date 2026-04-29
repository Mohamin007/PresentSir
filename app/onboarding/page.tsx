"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { School, GraduationCap, Building2, ArrowRight, Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type OrgType = "school" | "university" | "company"
type RoleOption = { label: string; value: string }

interface OnboardingData {
  orgType: OrgType
  orgName: string
  orgSize: string
  role: string
}

const orgTypes = [
  {
    id: "school" as const,
    icon: School,
    title: "🏫 School",
    subtitle: "Teacher-managed attendance, no student devices needed",
  },
  {
    id: "university" as const,
    icon: GraduationCap,
    title: "🎓 University / College",
    subtitle: "Smart rooms, QR check-ins, student self-service",
  },
  {
    id: "company" as const,
    icon: Building2,
    title: "🏢 Company / Organization",
    subtitle: "Track employee meetings, shifts and punctuality",
  },
]

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
}

const welcomeContent: Record<OrgType, { title: string; message: string; cta: string }> = {
  school: {
    title: "Welcome to PresentSir",
    message: "Your teacher dashboard is ready. Start by adding your students.",
    cta: "Go to Dashboard",
  },
  university: {
    title: "Welcome to PresentSir",
    message: "Your department is set up. Create your first room to get started.",
    cta: "Go to Dashboard",
  },
  company: {
    title: "Welcome to PresentSir",
    message: "Your workspace is ready. Add your team and start tracking meetings.",
    cta: "Go to Dashboard",
  },
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedOrgType, setSelectedOrgType] = useState<OrgType | null>(null)
  const [orgName, setOrgName] = useState("")
  const [orgSize, setOrgSize] = useState("")
  const [role, setRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Check if already onboarded on mount
  useEffect(() => {
    const stored = localStorage.getItem("presentSir_onboarding")
    if (stored) {
      router.push("/dashboard")
    }
  }, [router])

  const handleOrgTypeSelect = (orgType: OrgType) => {
    setSelectedOrgType(orgType)
    setRole("")
    setOrgName("")
    setOrgSize("")
  }

  const handleContinue = () => {
    if (step === 1 && selectedOrgType) {
      setStep(2)
    } else if (step === 2 && orgName && orgSize && role) {
      setStep(3)
    }
  }

  const handleFinish = async () => {
    if (!selectedOrgType || !orgName || !orgSize || !role) return
    
    setIsLoading(true)
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // Store onboarding data in localStorage
    const onboardingData: OnboardingData = {
      orgType: selectedOrgType,
      orgName,
      orgSize,
      role,
    }
    
    localStorage.setItem("presentSir_onboarding", JSON.stringify(onboardingData))
    
    setIsLoading(false)
    
    // Redirect to dashboard
    router.push("/dashboard")
  }

  const isStep2Valid = orgName.trim() !== "" && orgSize !== "" && role !== ""

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                s === step ? "w-8 bg-primary" : s < step ? "w-8 bg-primary/50" : "w-2 bg-muted-foreground/20"
              )}
            />
          ))}
        </div>

        {/* Step 1: Org Type Selection */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-3">What best describes you?</h1>
              <p className="text-muted-foreground text-lg">Choose your organization type to personalize your experience</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {orgTypes.map((org) => (
                <Card
                  key={org.id}
                  onClick={() => handleOrgTypeSelect(org.id)}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedOrgType === org.id
                      ? "border-2 border-primary bg-primary/5 shadow-lg"
                      : "border-2 border-border hover:border-muted-foreground/30"
                  )}
                >
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">{org.title}</h3>
                    <p className="text-sm text-muted-foreground">{org.subtitle}</p>
                    {selectedOrgType === org.id && (
                      <div className="flex items-center gap-1 text-primary text-sm font-medium pt-2">
                        <Check className="h-4 w-4" />
                        Selected
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!selectedOrgType}
                className="min-w-[200px] h-12 gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Organization Details */}
        {step === 2 && selectedOrgType && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-3">Organization Details</h1>
              <p className="text-muted-foreground text-lg">Tell us about your organization</p>
            </div>

            <Card className="max-w-lg mx-auto border-0 shadow-lg">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="org-name" className="font-medium">Organization Name</Label>
                  <Input
                    id="org-name"
                    placeholder={
                      selectedOrgType === "school"
                        ? "e.g., Lincoln High School"
                        : selectedOrgType === "university"
                        ? "e.g., Stanford University"
                        : "e.g., Acme Corporation"
                    }
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="h-11 bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-size" className="font-medium">Organization Size</Label>
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
                  <Label htmlFor="role" className="font-medium">Your Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role" className="h-11 bg-muted/50">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesByOrgType[selectedOrgType].map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-3">
              <Button variant="outline" size="lg" onClick={() => { setSelectedOrgType(null); setOrgName(""); setOrgSize(""); setRole(""); setStep(1); }} className="min-w-[120px] h-12">
                Back
              </Button>
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!isStep2Valid}
                className="min-w-[200px] h-12 gap-2"
              >
                Finish Setup
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Welcome Screen */}
        {step === 3 && selectedOrgType && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-lg mx-auto">
              <div className="text-7xl mb-6">
                {selectedOrgType === "school" && "🏫"}
                {selectedOrgType === "university" && "🎓"}
                {selectedOrgType === "company" && "🏢"}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{welcomeContent[selectedOrgType].title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{welcomeContent[selectedOrgType].message}</p>
              
              <Card className="border-0 shadow-lg bg-muted/50 mb-8">
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Organization:</span>
                    <span className="font-medium text-foreground">{orgName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Your Role:</span>
                    <span className="font-medium text-foreground">{role}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Organization Size:</span>
                    <span className="font-medium text-foreground">
                      {orgSizes.find(s => s.value === orgSize)?.label}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="outline" size="lg" onClick={() => setStep(1)} className="min-w-[120px] h-12">
                Back
              </Button>
              <Button
                size="lg"
                onClick={handleFinish}
                disabled={isLoading}
                className="min-w-[220px] h-12 gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Setting up...
                  </>
                ) : (
                  <>
                    {welcomeContent[selectedOrgType].cta}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
