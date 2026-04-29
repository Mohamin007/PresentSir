"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Check, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { students, flaggedCheckins, excuseRequests } from "@/lib/data"
import { cn } from "@/lib/utils"
import { AIInsightsPanel } from "@/components/ai-insights-panel"

const sessionStudents = students.map(s => ({
  ...s,
  rollNumber: (s as { rollNumber?: string }).rollNumber || s.id,
  status: Math.random() > 0.15 ? (Math.random() > 0.2 ? "Verified" : "Flagged") : "Absent" as "Verified" | "Flagged" | "Manual" | "Absent",
  checkinTime: Math.random() > 0.15 ? "9:" + String(Math.floor(Math.random() * 20) + 1).padStart(2, "0") + " AM" : null,
  sentiment: Math.random() > 0.66 ? "Focused" : Math.random() > 0.5 ? "Neutral" : "Lost",
}))

export default function SessionReviewPage() {
  const [flaggedItems, setFlaggedItems] = useState(flaggedCheckins)

  const attendanceSummary = {
    totalStudents: sessionStudents.length,
    presentCount: sessionStudents.filter((student) => student.status !== "Absent").length,
    absentCount: sessionStudents.filter((student) => student.status === "Absent").length,
    flaggedCount: sessionStudents.filter((student) => student.status === "Flagged").length,
    lateArrivals: sessionStudents.filter((student) => student.checkinTime && student.checkinTime.startsWith("9:1")).length,
    sentimentBreakdown: sessionStudents.reduce<Record<string, number>>((acc, student) => {
      acc[student.sentiment] = (acc[student.sentiment] || 0) + 1
      return acc
    }, {}),
  }

  const buildPrompt = () => `You are helping a university teacher review a class attendance session.

Summarize the session in one short paragraph and then give practical recommendations.
Mention attendance patterns, students who may need attention, and any noteworthy sentiment trends.

Attendance summary: ${JSON.stringify(attendanceSummary)}
Attendance rows: ${JSON.stringify(sessionStudents.map((student) => ({
    name: student.name,
    id: student.id,
    status: student.status,
    checkinTime: student.checkinTime,
    sentiment: student.sentiment,
  })))}
Flagged check-ins: ${JSON.stringify(flaggedItems)}

Keep it concise and actionable.`

  const handleApprove = (id: string) => {
    setFlaggedItems(items => items.filter(item => item.id !== id))
  }

  const handleReject = (id: string) => {
    setFlaggedItems(items => items.filter(item => item.id !== id))
  }

  const handleExportCsv = () => {
    const rows = [
      ["Student", "Roll Number", "Check-in Time", "Status", "Sentiment"],
      ...sessionStudents.map((student) => [
        student.name,
        student.rollNumber,
        student.checkinTime || "-",
        student.status,
        student.sentiment,
      ]),
    ]

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "session-attendance.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Verified</Badge>
      case "Flagged":
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Flagged</Badge>
      case "Manual":
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Manual</Badge>
      case "Absent":
        return <Badge variant="secondary">Absent</Badge>
      default:
        return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/teacher">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Session Review</h1>
            <p className="text-muted-foreground">Introduction to Programming - March 15, 9:00 AM</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExportCsv}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold">45</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Present</p>
            <p className="text-2xl font-bold text-green-600">42</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Flagged</p>
            <p className="text-2xl font-bold text-amber-600">{flaggedItems.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Absent</p>
            <p className="text-2xl font-bold text-muted-foreground">3</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Attendance List</TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged ({flaggedItems.length})
          </TabsTrigger>
          <TabsTrigger value="excuses">
            Excuses ({excuseRequests.filter(e => e.status === "pending").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-4">
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Check-in Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatar} alt={student.name} />
                            <AvatarFallback className="text-xs">{student.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.checkinTime || "-"}</TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell>{student.sentiment}</TableCell>
                      <TableCell className="text-right">
                        {student.status === "Absent" && (
                          <Button variant="ghost" size="sm">Mark Present</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </Card>

            <AIInsightsPanel
              title="AI Insights"
              description="Analyze this session’s attendance and engagement patterns"
              buttonLabel="Generate AI Insights"
              buildPrompt={buildPrompt}
            />
          </div>
        </TabsContent>

        <TabsContent value="flagged" className="mt-4">
          {flaggedItems.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {flaggedItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{item.studentName}</CardTitle>
                      <Badge variant="outline" className="text-amber-600">
                        {item.similarity}% match
                      </Badge>
                    </div>
                    <CardDescription>{item.time}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground text-center">Profile</p>
                        <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                          <img src={item.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground text-center">Check-in</p>
                        <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                          <img src={item.checkinPhoto} alt="Check-in" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-green-600" onClick={() => handleApprove(item.id)}>
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-red-600" onClick={() => handleReject(item.id)}>
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Check className="h-12 w-12 mx-auto text-green-500 mb-3" />
                <p className="text-muted-foreground">All flagged check-ins have been reviewed</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="excuses" className="mt-4">
          <div className="space-y-4">
            {excuseRequests.filter(e => e.status === "pending").map((excuse) => (
              <Card key={excuse.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{excuse.studentName}</p>
                        <p className="text-sm text-muted-foreground">{excuse.reason}: {excuse.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{excuse.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-green-600">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
