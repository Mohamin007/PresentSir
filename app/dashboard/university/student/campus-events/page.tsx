"use client"

import { useMemo, useState } from "react"
import { Search, CalendarDays, MapPin } from "lucide-react"
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
  howToJoin: string
  isNew: boolean
}

const sampleEvents: CampusEvent[] = [
  { id: "s1", title: "Campus Hackathon 2026", category: "Hackathon", date: "2026-05-06", description: "A 24-hour build sprint with mentors and prizes.", howToJoin: "CS Dept, Room 204", isNew: true },
  { id: "s2", title: "Inter-College Sports Day", category: "Sports", date: "2026-05-12", description: "Track, field and indoor events.", howToJoin: "Sports Office, Main Ground", isNew: true },
  { id: "s3", title: "Spring Cultural Fest", category: "Cultural", date: "2026-05-18", description: "Music, dance and food stalls across the quad.", howToJoin: "Cultural Committee, Admin Block", isNew: false },
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

export default function StudentCampusEventsPage() {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sampleEvents
    return sampleEvents.filter(e => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q))
  }, [query])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campus Events</h1>
          <p className="text-muted-foreground">University notice board</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-sm text-muted-foreground"><Search className="h-4 w-4" /> Read only</div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or category..." className="border-0 shadow-none px-0 focus-visible:ring-0" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filtered.map(ev => (
          <Card key={ev.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2"><CardTitle className="text-xl">{ev.title}</CardTitle>{ev.isNew && <Badge className="bg-primary text-primary-foreground">New</Badge>}</div>
                  <CardDescription className="mt-1 flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4" />{ev.date}</CardDescription>
                </div>
                <Badge variant="outline" className={categoryStyles[ev.category]}>{ev.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/90">{ev.description}</p>
              <div className="mt-4 rounded-xl border bg-muted/40 p-4 text-sm">
                <div className="font-medium text-foreground mb-1">How to Join</div>
                <div className="text-sm text-muted-foreground"><MapPin className="inline mr-2" />{ev.howToJoin || ev.howToJoin}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
