"use client"

import { CalendarDays, MapPin, Megaphone, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

type Category = "Hackathon" | "Sports" | "Fest" | "Meetup" | "Stall" | "Cultural" | "Other"

interface CampusEvent {
  id: string
  title: string
  category: Category
  date: string
  description: string
  contact: string
}

const events: CampusEvent[] = [
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

export default function CampusEventsStudentPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campus Events</h1>
          <p className="text-muted-foreground">Notice board for university events and notices</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-sm text-muted-foreground">
          <Megaphone className="h-4 w-4 text-primary" />
          Read only
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search by title or category..." className="border-0 shadow-none px-0 focus-visible:ring-0" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
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
              <p className="text-sm leading-relaxed text-foreground/90">{event.description}</p>
              <div className="rounded-xl border bg-muted/40 p-4">
                <div className="mb-2 text-sm font-medium text-foreground">How to Join</div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{event.contact}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}