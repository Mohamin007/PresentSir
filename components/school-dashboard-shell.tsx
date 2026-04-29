"use client"

import { useState } from "react"
import { BookOpen, Users, ClipboardList, FileText, Settings, Plus, CalendarDays, Clock3, TrendingUp, AlertTriangle, CheckCircle2, Upload, PencilLine, School, Bell, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { NotificationsPopover } from "@/components/notifications-popover"
import { AIInsightsPanel } from "@/components/ai-insights-panel"

type Section = "dashboard" | "classes" | "students" | "marks" | "reports" | "settings"
type Performance = "Good" | "Average" | "At Risk"
type SubjectKey = "math" | "english" | "science" | "history"

interface SchoolClass {
  id: string
  name: string
  subject: string
  section: string
  students: number
  attendance: number
  trend: number[]
}

interface Student {
  id: string
  name: string
  rollNumber: string
  className: string
  attendance: number
  lastPresent: string
  performance: Performance
}

interface Exam {
  id: string
  name: string
  subject: string
  date: string
  time: string
  room: string
}

interface MarksRow {
  id: string
  studentName: string
  className: string
  marks: Record<SubjectKey, number>
}

const sectionItems: Array<{ id: Section; label: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "classes", label: "My Classes", icon: BookOpen },
  { id: "students", label: "Students", icon: Users },
  { id: "marks", label: "Marks & Exams", icon: ClipboardList },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
]

const subjectColumns: Array<{ key: SubjectKey; label: string }> = [
  { key: "math", label: "Math" },
  { key: "english", label: "English" },
  { key: "science", label: "Science" },
  { key: "history", label: "History" },
]

const initialClasses: SchoolClass[] = [
  { id: "c1", name: "Class 10A", subject: "Mathematics", section: "10A", students: 32, attendance: 92, trend: [88, 90, 91, 93, 92] },
  { id: "c2", name: "Class 9B", subject: "English", section: "9B", students: 28, attendance: 87, trend: [86, 87, 88, 86, 87] },
  { id: "c3", name: "Class 8C", subject: "Science", section: "8C", students: 30, attendance: 78, trend: [82, 81, 79, 77, 78] },
  { id: "c4", name: "Class 7A", subject: "Social Studies", section: "7A", students: 26, attendance: 95, trend: [94, 95, 96, 95, 95] },
]

const initialStudents: Student[] = [
  { id: "s1", name: "Aanya Sharma", rollNumber: "10A-01", className: "Class 10A", attendance: 96, lastPresent: "Today", performance: "Good" },
  { id: "s2", name: "Rahul Verma", rollNumber: "10A-02", className: "Class 10A", attendance: 89, lastPresent: "Today", performance: "Good" },
  { id: "s3", name: "Meera Iyer", rollNumber: "9B-06", className: "Class 9B", attendance: 81, lastPresent: "Yesterday", performance: "Average" },
  { id: "s4", name: "Kabir Khan", rollNumber: "8C-11", className: "Class 8C", attendance: 72, lastPresent: "3 days ago", performance: "At Risk" },
  { id: "s5", name: "Sara Joseph", rollNumber: "7A-09", className: "Class 7A", attendance: 94, lastPresent: "Today", performance: "Good" },
]

const initialMarks: MarksRow[] = [
  { id: "s1", studentName: "Aanya Sharma", className: "Class 10A", marks: { math: 92, english: 88, science: 90, history: 85 } },
  { id: "s2", studentName: "Rahul Verma", className: "Class 10A", marks: { math: 84, english: 79, science: 86, history: 81 } },
  { id: "s3", studentName: "Meera Iyer", className: "Class 9B", marks: { math: 76, english: 91, science: 80, history: 78 } },
  { id: "s4", studentName: "Kabir Khan", className: "Class 8C", marks: { math: 68, english: 70, science: 74, history: 66 } },
  { id: "s5", studentName: "Sara Joseph", className: "Class 7A", marks: { math: 95, english: 92, science: 94, history: 90 } },
]

