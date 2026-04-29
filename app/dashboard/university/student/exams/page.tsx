"use client"

import { useMemo, useState } from "react"
import { Bell, FileText, Clock3 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ExamItem = {
  id: string
  title: string
  subject: string
  date: string
  time: string
  venue: string
  instructions: string
}

const sampleExams: ExamItem[] = [
  {
    id: "ex1",
    title: "Midterm Examination",
    subject: "Computer Science",
    date: "2026-05-10",
    time: "09:30",
    venue: "Hall A",
    instructions: "Bring your student ID and arrive 15 minutes early.",
  },
  {
    id: "ex2",
    title: "Practical Test",
    subject: "Database Systems",
    date: "2026-05-14",
    time: "13:00",
    venue: "Lab 3",
    instructions: "No internet access. Use the assigned workstation only.",
  },
  {
    id: "ex3",
    title: "Final Quiz",
    subject: "Mathematics",
    date: "2026-05-18",
    time: "11:00",
    venue: "Room 205",
    instructions: "Calculator allowed. Submit all answer sheets before leaving.",
  },
]

function daysAway(dateString: string) {
  const target = new Date(`${dateString}T00:00:00`)
  const today = new Date()
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff <= 0 ? "Today" : `${diff} days away`
}

export default function UniversityStudentExamsPage() {
  const [exams] = useState(sampleExams)

  const examList = useMemo(() => exams, [exams])

  const setReminder = (exam: ExamItem) => {
    toast.success("Reminder set", {
      description: `${exam.title} reminder saved`,
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upcoming Exams</h1>
        <p className="text-muted-foreground">Read-only exam schedule for university students</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {examList.map((exam) => (
          <Card key={exam.id}>
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">{exam.title}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {exam.subject}
                  </CardDescription>
                </div>
                <button
                  type="button"
                  onClick={() => setReminder(exam)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={`Set reminder for ${exam.title}`}
                >
                  <Bell className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{daysAway(exam.date)}</Badge>
                <span>{exam.date}</span>
                <span>•</span>
                <span>{exam.time}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div><span className="font-medium text-foreground">Venue:</span> {exam.venue}</div>
              <div className="rounded-xl border bg-muted/40 p-4 text-muted-foreground">
                <div className="font-medium text-foreground mb-1">Instructions</div>
                {exam.instructions}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                Reminder notifications are available from this card.
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}