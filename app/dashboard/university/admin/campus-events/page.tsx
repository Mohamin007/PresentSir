"use client"

import { useMemo, useState } from "react"
import { CalendarDays, Edit2, Plus, Trash2, Badge as BadgeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type Category = "Hackathon" | "Sports" | "Fest" | "Meetup" | "Stall" | "Cultural" | "Other"

interface EventNotice {
  id: string
  title: string
  category: Category
  description: string
  contact: string
  date: string
}

const sampleEvents: EventNotice[] = [
  { id: "s1", title: "Campus Hackathon 2026", category: "Hackathon", description: "A 24-hour build sprint with mentors and prizes.", contact: "CS Dept, Room 204", date: "2026-05-06" },
  { id: "s2", title: "Inter-College Sports Day", category: "Sports", description: "Track, field and indoor events.", contact: "Sports Office, Main Ground", date: "2026-05-12" },
  { id: "s3", title: "Spring Cultural Fest", category: "Cultural", description: "Music, dance and food stalls across the quad.", contact: "Cultural Committee, Admin Block", date: "2026-05-18" },
]

export default function AdminCampusEventsPage() {
  const [events, setEvents] = useState<EventNotice[]>(sampleEvents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", category: "Hackathon" as Category, description: "", contact: "", date: "" })

  const openCreate = () => { setEditingId(null); setForm({ title: "", category: "Hackathon", description: "", contact: "", date: "" }); setDialogOpen(true) }
  const openEdit = (ev: EventNotice) => { setEditingId(ev.id); setForm({ title: ev.title, category: ev.category, description: ev.description, contact: ev.contact, date: ev.date }); setDialogOpen(true) }

  const save = () => {
    if (!form.title || !form.date) return
    if (editingId) {
      setEvents((cur) => cur.map(e => e.id === editingId ? { ...e, ...form } : e))
    } else {
      setEvents((cur) => [{ id: crypto.randomUUID(), ...form }, ...cur])
    }
    setDialogOpen(false)
  }

  const remove = (id: string) => setEvents((cur) => cur.filter(e => e.id !== id))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campus Events</h1>
          <p className="text-muted-foreground">Manage university-wide events and notices</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Post New Event</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {events.map((ev) => (
          <Card key={ev.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{ev.title}</CardTitle>
                  <CardDescription className="text-sm">{ev.date}</CardDescription>
                </div>
                <Badge variant="outline">{ev.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{ev.description}</p>
              <div className="mb-3 text-sm"><strong>Contact:</strong> {ev.contact}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(ev)}><Edit2 className="h-4 w-4" /> Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => remove(ev.id)}><Trash2 className="h-4 w-4" /> Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Event" : "Post New Event"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Event Title</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div>
              <Label>Category</Label>
              <Select onValueChange={(v) => setForm(f => ({ ...f, category: v as Category }))}>
                <SelectTrigger><SelectValue>{form.category}</SelectValue></SelectTrigger>
                <SelectContent>
                  {(["Hackathon","Sports","Fest","Meetup","Stall","Cultural","Other"] as Category[]).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Who to Contact/Approach</Label><Textarea rows={2} value={form.contact} onChange={(e) => setForm(f => ({ ...f, contact: e.target.value }))} /></div>
            <div><Label>Date of Event</Label><Input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save}>Post Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
