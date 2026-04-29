"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AIInsightsPanel } from "@/components/ai-insights-panel"

export default function AttendanceCalculatorPage() {
  const [totalClasses, setTotalClasses] = useState(30)
  const [attendedClasses, setAttendedClasses] = useState(24)
  const [minimumRequired, setMinimumRequired] = useState(75)

  const results = useMemo(() => {
    const safeTotal = Math.max(totalClasses, 0)
    const safeAttended = Math.min(Math.max(attendedClasses, 0), safeTotal)
    const target = Math.min(Math.max(minimumRequired, 0), 100)

    const currentPercentage = safeTotal > 0 ? Math.round((safeAttended / safeTotal) * 100) : 0

    if (target >= 100) {
      return {
        currentPercentage,
        safeSkips: 0,
        mustAttend: Math.max(0, safeTotal - safeAttended),
      }
    }

    const denominator = 1 - target / 100
    const safeSkips = Math.max(0, Math.floor((safeAttended - (target / 100) * safeTotal) / denominator))
    const mustAttend = currentPercentage >= target ? 0 : Math.ceil(((target / 100) * safeTotal - safeAttended) / denominator)

    return { currentPercentage, safeSkips, mustAttend }
  }, [attendedClasses, minimumRequired, totalClasses])

  const buildPrompt = () => {
    return `You are an AI study advisor for a student.

The student entered:
- Total classes held: ${totalClasses}
- Classes attended: ${attendedClasses}
- Minimum attendance required: ${minimumRequired}%
- Current attendance percentage: ${results.currentPercentage}%
- Safe skips remaining: ${results.safeSkips}
- Classes still needed to reach target: ${results.mustAttend}

Write a short personalized message advising the student. If attendance is good, motivate them. If they are at risk, warn them clearly and explain how many classes they can safely skip or must attend.`
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/student">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Calculator</h1>
          <p className="text-muted-foreground">Plan how many classes you can skip safely</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Numbers</CardTitle>
            <CardDescription>Everything is calculated on the frontend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="total-classes">Total classes held</Label>
              <Input id="total-classes" type="number" min="0" value={totalClasses} onChange={(e) => setTotalClasses(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attended-classes">Classes attended</Label>
              <Input id="attended-classes" type="number" min="0" value={attendedClasses} onChange={(e) => setAttendedClasses(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimum-required">Minimum attendance required (%)</Label>
              <Input id="minimum-required" type="number" min="0" max="100" value={minimumRequired} onChange={(e) => setMinimumRequired(Number(e.target.value))} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Your Result</CardTitle>
                <CardDescription>Based on the numbers you entered</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-background p-4 text-center">
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="text-3xl font-bold text-primary">{results.currentPercentage}%</p>
              </div>
              <div className="rounded-lg border bg-background p-4 text-center">
                <p className="text-xs text-muted-foreground">Safe skips</p>
                <p className="text-3xl font-bold text-emerald-600">{results.safeSkips}</p>
              </div>
              <div className="rounded-lg border bg-background p-4 text-center">
                <p className="text-xs text-muted-foreground">Must attend</p>
                <p className="text-3xl font-bold text-rose-600">{results.mustAttend}</p>
              </div>
            </div>

            <div className="rounded-lg border bg-background p-4 space-y-2">
              {results.mustAttend > 0 ? (
                <p className="text-sm text-muted-foreground">
                  You need to attend <span className="font-semibold text-foreground">{results.mustAttend}</span> more consecutive classes to reach <span className="font-semibold text-foreground">{minimumRequired}%</span>.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You can skip <span className="font-semibold text-foreground">{results.safeSkips}</span> more classes and still stay above <span className="font-semibold text-foreground">{minimumRequired}%</span>.
                </p>
              )}

              <div className="flex items-center gap-2">
                <Badge variant="secondary">{totalClasses} held</Badge>
                <Badge variant="secondary">{attendedClasses} attended</Badge>
                <Badge variant="secondary">Target {minimumRequired}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AIInsightsPanel
        title="AI Study Advisor"
        description="Personalized guidance based on your attendance numbers"
        buttonLabel="Generate Study Advice"
        buildPrompt={buildPrompt}
      />
    </div>
  )
}