const initialExams: Exam[] = [
  { id: "e1", name: "Midterm Mathematics", subject: "Math", date: "2026-05-04", time: "09:30 AM", room: "Hall A" },
  { id: "e2", name: "English Grammar Check", subject: "English", date: "2026-05-08", time: "11:00 AM", room: "Room 204" },
]

const initialActivity = [
  { id: "a1", title: "Attendance marked for Class 10A", detail: "32 students checked in", time: "5 minutes ago" },
  { id: "a2", title: "New student added to Class 9B", detail: "Meera Iyer imported successfully", time: "42 minutes ago" },
  { id: "a3", title: "Exam created for Class 8C", detail: "Science monthly test scheduled", time: "2 hours ago" },
]

function getPerformanceBadgeClass(performance: Performance) {
  if (performance === "Good") return "bg-emerald-500/10 text-emerald-700 border-emerald-200"
  if (performance === "Average") return "bg-amber-500/10 text-amber-700 border-amber-200"
  return "bg-red-500/10 text-red-700 border-red-200"
}

function getPercentClass(value: number) {
  if (value >= 90) return "text-emerald-600"
  if (value >= 80) return "text-amber-600"
  return "text-red-600"
}

function MiniBarChart({ values }: { values: number[] }) {
  const maxValue = Math.max(...values, 100)

  return (
    <div className="flex items-end gap-2 h-28">
      {values.map((value, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex items-end h-20 rounded-full bg-muted/50 overflow-hidden">
            <div
              className={cn(
                "w-full rounded-full transition-all",
                value >= 90 ? "bg-emerald-500" : value >= 80 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ height: `${Math.max((value / maxValue) * 100, 10)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">W{index + 1}</span>
        </div>
      ))}
    </div>
  )
}

export function SchoolDashboardShell() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard")
  const [classes, setClasses] = useState(initialClasses)
  const [students, setStudents] = useState(initialStudents)
  const [marksRows, setMarksRows] = useState(initialMarks)
  const [exams, setExams] = useState(initialExams)
  const [activities, setActivities] = useState(initialActivity)

  const [classDialogOpen, setClassDialogOpen] = useState(false)
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
  const [examDialogOpen, setExamDialogOpen] = useState(false)
  const [studentMode, setStudentMode] = useState<"manual" | "import">("manual")
  const [editingMark, setEditingMark] = useState<{ studentId: string; subject: SubjectKey } | null>(null)
  const [draftMark, setDraftMark] = useState("")
  const [fileError, setFileError] = useState<string | null>(null)

  const [classForm, setClassForm] = useState({ name: "", subject: "", section: "" })
  const [manualStudentForm, setManualStudentForm] = useState({ name: "", rollNumber: "", className: "" })
  const [examForm, setExamForm] = useState({ name: "", subject: "", date: "", time: "", room: "" })

  const totalClasses = classes.length
  const totalStudents = students.length
  const averageAttendance = Math.round(classes.reduce((sum, item) => sum + item.attendance, 0) / classes.length)
  const upcomingExams = exams.length

  const classOptions = classes.map((item) => item.name)

  const buildSchoolPrompt = () => {
    return `You are an AI school attendance assistant for a teacher dashboard.

Summarize the current attendance data in one short paragraph and then give 3 recommendations.
Mention patterns, classes needing attention, and any students or grades at risk.

Classes: ${JSON.stringify(classes)}
Students: ${JSON.stringify(students)}
Exams: ${JSON.stringify(exams)}
Activities: ${JSON.stringify(activities)}

Keep the response concise and practical.`
  }

  const addActivity = (title: string, detail: string) => {
    setActivities((current) => [
      { id: crypto.randomUUID(), title, detail, time: "Just now" },
      ...current.slice(0, 4),
    ])
  }

  const handleCreateClass = () => {
    if (!classForm.name || !classForm.subject || !classForm.section) return

    const newClass: SchoolClass = {
      id: crypto.randomUUID(),
      name: classForm.name,
      subject: classForm.subject,
      section: classForm.section,
      students: 24,
      attendance: 88,
      trend: [84, 85, 86, 87, 88],
    }

    setClasses((current) => [newClass, ...current])
    addActivity("New class created", `${classForm.name} was added to the timetable`)
    setClassForm({ name: "", subject: "", section: "" })
    setClassDialogOpen(false)
    setActiveSection("classes")
  }

  const handleAddStudent = () => {
    if (!manualStudentForm.name || !manualStudentForm.rollNumber || !manualStudentForm.className) return

    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: manualStudentForm.name,
      rollNumber: manualStudentForm.rollNumber,
      className: manualStudentForm.className,
      attendance: 100,
      lastPresent: "Today",
      performance: "Good",
    }

    const newMarks: MarksRow = {
      id: newStudent.id,
      studentName: newStudent.name,
      className: newStudent.className,
      marks: { math: 0, english: 0, science: 0, history: 0 },
    }

    setStudents((current) => [newStudent, ...current])
    setMarksRows((current) => [newMarks, ...current])
    addActivity("Student added", `${newStudent.name} joined ${newStudent.className}`)
    setManualStudentForm({ name: "", rollNumber: "", className: "" })
    setStudentDialogOpen(false)
    setActiveSection("students")
  }

  const handleImportStudents = async (file: File | null) => {
    if (!file) return
    setFileError(null)

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must contain an array of students.")
      }

      const importedStudents: Student[] = parsed.map((item: any) => ({
        id: crypto.randomUUID(),
        name: item.name ?? "Unnamed Student",
        rollNumber: item.rollNumber ?? item.roll ?? "N/A",
        className: item.className ?? item.class ?? classOptions[0] ?? "Class 10A",
        attendance: typeof item.attendance === "number" ? item.attendance : 100,
        lastPresent: item.lastPresent ?? "Today",
        performance: item.performance === "At Risk" || item.performance === "Average" ? item.performance : "Good",
      }))

      const importedMarks: MarksRow[] = importedStudents.map((student) => ({
        id: student.id,
        studentName: student.name,
        className: student.className,
        marks: { math: 0, english: 0, science: 0, history: 0 },
      }))

      setStudents((current) => [...importedStudents, ...current])
      setMarksRows((current) => [...importedMarks, ...current])
      addActivity("Students imported", `${importedStudents.length} students were added from JSON`)
      setStudentDialogOpen(false)
      setActiveSection("students")
    } catch (error) {
      setFileError("Please upload a valid JSON array of students.")
    }
  }

  const handleCreateExam = () => {
    if (!examForm.name || !examForm.subject || !examForm.date || !examForm.time || !examForm.room) return

    const newExam: Exam = {
      id: crypto.randomUUID(),
      name: examForm.name,
      subject: examForm.subject,
      date: examForm.date,
      time: examForm.time,
      room: examForm.room,
    }

    setExams((current) => [newExam, ...current])
    addActivity("Exam scheduled", `${examForm.name} is now visible to students as a notification`)
    setExamForm({ name: "", subject: "", date: "", time: "", room: "" })
    setExamDialogOpen(false)
    setActiveSection("marks")
  }

  const startEditMark = (studentId: string, subject: SubjectKey, value: number) => {
    setEditingMark({ studentId, subject })
    setDraftMark(String(value))
  }

  const saveMark = () => {
    if (!editingMark) return
    const nextValue = Math.max(0, Math.min(100, Number(draftMark) || 0))

    setMarksRows((current) =>
      current.map((row) =>
        row.id === editingMark.studentId
          ? { ...row, marks: { ...row.marks, [editingMark.subject]: nextValue } }
          : row,
      ),
    )

    addActivity("Mark updated", `${editingMark.subject.toUpperCase()} score adjusted in the gradebook`)
    setEditingMark(null)
    setDraftMark("")
  }

  const sectionLabel = sectionItems.find((item) => item.id === activeSection)?.label ?? "Dashboard"

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <div className="border-b border-sidebar-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
                <School className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold">PresentSir</p>
                <div className="mt-1 inline-flex rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-200">
                  School Mode
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4">
            <p className="px-3 pb-3 text-xs uppercase tracking-[0.2em] text-sidebar-muted">Navigation</p>
            <div className="space-y-1">
              {sectionItems.map((item) => {
                const Icon = item.icon
                const active = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          <div className="border-t border-sidebar-border p-4">
            <Card className="border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground shadow-none">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Bell className="h-4 w-4" />
                  Teacher Alerts
                </div>
                <p className="text-xs text-sidebar-foreground/70">
                  2 students need attention in Class 8C.
                </p>
              </CardContent>
            </Card>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-sm text-muted-foreground">School Teacher Dashboard</p>
                <h1 className="text-xl font-semibold text-foreground">{sectionLabel}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 hover:bg-orange-500/10">
                  School
                </Badge>
                <Badge variant="outline">Teacher</Badge>
                <Button variant="outline" size="sm" onClick={() => setClassDialogOpen(true)} className="hidden sm:inline-flex">
                  Create Class
                </Button>
                <NotificationsPopover role="school" />
              </div>
            </div>
            <div className="border-t px-4 py-3 sm:hidden">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sectionItems.map((item) => {
                  const active = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground",
                      )}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </header>

          <main className="flex-1 bg-muted/20 px-4 py-6 sm:px-6 lg:px-8">
            {activeSection === "dashboard" && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Total Classes", value: totalClasses, helper: "This term", icon: BookOpen },
                    { label: "Total Students", value: totalStudents, helper: "Across all classes", icon: Users },
                    { label: "Average Attendance %", value: `${averageAttendance}%`, helper: "Whole school average", icon: TrendingUp },
                    { label: "Upcoming Exams", value: upcomingExams, helper: "Scheduled this week", icon: CalendarDays },
                  ].map((stat) => {
                    const StatIcon = stat.icon
                    return (
                      <Card key={stat.label} className="shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">{stat.label}</p>
                              <p className="mt-2 text-3xl font-semibold tracking-tight">{stat.value}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{stat.helper}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <StatIcon className="h-5 w-5" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Live feed of the latest school actions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {activities.map((item) => (
                        <div key={item.id} className="flex gap-3 rounded-xl border border-border/60 bg-background p-4">
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Clock3 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium text-foreground">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.detail}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">{item.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-500/10 via-background to-background border-orange-200/60">
                    <CardHeader>
                      <CardTitle>School Snapshot</CardTitle>
                      <CardDescription>What needs attention right now</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border bg-background p-4">
                            <p className="text-xs text-muted-foreground">At Risk Students</p>
                            <p className="mt-1 text-2xl font-semibold text-red-600">3</p>
                          </div>
                          <div className="rounded-2xl border bg-background p-4">
                            <p className="text-xs text-muted-foreground">Perfect Attendance</p>
                            <p className="mt-1 text-2xl font-semibold text-emerald-600">11</p>
                          </div>
                        </div>

                        <AIInsightsPanel
                          compact
                          title="AI Insight"
                          description="Analyze current school attendance patterns"
                          buttonLabel="Generate AI Insight"
                          buildPrompt={buildSchoolPrompt}
                        />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === "classes" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">My Classes</h2>
                    <p className="text-muted-foreground">Manage class groups, subjects, and attendance performance.</p>
                  </div>
                  <Button onClick={() => setClassDialogOpen(true)} className="gap-2 self-start sm:self-auto">
                    <Plus className="h-4 w-4" />
                    Create Class
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {classes.map((schoolClass) => (
                    <Card key={schoolClass.id} className="shadow-sm transition-all hover:shadow-md">
                      <CardHeader className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-lg">{schoolClass.name}</CardTitle>
                            <CardDescription>{schoolClass.subject}</CardDescription>
                          </div>
                          <Badge variant="outline">{schoolClass.section}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {schoolClass.students} students
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Average attendance</span>
                          <span className={cn("font-semibold", getPercentClass(schoolClass.attendance))}>{schoolClass.attendance}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${schoolClass.attendance}%` }} />
                        </div>
                        <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          Attendance trend is stable this week
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "students" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Students</h2>
                    <p className="text-muted-foreground">Track attendance and performance across all classes.</p>
                  </div>
                  <Button onClick={() => setStudentDialogOpen(true)} className="gap-2 self-start sm:self-auto">
                    <Plus className="h-4 w-4" />
                    Add Student
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Attendance %</TableHead>
                          <TableHead>Last Present</TableHead>
                          <TableHead>Performance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.className}</TableCell>
                            <TableCell className={cn("font-semibold", getPercentClass(student.attendance))}>{student.attendance}%</TableCell>
                            <TableCell>{student.lastPresent}</TableCell>
                            <TableCell>
                              <Badge className={cn("border", getPerformanceBadgeClass(student.performance))} variant="outline">
                                {student.performance}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "marks" && (
              <div className="space-y-6">
                <Tabs defaultValue="marks" className="space-y-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <TabsList className="grid w-full max-w-sm grid-cols-2">
                      <TabsTrigger value="marks">Marks</TabsTrigger>
                      <TabsTrigger value="exams">Exams</TabsTrigger>
                    </TabsList>
                    <Button onClick={() => setExamDialogOpen(true)} className="gap-2 self-start lg:self-auto">
                      <Plus className="h-4 w-4" />
                      Add Exam
                    </Button>
                  </div>

                  <TabsContent value="marks" className="space-y-4">
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student</TableHead>
                              <TableHead>Class</TableHead>
                              {subjectColumns.map((subject) => (
                                <TableHead key={subject.key}>{subject.label}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {marksRows.map((row) => (
                              <TableRow key={row.id}>
                                <TableCell className="font-medium">{row.studentName}</TableCell>
                                <TableCell>{row.className}</TableCell>
                                {subjectColumns.map((subject) => {
                                  const isEditing = editingMark?.studentId === row.id && editingMark.subject === subject.key
                                  const value = row.marks[subject.key]

                                  return (
                                    <TableCell key={subject.key}>
                                      {isEditing ? (
                                        <Input
                                          autoFocus
                                          value={draftMark}
                                          onChange={(event) => setDraftMark(event.target.value)}
                                          onBlur={saveMark}
                                          onKeyDown={(event) => {
                                            if (event.key === "Enter") saveMark()
                                            if (event.key === "Escape") setEditingMark(null)
                                          }}
                                          className="h-9 w-20 text-center"
                                        />
                                      ) : (
                                        <button
                                          onClick={() => startEditMark(row.id, subject.key, value)}
                                          className="inline-flex w-20 items-center justify-between rounded-md border border-transparent px-2 py-1 text-sm font-medium hover:border-border hover:bg-muted"
                                        >
                                          <span>{value}</span>
                                          <PencilLine className="h-3.5 w-3.5 text-muted-foreground" />
                                        </button>
                                      )}
                                    </TableCell>
                                  )
                                })}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="exams" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {exams.map((exam) => (
                        <Card key={exam.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <CardTitle className="text-lg">{exam.name}</CardTitle>
                                <CardDescription>{exam.subject}</CardDescription>
                              </div>
                              <Badge variant="secondary">Upcoming</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              {exam.date}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock3 className="h-4 w-4" />
                              {exam.time}
                            </div>
                            <div className="flex items-center gap-2">
                              <School className="h-4 w-4" />
                              {exam.room}
                            </div>
                            <div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
                              Students will receive this as an in-app notification.
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeSection === "reports" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
                  <p className="text-muted-foreground">Per-class attendance summaries with trend snapshots.</p>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {classes.map((schoolClass) => (
                    <Card key={schoolClass.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-lg">{schoolClass.name}</CardTitle>
                            <CardDescription>{schoolClass.subject}</CardDescription>
                          </div>
                          <Badge variant="outline">{schoolClass.attendance}% avg</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <MiniBarChart values={schoolClass.trend} />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Weekly attendance trend</span>
                          <span className={cn("font-semibold", getPercentClass(schoolClass.attendance))}>{schoolClass.attendance}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-orange-200/70 bg-gradient-to-br from-orange-500/10 via-background to-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-orange-600" />
                      AI Insight
                    </CardTitle>
                    <CardDescription>Plain-English summary generated from recent attendance data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Class 10A has shown declining attendance on Mondays. 3 students are at risk of falling below 75%.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
                  <p className="text-muted-foreground">School-level configuration and notification preferences.</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Attendance Policy</CardTitle>
                      <CardDescription>Thresholds and escalation rules</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <span>Alert at</span>
                        <Badge>80%</Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <span>At risk below</span>
                        <Badge variant="destructive">75%</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>How updates reach teachers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <span>Exam reminders</span>
                        <Badge variant="secondary">On</Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <span>Low attendance alerts</span>
                        <Badge variant="secondary">On</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Class Defaults</CardTitle>
                      <CardDescription>What new classes inherit</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <div className="rounded-lg border p-3">Default duration: 45 minutes</div>
                      <div className="rounded-lg border p-3">Auto-roll call: Enabled</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end">
                  <Button className="gap-2">
                    <Settings className="h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Class</DialogTitle>
            <DialogDescription>Add a new class, subject, and section/grade.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-name">Class name</Label>
              <Input id="class-name" value={classForm.name} onChange={(event) => setClassForm((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Class 11B" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={classForm.subject} onChange={(event) => setClassForm((current) => ({ ...current, subject: event.target.value }))} placeholder="e.g. Mathematics" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section / Grade</Label>
              <Input id="section" value={classForm.section} onChange={(event) => setClassForm((current) => ({ ...current, section: event.target.value }))} placeholder="e.g. 11B" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClassDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateClass}>Create Class</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
            <DialogDescription>Add manually or import a JSON array of students.</DialogDescription>
          </DialogHeader>

          <Tabs value={studentMode} onValueChange={(value) => setStudentMode(value as "manual" | "import")}> 
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Add Manually</TabsTrigger>
              <TabsTrigger value="import">Import JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={manualStudentForm.name} onChange={(event) => setManualStudentForm((current) => ({ ...current, name: event.target.value }))} placeholder="Student name" />
                </div>
                <div className="space-y-2">
                  <Label>Roll number</Label>
                  <Input value={manualStudentForm.rollNumber} onChange={(event) => setManualStudentForm((current) => ({ ...current, rollNumber: event.target.value }))} placeholder="Roll number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={manualStudentForm.className} onValueChange={(value) => setManualStudentForm((current) => ({ ...current, className: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((className) => (
                      <SelectItem key={className} value={className}>{className}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStudentDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddStudent}>Add Student</Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="import" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="student-json">Upload JSON file</Label>
                <Input id="student-json" type="file" accept="application/json,.json" onChange={(event) => handleImportStudents(event.target.files?.[0] ?? null)} />
              </div>
              <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Expected format</p>
                <pre className="overflow-auto text-xs leading-6">
{`[
  {
    "name": "Aarav Mehta",
    "rollNumber": "10A-12",
    "className": "Class 10A"
  }
]`}
                </pre>
              </div>
              {fileError && <p className="text-sm text-red-600">{fileError}</p>}
              <DialogFooter>
                <Button variant="outline" onClick={() => setStudentDialogOpen(false)}>Cancel</Button>
                <Button variant="secondary" onClick={() => setStudentDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Exam</DialogTitle>
            <DialogDescription>Schedule an exam and notify students automatically.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Exam name</Label><Input value={examForm.name} onChange={(event) => setExamForm((current) => ({ ...current, name: event.target.value }))} placeholder="Midterm Science" /></div>
            <div className="space-y-2"><Label>Subject</Label><Input value={examForm.subject} onChange={(event) => setExamForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Science" /></div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={examForm.date} onChange={(event) => setExamForm((current) => ({ ...current, date: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Time</Label><Input type="time" value={examForm.time} onChange={(event) => setExamForm((current) => ({ ...current, time: event.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Room</Label><Input value={examForm.room} onChange={(event) => setExamForm((current) => ({ ...current, room: event.target.value }))} placeholder="Hall A" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExamDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateExam}>Create Exam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
