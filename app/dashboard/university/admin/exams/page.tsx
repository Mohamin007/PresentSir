"use client"

import { useState } from "react"
import { FileText, Plus, PencilLine, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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

export default function UniversityAdminExamsPage() {
  const [exams, setExams] = useState(sampleExams)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", subject: "", date: "", time: "", venue: "", instructions: "" })

  const openCreate = () => {
    setEditingId(null)
    setForm({ title: "", subject: "", date: "", time: "", venue: "", instructions: "" })
    setDialogOpen(true)
  }

  const openEdit = (exam: ExamItem) => {
    setEditingId(exam.id)
    setForm(exam)
    setDialogOpen(true)
  }

  const saveExam = () => {
    if (!form.title.trim() || !form.subject.trim() || !form.date || !form.time || !form.venue.trim()) return

    if (editingId) {
      setExams((current) => current.map((exam) => (exam.id === editingId ? { ...exam, ...form } : exam)))
    } else {
      setExams((current) => [{ id: crypto.randomUUID(), ...form }, ...current])
    }

    setDialogOpen(false)
  }

  const deleteExam = (id: string) => setExams((current) => current.filter((exam) => exam.id !== id))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exams & Assessments</h1>
          <p className="text-muted-foreground">Manage exam notices for university students</p>
        </div>
        <Button className="gap-2" onClick={openCreate} type="button">
          <Plus className="h-4 w-4" />
          Post Exam Notice
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {exams.map((exam) => (
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
                <Badge variant="secondary">Exam</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-2 text-muted-foreground">
                <div><span className="font-medium text-foreground">Date:</span> {exam.date}</div>
                <div><span className="font-medium text-foreground">Time:</span> {exam.time}</div>
                <div><span className="font-medium text-foreground">Venue:</span> {exam.venue}</div>
              </div>
              <div className="rounded-xl border bg-muted/40 p-4 text-muted-foreground">
                <div className="font-medium text-foreground mb-1">Instructions</div>
                {exam.instructions}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(exam)} className="gap-2">
                  <PencilLine className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteExam(exam.id)} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Exam Notice" : "Post Exam Notice"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="exam-title">Exam Title</Label>
              <Input id="exam-title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-subject">Subject</Label>
              <Input id="exam-subject" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="exam-date">Date</Label>
                <Input id="exam-date" type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-time">Time</Label>
                <Input id="exam-time" type="time" value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-venue">Venue</Label>
              <Input id="exam-venue" value={form.venue} onChange={(event) => setForm((current) => ({ ...current, venue: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-instructions">Instructions</Label>
              <Textarea id="exam-instructions" rows={4} value={form.instructions} onChange={(event) => setForm((current) => ({ ...current, instructions: event.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveExam}>
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}