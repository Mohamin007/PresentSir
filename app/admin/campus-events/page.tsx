"use client"

import { useState } from "react"
import { CalendarDays, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type Category = "Hackathon" | "Sports" | "Fest" | "Meetup" | "Stall" | "Cultural" | "Other"

interface CampusEvent {
  id: string
  title: string
  category: Category
  date: string
  description: string
  contact: string
}

const initialEvents: CampusEvent[] = [
  {
    id: "e1",
    title: "Campus Hackathon 2026",
    category: "Hackathon",
    date: "2026-05-06",
    description: "A 24-hour build sprint with mentors, prizes, and demo presentations.",
    contact: "Contact the CS Department, Room 204",
  },
  {
    id: "e2",
    title: "Inter-College Sports Day",
    category: "Sports",
    date: "2026-05-12",
    description: "Track, field, and indoor events with heats in the morning and finals in the afternoon.",
    contact: "Meet the Sports Department office at the main ground",
  },
  {
    id: "e3",
    title: "Spring Cultural Fest",
    category: "Cultural",
    date: "2026-05-18",
    description: "Music, dance, drama, and food stalls across the central quad.",
    contact: "Approach the Cultural Committee in the Admin Block",
  },
]

const categoryStyles: Record<Category, string> = {
  Hackathon: "bg-violet-500/10 text-violet-700 border-violet-200",
  Sports: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  Fest: "bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-200",
  Meetup: "bg-blue-500/10 text-blue-700 border-blue-200",
  Stall: "bg-amber-500/10 text-amber-700 border-amber-200",
  Cultural: "bg-rose-500/10 text-rose-700 border-rose-200",
  Other: "bg-slate-500/10 text-slate-700 border-slate-200",
}

export default function CampusEventsAdminPage() {
  const [events, setEvents] = useState(initialEvents)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    category: "Hackathon" as Category,
    description: "",
    contact: "",
    date: "",
  })

  const openDialog = () => {
    setForm({
      title: "",
      category: "Hackathon",
      description: "",
      contact: "",
      date: "",
    })
    setIsDialogOpen(true)
  }

  const postEvent = () => {
    if (!form.title.trim() || !form.date) return

    setEvents((current) => [
      {
        id: crypto.randomUUID(),
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        contact: form.contact.trim(),
        date: form.date,
      },
      ...current,
    ])
    setIsDialogOpen(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campus Events</h1>
          <p className="text-muted-foreground">Post university events and notices for students</p>
        </div>
        <Button className="gap-2" onClick={openDialog} type="button">
          <Plus className="h-4 w-4" />
          Post New Event
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {event.date}
                  </CardDescription>
                </div>
                <Badge variant="outline" className={categoryStyles[event.category]}>
                  {event.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{event.description}</p>
              <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                <div className="font-medium text-foreground mb-1">Contact Info</div>
                {event.contact}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post New Event</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm((current) => ({ ...current, category: value as Category }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(["Hackathon", "Sports", "Fest", "Meetup", "Stall", "Cultural", "Other"] as Category[]).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                rows={4}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-contact">Who to Contact</Label>
              <Textarea
                id="event-contact"
                rows={3}
                value={form.contact}
                onChange={(event) => setForm((current) => ({ ...current, contact: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={postEvent}>
              Post Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}